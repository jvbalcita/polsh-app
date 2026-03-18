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
