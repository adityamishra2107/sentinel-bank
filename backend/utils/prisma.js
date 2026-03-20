const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

let url = process.env.DATABASE_URL;

// Prisma 7 local 'prisma dev' workaround: Decode the raw TCP URL from the api_key because the client v7.4.2 has a bug with HTTP connections.
if (url && url.startsWith('prisma+postgres://')) {
  try {
    const urlObj = new URL(url);
    const apiKey = urlObj.searchParams.get('api_key');
    if (apiKey) {
      const decodedPayload = JSON.parse(Buffer.from(apiKey, 'base64').toString('utf-8'));
      if (decodedPayload.databaseUrl) {
        url = decodedPayload.databaseUrl;
        process.env.DATABASE_URL = url;
        console.log("Successfully decoded Prisma Postgres URL");
      }
    }
  } catch (e) {
    console.error("Failed to decode Prisma dev URL fallback");
  }
}

const pool = new Pool({ connectionString: url });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
