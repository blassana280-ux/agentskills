#!/usr/bin/env python3
"""Métadonnées structurantes de la Trading Agents Team : escouades, départements, niveaux."""

from __future__ import annotations

TEAM_VERSION = "1.0.0"

DEPARTMENTS = {
    "direction": {
        "nom": "Direction & Orchestration",
        "mission": "Fixer le mandat, arbitrer les priorités, garantir la cohérence du réseau.",
    },
    "recherche": {
        "nom": "Recherche & Macro",
        "mission": "Produire le cadre macroéconomique et les thèses de marché de haut niveau.",
    },
    "analyse": {
        "nom": "Analyse de marché",
        "mission": "Décoder le prix, la structure et les fondamentaux des instruments.",
    },
    "quant": {
        "nom": "Quantitatif & Data",
        "mission": "Transformer les données en modèles testés, reproductibles et mesurés.",
    },
    "ia": {
        "nom": "IA & Automatisation",
        "mission": "Industrialiser la recherche et la décision avec des modèles évalués et surveillés.",
    },
    "risque": {
        "nom": "Risque & Conformité",
        "mission": "Borner la perte, garantir la conformité et valider les modèles de façon indépendante.",
    },
    "execution": {
        "nom": "Exécution & Opérations",
        "mission": "Transformer une intention de trade en exécution mesurée, documentée et contrôlée.",
    },
    "portefeuille": {
        "nom": "Portefeuille & Allocation",
        "mission": "Composer, arbitrer et suivre l'allocation au niveau du portefeuille.",
    },
    "crypto": {
        "nom": "Actifs numériques",
        "mission": "Couvrir l'on-chain, la DeFi, les dérivés numériques et leur réglementation.",
    },
    "produits": {
        "nom": "Produits dérivés & Structuration",
        "mission": "Concevoir et analyser options, futures, swaps et structures sur mesure.",
    },
    "tech": {
        "nom": "Ingénierie & Infrastructure",
        "mission": "Fournir une plateforme de données et d'exécution fiable, testée et réplicable.",
    },
    "formation": {
        "nom": "Formation & Documentation",
        "mission": "Rendre le réseau compréhensible, documenté et transmissible.",
    },
}

LEVELS = {
    "Lead": {
        "annees": "12-18",
        "resume": "cadre la doctrine de son escouade, arbitre les désaccords, répond du résultat collectif",
    },
    "Senior": {
        "annees": "7-12",
        "resume": "produit seul les analyses complexes et encadre la qualité des travaux des spécialistes",
    },
    "Spécialiste": {
        "annees": "4-7",
        "resume": "excelle sur un périmètre étroit et descend plus profond que les profils généralistes",
    },
    "Analyste": {
        "annees": "1-3",
        "resume": "exécute les tâches standardisées sous supervision et alimente les analyses",
    },
}

SQUADS = {
    "s1-commandement": {
        "nom": "Commandement",
        "pitch": "le cerveau qui priorise, arbitre et rend le réseau lisible",
        "mission": "Traduire une demande en plan de bataille, mobiliser les bonnes escouades et garantir "
        "que le livrable final tient debout face au risque, au marché et à l'audit.",
        "fichier": "squads/s1-commandement.md",
        "departement": "direction",
        "lead": "amina-cisse",
    },
    "s2-macro": {
        "nom": "Macro & Géopolitique",
        "pitch": "le cadre du monde avant le cadre du trade",
        "mission": "Produire une lecture macroéconomique datée et sourcée : croissance, inflation, "
        "banques centrales, devises, géopolitique, matières premières.",
        "fichier": "squads/s2-macro.md",
        "departement": "recherche",
        "lead": "helena-voss",
    },
    "s3-analyse-technique": {
        "nom": "Analyse Technique",
        "pitch": "lire le prix tel qu'il est, pas tel qu'on l'espère",
        "mission": "Décrire la structure de marché multi-échelle, les niveaux significatifs et les "
        "scénarios probabilisés, avec invalidation explicite.",
        "fichier": "squads/s3-analyse-technique.md",
        "departement": "analyse",
        "lead": "rafael-santos",
    },
    "s4-recherche-fondamentale": {
        "nom": "Recherche Fondamentale",
        "pitch": "comprendre ce qu'on achète, pas seulement son cours",
        "mission": "Évaluer la valeur, la qualité et les catalyseurs des instruments : actions, crédit, "
        "matières premières, ETF, événements corporate.",
        "fichier": "squads/s4-recherche-fondamentale.md",
        "departement": "analyse",
        "lead": "nadia-haddad",
    },
    "s5-quant": {
        "nom": "Quantitatif & Data",
        "pitch": "si ce n'est pas testé, ce n'est pas un signal",
        "mission": "Construire des mesures, facteurs, backtests et modèles de risque reproductibles, "
        "avec contrôle du sur-apprentissage et coûts de transaction réalistes.",
        "fichier": "squads/s5-quant.md",
        "departement": "quant",
        "lead": "arjun-mehta",
    },
    "s6-ia": {
        "nom": "IA & Automatisation",
        "pitch": "des modèles utiles, évalués, surveillés — pas des démos",
        "mission": "Appliquer le machine learning, le NLP et l'apprentissage par renforcement à la "
        "recherche et à l'aide à la décision, avec garde-fous et suivi de dérive.",
        "fichier": "squads/s6-ia.md",
        "departement": "ia",
        "lead": "nora-el-amrani",
    },
    "s7-risque-conformite": {
        "nom": "Risque & Conformité",
        "pitch": "la survie d'abord, la performance ensuite",
        "mission": "Mesurer, limiter et documenter les risques de marché, de liquidité, de contrepartie "
        "et de modèle, et garantir la conformité réglementaire.",
        "fichier": "squads/s7-risque-conformite.md",
        "departement": "risque",
        "lead": "claire-dubois",
    },
    "s8-execution": {
        "nom": "Exécution & Opérations",
        "pitch": "le meilleur signal est détruit par une mauvaise exécution",
        "mission": "Concevoir des plans d'exécution mesurés (prix, taille, timing, coût), suivre la "
        "qualité d'exécution et documenter chaque opération.",
        "fichier": "squads/s8-execution.md",
        "departement": "execution",
        "lead": "yannick-kouassi",
    },
    "s9-portefeuille": {
        "nom": "Portefeuille & Allocation",
        "pitch": "le portefeuille est plus que la somme des trades",
        "mission": "Composer l'allocation, dimensionner les positions, gérer la trésorerie et mesurer la "
        "performance par attribution.",
        "fichier": "squads/s9-portefeuille.md",
        "departement": "portefeuille",
        "lead": "laurent-mercier",
    },
    "s10-crypto": {
        "nom": "Actifs Numériques",
        "pitch": "l'on-chain ne ment pas, mais il bruit",
        "mission": "Couvrir crypto-actifs et DeFi : données on-chain, liquidité, dérivés, rendement et "
        "contraintes réglementaires propres à l'écosystème.",
        "fichier": "squads/s10-crypto.md",
        "departement": "crypto",
        "lead": "zoe-leclerc",
    },
    "s11-produits-derives": {
        "nom": "Produits Dérivés & Structuration",
        "pitch": "la bonne exposition au bon coût",
        "mission": "Analyser et structurer options, futures, swaps et stratégies de volatilité, avec "
        "valorisation, grecques et scénarios de payoff explicites.",
        "fichier": "squads/s11-produits-derives.md",
        "departement": "produits",
        "lead": "antonio-rossi",
    },
    "s12-infrastructure-formation": {
        "nom": "Infrastructure & Formation",
        "pitch": "une plateforme fiable et une équipe qui comprend ce qu'elle fait",
        "mission": "Fournir la plateforme de données, d'automatisation et de documentation qui rend le "
        "réseau reproductible, et former les utilisateurs à ses limites.",
        "fichier": "squads/s12-infrastructure-formation.md",
        "departement": "tech",
        "lead": "brigitte-moreau",
    },
}


def A(**kwargs) -> dict:
    """Normalise une fiche agent et applique les valeurs par défaut."""
    defaults = {
        "horizon": "Intraday à hebdomadaire",
        "cadence": "À la demande, sur brief d'orchestration",
        "rattachement": None,
        "competences": [],
        "handoffs": [],
        "handoff_note": "",
        "garde_fous": [],
        "anti_patrons": [],
        "kpis": [],
    }
    agent = {**defaults, **kwargs}
    required = [
        "slug", "prenom", "nom", "role", "squad", "dept", "niveau", "marches",
        "pitch", "mission", "quand", "entrees", "methode", "livrables",
    ]
    missing = [key for key in required if not agent.get(key)]
    assert not missing, f"{agent.get('slug', '?')} : champs manquants {missing}"
    if agent["rattachement"] is None:
        agent["rattachement"] = SQUADS[agent["squad"]]["lead"]
    assert agent["squad"] in SQUADS, f"Escouade inconnue : {agent['squad']}"
    assert agent["dept"] in DEPARTMENTS, f"Département inconnu : {agent['dept']}"
    assert agent["niveau"] in LEVELS, f"Niveau inconnu : {agent['niveau']}"
    return agent
