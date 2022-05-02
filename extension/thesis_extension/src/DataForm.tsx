import React, { useState } from 'react';
import { postData } from './utils/api';

const DataForm = ({ mspId, ...props }: any) : JSX.Element => {
    const [dataBlock, setDataBlock] = useState<any>({});
    const [storageType, setStorageType] = useState<string>('');
    const [storageTypeDetails, setStorageTypeDetails] = useState<any>({});

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
        const payload = {
            'payload': finalDataBlock
        }
        console.log(payload);
        postData(payload, mspId).then((response: any) => {
            if (response.status == 'Accepted') {
                alert("Transaction Submitted.")
                setDataBlock(null);
                setStorageType('');
                setStorageTypeDetails(null);
            } else {
                alert("Failed to submit transaction");
            }
        })
    };

    return (
      <div>
        <div className='input-group'>
            <p className='label'>Data Title</p>
            <input type={'text'} className={'text-input'} value={dataBlock?.title} onChange={(e) => updateDataBlock('title', e.target.value)} />
        </div>
        <div className='input-group'>
            <p className='label'>Data Description</p>
            <input type={'text'} className={'text-input'}  value={dataBlock?.description} onChange={(e) => updateDataBlock('description', e.target.value)} />
        </div>
        <div className='input-group'>
            <p className='label'>Storage Type</p>
            <select className='dropdown' value={storageType} onChange={(e) => setStorageType(e.target.value)}>
                <option value='none'>Select Storage Type</option>
                <option value='azure'>Azure</option>
                <option value='local'>Local</option>
            </select>
        </div>
        {storageType === 'azure' ? 
            <>
                <div className='input-group'>
                    <p className='label'>Storage Account Name</p>
                    <input type={'text'} className={'text-input'} value={storageTypeDetails?.name} onChange={(e) => updateStorageTypeDetails('name', e.target.value)} />
                </div>

                <div className='input-group'>
                    <p className='label'>Storage Account Key</p>
                    <input type={'text'} className={'text-input'} value={storageTypeDetails?.key} onChange={(e) => updateStorageTypeDetails('key', e.target.value)} />
                </div>

                <div className='input-group'>
                    <p className='label'>Fileshare Name</p>
                    <input type={'text'} className={'text-input'} value={storageTypeDetails?.fileshareName} onChange={(e) => updateStorageTypeDetails('fileshareName', e.target.value)} />
                </div>
            </> : <></>
        }
        {storageType === 'local' ? 
            <>
                <div className='input-group'>
                    <p className='label'>Hostname</p>
                    <input type={'text'} className={'text-input'} value={storageTypeDetails?.hostname} onChange={(e) => updateStorageTypeDetails('hostname', e.target.value)} />
                </div>

                <div className='input-group'>
                    <p className='label'>Hostpath</p>
                    <input type={'text'} className={'text-input'} value={storageTypeDetails?.path} onChange={(e) => updateStorageTypeDetails('path', e.target.value)} />
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