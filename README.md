# 🧠 NerveDrive
> Private, in-browser Apple Health intelligence and analytics dashboard.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

NerveDrive is a flagship health telemetry dashboard designed to provide a cohesive, premium, and private experience for analyzing your Apple Health data. 

**Zero data leaves your device.** NerveDrive processes your Apple Health export `.zip` or Health Connect SQLite database entirely within the browser using advanced client-side Web Workers, ensuring complete privacy.

---

## ✨ Features

- **Apple Health & Health Connect Support**: Upload your raw data exports and instantly visualize your biometric history.
- **Biometric Correlation Engine**: Advanced AI-driven engine that finds statistical correlations (e.g. Sleep vs HRV) in your telemetry and provides physiological explanations.
- **AI Prediction Center**: Simulate lifestyle modifications (sleep, cardio, protein intake) and watch a multi-variable weighted prediction model forecast your Biological Age and Recovery Index.
- **Interactive Body Systems Map**: An elegant anatomical map providing insights into your Cardiovascular, Respiratory, and Muscular systems.
- **AI Coach**: Actionable, ROI-ranked physiological recommendations based on your unique data deviations.

---

## 🛠 Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Framer Motion
- **Data Processing**: sql.js (WebAssembly) & papaparse (Web Workers)
- **Visualization**: Apache ECharts

---

## 📁 Folder Structure

```text
src/
├── components/
│   ├── sections/     # Core dashboard widgets (Coach, Body Systems, Correlations)
│   ├── ui/           # Reusable UI components (Buttons, Modals, Logo)
├── lib/              # Utility functions and data formatters
├── store/            # Zustand global state management
├── workers/          # Web Workers for heavy data parsing (SQLite/CSV)
└── App.tsx           # Main application entry point
```

---

## 🚀 Installation & Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mp3399/NerveDrive.git
   cd NerveDrive
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to `http://localhost:5174`

---

## 🏗 Build Instructions

To build the project for production, run:

```bash
npm run build
```

This compiles TypeScript and bundles the assets via Vite into the `dist/` directory.

---

## ☁️ Deployment

This project is configured to deploy automatically to **GitHub Pages** via GitHub Actions.

Any push to the `master` branch triggers the deployment workflow. The application is hosted publicly and natively supports client-side routing.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 🗺 Future Roadmap
- [ ] Direct Apple HealthKit sync via companion iOS App
- [ ] Continuous Glucose Monitor (CGM) data ingestion
- [ ] Dark/Light mode synchronization with OS
- [ ] WebGL based 3D Body System mapping

---

## 📄 License
*Pending*
