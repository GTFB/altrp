# Protocol: START

## Description
Initializes the workspace for a new work cycle. Synchronizes branches, cleans up the local environment, and prepares for a new task.

## Steps
1.  **Pre-flight Check**
    - Ensure no uncommitted changes exist. Announce any conflicts.

2.  **Branch Synchronization**
    - `git switch main`
    - `git pull origin main`
    - `git switch develop`
    - `git pull origin develop`
    - `git merge main` (Announce if conflicts arise, otherwise confirm successful merge).

3.  **Environment Cleanup**
    - `git branch --merged develop | grep -v "\\*" | grep -v "develop" | grep -v "main" | xargs -n 1 git branch -d` (Deletes local branches already merged into develop).
    - Announce which local branches were pruned.

4.  **Final State**
    - Announce: "System Initialized. Workspace is clean and synchronized. Awaiting new goal for **EXECUTE_TASK** protocol."