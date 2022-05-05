#!/bin/bash
export PATH=$PATH:/${PWD}/../bin/
source ${PWD}/scripts/utils.sh
source ${PWD}/scripts/env.sh
export PATH=$PATH:/${PWD}/../bin/
export FABRIC_CFG_PATH=${PWD}/config
export CHANNEL_NAME="datachannel"
infoln "Running Network Infrastructure"
docker-compose -f docker-compose.network.yml up -d
infoln "Generating CCP files for UiS and UiB"
source ${PWD}/scripts/ccpGenerate.sh
ccpGenerate uis UiS 7051 7054
ccpGenerate uib UiB 8051 8054
infoln "Creating Channel"
CHANNEL_NAME=datachannel
${PWD}/scripts/createChannel.sh $CHANNEL_NAME
infoln "Running Hyperledger explorer"
#This command will rename all keystores present in the peers folder
infoln "Running Hyperledger explorer"
for file in $(ls -R ${PWD}/crypto-config/peerOrganizations/ | grep keystore: | cut -d':' -f 1  | sed 's/$//'); do mv $file/* $file/key; done
mkdir -p ${PWD}/explorer/crypto-config

./addOrg/addOrg.sh uio UiO 9051 9054
for file in $(ls -R ${PWD}/crypto-config/peerOrganizations/ | grep keystore: | cut -d':' -f 1  | sed 's/$//'); do mv $file/* $file/key; done

echo "Deploying chaincode"
./scripts/deploy.sh chaincode 1 data datachannel
