const zodiacList = [
    { en: 'aries', or: 'ମେଷ' },
    { en: 'taurus', or: 'ବୃଷ' },
    { en: 'gemini', or: 'ମିଥୁନ' },
    { en: 'cancer', or: 'କର୍କଟ' },
    { en: 'leo', or: 'ସିଂହ' },
    { en: 'virgo', or: 'କନ୍ୟା' },
    { en: 'libra', or: 'ତୁଳା' },
    { en: 'scorpio', or: 'ବୃଶ୍ଚିକ' },
    { en: 'sagittarius', or: 'ଧନୁ' },
    { en: 'capricorn', or: 'ମକର' },
    { en: 'aquarius', or: 'କୁମ୍ଭ' },
    { en: 'pisces', or: 'ମୀନ' }
  ];
  
  function normalizeZodiac(input) {
    const cleaned = input.trim().toLowerCase();
    return zodiacList.find(z =>
      z.en.toLowerCase() === cleaned ||              // English exact match
      z.or.trim().toLowerCase() === cleaned ||       // Odia exact match
      z.or.toLowerCase().includes(cleaned) ||        // Odia contains user text
      cleaned.includes(z.en.toLowerCase())           // English contains
    );
  }
  
  function zodiacListString() {
    return zodiacList.map(z => `${z.or} (${z.en})`).join(', ');
  }
  
  module.exports = { normalizeZodiac, zodiacList: zodiacListString };
  