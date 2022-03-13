#!/bin/bash
source ${PWD}/scripts/env.sh
source ${PWD}/scripts/utils.sh

export FABRIC_CFG_PATH=${PWD}/config
export CHANNEL_NAME="datachannel"


CHANNEL_NAME="$1"
DELAY="$2"
MAX_RETRY="$3"
VERBOSE="$4"
: ${CHANNEL_NAME:="datachannel"}
: ${DELAY:="3"}
: ${MAX_RETRY:="5"}
: ${VERBOSE:="false"}

if [ ! -d "channel-artifacts" ]; then
	mkdir ${PWD}/channel-artifacts
fi

createChannelGenesisBlock() {
	which configtxgen
	if [ "$?" -ne 0 ]; then
		fatalln "configtxgen tool not found."
	fi
	set -x
	configtxgen -profile DataOrdererGenesis -outputBlock ${PWD}/channel-artifacts/${CHANNEL_NAME}.block -channelID $CHANNEL_NAME
	res=$?
	{ set +x; } 2>/dev/null
  verifyResult $res "Failed to generate channel configuration transaction..."
}

createChannel() {
	setGlobals uis
	# Poll in case the raft leader is not set yet
	local rc=1
	local COUNTER=1
	while [ $rc -ne 0 -a $COUNTER -lt $MAX_RETRY ] ; do
		sleep $DELAY
		set -x
		osnadmin channel join --channelID $CHANNEL_NAME --config-block ${PWD}/channel-artifacts/${CHANNEL_NAME}.block -o localhost:7053 --ca-file "$ORDERER_CA" --client-cert "$ORDERER_ADMIN_TLS_SIGN_CERT" --client-key "$ORDERER_ADMIN_TLS_PRIVATE_KEY" >&log.txt
		res=$?
		{ set +x; } 2>/dev/null
		let rc=$res
		COUNTER=$(expr $COUNTER + 1)
	done
	cat log.txt
	verifyResult $res "Channel creation failed"
}

# joinChannel ORG
joinChannel() {
  FABRIC_CFG_PATH=$PWD/config/
  ORG=$1
  setGlobals $ORG
	local rc=1
	local COUNTER=1
	## Sometimes Join takes time, hence retry
	while [ $rc -ne 0 -a $COUNTER -lt $MAX_RETRY ] ; do
    sleep $DELAY
    set -x
    peer channel join -b $BLOCKFILE >&log.txt
    res=$?
    { set +x; } 2>/dev/null
		let rc=$res
		COUNTER=$(expr $COUNTER + 1)
	done
	cat log.txt
	verifyResult $res "After $MAX_RETRY attempts, peer0.${ORG} has failed to join channel '$CHANNEL_NAME' "
}

setAnchorPeer() {
  ORG=$1
  docker exec cli ./scripts/setAnchorPeer.sh $ORG $CHANNEL_NAME 
}
export FABRIC_CFG_PATH=$(pwd)/config

## Create channel genesis block
infoln "Generating channel genesis block '${CHANNEL_NAME}.block'"
createChannelGenesisBlock
infoln "Done."

BLOCKFILE="${PWD}/channel-artifacts/${CHANNEL_NAME}.block"

## Create channel
infoln "Creating channel ${CHANNEL_NAME}"
createChannel
successln "Channel '$CHANNEL_NAME' created"

## Join all the peers to the channel
infoln "Joining uis peer to the channel..."
joinChannel uis
infoln "Joining uib peer to the channel..."
joinChannel uib
# infoln "Joining uio peer to the channel..."
# joinChannel uio

## Set the anchor peers for each org in the channel
infoln "Setting anchor peer for uis..."
setAnchorPeer uis
infoln "Setting anchor peer for uib..."
setAnchorPeer uib
# infoln "Setting anchor peer for uio..."
# setAnchorPeer uio

successln "Channel '$CHANNEL_NAME' joined"