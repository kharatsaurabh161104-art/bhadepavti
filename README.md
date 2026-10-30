# Onpoint Services — Bhade Pavati (भाडे चिठ्ठी/भाडे पत्र करारनामा) PDF Generator & Database System

An authentic, production-grade web application built for **Onpoint Services** to generate official **two-page / three-page A4 Bhade Pavati (भाडे चिठ्ठी/भाडे पत्र करारनामा)** and **स्वयंघोषणापत्र (Self-Declaration)** documents in Marathi Devanagari, powered by an integrated **SQLite Enterprise Database** for permanent record storage, login authentication, future editing, and instant PDF downloads.

---

## 🌟 Key Features

1. **Integrated SQLite Enterprise Database**:
   - Built-in SQLite database (`data/bhadepavti.db`) stores all user logins and affidavits permanently.
   - Dual-engine architecture: uses high-speed SQLite with seamless fallback to atomic JSON storage.
   - Zero external installations required (uses Node.js built-in database engine).
   - 1-Click Database Backup (JSON export) & Instant Restore.

2. **Perpetual Record History & Future Edits**:
   - Every created or edited affidavit is saved with full details (tenant, owner, rent, address, college, dates, photo, swadhar declaration).
   - You can log in anytime, search by student name or owner name, edit any field, and immediately download the updated PDF.

3. **Secure Authentication from Database**:
   - User credentials stored securely with salted password hashing.
   - Persistent session management with role-based access.

4. **Exact 2-Page & 3-Page A4 Marathi Layout**:
   - **Page 1**: भाडे चिठ्ठी/भाडे पत्र करारनामा, reference circulars, tenant and owner details, property description, rent conditions, 6 numbered legal clauses, and final declaration: *"सदर या परवान्याचा करारनामा मी स्व:खुशीने अवकल हुशारीने लिहून दिला आहे."*
   - **Page 2**: Tenant & Owner signature areas (side-by-side), supporting documents list (लाइट बिल, आधार कार्ड, मोबाईल क्रमांक), Underlined Government Decision (*शासन निर्णय क्रमांक: प्रसुधा १६१४/३४५/प्र.क्र.७१/१८-अ*), **प्रपत्र-अ स्वयंघोषणापत्र**, and applicant photograph box (*अर्जदाराचा फोटो*).
   - **Page 3 (Optional Swadhar)**: डॉ. बाबासाहेब आंबेडकर स्वाधार योजना - विद्यार्थ्याचे स्वयंघोषणापत्र.
   - **Zero Spillover**: Strict A4 portrait sizing (210mm x 297mm) guarantees exact pagination with zero overflow.

5. **Accurate Devanagari Unicode Rendering**:
   - High-DPI canvas rasterization (`scale: 2.5`) + jsPDF ensures 100% glyph accuracy without broken conjuncts, missing matras, or font encoding failures.
   - Built-in `print.css` for instant vector printing via browser (`Ctrl + P`).

6. **Real-Time Marathi Number-to-Words Converter**:
   - As you type numbers in the monthly rent field (e.g. `3500`), it automatically converts to Marathi words (*तीन हजार पाचशे*).

---

## 🔑 Login Credentials

- **Username**: `@Onpoint_Services`
- **Password**: `Onpoint@123`

*(Stored securely in `data/bhadepavti.db` `users` table).*

---

## 🚀 How to Run Locally on Windows

1. Open PowerShell or Command Prompt in this folder:
   ```powershell
   cd "c:\Users\khara\OneDrive\Desktop\bhadepavti"
   ```
2. Start the database server:
   ```powershell
   node server.js
   ```
   *(or `npm start` / `npm run dev`)*
3. Open your browser and visit:
   ```
   http://127.0.0.1:3000/
   ```

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate user against database |
| `POST` | `/api/auth/register` | Create a new user in database |
| `GET` | `/api/affidavits` | List all saved affidavits (supports `q`, `from`, `to` filters) |
| `GET` | `/api/affidavits/:id` | Get single affidavit details |
| `POST` | `/api/affidavits` | Create new affidavit and save to SQLite DB |
| `PUT` | `/api/affidavits/:id` | Update existing affidavit in SQLite DB |
| `DELETE` | `/api/affidavits/:id` | Delete affidavit from SQLite DB |
| `GET` | `/api/db/stats` | View database status, record counts, engine |
| `GET` | `/api/db/export` | Download full database backup as JSON |
| `POST` | `/api/db/import` | Restore database backup from JSON |

---

## 📁 Project Structure

```
bhadepavti/
├── index.html               # Secure login interface with live DB status badge
├── dashboard.html           # Records management, search, filters, DB manager modal
├── create-affidavit.html    # Form entry, edit mode, live 2/3-page A4 preview & save
├── server.js                # Full Node.js REST API & static server
├── server/
│   └── db.js                # SQLite Database engine (with JSON fallback)
├── data/
│   └── bhadepavti.db        # SQLite database file (persists users & affidavits)
├── js/
│   ├── db.js                # Frontend Database client & sync manager
│   ├── auth.js              # Database-driven authentication module
│   ├── dashboard.js         # Table management, search, DB backup/restore
│   ├── affidavit.js         # Form logic, Marathi converter & dual-storage store
│   ├── pdf-generator.js     # High-DPI 2-page/3-page A4 PDF generation
│   └── vendor/
│       ├── jspdf.umd.min.js # jsPDF library
│       └── html2canvas.min.js # html2canvas library
├── css/
│   ├── style.css            # Glassmorphism UI & responsive design
│   └── print.css            # Precise 2-page/3-page A4 print & PDF stylesheet
└── assets/
    ├── logo.png             # Official Onpoint Services logo
    └── fonts/               # Devanagari Unicode fonts (Noto Sans, Mangal)
```

---

## 📄 License & Attribution

Developed for **Onpoint Services**.
All rights reserved to ePoint Services through SK Tech Services and Solutions @2026.
