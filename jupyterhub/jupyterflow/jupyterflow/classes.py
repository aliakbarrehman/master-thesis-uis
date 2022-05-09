from . import render
from .runtime import runtime
import yaml
import random

from .utils import encode_base64, decode_base64

class LocalVolume:
    def __init__(self, name, size, path, hostname):
        self.name = name
        self.usage = name + '-' + str(random.random() * 100000) # Generating a random usage so user cannot mount this volume to another claim
        self.size = size
        self.path = path
        self.hostname = hostname
    
    def get_persistent_volume(self):
        pv = render.local_persistent_volume(self, runtime)
        return yaml.safe_load(pv)
    
    def get_persistent_volume_claim(self):
        pvc = render.local_persistent_volume_claim(self, runtime)
        return yaml.safe_load(pvc)

class AzureVolume:
    def __init__(self, name, size, secret, shareName, secretNamespace='default'):
        self.name = name
        self.usage = name + '-' + str(random.random() * 100000) # Generating a random usage so user cannot mount this volume to another claim
        self.size = size
        self.secret = secret
        self.shareName = shareName
        self.secretNamespace = secretNamespace
    
    def get_persistent_volume(self):
        pv = render.azure_persistent_volume(self, runtime)
        return yaml.safe_load(pv)
    
    def get_persistent_volume_claim(self):
        pvc = render.azure_persistent_volume_claim(self, runtime)
        return yaml.safe_load(pvc)

class K8sSecret:
    def __init__(self, name, accountName, accountKey):
        self.name = name
        self.base64AccountName = encode_base64(accountName)
        self.base64AccountKey = encode_base64(accountKey)
        
    def get_secret(self):
        secret = render.k8s_secret(self, runtime)
        return yaml.safe_load(secret)