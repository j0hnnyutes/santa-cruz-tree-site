import bcrypt from "bcryptjs";

const password = process.argv.slice(2).join(" ");

if (!password) {
  console.log('Usage:\n  node scripts/hashAdminPassword.mjs "YourPasswordHere"\n');
  process.exit(1);
}

const saltRounds = 12;

const hash = await bcrypt.hash(password, saltRounds);

console.log("\nADMIN_PASSWORD_HASH (copy into .env.local):\n");
console.log(`ADMIN_PASSWORD_HASH="${hash}"\n`);