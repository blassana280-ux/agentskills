# Limites et risques

Ce dépôt est un outil de **recherche et de structuration de la décision**. Il n'est ni un conseiller
financier, ni un système de trading automatisé, ni une garantie de performance.

## 1. Ce que la team ne fait pas

| Interdit | Raison |
| --- | --- |
| Passer un ordre, exécuter une transaction, manipuler une clé privée | Aucun agent n'a d'accès d'exécution ; tout passage à l'acte est humain |
| Promettre un rendement ou un « signal gagnant » | Aucun modèle ne garantit une performance future |
| Fournir un conseil en investissement personnalisé | Nécessite un cadre réglementaire, une connaissance client et une responsabilité juridique |
| Inventer une donnée, une source ou une réglementation | Une analyse non sourcée est un risque, pas un livrable |
| Garantir une conformité réglementaire | La conformité relève d'un professionnel habilité, pas d'un agent |
| Traiter des données personnelles réelles dans un livrable public | Risque juridique et éthique |

## 2. Limites intrinsèques des analyses produites

1. **Données.** Les agents travaillent sur les données fournies. Ils ne vérifient pas une source
   de marché en temps réel : toute donnée est datée et sa fraîcheur est affichée.
2. **Modèles.** Un backtest est une mesure du passé, pas une prédiction. Les performances
   historiques sont systématiquement bruitées par les tests multiples (voir `elena-petrova`).
3. **Régimes.** Un modèle calibré sur un régime (taux bas, faible volatilité) devient fragile
   quand le régime change. C'est pourquoi chaque livrable porte une condition d'invalidation.
4. **Liquidité.** Les coûts d'exécution réels peuvent être supérieurs aux hypothèses, surtout en
   stress et sur les petites capitalisations ou les actifs numériques.
5. **Langage.** Un agent peut produire une formulation convaincante et fausse. Le statut
   **NEEDS WORK** par défaut et la revue adverse existent précisément pour cela.
6. **Cohérence multi-agents.** Dix agents peuvent produire dix analyses cohérentes et un
   portefeuille incohérent : c'est le rôle des gates d'intégration et de l'escouade S9.

## 3. Risques spécifiques par classe d'actifs

| Classe | Risques principaux à ne jamais omettre |
| --- | --- |
| Actions | Concentration sectorielle, risque de résultats, liquidité des petites capitalisations |
| Obligations / crédit | Duration, risque de défaut, risque de refinancement, illiquidité |
| Devises | Régime de change, convertibilité, risque de contagion, coûts de conversion |
| Matières premières | Courbe de terme, stockage, livraison physique, risque géopolitique |
| Dérivés | Effet de levier, appels de marge, perte non bornée sur options vendues, risque de contrepartie |
| Crypto | Perte totale, risque de plateforme, smart contract, dépeg de stablecoin, réglementation mouvante |
| Marchés frontières / BRVM | Liquidité faible, information rare, délais de règlement, risque de change |
| XOF / UEMOA | Parité fixe à l'euro, convertibilité limitée, dépendance aux matières premières exportées |

## 4. Risques d'usage du réseau lui-même

- **Automatisation excessive** : enchaîner des agents sans validation humaine peut produire une
  décision rapide, cohérente… et fausse. Le réseau ne doit jamais décider seul d'une exposition réelle.
- **Sur-confiance dans le langage** : un livrable bien écrit n'est pas un livrable juste.
  Exigez systématiquement la source, la date et l'invalidation.
- **Faux consensus** : si tous les agents sont d'accord du premier coup, suspectez un brief trop
  directif ou une absence de revue adverse.
- **Dérive de contexte** : plus le contexte est long, plus les agents inventent des liens.
  Un agent = un mandat, un brief = un contexte minimal.

## 5. Conformité et cadre réglementaire

Le réseau produit de la **recherche** et des **documents d'aide à la décision**. Selon votre
juridiction et votre statut, diffuser ces documents peut relever d'obligations spécifiques
(conseil en investissement, démarchage, gestion de portefeuille pour compte de tiers, publication
d'analyses financières). Les agents `abdoulaye-sow`, `clara-jensen` et `maria-gonzalez` rappellent
les contraintes connues, mais **ne remplacent jamais un avis juridique**.

## 6. Données personnelles et confidentialité

- Ne jamais coller dans un prompt : identifiants de compte, clés API, clés privées, relevés bancaires.
- Les agents sont conçus pour travailler sur des données de marché agrégées et des documents publics.
- Tout livrable destiné à publication est relu par `camille-rousseau` et `abdoulaye-sow`
  pour vérifier l'absence de données sensibles.

## 7. Avertissement final

> Ces contenus sont fournis à titre informatif et éducatif. Ils ne constituent pas un conseil en
> investissement, une recommandation d'achat ou de vente, ni une offre de services financiers.
> Les marchés comportent un risque de perte totale du capital. Vous restez seul responsable de vos
> décisions. Vérifiez chaque chiffre, chaque source et chaque hypothèse avant d'agir.

## 8. Signaler un problème

Un agent qui produit une affirmation non sourcée, une promesse de rendement ou un chiffre inventé
doit être signalé : ouvrez une issue avec le slug de l'agent, le brief utilisé et la sortie
problématique. C'est ainsi que le roster s'améliore (voir [`../CONTRIBUTING.md`](../CONTRIBUTING.md)).
