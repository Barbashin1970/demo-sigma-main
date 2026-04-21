# AGENTS

## Purpose

- This repository stores reusable Codex skills for a frontend-focused team.
- Keep persistent repository guidance in this file.
- Keep reusable role workflows in `.agents/skills/`.

## Structure Rules

- Prefer one focused skill per role or specialization.
- Keep `SKILL.md` concise and move long templates, checklists, and examples into `references/`.
- Create `scripts/`, `assets/`, `agents/openai.yaml`, or custom subagents only when a role truly needs them.
- Use kebab-case for skill names and keep `name` and `description` metadata aligned with the folder name.

## Role Boundaries

- Use `ui-designer` for visual direction, component behavior, responsive rules, accessibility expectations, UI audits, and design handoff.
- Use `frontend-developer` for production frontend implementation in code: components, routes, state, API-connected UI flows, accessibility in code, performance, and frontend tests.
- Use `workflow-architect` for explicit workflow logic: triggers, actors, steps, states, branches, failures, recovery paths, and handoff contracts.
- Use `ux-researcher` for evidence-based UX analysis, usability findings, research framing, and prioritized recommendations.

## Hygiene

- Keep AGENTS guidance short and stable; detailed process belongs in skills and references.
- Prefer skills over custom subagents unless a role needs explicit spawning behavior or separate model, tool, or sandbox settings.
- Do not commit throwaway validation artifacts or dependency folders that are not part of the maintained skill structure.
