#!/bin/bash

echo "Running docker-compose..."
docker-compose -f docker-compose.yml -f docker-compose.base.yml up -d
docker ps

echo "Creating a channel and joining organizations..."

docker exec -it cli /bin/bash /opt/gopath/src/github.com/hyperledger/fabric/peer/scripts/createChannel.sh
docker exec -it cli /bin/bash /opt/gopath/src/github.com/hyperledger/fabric/peer/scripts/joinPeer.sh peer0 uio UiOMSP 9051 1
docker exec -it cli /bin/bash /opt/gopath/src/github.com/hyperledger/fabric/peer/scripts/joinPeer.sh peer0 uib UiBMSP 10051 1