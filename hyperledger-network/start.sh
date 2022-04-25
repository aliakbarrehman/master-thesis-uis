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
infoln "Creating Orderer Organization"
createOrderer 
