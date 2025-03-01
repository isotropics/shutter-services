## Shutter Analytics Agent
## Overview
  This system automates the logs reading from the MEV bot and interacts with HTTP service to push the logs for MEV dahboard.

## Main Components
 - Collection Behaviour: Responsible for reading the logs thats generated by MEV boats and interacts with HTTP Service to inserts the logs into Database, Then enters into wait states for a specified amount of time to read again the logs.
 - Wait Behaviour: Responsible for waiting for a specified period before entering into collection state.

## System requirements

- Python `>=3.10`
- [Tendermint](https://docs.tendermint.com/v0.34/introduction/install.html) `==0.34.19`
- [IPFS node](https://docs.ipfs.io/install/command-line/#official-distributions) `==0.6.0`
- [Pip](https://pip.pypa.io/en/stable/installation/)
- [Poetry](https://python-poetry.org/)
- [Docker Engine](https://docs.docker.com/engine/install/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Set Docker permissions so you can run containers as non-root user](https://docs.docker.com/engine/install/linux-postinstall/)

## Run you own agent

### Get the code

1. Clone this repo:

    ```
    https://github.com/isotropics/shutter-services.git
    ```

2. Create the virtual environment:

    ```
    cd analytics-agent
    poetry shell
    poetry install
    ```

3. Sync packages:

    ```
    autonomy packages sync --update-packages
    ```

### Prepare the data

1. Prepare a `keys.json` file containing wallet address and the private key for each of the  agents.You can generate as many as agents as per the need.Its mandatory to create at least 1.

    ```
    autonomy generate-key ethereum -n 1
    ```

2. Prepare a `ethereum_private_key.txt` file containing one of the private keys from `keys.json`. Ensure that there is no newline at the end.


3. Make a copy of the env file:

    ```
    cp sample.env .env
    ```

7. Fill in the required environment variables in .env. The necessary variables include:
    - ALL_PARTICIPANTS: The list of all agent wallet addresses.
    - LOG_PATH: Set this to your read the logs for processing.
    - BASE_URL: Base Url of HTTP Service.
    - API_KEY: API Key to interact with http service.
    - WAIT_TIME: Set the duration for agent to wait before reading the logs (e.g., 10 seconds).

### Run a single agent

1. Verify that `ALL_PARTICIPANTS` in `.env` contains only 1 address.

2. Run the single agent:

    ```
    bash run_agent.sh
    ```

### Run the service (multiple agents)

1. Check that Docker is running:

    ```
    docker
    ```

2. Verify that `ALL_PARTICIPANTS` in `.env` contains no of agents addresses.

3. Run the service:

    ```
    bash run_service.sh
    ```

4. Look at the service logs for one of the agents (on another terminal):

    ```
    docker logs -f <service name>
    ```


Note: 
```
- To run single agent pls use run_agent.sh
- To run multiple agent use run_service.sh and change the service config file accordingly (packages/isotrop/services/shutter_analytics_service/service.yaml)
 ```
