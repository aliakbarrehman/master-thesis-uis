/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

// Deterministic JSON.stringify()
const stringify  = require('json-stringify-deterministic');
const sortKeysRecursive  = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');

class DataContract extends Contract {

    async InitLedger(ctx) {
        // Do nothing when initiating chaincode
    }

    async AddDataBlock(ctx, data) {
        const metaData = JSON.parse(data);
        const exists = await this.DataBlockExists(ctx, metaData.id);
        if (exists) {
            throw new Error(`The data with this id ${metaData.id} already exists`);
        }
        await ctx.stub.putState(metaData.id, Buffer.from(stringify(sortKeysRecursive(metaData))));
        return JSON.stringify(metaData);
    }

    // Read and return a data block on the channel
    async ReadDataBlock(ctx, id) {
        const exists = await this.DataBlockExists(ctx, id);
        if (exists) {
            const data = await ctx.stub.getState(id);
            return data.toString();
        }
        throw new Error(`The data ${id} does not exist`);
    }

    // UpdateAsset updates an existing asset in the world state with provided parameters.
    async UpdateDataBlock(ctx, id, data) {
        const updates = JSON.parse(data);
        if (updates.owner != null) {
            // can't update owner
        }
        const existingData = JSON.parse(await this.ReadDataBlock(ctx, id));
        // overwriting original asset with new asset
        const updatedData = {...existingData, ...updates};
        console.log(updatedData);
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        return ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(updatedData))));
    }

    // RemoveData from the worldState
    async RemoveDataBlock(ctx, id) {
        const exists = await this.DataBlockExists(ctx, id);
        if (!exists) {
            throw new Error(`The data ${id} does not exist`);
        }
        return ctx.stub.deleteState(id);
    }

    // Check if data exists
    async DataBlockExists(ctx, id) {
        const assetJSON = await ctx.stub.getState(id);
        return assetJSON && assetJSON.length > 0;
    }

    // LeaseData updates the lease of asset identifying the current user of the data
    async LeaseData(ctx, id, lease) {
        const assetString = await this.ReadDataBlock(ctx, id);
        const asset = JSON.parse(assetString);
        const oldOwner = asset.Owner;
        // TODO: Check here if can be leased
        asset.lease = lease;
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(asset))));
        return oldOwner;
    }

    // ReleaseLease method updates the lease null meaning no one is using the data at this time
    async ReleaseLease(ctx, id) {
        const assetString = await this.ReadDataBlock(ctx, id);
        const asset = JSON.parse(assetString);
        asset.lease = '';
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(asset))));
        return oldOwner;
    }

    // GetAllAssets returns all assets found in the world state.
    async GetAllDataBlocks(ctx) {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
}

module.exports = DataContract;
