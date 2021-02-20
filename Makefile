dev:
	@clear
	@docker-compose up --build

docs:
	@echo TODO docs

docker:
	@docker build -t tzador/bicoin-worker:v8 .
	@docker push  tzador/bicoin-worker:v8
