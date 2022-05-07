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
  dirStructure: any,
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

const DataBlock = ({ isAdmin, mspId, model, ...props }: any): JSX.Element => {
  const [dataList, setDataList] = useState<DataBlock[]>([]);
  const [msg, setMsg] = useState<string>("");

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

  const getDirectoryStructure = (structJson: { [k: string]: any }): string[] => {
    var listOfDirectoriesToCreate: string[] = [];
    if (typeof (structJson) != "object" || (structJson && typeof (structJson) == "object" && Object.keys(structJson).length === 0)) {
      listOfDirectoriesToCreate.push("");
    } else {
      for (var key in structJson) {
        var temp: string[] = getDirectoryStructure(structJson[key])
        for (var i in temp) {
          listOfDirectoriesToCreate.push(key + "/" + temp[i])
        }
      }
    }
    return listOfDirectoriesToCreate;
  };

  const useData = async (event: any) => {
    const id: any = event.target.name;
    // get data here
    const dataResult: any = await getData(id, mspId);
    const payload: any = {
      action: 'lease',
      to: 'uio'
    };
    // update with lease
    await leaseData(id, mspId, payload);
    // create directory structure
    if ('dirStructure' in dataResult) {
      const directoryStructure: any = dataResult.dirStructure;
      const dirsToCreate = getDirectoryStructure(directoryStructure);
      for (let i in dirsToCreate) {
        let command = `!cd && mkdir -p ${id}/${dirsToCreate[i]}`
        model.execute(command);
      }
    }
    // create a file with credentials
    const command: string = dataResult.storageType == 'local' ? 
                            `!cd && echo -e "hostname: ${dataResult.volumeDetails.hostname}\\npath: ${dataResult.volumeDetails.path}" > .${id}` :
                            `!cd && echo -e "name: ${dataResult.volumeDetails.name}\\nkey: ${dataResult.volumeDetails.key}\\nfileShareName: ${dataResult.volumeDetails.fileshareName}" > .${id}`
    model.execute(command);
    showMsg(`Data is ready for use. Directory structure of data can be found under ${id} in home directory. Use ${id} inside Jupyterflow.yaml`)
  };

  const showMsg = (msg: string) => {
    setMsg(msg);
    setTimeout(() => setMsg(''), 5000);
  }; 

  // const editData = () => {

  // };

  const deleteDatablock = (event: any) => {
    const id = event.target.name;
    deleteData(id, mspId).then((response: any) => {
      if (response.status == 'Accepted') {
        showMsg("Transaction to delete submitted.")
      } else {
        showMsg("Failed to submit transaction");
      }
    })
  };

  return (
    <div>
      {msg != null && msg != '' ? <p className='message'>{msg}</p> : <></>}
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