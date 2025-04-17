const User = require('../db/user-data');
const Audit = require('../db/user-audit');
const { isBhadrakPIN } = require('../validators/pin-validator');
const { getExactVillage } = require('../validators/village-corrector');
const { normalizeZodiac, zodiacList } = require('../validators/zodiac-helper');
const { isValidRole, getFormattedRole } = require('../validators/role-map');

function isStarterMessage(text) {
  const starters = ['hi', 'hello', 'joyguru', 'jayaguru', 'jayguru', 'ଜୟଗୁରୁ'];
  return starters.includes(text.trim().toLowerCase());
}

async function handleOnboarding(msg, client, sessions) {
  const phone = msg.from;
  const text = msg.body.trim();
  const input = text.toLowerCase();

  // 📌 If confirming saved profile
  if (input === 'confirm' && sessions[phone]?.step === 'confirm') {
    const data = sessions[phone].data;
    const exists = await User.findOne({ phone });
    if (exists) {
      await client.sendText(phone, '🧾 You are already registered. Type "my info" to view your profile.');
      sessions[phone] = { complete: true };
      return;
    }

    try {
      const saved = await User.create({
        phone,
        name: data.name,
        pin: data.pin,
        village: data.village,
        villageOdia: data.villageOdia,
        birthday: data.birthday,
        zodiac: data.zodiac,
        role: data.role,
        gender: data.gender || 'Not Provided',
        onboardingStatus: 'complete'
      });

      console.log('✅ MongoDB SAVE SUCCESS:', saved);
      sessions[phone] = { complete: true };
      await client.sendText(phone, `✅ Welcome, ${data.name.split(' ')[0]}! You are now part of DPWorks.\nJoyguru 🙏`);
    } catch (err) {
      console.error(`❌ Failed to save user ${phone}:`, err.message);
      await client.sendText(phone, '❌ Something went wrong while saving. Please type "Hi" to try again.');
      delete sessions[phone];
    }
    return;
  }

  if (input === 'edit') {
    delete sessions[phone];
    await client.sendText(phone, '🔁 Restarting... Type "Hi" to begin again.');
    return;
  }

  if (sessions[phone]?.complete) {
    await client.sendText(phone, '🙏 You are already registered. Type "my info" to view your profile.');
    return;
  }

  if (!sessions[phone]) {
    if (!isStarterMessage(text)) {
      await client.sendText(phone, '🙏 Please type *"Joyguru"* to begin onboarding.\n\nଦୟାକରି *Joyguru ବା ଜୟଗୁରୁ* ଟାଇପ୍ କରନ୍ତୁ।');
      return;
    }
    sessions[phone] = { step: 0, data: {} };
  }

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
      await reply('📍 Enter your 6-digit PIN code:\n\nଦୟାକରି ନିଜ ପିନ କୋଡ୍ କୁହନ୍ତୁ।');
      break;

    case 2:
      if (!/^\d{6}$/.test(text) || !isBhadrakPIN(text)) {
        await reply('❌ Invalid or unsupported PIN. Only Bhadrak PINs allowed.\n\nଭଦ୍ରକ ଅଞ୍ଚଳର 6 ଅଙ୍କର PIN କୋଡ୍ ଦିଅନ୍ତୁ।');
        return;
      }
      session.data.pin = text;
      session.step++;
      await reply('🏡 What is your village name?\n\nଦୟାକରି ଗ୍ରାମ ନାମ କୁହନ୍ତୁ।');
      break;

    case 3:
      const villageMatch = getExactVillage(text);
      session.data.villageAttempts = (session.data.villageAttempts || 0) + 1;

      if (!villageMatch && session.data.villageAttempts < 3) {
        await reply('❌ Village not recognized. Please try again.\n\nଏହି ଗ୍ରାମ ନାମ ମିଳିଲା ନାହିଁ। ଦୟାକରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।');
        return;
      }

      if (!villageMatch && session.data.villageAttempts >= 3) {
        session.step++;
        session.data.village = text;
        session.data.villageOdia = '⛔ Not Matched';
        await reply(`⚠️ Are you sure the village name "${text}" is correct?\n\nIf yes, please continue with your gender (Male/Female/Other).`);
        return;
      }

      session.data.village = villageMatch.en;
      session.data.villageOdia = villageMatch.or;
      session.step++;
      await reply('🧑 What is your gender?\n\nType: Male, Female or Other.\n\nନିଜ Gender କୁହନ୍ତୁ: Male / Female / Other');
      break;

    case 4:
      const gender = input;
      if (!['male', 'female', 'other'].includes(gender)) {
        await reply('❌ Please type "Male", "Female", or "Other".\n\nଦୟାକରି "Male", "Female" ବା "Other" ଟାଇପ୍ କରନ୍ତୁ।');
        return;
      }
      session.data.gender = gender[0].toUpperCase() + gender.slice(1).toLowerCase();
      session.step++;
      await reply('🎂 Your date of birth (DD-MM-YYYY)?\n\nଜନ୍ମ ତାରିଖ କହନ୍ତୁ (DD-MM-YYYY)।');
      break;

    case 5:
      if (!/^\d{2}-\d{2}-\d{4}$/.test(text)) {
        await reply('❌ Format error. Use DD-MM-YYYY.\nଉଦାହରଣ: 15-08-1990');
        return;
      }
      session.data.birthday = text;
      session.step++;
      await reply('🔮 Your zodiac sign (English or Odia)?\n\nରାଶି ନାମ କହନ୍ତୁ (ଓଡ଼ିଆ/English)');
      break;

    case 6:
      const z = normalizeZodiac(input);
      if (!z) {
        await reply(`❌ Zodiac not recognized.\n\nValid options:\n${zodiacList()}`);
        return;
      }
      session.data.zodiac = `${z.or} (${z.en})`;
      session.step++;
      await reply('🎖️ What is your role?\nOptions: Field Worker, JK, ADJ, Ritwick, Block Coordinator, District Admin');
      break;

    case 7:
      if (!isValidRole(input)) {
        await reply('❌ Invalid role. Choose from:\nField Worker, JK, ADJ, Ritwick, Block Coordinator, District Admin');
        return;
      }
      session.data.role = getFormattedRole(text);
      session.step = 'confirm';

      const data = session.data;
      const summary = `🧾 Please review your details:\n\n👤 Name: ${data.name}\n📍 PIN: ${data.pin}\n🏡 Village: ${data.village} (${data.villageOdia})\n🎂 DOB: ${data.birthday}\n🔮 Zodiac: ${data.zodiac}\n🎖️ Role: ${data.role}\n🧑 Gender: ${data.gender || 'Not Provided'}\n\n👉 Type "confirm" to save or "edit" to restart.`;
      await client.sendText(phone, summary);
      break;
  }

  await Audit.create({
    phone,
    message: text,
    type: 'inbound',
    context: 'onboarding'
  });
}

module.exports = handleOnboarding;
