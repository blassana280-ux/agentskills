# Glossaire — vocabulaire de la team

Deux sections : les termes de marché utilisés par les agents, et le vocabulaire interne du réseau.
Les définitions sont volontairement courtes et opérationnelles.

## A. Vocabulaire du réseau

| Terme | Définition |
| --- | --- |
| **Agent** | Profil autonome avec un mandat unique, une méthode, des livrables et des garde-fous. Un agent = un mandat. |
| **Escouade (squad)** | Groupe de 4 à 7 agents qui produisent ensemble un type de livrable (macro, technique, risque…). |
| **Handoff** | Passage documenté d'un livrable d'un agent à un autre, avec le contrat de sortie rempli. |
| **Brief** | Contrat d'exécution d'un agent : mandat, entrées, sortie, critère de rejet. |
| **Contrat de sortie** | Format obligatoire de fin de livrable : statut, confiance, données manquantes, prochain handoff. |
| **Gate** | Filtre qualité obligatoire avant diffusion (complétude, preuve fraîche, revue adverse, intégration). |
| **Revue adverse** | Relecture par un agent qui n'a pas produit le livrable et dont le rôle est de l'attaquer. |
| **DONNÉE MANQUANTE** | Mention obligatoire quand un chiffre nécessaire n'est pas disponible et sourcé. |
| **NEEDS WORK** | Statut par défaut d'un livrable : il n'est « OK » que si ses preuves sont datées et ses limites écrites. |
| **Escalade** | Transmission d'un désaccord ou d'un blocage au niveau supérieur (Lead d'escouade, puis Commandement). |

## B. Marchés et risque

| Terme | Définition |
| --- | --- |
| **Alpha** | Part de performance non expliquée par l'exposition aux facteurs de marché. À distinguer de la chance. |
| **Bêta** | Sensibilité d'un actif aux mouvements du marché de référence. |
| **Backtest** | Simulation d'une règle sur données historiques, avec coûts et contraintes ; ne prouve rien seul. |
| **Base** | Écart entre prix à terme et prix au comptant d'un même actif. |
| **Contango / backwardation** | Courbe de terme ascendante (portage coûteux pour l'acheteur) / descendante (portage favorable). |
| **CVaR (expected shortfall)** | Perte moyenne attendue au-delà du seuil de VaR. Plus informative que la VaR seule. |
| **DV01** | Variation de valeur d'une position de taux pour 1 point de base de hausse des taux. |
| **Drawdown** | Baisse depuis le plus haut historique de valorisation, exprimée en pourcentage. |
| **Duration** | Sensibilité du prix d'une obligation aux variations de taux. |
| **Grecques** | Sensibilités d'une option (delta, gamma, vega, theta, rho). |
| **Impact de marché** | Effet d'un ordre sur le prix, fonction de la taille relative au volume disponible. |
| **Liquidité** | Capacité à exécuter une taille donnée sans déplacer significativement le prix. |
| **Look-ahead bias** | Utilisation dans un backtest d'une information non disponible à la date simulée. |
| **Overfitting** | Ajustement excessif d'un modèle au passé, qui détruit sa capacité de généralisation. |
| **Sharpe (deflated)** | Ratio de rendement ajusté du risque, corrigé du nombre de tests effectués. |
| **Slippage** | Écart entre le prix attendu et le prix réellement obtenu. |
| **Spread** | Écart entre meilleur prix acheteur et meilleur prix vendeur. |
| **Stress test** | Simulation d'un scénario extrême (historique ou hypothétique) pour mesurer la perte. |
| **TCA** | Transaction Cost Analysis : mesure des coûts réels d'exécution (spread, impact, frais, financement). |
| **VaR** | Perte potentielle sur un horizon donné à un niveau de confiance donné. **Pas** une perte maximale. |
| **VWAP** | Prix moyen pondéré par les volumes sur une période. |
| **Tracking difference** | Écart de performance entre un ETF et son indice, frais inclus. |
| **Skew (volatilité)** | Asymétrie du prix des options entre strikes : prix relatif de la protection. |
| **Funding rate** | Taux de financement périodique des contrats perpétuels, qui aligne le prix du dérivé sur le spot. |
| **TVL** | Total Value Locked : montant d'actifs déposés dans un protocole DeFi. |

## C. Macro et réglementation

| Terme | Définition |
| --- | --- |
| **Taux réel** | Taux nominal diminué de l'inflation attendue. Moteur central des valorisations longues. |
| **Politique monétaire** | Actions d'une banque centrale sur les taux et la liquidité. |
| **Carry** | Gain issu du différentiel de rendement entre deux actifs ou devises. |
| **Régime de change** | Cadre institutionnel d'une devise : flottant, ancré, géré, dollarisé. |
| **XOF** | Franc CFA (UEMOA), ancré à l'euro avec parité fixe. Sa convertibilité limitée doit être signalée. |
| **AML / KYC** | Lutte anti-blanchiment / connaissance du client : obligations de vigilance des intermédiaires. |
| **PPE** | Personne politiquement exposée : vigilance renforcée en conformité. |
| **MiCA** | Règlement européen encadrant les crypto-actifs (licences, stablecoins, obligations des émetteurs). |
| **Best execution** | Obligation de rechercher le meilleur résultat possible pour un ordre, au-delà du seul prix. |
| **Ségrégation des actifs** | Séparation des actifs clients de ceux de la plateforme ; condition de sécurité en crypto. |

## D. Règles de vocabulaire interne

- On dit **« intention de trade »**, jamais « ordre » (le réseau ne passe pas d'ordre).
- On dit **« scénario »** avec une probabilité et une invalidation, jamais « prévision ».
- On dit **« avis de risque »**, jamais « garantie ».
- Un chiffre sans date ni source ne s'écrit pas : on écrit **DONNÉE MANQUANTE**.
