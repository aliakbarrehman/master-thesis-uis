#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#

# This script extends the Hyperledger Fabric test network by adding
# adding a third organization to the network
#

# Example command to run: addOrg.sh uio UiO 9051 9054
source ${PWD}/scripts/utils.sh
source ${PWD}/scripts/env.sh

infoln "Update environment variables for new Organization..."

ORG=$1
ORG_CAPS=$2
P0PORT=$3
CAPORT=$4
MSP_NAME=$ORG_CAPS"MSP"

# infoln "Setting env variables..."
export PATH=$PATH:/${PWD}/../bin/
export FABRIC_CFG_PATH=${PWD}/addOrg

infoln "Running ca server..."
copyDir "${PWD}/addOrg/fabric-ca/uio" "${PWD}/crypto-config/fabric-ca"
docker-compose -f ${PWD}/addOrg/docker-compose.ca.yml up -d
waitForFileCreated "${PWD}/crypto-config/fabric-ca/uio/tls-cert.pem"
source ${PWD}/scripts/enroll.sh
infoln "Creating $ORG_CAPS Identities"
createOrg $ORG $CAPORT
source ${PWD}/scripts/ccpGenerate.sh
infoln "Generating CCP files for $ORG_CAPS"
ccpGenerate $ORG $ORG_CAPS $P0PORT $CAPORT

infoln "Generating $ORG_CAPS Definitations"
configtxgen -printOrg $MSP_NAME > ${PWD}/crypto-config/peerOrganizations/$ORG.example.com/$ORG.json
infoln "Bringing up $ORG_CAPS peer"
docker-compose -f ${PWD}/addOrg/docker-compose.network.yml up -d
infoln "Generating and submitting config tx to add $ORG_CAPS"
docker exec cli ./scripts/updateChannelConfig.sh datachannel 3 10 false uio
infoln "Joining $ORG peer to the channel..."
docker exec cli ./scripts/joinChannel.sh datachannel 3 10 false