**Version:** 0.0.77  
**Status:** Submitted to Creator Portal, awaiting approval  
**Compatible with:** n8n v1.113.0+

# n8n-nodes-chainstream

[![Verified on MseeP](https://mseep.ai/badge.svg)](https://mseep.ai/app/bd76f121-1c8f-4f5d-9c65-1eac5d81b6af)

`n8n-nodes-chainstream` is an n8n community node that enables workflows to access real-time blockchain data via [Chainstream](https://chainstream.io). It supports token, wallet, and trade queries across multiple chains, and is designed for reuse, easy extension, and straightforward review.

---

## 🚀 Installation

```bash
npm install n8n-nodes-chainstream
```

- Restart n8n to load the new community node.
- Add the Chainstream node to your workflow and configure credentials.

---

## 🔐 Credentials

Create a new credential in n8n:

- **API Client ID** — Chainstream public key
- **API Client Secret** — Chainstream private key

⚠️ Do not commit real keys to your repository or exported workflows. Use placeholders in templates and bind credentials after import.

---

## ⚡ Quickstart

1. Go to **Workflows → Import** in n8n and upload `/templates/workflow.json` from this repo.
2. Run:

   ```bash
   npm install n8n-nodes-chainstream
   ```

3. Create and bind your Chainstream credential.
4. Configure a trigger (e.g., Telegram, webhook, cron).
5. Run the workflow and inspect the Chainstream node output.

> Note: `/templates/workflow.json` uses credential placeholders. Replace them after import.

---

## 🧪 Example Node Configuration

**Node:** Chainstream

- **Credentials:** ChainstreamApi
- **Resource:** token
- **Operation:** get
- **Chain ID:** 137
- **Token Address:** `0x1234...abcd`
- **Options:** (leave default)

**Example output:**

```json
{
	"symbol": "ABC",
	"name": "Token ABC",
	"decimals": 18,
	"address": "0x..."
}
```

For batch runs, use expressions or upstream nodes to supply dynamic parameters.

---

## 📚 Supported Resources

Short summary of supported resources (full mapping in `DEVELOPER.md`):

- **token** — metadata, prices, holders, liquidity, security, mint/burn
- **trade** — listings, activities, leaderboards
- **wallet** — balance queries

---

## 🧑‍💻 Developer Notes

The `execute` method builds requests dynamically:

1. Reads `resource` and `operation` per item
2. Calls `buildRequest()` to map to `{ method, path, qs }`
3. Sends request via `chainstreamApiRequest()`
4. Wraps response with `constructExecutionMetaData()`
5. Handles errors via `NodeOperationError`, respects `continueOnFail`

Full handler mapping and endpoint patterns are in `DEVELOPER.md`.

---

## 🛠️ Troubleshooting

- **Invalid resource/operation** → check for typos
- **Bad parameters** → test with single item before batching
- **API errors** → inspect node output, verify credentials
- **Batch runs** → enable `Continue On Fail` to capture per-item errors

Debug tips:

- Use **Executions** view to inspect inputs/outputs
- Add a **Set** node to test static parameters
- Start with one item to simplify debugging

---

## 🧪 Contributing & CI

```bash
npm run build   # Compile TypeScript
npm run lint    # Run ESLint
npm run test    # Run Jest tests
```

- `prepublishOnly` runs build + lint before publishing
- Use GitHub Actions to automate lint/build/test
- Keep TypeScript strict and ESLint green

To add a new operation:

1. Add handler in `buildRequest()`
2. Extract parameters via `getNodeParameter(..., i)`
3. Return `{ method, path, qs? }`
4. Add tests and update `DEVELOPER.md`

---

## 📦 Templates & Reviewer Guidance

- `/templates/workflow.json` — example workflow
- `/templates/README-template.md` — import instructions
- If reviewers lack production keys, provide:
  - mock API
  - test account
  - recorded executions

When submitting:

- Include repo link, npm package name/version
- Provide install steps and sample outputs
- Add screenshots if possible

---

## 📬 Contact & Support

- Maintainer: Chainstream Team – [ai@chainstream.io](mailto:ai@chainstream.io)
- Issues & PRs: [GitHub Issues](https://github.com/chainstream-io/n8n-nodes-chainstream/issues)

---

## 📄 License

MIT

---
