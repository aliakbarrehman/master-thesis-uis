#!/bin/bash
mkdir -p channel-artifacts
mkdir -p crypto-config
echo "Running certificates and channel artifacts..."
cryptogen generate --config=./crypto-config.yaml --output crypto-config

echo "Copying crypto-config to explorer..."
mkdir -p explorer/organizations
cp -r crypto-config/* explorer/organizations/

echo "Creating genesis block..."
configtxgen -profile DataOrdererGenesis -outputBlock channel-artifacts/genesis.block -channelID defaultchannel
configtxgen -profile DataChannel -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID datachannel
