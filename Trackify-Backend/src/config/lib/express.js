const cookieParser = require("cookie-parser");
const cors = require("cors");
const compression = require("compression");
const express = require("express");
const { routes } = require("../../routes/main.routes.js");
const helmet = require("helmet");
const { allowedOrigins } = require("../utility/utility.js");
const initializePassport = require("./passport.js");
const session = require("express-session");
const connectMongoDBSession = require('connect-mongodb-session');
const { config } = require("../env/default.js");
const {
  initializePermissions,
} = require("../../utility/initializePermission.js");

// Six months expiration period specified in seconds
const SIX_MONTHS = 15778476;

function initSecurityHeaders(app) {
  // app.use(helmet());
  app.use(compression());
  app.use(helmet.xssFilter());
  app.use(helmet.noSniff());
  app.use(helmet.ieNoOpen());
  app.use(
    helmet.hsts({
      maxAge: SIX_MONTHS,
      includeSubDomains: true,
      force: true,
    })
  );

  // app.use(
  //   // helmet.contentSecurityPolicy({
  //   //   directives: {
  //   //     // This allows files only from your own domain
  //   //     defaultSrc: ["'self'"],
  //   //     styleSrc: ["'self'", "https:"], // Styles can come from your own domain and any HTTPS source
  //   //     scriptSrc: ["'self'", "https:"], // Scripts can come from your own domain and any HTTPS source
  //   //   },
  //   // })
  // );
  // https://expressjs.com/en/advanced/best-practice-security.html
  //Disable X-Powered-By header from being included in the HTTP response.
  app.disable("x-powered-by");
}

function initMiddleware(app) {
  app.use(
    express.json({
      limit: "5mb",
    })
  );
  app.use(express.urlencoded({ extended: false }));
  app.use(
    cors({
      origin: allowedOrigins(),
      credentials: true,
    })
  );
  app.use(cookieParser());
}

function initSession(app) {
  const MongoDBStore = connectMongoDBSession(session);

  app.use(
    session({
      // use a strong secret in production
      secret: config.jwtPrivateKey, 
      saveUninitialized: false,
      resave: true,
      rolling: true,
      cookie: {
        httpOnly: true,
        // true in production (requires HTTPS)
        secure: config.isProduction, 
        sameSite: config.isProduction ? "none" : "lax",
        // 1 day
        maxAge: 1000 * 60 * 60 * 24, 
      },
      store: new MongoDBStore({
        collectionName: config.sessionCollectionName,
        uri: config.db_url,
      }),
    })
  );
}

async function init() {
  const app = express();
  initSecurityHeaders(app);
  initMiddleware(app);
  initSession(app);
  initializePassport(app);
  await initializePermissions();
  await routes(app);
  return app;
}

module.exports = { init };
