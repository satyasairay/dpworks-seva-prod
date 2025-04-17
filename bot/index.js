const venom = require('venom-bot');
const handleOnboarding = require('./flows/onboarding');

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./db/user-data');
const Audit = require('./db/user-audit');

const sessions = {}; // Shared session store
const mongoUrl = process.env.MONGO_URL;

if (!mongoUrl) {
  console.error("❌ MONGO_URL is missing in .env file!");
  process.exit(1);
}

console.log("🔍 Connecting to MongoDB:", mongoUrl);

mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'dpworks-db',
}).then(() => {
  console.log('✅ MongoDB connected');
}).catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});

venom
  .create({
    session: 'dpworks-session',
    multidevice: true,
    headless: false,
    browserArgs: ['--no-sandbox']
  })
  .then((client) => {
    console.log('✅ DPWorks-AI is live');
    startBot(client);
  })
  .catch((err) => console.error('❌ Venom error:', err));

function startBot(client) {
  client.onMessage(async (msg) => {
    if (!msg.from || !msg.body) return;
    if (msg.isGroupMsg) return;
    if (!msg.from.endsWith('@c.us')) return;

    console.log(`📩 Message from ${msg.from}: ${msg.body}`);
    const input = msg.body.trim().toLowerCase();

    if (input === 'reset') {
      delete sessions[msg.from];
      await client.sendText(msg.from, '🔄 Onboarding reset. Type "Hi" to start again.');
      return;
    }

    if (input === 'my info') {
      const user = await User.findOne({ phone: msg.from });
      if (!user) {
        await client.sendText(msg.from, '😕 You are not registered yet. Please type "Hi" to begin onboarding.');
        return;
      }

      const msgText = `🧾 Your profile:\n\n👤 Name: ${user.name || 'N/A'}\n📍 PIN: ${user.pin || 'N/A'}\n🏡 Village: ${user.village || ''} (${user.villageOdia || ''})\n🎂 DOB: ${user.birthday || 'N/A'}\n🔮 Zodiac: ${user.zodiac || 'N/A'}\n🎖️ Role: ${user.role || 'N/A'}\n🧑 Gender: ${user.gender || 'N/A'}`;
      await client.sendText(msg.from, msgText);
      return;
    }

    try {
      await handleOnboarding(msg, client, sessions);
    } catch (err) {
      console.error('💥 Error in onboarding flow:', err.message);
      await client.sendText(msg.from, '⚠️ Something went wrong. Please type "Hi" to try again.');
    }
  });
}
