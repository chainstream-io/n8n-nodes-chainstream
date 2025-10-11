# n8n-nodes-chainstream

[![Verified on MseeP](https://mseep.ai/badge.svg)](https://mseep.ai/app/bd76f121-1c8f-4f5d-9c65-1eac5d81b6af)

n8n-nodes-chainstream is an n8n community node that lets n8n workflows call Chainstream real-time blockchain data services. It is designed for reuse, easy extension and straightforward review: the execute method builds a { method, path, qs } request from a compact handlers table, sends it using chainstreamApiRequest, and returns standard n8n execution items.

---

## Installation

- Install the package into the environment that runs n8n:

  npm install n8n-nodes-chainstream

- Restart n8n so the community node is discovered.
- Add the Chainstream node to your workflow and configure credentials.

---

## Credentials

Create a Chainstream credential in n8n (Credentials → Create):

- **API Client ID** — Chainstream public key
- **API Client Secret** — Chainstream private key

Save the credential in n8n’s Credentials manager and select it in the node. Do not commit real keys to the repository or to exported workflow JSON. Replace template placeholders with your credential after importing example workflows.

---

## Quickstart — import example workflow and run

1. In n8n open Workflows → Import and paste or upload `/templates/workflow.json` from this repository.
2. Ensure the n8n runtime has the npm package installed (npm install n8n-nodes-chainstream).
3. Create Chainstream credential in n8n and bind it to the node (use the template credential name or rebind after import).
4. Configure the workflow trigger (Telegram bot token, webhook URL, cron, etc.).
5. Trigger the workflow and inspect the Chainstream node output in Executions.

Notes:

- `/templates/workflow.json` uses credential placeholders; replace them with your credentials after import.
- If reviewers cannot use production Chainstream keys, provide a mock server or recorded example executions (see `/templates/README-template.md`).

---

## Example node configuration (screenshot text)

Node: Chainstream

- **Credentials**: ChainstreamApi (select your saved credential)
- **Resource**: token
- **Operation**: get
- **Chain ID**: 137
- **Token Address**: 0x1234...abcd
- **Options**: (leave defaults)

Execution result: the node returns Chainstream JSON for the requested token. For batch runs, use expressions or a previous node (Set / HTTP Request) to supply Chain ID and Token Address per item.

Example minimal node output (item JSON):

```json
{
	"symbol": "ABC",
	"name": "Token ABC",
	"decimals": 18,
	"address": "0x..."
}
```

---

## Supported resources (user-facing summary)

To keep the public README concise, a short summary is provided here. The full operation → path mapping is available in DEVELOPER.md in this repository for reviewers and advanced users.

- **token** — token info, metadata, prices, holders, candles, liquidity, stats, security, mint/burn, creation
- **trade** — trade listings, activities, leaderboards
- **wallet** — balance queries

If you need the complete list of operations and exact HTTP paths, see DEVELOPER.md.

---

## Why keep the detailed mapping in developer docs

- Keeps the public README short and user-friendly.
- Prevents the README from becoming long and hard to scan.
- Preserves full implementation detail in a developer-focused file (DEVELOPER.md) for maintainers and reviewers.

Recommended policy: public README = short summary + examples; developer docs = full handlers table and request patterns.

---

## Error handling and troubleshooting

- Unsupported resource/operation: node throws a descriptive NodeOperationError; check Resource and Operation fields for typos.
- Invalid parameters (Chain ID, address, etc.): verify per-item inputs and test with a single item before batching.
- API errors (auth, rate limits): inspect the Chainstream response in node output; verify credentials and API usage.
- Batch runs: enable **Continue On Fail** to capture per-item errors and continue execution.

Debug tips:

- Use the Executions view to inspect raw node inputs and outputs.
- Add a Set node to provide explicit Chain ID and Token Address for tests.
- Test with a single item to simplify troubleshooting.

---

## Developer notes — how execute builds and sends requests

The execute method is implemented to be compact and extensible:

1. For each input item, read node parameters: resource and operation.
2. Call buildRequest(), a small function that:
   - prepares a qs (query) object when needed,
   - extracts item-scoped parameters via getNodeParameter(..., i),
   - maps resource → operation using a handlers table and returns { method, path, qs }.
3. Call chainstreamApiRequest.call(this, method, path, {}, qs || {}) to perform the API call.
4. Wrap the response using this.helpers.constructExecutionMetaData(...) and push it to output.
5. Unsupported resource/operation throws NodeOperationError; continueOnFail is respected and returns per-item error output when enabled.

Benefits:

- Single place (handlers table) to add or modify operations.
- Clear per-item parameter extraction to avoid cross-item state issues.
- Uniform error handling and output format.

For the complete handlers mapping and exact endpoint patterns, see DEVELOPER.md.

---

## Contributing, tests and CI

- Build: npm run build
- Lint: npm run lint
- Test: npm run test

prepublishOnly runs build and lint; ensure these steps pass in CI before publishing. Use GitHub Actions to run lint, build and tests on PRs. Keep TypeScript strict mode and ESLint green.

When adding an operation:

1. Add a handler entry in the handlers map inside buildRequest.
2. Extract parameters with getNodeParameter(..., i) and set qs fields as needed.
3. Return { method, path, qs? } and add tests.
4. Update DEVELOPER.md with the new mapping.

---

## Templates and reviewer guidance

- `/templates/workflow.json` — example workflow with credential placeholders.
- `/templates/README-template.md` — import and verification instructions for the template.
- If reviewers cannot access production keys, include a mock API, test account instructions, or recorded executions with sample request/response fixtures.

When opening a PR for inclusion or review, provide:

- Repo link and npm package name/version.
- Quick installation and verification steps.
- Screenshots and sample outputs to speed reviewer validation.

---

## Contact & support

- Maintainer: ai@liberfi.io
- Issues & PRs: https://github.com/liberfi-io/n8n-nodes-chainstream/issues

---

## License

MIT

---
