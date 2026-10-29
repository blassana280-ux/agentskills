# Contribuer à la Trading Agents Team

Merci de vouloir renforcer le réseau. Ce dépôt est généré à partir d'un roster : la règle
principale est simple — **on ne modifie pas les fichiers générés à la main**.

## Règle d'or : le roster est la source de vérité

| Fichier | Statut |
| --- | --- |
| `scripts/roster_core.py` | Source — escouades, départements, niveaux |
| `scripts/roster_a.py`, `scripts/roster_b.py` | Source — fiches des 70 agents |
| `agents/<slug>/SKILL.md`, `agents/<slug>/agent.md` | **Généré** |
| `INDEX.md`, `index.json` | **Généré** |
| Tableaux entre `<!-- BEGIN ROSTER -->` et `<!-- END ROSTER -->` dans `squads/` | **Généré** |
| `squads/*.md` (reste du fichier), `docs/`, `README.md`, `AGENTS.md`, `templates/` | Édité à la main |

## Ajouter un agent

1. Ouvrir `scripts/roster_a.py` ou `scripts/roster_b.py`.
2. Ajouter une fiche `A(...)` en respectant les champs requis :

   ```python
   A(
       slug="prenom-nom",                 # unique, kebab-case, = nom du dossier
       prenom="Prénom", nom="Nom",
       role="Intitulé du rôle",
       squad="s3-analyse-technique",      # doit exister dans SQUADS
       dept="analyse",                    # doit exister dans DEPARTMENTS
       niveau="Senior",                   # Lead | Senior | Spécialiste | Analyste
       marches="Actions, futures",
       horizon="Journalier à hebdomadaire",
       pitch="Une phrase qui résume l'apport unique de l'agent.",
       mission="Le mandat, en 2 à 3 phrases.",
       quand=["3 situations concrètes de mobilisation"],
       entrees=["3 entrées nécessaires, avec nature et source"],
       methode=["5 étapes de travail, ordonnées"],
       livrables=["3 à 4 livrables concrets"],
       kpis=["3 indicateurs mesurables"],
       competences=["3 compétences signature"],
       garde_fous=["2 à 3 garde-fous spécifiques"],
       anti_patrons=["2 comportements à refuser"],
       handoffs=["slug-existant-1", "slug-existant-2"],
       handoff_note="Ce qui est transmis et à qui.",
   )
   ```

3. Régénérer et valider :

   ```bash
   python3 scripts/build_agents.py
   python3 scripts/validate.py
   ```

4. Commiter **les sources ET les fichiers générés**.

### Critères d'acceptation d'un nouvel agent

- [ ] Le mandat est **unique** : aucun agent existant ne couvre déjà 90 % du besoin.
- [ ] Le rôle est vérifiable par un KPI, pas seulement descriptif.
- [ ] Au moins un garde-fou est propre à l'agent (pas seulement les règles globales).
- [ ] Les handoffs pointent vers des slugs existants et ont un sens métier.
- [ ] Les anti-patrons décrivent des comportements réellement observés ou probables.

## Modifier un agent existant

Éditer sa fiche dans le roster, régénérer, valider. Si le changement touche au mandat, mettre à
jour les handoffs des agents voisins et vérifier que les escouades restent cohérentes.

## Documenter un incident

Si un agent a produit une affirmation non sourcée, une promesse de rendement ou un chiffre inventé :

1. Ouvrir une issue avec le slug, le brief utilisé et la sortie problématique.
2. Proposer un garde-fou supplémentaire (formulation concrète, testable).
3. Après validation, l'ajouter dans `garde_fous` ou `anti_patrons` de la fiche.

## Style éditorial

- Français, phrases courtes, pas de jargon inutile.
- Pas de promesse de performance, pas d'emoji décoratif, pas de superlatif commercial.
- Chaque affirmation sur un marché doit pouvoir être sourcée.
- Les données de marché sont datées et en unités explicites.

## Pull requests

- Une PR = un changement logique (un agent, une escouade, ou une correction documentaire).
- Décrire le **pourquoi**, pas seulement le **quoi**.
- Si une IA a rédigé tout ou partie de la contribution, le mentionner explicitement dans la PR.
- La CI doit passer : `scripts/validate.py`, `skills-ref validate` sur chaque skill, et vérification
  que les fichiers générés sont à jour.

## Licence

En contribuant, vous acceptez que votre contribution soit publiée sous licence [MIT](LICENSE).
