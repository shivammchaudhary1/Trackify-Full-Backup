const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const logger = require("./logger.js");
const { USER_STATUS } = require("../utility/user.utility.js");

const User = require("../../models/user.model.js");

function initializePassport(app) {
  // Serialize sessions
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  // Deserialize sessions
  passport.deserializeUser(async (userId, done) => {
    try {
      if (!mongoose.isValidObjectId(userId)) {
        logger.error("Cannot deserialize user object. Malformed user ID.", {
          userId,
        });
        return done(null, false);
      }
      const user = await User.findById(userId).select("-password");
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Local Strategy
  passport.use(
    "local",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email: email.toLowerCase() });

          if (!user) {
            return done(null, false, { message: "Invalid email or password" });
          }

          const isValid = await user.authenticate(password);

          if (!isValid) {
            return done(null, false, { message: "Invalid email or password" });
          }

          if (user.statuses.get(user.currentWorkspace) !== USER_STATUS.ACTIVE) {
            return done(null, false, {
              message: "User is inactive, please contact workspace admin.",
            });
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // Initialize passport middlewares
  app.use(passport.initialize());
  app.use(passport.session());
}

module.exports = initializePassport;
