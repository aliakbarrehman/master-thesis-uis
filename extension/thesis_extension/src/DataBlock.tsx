import React, { useEffect, useState } from 'react';
import { deleteData, getAllData, getData, leaseData } from './utils/api';

type DataBlock = {
  type: string,
  title: string,
  id: string,
  description: string,
  owner: string,
  lease: string,
  storageType: string,
  azure: {
      name: string,
      key: string,
      fileshareName: string
  },
  local: {
      hostname: string,
      path: string
  }
}

const DataBlock = ({ commands, isAdmin, mspId, ...props }: any) : JSX.Element => {
    const [dataList, setDataList] = useState<DataBlock[]>([]);

    useEffect(() => {
      getAllData("UiSMSP").then(response => {
        setDataList(response);
      });
      setInterval(() => {
        getAllData("UiSMSP").then(response => {
          setDataList(response);
        });
      }, 30000);
    }, []);
    
    const useData = async (event: any) => {
      const id: any = event.target.name;
      await getData(id, mspId);
      const payload: any = {
        action: 'lease',
        to: 'uio'
      };
      leaseData(id, mspId, payload).then((response: any) => {
        if (response.status == 'Accepted') {
          alert("Data Leased.");
        } else {
          alert("Failed to submit transaction");
        }
      })
      // get data here
      // create directory structure
      // create a file with credentials
      // update with lease
      console.log(commands);
      console.log(event);
      debugger;
      // const model = await commands.commands.commands.execute('docmanager:new-untitled', {
      //   // path: cwd,
      //   type: 'file',
      //   ext: 'py',
      // });
      // console.log(model);
    };
    
    // const editData = () => {

    // };
    
    const deleteDatablock = (event: any) => {
      const id = event.target.name;
      deleteData(id, mspId).then((response: any) => {
        if (response.status == 'Accepted') {
          alert("Transaction to delete submitted.")
        } else {
            alert("Failed to submit transaction");
        }
      })
    };

    return (
      <div>
      {
        dataList.map((dataBlock: DataBlock) => {
          return (<div className='data-block' key={dataBlock.id}>
            <p className='data-title'>{dataBlock.title}</p>
            {dataBlock.lease == null || dataBlock.lease == "" ? <div className='lease-tag open'>Open</div> : <div className='lease-tag used'>In Use</div>}
            <p className='data-description'>
              {dataBlock.description}
            </p>
            <div className='button-group'>
              {dataBlock.lease == null || dataBlock.lease == "" ? <button className='button' name={dataBlock.id} onClick={useData}>Use Data</button> : <></>}
              {/* {isAdmin ? <button className='button' onClick={editData}>Edit Data</button> : <></>} */}
              {isAdmin ? <button className='button' name={dataBlock.id} onClick={deleteDatablock}>Delete Data</button> : <></>}
            </div>
          </div>)
        })
      }
      </div>
    )
}

export default DataBlock;