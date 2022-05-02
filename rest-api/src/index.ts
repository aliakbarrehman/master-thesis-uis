import express from 'express';
import { buildWallet, putIdentity } from './services/wallet';
import * as gateway from './services/gateway';
import cors from 'cors';

import data from './routes/data';
import jobs from './routes/jobs';
import transactions from './routes/transactions';
import * as config from './utils/config';
import { Contract, Gateway, Network, Wallet } from 'fabric-network';
import fs from 'fs';
import { Queue, QueueScheduler, Worker } from 'bullmq';
import {
  initJobQueue,
  initJobQueueScheduler,
  initJobQueueWorker,
} from './services/jobs';

async function main() {
  var options = {
    "origin": "*",
    "methods":  ['GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    "preflightContinue": false,
    "optionsSuccessStatus": 204
  }
  const app = express();

  app.use(cors(options));
  app.options('*', cors(options));
  app.use(express.json());
  app.get('/', (request: express.Request, response: express.Response) => {
    // We can serve list of available endpoints on this route
    response.send('/data');
  });

  // Registering routes here
  app.use('/data', data);
  app.use('/job', jobs);
  app.use('/transaction', transactions);

  // const wallet: Wallet = await buildWallet(config.walletPath)
  // // Registering admins
  // putIdentity(wallet, 'admin@uis', config.mspIdOrg1, config.certificateOrg1, config.privateKeyOrg1);
  // putIdentity(wallet, 'admin@uib', config.mspIdOrg2, config.certificateOrg2, config.privateKeyOrg2);
  // putIdentity(wallet, 'admin@uio', config.mspIdOrg3, config.certificateOrg3, config.privateKeyOrg3);
  // app.locals["wallet"] = wallet;

  // // Creating gateway for uis
  // const gatewayOrg1: Gateway = await gateway.createGateway(
  //   readFileAsJson(config.connectionProfileOrg1),
  //   'admin@uis',
  //   wallet
  // );
  // const networkOrg1: Network = await gateway.getNetwork(gatewayOrg1);
  // const contractsOrg1: { assetContract: Contract; qsccContract: Contract } = await gateway.getContracts(networkOrg1);
  // app.locals[config.mspIdOrg1] = contractsOrg1;

  // // Creating gateway for uib
  // const gatewayOrg2: Gateway = await gateway.createGateway(
  //   readFileAsJson(config.connectionProfileOrg2),
  //   'admin@uib',
  //   wallet
  // );
  // const networkOrg2: Network = await gateway.getNetwork(gatewayOrg2);
  // const contractsOrg2: { assetContract: Contract; qsccContract: Contract } = await gateway.getContracts(networkOrg2);
  // app.locals[config.mspIdOrg2] = contractsOrg2;

  // // Creating gateway for uio
  // const gatewayOrg3: Gateway = await gateway.createGateway(
  //   readFileAsJson(config.connectionProfileOrg3),
  //   'admin@uio',
  //   wallet
  // );
  // const networkOrg3: Network = await gateway.getNetwork(gatewayOrg3);
  // const contractsOrg3: { assetContract: Contract; qsccContract: Contract } = await gateway.getContracts(networkOrg3);
  // app.locals[config.mspIdOrg3] = contractsOrg3;

  // console.log('Initialising submit job queue');
  // let jobQueue: Queue = initJobQueue();
  // let jobQueueWorker: Worker = initJobQueueWorker(app);
  // let jobQueueScheduler: QueueScheduler;
  // if (config.submitJobQueueScheduler === true) {
  //   console.log('Initialising submit job queue scheduler');
  //   jobQueueScheduler = initJobQueueScheduler();
  // }
  // app.locals.jobq = jobQueue;

  console.log('Starting REST server');

  app.listen(config.port, () => {
    console.log(`Example app listening at http://localhost:${config.port}`);
  });
}

const readFileAsJson = (path: string) => {
  const connectionProfileJson = fs.readFileSync(path).toString();
  return JSON.parse(connectionProfileJson);
}

main();