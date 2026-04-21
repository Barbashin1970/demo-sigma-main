# Frontend Implementation Deliverables

Use this reference when the task needs structured frontend implementation notes, a handoff, or a review artifact.

## Recommended Implementation Response Shape

```md
# [Feature or Surface] Frontend Implementation

## Goal
- What user-facing behavior is being implemented or changed
- Constraints that matter for the implementation

## Affected Frontend Surface
- Routes, pages, components, hooks, or state modules involved

## Implementation Decisions
- Rendering approach
- State ownership
- API/data boundaries
- Error handling strategy

## UI States
- Loading
- Empty
- Success
- Error
- Disabled or in-progress states

## Accessibility
- Semantic structure
- Keyboard behavior
- Focus behavior
- Labels and announcements

## Responsive Behavior
- Mobile behavior
- Tablet behavior
- Desktop behavior

## Performance Notes
- Bundle, rendering, data-fetching, or animation concerns

## Testing
- Unit, integration, or end-to-end coverage added or required

## Open Questions
- Gaps in design, product, or backend contracts
```

## UI Handoff Intake Checklist

- Confirm the visual and interaction rules are clear enough to implement
- Confirm component variants and edge states are defined
- Confirm responsive expectations are explicit
- Confirm accessibility expectations are clear when the flow is complex
- Escalate missing decisions instead of guessing on high-impact UX behavior

## Frontend Quality Checklist

- Confirm key states render correctly
- Confirm keyboard and focus behavior are not broken
- Confirm semantics and labels are present where needed
- Confirm loading and error feedback are visible and specific
- Confirm component boundaries are still understandable after the change
- Confirm the change does not introduce an obvious performance regression

## Implementation Review Template

```md
# Frontend Review: [Surface]

## What Changed
- Summary of implementation work

## Strengths
- What is solid and should stay

## Risks
- Behavior, accessibility, performance, or maintainability issues

## Follow-up
- Design follow-up
- Backend follow-up
- Test follow-up
```
