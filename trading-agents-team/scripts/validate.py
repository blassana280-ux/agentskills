#!/usr/bin/env python3
"""Contrôle qualité autonome de la Trading Agents Team.

Ne dépend d'aucune bibliothèque externe. Vérifie :
  1. la conformité minimale Agent Skills de chaque SKILL.md (nom, dossier, description, champs autorisés) ;
  2. la cohérence agent.md <-> index.json <-> SKILL.md (nom, rôle, escouade, niveau) ;
  3. l'intégrité des handoffs (les slugs ciblés existent) ;
  4. la cohérence des tableaux d'escouades (les 70 agents sont listés exactement une fois) ;
  5. l'absence de marqueurs de roster non injectés et de liens relatifs cassés.

Usage :
    python3 scripts/validate.py            # rapport lisible
    python3 scripts/validate.py --strict   # code retour 1 à la moindre erreur

Pour une validation croisée avec l'implémentation de référence :
    skills-ref validate agents/<slug>
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
AGENTS_DIR = ROOT / "agents"
SQUADS_DIR = ROOT / "squads"

ALLOWED_FIELDS = {"name", "description", "license", "allowed-tools", "metadata", "compatibility"}
NAME_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
MAX_NAME = 64
MAX_DESC = 1024
MAX_COMPAT = 500
EXPECTED_AGENTS = 70

errors: list[str] = []
warnings: list[str] = []


def parse_frontmatter(text: str) -> tuple[dict, str, list[str]]:
    """Parseur YAML minimal (scalaires + bloc metadata imbriqué)."""
    problems: list[str] = []
    if not text.startswith("---"):
        return {}, text, ["frontmatter manquant (le fichier doit commencer par ---)"]
    parts = text.split("---", 2)
    if len(parts) < 3:
        return {}, text, ["frontmatter non refermé par ---"]
    raw = parts[1]
    data: dict = {}
    nested: dict | None = None
    for line in raw.splitlines():
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if line.startswith("  ") and nested is not None:
            key, _, value = line.strip().partition(":")
            nested[key.strip()] = clean(value)
            continue
        if ":" not in line:
            problems.append(f"ligne invalide dans le frontmatter : {line!r}")
            continue
        key, _, value = line.partition(":")
        key, value = key.strip(), value.strip()
        if value == "":
            nested = {}
            data[key] = nested
            continue
        nested = None
        data[key] = clean(value)
    return data, parts[2], problems


def clean(value: str) -> str:
    value = value.strip()
    if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
        inner = value[1:-1]
        return inner.replace('\\"', '"').replace("\\\\", "\\")
    return value


def check_skill(skill_dir: Path, index_entry: dict) -> None:
    slug = skill_dir.name
    skill_md = skill_dir / "SKILL.md"
    profile = skill_dir / "agent.md"

    if not skill_md.exists():
        errors.append(f"{slug}: SKILL.md manquant")
        return
    if not profile.exists():
        errors.append(f"{slug}: agent.md manquant")

    meta, body, problems = parse_frontmatter(skill_md.read_text(encoding="utf-8"))
    for problem in problems:
        errors.append(f"{slug}: {problem}")

    extra = set(meta) - ALLOWED_FIELDS
    if extra:
        errors.append(f"{slug}: champs frontmatter non autorisés {sorted(extra)}")
    for field in ("name", "description"):
        if not meta.get(field):
            errors.append(f"{slug}: champ obligatoire manquant « {field} »")

    name = meta.get("name", "")
    if name != slug:
        errors.append(f"{slug}: name « {name} » ne correspond pas au dossier")
    if not NAME_RE.match(name):
        errors.append(f"{slug}: name doit être en minuscules kebab-case")
    if len(name) > MAX_NAME:
        errors.append(f"{slug}: name dépasse {MAX_NAME} caractères")
    if len(meta.get("description", "")) > MAX_DESC:
        errors.append(f"{slug}: description dépasse {MAX_DESC} caractères")
    if len(meta.get("compatibility", "")) > MAX_COMPAT:
        errors.append(f"{slug}: compatibility dépasse {MAX_COMPAT} caractères")
    if "license" not in meta:
        warnings.append(f"{slug}: licence absente (recommandé)")

    inner = meta.get("metadata", {})
    if not isinstance(inner, dict):
        inner = {}
    if inner.get("role") != index_entry["role"]:
        errors.append(f"{slug}: metadata.role incohérent avec index.json")
    if inner.get("squad") != index_entry["squad_name"]:
        errors.append(f"{slug}: metadata.squad incohérent avec index.json")
    if inner.get("level") != index_entry["level"]:
        errors.append(f"{slug}: metadata.level incohérent avec index.json")

    for heading in ("## 1. Identité et mandat", "## 4. Méthode de travail", "## 7. Garde-fous",
                    "## 9. Handoffs", "## 10. Prompt d'activation"):
        if heading not in body:
            errors.append(f"{slug}: section obligatoire absente « {heading} »")
    if "Aucune exécution d'ordre réelle" not in body:
        warnings.append(f"{slug}: garde-fou global d'exécution absent")

    if profile.exists():
        pmeta, pbody, pproblems = parse_frontmatter(profile.read_text(encoding="utf-8"))
        for problem in pproblems:
            errors.append(f"{slug}/agent.md: {problem}")
        if pmeta.get("agent") != slug:
            errors.append(f"{slug}/agent.md: champ agent incohérent")
        if pmeta.get("role") != index_entry["role"]:
            errors.append(f"{slug}/agent.md: rôle incohérent avec index.json")
        if pmeta.get("level") != index_entry["level"]:
            errors.append(f"{slug}/agent.md: niveau incohérent avec index.json")
        if "Contrat de sortie" not in pbody:
            errors.append(f"{slug}/agent.md: contrat de sortie absent")

    if "../" in body:
        for rel in re.findall(r"\]\(\.\./\.\./([^)#]+)\)", body):
            if not (ROOT / rel).exists():
                errors.append(f"{slug}: lien cassé vers {rel}")


def check_index() -> dict:
    path = ROOT / "index.json"
    if not path.exists():
        errors.append("index.json manquant")
        return {}
    payload = json.loads(path.read_text(encoding="utf-8"))
    agents = payload.get("agents", [])
    if payload.get("count") != EXPECTED_AGENTS:
        errors.append(f"index.json: count={payload.get('count')} au lieu de {EXPECTED_AGENTS}")
    if len(agents) != EXPECTED_AGENTS:
        errors.append(f"index.json: {len(agents)} agents au lieu de {EXPECTED_AGENTS}")
    slugs = [a["slug"] for a in agents]
    if len(set(slugs)) != len(slugs):
        errors.append("index.json: slugs dupliqués")
    for entry in agents:
        for target in entry.get("handoffs", []):
            if target not in slugs:
                errors.append(f"index.json: handoff cassé {entry['slug']} -> {target}")
        if not entry.get("skill") or not (ROOT / entry["skill"]).exists():
            errors.append(f"index.json: chemin de skill invalide pour {entry['slug']}")
        if not entry.get("profile") or not (ROOT / entry["profile"]).exists():
            errors.append(f"index.json: chemin de profil invalide pour {entry['slug']}")
    return {a["slug"]: a for a in agents}


def check_squads(index: dict) -> None:
    seen: dict[str, int] = {}
    for path in sorted(SQUADS_DIR.glob("*.md")):
        text = path.read_text(encoding="utf-8")
        if re.search(r"BEGIN ROSTER:[a-z0-9-]+ -->\s*<!-- END ROSTER", text):
            errors.append(f"{path.name}: marqueur de roster non injecté (lancer build_agents.py)")
        squad = path.stem
        listed = re.findall(r"\(\.\./agents/([a-z0-9-]+)/agent\.md\)", text)
        if not listed:
            errors.append(f"{path.name}: aucun agent listé")
        for slug in listed:
            seen[slug] = seen.get(slug, 0) + 1
            if slug not in index:
                errors.append(f"{path.name}: agent inconnu {slug}")
            elif index[slug]["squad"] != squad:
                errors.append(f"{path.name}: {slug} appartient en réalité à {index[slug]['squad']}")
        expected = sum(1 for a in index.values() if a["squad"] == squad)
        if len(listed) != expected:
            errors.append(f"{path.name}: {len(listed)} agents listés pour {expected} attendus")
    duplicates = [slug for slug, count in seen.items() if count > 1]
    if duplicates:
        errors.append(f"agents listés dans plusieurs escouades : {sorted(duplicates)}")
    if len(seen) != EXPECTED_AGENTS:
        errors.append(f"escouades : {len(seen)} agents listés au total au lieu de {EXPECTED_AGENTS}")


def main() -> int:
    index = check_index()

    dirs = sorted(d for d in AGENTS_DIR.iterdir() if d.is_dir())
    if len(dirs) != EXPECTED_AGENTS:
        errors.append(f"agents/ contient {len(dirs)} dossiers au lieu de {EXPECTED_AGENTS}")
    for directory in dirs:
        entry = index.get(directory.name)
        if entry is None:
            errors.append(f"{directory.name}: absent de index.json")
            continue
        check_skill(directory, entry)

    check_squads(index)

    print(f"Agents analysés        : {len(dirs)}")
    print(f"Skills validés         : {len(dirs) - sum(1 for e in errors if 'SKILL.md manquant' in e)}")
    print(f"Erreurs                : {len(errors)}")
    print(f"Avertissements         : {len(warnings)}")
    if warnings:
        print("\nAvertissements :")
        for warning in warnings:
            print(f"  · {warning}")
    if errors:
        print("\nErreurs :")
        for error in errors:
            print(f"  ✗ {error}")
        return 1
    print("\nOK — réseau cohérent et conforme au format Agent Skills.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
