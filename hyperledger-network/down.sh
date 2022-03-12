#!/bin/bash

echo "Stopping containers... "
docker-compose -f docker-compose.yml -f docker-compose.base.yml down --remove-orphans
docker system prune --volumes -f
rm -rf ./crypto-config
rm -rf ./channel-artifacts

docker-compose -f explorer/docker-compose.yml down