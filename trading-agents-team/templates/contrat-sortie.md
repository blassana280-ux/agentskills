# Modèle de contrat de sortie

Tout livrable d'agent se termine par ce bloc, sans exception. C'est ce qui rend 70 agents
compatibles : une sortie lisible et chaînable sans relire tout le contexte.

```text
Statut             : OK | NEEDS WORK
Confiance          : bas | moyen | élevé — justification en une ligne
Données manquantes : <liste> ou « aucune »
Prochain handoff   : <slug> ou « aucun »
```

## Variante détaillée (livrables complexes)

```text
Statut             : NEEDS WORK
Confiance          : moyen — structure de prix claire, mais coûts d'exécution non mesurés
Données manquantes : coûts de courtage réels ; encours de l'ETF ; calendrier de résultats du titre
Prochain handoff   : theo-martin (mesure des coûts) puis karim-belkacem (validation de l'exposition)

Hypothèses retenues
- VWAP de séance calculé sur la session complète (09:00–17:30, fuseau Europe/Paris)
- Coût provisoire de 8 points de base, à confirmer par TCA

Points de désaccord
- Avec rafael-santos : scénario de repli à 3 % contre 1,5 %. Retenu : 3 % (structure hebdomadaire).
```

## Quand utiliser chaque statut

| Statut | Signification |
| --- | --- |
| **OK** | Preuves datées, limites explicitées, aucune donnée critique manquante |
| **NEEDS WORK** | Il manque une preuve, une donnée, ou la revue adverse n'a pas eu lieu — statut par défaut |

Un livrable « OK » qui contient « données manquantes : oui » est une contradiction : repassez en
**NEEDS WORK**.

## Ce qui n'est pas un contrat de sortie valide

- « Tout est bon, n'hésitez pas si besoin. »
- « Analyse terminée. » (sans confiance, sans données manquantes)
- Un statut sans justification de confiance.
- Un handoff vers un slug inexistant.
