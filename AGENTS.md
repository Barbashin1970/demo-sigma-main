# AGENTS

## Purpose

- This repository stores reusable Codex skills for a frontend-focused team working on Sigma — a smart-city situational-centre product.
- Keep persistent repository guidance in this file.
- Keep reusable role workflows in `.agents/skills/`.

## Structure Rules

- Prefer one focused skill per role or specialization.
- Keep `SKILL.md` concise and move long templates, checklists, and examples into `references/`.
- Create `scripts/`, `assets/`, `agents/openai.yaml`, or custom subagents only when a role truly needs them.
- Use kebab-case for skill names and keep `name` and `description` metadata aligned with the folder name.

## Role Boundaries

- Use `smart-city-analyst` for domain judgement about the situational-centre analyst (the real user Sigma automates) and the city leader (the leader-view consumer): incident triage, criticality ladder, service dispatch, escalation matrices, explainability and forecast authoring, analyst-grade copy voice.
- Use `ui-designer` for visual direction, component behavior, responsive rules, accessibility expectations, UI audits, and design handoff — in this repo also for criticality lamps, risk palettes, compact-first leader view, and operator/display mode visuals.
- Use `frontend-developer` for production frontend implementation in code: components, routes, state, API-connected UI flows, accessibility in code, performance, and frontend tests — in this repo also for scenario catalog edits, playbackStore derivations, sync bridge, storyboard kinds and leader-view composition.
- Use `workflow-architect` for explicit workflow logic: triggers, actors, steps, states, branches, failures, recovery paths, and handoff contracts — in this repo also for the analyst incident-response flow, escalation matrix, actuator feedback loops, and operator↔display sync contract.
- Use `ux-researcher` for evidence-based UX analysis, usability findings, research framing, and prioritized recommendations — in this repo also for analyst shift-context research and leader-view comprehension audits.
- Use `design-taste-frontend` only when a task needs opinionated senior UI engineering bias-correction on top of a target brief from the skills above.

## Authority chain for Sigma work

Domain truth flows top-down; implementation flows bottom-up:

```
smart-city-analyst  →  defines what must be true of the scenario, criticality, services, copy
workflow-architect  →  formalises the flow, states, branches, handoffs
ui-designer         →  visualises states and transitions
frontend-developer  →  implements in code, adds tests
ux-researcher       →  audits any step for evidence and comprehension
```

No skill fabricates domain facts that belong to `smart-city-analyst`. No skill writes production code on behalf of `frontend-developer`.

## Hygiene

- Keep AGENTS guidance short and stable; detailed process belongs in skills and references.
- Prefer skills over custom subagents unless a role needs explicit spawning behavior or separate model, tool, or sandbox settings.
- Do not commit throwaway validation artifacts or dependency folders that are not part of the maintained skill structure.
- Copy and narrative that ship to the UI must pass `smart-city-analyst/references/copy-voice.md`.
