global.Promise = require('bluebird');
require('babel-polyfill');

import client, {} from './client/client';

client.on('debug', console.error);

client.on('ready', () => {
	require('./modules/welcome/module');
	require('./modules/roles/module');
});