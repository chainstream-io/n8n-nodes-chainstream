const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");
const { writeFileSync, mkdirSync } = require("fs");
const { join } = require("path");

const ChainstreamConfig = z.object({
  id: z.string(),
  name: z.string().optional(),
  webhookUrl: z.string().url(),
});

const schemaJson = zodToJsonSchema(ChainstreamConfig, "ChainstreamConfig");

const outDir = join(__dirname, "..", "dist", "schema");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "ChainstreamConfig.json"), JSON.stringify(schemaJson, null, 2));

console.log("✅ Schema generated to dist/schema/ChainstreamConfig.json");
