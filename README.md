### Data Sharing Between Untrusting Organizations for Complex AI Analytics

The overall architecture of the project is summarized in the following diagram. The Parts in green are in the scope of this project. The red arrows indicate integrations between other parts of the proof of concept that are not in place yet.

![Architecture Diagram](https://github.com/aliakbarrehman/master-thesis-uis/blob/master/Overview.jpg?raw=true)

The scope of this project comprises of following parts:
1. Hyperledger Network (with 3 Organizations and chaincode for maintaining data ledger)
2. A Proof of Concept Rest API that Each Organization can use
3. Jupyterhub on Kubernetes (k8s) where each organization can contribute nodes
    * Kubernetes Cluster with Jupyterhub and Argo spun up
    * DataExplorer Extension for Jupyterhub
    * Customized Jupyterflow ([aliakbarrehman/jupyterflow](https://github.com/aliakbarrehman/jupyterflow)) Forked from ([hongkunyoo/jupyterflow](https://github.com/hongkunyoo/jupyterflow))

#### How it Works
1. Data that is availabe for consumption has its meta data available on blockchain
2. Data itself can be hosted on k8s nodes or Azure Fileshares
3. User logs in to jupyterhub on k8s
4. DataExplorer Extension reads from REST API which in turn interacts with blockchain network and chaincode
5. When a data is selected to be used
    * Data is leased from the organization (Lease expires after some time through chaincode)
    * Encrypted meta data is read from the API (which decrypts it as well)
    * Creates a directory structure for experimenting as well
6. User writes code to consume data
7. User writes a Jupyterflow workflow.yaml file of the following format
```yaml
jobs:
- command: 'pwd' 
- command: 'ls /home/jovyan/'
- command: 'ls -la /home/jovyan/uis'
  volumes:
  - id: '6de22e830ce4661cbeb6b9b2167c3f206dd946eb89beecd2f20bb17e85e64995'
    name: 'uis'
    path: '/home/jovyan/uis'
- command: 'ls'

# Job index starts at 1.
dags:
- 1 >> 2
- 1 >> 3
- 1 >> 4
```
8. User runs command
```shell
jupyterflow run -f workflow.yaml
```
9. Jupyterflow mounts the necessary data as a volume, generates an Argo workflow and triggers it

#### How to Run
1. Get a machine with a public IP that k8s cluster can call
2. SSH into the machine
    * **Pre-Requisites** Docker, Docker Compose, NodeJS and NPM
    * Clone this repository (`git clone https://github.com/aliakbarrehman/jupyterflow && cd master-thesis-uis`)
    * Run `./spinUpNetwork.sh` that Installs the Pre-Reqs as well as spins up the network with keys in hyperledger-network/crypto-config and spins up Rest API as well as REDIS Cache and MySQL DB
    * **Alternatively** for more granular control you can install requirements and run `cd hyperledger-network` and then `./start.sh`
    * Run `./start.network.sh`
    * Run `cd ../rest-api` and then `docker-compose up -d`
3. On k8s machine
    * **Pre-Requisites** Docker, NodeJS, NPM, Python, PIP, Kubernetes and helm
    * Clone this repository (`git clone https://github.com/aliakbarrehman/jupyterflow && cd master-thesis-uis`)
    * Change directory to jupyterhub (`cd jupyterhub`)
    * Create a docker registry account and login to it `docker login hub.docker.com`
    * Run with your own registry name e.g `./buildJupyterhub aliakbarrehman/jupyterhub`. This script creates a k8s service account, packages extension from `jupyterhub/extension/thesis_extension` (Some usefull commands in `extension/usefulCommandsForDevelopment.sh` for development), packages extension from `jupyterhub/jupyterflow` and builds a docker image with all the previous packages installed and configured (This image will be used for spinning up a users notebooks / jupyterhub instances and pushes that image)
    * Change `singleuser.image.name` and `singleuser.image.tag` in `jupyterhub/config.yaml` with your own
    * Change IP in `jupyterhub/blockchain-service.yaml` with the public IP of the hyperledger network
    * Change IP in `jupyterhub/extension/thesis_extension/src/utils/api.ts` with the public IP of the hyperledger network
    * Run `./runJupyterhub.sh`
4. Jupyterhub can be access at http://localhost and Argo can be access at https://localhost:2746/workflows
5. After logging into Jupyterhub (for testing you can use user as username and password as password)
6. Explore datasets available on DataExplorer
7. Use it by writing code and workflow.yaml and running the workflow as described above
8. View the workflow status on Argo at https://localhost:2746/workflows