const { USER_STATUS } = require("../config/utility/user.utility.js");

const ensureAuthenticated = (req, res, next) => {
  try {
    if (req.isAuthenticated()) {
      if (
        req.user.statuses.get(req.user.currentWorkspace) !== USER_STATUS.ACTIVE
      ) {
        return req.logout(() => {
            res.status(403).json({ message: "User is inactive" });
        });
      }
      return next();
    } else {
      return res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Failed to authenticate user" });
  }
};

module.exports = ensureAuthenticated;
