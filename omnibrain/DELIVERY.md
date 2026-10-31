# Livraison OmniBrain — pourquoi cette copie vit ici

## Emplacement canonique

L'orchestrateur a été développé pour **`blassana280-ux/omni-agents-framework`**
(le seul dépôt natif du compte, sans upstream tiers). C'est là qu'il doit vivre :
`OMNIBRAIN.md`, `registry/`, `omni/`, `tests/`.

## Pourquoi une copie dans `agentskills` ?

Mesure, pas supposition. Une sonde d'écriture a été exécutée sur les 41 dépôts
du compte (`POST /git/refs` sur une référence temporaire, puis suppression) :

| Résultat | Dépôts |
|---|---|
| écriture autorisée | **`agentskills` uniquement** |
| lecture seule (`403 Resource not accessible by integration`) | les 40 autres, dont `omni-agents-framework` |

`git push` vers `omni-agents-framework` échoue de la même façon
(`remote: Permission ... denied`). Aucune PR n'était donc ouvrable là-bas.

Reconnexion GitHub testée le **2026-10-31 à 11:01 UTC** : token neuf
(expiration 19:01 UTC), périmètre **identique** — 1 dépôt en écriture sur 41.
L'application `arena-ai-coding-agent` annonce pourtant `repository_selection:
"all"` et `contents: write` ; c'est le token effectif qui est restreint à
`agentskills` (même requête : `403` sur `mem0`, `201` sur `agentskills`, avec le
même en-tête de permission attendue). Il faut donc élargir la sélection de
dépôts dans GitHub → *Settings → Applications → Arena → Configure*.

Dès que c'est fait :

```bash
bash omnibrain/scripts/finish-repair.sh          # préflight + publication + réparation
DRY_RUN=1 bash omnibrain/scripts/finish-repair.sh  # pour voir sans rien écrire
```

Cette copie existe pour que le travail soit **réellement livré, relu et testé**
aujourd'hui, pas seulement décrit. Elle n'est pas destinée à l'upstream
`agentskills/agentskills` : c'est une couche locale au fork.

## Déplacer vers l'emplacement canonique

Le patch contient l'historique complet (2 commits) :

```bash
git clone https://github.com/blassana280-ux/omni-agents-framework.git
cd omni-agents-framework
git am /chemin/vers/omnibrain/patches/0001-omnibrain-orchestrator.patch
git push -u origin omni/orchestrator-v1
gh pr create --base main --head omni/orchestrator-v1 \
  --title "feat(omnibrain): real orchestrator, registries, gates and tests"
```

Puis, une fois l'accès en écriture accordé sur les autres dépôts :

```bash
python3 -m omni overlays --account blassana280-ux          # plan (lecture seule)
python3 -m omni overlays --account blassana280-ux --apply  # 1 branche + 1 PR par dépôt
```

## Vérifier ici, tout de suite

```bash
cd omnibrain
python3 -m unittest discover -s tests -t .   # 69 tests, exécutés dans cette copie
python3 -m omni registry                      # cohérence des registres
python3 -m omni providers                     # ce qui peut réellement exécuter
python3 -m omni plan "Ajoute un endpoint REST et une interface React"
```

Résultat attendu et vérifié : `OK (skipped=1)` — le test ignoré est la sonde
réseau opt-in (`OMNI_LIVE=1`).

## Ce que cette livraison ne prétend pas

- Aucun agent IA n'a été exécuté ici : aucun CLI (`claude`, `codex`, `gemini`,
  `kilo`, `aider`…) n'est présent dans l'environnement et `OMNI_PROVIDER_CMD`
  n'est pas défini. Les runs se terminent en `NEEDS_WORK` avec
  `executed=false` — c'est le comportement voulu, pas un échec caché.
- `mem0`, `cognee`, `kilocode`, `OmniRoute`, `Open-Agents`, `9router` ne sont
  **pas** intégrés comme services : ce sont des dépôts lus et cités comme
  sources de compétences (`registry/skills.json`, champ `verification`).
- La protection de branche n'a été ni lue ni appliquée : le jeton n'a pas le
  scope `Administration`. L'état réel est `insufficient_permission`.
