require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { startAlertCron } = require('./jobs/alertChecker');

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  startAlertCron();

  app.listen(PORT, () => {
    console.log(`[server] listening on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  });
}

start().catch((err) => {
  console.error('[server] failed to start:', err);
  process.exit(1);
});
