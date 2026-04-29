# Antigravity Workflows

> Workflow playbooks to orchestrate multiple skills with less friction.

## What Is a Workflow?

A workflow is a guided, step-by-step execution path that combines multiple skills for one concrete outcome.

- **Bundles** tell you which skills are relevant for a role.
- **Workflows** tell you how to use those skills in sequence to complete a real objective.

If bundles are your toolbox, workflows are your execution playbook.

---

## How to Use Workflows

1. Install the repository once (`npx agents-curated-skills`).
2. Pick a workflow matching your immediate goal.
3. Execute steps in order and invoke the listed skills in each step.
4. Keep output artifacts at each step (plan, decisions, tests, validation evidence).

You can combine workflows with bundles from [bundles.md](bundles.md) when you need broader coverage.

---

## Workflow: Ship a SaaS MVP

Build and ship a minimal but production-minded SaaS product.

**Related bundles:** `Essentials`, `Full-Stack Developer`, `QA & Testing`, `DevOps & Cloud`

### Prerequisites

- Local repository and runtime configured.
- Clear user problem and MVP scope.
- Basic deployment target selected.

### Steps

1. **Plan the scope**
   - **Goal:** Define MVP boundaries and acceptance criteria.
   - **Skills:** [`@brainstorming`](../../skills/brainstorming/)
   - **Prompt example:** `Usa @brainstorming per definire milestones e criteri di accettazione del mio MVP SaaS.`

2. **Build backend and API**
   - **Goal:** Implement core entities, APIs, and auth baseline.
   - **Skills:** [`@backend-dev-guidelines`](../../skills/backend-dev-guidelines/), [`@api-patterns`](../../skills/api-patterns/), [`@database-design`](../../skills/database-design/)
   - **Prompt example:** `Usa @backend-dev-guidelines per creare API e servizi del dominio billing.`

3. **Build frontend**
   - **Goal:** Ship core user flow with clear UX states.
   - **Skills:** [`@frontend-developer`](../../skills/frontend-developer/), [`@react-patterns`](../../skills/react-patterns/), [`@frontend-design`](../../skills/frontend-design/)
   - **Prompt example:** `Usa @frontend-developer per implementare onboarding, empty state e dashboard iniziale.`

4. **Test and validate**
   - **Goal:** Cover critical user journeys before release.
   - **Skills:** [`@test-driven-development`](../../skills/test-driven-development/), [`@browser-automation`](../../skills/browser-automation/), `@go-playwright` (optional, Go stack)
   - **Prompt example:** `Usa @browser-automation per creare test E2E sui flussi signup e checkout.`
   - **Go note:** Se il progetto QA e tooling sono in Go, preferisci `@go-playwright`.

5. **Ship safely**
   - **Goal:** Release with observability and rollback plan.
   - **Skills:** [`@deployment-procedures`](../../skills/deployment-procedures/), [`@observability-engineer`](../../skills/observability-engineer/)
   - **Prompt example:** `Usa @deployment-procedures per una checklist di rilascio con rollback.`

---

## Workflow: Security Audit for a Web App

Run a focused security review from scope definition to remediation validation.

**Related bundles:** `Security Engineer`, `Security Developer`, `Observability & Monitoring`

### Prerequisites

- Explicit authorization for testing.
- In-scope targets documented.
- Logging and environment details available.

### Steps

1. **Define scope and threat model**
   - **Goal:** Identify assets, trust boundaries, and attack paths.
   - **Skills:** [`@security-auditor`](../../skills/security-auditor/), [`@cloud-penetration-testing`](../../skills/cloud-penetration-testing/)
   - **Prompt example:** `Usa @security-auditor per mappare asset critici e trust boundaries della mia web app.`

2. **Review auth and access control**
   - **Goal:** Detect account takeover and authorization flaws.
   - **Skills:** [`@api-security-best-practices`](../../skills/api-security-best-practices/), [`@frontend-security-coder`](../../skills/frontend-security-coder/)
   - **Prompt example:** `Usa @api-security-best-practices per verificare accessi non autorizzati su endpoint multitenant.`

3. **Assess API and input security**
   - **Goal:** Uncover high-impact API and injection vulnerabilities.
   - **Skills:** [`@api-security-best-practices`](../../skills/api-security-best-practices/), [`@api-security-testing`](../../skills/api-security-testing/), [`@api-fuzzing-bug-bounty`](../../skills/api-fuzzing-bug-bounty/)
   - **Prompt example:** `Usa @api-security-best-practices per audit endpoint auth, billing e admin.`

4. **Harden and verify**
   - **Goal:** Convert findings into fixes and verify evidence of mitigation.
   - **Skills:** [`@security-auditor`](../../skills/security-auditor/)
   - **Prompt example:** `Usa @security-auditor per provare che le mitigazioni sono effettive.`

---

## Workflow: Build an AI Agent System

Design and deliver a production-grade agent with measurable reliability.

**Related bundles:** `Agent Architect`, `LLM Application Developer`, `Data Engineering`

### Prerequisites

- Narrow use case with measurable outcomes.
- Access to model provider(s) and observability tooling.
- Initial dataset or knowledge corpus.

### Steps

1. **Define target behavior and KPIs**
   - **Goal:** Set quality, latency, and failure thresholds.
   - **Skills:** [`@llm-app-patterns`](../../skills/llm-app-patterns/), [`@multi-agent-patterns`](../../skills/multi-agent-patterns/), [`@llm-evaluation`](../../skills/llm-evaluation/)
   - **Prompt example:** `Usa @llm-evaluation per definire benchmark e criteri di successo del mio agente.`

2. **Design retrieval and memory**
   - **Goal:** Build reliable retrieval and context architecture.
   - **Skills:** [`@llm-app-patterns`](../../skills/llm-app-patterns/), [`@rag-implementation`](../../skills/rag-implementation/)
   - **Prompt example:** `Usa @rag-implementation per progettare pipeline di chunking, embedding e retrieval.`

3. **Implement orchestration**
   - **Goal:** Implement deterministic orchestration and tool boundaries.
   - **Skills:** [`@mcp-builder`](../../skills/mcp-builder/)
   - **Prompt example:** `Usa @mcp-builder per implementare strumenti agente con fallback e human-in-the-loop.`

4. **Evaluate and iterate**
   - **Goal:** Improve weak points with a structured loop.
   - **Skills:** [`@llm-evaluation`](../../skills/llm-evaluation/), [`@hugging-face-evaluation`](../../skills/hugging-face-evaluation/)
   - **Prompt example:** `Usa @llm-evaluation per prioritizzare le correzioni sulle failure modes rilevate dai test.`

---

## Workflow: QA and Browser Automation

Create resilient browser automation with deterministic execution in CI.

**Related bundles:** `QA & Testing`, `Full-Stack Developer`

### Prerequisites

- Test environments and stable credentials.
- Critical user journeys identified.
- CI pipeline available.

### Steps

1. **Prepare test strategy**
   - **Goal:** Scope journeys, fixtures, and execution environments.
   - **Skills:** [`@test-driven-development`](../../skills/test-driven-development/)
   - **Prompt example:** `Usa @test-driven-development per definire suite E2E minima ma ad alto impatto.`

2. **Implement browser tests**
   - **Goal:** Build robust test coverage with stable selectors.
   - **Skills:** [`@browser-automation`](../../skills/browser-automation/), `@go-playwright` (optional, Go stack)
   - **Prompt example:** `Usa @go-playwright per implementare browser automation in un progetto Go.`

3. **Triage and harden**
   - **Goal:** Remove flaky behavior and enforce repeatability.
   - **Skills:** [`@debugging-strategies`](../../skills/debugging-strategies/), [`@error-diagnostics-smart-debug`](../../skills/error-diagnostics-smart-debug/), [`@webapp-testing`](../../skills/webapp-testing/)
   - **Prompt example:** `Usa @debugging-strategies per classificare e risolvere le flakiness in CI.`

---

## Workflow: Design a DDD Core Domain

Model a complex domain coherently, then implement tactical and evented patterns only where justified.

**Related bundles:** `Architecture & Design`, `DDD & Evented Architecture`

### Prerequisites

- Access to at least one domain expert or product owner proxy.
- Current system context and integration landscape available.
- Agreement on business goals and key domain outcomes.

### Steps

1. **Assess DDD fit and scope**
   - **Goal:** Decide whether full DDD, partial DDD, or simple modular architecture is appropriate.
   - **Skills:** [`@architecture`](../../skills/architecture/), [`@database-design`](../../skills/database-design/)
   - **Prompt example:** `Use @architecture to evaluate if full DDD is justified for our billing and fulfillment platform.`

2. **Create strategic model**
   - **Goal:** Define subdomains, bounded contexts, and ubiquitous language.
   - **Skills:** [`@architecture`](../../skills/architecture/), [`@microservices-patterns`](../../skills/microservices-patterns/)
   - **Prompt example:** `Use @architecture to classify subdomains and propose bounded contexts with ownership.`

3. **Map context relationships**
   - **Goal:** Define upstream/downstream contracts and anti-corruption boundaries.
   - **Skills:** [`@architecture`](../../skills/architecture/), [`@microservices-patterns`](../../skills/microservices-patterns/)
   - **Prompt example:** `Use @microservices-patterns to model Checkout, Billing, and Inventory interactions with clear contract ownership.`

4. **Implement tactical model**
   - **Goal:** Encode invariants with aggregates, value objects, and domain events.
   - **Skills:** [`@test-driven-development`](../../skills/test-driven-development/)
   - **Prompt example:** `Use @test-driven-development to design aggregates and invariants for order lifecycle transitions.`

5. **Adopt evented patterns selectively**
   - **Goal:** Apply CQRS, event store, projections, and sagas only where complexity and scale require them.
   - **Skills:** [`@architecture`](../../skills/architecture/), [`@microservices-patterns`](../../skills/microservices-patterns/), [`@database-design`](../../skills/database-design/)
   - **Prompt example:** `Use @architecture and @database-design to scale read-side reporting without compromising domain invariants.`

---

## Machine-Readable Workflows

For tooling and automation, workflow metadata is available in [data/workflows.json](../../data/workflows.json).
