const fs = require('fs');
const path = require('path');

// Load verified village JSON
const raw = fs.readFileSync(path.join(__dirname, '../../data/bhadrak-villages-auto-odia.json'));
const villages = JSON.parse(raw); // Format: [{ en: 'Tul', or: 'ତୁଲ' }, ...]

function getExactVillage(input) {
  return villages.find(v =>
    v.en.toLowerCase() === input.toLowerCase() ||
    v.or.trim() === input.trim()
  );
}

module.exports = { getExactVillage };
