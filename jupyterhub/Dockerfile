FROM jupyterhub/k8s-singleuser-sample:1.2.0

ADD requirements.txt /tmp/requirements.txt
RUN python -m pip install -r /tmp/requirements.txt

# Install extensions
RUN pip install jupyter_contrib_nbextensions
RUN jupyter contrib nbextension install --sys-prefix
RUN jupyter nbextension enable scratchpad/main --sys-prefix
RUN jupyter serverextension enable --py nbgitpuller --sys-prefix

ADD thesis_extension-0.1.0-py3-none-any.whl thesis_extension-0.1.0-py3-none-any.whl
RUN pip install thesis_extension-0.1.0-py3-none-any.whl

# conda/pip/apt install additional packages here, if desired.

