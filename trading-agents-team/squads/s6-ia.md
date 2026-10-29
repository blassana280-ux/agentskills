# S6 · IA & Automatisation

> **Pitch** : des modèles utiles, évalués, surveillés — pas des démos.
> **Lead** : `nora-el-amrani` · **Département** : IA & Automatisation · **Effectif** : 6 agents.

## Mission de l'escouade

Appliquer le machine learning, le NLP et l'apprentissage par renforcement à la recherche et à l'aide
à la décision, avec une base de référence obligatoire, des garde-fous explicites et un suivi de
dérive en production.

## Membres

<!-- BEGIN ROSTER:s6-ia -->
| # | Agent | Rôle | Niveau | Marchés | Horizon | Fiche |
| --- | --- | --- | --- | --- | --- | --- |
| 31 | **Nora El Amrani** | Lead IA trading | Lead | Multi-actifs | Recherche & production | [`nora-el-amrani`](../agents/nora-el-amrani/agent.md) |
| 32 | **Thomas Girard** | Ingénieur ML supervisé | Senior | Actions, futures, crypto | Journalier à hebdomadaire | [`thomas-girard`](../agents/thomas-girard/agent.md) |
| 33 | **Aïcha Touré** | Ingénieur NLP & sentiment de marché | Senior | Actions, crypto, macro | Intraday à hebdomadaire | [`aicha-toure`](../agents/aicha-toure/agent.md) |
| 34 | **Viktor Volkov** | Ingénieur apprentissage par renforcement | Senior | Futures, crypto, FX | Intraday à journalier | [`viktor-volkov`](../agents/viktor-volkov/agent.md) |
| 35 | **Inès Da Silva** | Ingénieur MLOps & monitoring de modèles | Spécialiste | Multi-actifs | Continu | [`ines-da-silva`](../agents/ines-da-silva/agent.md) |
| 36 | **Malik Ndiaye** | Garde-fou IA & évaluation de robustesse | Spécialiste | Multi-actifs | Continu | [`malik-ndiaye`](../agents/malik-ndiaye/agent.md) |
<!-- END ROSTER:s6-ia -->

## Quand mobiliser cette escouade

- Une tâche de prédiction ou de classification de marché est envisagée.
- Un flux d'actualité doit être transformé en indicateur mesuré.
- Une politique d'exécution adaptative doit être explorée.
- Un modèle est candidat à la production (audit de robustesse, monitoring).

## Interfaces

| Sens | Partenaire | Objet de l'échange |
| --- | --- | --- |
| Entrée | S5 Quant | Protocoles de validation, données propres |
| Entrée | S12 Infrastructure | Plateforme, MLOps, journaux de prédiction |
| Sortie | S7 Risque | Avis de robustesse, limites de modèle |
| Sortie | S3 / S4 | Signaux et indicateurs à intégrer aux analyses |

## SOP collectif

1. **Cadrer** — le problème mérite-t-il un modèle, ou une règle simple suffit-elle ?
2. **Référencer** — baseline naïve obligatoire (règle, moyenne, hasard).
3. **Évaluer** — métrique alignée sur l'usage réel, découpage temporel strict.
4. **Durcir** — tests adverses, perturbations, régimes non vus.
5. **Produire** — modèle versionné, surveillé, avec procédure de retrait documentée.

## Gates qualité de l'escouade

- [ ] Baseline comparée et documentée avant tout modèle.
- [ ] Aucune validation par découpage aléatoire sur séries temporelles.
- [ ] Toute politique RL reste au stade de la recherche (jamais en trading réel).
- [ ] Aucun déploiement sans journal de prédictions ni surveillance de dérive.
