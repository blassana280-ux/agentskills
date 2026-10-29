# Matrice de routage — qui mobiliser, dans quel ordre

Ce document répond à une seule question : **« pour ce besoin, je prends quels agents ? »**
Il complète [`AGENTS.md`](../AGENTS.md) et le roster [`../index.json`](../index.json).

## Règle d'or

On route par **intention**, pas par spécialité. L'utilisateur dit « je veux acheter de l'or » ;
la team entend trois intentions distinctes : lecture macro (taux réels), valorisation du sous-jacent
(offre/demande, courbe de terme) et exécution (liquidité, portage). Un besoin = 1 à 8 agents,
jamais « tout le monde ».

---

## 1. Routage par intention

### Cadrer et décider

| Intention | Agents | Escouade |
| --- | --- | --- |
| Transformer une demande floue en mission | `ousmane-traore` | S1 |
| Fixer objectifs, limites, univers, critères d'arrêt | `amina-cisse` | S1 |
| Choisir une direction de marché générale | `lucas-moreau` | S1 |
| Tracer les décisions et relire la cohérence | `fatou-diallo` | S1 |

### Comprendre le contexte

| Intention | Agents | Escouade |
| --- | --- | --- |
| Cadre macro complet, régime, catalyseurs | `helena-voss` | S2 |
| Anticiper / décoder une banque centrale | `ibrahima-keita` | S2 |
| Inflation, taux réels, duration | `sofia-marchetti` | S2 |
| Vue sur une devise, risque de change, XOF | `daniel-okonkwo` | S2 |
| Choc géopolitique, chaîne d'approvisionnement | `mei-lin-zhao` | S2 |

### Lire le marché et les instruments

| Intention | Agents | Escouade |
| --- | --- | --- |
| Structure multi-échelle, niveaux, scénarios | `rafael-santos` | S3 |
| Price action, cassures, zones de liquidité | `yuki-tanaka` | S3 |
| Tester un indicateur avant de l'utiliser | `omar-benali` | S3 |
| Volume, VWAP, agression, intraday | `chiara-ferrari` | S3 |
| Figures chartistes et cibles objectives | `kevin-ndoye` | S3 |
| Corrélations, diversification réelle, stress | `anna-kowalski` | S3 |
| Saisonnalité et cycles (testés) | `tomas-herrera` | S3 |

### Évaluer la valeur

| Intention | Agents | Escouade |
| --- | --- | --- |
| Thèse d'investissement sur une entreprise | `nadia-haddad` | S4 |
| Prix cible, DCF, multiples | `pierre-lambert` | S4 |
| Résultats trimestriels, événements corporate | `grace-mwangi` | S4 |
| Dynamique sectorielle, chaîne de valeur | `jonas-berg` | S4 |
| Crédit, spreads, risque de défaut | `leila-mansouri` | S4 |
| Matières premières, courbe de terme physique | `victor-almeida` | S4 |
| Choisir un ETF, frais, tracking, flux | `sarah-cohen` | S4 |

### Tester et modéliser

| Intention | Agents | Escouade |
| --- | --- | --- |
| Valider une stratégie, go/no-go | `arjun-mehta` | S5 |
| Significativité, tests multiples, incertitude | `elena-petrova` | S5 |
| Backtest réaliste, coûts, capacité | `hugo-lefevre` | S5 |
| Facteurs, alpha, combinaison de signaux | `mei-chen` | S5 |
| Qualité et anomalies de données | `samuel-adeyemi` | S5 |
| VaR, CVaR, stress tests | `lucie-bernard` | S5 |
| Poids optimisés sous contraintes | `diego-ramirez` | S5 |

### Utiliser l'IA sans se brûler

| Intention | Agents | Escouade |
| --- | --- | --- |
| Cadrer un cas d'usage IA, baseline | `nora-el-amrani` | S6 |
| Modèle supervisé (direction, volatilité) | `thomas-girard` | S6 |
| Sentiment, NLP, résumé d'actualité | `aicha-toure` | S6 |
| Policy RL d'exécution (recherche) | `viktor-volkov` | S6 |
| Déploiement, monitoring, dérive | `ines-da-silva` | S6 |
| Robustesse, biais, avis indépendant | `malik-ndiaye` | S6 |

### Maîtriser le risque et la conformité

| Intention | Agents | Escouade |
| --- | --- | --- |
| Politique de risque, limites, veto | `claire-dubois` | S7 |
| Exposition par facteur, grecques, PnL | `karim-belkacem` | S7 |
| Liquidité, délai de sortie, contrepartie | `priya-nair` | S7 |
| Conformité, juridictions, obligations | `abdoulaye-sow` | S7 |
| AML/KYC, surveillance des opérations | `maria-gonzalez` | S7 |
| Audit indépendant d'un modèle | `erik-lindqvist` | S7 |

### Passer à l'exécution

| Intention | Agents | Escouade |
| --- | --- | --- |
| Plan d'exécution, algorithme, limites | `yannick-kouassi` | S8 |
| Type d'ordre, microstructure, timing | `benjamin-roche` | S8 |
| Change, conversion, couverture FX | `salma-bennis` | S8 |
| Actions et ETF, événements corporate | `kwame-mensah` | S8 |
| Crypto, perpétuels, plateformes | `isabela-costa` | S8 |
| Coûts réels, slippage, TCA | `theo-martin` | S8 |

### Construire le portefeuille

| Intention | Agents | Escouade |
| --- | --- | --- |
| Allocation, arbitrages entre idées | `laurent-mercier` | S9 |
| Structure multi-actifs, résilience | `hawa-diabate` | S9 |
| Sur/sous-pondération tactique | `felix-braun` | S9 |
| Performance, attribution, persistance | `rania-khalil` | S9 |
| Trésorerie, marges, règlements | `emmanuel-ngoma` | S9 |
| Poche obligataire, duration, crédit | `julia-nowak` | S9 |

### Crypto et dérivés

| Intention | Agents | Escouade |
| --- | --- | --- |
| Thèse crypto globale | `zoe-leclerc` | S10 |
| Flux on-chain, offre, déblocages | `kofi-asante` | S10 |
| Rendement DeFi net de risques | `sara-popescu` | S10 |
| Financement, levier, liquidations | `mohamed-fofana` | S10 |
| Liquidité, stablecoins, parité | `ravi-patel` | S10 |
| Réglementation crypto | `clara-jensen` | S10 |
| Choisir une structure (options, swaps) | `antonio-rossi` | S11 |
| Volatilité, skew, stratégies optionnelles | `pavel-novak` | S11 |
| Courbe de terme, roll, portage | `amara-thiam` | S11 |
| Dérivés de taux, DV01, convexité | `sean-oconnell` | S11 |
| Produit structuré sur mesure | `mathilde-blanchard` | S11 |

### Outiller et transmettre

| Intention | Agents | Escouade |
| --- | --- | --- |
| Plateforme, CI, sauvegardes, incidents | `brigitte-moreau` | S12 |
| Flux temps réel, latence, qualité | `alessandro-conti` | S12 |
| Workflows d'agents, garde-fous techniques | `nafissatou-badji` | S12 |
| Rédaction, harmonisation, archivage | `camille-rousseau` | S12 |
| Former un utilisateur, évaluer les acquis | `stefan-weber` | S12 |

---

## 2. Escouades minimales par type de livrable

| Livrable demandé | Composition minimale |
| --- | --- |
| Note de marché hebdomadaire | `helena-voss` + `lucas-moreau` + `rafael-santos` |
| Idée de trade complète | `rafael-santos` + `nadia-haddad` (ou `victor-almeida`) + `karim-belkacem` + `yannick-kouassi` |
| Validation d'une stratégie | `arjun-mehta` + `hugo-lefevre` + `elena-petrova` + `theo-martin` |
| Revue de portefeuille | `laurent-mercier` + `hawa-diabate` + `lucie-bernard` + `rania-khalil` |
| Due diligence d'un actif | `nadia-haddad` (ou `zoe-leclerc`) + `pierre-lambert` + `priya-nair` + `abdoulaye-sow` |
| Mise en production d'un modèle | `nora-el-amrani` + `malik-ndiaye` + `erik-lindqvist` + `ines-da-silva` + `claire-dubois` |
| Audit d'un incident | `claire-dubois` + `karim-belkacem` + `fatou-diallo` + `brigitte-moreau` |

## 3. Chaînes de handoff types

```text
Idée → décision → exécution
ousmane-traore → helena-voss / rafael-santos → lucas-moreau → amina-cisse
   → laurent-mercier → claire-dubois → yannick-kouassi → benjamin-roche → theo-martin

Stratégie → production
arjun-mehta → hugo-lefevre → elena-petrova → malik-ndiaye → erik-lindqvist → claire-dubois → ines-da-silva

Crypto → allocation
zoe-leclerc → kofi-asante / mohamed-fofana → ravi-patel → clara-jensen → claire-dubois → laurent-mercier
```

## 4. Anti-routage : ce qu'il ne faut pas faire

| Erreur | Pourquoi c'est un problème |
| --- | --- |
| Mobiliser 10 agents pour une question factuelle | Coût, latence, contradictions inutiles |
| Faire analyser une thèse uniquement par son auteur | Aucune revue adverse : biais de confirmation garanti |
| Sauter l'escouade Risque avant une recommandation | Une recommandation hors limites n'est pas un livrable |
| Enchaîner les agents en série quand c'est parallélisable | Perte de temps et dérive de contexte |
| Router vers un agent inexistant « pour compléter » | Rupture de traçabilité, livrable non reproductible |
