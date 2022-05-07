/*
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { Contract } from 'fabric-network';
import { getTransactionValidationCode } from './../services/gateway';

export const router = express.Router();

router.get(
  '/:transactionId',
  async (request: express.Request, res: express.Response) => {
    const mspId = request.headers.walletid as string;
    const transactionId = request.params.transactionId;
    try {
        const qsccContract = request.app.locals[mspId]?.qsccContract as Contract;
        const validationCode = await getTransactionValidationCode(
            qsccContract,
            transactionId
        );

        return res.status(200).json({
            transactionId,
            validationCode,
        });
    } catch (err) {
        console.log("Error: ", err);
        return res.status(500).json({
          status: "Failed to get a transaction",
        });
    }
});

export default router;