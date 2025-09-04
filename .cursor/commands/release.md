# Protocol: RELEASE

## Description
Manages the process of creating a new production release.

## Steps
1.  **// Version Analysis**
    - Analyze `develop` branch history since the last tag.
    - Suggest the next semantic version (major/minor/patch) based on commit types (`feat:` -> minor, `fix:` -> patch, `BREAKING CHANGE:` -> major).
    - Ask for user confirmation: "Proposed version is `vX.Y.Z`. Confirm? (Yes/No)".

2.  **// Branch Creation**
    - `git switch -c release/vX.Y.Z` from `develop`.

3.  **// Final Touches (Optional)**
    - Ask if any final changes are needed (e.g., updating `CHANGELOG.md`). Perform them if requested.

4.  **// Merge to Main & Tag**
    - Create a Pull Request from `release/vX.Y.Z` to `main`.
    - **AWAIT USER MERGE.**
    - After merge, run:
        - `git switch main`
        - `git pull origin main`
        - `git tag vX.Y.Z`
        - `git push origin vX.Y.Z`

5.  **// Backport to Develop**
    - `git switch develop`
    - `git pull origin develop`
    - `git merge main`
    - `git push origin develop`

6.  **// Cleanup**
    - Delete the release branch locally and on remote.
    - Announce: "Release `vX.Y.Z` complete and tagged. `develop` is synced. Ready for next **START** protocol.