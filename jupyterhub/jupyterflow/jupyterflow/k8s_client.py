import json
import yaml

from kubernetes import config
from kubernetes import client
from kubernetes.client.rest import ApiException

from .utils import check_null_or_empty, handle_exception
from .classes import LocalVolume, AzureVolume, K8sSecret

def create_object(body, namespace):
    group, version = body['apiVersion'].split('/')
    plural = body['kind'].lower() + 's'

    config.load_incluster_config()
    api_instance = client.CustomObjectsApi()
    response = api_instance.create_namespaced_custom_object(group, version, namespace, plural, body)
    
    return response


def delete_object(name, apiVersion, plural, namespace):
    group, version = apiVersion.split('/')
    config.load_incluster_config()
    api_instance = client.CustomObjectsApi()
    response = api_instance.delete_namespaced_custom_object(group, version, namespace, plural, name)
        
    return response

def create_cluster_object(k8s_client, body, namespace):
    group, version = body['apiVersion'].split('/')
    plural = body['kind'].lower() + 's'
    
    api_instance = client.CustomObjectsApi(k8s_client)
    try:
        response = api_instance.create_cluster_custom_object(group, version, plural, body)
    except BaseException as e:
        handle_exception("Exception when calling CustomObjectsApi->create_cluster_custom_object: %s\n" % e)

    return response


def delete_cluster_object(k8s_client, name, apiVersion, plural, namespace):
    group, version = apiVersion.split('/')
    config.load_incluster_config()
    api_instance = client.CustomObjectsApi()
    response = api_instance.delete_namespaced_custom_object(group, version, namespace, plural, name)
        
    return response
    

def get_notebook_pod(hostname, namespace):
    config.load_incluster_config()
    api_instance = client.CoreV1Api()
    response = api_instance.read_namespaced_pod(hostname, namespace, _preload_content=False)
    
    return json.loads(response.data)

def get_k8s_client(token, verifySsl=False, sslCert=''):
    host = config.kube_config.Configuration.get_default_copy().host
    if (check_null_or_empty(host) or check_null_or_empty(token)):
        raise Exception('host or token cannot be null')
        
    configuration = client.Configuration()
    configuration.api_key['authorization'] = token
    configuration.api_key_prefix['authorization'] = 'Bearer'

    configuration.host = host
    configuration.verify_ssl = verifySsl
    if (verifySsl):
        configuration.ssl_ca_cert = sslCert
    return client.CoreV1Api(client.ApiClient(configuration))

def local_persistent_volume(k8s_client, name, size, path, hostname, namespace):
    volume = LocalVolume(name, size, path, hostname)
    return _create_persistent_volume(k8s_client, volume, namespace, 'local')

def azure_persistent_volume(k8s_client, name, size, secret, shareName, namespace):
    volume = AzureVolume(name, size, secret, shareName)
    return _create_persistent_volume(k8s_client, volume, namespace, 'azure')
    
def create_secret(k8s_client, name, accountName, accountKey, namespace='default'):
    secret = K8sSecret(name, accountName, accountKey)
    secret_body = secret.get_secret()
    try:
        k8s_client.create_namespaced_secret(namespace, secret_body)
    except:
        handle_exception("Failed to create kubernetes secret")
    return secret.name

def delete_persistent_volume(k8s_client, name):
    try:
        k8s_client.delete_persistent_volume(name + '-pv')
    except ApiException as e:
        handle_exception("Exception deleting persistent_volume: %s\n" % e)
    return True
    
def delete_persistent_volume_claim(k8s_client, name, namespace):
    try:
        k8s_client.delete_namespaced_persistent_volume_claim(name + '-pvc', namespace)
    except ApiException as e:
        handle_exception("Exception deleting persistent_volume: %s\n" % e)
    return True
    
def delete_secret(k8s_client, name, namespace):
    try:
        k8s_client.delete_namespaced_secret(name, namespace)
    except ApiException as e:
        handle_exception("Exception deleting persistent_volume: %s\n" % e)
    return True

def _create_persistent_volume(k8s_client, volume, namespace, volume_type):
    volume_func = _create_local_persistent_volume
    volume_claim_func = _create_local_persistent_volume_claim
    if (volume_type == 'azure'):
        volume_func = _create_azure_persistent_volume
        volume_claim_func = _create_azure_persistent_volume_claim
    try:
        persistent_volume_response = volume_func(k8s_client, volume)
    except ApiException as e:
        handle_exception("Exception creating persistent_volume: %s\n" % e)
    try:
        persistent_volume_claim_response = volume_claim_func(k8s_client, volume, namespace)
    except ApiException as e:
        handle_exception("Exception creating persistent_volume_claim: %s\n" % e)
    return volume

def _create_local_persistent_volume(k8s_client, volume):
    volume_body = volume.get_persistent_volume();
    api_response = k8s_client.create_persistent_volume(volume_body)
    return api_response
    
def _create_local_persistent_volume_claim(k8s_client, volume, namespace):
    volume_claim_body = volume.get_persistent_volume_claim();
    api_response = k8s_client.create_namespaced_persistent_volume_claim(namespace, volume_claim_body)
    return api_response

def _create_azure_persistent_volume(k8s_client, volume):
    volume_body = volume.get_persistent_volume();
    api_response = k8s_client.create_persistent_volume(volume_body)
    return api_response

def _create_azure_persistent_volume_claim(k8s_client, volume, namespace):
    volume_claim_body = volume.get_persistent_volume_claim();
    api_response = k8s_client.create_namespaced_persistent_volume_claim(namespace, volume_claim_body, namespace)
    return api_response
