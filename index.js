// This file ensures n8n can find and load your nodes and credentials
const { Chainstream } = require('./dist/nodes/Chainstream/Chainstream.node.js');

module.exports = {
	nodeTypes: {
		chainstream: Chainstream,
	},
	credentialTypes: {
		chainstreamApi: require('./dist/credentials/ChainstreamApi.credentials.js').ChainstreamApi,
	},
};
