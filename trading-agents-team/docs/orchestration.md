# Orchestration — protocole complet et exemples travaillés

Ce document détaille comment mobiliser les 70 agents : la classification, le brief, la vague
parallèle, les gates, l'assemblage. Il se lit après [`AGENTS.md`](../AGENTS.md).

---

## 1. Classification de la demande

Toute demande passe par trois questions, dans cet ordre :

1. **Combien de domaines sont concernés ?** (macro, technique, fondamental, risque, exécution…)
2. **Y a-t-il une décision à prendre, ou seulement une information à produire ?**
3. **Quel est le coût d'une erreur ?** (un avis erroné sur une exposition réelle coûte plus cher
   qu'une note de veille)

| Niveau | Critère | Mobilisation | Durée cible |
| --- | --- | --- | --- |
| Simple | 1 domaine, pas de décision engageante | 1 agent | 1 passage |
| Moyenne | 1 à 2 domaines, décision réversible | 1-3 agents + 1 relecteur | 2 passages |
| Complexe | 3+ domaines ou décision engageante | 4-8 agents + gate risque | 2-3 passages |

**Règle de sous-mobilisation** : en cas de doute, commencer petit. Ajouter un agent coûte moins
cher que réconcilier huit analyses contradictoires.

## 2. Écriture du brief

Un brief est un contrat, pas une conversation. Cinq champs obligatoires :

```text
AGENT      : nadia-haddad
MANDAT     : Évaluer la qualité fondamentale et la valorisation de l'émetteur X sur 3 ans,
             et rendre une thèse falsifiable avec prix cible en fourchette.
ENTRÉES    : états financiers 3 ans (joints, datés du 30/06), consensus, note sectorielle de jonas-berg,
             régime macro de helena-voss (note du 24/10).
SORTIE     : note de 600 mots max — thèse, 3 métriques clés, valorisation en fourchette,
             catalyseurs datés, invalidation chiffrée + contrat de sortie.
REJET      : prix cible unique sans fourchette ; hypothèses de croissance non justifiées ;
             absence d'invalidation ; données non datées.
```

Un brief sans **REJET** produit systématiquement un texte flatteur et inutilisable.

## 3. La vague parallèle

```text
             ┌─→ rafael-santos   (structure et niveaux)        ─┐
Demande ─→   ├─→ nadia-haddad    (valeur et catalyseurs)       ─┤
  classée    ├─→ anna-kowalski   (corrélations et facteurs)    ─┼─→ Assemblage ─→ gates ─→ livrable
  (S1)       ├─→ karim-belkacem  (exposition et limites)        ─┤
             └─→ theo-martin     (coûts d'exécution réalistes)  ─┘
```

Trois règles :

- **Pas de dépendance artificielle.** Si l'agent B n'a pas besoin du résultat de A, ils partent ensemble.
- **Contrats d'interface.** Chaque sortie respecte un format connu des autres agents (nombres, dates, unités).
- **Isolation du contexte.** Chaque agent reçoit son brief et ses entrées, pas l'historique complet de la conversation.

## 4. Les 4 gates

| Gate | Question | Échec typique |
| --- | --- | --- |
| **Complétude** | Toutes les sections attendues sont-elles remplies ? | Section « limites » vide |
| **Preuve fraîche** | Chaque chiffre a-t-il une source et une date ? | Cours cité sans date, ratio sans période |
| **Revue adverse** | Un tiers a-t-il tenté de casser la thèse ? | Le thème est relu par son propre auteur |
| **Intégration** | Les différentes parties se contredisent-elles ? | Horizon 3 mois dans une note annuelle |

Un gate non passé ne se contourne pas : on renvoie le brief avec le motif de rejet.

## 5. Assemblage et rapport d'orchestration

Le livrable final est **unique**. Il est accompagné d'un rapport court (10 lignes max) :

```text
Complexité        : complexe (5 agents)
Agents mobilisés  : rafael-santos, nadia-haddad, anna-kowalski, karim-belkacem, theo-martin
Désaccords        : rafael-santos attend un repli ; nadia-haddad juge la valorisation attractive.
                    Arbitrage : position partielle, invalidation au niveau X.
Données manquantes: coûts de courtage réels (theo-martin), encours de l'ETF (sarah-cohen)
Gates             : complétude OK · preuve fraîche OK · revue adverse OK (karim-belkacem) · intégration OK
```

## 6. Exemple travaillé n°1 — « réduire l'exposition actions avant la Fed ? »

**Classification** : complexe (macro + technique + risque + portefeuille) → 5 agents.

| Agent | Brief (résumé) |
| --- | --- |
| `helena-voss` | Régime macro actuel, scénarios de la réunion, implications actions sur 4 semaines |
| `ibrahima-keita` | Pricing de taux vs guidance, surprises possibles, impact sur les indices |
| `rafael-santos` | Structure de l'indice, niveaux de support/résistance, invalidation |
| `claire-dubois` | Impact d'une réduction de 20 % de l'exposition sur le budget de risque |
| `laurent-mercier` | Trois options d'allocation chiffrées avec coûts et conditions de retour |

**Gates** : le risque relit la proposition d'allocation (gate 3), `fatou-diallo` vérifie la cohérence
des horizons (gate 4).

**Livrable** : une note d'une page — décision recommandée, 3 options chiffrées, conditions
d'invalidation, données manquantes, et rapport d'orchestration.

## 7. Exemple travaillé n°2 — « cette stratégie de momentum tient-elle après coûts ? »

**Classification** : moyenne (quant + exécution) → 4 agents.

| Agent | Brief (résumé) |
| --- | --- |
| `arjun-mehta` | Protocole de validation, critères go/no-go, séparation in/out-of-sample |
| `hugo-lefevre` | Backtest événementiel avec coûts réalistes et contrainte de capacité |
| `elena-petrova` | Significativité après correction pour tests multiples (deflated Sharpe) |
| `theo-martin` | Coûts réellement observés vs coûts supposés dans le backtest |

**Rejet attendu si** : Sharpe annoncé sans intervalle de confiance, coûts forfaitaires uniques,
absence de test hors échantillon.

**Livrable** : verdict go/no-go avec réserves, performance nette, capacité estimée, conditions de suivi.

## 8. Exemple travaillé n°3 — « exécuter 250 M FCFA d'achat d'actions sans casser le prix »

**Classification** : moyenne (exécution + risque) → 4 agents.

| Agent | Brief (résumé) |
| --- | --- |
| `yannick-kouassi` | Plan d'exécution (algorithme, fenêtre, taille max par ordre, conditions d'arrêt) |
| `benjamin-roche` | Microstructure du titre, choix limite vs agression, fenêtres de liquidité |
| `theo-martin` | Coût attendu et comparaison avec les coûts historiques |
| `priya-nair` | Impact sur la liquidité du portefeuille et délai de sortie en stress |

**Garde-fou clé** : le plan est un livrable. Aucun ordre n'est envoyé — validation humaine obligatoire.

## 9. Gestion des désaccords

Un désaccord est une **donnée**, pas un bug :

1. Le désaccord est écrit (qui, quoi, pourquoi).
2. Il est arbitré sur un critère explicite : rendement/risque attendu, robustesse, liquidité, conformité.
3. La position minoritaire est conservée dans le rapport d'orchestration.
4. Si le désaccord porte sur une limite de risque, l'avis de `claire-dubois` prévaut.

## 10. Erreurs d'orchestration fréquentes

| Erreur | Conséquence | Correctif |
| --- | --- | --- |
| Brief sans critère de rejet | Livrable lisse, non falsifiable | Ajouter REJET systématiquement |
| Même agent auteur et relecteur | Biais de confirmation | Imposer un relecteur externe (S7 ou S5) |
| Contexte complet envoyé à chaque agent | Coût élevé, dilution de l'attention | Contexte minimal et ciblé |
| Livrable assemblé sans gate | Incohérences internes | 4 gates avant diffusion |
| Désaccord effacé à l'assemblage | Perte d'information critique | Conserver la minorité |
