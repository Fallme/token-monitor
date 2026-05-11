#!/usr/bin/env node
// Usage: RENDER_API_KEY=rnd_xxx node deploy.js
// Or set RENDER_API_KEY in .env file

const https = require("https");
const fs = require("fs");
const path = require("path");

// Load API key from env or .env file
let API_KEY = process.env.RENDER_API_KEY;
if (!API_KEY) {
  try {
    const env = fs.readFileSync(path.join(__dirname, ".env"), "utf-8");
    const m = env.match(/^RENDER_API_KEY=(.+)$/m);
    if (m) API_KEY = m[1].trim();
  } catch {}
}

if (!API_KEY) {
  console.error("Error: RENDER_API_KEY not set.");
  console.error("Get one at https://render.com/account/api-keys");
  console.error("Then either:");
  console.error("  1. Set env var: RENDER_API_KEY=rnd_xxx node deploy.js");
  console.error("  2. Add to .env file: RENDER_API_KEY=rnd_xxx");
  process.exit(1);
}

function api(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: "api.render.com",
      path,
      method,
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    const req = https.request(options, (res) => {
      let buf = "";
      res.on("data", (c) => (buf += c));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(buf) });
        } catch {
          resolve({ status: res.statusCode, body: buf });
        }
      });
    });
    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  console.log("Finding GitHub service connection...");

  // List services to find existing token-monitor
  const listRes = await api("GET", "/v1/services?limit=100");
  if (listRes.status !== 200) {
    console.error("Failed to list services:", listRes.status, listRes.body);
    process.exit(1);
  }

  const existing = listRes.body?.find(
    (s) => s.name === "token-monitor" || s.repo?.includes("token-monitor")
  );

  if (existing) {
    console.log(`Found existing service: ${existing.name} (${existing.id})`);
    console.log(`URL: https://${existing.serviceDetails?.url || existing.name + ".onrender.com"}`);
    console.log("\nService already exists. Triggering redeploy...");

    const redeploy = await api("POST", `/v1/services/${existing.id}/deploys`, {
      clear_cache: "false",
    });
    if (redeploy.status === 201 || redeploy.status === 200) {
      console.log("Redeploy triggered successfully!");
    } else {
      console.error("Redeploy failed:", redeploy.status, redeploy.body);
    }
    return;
  }

  // Find the GitHub owner's account
  const accountsRes = await api("GET", "/v1/accounts?limit=10");
  if (accountsRes.status !== 200) {
    console.error("Failed to list accounts:", accountsRes.status, accountsRes.body);
    process.exit(1);
  }
  const account = accountsRes.body?.[0];
  if (!account) {
    console.error("No Render account found");
    process.exit(1);
  }
  console.log(`Account: ${account.name} (${account.id})`);

  // Create the service
  console.log("\nCreating token-monitor service...");
  const createRes = await api("POST", "/v1/services", {
    type: "web",
    name: "token-monitor",
    repo: "https://github.com/Fallme/token-monitor.git",
    branch: "main",
    service_settings: {
      build_command: "",
      start_command: "",
      env: "node",
      region: "singapore",
    },
  });

  if (createRes.status === 201 || createRes.status === 200) {
    const svc = createRes.body;
    console.log(`\nService created! ID: ${svc.id}`);
    console.log(`URL: https://${svc.serviceDetails?.url || svc.name + ".onrender.com"}`);
    console.log("\nNote: Set MIMO_CONSOLE_COOKIES in Render dashboard > Environment");
  } else {
    console.error("Create failed:", createRes.status, createRes.body);
  }
}

main().catch(console.error);
