# BiCoin

Bla bla bla.

[Read The Source](https://tzador.github.io/bicoin.link)

# Protocol

    { "query": "balance.get#user-id-12345", "echo": 123456789 }
    { "result": "balance.get#user-id-12345", value: 4, "echo": 123456789 }
    { "action": "balance.get#user-id-12345", "echo": 123456789 }
    { "update": "balance.get#user-id-12345", value: 4, "echo": 123456789 }

# TODO

- bets timeout
- view source
- magnifying glass
- labels
- zebra full screen and zero overlay
- multiple tickers
- animations
- retina support
- pub/sub
- sound/speach
- scores
- tests
- zooming

# DONE

- device pixel ratio
- render history

# Welcome to your CDK TypeScript project!

This is a blank project for TypeScript development with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

    docker:
        @clear
        @docker-compose up --build

    docs:
        @echo TODO docs

- `make` run locally
- `make docs` generate docs
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template
