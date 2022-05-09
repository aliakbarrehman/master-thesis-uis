#!/bin/bash
ROOT_DIRECTORY=${PWD}
REPOSITORY_NAME="aliakbarrehman/jupyterhub"

echo "Building Jupyterhub with Repository $REPOSITORY_NAME"
cd $ROOT_DIRECTORY/jupyterhub && ./buildJupyterhub.sh $REPOSITORY_NAME

echo "Running Jupyterhub"
cd $ROOT_DIRECTORY/jupyterhub && ./runJupyterhub.sh jhub config.yaml