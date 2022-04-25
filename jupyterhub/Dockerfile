FROM jupyterhub/k8s-singleuser-sample:1.2.0

ADD requirements.txt /tmp/requirements.txt
RUN python -m pip install -r /tmp/requirements.txt

# Install extensions
RUN pip install jupyter_contrib_nbextensions
RUN jupyter contrib nbextension install --sys-prefix
RUN jupyter nbextension enable scratchpad/main --sys-prefix
RUN jupyter serverextension enable --py nbgitpuller --sys-prefix

# Uncomment the line below to make nbgitpuller default to start up in JupyterLab
#ENV NBGITPULLER_APP=lab

# conda/pip/apt install additional packages here, if desired.

