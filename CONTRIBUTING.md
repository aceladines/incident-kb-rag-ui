# Contributing

## Branch Strategy

This project uses a **trunk-based development** model with short-lived feature branches.

### Branches

| Branch | Purpose | Protected |
|--------|---------|-----------|
| `main` | Production-ready code. Every merge triggers CI. | Yes |
| `develop` | Integration branch for features. PRs merge here first. | Yes |
| `feature/*` | New features and enhancements | No |
| `bugfix/*` | Bug fixes | No |
| `hotfix/*` | Urgent production fixes (branch from `main`) | No |
| `chore/*` | Non-functional changes (deps, CI, docs) | No |

### Branch Naming

```
feature/IKB-42-incident-form-validation
bugfix/IKB-58-fix-dark-mode-toggle
hotfix/IKB-99-api-url-config
chore/IKB-12-update-dependencies
```

Format: `<type>/IKB-<ticket>-<short-description>`

### Workflow

1. Create a branch from `develop` (or `main` for hotfixes)
2. Make changes with clear, atomic commits
3. Push and open a Pull Request against `develop`
4. CI must pass (lint, type-check, build)
5. At least 1 approval required
6. Squash merge into `develop`
7. `develop` merges into `main` for releases

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]
[optional footer]
```

### Types

| Type | Description |
|------|------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no logic change |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test` | Adding or updating tests |
| `chore` | Build process, dependencies, CI |

### Examples

```
feat(incidents): add multi-select tag input for impacted services
fix(ask): handle empty RAG response gracefully
docs(readme): add environment setup instructions
chore(deps): upgrade shadcn/ui to latest
```

## Pull Request Guidelines

### Before Opening a PR

- [ ] `npm run lint` passes with no errors
- [ ] `npm run type-check` passes
- [ ] `npm run build` succeeds
- [ ] `npm run format:check` passes
- [ ] New components include proper TypeScript types
- [ ] No `any` types without justifying comments
- [ ] Dark/Light mode tested for UI changes
- [ ] Responsive layout verified for UI changes

### PR Title

Use conventional commit format: `feat(incidents): add severity filter to list view`

### PR Description Template

```markdown
## What

Brief description of what this PR does.

## Why

Context on why this change is needed.

## How

Approach taken, any trade-offs or decisions worth noting.

## Testing

Steps to verify the change works correctly.

## Screenshots

(For UI changes — include both dark and light mode)
```

## Code Style

- See `CLAUDE.md` for full coding conventions
- TypeScript strict mode, no `any`
- Tailwind utility classes only, no custom CSS
- shadcn semantic color tokens only (never raw Tailwind colors)
- `snake_case` for API fields, `camelCase` for internal JS
