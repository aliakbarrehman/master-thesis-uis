/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Queue } from 'bullmq';
import express from 'express';
import { getJobSummary } from './../services/jobs';

const router = express.Router();

router.get('/:jobId', async (request: express.Request, response: express.Response) => {
  const jobId = request.params.jobId;

  try {
    const submitQueue = request.app.locals.jobq as Queue;

    const jobSummary = await getJobSummary(submitQueue, jobId);

    return response.status(200).json(jobSummary);
  } catch (err) {
    return response.status(500).json({
      status: "Failed to get the job",
    });
  }
});

export default router;