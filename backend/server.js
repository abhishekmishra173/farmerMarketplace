require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

(async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    const port = process.env.PORT || 5500;
    app.listen(port, () => console.log(`🚀 Server running on http://localhost:5500`));
  } catch (err) {
    console.error('Startup error:', err);
    process.exit(1);
  }
})();
