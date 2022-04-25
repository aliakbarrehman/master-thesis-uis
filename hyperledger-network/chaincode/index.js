/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const dataContract = require('./lib/assetTransfer');

module.exports.DataContract = dataContract;
module.exports.contracts = [dataContract];
