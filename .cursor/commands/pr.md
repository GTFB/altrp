# Protocol: FINALIZE_PR

## Description
Performs final quality checks, ensures the branch is up-to-date, and creates a Pull Request.

## Steps
1.  **Quality Gate**
    - Run `bun run lint`. Automatically fix all fixable errors. Announce any remaining issues that require manual intervention.
    - Run `bun run test --coverage`. Fix all failing tests. If new logic was added, write new tests to cover it.

2.  **Branch Synchronization**
    - `git pull --rebase origin develop`. Resolve any rebase conflicts.

3.  **Push to Remote**
    - `git push --set-upstream origin <current-branch-name>`.

4.  **Pull Request Creation**
    - Create a Pull Request on GitHub targeting the `develop` branch.
    - Use the task description as the PR body.
    - Paste the PR link into the chat.

5.  **Final State**
    - Announce: "Pull Request created. Awaiting code review and merge. Ready for next **START** or **EXECUTE_TASK** protocol."