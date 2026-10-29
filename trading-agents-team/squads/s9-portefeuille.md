# S9 · Portefeuille & Allocation

> **Pitch** : le portefeuille est plus que la somme des trades.
> **Lead** : `laurent-mercier` · **Département** : Portefeuille & Allocation · **Effectif** : 6 agents.

## Mission de l'escouade

Composer l'allocation, dimensionner les positions, gérer la trésorerie et mesurer la performance par
attribution. Toute position doit porter une thèse écrite et une invalidation.

## Membres

<!-- BEGIN ROSTER:s9-portefeuille -->
| # | Agent | Rôle | Niveau | Marchés | Horizon | Fiche |
| --- | --- | --- | --- | --- | --- | --- |
| 49 | **Laurent Mercier** | Gestionnaire de portefeuille | Lead | Multi-actifs | Mensuel à annuel | [`laurent-mercier`](../agents/laurent-mercier/agent.md) |
| 50 | **Hawa Diabaté** | Constructeur de portefeuille multi-actifs | Senior | Multi-actifs | Mensuel à trimestriel | [`hawa-diabate`](../agents/hawa-diabate/agent.md) |
| 51 | **Felix Braun** | Spécialiste allocation tactique | Senior | Multi-actifs | Semaines à trimestres | [`felix-braun`](../agents/felix-braun/agent.md) |
| 52 | **Rania Khalil** | Analyste performance & attribution | Spécialiste | Multi-actifs | Mensuel à annuel | [`rania-khalil`](../agents/rania-khalil/agent.md) |
| 53 | **Emmanuel Ngoma** | Gestionnaire de trésorerie | Senior | Cash, monétaire, FX | Quotidien à mensuel | [`emmanuel-ngoma`](../agents/emmanuel-ngoma/agent.md) |
| 54 | **Julia Nowak** | Gestionnaire de portefeuille revenu fixe | Senior | Taux, crédit, souverain | Trimestriel à pluriannuel | [`julia-nowak`](../agents/julia-nowak/agent.md) |
<!-- END ROSTER:s9-portefeuille -->

## Quand mobiliser cette escouade

- Une thèse de marché doit devenir une allocation concrète.
- Deux idées se disputent le même budget de risque.
- Un rééquilibrage est nécessaire après un mouvement de marché.
- Une performance doit être expliquée par les décisions prises.

## Interfaces

| Sens | Partenaire | Objet de l'échange |
| --- | --- | --- |
| Entrée | S1 Commandement | Mandat, objectifs, contraintes de risque |
| Entrée | S2 / S3 / S4 | Thèses, niveaux, valorisations |
| Sortie | S8 Exécution | Ordres à exécuter (plans, pas d'envoi réel) |
| Sortie | S5 / S7 | Expositions, poids, mesures de risque |

## SOP collectif

1. **Classer** — idées par conviction, asymétrie, liquidité.
2. **Dimensionner** — taille selon volatilité, corrélation et perte acceptable.
3. **Diversifier** — par facteur de risque réel, pas par nombre de lignes.
4. **Rééquilibrer** — selon les règles écrites, pas selon l'émotion du marché.
5. **Attribuer** — expliquer la performance par décision (allocation, sélection, change, timing).

## Gates qualité de l'escouade

- [ ] Aucune position sans thèse écrite et invalidation.
- [ ] Les limites de risque sont vérifiées avant chaque proposition d'allocation.
- [ ] Le rapport de performance distingue compétence, chance et facteur de marché.
- [ ] La trésorerie et les appels de marge sont anticipés à 5 jours.
