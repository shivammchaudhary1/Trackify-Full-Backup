const { getEnforcer } = require("./enforcer.js");
const { permissions } = require("../permissions/permission.js");

/**
 * Initialize Casbin permissions from ACL-style config.
 * Clears existing policies, loads fresh from permissions.js
 */
async function initializePermissions() {
  const enforcer = await getEnforcer();

  // Clear existing policies (if you want to reset them each time)
  await enforcer.clearPolicy();

  // Load ACL-style permissions config into Casbin policy
  for (const group of permissions) {
    for (const role of group.roles) {
      for (const { resource, actions } of group.allows) {
        for (const action of actions) {
          await enforcer.addPolicy(role, resource, action);
        }
      }
    }
  }

  // Persist in-memory policies to adapter (file, DB etc.)
  await enforcer.savePolicy();
}

module.exports = { initializePermissions };
