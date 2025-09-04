# Protocol: EXECUTE_TASK

## Description
The main workflow for implementing a new feature, fix, or refactor based on a user-provided goal.

## Steps
1.  **Task Acquisition & Validation**
    - Ask: "What is the goal? Please provide the task description or GitHub Issue number."
    - Await user input.
    - Validate the goal against the project's logic and technical specifications. Announce any inconsistencies or questions.

2.  **Branching**
    - Determine task type (`feature`, `fix`, `refactor`) from the goal.
    - Ask for a short, descriptive name (in English, kebab-case, max 32 chars).
    - Create branch: `git switch -c <type>/<issue#>-<short-name>` from `develop`.
    - Announce the new branch name.

3.  **Planning & Scaffolding**
    - Propose a high-level implementation algorithm. Await "GO" command.
    - Generate a technical checklist of steps.
    - Analyze checklist for scaffolding opportunities (e.g., new components, schemas) and ask for permission before running `hygen`.

4.  **Implementation Cycle**
    - Follow the checklist, implementing logic.
    - Commit frequently with conventional commit messages (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`).
    - Announce progress after each major step on the checklist is completed.

5.  **Handoff to Finalization**
    - Once all checklist items are complete, announce: "Implementation complete. Proceeding to **FINALIZE_PR** protocol."
    - Execute **FINALIZE_PR**.