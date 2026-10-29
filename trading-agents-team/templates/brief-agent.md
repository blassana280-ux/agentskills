# Modèle de brief d'agent

Copier ce bloc dans le prompt de l'agent, ou le remplir dans un fichier `briefs/<date>-<slug>.md`.

```text
AGENT      : <slug (voir index.json)>
MANDAT     : <une phrase impérative : ce que l'agent doit produire, pas le sujet général>
ENTRÉES    : <données, fichiers, hypothèses — chacune avec sa date et sa source>
SORTIE     : <format, longueur maximale, sections obligatoires>
REJET      : <ce qui rend le livrable inacceptable — au moins 2 critères>
ÉCHÉANCE   : <date/heure ou « immédiat »>
ÉMETTEUR   : <slug de l'orchestrateur>
```

## Exemple rempli

```text
AGENT      : nadia-haddad
MANDAT     : Évaluer la qualité fondamentale et la valorisation de l'émetteur X sur 3 ans,
             et rendre une thèse falsifiable avec prix cible en fourchette.
ENTRÉES    : états financiers 3 ans (joints, arrêtés au 30/06) ; consensus analystes (relevé du 22/10) ;
             note sectorielle de jonas-berg (20/10) ; régime macro de helena-voss (note du 24/10).
SORTIE     : 600 mots max — (1) thèse en 3 phrases, (2) 3 métriques qui font le titre,
             (3) valorisation en fourchette avec hypothèses, (4) catalyseurs datés,
             (5) invalidation chiffrée, (6) contrat de sortie.
REJET      : prix cible unique sans fourchette ; hypothèses de croissance non justifiées ;
             absence d'invalidation ; donnée non datée ; recommandation sans analyse de liquidité.
ÉCHÉANCE   : sous 24 h
ÉMETTEUR   : ousmane-traore
```

## Règles de rédaction d'un brief

1. **Un mandat, un verbe d'action mesurable.** « Évaluer », « tester », « chiffrer », « cartographier ».
2. **Entrées datées.** Une donnée sans date est une donnée inutilisable pour un agent rigoureux.
3. **Sortie bornée.** Une longueur maximale force la hiérarchisation de l'information.
4. **Rejet explicite.** Sans critère de rejet, l'agent produira un texte flatteur et non falsifiable.
5. **Pas de contexte inutile.** Coller l'historique complet de la conversation dégrade la qualité
   et augmente le coût.

## Checklist avant envoi

- [ ] Le slug existe dans `index.json`.
- [ ] Le mandat tient en une phrase.
- [ ] Chaque entrée a une date (et une source si c'est une donnée externe).
- [ ] Le format de sortie est explicite (sections + longueur).
- [ ] Au moins deux critères de rejet sont écrits.
- [ ] L'agent n'est pas à la fois auteur et relecteur du même livrable.
