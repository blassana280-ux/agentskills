#!/usr/bin/env python3
"""Génère les 70 agents de la Trading Agents Team.

Source de vérité : scripts/roster.py (fiche structurée par agent).
Sorties générées (ne pas éditer à la main) :
  - agents/<slug>/SKILL.md   (format Agent Skills, validé par agentskills.io spec)
  - agents/<slug>/agent.md   (profil de routage style OmniBrain)
  - INDEX.md                 (index lisible)
  - index.json               (index machine)
  - squads/<squad>.md        (tableaux de roster injectés entre marqueurs)

Usage : python3 scripts/build_agents.py
"""

from __future__ import annotations

import json
import re
from pathlib import Path

from roster import AGENTS, SQUADS, DEPARTMENTS, LEVELS, TEAM_VERSION

ROOT = Path(__file__).resolve().parent.parent
AGENTS_DIR = ROOT / "agents"
SQUADS_DIR = ROOT / "squads"

LICENSE = "MIT"
COMPATIBILITY = "Claude Code, Codex CLI, Cursor, Gemini CLI, Copilot, OpenCode, Antigravity (Agent Skills spec)"

# Garde-fous appliqués à TOUS les agents du réseau.
GLOBAL_GUARDRAILS = [
    "Aucune exécution d'ordre réelle : toute intention de trade est un livrable documenté soumis à validation humaine explicite.",
    "Aucun chiffre sans source, date de relevé et unité ; si la donnée manque, écrire « DONNÉE MANQUANTE » plutôt qu'estimer en silence.",
    "Séparer systématiquement fait / hypothèse / opinion, et afficher un niveau de confiance (bas, moyen, élevé) avec sa justification.",
    "Aucun conseil en investissement personnalisé, aucune promesse de rendement, aucun contournement réglementaire.",
]


def yaml_scalar(value: str) -> str:
    """Émet une chaîne YAML sûre (double quotes, échappement minimal)."""
    escaped = value.replace("\\", "\\\\").replace('"', '\\"')
    return f'"{escaped}"'


def wrap_bullets(items: list[str]) -> str:
    return "\n".join(f"- {item}" for item in items)


def numbered(items: list[str]) -> str:
    return "\n".join(f"{i}. {item}" for i, item in enumerate(items, start=1))


def build_description(agent: dict) -> str:
    """Compose une description de skill orientée découverte (quand m'activer)."""
    if agent.get("description"):
        return agent["description"].strip()
    quand = [q.rstrip(".") for q in agent["quand"]]
    raisons = ", ".join(q[0].lower() + q[1:] for q in quand)
    text = (
        f"{agent['role']} ({nom_complet(agent)}) de la Trading Agents Team. {agent['pitch']} "
        f"À activer pour : {raisons}."
    )
    if len(text) > 1000:
        text = text[:997].rsplit(" ", 1)[0] + "..."
    return text


def agent_by_slug(slug: str) -> dict:
    for agent in AGENTS:
        if agent["slug"] == slug:
            return agent
    raise KeyError(f"Slug inconnu dans les handoffs : {slug}")


def nom_complet(agent: dict) -> str:
    return f"{agent['prenom']} {agent['nom']}"


def render_skill(agent: dict) -> str:
    squad = SQUADS[agent["squad"]]
    dept = DEPARTMENTS[agent["dept"]]
    description = build_description(agent)
    if not description.endswith("."):
        description += "."

    handoffs = agent["handoffs"]
    handoff_lines = [
        f"- **{agent_by_slug(s)['role']}** (`{s}`) — {agent_by_slug(s)['nom']} : "
        f"{agent_by_slug(s)['handoff_note']}"
        for s in handoffs
    ]

    metadata = [
        ("agent-name", nom_complet(agent)),
        ("role", agent["role"]),
        ("department", dept["nom"]),
        ("squad", squad["nom"]),
        ("level", agent["niveau"]),
        ("markets", agent["marches"]),
        ("horizon", agent["horizon"]),
        ("team-version", TEAM_VERSION),
        ("author", "blassana280-ux"),
        ("language", "fr"),
    ]

    fm = [
        "---",
        f"name: {agent['slug']}",
        f"description: {yaml_scalar(description)}",
        f"license: {LICENSE}",
        f"compatibility: {yaml_scalar(COMPATIBILITY)}",
        "metadata:",
    ]
    fm += [f"  {k}: {yaml_scalar(v)}" for k, v in metadata]
    fm.append("---")

    body = f"""
# {nom_complet(agent)} — {agent['role']}

> **Escouade** : {squad['nom']} ({agent['squad']}) · **Département** : {dept['nom']} ·
> **Niveau** : {agent['niveau']} · **Marchés** : {agent['marches']} · **Horizon** : {agent['horizon']}
> Profil de routage complet : [`agent.md`](agent.md) · Fiche d'équipe : [`../../{squad['fichier']}`](../../{squad['fichier']})

## 1. Identité et mandat

**{agent['pitch']}**

{agent['mission']}

## 2. Quand m'activer

{wrap_bullets(agent['quand'])}

## 3. Entrées requises

{wrap_bullets(agent['entrees'])}

## 4. Méthode de travail

{numbered(agent['methode'])}

## 5. Livrables

{wrap_bullets(agent['livrables'])}

## 6. Indicateurs de qualité

{wrap_bullets(agent['kpis'])}

## 7. Garde-fous

{wrap_bullets(agent['garde_fous'] + GLOBAL_GUARDRAILS)}

## 8. Anti-patrons (à refuser)

{wrap_bullets(agent['anti_patrons'])}

## 9. Handoffs

{chr(10).join(handoff_lines) if handoff_lines else "- Aucun handoff sortant : agent terminal de la chaîne."}

## 10. Prompt d'activation

```text
Tu es {nom_complet(agent)}, {agent['role']} de la Trading Agents Team ({squad['nom']}).
Marchés : {agent['marches']} · Horizon : {agent['horizon']} · Niveau : {agent['niveau']}.

MISSION
{agent['mission']}

MÉTHODE
{numbered(agent['methode'])}

LIVRABLES ATTENDUS
{wrap_bullets(agent['livrables'])}

GARDE-FOUS NON NÉGOCIABLES
{wrap_bullets(agent['garde_fous'] + GLOBAL_GUARDRAILS)}

Tu travailles en français, de façon structurée et sourcée. Termine chaque livrable par :
« Statut : OK | NEEDS WORK », la liste des données manquantes et le prochain handoff recommandé.
```
"""
    return "\n".join(fm) + "\n" + body


def render_profile(agent: dict, index: int) -> str:
    squad = SQUADS[agent["squad"]]
    dept = DEPARTMENTS[agent["dept"]]
    level = LEVELS[agent["niveau"]]

    handoffs = agent["handoffs"]
    handoff_lines = [
        f"- `{s}` → {nom_complet(agent_by_slug(s))} ({agent_by_slug(s)['role']}) : "
        f"{agent_by_slug(s)['handoff_note']}"
        for s in handoffs
    ]

    fm = f"""---
agent: {agent['slug']}
nom_complet: {yaml_scalar(nom_complet(agent))}
role: {yaml_scalar(agent['role'])}
squad: {yaml_scalar(squad['nom'])}
department: {yaml_scalar(dept['nom'])}
level: {yaml_scalar(agent['niveau'])}
seniority-years: {yaml_scalar(level['annees'])}
markets: {yaml_scalar(agent['marches'])}
horizon: {yaml_scalar(agent['horizon'])}
team-version: {yaml_scalar(TEAM_VERSION)}
skill: {yaml_scalar('agents/' + agent['slug'] + '/SKILL.md')}
---
"""
    body = f"""
# {nom_complet(agent)} — {agent['role']}

**Agent #{index:02d} / 70** · Escouade `{agent['squad']}` · Département {dept['nom']} · Niveau {agent['niveau']}

| Champ | Valeur |
| --- | --- |
| Nom | {nom_complet(agent)} |
| Rôle | {agent['role']} |
| Escouade | {squad['nom']} (`{squad['pitch']}`) |
| Niveau | {agent['niveau']} — {level['resume']} |
| Marchés | {agent['marches']} |
| Horizon | {agent['horizon']} |
| Rattachement | {("Lead de son escouade — mandat propre" if agent['rattachement'] == agent['slug'] else "`" + agent['rattachement'] + "`")} |
| Cadence | {agent['cadence']} |
| Version | {TEAM_VERSION} |

## Pitch

**{agent['pitch']}**

## Mandat

{agent['mission']}

## Quand le mobiliser

{wrap_bullets(agent['quand'])}

## Compétences signature

{wrap_bullets(agent['competences'])}

## Entrées exigées

{wrap_bullets(agent['entrees'])}

## Processus (SOP)

{numbered(agent['methode'])}

## Livrables

{wrap_bullets(agent['livrables'])}

## KPI d'évaluation

{wrap_bullets(agent['kpis'])}

## Garde-fous

{wrap_bullets(agent['garde_fous'] + GLOBAL_GUARDRAILS)}

## Anti-patrons

{wrap_bullets(agent['anti_patrons'])}

## Handoffs sortants

{chr(10).join(handoff_lines) if handoff_lines else "- Aucun : agent terminal, il publie et clôture."}

## Contrat de sortie

Chaque livrable se termine par :

```text
Statut      : OK | NEEDS WORK
Confiance   : bas / moyen / élevé — justification en une ligne
Données manquantes : liste ou « aucune »
Prochain handoff   : slug de l'agent destinataire ou « aucun »
```

## Activation

```text
Charge le skill `agents/{agent['slug']}/SKILL.md` puis exécute le mandat de {nom_complet(agent)}
sur le périmètre : {agent['marches']} / {agent['horizon']}.
```
"""
    return fm + body


def render_index() -> str:
    lines = [
        "# Index des 70 agents — Trading Agents Team",
        "",
        f"Version `{TEAM_VERSION}` · généré par `scripts/build_agents.py` — ne pas éditer à la main.",
        "",
        f"**{len(AGENTS)} agents** répartis en **{len(SQUADS)} escouades** et **{len(DEPARTMENTS)} départements**.",
        "",
        "## Vue par escouade",
        "",
    ]
    for squad_slug, squad in SQUADS.items():
        members = [a for a in AGENTS if a["squad"] == squad_slug]
        lines += [
            f"### {squad['nom']} — `{squad_slug}`",
            "",
            f"{squad['mission']}",
            "",
            f"Fiche : [`{squad['fichier']}`]({squad['fichier']}) · {len(members)} agents",
            "",
            "| # | Agent | Rôle | Niveau | Marchés | Horizon | SKILL | Profil |",
            "| --- | --- | --- | --- | --- | --- | --- | --- |",
        ]
        for agent in members:
            idx = AGENTS.index(agent) + 1
            lines.append(
                f"| {idx:02d} | {nom_complet(agent)} | {agent['role']} | {agent['niveau']} | "
                f"{agent['marches']} | {agent['horizon']} | "
                f"[SKILL](agents/{agent['slug']}/SKILL.md) | [agent.md](agents/{agent['slug']}/agent.md) |"
            )
        lines.append("")
    return "\n".join(lines)


def render_index_json() -> str:
    payload = {
        "team": "trading-agents-team",
        "version": TEAM_VERSION,
        "language": "fr",
        "count": len(AGENTS),
        "agents": [
            {
                "index": i + 1,
                "slug": a["slug"],
                "name": nom_complet(a),
                "role": a["role"],
                "squad": a["squad"],
                "squad_name": SQUADS[a["squad"]]["nom"],
                "department": a["dept"],
                "level": a["niveau"],
                "markets": a["marches"],
                "horizon": a["horizon"],
                "skill": f"agents/{a['slug']}/SKILL.md",
                "profile": f"agents/{a['slug']}/agent.md",
                "handoffs": a["handoffs"],
                "kpis": a["kpis"],
            }
            for i, a in enumerate(AGENTS)
        ],
    }
    return json.dumps(payload, ensure_ascii=False, indent=2) + "\n"


MARKER = re.compile(
    r"(<!-- BEGIN ROSTER:[a-z0-9-]+ -->)(.*?)(<!-- END ROSTER:[a-z0-9-]+ -->)",
    re.DOTALL,
)


def roster_table(squad_slug: str) -> str:
    members = [a for a in AGENTS if a["squad"] == squad_slug]
    rows = [
        "| # | Agent | Rôle | Niveau | Marchés | Horizon | Fiche |",
        "| --- | --- | --- | --- | --- | --- | --- |",
    ]
    for agent in members:
        idx = AGENTS.index(agent) + 1
        rows.append(
            f"| {idx:02d} | **{nom_complet(agent)}** | {agent['role']} | {agent['niveau']} | "
            f"{agent['marches']} | {agent['horizon']} | "
            f"[`{agent['slug']}`](../agents/{agent['slug']}/agent.md) |"
        )
    return "\n".join(rows)


def inject_rosters() -> list[str]:
    touched = []
    for path in sorted(SQUADS_DIR.glob("*.md")):
        text = path.read_text(encoding="utf-8")

        def repl(match: re.Match) -> str:
            squad_slug = re.search(r"ROSTER:([a-z0-9-]+)", match.group(1)).group(1)
            return f"{match.group(1)}\n{roster_table(squad_slug)}\n{match.group(3)}"

        new_text = MARKER.sub(repl, text)
        if new_text != text:
            path.write_text(new_text, encoding="utf-8")
            touched.append(path.name)
    return touched


def main() -> None:
    slugs = [a["slug"] for a in AGENTS]
    assert len(slugs) == len(set(slugs)), "Slugs dupliqués dans le roster"
    assert len(AGENTS) == 70, f"Le roster doit contenir 70 agents, trouvé {len(AGENTS)}"

    for agent in AGENTS:
        assert agent["squad"] in SQUADS, f"Escouade inconnue : {agent['squad']}"
        assert agent["dept"] in DEPARTMENTS, f"Département inconnu : {agent['dept']}"
        assert agent["niveau"] in LEVELS, f"Niveau inconnu : {agent['niveau']}"
        for target in agent["handoffs"]:
            assert target in slugs, f"Handoff cassé {agent['slug']} -> {target}"

    AGENTS_DIR.mkdir(exist_ok=True)
    for i, agent in enumerate(AGENTS, start=1):
        directory = AGENTS_DIR / agent["slug"]
        directory.mkdir(exist_ok=True)
        (directory / "SKILL.md").write_text(render_skill(agent), encoding="utf-8")
        (directory / "agent.md").write_text(render_profile(agent, i), encoding="utf-8")

    (ROOT / "INDEX.md").write_text(render_index(), encoding="utf-8")
    (ROOT / "index.json").write_text(render_index_json(), encoding="utf-8")

    touched = inject_rosters()
    print(f"{len(AGENTS)} agents générés dans agents/")
    print("Rosters injectés :", ", ".join(touched) if touched else "aucun changement")


if __name__ == "__main__":
    main()
