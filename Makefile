
# =======================================
# Local Machine Commands
# =======================================

install:
	(cd sage-ai && npm i)

# =======================================
#  Development Environment
# =======================================

dev: sage-ai-dev-build note-viewer-dev-build
	docker-compose up sage-ai-dev localstack note-viewer-dev


note-viewer-dev: note-viewer-dev-build note-viewer-dev-run

note-viewer-dev-build:
	docker-compose build note-viewer-dev

note-viewer-dev-run:
	docker-compose up note-viewer-dev


sage-ai-dev: sage-ai-dev-build sage-ai-dev-run

sage-ai-dev-build:
	docker-compose build sage-ai-dev localstack

sage-ai-dev-run:
	docker-compose up sage-ai-dev localstack

# =======================================
#  Production Environment
# =======================================

# Temporarily using dev noteviewer to trigger recompiles with new file loads
prod: sage-ai-prod-build note-viewer-dev-build
	docker-compose up sage-ai-prod note-viewer-dev


note-viewer-prod: note-viewer-prod-build note-viewer-prod-run

note-viewer-prod-build:
	docker-compose build note-viewer-prod

note-viewer-prod-run:
	docker-compose up note-viewer-prod


sage-ai-prod: sage-ai-prod-build sage-ai-prod-run-detatched

sage-ai-prod-build: ts-compile
	docker-compose build sage-ai-prod

sage-ai-prod-run-detatched:
	docker-compose up sage-ai-prod

# =======================================
#  Utility
# =======================================

stop:
	docker-compose down

clean-all:
	docker system prune -a

ts-compile:
	(cd sage-ai && npm run build)

# =======================================
#  Debug
# =======================================

localstack_shell:
	docker exec -it localstack_main bash

sage-ai-dev-shell:
	docker exec -it sage-ai-dev bash