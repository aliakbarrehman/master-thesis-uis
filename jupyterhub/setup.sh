# Pre-Requsites
# 1. Install Docker
#   a. Install Docker based on your setup
docker ps
if [ "$?" -ne 0 ]; then
  echo "Docker not found. Please install docker."
  exit 1
fi
# 2. Install Kubernetes
#   a. Install Kubernetes based on your setup
#   b. Install kubectl
#       1. sudo apt-get install -y apt-transport-https ca-certificates curl
#       2. sudo curl -fsSLo /usr/share/keyrings/kubernetes-archive-keyring.gpg https://packages.cloud.google.com/apt/doc/apt-key.gpg
#       3. echo "deb [signed-by=/usr/share/keyrings/kubernetes-archive-keyring.gpg] https://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee /etc/apt/sources.list.d/kubernetes.list
#       4. sudo apt-get update &&  sudo apt-get install -y kubectl
#       5. kubectl cluster-info
#       6. Enable kubectl autocomplete (kubectl completion bash | sudo tee /etc/bash_completion.d/kubectl > /dev/null)
kubectl version
if [ "$?" -ne 0 ]; then
  echo "Kubernetes not found. Please install k8s."
  exit 1
fi
# 3. Install Helm
#   a. curl https://raw.githubusercontent.com/helm/helm/HEAD/scripts/get-helm-3 | bash
#   b. helm version
helm version
if [ "$?" -ne 0 ]; then
  echo "Helm not found. Please install helm."
  exit 1
fi

############################

NAMESPACE=$1
CONFIG_YAML=$2

if [ "$NAMESPACE" -eq "" ]; then
  NAMESPACE="jhub"
fi

if [ "$CONFIG_YAML" -eq "" ]; then
  CONFIG_YAML="config.yaml"
fi

echo "Using Namespace = $NAMESPACE"
echo "Using Configuration = $CONFIG_YAML"

# Install JupyterHub
# 1. Make Helm aware of the JupyterHub Helm chart repository so you can install the JupyterHub chart from it without having to use a long URL name.
echo "Installing Jupyterhub"
helm repo add jupyterhub https://jupyterhub.github.io/helm-chart/
helm repo update

# 2. Now install the chart configured by your config.yaml by running this command from the directory that contains your config.yaml
if [ ! -f "$CONFIG_YAML" ]; then
  echo "$CONFIG_YAML does not exist."
  exit 1
fi

echo "Installing Storage Class for code sharing"
helm repo add stable https://charts.helm.sh/stable
helm repo update

# StorageClass name will be nfs-server
helm install nfs-server stable/nfs-server-provisioner

echo "Upgrading Jupyterhub with $CONFIG_YAML"
helm upgrade --cleanup-on-fail --install jhub jupyterhub/jupyterhub --namespace $NAMESPACE --create-namespace --version=1.2.0 --values $CONFIG_YAML --timeout=10m --debug

kubectl get pod --namespace $NAMESPACE
kubectl get service --namespace $NAMESPACE

# Browse to external ip of public-proxy
echo "Running Argo"
kubectl apply --namespace $NAMESPACE -f https://raw.githubusercontent.com/argoproj/argo/stable/manifests/quick-start-postgres.yaml

# expose argo web ui
kubectl patch svc argo-server -p '{"spec": {"type": "LoadBalancer"}}' -n $NAMESPACE

kubectl apply -n $NAMESPACE -f jupyterflow/jupyterhub-k8s/workflow-role.yaml
# binding workflow role to jupyterflow:default
kubectl create rolebinding workflow-rb --role=workflow-role --serviceaccount=jupyterflow:default -n $NAMESPACE

# echo "Setting up ingress controller"
# helm upgrade --install ingress-nginx ingress-nginx --repo https://kubernetes.github.io/ingress-nginx --namespace ingress-nginx --create-namespace

kubectl apply -f service-account.yaml -n jhub
