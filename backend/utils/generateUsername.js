const crypto = require("crypto");
const User = require("../models/User");

// Google gives us a display name, not a username — we need something
// unique and within our schema's 3-20 char constraint.
async function generateUniqueUsername(displayName) {
  let base = (displayName || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 15);

  if (base.length < 3) {
    base = "user";
  }

  let candidate = base;
  while (await User.findOne({ username: candidate })) {
    const suffix = crypto.randomInt(100, 999);
    candidate = `${base}${suffix}`.slice(0, 20);
  }

  return candidate;
}

module.exports = generateUniqueUsername;
