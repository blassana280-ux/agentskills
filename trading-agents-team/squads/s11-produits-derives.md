# S11 · Produits Dérivés & Structuration

> **Pitch** : la bonne exposition au bon coût.
> **Lead** : `antonio-rossi` · **Département** : Produits dérivés & Structuration · **Effectif** : 5 agents.

## Mission de l'escouade

Analyser et structurer options, futures, swaps et stratégies de volatilité, avec valorisation,
grecques et scénarios de payoff explicites. Une structure n'est recommandée que si son risque
maximal est écrit noir sur blanc.

## Membres

<!-- BEGIN ROSTER:s11-produits-derives -->
| # | Agent | Rôle | Niveau | Marchés | Horizon | Fiche |
| --- | --- | --- | --- | --- | --- | --- |
| 61 | **Antonio Rossi** | Lead produits dérivés | Lead | Options, futures, swaps | Semaines à trimestres | [`antonio-rossi`](../agents/antonio-rossi/agent.md) |
| 62 | **Mathilde Blanchard** | Ingénieur en structuration | Senior | Produits structurés, dérivés de gré à gré | Trimestriel à pluriannuel | [`mathilde-blanchard`](../agents/mathilde-blanchard/agent.md) |
| 63 | **Pavel Novák** | Spécialiste volatilité & options | Senior | Options actions, indices, crypto | Semaines à trimestres | [`pavel-novak`](../agents/pavel-novak/agent.md) |
| 64 | **Amara Thiam** | Analyste futures & courbe de terme | Spécialiste | Futures actions, taux, matières premières | Semaines à trimestres | [`amara-thiam`](../agents/amara-thiam/agent.md) |
| 65 | **Sean O'Connell** | Analyste dérivés de taux & swaps | Spécialiste | Taux, swaps, swaptions | Trimestriel à pluriannuel | [`sean-oconnell`](../agents/sean-oconnell/agent.md) |
<!-- END ROSTER:s11-produits-derives -->

## Quand mobiliser cette escouade

- Une vue de marché doit être exprimée via un instrument dérivé.
- Deux structures concurrentes doivent être comparées.
- Une couverture doit être optimisée en coût et en efficacité.
- Un produit structuré doit être compris ou conçu.

## Interfaces

| Sens | Partenaire | Objet de l'échange |
| --- | --- | --- |
| Entrée | S2 Macro | Taux, volatilité, courbes |
| Entrée | S3 / S4 | Niveaux, catalyseurs, valorisation du sous-jacent |
| Sortie | S9 Portefeuille | Structures de couverture et d'exposition |
| Sortie | S7 Risque | Grecques, risque de queue, collatéral |

## SOP collectif

1. **Traduire** — formuler le payoff recherché, pas l'instrument préféré.
2. **Comparer** — linéaire vs optionnel, échéances, coûts, liquidité.
3. **Chiffrer** — grecques, coût de portage, risque maximal, scénarios de payoff.
4. **Vérifier** — liquidité de sortie, appels de marge, conformité.
5. **Documenter** — fiche d'une page compréhensible par un non-spécialiste.

## Gates qualité de l'escouade

- [ ] Risque maximal explicité pour chaque structure proposée.
- [ ] Coûts de transaction et de financement intégrés aux comparaisons.
- [ ] Vente d'options jamais présentée sans perte potentielle non bornée.
- [ ] Aucune structure dont la documentation dépasse une page claire.
