const venom = require('venom-bot');
require('dotenv').config();
const mongoose = require('mongoose');
const handleOnboarding = require('./flows/onboarding');


// DB Models
const User = require('./db/user-data');
const Audit = require('./db/user-audit');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB connected');
}).catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});

// Start Venom
venom
  .create({
    session: 'dpworks-session',
    multidevice: true,
    headless: true,
    browserArgs: ['--no-sandbox']
  })
  .then((client) => {
    console.log('✅ DPWorks-AI is live');
    startBot(client);
  })
  .catch((err) => console.error('❌ Venom error:', err));

// Main Bot Logic
function startBot(client) {
  client.onMessage(async (msg) => {
    if (!msg.from || !msg.body) return;

    // Ignore groups
    if (msg.isGroupMsg) return;

    console.log(`📩 Message from ${msg.from}: ${msg.body}`);

    // Onboarding logic (we plug in next)
    await handleOnboarding(msg, client);

  });
}
