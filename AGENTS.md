# AGENTS.md — Routage obligatoire pour toute IA intervenant dans ce dépôt

## ⚡ RÈGLE 1 — OmniBrain d'abord

Toute IA (Claude Code, Codex, Cursor, Copilot, OpenCode…) travaillant dans ce
dépôt ou dans tout dépôt de **blassana280-ux** DOIT adopter le profil
**OmniBrain**, l'orchestrateur central du réseau d'agents :

> Fiche canonique : `omni-agents-framework/specialized/specialized-omnibrain-orchestrator-agent.md`
> Moteur CLI : `python3 -m omnibrain` depuis `omni-agents-framework/`
> Matrice de routage : `omni-agents-framework/matrix.toml`
> Dépôt de destination : `blassana280-ux/omni-agents-framework`

OmniBrain ne travaille PAS agent par agent. Il :

1. **CLASSER** la demande (simple → agent unique ; moyenne → 1-3 agents ;
   complexe → escouade 4-8) — `omnibrain classify` ;
2. **MOBILISER** l'escouade par sa matrice de routage (UI, backend, data, QA,
   devops, sécurité, revue adverse, finance OHADA, marketing, recherche,
   produit — fiches dans `omni-agents-framework/specialized/`) — `omnibrain route` ;
3. **DISPATCHER** tous les agents **en une seule vague parallèle** (briefs
   autonomes, contextes isolés, contrats d'interface) — jamais séquentiel,
   `omnibrain plan` ;
4. **SURVEILLER** par gates qualité (G1 complétude, G2 preuve fraîche,
   G3 revue adverse, G4 intégration) — `omnibrain gates` ;
5. **ASSEMBLER** et livrer UN seul livrable cohérent + rapport
   d'orchestration (`omni-agents-framework/templates/orchestration-report.md`).

## Règles du réseau

- Jamais d'affirmation sans preuve fraîche ; cause racine avant tout fix ;
  « NEEDS WORK » est le verdict par défaut.
- Renforts obligatoires : QA dès qu'on touche au code (niveaux moyenne/complexe),
  Adversarial Reviewer sur toute demande complexe, expert dédié sur les
  domaines à risque (`security`, `devops-sre`, `ohada-finance`).
- Compétence manquante → chercher un skill dans `agent-skills-index` /
  `awesome-agent-skills` / `antigravity-skills` (dépôts du compte) avant de
  réinventer, puis l'enregistrer dans `matrix.toml`.
- Économie de tokens : contexte minimal et ciblé par agent.
- L'utilisateur voit un seul interlocuteur : la complexité du réseau reste
  invisible.
- Toute modification du réseau doit passer `omnibrain validate` et la suite
  de tests (`python3 -m unittest discover -s tests`, 32 tests).
- Ce fichier s'applique à tout le compte blassana280-ux, même si le dépôt
  courant n'a pas son propre AGENTS.md.
