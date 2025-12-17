# 🧬 KarmaLoop: The Career DNA Sequencer

> **"Don't just find a job. Decode your destiny."**

KarmaLoop is a gamified, hyper-personalized career intelligence platform built for the **COLLEGE STUDENTS**. It replaces boring aptitude tests with a "Neural Scan" that analyzes a student's strengths, weaknesses, opportunities, and threats (SWOT) to generate a dynamic career roadmap.

---

## 🚀 Mission
To bridge the gap between academic theory and industry reality by providing students with an interactive, data-driven "Operating System" for their careers.

---

## ⚡ Key Features

### 🔐 Module 1: The Identity Gate (Auth)
- **Frictionless Onboarding:** Uses a streamlined "Gmail + Passkey" authentication flow.
- **Privacy First:** All data is encrypted and stored locally in the browser (`localStorage`), eliminating server latency for the demo.
- **Cyberpunk UI:** High-fidelity glassmorphism design with neon accents.

### 🧠 Module 2: The Neural Scan (SWOT Engine)
- **Interactive Aptitude Test:** A 20-question mixed-mode assessment (MCQs + Sliders) that feels like a sci-fi diagnostic tool.
- **Dynamic Archetyping:** Instead of generic scores, users are assigned "Class Titles" like *System Architect*, *Faction Leader*, or *Creative Visionary*.
- **The Matrix Dashboard:** A 2x2 SWOT grid that transitions from "Locked/Blurred" to "Active/Data-Rich" upon test completion.

### 🎓 Module 3: Tactical Upgrades (Content)
- **AI-Simulated Analysis:** Actionable insights generated via a rule-based logic engine.
- **Targeted Resources:**
  - **Strengths:** Curated "Advanced Protocol" video courses.
  - **Weaknesses:** "Bug Patch" foundation tutorials.
  - **Opportunities:** Location-based "Internship Extraction" cards.
  - **Threats:** Access to "Oracle" mentors for career guidance.

### 👤 Module 4: Neural Identity (Avatar)
- **Rive Integration:** Features a fully interactive, state-machine-driven avatar (`avatar.riv`).
- **Customization:** Users can tweak their digital persona, which persists across the application.

### 💼 Module 5: Interview Simulator
- **Mock Meet Environment:** A realistic video-call interface to practice interview scenarios.
- **Tactical Briefings:** Built-in guides for the STAR method and body language hacks.
- **The Oracle:** A floating "Picture-in-Picture" chatbot that answers career queries using the user's specific SWOT data.

---

## 🛠️ Tech Stack

* **Core:** HTML5, CSS3 (Custom Variables & Animations), Vanilla JavaScript (ES6+).
* **Architecture:** Single Page Application (SPA) with state-based routing.
* **Storage:** `localStorage` (Client-side persistence).
* **Animation:** Rive Runtime (`@rive-app/canvas`), CSS Keyframes.
* **Design System:** "Xtract" - A dark-mode, neon-glass aesthetic.

---

## 🎮 Gamification Mechanics

* **XP System:** Users earn "Karma Points" for every action (Scanning, learning, practicing).
* **Badges (The Holo-Deck):**
    * 🧬 **Neural Pioneer:** Unlocked after the first scan.
    * 👁️ **Sector Analyst:** Unlocked at Level 2 (1000 XP).
    * 🎙️ **Silver Tongue:** Unlocked by entering the Interview Simulator.

---

## 📦 Installation & Setup

Since KarmaLoop is a client-side SPA, it requires no backend server setup.

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/yourusername/karmaloop.git](https://github.com/yourusername/karmaloop.git)
    ```
2.  **Navigate to Directory:**
    ```bash
    cd karmaloop
    ```
3.  **Launch:**
    Simply open `index.html` in any modern web browser (Chrome/Edge recommended).
    *Optional: Use the "Live Server" extension in VS Code for the best experience.*

---

## 📂 Project Structure

```text
karmaloop/
├── index.html       # The Master SPA Container
├── style.css        # The "Xtract" Design System
├── js/
│   └── app.js       # The Brain (Router, Logic, State Manager)
├── assets/
│   └── avatar.riv   # Rive Animation File
└── README.md        # Documentation
---
```
## 🔮 Future Roadmap

* [ ] Integration with real LinkedIn API for live job data.
* [ ] Backend migration to Firebase/Node.js for cross-device sync.
* [ ] Voice-analysis AI for the Interview Simulator.
