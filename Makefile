dev:
	@clear
	@docker-compose up --build

docs:
	@echo TODO docs

docker:
	@docker build -t tzador/bicoin-worker .
	@docker push  tzador/bicoin-worker
