# 🧠 OmniBrain Agent Framework

> Réseau d'agents IA spécialisés, orchestrés en parallèle par un routeur déterministe.
> **Zéro dépendance runtime** — Python 3.11+ standard library, exécutable partout.

OmniBrain est l'orchestrateur central du compte `blassana280-ux`. Il transforme
une demande utilisateur en une escouade d'agents spécialisés, mobilisés en
**une seule vague parallèle**, avec des briefs autonomes, des contrats
d'interface et des gates qualité. L'utilisateur final ne voit qu'un seul
interlocuteur et un seul livrable.

## Pourquoi ce framework

Le manifeste `AGENTS.md` décrivait un réseau dont les fiches agents vivaient
dans un dépôt inaccessible. Ce dépôt rend le réseau **réel, exécutable et
testable** :

| Avant | Après |
|---|---|
| Un fichier `AGENTS.md` pointeur vers des chemins indisponibles | 12 fiches agents versionnées, validées en CI |
| Routage implicite, non reproductible | Matrice déclarative `matrix.toml` + moteur déterministe |
| Parallélisation prescrite, jamais outillée | `omnibrain plan` génère briefs et contrats en une vague |
| « NEEDS WORK » par défaut, sans contrôle | `omnibrain gates` évalue les 4 gates avec code de retour CI |

## Démarrage rapide

```bash
# Aucune dépendance à installer (Python 3.11+)
python3 -m omnibrain validate                       # valide tout le réseau
python3 -m omnibrain list                           # agents enregistrés
python3 -m omnibrain classify "refonte complète de l'API et des tests"
python3 -m omnibrain route "audit sécurité OWASP de l'API"
python3 -m omnibrain plan examples/task-complex.md -o plan.md
omnibrain gates livrable.md                         # ou python3 -m omnibrain gates
```

Installation optionnelle en commande isolée : `pip install -e .` (fournit la commande `omnibrain`).

## Les 5 temps d'OmniBrain

1. **CLASSER** — `simple` (1 agent), `moyenne` (1-3), `complexe` (escouade 4-8).
   Score explicable : domaines matchés, connecteurs multi-tâches, lexique de
   complexité, taille, domaines à risque.
2. **MOBILISER** — la matrice `matrix.toml` sélectionne les agents par
   mots-clés FR/EN avec détection aux frontières de mot (un acronyme comme
   `ci` ne se déclenche plus dans `associés`).
3. **DISPATCHER** — une **seule vague parallèle** : brief autonome par agent,
   contexte isolé, contrats d'interface émis seulement si producteur et
   consommateur sont tous deux dans l'escouade.
4. **SURVEILLER** — 4 gates : G1 complétude, G2 preuve fraîche, G3 revue
   adverse, G4 intégration. Verdict par défaut : **NEEDS WORK**.
5. **ASSEMBLER** — un livrable unique + rapport d'orchestration
   (`templates/orchestration-report.md`).

### Renforts obligatoires

- Tout domaine code (UI, backend, data) en niveau moyenne/complexe → `qa-test`
- Demande complexe → `adversarial-reviewer` (sinon alerte bloquante)
- Domaines à risque → expert dédié imposé : `security`, `devops-sre`, `ohada-finance`
- L'orchestrateur `omnibrain` ne rejoint jamais une escouade

## Structure du dépôt

```
├── matrix.toml                  # source de vérité : agents, mots-clés, contrats
├── omnibrain/                   # moteur (classifier, router, dispatcher, gates, cli)
├── specialized/                 # 12 fiches agents au format frontmatter Markdown
├── skills/omnibrain-orchestration/SKILL.md   # skill compatible spécification Agent Skills
├── templates/                   # briefs, contrats d'interface, rapport type
├── examples/                    # demandes simple / moyenne / complexe
└── tests/                       # 32 tests stdlib (python -m unittest)
```

## Les 12 agents

| Agent | Domaine | Risque |
|---|---|---|
| 🧠 `omnibrain` | orchestration | — |
| 🎨 `frontend-ui` | UI, frontend | |
| ⚙️ `backend-api` | backend, API | |
| 📊 `data-ai` | données, IA/ML/RAG | |
| 🧪 `qa-test` | tests, recette | |
| 🚀 `devops-sre` | CI/CD, SRE, cloud | **risque** |
| 🛡️ `security` | OWASP, IAM, RGPD | **risque** |
| 🔍 `adversarial-reviewer` | contre-expertise (gate G3) | |
| ⚖️ `ohada-finance` | SYSCOHADA/AUDCIF, fiscalité UEMOA | **risque** |
| 📣 `marketing-growth` | croissance, marque, funnel | |
| 🔎 `research-intel` | veille, sources, preuve fraîche | |
| 🧭 `product-delivery` | cadrage, roadmap, backlog | |

## Ajouter un agent

1. Créer `specialized/specialized-<id>-agent.md` avec le frontmatter
   (`id`, `name`, `description` obligatoires) en suivant une fiche existante.
2. Déclarer l'agent dans `matrix.toml` (`[[agents]]`) avec ses mots-clés et artefacts.
3. Ajouter les `[[contracts]]` éventuels.
4. Lancer `omnibrain validate` et les tests : la CI fait le reste.

## Compatible Agent Skills

`skills/omnibrain-orchestration/SKILL.md` respecte la spécification Agent
Skills (frontmatter `name`/`description`, divulgation progressive) : le même
workflow est chargeable dans tout client compatible (Claude Code, Codex,
Cursor, Gemini CLI, etc.).

## Écosystème du compte

OmniBrain réutilise sans réinventer : pour une compétence absente, chercher
d'abord dans les collections forkées `agent-skills-index`,
`awesome-agent-skills`, `antigravity-skills`, puis étendre la matrice.

## Tests et CI

```bash
python3 -m unittest discover -s tests -v
```

L'action `.github/workflows/validate.yml` exécute tests et validation sur
chaque poussée et chaque pull request.

## Licence

MIT — voir [LICENSE](LICENSE).
