const dotenv = require("dotenv");
dotenv.config();

const config = {
  db_url: process.env.DB_URL,
  isProduction: process.env.NODE_ENV === "production",
  port: process.env.PORT,
  frontend_domain: process.env.FRONTEND_DOMAIN,
  jwtPrivateKey: process.env.JWT_PRIVATE_KEY,
  jwtPublicKey: process.env.JWT_PUBLIC_KEY,
  cryptoPassword: process.env.CRYPTO_KEY,
  cryptoSalt: process.env.CRYPTO_SALT,
  cryptoAlgorithm: process.env.CRYPTO_ALGO,
  logo: process.env.LOGO_URL,
  port: process.env.PORT,
  redis: {
    url: process.env.REDIS_LIVE_URL || "redis://127.0.0.1:6379",
    db: 0,
  },
  s3:{
    publicPucket: process.env.S3_BUCKET_PUBLIC,
    bucket: process.env.S3_BUCKET_PRIVATE,
    region: process.env.S3_REGION
  },
  ses:{
    userName: process.env.SES_USERNAME,
    password: process.env.SES_PASSWORD,
    host: process.env.SES_HOST
  }
};

module.exports = { config };
