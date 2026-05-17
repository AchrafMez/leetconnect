up: certs ip
	docker compose up --build

up-d: certs ip
	docker compose up --build -d

down:
	docker compose down

re: clean certs ip
	docker compose up --build -d

ip:
	@chmod +x scripts/getLocalIpforOauth.sh
	@./scripts/getLocalIpforOauth.sh

certs:
	@if [ ! -d "./certs" ]; then \
		echo "gen local SSL certs..."; \
		chmod +x scripts/gen-certs.sh; \
		./scripts/gen-certs.sh; \
	else \
		echo "certs already exist."; \
	fi

clean:
	docker compose down -v
	rm -rf certs

fclean:
	docker compose down -v --rmi all
	rm -rf certs

logs:
	docker compose logs -f

ps:
	docker compose ps

logs-auth:
	docker compose logs -f auth

logs-market:
	docker compose logs -f marketplace

logs-chat:
	docker compose logs -f chat

logs-analytics:
	docker compose logs -f analytics

logs-admin:
	docker compose logs -f admin

logs-nginx:
	docker compose logs -f nginx

logs-front:
	docker compose logs -f frontend

logs-db:
	docker compose logs -f postgres

health:
	@echo -n "\nauth: "; curl -sk https://localhost/api/auth/health || echo "not reachable"
	@echo -n "\nmarketplace: "; curl -sk https://localhost/api/market/health || echo "not reachable"
	@echo -n "\nchat: "; curl -sk https://localhost/api/chat/health || echo "not reachable"
	@echo -n "\nanalytics: "; curl -sk https://localhost/api/analytics/health || echo "not reachable"
	@echo -n "\nadmin: "; curl -sk https://localhost/api/admin/health || echo "not reachable"
	@echo ""

seed:
	docker cp scripts/seed.js auth:/app/service/seed.js
	docker exec -w /app/service auth node seed.js