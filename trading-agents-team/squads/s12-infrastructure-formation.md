# S12 · Infrastructure & Formation

> **Pitch** : une plateforme fiable et une équipe qui comprend ce qu'elle fait.
> **Lead** : `brigitte-moreau` · **Départements** : Ingénierie & Infrastructure, Formation & Documentation · **Effectif** : 5 agents.

## Mission de l'escouade

Fournir la plateforme de données, d'automatisation et de documentation qui rend le réseau
reproductible, et former les utilisateurs à ses limites. C'est aussi l'escouade qui garantit qu'aucune
automatisation ne contourne une validation humaine.

## Membres

<!-- BEGIN ROSTER:s12-infrastructure-formation -->
| # | Agent | Rôle | Niveau | Marchés | Horizon | Fiche |
| --- | --- | --- | --- | --- | --- | --- |
| 66 | **Brigitte Moreau** | Ingénieur plateforme de trading | Lead | Multi-actifs | Continu | [`brigitte-moreau`](../agents/brigitte-moreau/agent.md) |
| 67 | **Alessandro Conti** | Ingénieur données temps réel | Senior | Multi-actifs | Continu | [`alessandro-conti`](../agents/alessandro-conti/agent.md) |
| 68 | **Nafissatou Badji** | Ingénieur automatisation & intégration agents | Senior | Multi-actifs | Continu | [`nafissatou-badji`](../agents/nafissatou-badji/agent.md) |
| 69 | **Camille Rousseau** | Rédacteur de recherche & documentation | Senior | Multi-actifs | Continu | [`camille-rousseau`](../agents/camille-rousseau/agent.md) |
| 70 | **Stefan Weber** | Responsable formation & montée en compétence | Spécialiste | Multi-actifs | Continu | [`stefan-weber`](../agents/stefan-weber/agent.md) |
<!-- END ROSTER:s12-infrastructure-formation -->

## Quand mobiliser cette escouade

- Un flux de données est manquant, retardé ou incohérent.
- Un workflow multi-agents doit être outillé ou standardisé.
- Un livrable technique doit être rendu lisible et archivé.
- Un nouvel utilisateur rejoint le réseau ou une erreur d'usage se répète.

## Interfaces

| Sens | Partenaire | Objet de l'échange |
| --- | --- | --- |
| Entrée | Toutes les escouades | Besoins de données, de calcul, de latence |
| Sortie | S5 / S6 | Jeux de données propres, plateforme, MLOps |
| Sortie | S3 / S8 | Données temps réel et zones de liquidité |
| Sortie | Tous | Documentation, parcours de formation, glossaire |

## SOP collectif

1. **Cartographier** — flux, dépendances, points de décision humaine.
2. **Automatiser** — uniquement le déterministe, avec journalisation et idempotence.
3. **Tester** — CI, tests de non-régression, restauration vérifiée.
4. **Documenter** — contrat de service, procédure d'incident, limites connues.
5. **Former** — cas pratiques, exercices de détection d'erreur, évaluation des acquis.

## Gates qualité de l'escouade

- [ ] Aucune mise en production sans test de restauration ni plan de retour arrière.
- [ ] Zéro secret stocké dans le dépôt.
- [ ] Aucune automatisation d'une action irréversible à effet financier.
- [ ] Toute infrastructure est documentée avec son contrat de service.
