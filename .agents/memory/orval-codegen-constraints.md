---
name: Orval + Zod codegen constraints
description: OpenAPI spec shapes that break the chained typecheck after codegen in this workspace, and the compatible alternatives.
---

# Orval + Zod codegen constraints

Two spec shapes generate code that does not compile here. Both fail *after* Orval reports success, during the chained library typecheck, so the generator's own "success" output is not a signal that you are done.

## 1. Do not use `type: integer`

**Rule:** Use `type: number` for numeric fields and enforce whole numbers in server logic instead.

**Why:** Orval emits `zod.int()` for integer fields. That helper only exists in Zod v4; the workspace pins Zod v3, so the generated module fails to typecheck.

**How to apply:** When adding a numeric field to the OpenAPI spec. Keep `minimum`/`maximum` — those map to `.min()`/`.max()` and work fine. Round and clamp in the route or service layer if the value must be an integer.

## 2. Do not put query parameters on an operation that already has path parameters

**Rule:** Move the value into the request body (or a differently-shaped operation) instead.

**Why:** Orval names the path-parameter Zod schema and the query-parameter TS type both `<Operation>Params`. When one operation has both, the two generated modules export the same name and the barrel re-export fails with "already exported a member named ...".

**How to apply:** Most often hits `DELETE /thing/{id}` when you want to pass a token or flag alongside it. A request body on DELETE works with Orval, Express and fetch, and sidesteps the collision.

## Verifying

Always re-run codegen and read past the celebratory Orval output to the typecheck result. A clean run ends with the typecheck producing no errors.
