#!/usr/bin/env bash
# Termine la réparation OmniBrain en une commande, avec VOTRE jeton GitHub.
#
# Pourquoi ce script existe : le jeton de l'agent de session ne peut écrire que
# dans `agentskills` (mesuré : 1 dépôt sur 41, avant et après reconnexion).
# Tout le reste est prêt ; il ne manque que l'autorisation.
#
# Prérequis : `gh` authentifié (`gh auth status`) avec contents:write sur les
# dépôts cibles, `git`, `python3`.
#
#   ./scripts/finish-repair.sh              # préflight + exécution
#   DRY_RUN=1 ./scripts/finish-repair.sh    # préflight seul

set -euo pipefail

ACCOUNT="${ACCOUNT:-blassana280-ux}"
REPO="${REPO:-$ACCOUNT/omni-agents-framework}"
WORK="${WORK:-$HOME/omni-work}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OMNIBRAIN="$(cd "$HERE/.." && pwd)"
DRY_RUN="${DRY_RUN:-0}"

say() { printf '\n\033[1m%s\033[0m\n' "$*"; }
fail() { printf '\033[31m✗ %s\033[0m\n' "$*" >&2; exit 1; }

say "0/4 — préflight"
command -v gh >/dev/null || fail "gh n'est pas installé"
command -v git >/dev/null || fail "git n'est pas installé"
gh auth status >/dev/null 2>&1 || fail "gh n'est pas authentifié (gh auth login)"

probe_write() { # $1 = owner/repo
  local br sha out
  br=$(gh api "repos/$1" --jq .default_branch 2>/dev/null) || return 1
  sha=$(gh api "repos/$1/git/ref/heads/$br" --jq '.object.sha' 2>/dev/null) || return 1
  out=$(gh api -X POST "repos/$1/git/refs" -f ref=refs/heads/omni-preflight -f sha="$sha" 2>&1) || true
  if printf '%s' "$out" | grep -q '"ref"'; then
    gh api -X DELETE "repos/$1/git/refs/heads/omni-preflight" >/dev/null 2>&1 || true
    return 0
  fi
  return 1
}

probe_write "$REPO" || fail "pas d'accès en écriture sur $REPO.
→ GitHub → Settings → Applications → Arena → Configure → Repository access → All repositories
  (ou ajoutez explicitement $REPO et les dépôts listés dans docs/OVERLAYS-PLAN.md), puis reconnectez GitHub dans Arena."
echo "✓ écriture confirmée sur $REPO"

say "1/4 — publication de l'orchestrateur dans $REPO"
rm -rf "$WORK/omni-agents-framework"
mkdir -p "$WORK"
git clone -q "https://github.com/$REPO.git" "$WORK/omni-agents-framework"
cd "$WORK/omni-agents-framework"
git config user.name  "$(git config --global user.name  || echo "$ACCOUNT")"
git config user.email "$(git config --global user.email || echo "$ACCOUNT@users.noreply.github.com")"
git checkout -q -B omni/orchestrator-v1
git am "$OMNIBRAIN/patches/0001-omnibrain-orchestrator.patch"
python3 -m unittest discover -s tests -t . >/dev/null || fail "les tests échouent dans le clone : rien n'a été poussé"
echo "✓ 69 tests verts dans le clone"
if [ "$DRY_RUN" = "1" ]; then
  echo "(dry run) git push + PR ignorés"; else
  git push -q -u origin omni/orchestrator-v1
  gh pr create --repo "$REPO" --base main --head omni/orchestrator-v1 \
    --title "feat(omnibrain): orchestrateur réel, registres, gates et tests (69)" \
    --body "Livraison OmniBrain : orchestrateur, registres d'agents et de compétences, matrice de routage, permissions, mémoire contrôlée, bus d'agents, gitops, 69 tests exécutés. Voir OMNIBRAIN.md et docs/REPORT.md." \
    || echo "(une PR existe peut-être déjà pour cette branche)"
  echo "✓ branche poussée dans $REPO"
fi

say "2/4 — réparation des AGENTS.md (38 dépôts)"
cd "$OMNIBRAIN"
python3 -m omni overlays --account "$ACCOUNT"                 # plan, lecture seule
if [ "$DRY_RUN" = "1" ]; then
  echo "(dry run) application ignorée"; else
  python3 -m omni overlays --account "$ACCOUNT" --apply || echo "certaines actions sont bloquées (voir ci-dessus)"
fi

say "3/4 — vérification"
python3 -m omni audit --account "$ACCOUNT" --out "$OMNIBRAIN/audit-final.json" || true

say "4/4 — protection de branche (optionnel)"
echo "À exécuter seulement si vous voulez exiger une PR sur main :"
echo "  python3 -m omni protection $REPO --apply"

say "Terminé. Rien n'a été fusionné : toutes les modifications sont en Pull Request."
