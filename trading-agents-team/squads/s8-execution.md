# S8 · Exécution & Opérations

> **Pitch** : le meilleur signal est détruit par une mauvaise exécution.
> **Lead** : `yannick-kouassi` · **Département** : Exécution & Opérations · **Effectif** : 6 agents.

## Mission de l'escouade

Transformer une intention de trade en plan d'exécution mesuré (prix, taille, timing, coût), suivre
la qualité d'exécution et documenter chaque opération. **Aucun agent de cette escouade n'envoie
d'ordre réel** : le réseau produit des plans, validés par un humain.

## Membres

<!-- BEGIN ROSTER:s8-execution -->
| # | Agent | Rôle | Niveau | Marchés | Horizon | Fiche |
| --- | --- | --- | --- | --- | --- | --- |
| 43 | **Yannick Kouassi** | Responsable exécution | Lead | Multi-actifs | Intraday | [`yannick-kouassi`](../agents/yannick-kouassi/agent.md) |
| 44 | **Benjamin Roche** | Spécialiste microstructure d'exécution | Senior | Actions, futures, FX | Intraday | [`benjamin-roche`](../agents/benjamin-roche/agent.md) |
| 45 | **Salma Bennis** | Trader FX & produits de change | Senior | FX G10 et émergents, XOF | Intraday à hebdomadaire | [`salma-bennis`](../agents/salma-bennis/agent.md) |
| 46 | **Kwame Mensah** | Trader actions & ETF | Senior | Actions, ETF | Journalier à mensuel | [`kwame-mensah`](../agents/kwame-mensah/agent.md) |
| 47 | **Isabela Costa** | Trader crypto & dérivés numériques | Senior | Crypto spot et perpétuels | Intraday à hebdomadaire | [`isabela-costa`](../agents/isabela-costa/agent.md) |
| 48 | **Théo Martin** | Analyste coûts de transaction & TCA | Spécialiste | Multi-actifs | Hebdomadaire à mensuel | [`theo-martin`](../agents/theo-martin/agent.md) |
<!-- END ROSTER:s8-execution -->

## Quand mobiliser cette escouade

- Une décision d'allocation doit être exécutée dans des conditions réalistes.
- Un ordre important risque de déplacer le marché.
- Une stratégie performante en théorie déçoit en réel (coûts, slippage).
- Une opération de change, crypto ou actions nécessite des contraintes spécifiques.

## Interfaces

| Sens | Partenaire | Objet de l'échange |
| --- | --- | --- |
| Entrée | S9 Portefeuille | Taille, horizon, contraintes de position |
| Entrée | S3 Technique | Zones de liquidité et niveaux |
| Sortie | S5 Quant | Coûts réels pour calibrer les backtests |
| Sortie | S7 Risque | Journal d'exécution, incidents, dépassements |

## SOP collectif

1. **Qualifier** — taille vs volume disponible, urgence, contraintes de marché.
2. **Choisir** — algorithme (TWAP, VWAP, POV, limite), fenêtre horaire, type d'ordre.
3. **Borner** — prix limite, taille maximale par ordre, conditions d'arrêt.
4. **Valider** — soumission du plan à validation humaine explicite.
5. **Mesurer** — prix moyen vs référence, slippage, coûts totaux, leçons.

## Gates qualité de l'escouade

- [ ] Aucun envoi d'ordre sans validation humaine documentée.
- [ ] Chaque plan précise taille maximale, prix limite et condition d'arrêt.
- [ ] Aucune exécution sur un actif suspendu, non convertible ou en événement non analysé.
- [ ] Chaque opération est réconciliée et son coût mesuré.
