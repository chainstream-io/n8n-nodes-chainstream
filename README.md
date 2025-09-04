[![Verified on MseeP](https://mseep.ai/badge.svg)](https://mseep.ai/app/bd76f121-1c8f-4f5d-9c65-1eac5d81b6af)

# n8n-nodes-chainstream

This is an n8n community node that lets you interact with Chainstream real-time blockchain data services in your n8n workflows.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Credentials](#credentials)
[Operations](#operations)
[Compatibility](#compatibility)
[Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Credentials

The Chainstream node requires API key credentials:

- **API Client ID**: Your Chainstream API public key
- **API Client Secret**: Your Chainstream API private key

## Operations

The Chainstream node supports the following operations:

### Get Token Info
Get detailed information about a token on any supported blockchain.

### Search Tokens
Search for tokens across multiple blockchains with filters.

### Get Multiple Tokens
Retrieve information for multiple tokens in a single request.

### Token Migration Events
Subscribe to token migration events across chains.

## Example Usage

To use the Chainstream node:

1. Add your API credentials
2. Select an operation (e.g. Get Token Info)
3. Configure the required parameters:
   - Chain ID
   - Token address
   - Search filters (for search operations)

The node will fetch real-time blockchain data and return the results.

## Error Handling

The node includes comprehensive error handling and will return clear error messages if:
- Invalid credentials are provided
- Required parameters are missing 
- The API request fails
- Rate limits are exceeded
