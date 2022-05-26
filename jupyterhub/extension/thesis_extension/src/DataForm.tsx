import React, { useState } from 'react';
import { postData } from './utils/api';

const DataForm = ({ mspId, ...props }: any) : JSX.Element => {
    const [dataBlock, setDataBlock] = useState<any>({});
    const [storageType, setStorageType] = useState<string>('');
    const [storageTypeDetails, setStorageTypeDetails] = useState<any>({});
    const [jsonError, setJsonError] = useState<string>('');
    const [json, setJson] = useState<any>('');
    const [msg, setMsg] = useState<string>("");

    const updateDataBlock = (field: string, value: any) => {
        let updateDataBlock = {
            ...dataBlock
        };
        updateDataBlock[field] = value;
        setDataBlock(updateDataBlock);
    };

    const updateStorageTypeDetails = (field: string, value: string) => {
        let updateStorageTypeDetails = {
            ...storageTypeDetails
        };
        updateStorageTypeDetails[field] = value;
        setStorageTypeDetails(updateStorageTypeDetails);
    };

    const getOwner = () => {
        return mspId.slice(0, 3).toLowerCase();
    }

    const addData = () => {
        const finalDataBlock = {
            ...dataBlock
        };
        finalDataBlock['storageType'] = storageType;
        finalDataBlock[storageType] = storageTypeDetails;
        finalDataBlock['owner'] = getOwner();
        finalDataBlock['type'] = 'data';
        finalDataBlock['dirStructure'] = json;
        const payload = {
            'payload': finalDataBlock
        }
        console.log(payload);
        postData(payload, mspId).then((response: any) => {
            if (response.status == 'Accepted') {
                showMsg("Transaction Submitted.")
                setDataBlock(null);
                setStorageType('');
                setStorageTypeDetails(null);
            } else {
                showMsg("Failed to submit transaction");
            }
        })
    };

    const showMsg = (msg: string) => {
      setMsg(msg);
      setTimeout(() => setMsg(''), 5000);
    }; 

    const validateJson = (value: string) => {
        try {
            let parsedJson = JSON.parse(value);
            setJsonError("");
            setJson(parsedJson);
        } catch {
            setJsonError("Invalid JSON")
        }
    }

    return (
      <div>
        {msg != null && msg != '' ? <p className='message'>{msg}</p> : <></>}
        <div className='input-group'>
            <p className='label'>Data Title</p>
            <input type={'text'} className={'text-input'} value={dataBlock?.title} onChange={(e: any) => updateDataBlock('title', e.target.value)} />
        </div>
        <div className='input-group'>
            <p className='label'>Data Description</p>
            <input type={'text'} className={'text-input'}  value={dataBlock?.description} onChange={(e: any) => updateDataBlock('description', e.target.value)} />
        </div>
        <div className='input-group'>
            <p className='label'>Directory Structure</p>
            <textarea className={'text-input'} value={dataBlock?.dirStructure} onChange={(e: any) => validateJson(e.target.value)} />
            {jsonError != null || jsonError != '' ? <p className='red'>{jsonError}</p> : <></>}
        </div>
        <div className='input-group'>
            <p className='label'>Storage Type</p>
            <select className='dropdown' value={storageType} onChange={(e: any) => setStorageType(e.target.value)}>
                <option value='none'>Select Storage Type</option>
                <option value='azure'>Azure</option>
                <option value='local'>Local</option>
            </select>
        </div>
        {storageType === 'azure' ? 
            <>
                <div className='input-group'>
                    <p className='label'>Storage Account Name</p>
                    <input type={'text'} className={'text-input'} value={storageTypeDetails?.name} onChange={(e: any) => updateStorageTypeDetails('name', e.target.value)} />
                </div>

                <div className='input-group'>
                    <p className='label'>Storage Account Key</p>
                    <input type={'text'} className={'text-input'} value={storageTypeDetails?.key} onChange={(e: any) => updateStorageTypeDetails('key', e.target.value)} />
                </div>

                <div className='input-group'>
                    <p className='label'>Fileshare Name</p>
                    <input type={'text'} className={'text-input'} value={storageTypeDetails?.fileshareName} onChange={(e: any) => updateStorageTypeDetails('fileshareName', e.target.value)} />
                </div>
            </> : <></>
        }
        {storageType === 'local' ? 
            <>
                <div className='input-group'>
                    <p className='label'>Hostname</p>
                    <input type={'text'} className={'text-input'} value={storageTypeDetails?.hostname} onChange={(e: any) => updateStorageTypeDetails('hostname', e.target.value)} />
                </div>

                <div className='input-group'>
                    <p className='label'>Hostpath</p>
                    <input type={'text'} className={'text-input'} value={storageTypeDetails?.path} onChange={(e: any) => updateStorageTypeDetails('path', e.target.value)} />
                </div>
            </> : <></>
        }

        <div className='input-group'>
            <button className='button' onClick={addData}>Add Data</button>
        </div>
      </div>
    )
}

export default DataForm;