interface DataBlockRequest {
    id: string,
    type: string, 
    title: string,
    description: string,
    owner: string,
    storageType: string, 
    azure: AzureData,
    lease: string,
    local: LocalData
}

interface AzureData {
    name: string,
    key: string,
    fileshareName: string
}

interface LocalData {
    hostname: string,
    path: string
}

export default DataBlockRequest;