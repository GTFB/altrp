# **Technical Specification: Cloudflare AI Gateway**

## 1. Overview

This document outlines the technical specification for building a robust, scalable, and cost-effective AI Gateway on the Cloudflare serverless platform. The system will act as a unified entry point for various AI models (LLM, image generation, etc.), providing routing, logging, cost tracking, security, and observability for all internal projects.

The architecture is inspired by solutions like LiteLLM but is built to be cloud-native on Cloudflare, leveraging Workers, Queues, D1, and KV for maximum performance and scalability.

## 2. Core Architecture

The system is composed of three primary services running as Cloudflare Workers, connected by Cloudflare's serverless infrastructure.

*   **API Worker (Gateway/Producer):** A public-facing HTTP worker that serves as the single entry point. Its primary role is to authenticate, validate, and authorize incoming requests before securely placing them into a message queue.
*   **Consumer Worker (Orchestrator):** An asynchronous worker triggered by messages from the queue. It contains the core logic for routing requests to the appropriate AI provider, handling transformations, and logging the results.
*   **Scheduled Worker (Analyst):** A cron-triggered worker responsible for aggregating data from the logs to generate and send daily reports.

 <!-- Placeholder for a future diagram -->

---

## 3. Detailed Feature Specifications

### 3.1. Core Request Lifecycle

1.  **Request Ingestion:** A client sends a `POST` request to the API Worker (`/v1/request`).
2.  **Authentication & Authorization:** The API Worker validates the project's API key and checks permissions against the `projects` and `project_permissions` tables in the D1 database.
3.  **Security & Rate Limiting:** The request is checked against project budgets and rate limits (both per-project and per-model).
4.  **Queuing:** If all checks pass, the request payload is enriched with metadata (`requestId`, `projectId`) and pushed into a Cloudflare Queue. An `HTTP 202 Accepted` response is immediately returned to the client.
5.  **Asynchronous Processing:** The Consumer Worker is triggered by the new message in the queue.
6.  **Dynamic Routing:** The worker fetches the appropriate provider configuration from a KV store based on the requested `model`.
7.  **API Call:** The request is transformed into the provider-specific format and sent via `fetch` to the external AI provider's API.
8.  **Logging & Cost Calculation:** The provider's response is normalized, token counts are extracted, the cost is calculated, and a comprehensive log entry is written to the D1 database.
9.  **Budget Update:** The project's `currentUsage` is atomically updated in the D1 database.

### 3.2. Data Models & Storage

#### 3.2.1. Cloudflare D1 (SQL Database)

*   **Database Name:** `ai-gateway-logs`
*   **Table: `logs`**
    *   `id` (TEXT, PK): Unique request UUID.
    *   `projectId` (TEXT, FK): Identifier of the client project.
    *   `status` (TEXT): `SUCCESS` or `ERROR`.
    *   `provider` (TEXT): The AI provider used (e.g., 'anthropic', 'google').
    *   `model` (TEXT): The specific model requested.
    *   `cost` (REAL): Calculated cost of the request in USD.
    *   `promptTokens` (INTEGER): Number of input tokens.
    *   `completionTokens` (INTEGER): Number of output tokens.
    *   `latencyMs` (INTEGER): Total processing time.
    *   `requestBody` (TEXT): JSON of the original client request.
    *   `responseBody` (TEXT): JSON of the normalized response from the AI provider.
    *   `createdAt` (INTEGER): UNIX timestamp of creation.
*   **Table: `projects`**
    *   `id` (TEXT, PK): Unique project ID.
    *   `name` (TEXT): Human-readable name of the project.
    *   `apiKeyHash` (TEXT): Hashed API key for authentication.
    *   `monthlyBudget` (REAL): The spending limit in USD for the current billing cycle.
    *   `currentUsage` (REAL): The current accumulated cost for the cycle.
*   **Table: `project_permissions`**
    *   `projectId` (TEXT, FK): The project ID.
    *   `modelPattern` (TEXT): A pattern for allowed models (e.g., `claude-3-*`, `gemini-pro`).

#### 3.2.2. Cloudflare KV (Key-Value Store)

*   **Namespace:** `PROVIDERS_CONFIG`
*   **Purpose:** To store dynamic configurations for AI providers, avoiding redeployments for updates.
*   **Key Format:** `provider:<provider_name>` (e.g., `provider:anthropic`)
*   **Value Format (JSON):**
    ```json
    {
      "apiKeySecretName": "ANTHROPIC_API_KEY",
      "baseURL": "https://api.anthropic.com/v1/messages",
      "models": ["claude-3-opus-20240229", "claude-3-haiku-20240307"],
      "pricing": {
        "claude-3-haiku-20240307": { "input": 0.25, "output": 1.25 }
      }
    }
    ```
*   **Namespace:** `REQUEST_CACHE`
    *   **Purpose:** To cache identical requests to reduce latency and cost.
    *   **Key:** A hash of the request prompt/payload.
    *   **Value:** The normalized JSON response.
    *   **TTL:** 1-24 hours.

### 3.3. Security & Control Features

#### 3.3.1. Authentication
*   All requests to the API Worker must include an `Authorization: Bearer <API_KEY>` header.
*   The API key will be hashed and compared against the `apiKeyHash` in the `projects` table.

#### 3.3.2. Model Access Control
*   The API Worker will verify that the requested `model` matches one of the `modelPattern` entries for the authenticated `projectId` in the `project_permissions` table.

#### 3.3.3. Budgets
*   The API Worker will reject requests if `currentUsage >= monthlyBudget` for the authenticated project.
*   A Scheduled Worker will reset `currentUsage` to `0` at the beginning of each month.

#### 3.3.4. Rate Limiting
*   **Per-Project:** Implemented via Cloudflare's native Rate Limiting Rules (Business Plan) based on the `Authorization` header, or via a KV-based counter in the API Worker (Free/Pro Plan).
*   **Per-Model (Global):** Implemented in the API Worker using Durable Objects to maintain accurate, globally-coordinated counters for high-cost models.

#### 3.3.5. Guardrails
*   Basic content filtering will be implemented in the Consumer Worker.
*   **Phase 1:** Regex and keyword-based checks on prompts and responses for PII or prohibited content.
*   **Phase 2 (Future):** Moderation using a fast, low-cost LLM to classify content before processing or returning it.

### 3.4. API Endpoints

*   **`POST /v1/request` (Standard Request)**
    *   **Description:** The primary endpoint for submitting AI tasks in a unified format.
    *   **Request Body:**
        ```json
        {
          "model": "claude-3-haiku-20240307",
          "payload": {
            "messages": [{"role": "user", "content": "Tell me a joke."}]
          }
        }
        ```
    *   **Success Response:** `202 Accepted` with `{ "requestId": "..." }`.
*   **`POST /openai/v1/chat/completions` (Pass-Through Endpoint)**
    *   **Description:** An OpenAI-compatible endpoint for clients that expect this standard format. The gateway will apply all its logic (auth, logging, etc.) before proxying the request.

### 3.5. Observability & Reporting

*   **LLM Observability:** The `logs` table in D1 serves as the single source of truth for all requests, providing detailed data for debugging and analytics.
*   **Daily Reports:** A Scheduled Worker will run daily at 08:00 UTC.
    *   It will query the `logs` table to aggregate key metrics for the last 24 hours (total requests, total cost, requests by project, errors, etc.).
    *   It will format this data into a Markdown message and send it to a designated Telegram channel via the Telegram Bot API.

## 4. Technology Stack

*   **Runtime:** Cloudflare Workers (TypeScript)
*   **API Framework:** Hono
*   **Primary Database:** Cloudflare D1
*   **Key-Value / Cache:** Cloudflare KV
*   **Message Queue:** Cloudflare Queues
*   **Global Coordination:** Cloudflare Durable Objects (for rate limiting)
*   **CLI & Deployments:** Wrangler CLI
*   **Schema Validation:** Zod

## 5. Phased Implementation Plan

1.  **Phase 1: Foundation (MVP)**
    *   Setup repository, Wrangler, and basic Hono app.
    *   Implement the async flow: API Worker -> Queues -> Consumer Worker.
    *   Hardcode a single provider (e.g., Anthropic).
    *   Implement basic logging to D1.
2.  **Phase 2: Configuration & Control**
    *   Move provider configurations to KV.
    *   Implement project authentication and cost tracking in D1.
    *   Add budget checks and basic rate limiting.
3.  **Phase 3: Analytics & Advanced Features**
    *   Create the Scheduled Worker for daily Telegram reports.
    *   Implement response caching with KV.
    *   Add advanced features like Durable Object-based rate limiting and pass-through endpoints.
4.  **Phase 4: Hardening & Polish**
    *   Implement Guardrails.
    *   Set up advanced monitoring/dashboards.
    *   Refine error handling and retry logic.