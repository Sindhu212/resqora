# RESQORA – LifeLine AI
### Intelligent Emergency Response Platform

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://sindhu212.github.io/resqora/)
[![Demo](https://img.shields.io/badge/Demo-Static%20Only-blue)](#)

> **Live Website:** [https://sindhu212.github.io/resqora/](https://sindhu212.github.io/resqora/)

---

## Overview

**RESQORA – LifeLine AI** is a fully interactive, browser-based Emergency Response Management Platform demo. It demonstrates how citizens, ambulances, hospitals, emergency coordinators, and families can coordinate emergency situations through one centralized platform.

> ⚠️ **This is a demonstration application only.**
> All data is simulated. No real emergency services, hospitals, ambulances, or dispatch systems are connected.
> Do not use this application for real emergencies. Call your local emergency number (112 / 911 / 108).

---

## Features

### 📊 Dashboard
- Live overview statistics (Emergency Requests, Active Ambulances, Available Hospitals, Patients Under Care, Critical Cases, Completed Responses)
- Emergency Priority Distribution chart (Chart.js)
- Response Status Overview chart (Chart.js)
- Active Emergency Requests table
- Ambulance Status overview
- Hospital Capacity overview with progress bars
- Recent Activity Feed
- Emergency Alerts Panel
- Quick Action Buttons

### 🚨 Emergency Requests
- Full CRUD (Create, Read, Update, Delete)
- 18 fields including patient details, location, priority, status
- Search, filter by priority / status / type, sort
- Emergency Response Timeline
- Assign ambulance and hospital from within the request
- "Complete Emergency" moves the request to History

### 🚑 Ambulances
- Full CRUD with fleet management
- Ambulance types: BLS, ALS, Patient Transport, Neonatal
- Status tracking (Available → On Duty → Returning)
- Prevents assigning an ambulance already on active duty
- CSV export and import

### 🏥 Hospitals
- Full CRUD with emergency capacity management
- Emergency Beds and ICU Beds with live progress bars
- Facilities: Trauma Care, Cardiac Care, Stroke Care, Emergency Dept.
- Status: Accepting / Limited Capacity / Full / Unavailable
- Per-hospital current patient list
- CSV export and import

### 👤 Patients
- Full CRUD with status tracking
- Linked to Emergency Requests, Ambulances, and Hospitals
- Status lifecycle: Awaiting → Ambulance Assigned → In Transit → Admitted → Under Care → Discharged
- CSV export and import

### 📅 Emergency Assignments
- Create and manage ambulance-to-hospital assignments
- Synchronises with Emergency Requests and Ambulances
- CSV export

### 📋 Emergency History
- Auto-populated when emergency is completed
- Average response time statistics
- Search and filter by type and priority
- CSV export

### 🔔 Family Notifications (Simulated)
- Notification log for all status changes
- Simulate individual notification events
- No real SMS, email, or push notifications are sent

### 🏢 Corporate Emergencies
- Register and manage workplace emergency organizations
- Track emergency type, employee count, and resolution status
- CSV export

### 🤖 AI Hospital Recommendation (Simulated)
- Rule-based local JavaScript scoring engine
- Evaluates: hospital status, emergency beds, ICU, trauma/cardiac/stroke care, simulated distance
- Displays scored results with explanation
- Clearly labelled **DEMO AI SIMULATION** — not a real AI service

### 🗺️ Ambulance Route Optimization (Simulated)
- Three simulated route options per emergency
- Visual map using **Leaflet + OpenStreetMap**
- Graceful fallback if map tiles are unavailable
- Clearly labelled **SIMULATED ROUTE** — no real GPS or live traffic data

### 🔍 Global Search
- Search across all modules simultaneously
- One-click navigation to the matching record

### 📤 CSV Export & Import
- Export all 7 modules to CSV
- Import Ambulances, Hospitals, and Patients from CSV
- Duplicate ID detection during import

### 💾 LocalStorage Persistence
- All CRUD data persists after browser refresh
- Sample data initializes only when no saved data exists
- Reset to demo defaults or clear all data from Settings

---

## Technology Stack

| Library | Version | Purpose |
|---|---|---|
| Bootstrap | 5.3.2 | Responsive UI, modals, forms |
| Bootstrap Icons | 1.11.3 | Icon set |
| Chart.js | 4.4.1 | Interactive dashboard charts |
| Leaflet | 1.9.4 | Interactive map |
| OpenStreetMap | — | Map tile source |

No Node.js, no build tools, no backend, no database. Pure HTML + CSS + JavaScript.

---

## Project Structure

```
resqora/
├── index.html          # Main application (all sections, all modals)
├── resqora.css         # Application stylesheet
├── resqora.js          # Full application logic (~700 lines)
├── README.md           # This file
```

---

## Running Locally

Simply open `index.html` in any modern browser:

```
Double-click index.html
```

Or drag `index.html` into your browser window. No web server is required.

---

## Deployment (GitHub Pages)

This application is deployed via **GitHub Pages** from the `main` branch root directory.

**Published URL:** [https://sindhu212.github.io/resqora/](https://sindhu212.github.io/resqora/)

### LocalStorage Note
LocalStorage data is stored **per browser, per origin**. Each visitor's data is private to their own browser and is not shared between users or devices.

---

## Disclaimer

> This application is a **demonstration project only**.
>
> - All emergency data is simulated sample data.
> - AI Hospital Recommendations are generated by local rule-based JavaScript logic — not a real AI model.
> - Ambulance Routes are simulated — no real GPS tracking or live traffic data is used.
> - Family Notifications are simulated inside the application — no real SMS, WhatsApp, email, or push notifications are sent.
> - This application is not connected to real emergency services, real hospitals, real ambulance fleets, or any government emergency dispatch system.
> - Do not use this for real emergencies.

---

## License

Demo project — for educational and portfolio purposes.

---

**RESQORA | LifeLine AI | Designed & Developed by Sindhu Raj B**
