# Lessons

## Always create a feature branch before starting implementation

When executing an implementation plan (especially via subagent-driven-development), create a feature branch **before** the first commit — never commit directly to `main`/`master`.

The `superpowers:subagent-driven-development` skill makes this explicit:

> "Never start implementation on main/master branch without explicit user consent"

**Pattern to follow:**

```bash
git checkout -b feat/phase-7-gap-fixes
# ... all implementation commits ...
# then PR or merge back to main
```

Raise this with the user at the start of any multi-task plan execution if no branch already exists.

## Do not conflate artifact bounds with framed image bounds

When working on the editor, the exported artifact/background area and the inner framed image area are different concepts.

- The outer artifact can include background and rounded corners.
- A selected frame should wrap an inner image region, not replace the whole artifact bounds.
- Raster export must crop to the artifact bounds, never to the full workspace or to temporary bleed into the editor background.

Before changing editor geometry, verify all three independently:

1. outer artifact/background bounds
2. inner frame bounds
3. export crop bounds

## Distinguish frame chrome from frame content

For framed editor exports, the image should fit the visible content area inside the frame, not sit underneath the frame chrome.

- Keep the outer artifact/background independent from the frame.
- Keep the frame overlay independent from the image placement.
- Compute visible image content bounds by subtracting frame chrome insets from the frame area.
- Preserve rounded artifact corners in raster exports by excluding the workspace background from the cropped output.

## Base isolated work on the active feature branch, not stale HEAD

If the user already has active work on a feature branch, an implementation worktree must start from that branch's current state.

- A new worktree created from repository `HEAD` will miss uncommitted work in another branch.
- Before creating or using a worktree, check the user's active branch and whether it has uncommitted changes relevant to the same area.
- If relevant uncommitted changes exist, either commit them first or explicitly coordinate how to carry them over before doing new implementation work.

Always verify both before proceeding:

1. source branch for the worktree
2. whether the user's active branch has uncommitted related changes

## Polsh worktree setup needs shared deps and non-conflicting services

This project can run from a git worktree, but setup is not zero-config.

- A fresh worktree may not have its own `vendor/` or `node_modules/`; symlinking them from the main workspace is the quickest path when dependencies are already installed.
- Sail can fail inside a worktree because host ports are already claimed by the main workspace stack (we hit Mailpit on `1025` and Redis on `6379`). For frontend-only verification, prefer direct Node/Vitest/ESLint/build commands when the Docker conflict is unrelated to the change.
- Before relying on Sail in a worktree, check whether the existing project containers are already running and whether port collisions will block startup.
- When cleanup is complete and the work has been merged or carried forward, remove stale worktrees promptly so old feature branches do not stay artificially locked.

Recommended sequence for future Polsh worktrees:

1. start from the user's active feature branch
2. symlink `vendor` and `node_modules` if needed
3. use direct frontend verification if Sail ports conflict
4. merge/carry commits back to the long-lived feature branch before deleting the worktree

## Verify production runtime toggles before attributing resource usage

When investigating production infrastructure behavior, do not infer that optional runtime features are enabled just because the codebase supports them.

- Confirm whether platform toggles like Octane, Inertia SSR, hibernation, scheduler, and queue workers are actually enabled in the live environment before treating them as active causes.
- Treat repository config as capability, not proof of production state.
- If the user corrects a runtime assumption, update the diagnosis around the confirmed live settings instead of carrying the old theory forward.
