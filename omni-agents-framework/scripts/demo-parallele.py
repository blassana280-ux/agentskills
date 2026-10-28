#!/usr/bin/env python3
"""Démo d'exécution parallèle : lance toutes les demandes examples/ en même
temps et affiche la couverture réelle du réseau d'agents.

Usage :
    python3 scripts/demo-parallele.py
    python3 scripts/demo-parallele.py --workers 3
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from omnibrain.parallel import run_plans_parallel  # noqa: E402

# OmniBrain orchestre toujours, même s'il ne rejoint jamais une escouade.
ORCHESTRATOR = "omnibrain"
ALL_SPECIALISTS = [
    "frontend-ui", "backend-api", "data-ai", "qa-test", "devops-sre",
    "security", "adversarial-reviewer", "ohada-finance", "marketing-growth",
    "research-intel", "product-delivery",
]


def main() -> int:
    parser = argparse.ArgumentParser(description="Démo parallèle OmniBrain")
    parser.add_argument("--workers", type=int, default=None)
    args = parser.parse_args()

    example_dir = ROOT / "examples"
    task_files = sorted(example_dir.glob("task-*.md"))
    if not task_files:
        print("aucune demande dans examples/", file=sys.stderr)
        return 1

    tasks = [path.read_text(encoding="utf-8") for path in task_files]
    print(f"▶ {len(tasks)} demandes lancées en parallèle (workers={args.workers or 'auto'})\n")
    for i, path in enumerate(task_files):
        print(f"  demande {i + 1}: {path.name}")

    run = run_plans_parallel(tasks, max_workers=args.workers)

    print("\n" + "=" * 72)
    print("RÉSULTAT PAR DEMANDE — chacune = une vague parallèle (wave 0)")
    print("=" * 72)
    for i, (path, plan) in enumerate(zip(task_files, run.plans), start=1):
        c = plan["classification"]
        squad = ", ".join(f"{a['emoji']} {a['id']}" for a in plan["squad"])
        print(f"\n[{i}] {path.name}")
        print(f"    classification : {c['level']} (score {c['score']}, {c['squad_size']} agents)")
        print(f"    escouade       : {squad}")
        print(f"    briefs émis    : {len(plan['briefs'])} | contrats : {len(plan['contracts'])} | gates : {len(plan['gates_checklist'])}")

    print("\n" + "=" * 72)
    print("COUVERTURE DU RÉSEAU")
    print("=" * 72)
    coverage = run.coverage()
    coverage.setdefault(ORCHESTRATOR, list(range(len(task_files))))
    all_agents = [ORCHESTRATOR] + ALL_SPECIALISTS
    mobilized = 0
    for agent_id in all_agents:
        plans_index = coverage.get(agent_id, [])
        if plans_index:
            mobilized += 1
            where = ", ".join(f"demande {i + 1}" for i in plans_index)
            print(f"  ✅ {agent_id:<22} mobilisé dans : {where}")
        else:
            print(f"  ⬜ {agent_id:<22} non mobilisé")

    print("\n" + "=" * 72)
    print("SYNTHÈSE")
    print("=" * 72)
    print(f"  demandes traitées      : {len(run.plans)}")
    print(f"  processus parallèles   : {run.workers}")
    print(f"  briefs émis au total   : {run.total_briefs()} (tous en wave 0)")
    print(f"  agents distincts mobil.: {mobilized}/{len(all_agents)}")
    print(f"  contrats d'interface   : {run.active_contracts()}")
    print(f"  temps parallèle        : {run.parallel_seconds:.3f}s")
    print(f"  temps séquentiel       : {run.sequential_seconds:.3f}s")
    print(f"  accélération observée  : x{run.speedup:.2f}")

    missing = [agent_id for agent_id in ALL_SPECIALISTS if agent_id not in coverage]
    if missing:
        print(f"\n⚠️  spécialistes non couverts : {', '.join(missing)}")
        return 2
    print("\n✅ Les 11 spécialistes + l'orchestrateur OmniBrain ont été mobilisés.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
