global.Promise = require('bluebird');
require('babel-polyfill');

import client, {
	guild
} from './client/client';

client.on('debug', console.error);

client.on('ready', () => {
	require('./modules/welcome/module');
});