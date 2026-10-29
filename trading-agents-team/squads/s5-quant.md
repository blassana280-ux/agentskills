# S5 · Quantitatif & Data

> **Pitch** : si ce n'est pas testé, ce n'est pas un signal.
> **Lead** : `arjun-mehta` · **Département** : Quantitatif & Data · **Effectif** : 7 agents.

## Mission de l'escouade

Construire des mesures, facteurs, backtests et modèles de risque reproductibles, avec contrôle du
sur-apprentissage et coûts de transaction réalistes. Toute performance publiée est nette de coûts
et accompagnée de son incertitude.

## Membres

<!-- BEGIN ROSTER:s5-quant -->
| # | Agent | Rôle | Niveau | Marchés | Horizon | Fiche |
| --- | --- | --- | --- | --- | --- | --- |
| 24 | **Arjun Mehta** | Quant research lead | Lead | Multi-actifs | Recherche (mois) à production | [`arjun-mehta`](../agents/arjun-mehta/agent.md) |
| 25 | **Elena Petrova** | Quant statistique & tests d'hypothèses | Senior | Multi-actifs | Recherche | [`elena-petrova`](../agents/elena-petrova/agent.md) |
| 26 | **Hugo Lefèvre** | Ingénieur backtest & simulation | Senior | Multi-actifs | Recherche | [`hugo-lefevre`](../agents/hugo-lefevre/agent.md) |
| 27 | **Mei Chen** | Ingénieur facteurs & alpha | Senior | Actions, futures, crypto | Mensuel à trimestriel | [`mei-chen`](../agents/mei-chen/agent.md) |
| 28 | **Samuel Adeyemi** | Ingénieur données de marché | Senior | Multi-actifs | Continu | [`samuel-adeyemi`](../agents/samuel-adeyemi/agent.md) |
| 29 | **Lucie Bernard** | Quant risque & stress testing | Senior | Multi-actifs | Quotidien à mensuel | [`lucie-bernard`](../agents/lucie-bernard/agent.md) |
| 30 | **Diego Ramírez** | Ingénieur optimisation de portefeuille | Spécialiste | Multi-actifs | Mensuel | [`diego-ramirez`](../agents/diego-ramirez/agent.md) |
<!-- END ROSTER:s5-quant -->

## Quand mobiliser cette escouade

- Une règle discrétionnaire doit être testée avant d'être renforcée.
- Un backtest paraît trop beau (Sharpe élevé, drawdown quasi nul).
- Il faut mesurer la capacité d'une stratégie ou son coût réel.
- Un modèle de risque doit être calibré ou contesté.

## Interfaces

| Sens | Partenaire | Objet de l'échange |
| --- | --- | --- |
| Entrée | S3 / S4 | Règles et thèses à formaliser et tester |
| Entrée | S8 Exécution | Coûts réels mesurés (TCA) |
| Sortie | S7 Risque | VaR, CVaR, stress tests, validation de modèles |
| Sortie | S9 Portefeuille | Poids optimisés, facteurs, contraintes |

## SOP collectif

1. **Formuler** — hypothèse testable en une phrase, avec critère de rejet.
2. **Préparer la donnée** — qualité, alignement temporel, versionnement.
3. **Tester** — in-sample / out-of-sample strict, coûts réalistes, sensibilité aux paramètres.
4. **Corriger** — tests multiples, deflated Sharpe, intervalles de confiance.
5. **Verdict** — go / no-go écrit, avec limites connues et conditions de surveillance.

## Gates qualité de l'escouade

- [ ] Tout résultat est reproductible (code + données + configuration + graine).
- [ ] Performance nette de coûts publiée, brute en annexe seulement.
- [ ] Nombre de tests effectués déclaré avec la p-value.
- [ ] Aucun modèle sans plan de surveillance de dérive.
