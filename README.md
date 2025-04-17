## DPWorks-AI 🕉️  
> *A WhatsApp-first AI assistant for DPWorks Seva.*

---

### 🙏 Why I Built This

This project started as a personal mission — to support the DPWorks movement using the tools I had: code, AI, and heart.

**DPWorks-AI** is not a chatbot. It’s a living assistant that speaks with warmth, understands Odia, and helps our field volunteers carry forward Thakur's message through seva.

Everything is being built from scratch — no templates, no fluff — just purpose and precision.

---

### 🛠️ Stack I Used

- `Node.js` + `Venom-bot` for WhatsApp automation
- `MongoDB` (via Mongoose) for user records
- `OpenAI GPT-3.5` for daily horoscope generation (bilingual)
- Local JSON files for village name mapping
- Clean modular structure for easy maintenance and Twilio migration

---

### ✅ Chapter 0 – Onboarding (Done)

What’s working now:

- Users can start by just saying “Joyguru”
- The bot asks for name, PIN, village, birthday
- Zodiac sign is detected automatically from date
- Odia + English prompts throughout (no toggles, no friction)
- Role selection (Karmi, Ritwick, Admin, etc.)
- Data is stored cleanly in MongoDB
- Input validation modules already built (PIN, village, zodiac)

This chapter is fully working, tested, and pushed.

---

### 🔮 Chapter 1 – Daily Menu & Horoscope (WIP)

What I’m building now:

- 6–9 AM divine morning greeting to each user
- Includes emoji + zodiac prediction (AI-generated)
- Horoscope is generated every day at 5 AM using GPT-3.5
- I personally approve predictions using `confirm horoscope`
- Only after I confirm, it becomes visible to users
- Daily menu will soon support commands: 1 (My Task), 2 (Visit), etc.

---

### 📂 Project Structure

```
dpworks-ai/
├── bot/
│   ├── db/ → Mongo schemas
│   ├── flows/ → Main message handlers
│   ├── validators/ → Input validators (PIN, zodiac, etc.)
│   └── index.js → Venom bot entry
├── data/ → Village JSON used for mapping
├── .env.example
├── .gitignore + .gitattributes
```

---

### 🧪 Run It Locally (For Devs Like Me)

```bash
git clone https://github.com/satyasairay/dpworks-seva-prod.git
cd dpworks-seva-prod
npm install
cp .env.example .env  # then add your MONGO_URL + OPENAI key
node index.js
```

---

### 🛤️ Roadmap

- [x] Chapter 0 – Onboarding (fully done)
- [x] Validation + village correction module
- [x] Daily AI horoscope fetch (GPT-3.5)
- [x] Manual approval flow (no fake astrology)
- [ ] Chapter 1 – Divine Menu + command triggers (in progress)
- [ ] Visit report submission
- [ ] Emergency escalation + keyword detection
- [ ] End-of-day report generation
- [ ] Twilio migration (whenever approved)

---

### 🙇 Who Made This

I’m **Satya**, a volunteer district admin from Bhadrak. I'm building this not for money or fame, but because I believe Thakur’s seva deserves the best of modern tech — made with love, tested in the field, and free from ego.

I don’t represent an organization. I’m just one person trying to do it right.

🛠️ Built with code. 🧠 Guided by AI. 💖 Rooted in faith.

