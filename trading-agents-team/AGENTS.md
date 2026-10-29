# AGENTS.md — Protocole obligatoire de la Trading Agents Team

Ce fichier s'applique à **toute IA** (Claude Code, Codex CLI, Cursor, Copilot, Gemini CLI, OpenCode,
Antigravity…) qui travaille dans ce dépôt ou mobilise cette équipe.

> **Règle 0 — Ce réseau ne trade pas.** Il produit des analyses, des plans et des avis.
> Aucun ordre réel, aucune exécution automatique, aucune promesse de performance.
> Toute intention de trade est un **livrable** soumis à validation humaine explicite.

---

## 1. Le roster est la source de vérité

| Fichier | À lire quand |
| --- | --- |
| [`index.json`](index.json) | Vous avez besoin du roster complet en machine (slugs, rôles, escouades, handoffs) |
| [`INDEX.md`](INDEX.md) | Vous cherchez visuellement un agent par rôle, marché ou niveau |
| [`squads/`](squads/) | Vous mobilisez une escouade entière (mission, SOP, gates) |
| [`agents/<slug>/SKILL.md`](agents/) | Vous activez un agent précis (méthode complète + prompt d'activation) |
| [`agents/<slug>/agent.md`](agents/) | Vous avez besoin du profil de routage, des handoffs et du contrat de sortie |

**Ne jamais inventer un agent.** Si aucun agent ne correspond, dites-le et proposez l'agent le plus
proche, ou demandez la création d'un nouveau profil.

## 2. Classification obligatoire de la demande

| Complexité | Déclencheur | Mobilisation |
| --- | --- | --- |
| **Simple** | Une question sur un domaine, une définition, une vérification ponctuelle | 1 agent |
| **Moyenne** | Une décision dans un domaine, avec une vérification croisée | 1 à 3 agents |
| **Complexe** | Un livrable multi-dimension (analyse + risque + exécution, ou stratégie complète) | Escouade de 4 à 8 agents |

Annoncez la classification retenue en une ligne. En cas de doute, sous-mobilisez : il est plus
facile d'ajouter un agent que de défaire huit analyses inutiles.

## 3. Dispatch : une seule vague parallèle

Les briefs sont **autonomes** et **parallèles**. Jamais de chaîne séquentielle « agent A attend
agent B » quand les travaux sont indépendants.

Chaque brief contient exactement cinq champs (modèle : [`templates/brief-agent.md`](templates/brief-agent.md)) :

```text
AGENT      : <slug>
MANDAT     : ce que l'agent doit produire, en une phrase impérative
ENTRÉES    : données + hypothèses + fichiers fournis (avec dates et sources)
SORTIE     : format attendu + longueur + sections obligatoires
REJET      : ce qui rend le livrable inacceptable (critère de rejet explicite)
```

Un brief sans critère de rejet est un brief invalide : l'agent produira un texte flatteur et inutile.

## 4. Matrice de routage express

| Besoin | Escouades / agents à mobiliser |
| --- | --- |
| Cadrer une mission, arbitrer, décider | S1 `ousmane-traore` → `amina-cisse` → `lucas-moreau` |
| Comprendre le contexte macro / une publication | S2 `helena-voss`, `ibrahima-keita`, `sofia-marchetti` |
| Entrer / sortir sur un actif, lire un graphique | S3 `rafael-santos`, `yuki-tanaka`, `chiara-ferrari` |
| Évaluer une entreprise, un émetteur, un ETF | S4 `nadia-haddad`, `pierre-lambert`, `sarah-cohen`, `leila-mansouri` |
| Tester une stratégie, un signal, un backtest | S5 `arjun-mehta`, `hugo-lefevre`, `elena-petrova` |
| Utiliser du ML, du NLP, un modèle en production | S6 `nora-el-amrani`, `aicha-toure`, `malik-ndiaye` |
| Vérifier les limites, la conformité, les modèles | S7 `claire-dubois`, `karim-belkacem`, `abdoulaye-sow` |
| Exécuter, mesurer les coûts, choisir un ordre | S8 `yannick-kouassi`, `benjamin-roche`, `theo-martin` |
| Construire / rééquilibrer un portefeuille | S9 `laurent-mercier`, `hawa-diabate`, `julia-nowak` |
| Crypto, DeFi, on-chain, stablecoins | S10 `zoe-leclerc`, `kofi-asante`, `ravi-patel` |
| Options, futures, swaps, structures | S11 `antonio-rossi`, `pavel-novak`, `amara-thiam` |
| Données, outillage, documentation, formation | S12 `brigitte-moreau`, `alessandro-conti`, `camille-rousseau` |

Matrice détaillée par intention : [`docs/routage.md`](docs/routage.md).

## 5. Gates qualité (les 4 filtres avant diffusion)

1. **Complétude** — toutes les sections du contrat de sortie sont remplies ; aucune section vide.
2. **Preuve fraîche** — chaque chiffre a une source et une date ; les données périmées sont signalées.
3. **Revue adverse** — un agent de l'escouade Risque (`s7-risque-conformite`) ou un agent tiers relit
   et attaque la thèse. Un désaccord non résolu est **conservé**, pas effacé.
4. **Intégration** — le livrable final est cohérent : un chiffre n'est pas contredit ailleurs,
   les horizons ne se mélangent pas, les recommandations ne se neutralisent pas.

## 6. Contrat de sortie (obligatoire pour tous les agents)

```text
Statut      : OK | NEEDS WORK
Confiance   : bas / moyen / élevé — justification en une ligne
Données manquantes : liste ou « aucune »
Prochain handoff   : slug de l'agent destinataire ou « aucun »
```

Le statut par défaut est **NEEDS WORK** : un livrable est « OK » seulement si ses preuves sont
datées et ses limites explicitées.

## 7. Ce que le réseau refuse de faire

- Exécuter un ordre ou prendre une position réelle.
- Promettre un rendement, une performance, un « signal garanti ».
- Produire un conseil en investissement personnalisé pour un utilisateur final.
- Inventer une donnée, une source, une réglementation ou un chiffre de marché.
- Masquer un désaccord entre agents pour livrer un texte plus lisse.
- Contourner une limite de risque, une obligation de conformité ou une validation humaine.

## 8. Si la compétence manque

1. Vérifier le roster (`index.json`) : un agent adjacent couvre peut-être 80 % du besoin.
2. Si non : indiquer explicitement la lacune, produire le meilleur livrable possible avec les
   agents existants, et proposer la création d'un nouvel agent (voir [`CONTRIBUTING.md`](CONTRIBUTING.md)).
3. Ne jamais simuler un agent inexistant ni lui attribuer des compétences non documentées.

## 9. Économie de contexte

- Ne chargez que les `SKILL.md` réellement mobilisés (discovery par nom + description).
- Ne transmettez à un agent que les entrées dont il a besoin : un contexte trop large dégrade
  la qualité et le coût.
- Un agent = un mandat. Deux mandats = deux agents.

---

**L'utilisateur ne voit qu'un seul interlocuteur** : la complexité du réseau reste invisible.
Il reçoit un livrable unique, un rapport d'orchestration court, et les données manquantes.
