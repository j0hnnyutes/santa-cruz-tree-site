/**
 * Emergency Admin Password Reset Script
 *
 * Run this from your project root if you're locked out of the admin panel:
 *   node scripts/reset-password.mjs
 *
 * This script hashes your new password and writes it directly to the database,
 * bypassing the web interface entirely.
 */

import { createInterface } from "readline";
import { createRequire } from "module";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

// Load bcryptjs
let bcrypt;
try {
  bcrypt = require("bcryptjs");
} catch {
  console.error("❌ bcryptjs not found. Run: npm install");
  process.exit(1);
}

// Load better-sqlite3 or fall back to Database URL parsing
let db;
try {
  // Try to find the DB path from .env / .env.local
  const envFiles = [".env.local", ".env"];
  let dbPath = null;

  for (const envFile of envFiles) {
    const envPath = resolve(projectRoot, envFile);
    if (existsSync(envPath)) {
      const { readFileSync } = await import("fs");
      const content = readFileSync(envPath, "utf8");
      const match = content.match(/DATABASE_URL\s*=\s*["']?file:(.+?)["']?\s*$/m);
      if (match) {
        dbPath = resolve(projectRoot, match[1].trim());
        break;
      }
    }
  }

  if (!dbPath) {
    dbPath = resolve(projectRoot, "prisma/dev.db");
  }

  if (!existsSync(dbPath)) {
    console.error(`❌ Database not found at: ${dbPath}`);
    console.error("   Make sure you've run the dev server at least once.");
    process.exit(1);
  }

  // Use node:sqlite (Node 22+) or better-sqlite3
  try {
    const { DatabaseSync } = await import("node:sqlite");
    db = new DatabaseSync(dbPath);
    db._useBetterSqlite = false;
  } catch {
    try {
      const Database = require("better-sqlite3");
      db = new Database(dbPath);
      db._useBetterSqlite = true;
    } catch {
      // Fall back to manual file path reporting
      db = null;
      console.log(`📁 Database path: ${dbPath}`);
    }
  }

  if (db) {
    console.log(`✅ Connected to database`);
  }
} catch (err) {
  console.error("❌ Error connecting to database:", err.message);
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
    const oldRawMode = stdin.isRaw;

    // Try to hide input
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
      // Non-TTY (piped input): just read normally
      resolve(question(prompt));
    }
  });
}

async function main() {
  console.log("\n🔐 Santa Cruz Tree Pros — Admin Password Reset\n");
  console.log("This will update the admin password in the database.\n");

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

  if (db) {
    try {
      const now = new Date().toISOString();

      if (db._useBetterSqlite) {
        // better-sqlite3
        db.prepare(`
          INSERT INTO AdminConfig (key, value, updatedAt)
          VALUES ('password_hash', ?, ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = excluded.updatedAt
        `).run(hash, now);
      } else {
        // node:sqlite
        db.exec(`
          INSERT INTO AdminConfig (key, value, updatedAt)
          VALUES ('password_hash', '${hash.replace(/'/g, "''")}', '${now}')
          ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = excluded.updatedAt
        `);
      }

      console.log("✅ Password updated successfully in database!");
      console.log("\nYou can now log in at /admin with your new password.\n");
    } catch (err) {
      console.error("❌ Database update failed:", err.message);
      console.log("\n📋 Manual fallback — add this to your .env.local:");
      console.log(`ADMIN_PASSWORD_HASH="${hash}"\n`);
    }
  } else {
    // No DB access — output hash for manual entry
    console.log("\n✅ Password hashed. Since direct DB access isn't available,");
    console.log("add this to your .env.local (or Vercel environment variables):");
    console.log(`\nADMIN_PASSWORD_HASH="${hash}"\n`);
    console.log("Then redeploy or restart your dev server.\n");
  }

  rl.close();
}

main().catch((err) => {
  console.error("❌ Unexpected error:", err);
  rl.close();
  process.exit(1);
});
