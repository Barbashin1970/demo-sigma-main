# UI Design Deliverables

Use this reference when the task needs a structured design artifact, audit, or handoff.

## Recommended Design Response Shape

```md
# [Feature or Surface]

## Goal
- What the interface is trying to help the user do
- Constraints that matter for the design

## Visual Direction
- Keywords for the look and feel
- Typography, color, spacing, and motion principles

## Design System Decisions
- Tokens or styling rules that should be reused
- Component patterns introduced or updated

## Component Inventory
- Component name
- Purpose
- Variants
- States
- Notes for implementation

## Responsive Behavior
- Mobile behavior
- Tablet behavior
- Desktop behavior

## Accessibility
- Contrast expectations
- Keyboard and focus behavior
- Semantics or labeling requirements
- Touch target or reduced-motion requirements

## Developer Handoff
- Exact measurements when needed
- Reusable CSS or token guidance
- Edge cases and state handling

## Open Questions
- Decisions blocked by missing product or brand input
```

## UI Audit Response Shape

```md
# UI Audit: [Surface]

## Summary
- Strongest pattern to preserve
- Most important problem to fix first

## Findings
- Issue
- Why it matters
- Recommendation

## System Fixes
- Reusable fixes that should apply beyond one screen

## Accessibility Risks
- Concrete issues and their likely impact

## Handoff Notes
- What engineering needs clarified before implementation
```

## Component Inventory Template

```md
### [Component Name]
- Purpose: [What it does]
- Variants: [Primary, secondary, destructive, compact, etc.]
- States: [Default, hover, focus, active, disabled, loading, error]
- Content rules: [Label length, icon usage, truncation, helper text]
- Responsive notes: [How it changes across breakpoints]
- Accessibility: [Contrast, keyboard, semantics, touch target]
- Implementation notes: [Token usage, spacing, special logic]
```

## Accessibility Checklist

- Confirm text and key UI elements meet WCAG AA contrast intent
- Confirm focus states are visible and not color-only
- Confirm all interactive elements can be understood and reached by keyboard
- Confirm touch targets are comfortably usable on mobile
- Confirm motion is meaningful and can respect reduced-motion preferences
- Confirm errors and validation states are specific and perceivable

## Handoff Checklist

- Name the components and variants consistently
- Convert visual opinions into rules developers can implement
- Call out one-off exceptions explicitly
- Distinguish required behavior from optional polish
- Leave open questions in a separate section instead of burying them in prose
