# Onpoint Services — भाडे पावती (भाडे चिठ्ठी / भाडे पत्र करारनामा) PDF Generator

अधिकृत **Onpoint Services** साठी बनवलेली २-पानी / ३-पानी A4 **भाडे चिठ्ठी/भाडे पत्र करारनामा** आणि **स्वाधार स्वयंघोषणापत्र** जनरेटर प्रणाली.

---

## 🌟 वैशिष्ट्ये (Key Features)

1. **संपूर्ण डिव्हाइस सिंक (Cloud Database Sync)**:
   - लॅपटॉपवर तयार केलेले भाडे पत्र थेट **मोबाईल फोनवर** आणि **इतर कोणत्याही कॉम्प्युटरवर** आपोआप दिसते.
   - Google Firebase Firestore (१००% मोफत) क्लाउड सिंकद्वारे सर्व डेटा रिअल-टाइम सुरक्षित राहतो.
   - १-क्लिकमध्ये **डेटा बॅकअप डाऊनलोड (JSON)** आणि **रिस्टोअर** करण्याची सोय.

2. **अचूक A4 मराठी लेआउट (२ पाने व स्वाधार ३ रे पान)**:
   - **पान १**: भाडे पत्र करारनामा, शासन निर्णय संदर्भ, घरमालक व विद्यार्थी तपशील, मालमत्ता माहिती, ६ कायदेशीर अटी व स्वयंघोषणा.
   - **पान २**: घरमालक व भाडेकरू स्वाक्षरी, आवश्यक कागदपत्रे सूची (लाईट बिल, आधार, मोबाईल), प्रपत्र-अ स्वयंघोषणापत्र व फोटो बॉक्स.
   - **पान ३ (पर्यायी)**: डॉ. बाबासाहेब आंबेडकर स्वाधार योजना स्वयंघोषणापत्र.

3. **अचूक देवनागरी व हाय-डीपीआय PDF**:
   - High-DPI canvas (`scale: 2.5`) + jsPDF द्वारे स्पष्ट, न फाटता येणारी A4 PDF डाऊनलोड.
   - मराठी अक्षरी रक्कम रूपांतरक (उदा. `३५००` टाकताच *"तीन हजार पाचशे"* ऑटोमॅटिक येते).

4. **सुरक्षित लॉगिन**:
   - **युझरनेम**: `@Onpoint_Services`
   - **पासवर्ड**: `Onpoint@123`

---

## 📱 सर्व मोबाईल आणि संगणकांवर डेटा कसा दिसेल? (Cloud Database Setup)

> **महत्त्वाची नोंद**: जर डेटा फक्त एका कॉम्प्युटरवर दिसत असेल आणि मोबाईलवर दिसत नसेल, तर याचे कारण तो डेटा फक्त त्या कॉम्प्युटरच्या ब्राऊझरमध्ये स्थानिक (Local) साठवला गेला आहे. सर्व मोबाईल आणि संगणकांवर डेटा आपोआप दिसण्यासाठी खालील **२ मिनिटांची मोफत पायरी** करा:

### Google Firebase Firestore सेटअप (१००% मोफत):

1. **[console.firebase.google.com](https://console.firebase.google.com/)** वर जा आणि गुगल अकाउंटने लॉगिन करा.
2. **'Add project'** वर क्लिक करा ➔ प्रकल्पाचे नाव द्या (उदा. `onpoint-bhadepavti`).
3. डाव्या मेनूमध्ये **Build** ➔ **Firestore Database** निवडा ➔ **'Create database'** वर क्लिक करा.
4. लोकेशन निवडा (उदा. `nam5 (us-central)` किंवा `asia-south1`) ➔ नियम विचारल्यावर **'Start in test mode'** निवडा ➔ **Enable** करा.
5. होमपेजवर वेब आयकॉन ( **`</>`** ) वर क्लिक करा ➔ ॲपचे नाव द्या ➔ **Register app** करा.
6. स्क्रीनवर दिसणारा `firebaseConfig` कोड कॉपी करा:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "bhadepavti.firebaseapp.com",
     projectId: "bhadepavti",
     storageBucket: "bhadepavti.appspot.com",
     messagingSenderId: "...",
     appId: "..."
   };
   ```
7. या प्रोजेक्टमधील **`js/config.js`** फाईल उघडा आणि तो कोड तिथे सेव्ह करा:
   ```javascript
   window.FIREBASE_CONFIG = {
     apiKey: "AIzaSy...",
     authDomain: "bhadepavti.firebaseapp.com",
     projectId: "bhadepavti",
     storageBucket: "bhadepavti.appspot.com",
     messagingSenderId: "...",
     appId: "..."
   };
   ```
8. **Git push** करा ➔ Vercel ऑटोमॅटिक री-डिप्लॉय करेल!
👉 **आता तुम्ही किंवा तुमचे ग्राहक कोणत्याही मोबाईल किंवा कॉम्प्युटरवरून लिंक उघडा — सर्व जुनी भाडे पत्रे आपोआप दिसतील!**

---

## 💾 तात्काळ बॅकअप ट्रान्सफर (पर्यायी पद्धत)

जर तुम्हाला Firebase न वापरता एका कॉम्प्युटरवरून दुसऱ्या मोबाईलवर डेटा पाठवायचा असेल:
1. डॅशबोर्डवर वरच्या **"क्लाउड डेटाबेस"** बटणावर क्लिक करा.
2. **"💾 डेटा बॅकअप डाऊनलोड (JSON)"** वर क्लिक करा — एक छोटी फाईल डाऊनलोड होईल.
3. ती फाईल व्हॉट्सॲपद्वारे मोबाईलवर पाठवा.
4. मोबाईलवर वेबसाईट उघडून **"📥 बॅकअप फाईल रिस्टोअर"** वर क्लिक करून ती फाईल निवडा. एका सेकंदात सर्व डेटा मोबाईलवर येईल!

---

## 🚀 GitHub आणि Vercel डिप्लॉयमेंट सूचना (Deployment Guide)

### १. GitHub वर पुश करणे:
```powershell
cd "c:\Users\khara\OneDrive\Desktop\bhadepavti"
git add .
git commit -m "Deploy ready: Clean UI, Vercel static build and cloud sync"
git push origin main
```

### २. Vercel वर डिप्लॉयमेंट:
1. **[vercel.com](https://vercel.com/)** वर जाऊन लॉगिन करा.
2. **"Add New Project"** ➔ **"Import Git Repository"** निवडून `bhadepavti` निवडा.
3. Framework Preset: **Other** (किंवा Static).
4. Build Command: रिकामे ठेवा (किंवा काही नको).
5. Output Directory: `.` (किंवा रिकामे).
6. **"Deploy"** बटणावर क्लिक करा!
7. २ ते ५ सेकंदात तुमची लाईव्ह लिंक तयार होईल (उदा. `https://bhadepavti.vercel.app`).

---

## 💻 लोकल कॉम्प्युटरवर कसे चालवायचे?

```powershell
cd "c:\Users\khara\OneDrive\Desktop\bhadepavti"
node scripts/dev-server.js
```
ब्राऊझरमध्ये उघडा: `http://localhost:3000`

---

## 📄 हक्क व श्रेय (Attribution)

Developed for **Onpoint Services**.  
All rights reserved to ePoint Services through SK Tech Services and Solutions @2026.
