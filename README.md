# 🌾 AgriSmart AI (कृषि-स्मार्ट)
### Precision Agriculture, APMC Mandi Market Intelligence & Groq LLM Portal

[![React 18](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite 5](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Groq Cloud AI](https://img.shields.io/badge/Groq_AI-qwen%2Fqwen3.8--27b-F05A28?logo=fastapi&logoColor=white)](https://groq.com/)
[![Indian APMC Mandis](https://img.shields.io/badge/APMC_e--NAM-Connected-FF9933?logo=indiatv&logoColor=white)](https://enam.gov.in/)
[![UI Architecture](https://img.shields.io/badge/Design-Clean_White_%2B_Accents-059669)](#design-system--aesthetics)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📌 Executive Overview

**AgriSmart AI** is a precision agriculture web portal and smart farming SCADA workstation tailored specifically for the Indian agricultural ecosystem as well as global precision farm operations. Built to empower Indian farmers, Farmer Producer Organizations (FPOs), agricultural university extension centers (KVKs), and commercial farm operators, the platform combines real-time IoT sensor telemetry, ultra-fast agronomy inference powered by **Groq Cloud AI**, automated foliar pathology scanning, hardware actuator controls (PM-KUSUM solar pumps & Kisan drones), and APMC Mandi commodity market intelligence.

The user interface follows a modern high-contrast **Clean White main surface** standard with curated subordinate accent colors, instant Light/Dark theme switching, synthesized tactile audio feedback, and full keyboard navigation.

---

## 🌟 Core Features & Modules

### 1. 🛰️ Precision IoT Telemetry Mesh
- **Live Multi-Depth Soil Chemistry**: Real-time tracking of Volumetric Water Content (VWC %), Soil Temperature (°C), Ambient Humidity (%), Air Temperature (°C), Soil pH, and NPK Macro-nutrients (Nitrogen, Phosphorus, Potassium in mg/kg).
- **Indian Agro-Climatic Zones**:
  - **Zone 1: Punjab Granary (Indo-Gangetic Basin)**: Deep Alluvial Soil (*जलोढ़ मिट्टी*), Sharbati Wheat (HD 2967) & Basmati Paddy, Canal Sluice irrigation.
  - **Zone 2: Deccan Plateau (Vidarbha Agri-Belt, Maharashtra)**: Black Cotton / Regur Soil (*काली मिट्टी*), BT Cotton (*कपास*) & Yellow Soybean, Sub-surface Drip.
  - **Zone 3: Saurashtra Semi-Arid Block (Rajkot, Gujarat)**: Sandy Loam & Calcareous (*बलुई दोमट*), Groundnut (*मूंगफली*) & Yellow Mustard, Solar Pulse Drip.
  - **Zone 4: Western Ghats Polyhouse (Bengaluru Rural, Karnataka)**: Red Laterite & Coco-Peat (*लाल लेटेराइट*), High-Value Capsicum & Cherry Tomatoes, Automated Misting.
- **Dynamic Time-Range Analytics**: Interactive SVG trendline with smooth cubic Bézier curves and interactive hover tooltips supporting `24H`, `7D`, and `30D` windows.
- **1-Click Pulse Irrigation**: Instantaneous solenoid valve trigger delivering precision pulse watering with immediate moisture feedback.
- **Operational Data Export**: 1-click CSV Telemetry export and print-ready PDF operational reporting.

---

### 2. 🤖 AgriGroq AI Agronomy Advisor
- **High-Speed Inference**: Powered by Groq Cloud utilizing `qwen/qwen3.8-27b` with a resilient multi-model fallback cascade (`openai/gpt-oss-120b`, `openai/gpt-oss-20b`, `allam-2-7b`).
- **Strict Agricultural Domain Guardrail**:
  - Dedicated domain gatekeeper strictly confines conversation to farming, agronomy, soil chemistry, IPM pest management, machinery, and agricultural economics.
  - Non-agricultural queries are politely declined and redirected to agronomic problem solving.
- **Indian Agricultural Knowledge Base**: Deep domain expertise in:
  - ICAR (Indian Council of Agricultural Research) & State Agricultural University protocols.
  - NPK 4:2:1 balanced nutrition + Zinc Sulfate amelioration.
  - Subhash Palekar Natural Farming (SPNF): Indigenous formulation steps for **Jeevamrut**, **Beejamrit**, and **Neem Astra**.
  - PM Krishi Sinchayee Yojana (PMKSY) micro-drip standards.
- **Voice-to-Text Input**: Integrated Web SpeechRecognition API for hands-free farmer voice dictation.
- **Transcript Utilities**: 1-click clipboard copy and Markdown transcript download (`.txt`).
- **Session API Key Modal**: Secure client-side override to enter custom Groq API keys without touching server environment files.

---

### 3. 🔬 AI Crop Pathology & Doctor
- **Foliar Vision Diagnostics**: Upload real leaf photographs or capture directly with smartphone camera with animated cellular laser scanning HUD.
- **Prevalent Indian Crop Pathologies Database**:
  - **Rice / Paddy Blast (*Magnaporthe oryzae* / झुलसा रोग)**: Basmati tracts of Punjab, Haryana, and Andhra Pradesh.
  - **Cotton Pink Bollworm (*Pectinophora gossypiella* / गुलाबी सुंडी)**: Maharashtra, Gujarat, and Telangana cotton belts.
  - **Wheat Stripe Yellow Rust (*Puccinia striiformis* / पीला रतुआ)**: Indo-Gangetic Plains & Terai foothills.
  - **Tomato & Chilli Leaf Curl Begomovirus (*पत्ती मरोड़ रोग*)**: Whitefly vector management.
  - **Sugarcane Red Rot (*Colletotrichum falcatum* / लाल सड़न)**: Western UP & Maharashtra sugarcane tracts.
  - **Nitrogen & Zinc Deficiency (Khaira Disease / नत्रजन व जस्ते की कमी)**: Common in calcareous & alluvial tracts.
- **Dual Treatment Protocols**: Side-by-side tabs for **Organic / Natural Farming Solutions** (*Jeevamrut, Neem seed kernel extract NSKE 5%, Trichoderma viride*) vs **CIBRC-Registered Agro-Chemicals** (*Tricyclazole, Propiconazole, Emamectin Benzoate*).
- **1-Click AI Consultation Handoff**: Transfers diagnosed disease parameters directly into the AgriGroq AI chat advisor for an individualized field plan.

---

### 4. ⚡ SCADA Farm Controls & Actuators
- **PMKSY Smart Drip Manifold**: Remote control for 4 sub-main solenoid valves with automated scheduling, pressure tracking (2.8 Bar), and Emergency Stop Master Valve.
- **PM-KUSUM 7.5 HP Solar & Borewell Pump**: High-efficiency submersible pump controller featuring 340 L/min discharge, solar PV power generation tracking (6.8 kW), and hybrid grid fallback.
- **Kisan Drone UAV Swath Sprayer**: Autonomous aerial mission launcher simulating a 10L agricultural hexacopter with real-time waypoint radar sweep, altitude hold (3.2 m), and swath progress tracking.
  - **Payload Formulations**: IFFCO Nano Urea (4% N foliar spray), Indigenous Neem Astra 10%, Jeevamrut Microbial Extract, Copper Hydroxide, and *Bacillus thuringiensis* (Bt).
- **Greenhouse / Polyhouse Climate Controls**: High-speed exhaust fans, evaporative cooling pads, and automated mist foggers engineered for extreme Indian summer heat (42°C+).

---

### 5. 📈 APMC Mandi Commodity Market Intelligence
- **Real-Time APMC Mandi Tickers**:
  - **Sharbati Wheat (गेहूं - HD 2967)**: Khanna Mandi, Punjab (MSP: ₹2,275/qtl | Spot: ₹2,450/qtl)
  - **Basmati 1121 Paddy (बासमती धान)**: Karnal Mandi, Haryana (Spot: ₹3,890/qtl)
  - **Shankar-6 Raw Cotton (कपास)**: Rajkot APMC, Gujarat (MSP: ₹6,620/qtl | Spot: ₹7,140/qtl)
  - **Yellow Mustard / Sarson (सरसों)**: Bharatpur Mandi, Rajasthan (MSP: ₹5,650/qtl | Spot: ₹5,720/qtl)
  - **Desi Chana / Chickpea (चना)**: Indore Mandi, MP (MSP: ₹5,440/qtl | Spot: ₹6,180/qtl)
  - **Nashik Red Onion (लाल प्याज)**: Lasalgaon APMC, Maharashtra (Spot: ₹1,980/qtl)
  - **Sugarcane Co-0238 (गन्ना)**: Muzaffarnagar APMC, Western UP (FRP: ₹340/qtl | Spot: ₹385/qtl)
  - **Yellow Soybean JS-335 (सोयाबीन)**: Ujjain APMC, MP (MSP: ₹4,600/qtl | Spot: ₹4,520/qtl)
- **Minimum Support Price (MSP) & FRP Benchmarks**: Real-time indicators showing whether spot prices are trading at a premium or discount relative to Government of India MSP benchmarks.
- **Multi-Currency Instant Conversion**:
  - `INR (₹)` — Primary default (in ₹ / Quintal / 100 kg)
  - `USD ($)` — US Dollar
  - `EUR (€)` — Euro
  - `GBP (£)` — British Pound
  - `CAD (C$)` — Canadian Dollar
- **7-Day Trajectory Sparklines**: Lightweight inline SVG price trend visualization.
- **AI Economic Consultation**: Instant analysis on whether to sell immediately at the local mandi, store in accredited warehouses with electronic Negotiable Warehouse Receipts (e-NWR) for pledge financing, or hold for off-season procurement.

---

## 🎨 Design System & Aesthetics

The application adheres to clean SaaS interface standards:

| Semantic Role | Token / Hex | Purpose & Usage |
| :--- | :--- | :--- |
| **Main Surface** | `#ffffff` (`--bg-surface`) | Card backgrounds, chat panels, modals, and input fields |
| **Main Backdrop** | `#f8fafc` (`--bg-main`) | Subtle slate grid texture ensuring contrast against cards |
| **Agricultural Emerald** | `#059669` (`--emerald-600`) | Primary buttons, active tabs, healthy telemetry, and soil stats |
| **Hydrology Sky Blue** | `#0284c7` (`--sky-600`) | Moisture levels, humidity, irrigation status, and rain forecasts |
| **Harvest Amber** | `#d97706` (`--amber-600`) | Temperature alerts, solar radiation, warning badges, and MSP markers |
| **Pathology Coral Rose** | `#e11d48` (`--rose-600`) | Crop disease indicators, emergency shutoff, and bearish price shifts |
| **Tech Indigo** | `#4f46e5` (`--indigo-600`) | Groq AI badge, drone waypoint trajectories, and SCADA automation |

- **Theme Toggle**: Switch between **Clean White (Light default)** and **Deep Emerald (Dark mode)** via the top-right header toggle.
- **Web Audio Feedback**: Tactile click, scan, alert, and actuator toggle sound effects synthesized via the browser's native Web Audio API (zero audio file dependencies, fully mutable).
- **Keyboard Shortcuts**: Press `1` through `5` anywhere in the app to switch tabs instantly.

---

## 📐 System Architecture

```mermaid
graph TD
    User["👨‍🌾 Farmer / Agronomist"] -->|Interacts with UI| Frontend["⚛️ React 18 + Vite SPA"]
    
    subgraph Frontend Client
        Dashboard["📊 Telemetry Mesh & Zones"]
        AIChat["🤖 AgriGroq AI Advisor"]
        Pathology["🔬 Crop Doctor Scanner"]
        Controls["⚡ SCADA Farm Controls"]
        Market["📈 APMC Mandi Intelligence"]
    end
    
    Frontend -->|REST API Calls (JSON)| Backend["🚀 Node.js / Express Server (:5000)"]
    
    subgraph Backend Server
        Guardrail["🛡️ Agricultural Guardrail Engine"]
        GroqClient["⚡ Groq SDK Client"]
        TelemetryState["📡 IoT Telemetry & Zone State"]
        CropDB["🦠 Indian Crop Disease DB"]
        MandiEngine["💰 APMC Multi-Currency Engine"]
        Actuators["⚙️ SCADA Actuators Controller"]
    end
    
    Backend -->|Live AI Inference| Groq["☁️ Groq Cloud API (qwen/qwen3.8-27b)"]
    Backend -->|Fallback AI| SmartEngine["🌿 Built-in Precision Agronomy Engine"]
```

---

## 🚀 Getting Started & Installation

### Prerequisites
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher
- **Groq API Key**: Free API key from [console.groq.com](https://console.groq.com)

### 1. Clone the Repository
```bash
git clone https://github.com/yaduvanshimayank/Smart-Agriculture-Web-Portal.git
cd Smart-Agriculture-Web-Portal
```

### 2. Configure Environment Variables
Create a `.env` file inside the `server/` directory:
```bash
# server/.env
PORT=5000
GROQ_API_KEY=gsk_your_actual_groq_api_key_here
```
> *Note: If no Groq API Key is configured, the application automatically activates its rich built-in **Offline Agronomy Engine** with zero crashes.*

### 3. Install Dependencies
```bash
# Install root, server, and client dependencies
npm install
npm --prefix server install
npm --prefix client install
```

### 4. Run in Development Mode
Start both the Express backend API and the Vite frontend dev server concurrently:
```bash
# Terminal 1: Backend Server (Port 5000)
node server/server.js

# Terminal 2: Frontend Vite Server (Port 5173)
npm --prefix client run dev
```

Open your browser at:
```
http://localhost:5173
```

### 5. Production Build & Deployment
To compile the client bundle for production:
```bash
npm --prefix client run build
```
The optimized bundle is generated into `client/dist/`. The Express backend is configured to automatically serve this production bundle when `NODE_ENV=production` or when running standalone.

---

## 📡 REST API Documentation

### 1. AI Farm Advisor Chat
- **Endpoint**: `POST /api/chat`
- **Body**:
  ```json
  {
    "message": "What is the recommended NPK and Zinc schedule for Sharbati Wheat?",
    "history": [],
    "userApiKey": "" 
  }
  ```
- **Response**:
  ```json
  {
    "reply": "### 🌾 Precision Agronomy Guidance...",
    "model": "qwen/qwen3.8-27b",
    "success": true
  }
  ```

### 2. Real-Time Telemetry & History
- **Endpoint**: `GET /api/telemetry?range=24h`
- **Query Params**: `range` = `24h` | `7d` | `30d`
- **Response**: Returns overall health index, active sensor nodes, 4 Indian zone status objects, and dynamic historical telemetry points.

### 3. Quick Zone Pulse Irrigation
- **Endpoint**: `POST /api/telemetry/irrigate-zone`
- **Body**: `{ "zoneId": "zone-1" }`
- **Response**: Updates targeted zone soil moisture by +16.5% and resets irrigation timestamp.

### 4. Crop Pathology Analysis
- **Endpoint**: `POST /api/crop-health/analyze`
- **Body**:
  ```json
  {
    "cropType": "Basmati Rice",
    "symptom": "blast",
    "fileName": "paddy_leaf_specimen.jpg"
  }
  ```
- **Response**: Returns pathogen identification, confidence %, severity, organic treatment, and chemical treatment.

### 5. APMC Mandi Market Prices
- **Endpoint**: `GET /api/market-prices?currency=INR`
- **Query Params**: `currency` = `INR` | `USD` | `EUR` | `GBP` | `CAD`
- **Response**: Returns 8 Indian commodities with APMC mandi locations, MSP benchmarks, 24h change %, and 7-day sparkline arrays.

### 6. SCADA Farm Controls
- **Endpoint**: `GET /api/farm-controls`
- **Endpoint**: `POST /api/farm-controls/toggle`
- **Body**: `{ "device": "droneSprayer", "key": "payload", "value": "IFFCO Nano Urea (4% N foliar spray)" }`

---

## 🧪 Testing & Verification

The portal has been verified through automated subagent testing suites:
1. **Frontend Compilation**: Built cleanly via Vite with 0 errors (`dist/index.html`, `dist/assets/index-DXrxsPLm.css`, `dist/assets/index-DnI6zeJy.js`).
2. **Groq AI Inference**: Confirmed live responses from `qwen/qwen3.8-27b` with agricultural guardrails active.
3. **APMC Mandi Conversion**: Currency rates verified across INR, USD, EUR, GBP, and CAD.
4. **SCADA Hardware Automation**: Actuator state changes verified across drip solenoids, Kisan drone missions, and PM-KUSUM solar pumps.

---

## 🤝 Acknowledgements & References
- **ICAR** (Indian Council of Agricultural Research) & **PAU** (Punjab Agricultural University) for agronomic research protocols.
- **e-NAM** (National Agriculture Market) & State APMC Mandis for commodity benchmark structures.
- **Groq Inc.** for high-throughput LPU AI inference.
- **Lucide Icons** for icons and visual indicators.

---

## 📄 License
This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
