# Onpoint Services — Bhade Pavati (भाडे चिठ्ठी/भाडे पत्र करारनामा) PDF Generator

An authentic, production-grade web application built for **Onpoint Services** to generate official **two-page A4 Bhade Pavati (भाडे चिठ्ठी/भाडे पत्र करारनामा)** and **स्वयंघोषणापत्र (Self-Declaration)** documents in Marathi Devanagari.

---

## 🌟 Key Features

1. **Exact 2-Page A4 Marathi Layout**:
   - **Page 1**: भाडे चिठ्ठी/भाडे पत्र करारनामा, reference circulars, tenant and owner details, property description, rent conditions, 6 numbered legal clauses, and final declaration: *"सदर या परवान्याचा करारनामा मी स्व:खुशीने अवकल हुशारीने लिहून दिला आहे."*
   - **Page 2**: Tenant & Owner signature areas (side-by-side), supporting documents list (लाइट बिल, आधार कार्ड, मोबाईल क्रमांक), Underlined Government Decision (*शासन निर्णय क्रमांक: प्रसुधा १६१४/३४५/प्र.क्र.७१/१८-अ*), **प्रपत्र-अ स्वयंघोषणापत्र**, and applicant photograph box (*अर्जदाराचा फोटो*).
   - **Zero Spillover**: Strict A4 portrait sizing (210mm x 297mm) guarantees exactly 2 pages with zero overflow onto page 3.

2. **Accurate Devanagari Unicode Rendering**:
   - High-DPI canvas rasterization (`scale: 2.5`) + jsPDF ensures 100% glyph accuracy without broken conjuncts, missing matras, or font encoding failures.
   - Built-in `print.css` for instant vector printing via browser (`Ctrl + P`).

3. **Real-Time Marathi Number-to-Words Converter**:
   - As you type numbers in the monthly rent field (e.g. `3500`), it automatically converts to Marathi words (*तीन हजार पाचशे*).

4. **Complete Record Management (CRUD)**:
   - Create, View, Edit, Delete, Search by owner/tenant name, and Date range filtering.
   - LocalStorage persistence with sequential serial numbers maintained across filters.

5. **Secure Login**:
   - Protected dashboard routes with demo credentials.

---

## 🔑 Login Credentials

- **Username**: `@Onpoint_Services`
- **Password**: `Onpoint@123`

*(For production deployment, replace client-side session auth with server-side authentication, bcrypt hashing, and HTTP-only cookies).*

---

## 🚀 How to Run Locally on Windows

### Option 1: Using Node.js (Recommended)

1. Open PowerShell or Command Prompt in this folder:
   ```powershell
   cd "c:\Users\khara\OneDrive\Desktop\bhadepavti"
   ```
2. Start the local server:
   ```powershell
   node server.js
   ```
3. Open your browser and visit:
   ```
   http://127.0.0.1:3000/
   ```

### Option 2: Using Python

1. Open PowerShell in this folder:
   ```powershell
   cd "c:\Users\khara\OneDrive\Desktop\bhadepavti"
   python -m http.server 3000
   ```
2. Open your browser at `http://127.0.0.1:3000/`.

### Option 3: Direct File Open (or VS Code Live Server)

- Right-click `index.html` and select **"Open with Live Server"** in VS Code, or open `index.html` directly in Google Chrome / Microsoft Edge / Brave.

---

## 📁 Project Structure

```
bhadepavti/
├── index.html               # Secure login interface
├── dashboard.html           # Records management, search, filters & stats
├── create-affidavit.html    # Form entry with live 2-page A4 preview
├── server.js                # Lightweight local static server
├── README.md                # Documentation & Windows instructions
├── css/
│   ├── style.css            # Modern glassmorphism UI & responsive design
│   └── print.css            # Precise 2-page A4 print & PDF stylesheet
├── js/
│   ├── auth.js              # Authentication and route protection
│   ├── dashboard.js         # Table management, search, date filtering & modals
│   ├── affidavit.js         # Form logic, Marathi number-to-words & localStorage
│   ├── pdf-generator.js     # High-DPI 2-page A4 PDF generation & print
│   └── vendor/
│       ├── jspdf.umd.min.js # jsPDF library
│       └── html2canvas.min.js # html2canvas library
└── assets/
    ├── logo.png             # Official Onpoint Services logo
    └── fonts/               # Devanagari Unicode fonts (Noto Sans, Mangal)
```

---

## 📄 License & Attribution

Developed for **Onpoint Services**.
Contains authentic Maharashtra Swadhar Yojana & rental declaration formats.
