#!/usr/bin/env python3
"""Roster consolidé des 70 agents de la Trading Agents Team."""

from roster_core import DEPARTMENTS, LEVELS, SQUADS, TEAM_VERSION, A  # noqa: F401
from roster_a import AGENTS_A
from roster_b import AGENTS_B

AGENTS = AGENTS_A + AGENTS_B

__all__ = ["AGENTS", "DEPARTMENTS", "LEVELS", "SQUADS", "TEAM_VERSION", "A"]
