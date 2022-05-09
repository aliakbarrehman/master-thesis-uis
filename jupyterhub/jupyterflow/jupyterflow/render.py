from jinja2 import Environment, BaseLoader, PackageLoader, Template


def workflow(workflow, runtime):

    template = get_template('workflow.yaml')
    return template.render(workflow=workflow, \
                            runtime=runtime
                        )


def cronworkflow(workflow_yaml, schedule):
    template = get_template('cronworkflow.yaml')
    return template.render(name=workflow_yaml['metadata']['generateName'], \
                            workflow=workflow_yaml['spec'], \
                            schedule=schedule)


def get_template(name):
    env = Environment(loader=PackageLoader('jupyterflow', 'templates'), extensions=['jinja2_ansible_filters.AnsibleCoreFiltersExtension'])
    # env = Environment(loader=FileSystemLoader('templates/'), extensions=['jinja2_ansible_filters.AnsibleCoreFiltersExtension'])
    return env.get_template(name)

def local_persistent_volume(volume, runtime):
    template = get_template('local_persistent_volume.yaml')
    return template.render(volume=volume, runtime=runtime)

def local_persistent_volume_claim(volumeClaim, runtime):
    template = get_template('local_persistent_volume_claim.yaml')
    return template.render(volumeClaim=volumeClaim, runtime=runtime)

def azure_persistent_volume(volume, runtime):
    template = get_template('azure_persistent_volume.yaml')
    return template.render(volume=volume, runtime=runtime)

def azure_persistent_volume_claim(volumeClaim, runtime):
    template = get_template('azure_persistent_volume_claim.yaml')
    return template.render(volumeClaim=volumeClaim, runtime=runtime)

def k8s_secret(secret, runtime):
    template = get_template('k8s_secret.yaml')
    return template.render(secret=secret, runtime=runtime)
