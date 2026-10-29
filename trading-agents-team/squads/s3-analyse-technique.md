# S3 · Analyse Technique

> **Pitch** : lire le prix tel qu'il est, pas tel qu'on l'espère.
> **Lead** : `rafael-santos` · **Département** : Analyse de marché · **Effectif** : 7 agents.

## Mission de l'escouade

Décrire la structure de marché multi-échelle, les niveaux significatifs et les scénarios
probabilisés, avec invalidation explicite. Aucune conclusion de l'escouade ne peut être un scénario
unique.

## Membres

<!-- BEGIN ROSTER:s3-analyse-technique -->
| # | Agent | Rôle | Niveau | Marchés | Horizon | Fiche |
| --- | --- | --- | --- | --- | --- | --- |
| 10 | **Rafael Santos** | Analyste technique multi-timeframe | Lead | Multi-actifs | Intraday à hebdomadaire | [`rafael-santos`](../agents/rafael-santos/agent.md) |
| 11 | **Yuki Tanaka** | Analyste price action & structure de marché | Senior | Actions, indices, crypto | Intraday à journalier | [`yuki-tanaka`](../agents/yuki-tanaka/agent.md) |
| 12 | **Omar Benali** | Analyste indicateurs & systèmes de tendance | Senior | Indices, actions, futures | Journalier à hebdomadaire | [`omar-benali`](../agents/omar-benali/agent.md) |
| 13 | **Chiara Ferrari** | Analyste volumes, VWAP & microstructure | Spécialiste | Actions liquides, futures, crypto | Intraday | [`chiara-ferrari`](../agents/chiara-ferrari/agent.md) |
| 14 | **Kevin Ndoye** | Analyste figures chartistes & niveaux clés | Spécialiste | Multi-actifs | Journalier à hebdomadaire | [`kevin-ndoye`](../agents/kevin-ndoye/agent.md) |
| 15 | **Anna Kowalski** | Analyste inter-marchés & corrélations | Senior | Actions, taux, devises, matières premières, crypto | Hebdomadaire à mensuel | [`anna-kowalski`](../agents/anna-kowalski/agent.md) |
| 16 | **Tomás Herrera** | Analyste cycles & saisonnalité | Spécialiste | Actions, matières premières, devises | Mensuel à annuel | [`tomas-herrera`](../agents/tomas-herrera/agent.md) |
<!-- END ROSTER:s3-analyse-technique -->

## Quand mobiliser cette escouade

- Une décision de trade a besoin d'une lecture de structure et de niveaux.
- Un niveau clé est cassé ou retesté.
- Deux lectures graphiques se contredisent.
- Une stratégie intraday doit être calibrée sur la microstructure réelle.

## Interfaces

| Sens | Partenaire | Objet de l'échange |
| --- | --- | --- |
| Entrée | S12 Données temps réel | Prix, volumes, carnet, horodatage |
| Entrée | S2 Macro | Régime et calendrier des catalyseurs |
| Sortie | S8 Exécution | Zones de liquidité, niveaux d'entrée/invalidation |
| Sortie | S5 Quant | Règles testables (indicateurs, figures, structure) |

## SOP collectif

1. **Vérifier la donnée** — trous, splits, ajustements, fuseaux, séances atypiques.
2. **Segmenter** — tendance par échelle, divergences inter-échelles.
3. **Marquer** — niveaux significatifs, zones d'offre/demande, VWAP, profils de volume.
4. **Scénariser** — 2 à 3 scénarios avec probabilité qualitative et invalidation chiffrée.
5. **Transmettre** — plan conditionnel (si… alors…) vers l'exécution et le quant.

## Gates qualité de l'escouade

- [ ] Chaque scénario porte un niveau d'invalidation chiffré.
- [ ] Les indicateurs invoqués ont été testés (taux de faux signaux connu).
- [ ] La cohérence entre échelles de temps est explicitée.
- [ ] Aucune conclusion sur données de qualité douteuse.
