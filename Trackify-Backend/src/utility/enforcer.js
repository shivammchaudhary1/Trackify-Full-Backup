const path = require("path");
const { newEnforcer } = require("casbin");

let cachedEnforcer = null;

async function getEnforcer() {
  if (cachedEnforcer) return cachedEnforcer;

  const enforcer = await newEnforcer(path.join(path.resolve(), "model.conf"));

  cachedEnforcer = enforcer;
  return enforcer;
}
module.exports = { getEnforcer };
