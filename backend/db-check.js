const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

let url = process.env.DATABASE_URL;
if (url && url.startsWith('prisma+postgres://')) {
  try {
    const urlObj = new URL(url);
    const apiKey = urlObj.searchParams.get('api_key');
    if (apiKey) {
      const decodedPayload = JSON.parse(Buffer.from(apiKey, 'base64').toString('utf-8'));
      if (decodedPayload.databaseUrl) {
        url = decodedPayload.databaseUrl;
      }
    }
  } catch (e) {
    console.error("Failed to decode URL");
  }
}

console.log("Testing connection to:", url);
const pool = new Pool({ connectionString: url });

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error("Connection failed!", err);
  } else {
    console.log("Connection successful! DB Time:", res.rows[0].now);
  }
  pool.end();
  process.exit(err ? 1 : 0);
});
