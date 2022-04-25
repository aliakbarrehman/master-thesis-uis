/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The sample REST server can be configured using the environment variables
 * documented below
 *
 * In a local development environment, these variables can be loaded from a
 * .env file by starting the server with the following command:
 *
 *   npm start:dev
 *
 * The scripts/generateEnv.sh script can be used to generate a suitable .env
 * file for the Fabric Test Network
 */

import * as env from 'env-var';

export const JOB_QUEUE_NAME = 'submit';

/**
 * The port to start the REST server on
 */
export const port = env
  .get('PORT')
  .default('3000')
  .example('3000')
  .asPortNumber();

/**
 * The type of backoff to use for retrying failed submit jobs
 */
export const submitJobBackoffType = env
  .get('SUBMIT_JOB_BACKOFF_TYPE')
  .default('fixed')
  .asEnum(['fixed', 'exponential']);

/**
 * Backoff delay for retrying failed submit jobs in milliseconds
 */
export const submitJobBackoffDelay = env
  .get('SUBMIT_JOB_BACKOFF_DELAY')
  .default('3000')
  .example('3000')
  .asIntPositive();

/**
 * The total number of attempts to try a submit job until it completes
 */
export const submitJobAttempts = env
  .get('SUBMIT_JOB_ATTEMPTS')
  .default('5')
  .example('5')
  .asIntPositive();

/**
 * The maximum number of submit jobs that can be processed in parallel
 */
export const submitJobConcurrency = env
  .get('SUBMIT_JOB_CONCURRENCY')
  .default('5')
  .example('5')
  .asIntPositive();

/**
 * The number of completed submit jobs to keep
 */
export const maxCompletedSubmitJobs = env
  .get('MAX_COMPLETED_SUBMIT_JOBS')
  .default('1000')
  .example('1000')
  .asIntPositive();

/**
 * The number of failed submit jobs to keep
 */
export const maxFailedSubmitJobs = env
  .get('MAX_FAILED_SUBMIT_JOBS')
  .default('1000')
  .example('1000')
  .asIntPositive();

/**
 * Whether to initialise a scheduler for the submit job queue
 * There must be at least on queue scheduler to handle retries and you may want
 * more than one for redundancy
 */
export const submitJobQueueScheduler = env
  .get('SUBMIT_JOB_QUEUE_SCHEDULER')
  .default('true')
  .example('true')
  .asBoolStrict();

/**
 * Whether to convert discovered host addresses to be 'localhost'
 * This should be set to 'true' when running a docker composed fabric network on the
 * local system, e.g. using the test network; otherwise should it should be 'false'
 */
export const asLocalhost = env
  .get('AS_LOCAL_HOST')
  .default('true')
  .example('true')
  .asBoolStrict();

/**
 * The Org1 MSP ID
 */
export const mspIdOrg1 = env
  .get('HLF_MSP_ID_ORG1')
  .default(`UiSMSP`)
  .example(`UiSMSP`)
  .asString();

/**
 * The Org2 MSP ID
 */
export const mspIdOrg2 = env
  .get('HLF_MSP_ID_ORG2')
  .default(`UiBMSP`)
  .example(`UiBMSP`)
  .asString();
  /**
   * The Org1 MSP ID
   */
  export const mspIdOrg3 = env
    .get('HLF_MSP_ID_ORG3')
    .default(`UiOMSP`)
    .example(`UiOMSP`)
    .asString();

/**
 * Name of the channel which the basic asset sample chaincode has been installed on
 */
export const channelName = env
  .get('HLF_CHANNEL_NAME')
  .default('datachannel')
  .example('datachannel')
  .asString();

/**
 * Name used to install the basic asset sample
 */
export const chaincodeName = env
  .get('HLF_CHAINCODE_NAME')
  .default('data')
  .example('basic')
  .asString();

/**
 * MySQL Username
 */
 export const mySqlUsername = env
 .get('MYSQL_USERNAME')
 .default('rest_sa')
 .example('rest_sa')
 .asString();

/**
 * MySQL Username Password
 */
 export const mySqlPassword = env
 .get('MYSQL_PWD')
 .default('rest_sa_pwd')
 .example('rest_sa_pwd')
 .asString();

/**
 * MySQL Username Password
 */
 export const mySqldb = env
 .get('MYSQL_DB')
 .default('thesis')
 .example('thesis')
 .asString();

/**
 * The transaction submit timeout in seconds for commit notification to complete
 */
export const commitTimeout = env
  .get('HLF_COMMIT_TIMEOUT')
  .default('300')
  .example('300')
  .asIntPositive();

/**
 * The transaction submit timeout in seconds for the endorsement to complete
 */
export const endorseTimeout = env
  .get('HLF_ENDORSE_TIMEOUT')
  .default('30')
  .example('30')
  .asIntPositive();

/**
 * The transaction query timeout in seconds
 */
export const queryTimeout = env
  .get('HLF_QUERY_TIMEOUT')
  .default('3')
  .example('3')
  .asIntPositive();

/**
 * The Org1 connection profile JSON
 */
export const connectionProfileOrg1 = env
  .get('HLF_CONNECTION_PROFILE_ORG1')
  .default('/mnt/c/Users/Rehman/Downloads/Thesis/master-thesis-uis/hyperledger-network/crypto-config/peerOrganizations/uis.example.com/connection-uis.json')
  .example('/mnt/c/Users/Rehman/Downloads/Thesis/master-thesis-uis/hyperledger-network/crypto-config/peerOrganizations/uis.example.com/connection-uis.json')
  .asString();

/**
 * Certificate for an Org1 identity to evaluate and submit transactions
 */
export const certificateOrg1 = env
  .get('HLF_CERTIFICATE_ORG1')
  .default('/mnt/c/Users/Rehman/Downloads/Thesis/master-thesis-uis/hyperledger-network/crypto-config/peerOrganizations/uis.example.com/users/Admin@uis.example.com/msp/signcerts/cert.pem')
  .example('/mnt/c/Users/Rehman/Downloads/Thesis/master-thesis-uis/hyperledger-network/crypto-config/peerOrganizations/uis.example.com/users/Admin@uis.example.com/msp/signcerts/cert.pem')
  .asString();

/**
 * Private key for an Org1 identity to evaluate and submit transactions
 */
export const privateKeyOrg1 = env
  .get('HLF_PRIVATE_KEY_ORG1')
  .default('/mnt/c/Users/Rehman/Downloads/Thesis/master-thesis-uis/hyperledger-network/crypto-config/peerOrganizations/uis.example.com/users/Admin@uis.example.com/msp/keystore/key')
  .example('/mnt/c/Users/Rehman/Downloads/Thesis/master-thesis-uis/hyperledger-network/crypto-config/peerOrganizations/uis.example.com/users/Admin@uis.example.com/msp/keystore/key')
  .asString();

/**
 * The Org2 connection profile JSON
 */
 export const connectionProfileOrg2 = env
 .get('HLF_CONNECTION_PROFILE_ORG2')
 .default('/mnt/c/Users/Rehman/Downloads/Thesis/master-thesis-uis/hyperledger-network/crypto-config/peerOrganizations/uib.example.com/connection-uib.json')
 .example('/mnt/c/Users/Rehman/Downloads/Thesis/master-thesis-uis/hyperledger-network/crypto-config/peerOrganizations/uib.example.com/connection-uib.json')
 .asString();

/**
* Certificate for an Org2 identity to evaluate and submit transactions
*/
export const certificateOrg2 = env
 .get('HLF_CERTIFICATE_ORG2')
 .default('/mnt/c/Users/Rehman/Downloads/Thesis/master-thesis-uis/hyperledger-network/crypto-config/peerOrganizations/uib.example.com/users/Admin@uib.example.com/msp/signcerts/cert.pem')
 .example('/mnt/c/Users/Rehman/Downloads/Thesis/master-thesis-uis/hyperledger-network/crypto-config/peerOrganizations/uib.example.com/users/Admin@uib.example.com/msp/signcerts/cert.pem')
 .asString();

/**
* Private key for an Org2 identity to evaluate and submit transactions
*/
export const privateKeyOrg2 = env
 .get('HLF_PRIVATE_KEY_ORG2')
 .default('/mnt/c/Users/Rehman/Downloads/Thesis/master-thesis-uis/hyperledger-network/crypto-config/peerOrganizations/uib.example.com/users/Admin@uib.example.com/msp/keystore/key')
 .example('/mnt/c/Users/Rehman/Downloads/Thesis/master-thesis-uis/hyperledger-network/crypto-config/peerOrganizations/uib.example.com/users/Admin@uib.example.com/msp/keystore/key')
 .asString();

/**
 * The Org3 connection profile JSON
 */
 export const connectionProfileOrg3 = env
 .get('HLF_CONNECTION_PROFILE_ORG3')
 .default('/mnt/c/Users/Rehman/Downloads/Thesis/master-thesis-uis/hyperledger-network/crypto-config/peerOrganizations/uio.example.com/connection-uio.json')
 .example('/mnt/c/Users/Rehman/Downloads/Thesis/master-thesis-uis/hyperledger-network/crypto-config/peerOrganizations/uio.example.com/connection-uio.json')
 .asString();

/**
* Certificate for an Org3 identity to evaluate and submit transactions
*/
export const certificateOrg3 = env
 .get('HLF_CERTIFICATE_ORG3')
 .default('/mnt/c/Users/Rehman/Downloads/Thesis/master-thesis-uis/hyperledger-network/crypto-config/peerOrganizations/uio.example.com/users/Admin@uio.example.com/msp/signcerts/cert.pem')
 .example('/mnt/c/Users/Rehman/Downloads/Thesis/master-thesis-uis/hyperledger-network/crypto-config/peerOrganizations/uio.example.com/users/Admin@uio.example.com/msp/signcerts/cert.pem')
 .asString();

/**
* Private key for an Org3 identity to evaluate and submit transactions
*/
export const privateKeyOrg3 = env
 .get('HLF_PRIVATE_KEY_ORG3')
 .default('/mnt/c/Users/Rehman/Downloads/Thesis/master-thesis-uis/hyperledger-network/crypto-config/peerOrganizations/uio.example.com/users/Admin@uio.example.com/msp/keystore/key')
 .example('/mnt/c/Users/Rehman/Downloads/Thesis/master-thesis-uis/hyperledger-network/crypto-config/peerOrganizations/uio.example.com/users/Admin@uio.example.com/msp/keystore/key')
 .asString();

 /**
  * Wallet path
  */
export const walletPath = env.get('WALLET_PATH')
  .default('/mnt/c/Users/Rehman/Downloads/Thesis/master-thesis-uis/rest-api/wallet')
  .example('/mnt/c/Users/Rehman/Downloads/Thesis/master-thesis-uis/rest-api/wallet')
  .asString();

/**
 * The host the Redis server is running on
 */
export const redisHost = env
  .get('REDIS_HOST')
  .default('localhost')
  .example('localhost')
  .asString();

/**
 * The port the Redis server is running on
 */
export const redisPort = env
  .get('REDIS_PORT')
  .default('6379')
  .example('6379')
  .asPortNumber();

/**
 * Username for the Redis server
 */
export const redisUsername = env
  .get('REDIS_USERNAME')
  .default('default')
  .example('default')
  .asString();

/**
 * Password for the Redis server
 */
export const redisPassword = env.get('REDIS_PASSWORD').default('fabric-redis-pwd').asString();

