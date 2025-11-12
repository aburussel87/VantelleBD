// hash-verify-async.js
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10; // 10 is a good default (increase for more security at cost of CPU)

async function hashPassword(plainPassword) {
  const hash = await bcrypt.hash(plainPassword, SALT_ROUNDS);
  return hash;
}

async function verifyPassword(plainPassword, hash) {
  const match = await bcrypt.compare(plainPassword, hash);
  return match; // true or false
}

// Example usage
async function demo() {
  const plain = "123";
  const hash = await hashPassword(plain);
  console.log("Hash:", hash);

  const ok = await verifyPassword(plain, hash);
  console.log("Password matches?", ok);
}

demo().catch(console.error);
