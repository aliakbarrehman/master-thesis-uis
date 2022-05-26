#!/bin/bash
ROOT_DIRECTORY=${PWD}
REPOSITORY_NAME="aliakbarrehman/jupyterhub"

echo "Building Jupyterhub with Repository $REPOSITORY_NAME and Running Jupyterhub"
cd $ROOT_DIRECTORY/jupyterhub && ./buildJupyterhub.sh $REPOSITORY_NAME  &
wait && cd $ROOT_DIRECTORY/jupyterhub && ./runJupyterhub.sh jhub config.yaml
