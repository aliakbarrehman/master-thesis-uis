#!/bin/bash
source ${PWD}/scripts/utils.sh

infoln "Stopping docker containers"
docker stop $(docker ps -a -q)
infoln "Removing docker containers"
docker rm $(docker ps -a -q)

infoln "Cleaning up docker resources"
docker system prune --volumes -f

infoln "Removing crypto material"
rm -rf crypto-config
rm -rf channel-artifacts
rm -rf explorer/crypto-config