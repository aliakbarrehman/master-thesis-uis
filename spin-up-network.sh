#!/bin/bash
echo "Execution Access to custom scripts"
chmod u+x hyperledger-network/*.sh
chmod u+x hyperledger-network/scripts/*.sh
chmod u+x hyperledger-network/addOrg/*.sh
chmod u+x bin/*

echo "Installing docker and docker-compose"
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update
apt-get -y install docker-ce docker-ce-cli containerd.io docker-compose-plugin

apt-get -y install docker-compose

echo "Installing node and npm to package chaincode"
apt-get update
apt-get -y install nodejs npm ca-certificates curl gnupg lsb-release
npm cache clean -f
npm install -g n
n stable

exec bash

cd hyperledger-network && ./start.sh
cd hyperledger-network && ./start.network.sh

cd rest-api && docker-compose up -d