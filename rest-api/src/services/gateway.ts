import {
    Contract,
    DefaultEventHandlerStrategies,
    DefaultQueryHandlerStrategies,
    Gateway,
    GatewayOptions,
    Wallets,
    Network,
    Transaction,
    Wallet,
  } from 'fabric-network';

import * as config from './../utils/config';
import * as protos from 'fabric-protos';
/**
 * Create a Gateway connection
 *
 * Gateway instances can and should be reused rather than connecting to submit every transaction
 */
export const createGateway = async (
    connectionProfile: Record<string, unknown>,
    identity: string,
    wallet: Wallet
  ): Promise<Gateway> => {  
    const gateway = new Gateway();
  
    const options: GatewayOptions = {
      wallet,
      identity,
      discovery: { enabled: true, asLocalhost: config.asLocalhost },
      eventHandlerOptions: {
        commitTimeout: config.commitTimeout,
        endorseTimeout: config.endorseTimeout,
        strategy: DefaultEventHandlerStrategies.PREFER_MSPID_SCOPE_ANYFORTX,
      },
      queryHandlerOptions: {
        timeout: config.queryTimeout,
        strategy: DefaultQueryHandlerStrategies.PREFER_MSPID_SCOPE_ROUND_ROBIN,
      },
    };
  
    await gateway.connect(connectionProfile, options);
  
    return gateway;
  };

/**
 * Get the network which the asset transfer sample chaincode is running on
 *
 * In addion to getting the contract, the network will also be used to
 * start a block event listener
 */
 export const getNetwork = async (gateway: Gateway): Promise<Network> => {
    const network = await gateway.getNetwork(config.channelName);
    return network;
  };

/**
 * Get the asset transfer sample contract and the qscc system contract
 *
 * The system contract is used for the liveness REST endpoint
 */
 export const getContracts = async (
    network: Network
  ): Promise<{ assetContract: Contract; qsccContract: Contract }> => {
    const assetContract = network.getContract(config.chaincodeName);
    const qsccContract = network.getContract('qscc');
    return { assetContract, qsccContract };
  };

/**
 * Evaluate a transaction and handle any errors
 */
 export const evaluateTransaction = async (
    contract: Contract,
    transactionName: string,
    ...transactionArgs: string[]
  ): Promise<Buffer> => {
    const transaction = contract.createTransaction(transactionName);
    const transactionId = transaction.getTransactionId();
    try {
      const payload = await transaction.evaluate(...transactionArgs);
      return payload;
    } catch (err) {
      console.log(transactionId, err);
    }
  };

/**
 * Submit a transaction and handle any errors
 */
 export const submitTransaction = async (
    transaction: Transaction,
    ...transactionArgs: string[]
  ): Promise<Buffer> => {
    const txnId = transaction.getTransactionId();
  
    try {
      const payload = await transaction.submit(...transactionArgs);
      return payload;
    } catch (err) {
      console.log("Error Happended")
        console.log(txnId, err);
    }
  };

/**
 * Get the validation code of the specified transaction
 */
 export const getTransactionValidationCode = async (
    qsccContract: Contract,
    transactionId: string
  ): Promise<string> => {
    const data = await evaluateTransaction(
      qsccContract,
      'GetTransactionByID',
      config.channelName,
      transactionId
    );
  
    const processedTransaction = protos.protos.ProcessedTransaction.decode(data);
    const validationCode =
      protos.protos.TxValidationCode[processedTransaction.validationCode];
  
    return validationCode;
  };