/// <reference types="@cloudflare/workers-types" />

export interface Env {
  TELEGRAM_BOT_TOKEN: string
  TELEGRAM_CHAT_ID: string
  DB: D1Database // D1 Database binding
}

type RequestBody = {
  name?: string
  email?: string
  projectType?: string
  description?: string
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const { request, env } = context

  try {
    const contentType = request.headers.get("content-type") || ""
    let data: RequestBody = {}

    if (contentType.includes("application/json")) {
      data = (await request.json()) as RequestBody
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const form = await request.formData()
      data = {
        name: String(form.get("name") || ""),
        email: String(form.get("email") || ""),
        projectType: String(form.get("projectType") || ""),
        description: String(form.get("description") || ""),
      }
    } else if (contentType.includes("multipart/form-data")) {
      const form = await request.formData()
      data = {
        name: String(form.get("name") || ""),
        email: String(form.get("email") || ""),
        projectType: String(form.get("projectType") || ""),
        description: String(form.get("description") || ""),
      }
    } else {
      return new Response(JSON.stringify({ error: "Unsupported Content-Type" }), {
        status: 415,
        headers: { "content-type": "application/json" },
      })
    }

    const name = (data.name || "").trim()
    const email = (data.email || "").trim()
    const projectType = (data.projectType || "").trim()
    const description = (data.description || "").trim()

    if (!name || !email) {
      return new Response(JSON.stringify({ error: "Name and email are required" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      })
    }

    // Save to D1 Database
    try {
      await env.DB.prepare(
        `INSERT INTO requests (name, email, project_type, description) VALUES (?, ?, ?, ?)`
      )
        .bind(name, email, projectType || null, description || null)
        .run()
    } catch (dbError) {
      console.error("Database error:", dbError)
      // Continue even if DB save fails
    }

    const message = [
      `New request from site`,
      `Name: ${name}`,
      `Email: ${email}`,
      projectType ? `Type: ${projectType}` : undefined,
      description ? `Description: ${description}` : undefined,
    ]
      .filter(Boolean)
      .join("\n")

    const token = env.TELEGRAM_BOT_TOKEN
    const chatId = env.TELEGRAM_CHAT_ID
    if (!token || !chatId) {
      return new Response(JSON.stringify({ error: "Missing Telegram env vars" }), {
        status: 500,
        headers: { "content-type": "application/json" },
      })
    }

    const tgUrl = `https://api.telegram.org/bot${token}/sendMessage`
    const tgResp = await fetch(tgUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "HTML" }),
    })

    if (!tgResp.ok) {
      const errText = await tgResp.text()
      return new Response(JSON.stringify({ error: "Telegram API error", details: errText }), {
        status: 502,
        headers: { "content-type": "application/json" },
      })
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: "Unexpected error", details: String(error) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    })
  }
}

export const onRequestOptions = async () =>
  new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type",
    },
  })

