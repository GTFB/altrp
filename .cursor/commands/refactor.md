# Protocol: REFACTOR

## Description
A deep, project-wide maintenance and optimization task. This is a destructive operation and requires a clean state.

## Steps
1.  **Safety Check**
    - Confirm that the current Git status is clean (no uncommitted changes).
    - Create a new branch from `develop`: `git switch -c refactor/global-code-cleanup`.

2.  **Dependency & Cache Refresh**
    - Announce: "Performing full dependency refresh."
    - `rm -rf node_modules`
    - `rm -rf .next`
    - `bun install`

3.  **Code & Structure Optimization**
    - Propose a plan for code optimization, logic improvements, or folder structure enhancements based on analysis. Await "GO" command.
    - Execute the approved refactoring plan.
    - Commit changes with the `refactor:` prefix.

4.  **Finalization**
    - Announce: "Global refactoring complete. Proceeding to **FINALIZE_PR** protocol."
    - Execute **FINALIZE_PR**.