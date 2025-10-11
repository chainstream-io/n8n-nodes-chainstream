### Chainstream n8n Template

Short one-line summary of what this workflow/template does  
Demonstrates using the n8n Chainstream nodes to fetch account info, place a trade, transform results, and forward them to a webhook or database.

### About
A concise description explaining the purpose, typical use-case, and high-level behavior of the template. This workflow triggers on a schedule or webhook, queries Chainstream for token/wallet/trade information, optionally places a trade, and forwards processed results to a webhook or storage node. Intended for demonstration and testing with a Chainstream sandbox or test API key.

### Key features
- Uses Chainstream credentials to authenticate API calls  
- Demonstrates read (token, wallet) and write (create trade) operations  
- Includes a transform step to normalize API responses for downstream systems  
- Exports a ready-to-import workflow.json for quick testing

### Prerequisites
- n8n version: >= 0.270.0  
- Node package: n8n-nodes-chainstream (install or enable if not bundled)  
- Credentials required: Chainstream API key or token  
- Optional: destination webhook URL or database credentials for persistence

### Installation
1. Import the workflow  
   - Open n8n → Workflows → Import from file → select `workflow.json` from the templates folder.  
2. Install or enable the custom node package  
   - Self-hosted n8n (npm): `npm install -g n8n-nodes-chainstream`  
   - For Docker-based n8n, add the package to your custom image per your deployment instructions.  
3. Add credentials  
   - In n8n: Credentials → New → select `Chainstream API` and paste your API key. For testing use a sandbox/test API key if available.

### Configuration
- Chainstream Credential: enter your API key or token.  
- Trigger node: set Schedule Trigger cron/interval or copy the Webhook Trigger URL for external calls.  
- Place Trade node parameters  
  - `symbol` — trading pair, e.g., `BTC/USD`  
  - `side` — `buy` or `sell`  
  - `amount` — numeric trade amount  
  - `price` (optional) — limit price for limit orders  
- Output node: configure Webhook/HTTP Request or database node with destination URL/credentials

### How it works
1. Trigger node starts the workflow via schedule or webhook.  
2. Chainstream node authenticates with the configured credential and fetches account data.  
3. Transform node maps Chainstream response to a simplified JSON shape such as `{ accountId, balances, positions }` or a trade confirmation structure.  
4. Chainstream node optionally places a trade using normalized parameters.  
5. Output node sends the final payload to a webhook, Slack, or database for persistence or notification.

### Input and output
Expected input for webhook-triggered workflow
```json
{
  "action": "place_trade",
  "symbol": "BTC/USD",
  "side": "buy",
  "amount": 0.01,
  "price": 30000
}
```
Example output after a successful trade
```json
{
  "status": "success",
  "tradeId": "trade_abc123",
  "symbol": "BTC/USD",
  "filledAmount": 0.01,
  "avgPrice": 29950.5,
  "timestamp": "2025-10-11T12:34:56Z"
}
```

### Example usage
1. Import the template and configure Chainstream credential.  
2. Execute the webhook trigger with the example input JSON for a manual test.  
3. Confirm the trade confirmation or fetched data arrives at the output node (webhook or DB).

### Troubleshooting
- 401 Unauthorized — verify the Chainstream API key and scopes.  
- Rate limit errors — add retries/backoff or reduce trigger frequency.  
- Missing fields — check Transform node mappings and Chainstream response structure.

### Notes and limitations
- This template is for demonstration; validate trade logic in a sandbox before using real funds.  
- Real exchange behavior may be asynchronous and require polling or webhooks from Chainstream.  
- Do not commit real API keys to the repository; use placeholders in exported workflow.json.

### Files included
- `workflow.json` — exported workflow for import (located in `templates/`)  
- `README-template.md` — this file  
- `CHANGELOG.md` and `LICENSE` — project metadata

### Attribution and license
- Node package: n8n-nodes-chainstream  
- License: MIT

### Contact / Support
- Maintainer: Chainstream IO  
- Contact: ai@liberfi.io