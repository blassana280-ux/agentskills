# Trading Agents Team — 70 agents de trading

[![Agents](https://img.shields.io/badge/agents-70-1f6feb)](INDEX.md)
[![Escouades](https://img.shields.io/badge/escouades-12-2ea043)](squads/)
[![Spec](https://img.shields.io/badge/Agent%20Skills-conforme-8250df)](https://agentskills.io/specification)
[![Licence](https://img.shields.io/badge/licence-MIT-yellow)](LICENSE)

Une équipe de trading complète, prête à être chargée par n'importe quel agent compatible
**Agent Skills** (Claude Code, Codex CLI, Cursor, Gemini CLI, Copilot, OpenCode, Antigravity).
70 agents nommés, 12 escouades, un protocole d'orchestration unique, et un contrat de sortie
commun à tous les livrables.

> 📦 **Emplacement** : ce dossier `trading-agents-team/` est versionné dans le dépôt
> [`blassana280-ux/agentskills`](https://github.com/blassana280-ux/agentskills) et peut être
> extrait tel quel dans un dépôt dédié (il est autonome : aucune dépendance externe).

> ⚠️ **Cette équipe ne trade pas.** Les agents produisent des analyses, des plans et des avis
> documentés. Aucun ordre n'est envoyé, aucune performance n'est promise. Toute décision
> d'investissement reste humaine. Lire [`docs/limites-et-risques.md`](docs/limites-et-risques.md).

---

## Ce que contient le dépôt

| Élément | Volume | Rôle |
| --- | --- | --- |
| [`agents/`](agents/) | 70 dossiers × 2 fichiers | Un `SKILL.md` conforme spec + un profil de routage `agent.md` par agent |
| [`squads/`](squads/) | 12 fiches | Mission, interfaces, SOP et gates qualité de chaque escouade |
| [`INDEX.md`](INDEX.md) | table complète | Les 70 agents, rôle, niveau, marchés, horizon, liens |
| [`index.json`](index.json) | machine-readable | Roster exploitable par un orchestrateur ou un script |
| [`AGENTS.md`](AGENTS.md) | protocole | Comment un agent IA doit mobiliser cette équipe |
| [`docs/`](docs/) | 4 guides | Orchestration, routage, glossaire, limites et risques |
| [`templates/`](templates/) | 2 modèles | Brief d'agent et contrat de sortie |
| [`scripts/`](scripts/) | 3 scripts | Génération du roster, validation, cohérence |

Chaque agent existe sous deux formats complémentaires :

- **`SKILL.md`** — le format standard, découvert par nom + description, chargé à la demande.
- **`agent.md`** — le profil « réseau d'agents » : identité, pitch, compétences signature,
  SOP, KPI, handoffs et contrat de sortie.

## Les 12 escouades

| # | Escouade | Agents | Lead | Pitch |
| --- | --- | --- | --- | --- |
| S1 | [Commandement](squads/s1-commandement.md) | 4 | Amina Cissé | le cerveau qui priorise, arbitre et rend le réseau lisible |
| S2 | [Macro & Géopolitique](squads/s2-macro.md) | 5 | Helena Voss | le cadre du monde avant le cadre du trade |
| S3 | [Analyse Technique](squads/s3-analyse-technique.md) | 7 | Rafael Santos | lire le prix tel qu'il est, pas tel qu'on l'espère |
| S4 | [Recherche Fondamentale](squads/s4-recherche-fondamentale.md) | 7 | Nadia Haddad | comprendre ce qu'on achète, pas seulement son cours |
| S5 | [Quantitatif & Data](squads/s5-quant.md) | 7 | Arjun Mehta | si ce n'est pas testé, ce n'est pas un signal |
| S6 | [IA & Automatisation](squads/s6-ia.md) | 6 | Nora El Amrani | des modèles utiles, évalués, surveillés — pas des démos |
| S7 | [Risque & Conformité](squads/s7-risque-conformite.md) | 6 | Claire Dubois | la survie d'abord, la performance ensuite |
| S8 | [Exécution & Opérations](squads/s8-execution.md) | 6 | Yannick Kouassi | le meilleur signal est détruit par une mauvaise exécution |
| S9 | [Portefeuille & Allocation](squads/s9-portefeuille.md) | 6 | Laurent Mercier | le portefeuille est plus que la somme des trades |
| S10 | [Actifs Numériques](squads/s10-crypto.md) | 6 | Zoé Leclerc | l'on-chain ne ment pas, mais il bruit |
| S11 | [Produits Dérivés](squads/s11-produits-derives.md) | 5 | Antonio Rossi | la bonne exposition au bon coût |
| S12 | [Infrastructure & Formation](squads/s12-infrastructure-formation.md) | 5 | Brigitte Moreau | une plateforme fiable et une équipe qui comprend ce qu'elle fait |

## Démarrage rapide

### 1. Récupérer le dépôt

```bash
git clone https://github.com/blassana280-ux/agentskills.git
cd agentskills/trading-agents-team
python3 scripts/validate.py     # doit afficher : 70 skills, 0 erreur
```

### 2. Charger l'équipe dans votre agent

Le format Agent Skills est découvert automatiquement dès que les skills sont accessibles :

```bash
# Claude Code / Cursor / OpenCode : copier les skills dans le projet courant
mkdir -p .claude/skills && cp -R agents/* .claude/skills/

# Codex CLI / Gemini CLI / Copilot : pointer vers le dépôt cloné
# puis demander explicitement : « charge le skill agents/nadia-haddad/SKILL.md »
```

Chaque `SKILL.md` est autonome : il contient l'identité, la méthode, les livrables, les garde-fous
et un prompt d'activation prêt à copier.

### 3. Lancer une mission

```text
Applique le protocole AGENTS.md de ce dépôt.
Mission : analyser le potentiel d'une allocation 60/40 actions-obligations dans un
contexte de taux élevés et d'inflation persistante.
Complexité : complexe (escouade 6-8 agents).
```

L'agent lit `AGENTS.md`, classe la demande, mobilise les escouades pertinentes, puis rend
**un seul livrable** avec un rapport d'orchestration.

## Le protocole en 5 étapes

1. **CLASSER** — simple (1 agent), moyenne (1-3), complexe (escouade 4-8).
2. **MOBILISER** — sélection par la matrice de routage ([`docs/routage.md`](docs/routage.md)).
3. **DISPATCHER** — tous les briefs en une seule vague parallèle, jamais séquentielle.
4. **SURVEILLER** — 4 gates : complétude, preuve fraîche, revue adverse, intégration.
5. **ASSEMBLER** — un livrable unique + rapport d'orchestration (agents, désaccords, données manquantes).

## Le contrat de sortie

Tout agent termine son livrable exactement dans ce format :

```text
Statut      : OK | NEEDS WORK
Confiance   : bas / moyen / élevé — justification en une ligne
Données manquantes : liste ou « aucune »
Prochain handoff   : slug de l'agent destinataire ou « aucun »
```

C'est ce contrat qui rend 70 agents utilisables ensemble : chaque sortie est vérifiable et
chaînable sans relire tout le contexte.

## Documentation

| Guide | Contenu |
| --- | --- |
| [`docs/orchestration.md`](docs/orchestration.md) | Protocole complet, gates, 3 missions travaillées de bout en bout |
| [`docs/routage.md`](docs/routage.md) | Matrice de routage par intention + escouades minimales par livrable |
| [`docs/glossaire.md`](docs/glossaire.md) | Vocabulaire de marché et vocabulaire interne du réseau |
| [`docs/limites-et-risques.md`](docs/limites-et-risques.md) | Ce que la team ne fait pas, risques par classe d'actifs, cadre réglementaire |
| [`templates/brief-agent.md`](templates/brief-agent.md) | Modèle de brief d'agent (5 champs obligatoires) |
| [`templates/contrat-sortie.md`](templates/contrat-sortie.md) | Contrat de sortie standard et exemples valides / invalides |

## Exemples de missions

| Mission | Agents mobilisés |
| --- | --- |
| « Faut-il réduire l'exposition actions avant la réunion de la Fed ? » | `helena-voss`, `ibrahima-keita`, `rafael-santos`, `claire-dubois`, `laurent-mercier` |
| « Cette stratégie de momentum tient-elle après coûts ? » | `arjun-mehta`, `hugo-lefevre`, `elena-petrova`, `theo-martin` |
| « Un ETF Bitcoin spot est-il le bon véhicule pour 3 % du portefeuille ? » | `sarah-cohen`, `zoe-leclerc`, `ravi-patel`, `clara-jensen`, `claire-dubois` |
| « Comment exécuter 250 M FCFA d'achat sans casser le prix ? » | `yannick-kouassi`, `benjamin-roche`, `theo-martin`, `priya-nair` |
| « Notre modèle ML de volatilité doit-il passer en production ? » | `malik-ndiaye`, `ines-da-silva`, `erik-lindqvist`, `claire-dubois` |

Détails et briefs complets dans [`docs/orchestration.md`](docs/orchestration.md).

## Garde-fous communs

Chaque agent applique quatre règles non négociables, en plus de ses garde-fous propres :

1. **Aucune exécution d'ordre réelle** — les intentions de trade sont des livrables soumis à validation humaine.
2. **Aucun chiffre sans source ni date** — sinon la mention « DONNÉE MANQUANTE ».
3. **Fait / hypothèse / opinion séparés**, avec niveau de confiance justifié.
4. **Aucun conseil en investissement personnalisé, aucune promesse de rendement.**

## Qualité et validation

```bash
python3 scripts/build_agents.py     # régénère agents/, INDEX.md, index.json, tableaux d'escouades
python3 scripts/validate.py         # 70 skills + cohérence index/handoffs/escouades
skills-ref validate agents/amina-cisse   # validation croisée avec l'implémentation de référence
```

La CI (`.github/workflows/validate.yml`) exécute ces contrôles à chaque push et vérifie
également chaque skill avec l'implémentation de référence `skills-ref`.

## Ajouter ou modifier un agent

1. Éditer la fiche dans `scripts/roster_a.py` ou `scripts/roster_b.py`.
2. Lancer `python3 scripts/build_agents.py`.
3. Lancer `python3 scripts/validate.py` puis commiter les fichiers générés.

Le roster est la source de vérité : les 70 dossiers, `INDEX.md`, `index.json` et les tableaux
d'escouades en sont dérivés.

## Licence et crédits

Code et contenu sous licence [MIT](LICENSE). Format Agent Skills selon la
[spécification agentskills.io](https://agentskills.io/specification) — voir aussi
[`AGENTS.md`](AGENTS.md) pour le protocole de routage et [`CONTRIBUTING.md`](CONTRIBUTING.md).

Conçu et maintenu par [@blassana280-ux](https://github.com/blassana280-ux).
