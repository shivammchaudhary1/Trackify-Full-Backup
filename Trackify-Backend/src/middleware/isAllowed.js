const { getEnforcer } = require("../utility/enforcer.js");
const { USER_ROLES } = require("../permissions/role.js");

function isAllowed(req, res, next) {
  getEnforcer().then((enforcer) => {
    const roles = req.user
      ? req.user.roles.get(req.user.currentWorkspace)
      : [USER_ROLES.guest];

    const path = `${req.baseUrl}${req.route.path}`;
    const method = req.method.toLowerCase();

    Promise.all(roles.map((role) => enforcer.enforce(role, path, method)))
      .then((results) => {
        if (results.includes(true)) {
          next();
        } else {
          return req.logout(() => {
            res.status(403).json({ message: "Permission denied" });
          });
        }
      })
      .catch((err) => {
        console.log("Enforce error:", err);
        res.status(500).json({ message: "Internal server error" });
      });
  });
}
module.exports = { isAllowed };
