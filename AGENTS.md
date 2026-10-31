# Agent Instructions

## Project perspective

Agent Skills is a small, portable, client-neutral format. Keep the format small:
new requirements impose costs on every implementation and should address
demonstrated interoperability needs, not hypothetical completeness.

Use progressive disclosure in this repository too. Keep details in their natural
source instead of repeating commands, configuration, or policy here.

## Authority and boundaries

`docs/specification.mdx` is authoritative for format requirements.
Explanatory documentation, examples, tests, and implementations do not add
requirements to the format. Preserve the distinction between the format and
choices made by skill authors, clients, models, or implementations.

When these surfaces disagree, surface the discrepancy and resolve it at the
appropriate authority rather than treating existing implementation behavior as
normative.

Do not treat `skills-ref/` as a general contribution surface. It is a
demonstration artifact, not a production SDK or a source of additional format
requirements. Modify it only when the task explicitly scopes work there;
specification or documentation changes do not by themselves put it in scope.

## Documentation

The documentation under `docs/` is a Mintlify site. Treat rendered behavior and
published routes—not source text alone—as part of documentation correctness.

When adding client logos, consider their perceived size in both the logo
carousel and client showcase. Square or visually dense logos can appear
disproportionately dominant, while wide or sparse logos can appear too small;
use the existing `scale` examples in `docs/snippets/clients.jsx` as context and
exercise visual judgment.

## Contributions

`CONTRIBUTING.md` owns current contribution scope, routing, and AI-assistance
disclosure policy. Read and follow it before beginning work intended for
upstream submission or participating in an issue, Discussion, or pull request.

---

<!--
  Everything above this line is the upstream agentskills/agentskills AGENTS.md,
  restored verbatim. Everything below is a local overlay for this fork only.
  It does not add requirements to the Agent Skills format.
-->

# Local Overlay — OmniBrain Network (fork of `agentskills/agentskills`)

This fork belongs to the `blassana280-ux` agent network. The overlay below adds
*local working rules*. It never overrides the upstream sections above: when a
conflict exists, **upstream wins** (`docs/specification.mdx` remains the single
authority for format requirements, and `CONTRIBUTING.md` remains authoritative
for contribution scope).

## Where the orchestrator actually lives

There is **no** `blassana280-ux/optimiser-mes-agents-IA` repository reachable by
the project tooling — that reference could not be verified (HTTP 403, no read
access) and must not be treated as a source of truth.

The operable, tested orchestrator is:

> **`blassana280-ux/omni-agents-framework`** — `OMNIBRAIN.md`, `registry/`,
> `omni/orchestrator.py`, `tests/`. All overlays in this account point there.

A working, fully tested mirror is vendored in this fork at [`omnibrain/`](omnibrain/)
(69 tests, `python3 -m unittest discover -s tests -t omnibrain/tests`). It lives
here only because this repository is the single one the session's GitHub token
may write to — see [`omnibrain/DELIVERY.md`](omnibrain/DELIVERY.md). The
canonical home remains `omni-agents-framework`; `omnibrain/patches/` contains the
`git am`-able history to move it there.

## Working rules inside this fork

1. **OmniBrain first.** Before non-trivial work, classify the request
   (simple → single agent; medium → 1–3 agents; complex → squad of 4–8) using
   [`omni/orchestrator.py`](https://github.com/blassana280-ux/omni-agents-framework/blob/main/omni/orchestrator.py).
2. **Parallel dispatch.** Independent subtasks are dispatched in one parallel
   wave with self-contained briefs; never fake parallelism that is really serial.
3. **Evidence over assertion.** No claim without a fresh command output, file
   line, or API response. "NEEDS WORK" is the default verdict.
4. **Skills before new agents.** Search the skill registries first
   (`omni-agents-framework/registry/skills.json`, `agent-skills-index`,
   `awesome-agent-skills`); only create a new agent when no existing one covers
   the specialty.
5. **Upstream hygiene.** Changes intended for `agentskills/agentskills` must not
   include this overlay, must not touch `skills-ref/`, and must follow
   `CONTRIBUTING.md`, including its AI-assistance disclosure policy.
6. **No secrets in the repo.** Provider credentials come from environment
   variables or the user's configured clients — never committed.
