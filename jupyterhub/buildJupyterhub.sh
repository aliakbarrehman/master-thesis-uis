REPOSITORY_NAME=$1

ROOT_DIRECTORY=${PWD}

echo "ROOT_DIR in build = $ROOT_DIRECTORY"
echo "Creating kubernetes service account for use with jupyterhub"
kubectl apply -f service-account.yaml -n jhub
kubectl get secrets -n jhub | grep test-manager > secret-name.txt
KUBE_TOKEN_NAME=$(sed 's|\b   .*||g' secret-name.txt)
KUBE_TOKEN=$(kubectl describe secret $KUBE_TOKEN_NAME -n jhub | grep token: | sed 's|token:||g' | sed 's| ||g')
rm -f secret-name.txt

rm -rf $ROOT_DIRECTORY/jupyterflow/build $ROOT_DIRECTORY/jupyterflow/dist $ROOT_DIRECTORY/jupyterflow/jupyterflow.egg-info
echo "Packaging jupyterflow"
cd $ROOT_DIRECTORY/jupyterflow && python setup.py bdist_wheel &> log.txt
JUPYTERFLOW_PACKAGE_NAME=$(cat log.txt  | grep -E '*.whl' | sed 's|creating ||g' | sed 's|\band .*||g' | sed "s|'dist/||g" | sed "s|' ||g")
echo "Package Name: $JUPYTERFLOW_PACKAGE_NAME"
cp $ROOT_DIRECTORY/jupyterflow/dist/$JUPYTERFLOW_PACKAGE_NAME $ROOT_DIRECTORY/$JUPYTERFLOW_PACKAGE_NAME
rm -f log.txt

cd $ROOT_DIRECTORY

cd $ROOT_DIRECTORY/extension/thesis_extension/ && rm -rf dist lib thesis_extension/labextension thesis_extension.egg-info thesis_extension.egg-info package-lock.json yarn.lock node_modules
echo "Packaging jupyterhub extension"
python -m build &> log.txt
EXTENSION_PACKAGE_NAME=$(cat log.txt  | grep -E '*.whl' | grep built | sed 's|\bSuccessfully.*and ||g')
echo "Package Name: $EXTENSION_PACKAGE_NAME"
cp $ROOT_DIRECTORY/extension/thesis_extension/dist/$EXTENSION_PACKAGE_NAME $ROOT_DIRECTORY/$EXTENSION_PACKAGE_NAME

cd $ROOT_DIRECTORY

echo "Building and pushing docker image"
docker build -t "$REPOSITORY_NAME:latest" --build-arg k8s_token=$KUBE_TOKEN --build-arg extension_package=$EXTENSION_PACKAGE_NAME --build-arg jupyterflow_package=$JUPYTERFLOW_PACKAGE_NAME .

rm -f $JUPYTERFLOW_PACKAGE_NAME
rm -f $EXTENSION_PACKAGE_NAME

docker push "$REPOSITORY_NAME:latest"