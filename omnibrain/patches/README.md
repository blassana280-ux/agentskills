# patches/

`0001-omnibrain-orchestrator.patch` est l'historique (2 commits) du développement
de l'orchestrateur, applicable avec `git am` sur un clone neuf de
`omni-agents-framework`. Il est conservé pour la lisibilité de l'historique.

`scripts/finish-repair.sh` ne l'utilise plus : il copie l'état **exact** livré
dans `omnibrain/` (70 tests), ce qui évite qu'un patch prenne du retard sur le
contenu réel. Le patch reste donc une pièce d'archive, pas la source de vérité.
