# Sarthi — AI-Enabled Agri Logistics Platform

## Sarthi Setu web app (Vite + React)

This repository includes a **Vite** front-end for **Sarthi Setu** (farmer, buyer, logistics partner, cold storage). Active product work for the V2 redesign lives on branch **`v2-redesign`**; **`main`** stays the default production-safe line until you merge.

- **Run locally:** `npm install` then `npm run dev` (default dev server port **3000**).
- **Production build:** `npm run build`.
- **Routes:** `/` landing, `/onboarding` seven-step sign-up (mock OTP **`123456`** in development), `/app` role dashboards (requires a completed session in `localStorage` under `saarthi.v2.session`).
- **Environment:** copy `.env.example` to `.env`. Set `GEMINI_API_KEY` for AI chat; `VITE_GOOGLE_MAPS_API_KEY` enables **embedded Google Maps** (Directions API for driving routes, draggable A/B pins, “Open in Google Maps” for turn-by-turn navigation). In Google Cloud, enable **Maps JavaScript API** and **Directions API** for that key. **Without a key**, booking and onboarding maps use **OpenStreetMap tiles** and the public **OSRM** routing demo (free, rate-limited—fine for demos). `VITE_RAZORPAY_KEY_ID` is reserved for a future real checkout path (payments use a mock flow today).
- **Vercel:** deployments are driven by **GitHub Actions** (see **`docs/VERCEL.md`**). After you add the three repository secrets there, every **`git push`** to **any branch** deploys to Vercel (**`main`** → production, other branches → preview). Automatic deploys from the Vercel Git integration are **off** in `vercel.json` so previews are not skipped and you do not depend on opening the wrong URL. Connect the Vercel project to **`godhulivyas-build/Sarthi`** (same spelling as `git remote`), not a differently named repo.

---

**Sarthi** is an AI-augmented logistics solution designed to simplify farm-to-market transport for farmers and traders.  
By combining user research insights with digital workflows, Sarthi improves delivery efficiency, transparency, and trust across agricultural supply chains.

---

##  Product Vision

Farmers and small traders often struggle with:
- Opaque pricing
- Delivery delays
- Lack of real-time tracking
- Poor communication with transport providers

**Sarthi’s goal** is to address these challenges by providing:
✔ Easy onboarding  
✔ Route and delivery tracking  
✔ Timely status updates  
✔ Metrics that help reduce average delivery delays

---

##  Key Features

- **User interviewing & research insights**
- **Order creation and assignment**
- **Real-time delivery tracking**
- **AI-assisted ETA and delay prediction**
- **Performance dashboards**

---

## 📁 Project Structure
Sarthi/
├── data/ # Dataset files
├── notebooks/ # EDA & prototype notebooks
├── src/ # Application source code
│ ├── models/ # Prediction & ML logic
│ ├── api/ # Backend endpoints
│ └── utils/ # Utilities
├── screenshots/ # UI & working screenshots
├── video/ # Demo video
├── app.py # Main application script
├── requirements.txt # Dependencies
└── README.md



---

## Live Demo / Video Walkthrough

🔗 **Video demonstration:**  
*((https://drive.google.com/file/d/1gxPvkx-5U-ZHlvnnQy6I0EJWB_3NLI3G/view?usp=sharing))*  


---

# 📄 Product Requirements Document (PRD)

```markdown
The complete Product Requirements Document (PRD) for **Sarthi** was created to define:

- Problem statement and user personas
- User pain points and insights from 30+ interviews
- Functional and non-functional requirements
- MVP scope and feature prioritization
- Success metrics and validation plan

---

🔗 PRD Link:  
https://docs.google.com/document/d/1WwEHQTjtLa1aWeLYSw8NfWCBd-5YmnCybCOSIZPMuSg/edit?usp=sharing


🛠 Setup & Installation
1) Clone the repository
git clone https://github.com/godhulivyas-build/Sarthi.git
cd Sarthi

2) Create & activate a virtual environment
python3 -m venv venv


Linux / macOS

source venv/bin/activate


Windows

venv\Scripts\activate

3) Install dependencies
pip install -r requirements.txt

4) Run the application
python app.py


The application will be available at:

http://localhost:5000





