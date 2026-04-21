# Workflow Deliverables

Use this reference when the task needs a structured workflow spec, branch audit, or contract definition.

## Recommended Workflow Spec Shape

```md
# Workflow: [Name]

## Goal
- What this workflow accomplishes
- Who or what triggers it

## Trigger
- UI action, API call, event, job, or operator action

## Actors
- User
- Frontend
- Backend/service
- Operator
- External dependency

## Prerequisites
- What must already be true

## Happy Path
1. Step
2. Step
3. Step

## Branches and Failures
- Validation failure
- Timeout
- Retryable external failure
- Permanent failure
- Partial-completion failure
- Conflict or duplicate action

## Observable States
- What the user sees
- What the operator sees
- What state the system or record is in

## State Transitions
- `pending -> in_progress -> complete`
- `pending -> failed`
- `in_progress -> retrying -> failed`

## Handoff Contracts
- From
- To
- Payload
- Success response
- Failure response
- Timeout assumption

## Recovery or Cleanup
- What must be retried, reversed, or marked failed

## Assumptions
- What is inferred but not yet verified

## Open Questions
- Decisions still blocked on missing information
```

## Handoff Contract Template

```md
### Handoff: [From] -> [To]
- Payload: [fields and expectations]
- Success: [what comes back or what state advances]
- Failure: [error shape or outcome]
- Timeout: [what duration matters]
- On failure: [retry, abort, cleanup, escalate]
```

## Branch Audit Checklist

- Confirm the happy path is explicit
- Confirm each major step has failure thinking, not only success thinking
- Confirm duplicate or concurrent actions are considered where relevant
- Confirm retryable failures are separated from permanent failures
- Confirm partial-completion failures have recovery guidance
- Confirm assumptions are listed instead of hidden in prose

## State Map Template

```md
| State | Entered by | Exited by | Notes |
|---|---|---|---|
| pending | Trigger accepted | Processing starts | Initial accepted state |
| in_progress | Work begins | Success, retry, fail | Active processing |
| retrying | Retry scheduled | Success or fail | Temporary recovery state |
| complete | Final success | - | Terminal success state |
| failed | Final failure | Retry or operator action | Terminal or operator-managed state |
```
