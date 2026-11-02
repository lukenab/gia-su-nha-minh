import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { spawn, type ChildProcess } from "node:child_process";
import { randomBytes } from "node:crypto";
import { createServer } from "node:net";

import { hashPassword } from "../../src/features/admin-auth/server/password.ts";
import { AdminUser } from "../../src/features/admin-auth/server/user-model.ts";

async function availablePort() {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("No local test port");
  const port = address.port;
  await new Promise<void>((resolve) => server.close(() => resolve()));
  return port;
}

async function waitUntilReady(url: string, child: ChildProcess) {
  for (let attempt = 0; attempt < 150; attempt++) {
    if (child.exitCode !== null)
      throw new Error(`Next.js exited with code ${child.exitCode}`);
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      /* The server has not opened its port yet. */
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Next.js did not become ready");
}

/** Production server on a temporary in-memory MongoDB. Needs `next build`. */
export async function startTestApp() {
  const mongo = await MongoMemoryServer.create();
  const port = await availablePort();
  const base = `http://127.0.0.1:${port}`;
  const password = randomBytes(24).toString("hex");
  const mongoUri = mongo.getUri("gsnm_admin_e2e");
  const child = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "-p", String(port)],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        MONGODB_URI: mongoUri,
        RESEND_API_KEY: "",
        GOOGLE_CLIENT_ID: "",
        GOOGLE_CLIENT_SECRET: "",
        APP_URL: base,
        ADMIN_ALLOWED_EMAILS: "tra@example.com",
        ADMIN_SESSION_SECRET: randomBytes(48).toString("hex"),
      },
      stdio: "ignore",
    },
  );
  await waitUntilReady(base, child);

  // A team member with a password account, written over a separate connection.
  const setup = await mongoose.createConnection(mongoUri).asPromise();
  await setup.model("AdminUser", AdminUser.schema).create({
    email: "tra@example.com",
    name: "Thanh Trà",
    passwordHash: await hashPassword(password),
  });
  await setup.close();

  async function login(email = "tra@example.com", secret = password) {
    const response = await fetch(`${base}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: secret }),
    });
    const cookie = response.headers.get("set-cookie")?.split(";")[0];
    return { response, cookie: cookie ?? "" };
  }

  return {
    base,
    mongoUri,
    password,
    login,
    async stop() {
      child.kill();
      await mongo.stop();
    },
  };
}
