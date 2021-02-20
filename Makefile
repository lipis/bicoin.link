docker:
	@clear
	@docker-compose up --build

docs:
	@echo TODO docs

synth:
  @cdk synth

deploy: docs
	@cdk deploy
