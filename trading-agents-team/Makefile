.PHONY: build validate check clean list

build:            ## Régénère les 70 agents, INDEX.md, index.json et les tableaux d'escouades
	python3 scripts/build_agents.py

validate:         ## Contrôle de cohérence interne (sans dépendance)
	python3 scripts/validate.py

check: build validate  ## Pipeline complète avant commit

list:             ## Liste les 70 agents (slug + rôle)
	@python3 -c "import json;d=json.load(open('index.json'));[print(f\"{a['index']:02d}  {a['slug']:24s} {a['role']}\") for a in d['agents']]"

clean:            ## Supprime les caches Python
	rm -rf scripts/__pycache__ __pycache__
