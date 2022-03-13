source ${PWD}/scripts/utils.sh
source ${PWD}/scripts/env.sh
export PATH=$PATH:/${PWD}/../bin/
export FABRIC_CFG_PATH=${PWD}/config
export CHANNEL_NAME="datachannel"
infoln "***********************************"
infoln "       Starting network            "
infoln "***********************************"

createDir "crypto-config"
createDir "crypto-config/ordererOrganizations/example.com/msp"
copyDir "config/fabric-ca" "crypto-config"

docker-compose -f docker-compose.ca.yml up -d
waitForFileCreated "crypto-config/fabric-ca/uis/tls-cert.pem"
infoln "Invoking registering and enroll scripts..."
source ${PWD}/scripts/enroll.sh
infoln "Creating UiS Identities"
createOrg uis 7054
infoln "Creating UiB Identities"
createOrg uib 8054
infoln "Creating UiO Identities"
createOrg uio 9054
infoln "Creating Orderer Organization"
createOrderer 
# infoln "Running Network Infrastructure"
# docker-compose -f docker-compose.network.yml up -d
# infoln "Generating CCP files for UiS, UiO and UiB"
# ${PWD}/scripts/ccpGenerate.sh
# infoln "Creating Channel"
# ${PWD}/scripts/createChannel.sh $CHANNEL_NAME
# infoln "Running Hyperledger explorer"
# #This command will rename all keystores present in the peers folder
# infoln "Running Hyperledger explorer"
# for file in $(ls -R ${PWD}/crypto-config/peerOrganizations/ | grep keystore: | cut -d':' -f 1  | sed 's/$//'); do mv $file/* $file/key; done
# mkdir -p ${PWD}/explorer/crypto-config
# cp -r ${PWD}/crypto-config/* ${PWD}/explorer/crypto-config/
# docker-compose -f ${PWD}/explorer/docker-compose.yml up -d