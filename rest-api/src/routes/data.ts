import express from 'express';
const router = express.Router();
import { Contract } from 'fabric-network';
import { evaluateTransaction } from './../services/gateway';
import DataBlockRequest from '../interfaces/dataRequest';
import * as crypto from 'crypto';
import { Queue } from 'bullmq';
import { addSubmitTransactionJob } from '../services/jobs';
import * as mysql from 'mysql';
import * as config from './../utils/config';
import { decrypt, encrypt } from '../utils/crypto';

router.use((request: express.Request, response: express.Response, next: express.NextFunction) => {
  next()
});

router.get('/', async (request: express.Request, response: express.Response) => {
  try {
    const mspId = request.body.walletId;
    const contract = request.app.locals[mspId].assetContract as Contract;

    const data = await evaluateTransaction(contract, 'GetAllDataBlocks');
    let assets = [];
    if (data.length > 0) {
      assets = JSON.parse(data.toString());
    }

    return response.status(200).json(assets);
  } catch (err) {
    console.log('Error processing get all assets request', err);
    return response.status(500).json({
      status: 'Internel Server Error. ' + err.message,
    });
  }
});

router.post('/', async (request: express.Request, response: express.Response) => {
  console.log('Create asset request received');
  const mspId: string = request.body.walletId;
  if (mspId == null) {
    return response.status(400).json({
      status: 'Wallet Id cannot be empty'
    });
  }
  const asset = request.body.payload;
  try {
    validateDatablock(asset)
  } catch(err) {
    return response.status(400).json({
      status: 'Invalid Request. ' + err.message,
    });
  }

  // Generate Hash as Id of the block
  const assetId: string = crypto.createHash('sha256').update(JSON.stringify(asset)).digest('hex');
  asset.id = assetId;

  const volumeDetails = asset.storageType.toLowerCase() == 'azure' ? asset.azure : asset.local;
  delete asset.azure;
  delete asset.local;
  asset.lease = '';
  // Encrypt volumeDetails here with a key
  const iv = Buffer.from(crypto.randomBytes(16)).toString('hex').slice(0, 16);
  const key = crypto.createHash('sha256').update(JSON.stringify(Math.random())).digest('hex').slice(0, 32);
  const key_mapping = { id: assetId, crypto_key: key, iv: iv };
  const insertedData = await insertData('INSERT INTO key_mappings SET ?', key_mapping);
  if (insertedData != true) {
    console.log('Error processing', insertedData);
    return response.status(500).json({
      status: 'Internel Server Error. Contact Administrator',
    });
  }

  const encryptedVolumeDetails = encrypt(JSON.stringify(volumeDetails), key, iv);
  asset.volumeDetails = encryptedVolumeDetails;
  try {
    const submitQueue = request.app.locals.jobq as Queue;
    const jobId = await addSubmitTransactionJob(
      submitQueue,
      mspId,
      'AddDataBlock',
      JSON.stringify(asset)
    );
    return response.status(202).json({
      status: "Accepted",
      jobId: jobId,
    });
  } catch (err) {
    console.log('Error processing', err);
    return response.status(500).json({
      status: 'Internel Server Error. Contact Administrator',
    });
  }
});

router.get('/:datablockId', async (request: express.Request, response: express.Response) => {
  const id = request.params.datablockId;
  try {
    const mspId = request.body.walletId;
    if (mspId == null) {
      return response.status(400).json({
        status: 'Wallet Id cannot be empty'
      });
    }
    const contract = request.app.locals[mspId]?.assetContract as Contract;

    const data = await evaluateTransaction(contract, 'ReadDataBlock', id);
    const asset = JSON.parse(Buffer.from(data.toString()).toString('utf8'));
    
    const decryptionDetails: any = await readData('SELECT * FROM key_mappings WHERE id like ' + mysql.escape(id));
    const volumeDetails = decrypt(asset.volumeDetails.toString(), decryptionDetails.crypto_key, decryptionDetails.iv);
    asset.volumeDetails = JSON.parse(volumeDetails);
    return response.status(200).json(asset);
  } catch (err) {
    console.log('Error processing get datablock', err);
    return response.status(500).json({
      status: 'Internel Server Error. Contact Administrator',
    });
  }
});

router.patch(
  '/:datablockId', async (request: express.Request, response: express.Response) => {
    const id = request.params.datablockId;
    const mspId = request.body.walletId;
    if (mspId == null) {
      return response.status(400).json({
        status: 'Wallet Id cannot be empty'
      });
    }
    const asset: DataBlockRequest = request.body.payload;

    try {
      console.log(asset);
      const submitQueue = request.app.locals.jobq as Queue;
      const jobId = await addSubmitTransactionJob(
        submitQueue,
        mspId,
        'UpdateDataBlock',
        id,
        JSON.stringify(asset)
      );

      return response.status(202).json({
        status: 'ACCEPTED',
        jobId: jobId,
      });
    } catch (err) {
      console.log('Error processing get datablock', err);
      return response.status(500).json({
        status: 'Internel Server Error. Contact Administrator',
      });
    }
  }
);

router.delete('/:datablockId', async (request: express.Request, response: express.Response) => {
  const id = request.params.datablockId;

  try {
    const mspId = request.body.walletId;
    if (mspId == null) {
      return response.status(400).json({
        status: 'Wallet Id cannot be empty'
      });
    }

    if (deleteData('DELETE FROM key_mappings where id like ' + mysql.escape(id))) {
      const submitQueue = request.app.locals.jobq as Queue;
      const jobId = await addSubmitTransactionJob(
        submitQueue,
        mspId,
        'RemoveDataBlock',
        id
      );
  
      return response.status(202).json({
        jobId: jobId,
      });
    }
  } catch (err) {
    console.log("Failed to delete: ", err);
    return response.status(500).json({
      status: 'Internel Server Error. Contact Administrator'
    });
  }
});

router.patch('/lease/:datablockId', async (request: express.Request, response: express.Response) => {
  const id = request.params.datablockId;
  const mspId = request.body.walletId;
  try {
    const submitQueue = request.app.locals.jobq as Queue;
    if (request.body.action == "lease") {
      const jobId = await addSubmitTransactionJob(
        submitQueue,
        mspId,
        'LeaseData',
        id,
        request.body.to
      );
      return response.status(202).json({
        status: 'ACCEPTED',
        jobId: jobId,
      });
    } else if (request.body.action == "release") {
      const jobId = await addSubmitTransactionJob(
        submitQueue,
        mspId,
        'ReleaseLease',
        id
      );
      return response.status(202).json({
        status: 'ACCEPTED',
        jobId: jobId,
      });
    } else {
      throw new Error("Invalid action. Allowed Values -> lease | release");
    }
  } catch (err) {
    return response.status(500).json({
      status: 'Internel Server Error. ' + err.message,
    });
  }
});

function getConnection() {
  return mysql.createConnection({
    host: 'localhost',
    user: config.mySqlUsername,
    password: config.mySqlPassword,
    database: config.mySqldb
  });
}

function readData(sql: string): any {
  return new Promise((resolve, reject) => {
    const connection = getConnection();
    connection.connect()
    connection.query(sql, (err, rows) => {
      if (err) {
        return reject(err);
      }
      return resolve(rows[0])
    });
    connection.end();
  });
}

function deleteData(sql: string): any {
  return new Promise((resolve, reject) => {
    const connection = getConnection();
    connection.connect()
    connection.query(sql, (err, rows) => {
      if (err) {
        return reject(err);
      }
      return resolve(true)
    });
    connection.end();
  });
}

function insertData(sql: string, data: object) {
  return new Promise((resolve, reject) => {
    const connection = getConnection();
    connection.connect()
    connection.query(sql, data, function (err, results, fields) {
      if (err) {
        return reject(err);
      }
      return resolve(true);
    });
    connection.end();
  });
}

function validateDatablock(data: DataBlockRequest): Number {
  if (data.title == null || data.description == null || data.owner == null || data.storageType == null) {
    throw new Error('Bad Request. Title, Description, Owner and StorageType can not be null.');
  }
  const validStorageTypes = ["azure", "local"];
  if (!validStorageTypes.includes(data.storageType.toLowerCase())) {
    throw new Error('Bad Request. Invalid Storage Type.');
  }
  if (data.storageType.toLowerCase() == "azure" && data.azure == null) {
    throw new Error('Bad Request. Please provide azure fileshare details.');
  }
  if (data.storageType.toLowerCase() == "local" && data.local == null) {
    throw new Error('Bad Request. Please provide local volume details.');
  }
  return 0;
};

export default router;