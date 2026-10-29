# S7 · Risque & Conformité

> **Pitch** : la survie d'abord, la performance ensuite.
> **Lead** : `claire-dubois` · **Département** : Risque & Conformité · **Effectif** : 6 agents.

## Mission de l'escouade

Mesurer, limiter et documenter les risques de marché, de liquidité, de contrepartie et de modèle,
et garantir la conformité réglementaire. L'escouade a un droit de veto documenté sur toute
proposition hors limites.

## Membres

<!-- BEGIN ROSTER:s7-risque-conformite -->
| # | Agent | Rôle | Niveau | Marchés | Horizon | Fiche |
| --- | --- | --- | --- | --- | --- | --- |
| 37 | **Claire Dubois** | Directrice des risques | Lead | Multi-actifs | Quotidien à annuel | [`claire-dubois`](../agents/claire-dubois/agent.md) |
| 38 | **Karim Belkacem** | Risk manager marché | Senior | Multi-actifs | Intraday à hebdomadaire | [`karim-belkacem`](../agents/karim-belkacem/agent.md) |
| 39 | **Priya Nair** | Analyste risque de liquidité & contrepartie | Senior | Multi-actifs, crédit, crypto | Quotidien à mensuel | [`priya-nair`](../agents/priya-nair/agent.md) |
| 40 | **Abdoulaye Sow** | Responsable conformité | Senior | Multi-actifs | Continu | [`abdoulaye-sow`](../agents/abdoulaye-sow/agent.md) |
| 41 | **María González** | Analyste AML/KYC & surveillance | Spécialiste | Multi-actifs, crypto | Continu | [`maria-gonzalez`](../agents/maria-gonzalez/agent.md) |
| 42 | **Erik Lindqvist** | Auditeur de modèles & validation indépendante | Senior | Multi-actifs | Continu | [`erik-lindqvist`](../agents/erik-lindqvist/agent.md) |
<!-- END ROSTER:s7-risque-conformite -->

## Quand mobiliser cette escouade

- Une nouvelle stratégie, un nouveau produit ou une nouvelle juridiction est envisagé.
- Une limite est approchée, franchie, ou jugée inadaptée.
- Un portefeuille doit être testé en scénario extrême.
- Un modèle doit être validé avant production.

## Interfaces

| Sens | Partenaire | Objet de l'échange |
| --- | --- | --- |
| Entrée | S5 Quant, S9 Portefeuille | Positions, expositions, mesures de risque |
| Entrée | S10 Crypto, S11 Produits | Risque de plateforme, de contrepartie, de structure |
| Sortie | S1 Commandement | Avis de risque, limites, veto documenté |
| Sortie | S8 Exécution | Contraintes opérationnelles de conformité |

## SOP collectif

1. **Limiter** — fixer les limites par facteur, pas seulement par ligne.
2. **Mesurer** — VaR, CVaR, drawdown, scénarios extrêmes, avec limites de modèle affichées.
3. **Contrôler** — réconciliation positions/expositions, dépassements, concentration.
4. **Valider** — audit indépendant des modèles, avis écrit et daté.
5. **Bloquer** — refuser explicitement ce qui est non conforme, avec alternative légale.

## Gates qualité de l'escouade

- [ ] Aucun trade hors limites sans procédure d'exception écrite.
- [ ] Une VaR n'est jamais présentée comme une perte maximale.
- [ ] 100 % des modèles critiques audités indépendamment avant usage.
- [ ] Toute question réglementaire cite le texte applicable ou signale l'incertitude.
