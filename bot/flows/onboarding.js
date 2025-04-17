const User = require('../db/user-data');
const Audit = require('../db/user-audit');

// Simple session tracker (can later move to Redis)
const sessions = {};

async function handleOnboarding(msg, client) {
  const phone = msg.from;
  const text = msg.body.trim();
  const lower = text.toLowerCase();

  if (!sessions[phone]) sessions[phone] = { step: 0, data: {} };
  const session = sessions[phone];

  const reply = (txt) => client.sendText(phone, txt);

  switch (session.step) {
    case 0:
      session.step++;
      await reply('🙏 ଜୟଗୁରୁ! Please tell me your name 👤\n\nଦୟାକରି ନିଜ ନାମ କୁହନ୍ତୁ।');
      break;

    case 1:
      session.data.name = text;
      session.step++;
      await reply(`📍 What is your 6-digit PIN code?\n\nଦୟାକରି ନିଜ ପିନ କୋଡ୍ କୁହନ୍ତୁ।`);
      break;

    case 2:
      if (!/^\d{6}$/.test(text)) {
        await reply('❌ Invalid PIN. Enter 6 digits.\n\nପୁଣିଥରେ ଚେଷ୍ଟା କରନ୍ତୁ (6 ଅଙ୍କ)।');
        return;
      }
      session.data.pin = text;
      session.step++;
      await reply(`🏡 What is your village name?\n\nଦୟାକରି ଗ୍ରାମ ନାମ କୁହନ୍ତୁ।`);
      break;

    case 3:
      session.data.village = text;
      session.step++;
      await reply(`🎂 Your date of birth (DD-MM-YYYY)?\n\nଜନ୍ମ ତାରିଖ କହନ୍ତୁ (DD-MM-YYYY)।`);
      break;

    case 4:
      if (!/^\d{2}-\d{2}-\d{4}$/.test(text)) {
        await reply('❌ Format error. Use DD-MM-YYYY.\n\nଠିକ ଭାବରେ ଦିଅନ୍ତୁ (e.g., 15-08-1990)');
        return;
      }
      session.data.birthday = text;
      session.step++;
      await reply(`🔮 Your zodiac sign (English or Odia)?\n\nରାଶି ନାମ କହନ୍ତୁ (ଓଡ଼ିଆ/English)`);
      break;

    case 5:
      session.data.zodiac = text;
      session.step++;
      await reply(`👤 What is your role?\n\nRole କହନ୍ତୁ:\n• Volunteer\n• JK\n• ADJ\n• Ritwick\n• Block Coordinator\n• District Admin`);
      break;

    case 6:
      session.data.role = text;
      session.step++;
      await confirmAndSave(client, phone, session.data);
      delete sessions[phone]; // Cleanup
      break;
  }

  // Audit
  await Audit.create({
    phone,
    message: text,
    type: 'inbound',
    context: 'onboarding'
  });
}

async function confirmAndSave(client, phone, data) {
  const user = await User.findOne({ phone });
  const msg = `🧾 Please review your details:\n\n👤 Name: ${data.name}\n📍 PIN: ${data.pin}\n🏡 Village: ${data.village}\n🎂 Birthday: ${data.birthday}\n🔮 Zodiac: ${data.zodiac}\n🎖️ Role: ${data.role}\n\n👉 Type "confirm" to save or "edit" to restart.`;

  if (user) {
    await client.sendText(phone, '🧾 You are already registered. Type "my info" to view your profile.');
    return;
  }

  await client.sendText(phone, msg);

  // Listen for confirmation
  const confirmListener = async (msg) => {
    if (msg.from !== phone) return;
    const input = msg.body.trim().toLowerCase();

    if (input === 'confirm') {
      await User.create({ phone, ...data });
      await client.sendText(phone, '✅ Saved! You are now part of DPWorks-AI.\n\nStay connected. Jayguru 🙏');
    } else {
      await client.sendText(phone, '🔄 Restarting onboarding...\nType "Hi" again to begin.');
    }

    client.removeListener('onMessage', confirmListener);
  };

  client.onMessage(confirmListener);
}

module.exports = handleOnboarding;
