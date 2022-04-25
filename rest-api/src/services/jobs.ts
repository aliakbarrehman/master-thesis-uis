/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * This sample uses BullMQ jobs to process submit transactions, which includes
 * retry support for failing jobs
 */

import { ConnectionOptions, Job, Queue, QueueScheduler, Worker } from 'bullmq';
import { Application } from 'express';
import { Contract, Transaction } from 'fabric-network';
import * as config from '../utils/config';
import { submitTransaction } from './gateway';

export type JobData = {
  mspid: string;
  transactionName: string;
  transactionArgs: string[];
  transactionState?: Buffer;
  transactionIds: string[];
};

export type JobResult = {
  transactionPayload?: Buffer;
  transactionError?: string;
};

export type JobSummary = {
  jobId: string;
  transactionIds: string[];
  transactionPayload?: string;
  transactionError?: string;
};

const connection: ConnectionOptions = {
  port: config.redisPort,
  host: config.redisHost,
  username: config.redisUsername,
  password: config.redisPassword,
};

/**
 * Set up the queue for submit jobs
 */
export const initJobQueue = (): Queue => {
  const submitQueue = new Queue(config.JOB_QUEUE_NAME, {
    connection,
    defaultJobOptions: {
      attempts: config.submitJobAttempts,
      backoff: {
        type: config.submitJobBackoffType,
        delay: config.submitJobBackoffDelay,
      },
      removeOnComplete: config.maxCompletedSubmitJobs,
      removeOnFail: config.maxFailedSubmitJobs,
    },
  });

  return submitQueue;
};

/**
 * Set up a worker to process submit jobs on the queue, using the
 * processSubmitTransactionJob function below
 */
export const initJobQueueWorker = (app: Application): Worker => {
  const worker = new Worker<JobData, JobResult>(
    config.JOB_QUEUE_NAME,
    async (job): Promise<JobResult> => {
      return await processSubmitTransactionJob(app, job);
    },
    { connection, concurrency: config.submitJobConcurrency }
  );

  worker.on('failed', (job) => {
    console.log('Job failed: ', job);
  });

  // Important: need to handle this error otherwise worker may stop
  // processing jobs
  worker.on('error', (err) => {
    console.log('Worker Error: ', err);
  });
  
  return worker;
};

/**
 * Process a submit transaction request from the job queue
 *
 * The job will be retried if this function throws an error
 */
export const processSubmitTransactionJob = async (
  app: Application,
  job: Job<JobData, JobResult>
): Promise<JobResult> => {
  console.log('Processing job: ', job);

  const contract = app.locals[job.data.mspid]?.assetContract as Contract;
  if (contract === undefined) {
    console.log('Contract not found for MSP');

    // Retrying will never work without a contract, so give up with an
    // empty job result
    return {
      transactionError: undefined,
      transactionPayload: undefined,
    };
  }

  const args = job.data.transactionArgs;
  let transaction: Transaction;

  if (job.data.transactionState) {
    const savedState = job.data.transactionState;
    console.log('Reusing previously saved transaction state');
    transaction = contract.deserializeTransaction(savedState);
  } else {
    console.log('Using new transaction');
    transaction = contract.createTransaction(job.data.transactionName);
    await updateJobData(job, transaction);
  }

  console.log('Submitting transaction');

  try {
    const payload = await submitTransaction(transaction, ...args);

    return {
      transactionError: undefined,
      transactionPayload: payload,
    };
  } catch (err) {
    // retry here
    console.log('Transaction failed: ', err)
  }
};

/**
 * Set up a scheduler for the submit job queue
 *
 * This manages stalled and delayed jobs and is required for retries with backoff
 */
export const initJobQueueScheduler = (): QueueScheduler => {
  const queueScheduler = new QueueScheduler(config.JOB_QUEUE_NAME, {
    connection,
  });

  queueScheduler.on('failed', (jobId, failedReason) => {
    console.log('Queue sceduler failure');
  });

  return queueScheduler;
};

/**
 * Helper to add a new submit transaction job to the queue
 */
export const addSubmitTransactionJob = async (
  submitQueue: Queue<JobData, JobResult>,
  mspid: string,
  transactionName: string,
  ...transactionArgs: string[]
): Promise<string> => {
  const jobName = `submit ${transactionName} transaction`;
  const job = await submitQueue.add(jobName, {
    mspid,
    transactionName,
    transactionArgs: transactionArgs,
    transactionIds: [],
  });

  if (job?.id === undefined) {
    throw new Error('Submit transaction job ID not available');
  }

  return job.id;
};

/**
 * Helper to update the data for an existing job
 */
export const updateJobData = async (
  job: Job<JobData, JobResult>,
  transaction: Transaction | undefined
): Promise<void> => {
  const newData = { ...job.data };

  if (transaction != undefined) {
    const transationIds = ([] as string[]).concat(
      newData.transactionIds,
      transaction.getTransactionId()
    );
    newData.transactionIds = transationIds;

    newData.transactionState = transaction.serialize();
  } else {
    newData.transactionState = undefined;
  }

  await job.update(newData);
};

/**
 * Gets a job summary
 *
 * This function is used for the jobs REST endpoint
 */
export const getJobSummary = async (
  queue: Queue,
  jobId: string
): Promise<JobSummary> => {
  const job: Job<JobData, JobResult> | undefined = await queue.getJob(jobId);

  if (!(job && job.id != undefined)) {
    return null;
  }

  let transactionIds: string[];
  if (job.data && job.data.transactionIds) {
    transactionIds = job.data.transactionIds;
  } else {
    transactionIds = [];
  }

  let transactionError;
  let transactionPayload;
  const returnValue = job.returnvalue;
  console.log(job);
  if (returnValue) {
    if (returnValue.transactionError) {
      transactionError = returnValue.transactionError;
    }

    if (
      returnValue.transactionPayload &&
      returnValue.transactionPayload.length > 0
    ) {
      transactionPayload = returnValue.transactionPayload.toString();
    } else {
      transactionPayload = '';
    }
  }

  const jobSummary: JobSummary = {
    jobId: job.id,
    transactionIds,
    transactionError,
    transactionPayload,
  };

  return jobSummary;
};
