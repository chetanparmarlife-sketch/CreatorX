# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records for CreatorX backend.

## What are ADRs?

Architecture Decision Records (ADRs) are documents that capture important architectural decisions made during the development of CreatorX. They provide context, rationale, and consequences of each decision.

## ADR Format

Each ADR follows this structure:
1. **Status**: Proposed, Accepted, Rejected, Deprecated
2. **Context**: The situation and problem
3. **Decision**: The chosen solution
4. **Rationale**: Why this decision was made
5. **Consequences**: Positive and negative impacts
6. **Alternatives**: Other options considered

## Current ADRs

- [ADR-001: Use Supabase for Authentication and Storage](./ADR-001-supabase-auth-storage.md)
- [ADR-002: Use Spring Boot Instead of Node.js](./ADR-002-spring-boot-backend.md)
- [ADR-003: Use WebSocket Instead of Polling for Messaging](./ADR-003-websocket-messaging.md)
- [ADR-004: Use Razorpay for Payment Processing](./ADR-004-razorpay-payments.md)

## Creating New ADRs

When making a significant architectural decision:

1. Create a new file: `ADR-XXX-short-title.md`
2. Use the template below
3. Update this README with the new ADR
4. Get team review and approval

## ADR Template

```markdown
# ADR-XXX: [Title]

## Status
Proposed | Accepted | Rejected | Deprecated

## Context
[Describe the situation and problem]

## Decision
[State the decision]

## Rationale
[Explain why this decision was made]

## Consequences

### Positive
- ✅ [Benefit 1]
- ✅ [Benefit 2]

### Negative
- ⚠️ [Drawback 1]
- ⚠️ [Drawback 2]

### Mitigation
[How we'll address the drawbacks]

## Alternatives Considered
1. [Alternative 1] - [Why rejected]
2. [Alternative 2] - [Why rejected]

## References
- [Link 1]
- [Link 2]
```

