/**
 * Emergency Admin Password Reset Script
 *
 * Run this from your project root if you're locked out of the admin panel:
 *   node scripts/reset-password.mjs
 *
 * This script hashes your new password and writes it directly to Neon PostgreSQL
 * via Prisma, bypassing the web interface entirely.
 *
 * Requirements: Run from the project root where .env exists.
 */

import { createInterface } from "readline";
import { createRequire } from "module";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { readFileSync, existsSync } from "fs";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

// Load environment variables from .env
function loadEnv() {
  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    const path = resolve(projectRoot, file);
    if (existsSync(path)) {
      const content = readFileSync(path, "utf8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        // Strip surrounding quotes
        if ((val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

// Load bcryptjs
let bcrypt;
try {
  bcrypt = require("bcryptjs");
} catch {
  console.error("❌ bcryptjs not found. Run: npm install");
  process.exit(1);
}

const rl = createInterface({ input: process.stdin, output: process.stdout });

function question(prompt) {
  return new Promise((resolve) => rl.question(prompt, resolve));
}

function hiddenQuestion(prompt) {
  return new Promise((resolve) => {
    process.stdout.write(prompt);
    const stdin = process.stdin;

    let input = "";
    if (stdin.isTTY) {
      stdin.setRawMode(true);
      stdin.resume();
      stdin.setEncoding("utf8");

      const onData = (char) => {
        if (char === "\n" || char === "\r" || char === "\u0004") {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.removeListener("data", onData);
          process.stdout.write("\n");
          resolve(input);
        } else if (char === "\u0003") {
          process.stdout.write("\n");
          process.exit(0);
        } else if (char === "\u007f") {
          if (input.length > 0) {
            input = input.slice(0, -1);
            process.stdout.write("\b \b");
          }
        } else {
          input += char;
          process.stdout.write("*");
        }
      };

      stdin.on("data", onData);
    } else {
      resolve(question(prompt));
    }
  });
}

async function connectPrisma() {
  try {
    // Dynamically import Prisma client
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    await prisma.$connect();
    return prisma;
  } catch (e) {
    return null;
  }
}

async function main() {
  console.log("\n🔐 Santa Cruz Tree Pros — Admin Password Reset\n");
  console.log("This will update the admin password in Neon PostgreSQL.\n");

  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL not found in .env");
    console.error("   Make sure you have a .env file with DATABASE_URL set.");
    rl.close();
    process.exit(1);
  }

  const newPassword = await hiddenQuestion("New password: ");

  if (newPassword.length < 10) {
    console.error("\n❌ Password must be at least 10 characters.");
    rl.close();
    process.exit(1);
  }

  const confirm = await hiddenQuestion("Confirm password: ");

  if (newPassword !== confirm) {
    console.error("\n❌ Passwords do not match.");
    rl.close();
    process.exit(1);
  }

  console.log("\n⏳ Hashing password…");
  const hash = await bcrypt.hash(newPassword, 12);

  console.log("⏳ Connecting to database…");
  const prisma = await connectPrisma();

  if (prisma) {
    try {
      const now = new Date().toISOString();
      await prisma.$executeRawUnsafe(
        `INSERT INTO "AdminConfig" (key, value, "updatedAt")
         VALUES ('password_hash', $1, $2)
         ON CONFLICT(key) DO UPDATE SET value = EXCLUDED.value, "updatedAt" = EXCLUDED."updatedAt"`,
        hash,
        now
      );

      await prisma.$disconnect();

      console.log("\n✅ Password updated successfully in Neon database!");
      console.log("   You can now log in at /admin with your new password.");
      console.log("   No redeployment needed — the new password takes effect immediately.\n");
    } catch (err) {
      console.error("\n❌ Database update failed:", err.message);
      await prisma.$disconnect();
      printManualFallback(hash);
    }
  } else {
    console.error("\n⚠️  Could not connect to Prisma/database.");
    printManualFallback(hash);
  }

  rl.close();
}

function printManualFallback(hash) {
  console.log("\n📋 Manual fallback — set this in Vercel environment variables:");
  console.log("   Variable name:  ADMIN_PASSWORD_HASH");
  console.log(`   Value:          ${hash}`);
  console.log("\n   Then trigger a new deployment in Vercel.\n");
}

main().catch((err) => {
  console.error("❌ Unexpected error:", err);
  rl.close();
  process.exit(1);
});
