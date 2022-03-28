CC_PATH=$1
SEQ=$2
WORKING_DIR=${PWD}
# Step 1. Prepare Chaincode
cd ${PWD}/$CC_PATH
npm install
cd $WORKING_DIR

export FABRIC_CFG_PATH=$PWD/config/
export PATH=$PATH:/${PWD}/../bin/

# Check if the peer cli is available
peer version

peer lifecycle chaincode package basic.tar.gz --path $WORKING_DIR/chaincode/ --lang node --label basic_1.0

# Step 2. Install Chaincode on peers
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="UiSMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/mnt/c/Users/Rehman/Downloads/Thesis/master-thesis-uis/hyperledger-network/crypto-config/peerOrganizations/uis.example.com/peers/peer0.uis.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/mnt/c/Users/Rehman/Downloads/Thesis/master-thesis-uis/hyperledger-network/crypto-config/peerOrganizations/uis.example.com/users/Admin@uis.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051

peer lifecycle chaincode install basic.tar.gz


export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="UiBMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/mnt/c/Users/Rehman/Downloads/Thesis/master-thesis-uis/hyperledger-network/crypto-config/peerOrganizations/uib.example.com/peers/peer0.uib.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/mnt/c/Users/Rehman/Downloads/Thesis/master-thesis-uis/hyperledger-network/crypto-config/peerOrganizations/uib.example.com/users/Admin@uib.example.com/msp
export CORE_PEER_ADDRESS=localhost:8051

peer lifecycle chaincode install basic.tar.gz


export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="UiOMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/mnt/c/Users/Rehman/Downloads/Thesis/master-thesis-uis/hyperledger-network/crypto-config/peerOrganizations/uio.example.com/peers/peer0.uio.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/mnt/c/Users/Rehman/Downloads/Thesis/master-thesis-uis/hyperledger-network/crypto-config/peerOrganizations/uio.example.com/users/Admin@uio.example.com/msp
export CORE_PEER_ADDRESS=localhost:9051

peer lifecycle chaincode install basic.tar.gz

# Step 3. Approve Chaincode Definition for your organization
export CC_PACKAGE_ID=basic_1.0:c13977738940cc1d8dff2a990263eba08da2cc3f98c51616b942c9345cd5d4ff

# Approve as UiO
peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID datachannel --name basic --version 1.0 --package-id $CC_PACKAGE_ID --sequence $SEQ --tls --cafile "${PWD}/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"

# Approve as UiS
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="UiSMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/mnt/c/Users/Rehman/Downloads/Thesis/master-thesis-uis/hyperledger-network/crypto-config/peerOrganizations/uis.example.com/peers/peer0.uis.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/mnt/c/Users/Rehman/Downloads/Thesis/master-thesis-uis/hyperledger-network/crypto-config/peerOrganizations/uis.example.com/users/Admin@uis.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051

peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID datachannel --name basic --version 1.0 --package-id $CC_PACKAGE_ID --sequence $SEQ --tls --cafile "${PWD}/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"

#We now have the majority we need to deploy the asset-transfer (basic) the chaincode to the channel. While only a majority of organizations need to approve a chaincode definition (with the default policies), all organizations need to approve a chaincode definition to start the chaincode on their peers. If you commit the definition before a channel member has approved the chaincode, the organization will not be able to endorse transactions. As a result, it is recommended that all channel members approve a chaincode before committing the chaincode definition.

# Approve as UiB
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="UiBMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/mnt/c/Users/Rehman/Downloads/Thesis/master-thesis-uis/hyperledger-network/crypto-config/peerOrganizations/uib.example.com/peers/peer0.uib.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/mnt/c/Users/Rehman/Downloads/Thesis/master-thesis-uis/hyperledger-network/crypto-config/peerOrganizations/uib.example.com/users/Admin@uib.example.com/msp
export CORE_PEER_ADDRESS=localhost:8051

peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID datachannel --name basic --version 1.0 --package-id $CC_PACKAGE_ID --sequence $SEQ --tls --cafile "${PWD}/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"

# Step 4. Commit chaincode definition to the channel
# Only One Org needs to do it
peer lifecycle chaincode checkcommitreadiness --channelID datachannel --name basic --version 1.0 --sequence $SEQ --tls --cafile "${PWD}/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" --output json

peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID datachannel --name basic --version 1.0 --sequence $SEQ --tls --cafile "${PWD}/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/crypto-config/peerOrganizations/uis.example.com/peers/peer0.uis.example.com/tls/ca.crt" --peerAddresses localhost:8051 --tlsRootCertFiles "${PWD}/crypto-config/peerOrganizations/uib.example.com/peers/peer0.uib.example.com/tls/ca.crt" --peerAddresses localhost:9051 --tlsRootCertFiles "${PWD}/crypto-config/peerOrganizations/uio.example.com/peers/peer0.uio.example.com/tls/ca.crt"

peer lifecycle chaincode querycommitted --channelID datachannel --name basic --cafile "${PWD}/../crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"

peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com -C datachannel -n basic --tls --cafile "${PWD}/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/crypto-config/peerOrganizations/uis.example.com/peers/peer0.uis.example.com/tls/ca.crt" --peerAddresses localhost:8051 --tlsRootCertFiles "${PWD}/crypto-config/peerOrganizations/uib.example.com/peers/peer0.uib.example.com/tls/ca.crt" --peerAddresses localhost:9051 --tlsRootCertFiles "${PWD}/crypto-config/peerOrganizations/uio.example.com/peers/peer0.uio.example.com/tls/ca.crt" -c '{"function":"InitLedger","Args":[]}'

# peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "${PWD}/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C datachannel -n basic --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/crypto-config/peerOrganizations/uis.example.com/peers/peer0.uis.example.com/tls/ca.crt" --peerAddresses localhost:8051 --tlsRootCertFiles "${PWD}/crypto-config/peerOrganizations/uib.example.com/peers/peer0.uib.example.com/tls/ca.crt" --peerAddresses localhost:9051 --tlsRootCertFiles "${PWD}/crypto-config/peerOrganizations/uio.example.com/peers/peer0.uio.example.com/tls/ca.crt" -c '{"function":"AddDataBlock","Args":["{id:1,title:Sample,description:data,owner:uis,host:vm.uis.example.com,path:/data}"]}'

# peer chaincode query -C datachannel -n basic -c '{"Args":["GetAllDataBlocks"]}'
