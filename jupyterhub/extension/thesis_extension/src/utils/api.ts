import axios from 'axios';
import { URLExt } from '@jupyterlab/coreutils';

import { ServerConnection } from '@jupyterlab/services';

const HOST = 'http://51.13.84.103:3000';

// Get List of all data
const getAllData = async (wallet: string) : Promise<any> => {
    try {
            const response = await axios.get(`${HOST}/data`, {
            headers: {
                'Content-Type': 'application/json',
                "walletid": wallet
            }
        });
        return response.data;
    } catch (error) {
        console.log(error);
        return [];
    }
}

// Get a single data block
const getData = async (id: string, wallet: string) : Promise<{}> => {
    try {
        const response = await axios.get(`${HOST}/data/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                "walletid": wallet
            }
        });
        return response.data;
    } catch (error) {
        console.log(error);
        return {};
    }
}

// Lease Data block
const leaseData = async (id: string, wallet: string, data: string) : Promise<any> => {
    try {
        const response = await axios.post(`${HOST}/data/lease/${id}`, data, {
            headers: {
                'Content-Type': 'application/json',
                "walletid": wallet
            },
            data: data
        });
        return response.data;
    } catch (error) {
        console.log(error);
        return null;
    }
}

// Post a single data block
const postData = async (data: any, wallet: string) : Promise<{}> => {
    try {
        const response = await axios.post(`${HOST}/data`, data, {
            headers: {
                'Content-Type': 'application/json',
                "walletid": wallet
            },
            data: data
        });
        console.log(response);
        return response.data;
    } catch (error) {
        console.log(error);
        return {};
    }
}

// Get Job
const getJob = async (id: string) : Promise<{}> => {
    try {
        const response = await axios.get(`${HOST}/job/${id}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.log(error);
        return {};
    }
}

// Get Transaction
const getTransaction = async (id: string, wallet: string) : Promise<{}> => {
    try {
        const response = await axios.get(`${HOST}/transaction/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                "walletid": wallet
            }
        });
        return response.data;
    } catch (error) {
        console.log(error);
        return {};
    }
}

// Delete Data Block
const deleteData = async (id: string, wallet: string) : Promise<{}> => {
    try {
        const response = await axios.delete(`${HOST}/data/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                "walletid": wallet
            }
        });
        return response.data;
    } catch (error) {
        console.log(error);
        return {};
    }
}

const postJupyterApi = async (endpoint: string, init: RequestInit) : Promise<any> => {
    const settings = ServerConnection.makeSettings();
    const requestUrl = URLExt.join(
        settings.baseUrl,
        'thesis-extension',
        endpoint
    );

    let response: Response;

    try {
        response = await ServerConnection.makeRequest(requestUrl, init, settings);
        return await response.json();
    } catch (error) {
        throw new ServerConnection.NetworkError(error);
    }
}

export {
    getAllData,
    getData,
    getJob,
    getTransaction,
    deleteData,
    postData,
    leaseData,
    postJupyterApi
}