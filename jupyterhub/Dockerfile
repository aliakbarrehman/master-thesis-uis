FROM jupyterhub/k8s-singleuser-sample:1.2.0

ADD requirements.txt /tmp/requirements.txt
RUN python -m pip install -r /tmp/requirements.txt

# Install extensions
RUN pip install jupyter_contrib_nbextensions
RUN jupyter contrib nbextension install --sys-prefix
RUN jupyter nbextension enable scratchpad/main --sys-prefix
RUN jupyter serverextension enable --py nbgitpuller --sys-prefix

ARG extension_package
ADD $extension_package $extension_package
RUN pip install $extension_package

ARG k8s_token
ENV K8S_TOKEN=$k8s_token

# Install custom jupyterflow here
ARG jupyterflow_package
ADD $jupyterflow_package $jupyterflow_package
RUN pip install $jupyterflow_package
