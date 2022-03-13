#!/bin/bash
. scripts/utils.sh

export CORE_PEER_TLS_ENABLED=true
export ORDERER_CA=${PWD}/crypto-config/ordererOrganizations/example.com/tlsca/tlsca.example.com-cert.pem
export PEER0_UIS_CA=${PWD}/crypto-config/peerOrganizations/uis.example.com/tlsca/tlsca.uis.example.com-cert.pem
export PEER0_UIB_CA=${PWD}/crypto-config/peerOrganizations/uib.example.com/tlsca/tlsca.uib.example.com-cert.pem
export PEER0_UIO_CA=${PWD}/crypto-config/peerOrganizations/uio.example.com/tlsca/tlsca.uio.example.com-cert.pem
export ORDERER_ADMIN_TLS_SIGN_CERT=${PWD}/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/tls/server.crt
export ORDERER_ADMIN_TLS_PRIVATE_KEY=${PWD}/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/tls/server.key

# Hyperledger explorer environment variables (Used in docker compose file docker-compose-explorer.yaml)
export EXPLORER_CONFIG_FILE_PATH=${PWD}/explorer/config.json
export EXPLORER_PROFILE_DIR_PATH=${PWD}/explorer/connection-profile
export FABRIC_CRYPTO_PATH=${PWD}/crypto-config

# Set environment variables for the peer org
setGlobals() {
  USING_ORG=$1
  infoln "Using organization ${USING_ORG}"
  if [ "$USING_ORG" = "uis" ]; then
    export CORE_PEER_LOCALMSPID="UiSMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_UIS_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/crypto-config/peerOrganizations/uis.example.com/users/Admin@uis.example.com/msp
    export CORE_PEER_ADDRESS=localhost:7051
  elif [ "$USING_ORG" = "uib" ]; then
    export CORE_PEER_LOCALMSPID="UiBMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_UIB_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/crypto-config/peerOrganizations/uib.example.com/users/Admin@uib.example.com/msp
    export CORE_PEER_ADDRESS=localhost:8051

  elif [ "$USING_ORG" = "uio" ]; then
    export CORE_PEER_LOCALMSPID="UiOMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_UIO_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/crypto-config/peerOrganizations/uio.example.com/users/Admin@uio.example.com/msp
    export CORE_PEER_ADDRESS=localhost:9051
  else
    errorln "ORG Unknown"
  fi

  if [ "$VERBOSE" == "true" ]; then
    env | grep CORE
  fi
}

# Set environment variables for use in the CLI container
setGlobalsCLI() {
  setGlobals $1
  USING_ORG=$1
  if [ "$USING_ORG" = "uis" ]; then
    export CORE_PEER_ADDRESS=peer0.uis.example.com:7051
  elif [ "$USING_ORG" = "uib" ]; then
    export CORE_PEER_ADDRESS=peer0.uib.example.com:8051
  elif [ "$USING_ORG" = "uio" ]; then
    export CORE_PEER_ADDRESS=peer0.uio.example.com:9051
  else
    errorln "ORG Unknown"
  fi
}

# parsePeerConnectionParameters $@
# Helper function that sets the peer connection parameters for a chaincode
# operation
parsePeerConnectionParameters() {
  PEER_CONN_PARMS=()
  PEERS=""
  while [ "$#" -gt 0 ]; do
    setGlobals $1
    PEER="peer0.$1"
    ## Set peer addresses
    if [ -z "$PEERS" ]
    then
	PEERS="$PEER"
    else
	PEERS="$PEERS $PEER"
    fi
    PEER_CONN_PARMS=("${PEER_CONN_PARMS[@]}" --peerAddresses $CORE_PEER_ADDRESS)
    ## Set path to TLS certificate
    CA=PEER0_ORG$1_CA
    TLSINFO=(--tlsRootCertFiles "${!CA}")
    PEER_CONN_PARMS=("${PEER_CONN_PARMS[@]}" "${TLSINFO[@]}")
    # shift by one to get to the next organization
    shift
  done
}

verifyResult() {
  if [ $1 -ne 0 ]; then
    fatalln "$2"
  fi
}
