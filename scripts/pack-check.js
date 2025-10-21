const { execSync } = require("child_process");
const pkg = require("../package.json");

console.log("→ Running npm pack...");
execSync("npm pack", { stdio: "inherit" });

const filename = `n8n-nodes-chainstream-${pkg.version}.tgz`;
console.log(`→ Listing archive: ${filename}`);
execSync(`tar -tf ${filename}`, { stdio: "inherit" });

console.log("✔ Tarball content listed successfully");
