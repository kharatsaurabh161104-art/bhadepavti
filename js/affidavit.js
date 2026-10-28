/**
 * ONPOINT SERVICES — BHADE PAVATI TEMPLATE & RECORD MANAGER
 * Implements exact Marathi text, layout, number-to-words, and localStorage CRUD
 */

/* ==========================================================================
   MARATHI NUMBER-TO-WORDS CONVERTER
   ========================================================================== */
const MarathiNumberWords = {
  units: ['', 'एक', 'दोन', 'तीन', 'चार', 'पाच', 'सहा', 'सात', 'आठ', 'नऊ', 'दहा',
          'अकरा', 'बारा', 'तेरा', 'चौदा', 'पंधरा', 'सोळा', 'सतरा', 'अठरा', 'एकोणीस'],
  tens: ['', '', 'वीस', 'तीस', 'चाळीस', 'पन्नास', 'साठ', 'सत्तर', 'ऐंशी', 'नव्वद'],
  specialTens: {
    21: 'एकवीस', 22: 'बावीस', 23: 'तेवीस', 24: 'चोवीस', 25: 'पंचवीस', 26: 'सव्वीस', 27: 'सत्तावीस', 28: 'अठ्ठावीस', 29: 'एकोणतीस',
    31: 'एकतीस', 32: 'बत्तीस', 33: 'तेहेतीस', 34: 'चौतीस', 35: 'पस्तीस', 36: 'छत्तीस', 37: 'सदतीस', 38: 'अडतीस', 39: 'एकेचाळीस',
    41: 'एक्केचाळीस', 42: 'बेचाळीस', 43: 'त्रेचाळीस', 44: 'चव्वेचाळीस', 45: 'पंचेचाळीस', 46: 'शेहेचाळीस', 47: 'सत्तेचाळीस', 48: 'अठ्ठेचाळीस', 49: 'एकोणपन्नास',
    51: 'एक्कावन्न', 52: 'बावन्न', 53: 'त्रेपन्न', 54: 'चौपन्न', 55: 'पंचावन्न', 56: 'छप्पन्न', 57: 'सत्तावन्न', 58: 'अठ्ठावन्न', 59: 'एकोणसाठ',
    61: 'एकसष्ठ', 62: 'पासष्ठ', 63: 'त्रेसष्ठ', 64: 'चौसष्ठ', 65: 'पासष्ठ', 66: 'सहासष्ठ', 67: 'सदुसष्ठ', 68: 'अडुसष्ठ', 69: 'एकोणसत्तर',
    71: 'एकाहत्तर', 72: 'बाहत्तर', 73: 'त्र्याहत्तर', 74: 'चौऱ्याहत्तर', 75: 'पंच्याहत्तर', 76: 'शहात्तर', 77: 'सत्त्याहत्तर', 78: 'अठ्ठ्याहत्तर', 79: 'एकोणऐंशी',
    81: 'एक्क्याऐंशी', 82: 'ब्याऐंशी', 83: 'त्र्याऐंशी', 84: 'चौऱ्याऐंशी', 85: 'पंच्याऐंशी', 86: 'शहाऐंशी', 87: 'सत्त्याऐंशी', 88: 'अठ्ठ्याऐंशी', 89: 'एकोणनव्वद',
    91: 'एक्याण्णव', 92: 'ब्याण्णव', 93: 'त्र्याण्णव', 94: 'चौऱ्याण्णव', 95: 'पंच्याण्णव', 96: 'शहाण्णव', 97: 'सत्त्याण्णव', 98: 'अठ्ठ्याण्णव', 99: 'नव्व्याण्णव'
  },

  hundreds: ['', 'एकशे', 'दोनशे', 'तीनशे', 'चारशे', 'पाचशे', 'सहाशे', 'सातशे', 'आठशे', 'नऊशे'],

  convert2Digits(n) {
    if (n === 0) return '';
    if (n < 20) return this.units[n];
    if (this.specialTens[n]) return this.specialTens[n];
    const t = Math.floor(n / 10);
    const u = n % 10;
    return u === 0 ? this.tens[t] : this.tens[t] + ' ' + this.units[u];
  },

  convert(num) {
    const n = parseInt(num, 10);
    if (isNaN(n) || n <= 0) return '';
    if (n === 0) return 'शून्य';

    let result = '';
    const crore = Math.floor(n / 10000000);
    let rem = n % 10000000;

    const lakh = Math.floor(rem / 100000);
    rem = rem % 100000;

    const thousand = Math.floor(rem / 1000);
    rem = rem % 1000;

    const hundred = Math.floor(rem / 100);
    rem = rem % 100;

    if (crore > 0) result += this.convert2Digits(crore) + ' कोटी ';
    if (lakh > 0) result += this.convert2Digits(lakh) + ' लाख ';
    if (thousand > 0) result += this.convert2Digits(thousand) + ' हजार ';
    if (hundred > 0) result += (this.hundreds[hundred] || (this.convert2Digits(hundred) + ' शे')) + ' ';
    if (rem > 0) result += this.convert2Digits(rem);

    return result.trim();
  }
};

/* ==========================================================================
   AFFIDAVIT HTML TEMPLATE RENDERING
   ========================================================================== */
const AffidavitTemplate = {
  formatDate(dateStr) {
    if (!dateStr) return 'दिनांक : __/__/२०__';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  /**
   * Render Page 1 — भाडे चिठ्ठी/भाडे पत्र करारनामा
   */
  renderPage1(data) {
    const tName = this.escapeHtml(data.tenantName) || '_______________________';
    const tAge = this.escapeHtml(data.tenantAge) || '__';
    const tOcc = this.escapeHtml(data.tenantOccupation) || 'शिक्षण';
    const tAddr = this.escapeHtml(data.tenantAddress) || '__________________________________________________';

    const oName = this.escapeHtml(data.ownerName) || '_______________________';
    const oAge = this.escapeHtml(data.ownerAge) || '__';
    const oOcc = this.escapeHtml(data.ownerOccupation) || 'व्यवसाय';
    const oAddr = this.escapeHtml(data.ownerAddress) || '__________________________________________________';

    const acadYear = this.escapeHtml(data.academicYear) || '२०२६-२०२७';
    const college = this.escapeHtml(data.tenantCollege) || '__________________________________________________';
    const course = this.escapeHtml(data.tenantCourse) || '________________________';

    const propAddr = this.escapeHtml(data.propertyAddress) || '__________________________________________________';
    const propCity = this.escapeHtml(data.propertyCity) || 'पुणे';
    const surveyNo = this.escapeHtml(data.surveyNo) || '_____';
    const roomNo = this.escapeHtml(data.roomNo) || '_____';
    const propArea = this.escapeHtml(data.propertyArea) || '_____ चौ. फूट';
    const propConst = this.escapeHtml(data.propertyConstruction) || 'आर.सी.सी. बांधकाम';

    const rentFig = this.escapeHtml(data.monthlyRent) || '_____';
    const rentWords = this.escapeHtml(data.rentInWords) || '_________________________';
    const rentPayDay = this.escapeHtml(data.rentPaymentDay) || '१०';
    const startDate = this.formatDate(data.rentStartDate);
    const endDate = this.formatDate(data.rentEndDate);
    const duration = this.escapeHtml(data.rentDurationMonths) || '११';

    const agreeDate = this.formatDate(data.agreementDate);
    const execPlace = this.escapeHtml(data.executionPlace) || 'पुणे';

    return `
      <div class="doc-header">
        <h1 class="doc-main-title">भाडे चिठ्ठी/भाडे पत्र करारनामा</h1>
        <div class="doc-circular-refs">
          <p>संदर्भ : १) शासन निर्णय क्र. संकीर्ण २०१३/प्र.क्र.१३१/शिक्षण-१, दि. १५ जुलै २०१३</p>
          <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;२) शासन निर्णय क्र. बीसीएच-२०१६/प्र.क्र.२२३/शिक्षण-२, दि. १३ जून २०१८</p>
        </div>
      </div>

      <div class="dashed-separator"></div>

      <div class="parties-section">
        <div class="party-block">
          <p class="party-title">१. लिहून देणार (विद्यार्थी) :-</p>
          <table class="party-table">
            <tr>
              <td class="lbl">नाव</td><td class="col">:</td>
              <td class="val"><strong>${tName}</strong></td>
            </tr>
            <tr>
              <td class="lbl">वय</td><td class="col">:</td>
              <td class="val">${tAge} वर्षे, &nbsp;&nbsp;&nbsp;&nbsp;<strong>व्यवसाय :</strong> ${tOcc}</td>
            </tr>
            <tr>
              <td class="lbl">पत्ता</td><td class="col">:</td>
              <td class="val">${tAddr}</td>
            </tr>
          </table>
        </div>

        <div class="party-block">
          <p class="party-title">२. लिहून घेणार (घरमालक) :-</p>
          <table class="party-table">
            <tr>
              <td class="lbl">नाव</td><td class="col">:</td>
              <td class="val"><strong>${oName}</strong></td>
            </tr>
            <tr>
              <td class="lbl">वय</td><td class="col">:</td>
              <td class="val">${oAge} वर्षे, &nbsp;&nbsp;&nbsp;&nbsp;<strong>व्यवसाय :</strong> ${oOcc}</td>
            </tr>
            <tr>
              <td class="lbl">पत्ता</td><td class="col">:</td>
              <td class="val">${oAddr}</td>
            </tr>
          </table>
        </div>
      </div>

      <p class="doc-paragraph">
        कारणे लिहून देतो की, शैक्षणिक वर्ष <strong>${acadYear}</strong> या वर्षाकरिता मी <strong>${college}</strong> येथे <strong>${course}</strong> या अभ्यासक्रमात शिक्षण घेत असून, माझ्या राहण्याची कोणतीही सोय नसल्याने मला आपल्या मालकीच्या जागेत भाड्याने राहणे आवश्यक आहे. त्याकरिता आपण आपल्या मालकीची खालील वर्णनाची मिळकत मला भाड्याने देण्याचे मान्य केले आहे.
      </p>

      <p class="doc-paragraph">
        <strong>सदर मिळकतीचे वर्णन खालीलप्रमाणे :</strong> सदर मिळकत ही <strong>${propAddr}</strong>, <strong>${propCity}</strong>, सर्व्हे क्र. <strong>${surveyNo}</strong>, घर / खोली / फ्लॅट क्र. <strong>${roomNo}</strong>, क्षेत्रफळ <strong>${propArea}</strong>, <strong>${propConst}</strong> येथील असून सदर खोली/जागा ही मी माझ्या राहण्याकरिता भाड्याने घेतली आहे.
      </p>

      <p class="doc-paragraph">
        सदर जागेचे दरमहा भाडे रक्कम रु. <strong>${rentFig}/-</strong> (अक्षरी रुपये <strong>${rentWords}</strong> फक्त) असे ठरले असून, सदर भाडे मी दरमहा <strong>${rentPayDay}</strong> तारखेच्या आत घरमालकाकडे नियमित जमा करण्याचे मान्य केले आहे. सदर भाडे करार हा दिनांक <strong>${startDate}</strong> ते दिनांक <strong>${endDate}</strong> पर्यंत म्हणजेच एकूण <strong>${duration}</strong> महिन्यांच्या कालावधीकरिता करण्यात आलेला आहे.
      </p>

      <div class="doc-conditions">
        <p class="conditions-heading">सदर कराराच्या अटी व शर्ती खालीलप्रमाणे आहेत :-</p>
        <ol class="conditions-list">
          <li>सदर जागेचा वापर मी फक्त स्वतःच्या राहण्याकरिता व अभ्यासाकरिताच करणार असून कोणत्याही बेकायदेशीर, अनैतिक किंवा इतरांना उपद्रव होईल अशा कृत्यासाठी करणार नाही.</li>
          <li>सदर जागेची स्वच्छता व निगा मी स्वतः योग्य प्रकारे राखीन. जागेचे किंवा साहित्याचे कोणतेही नुकसान करणार नाही. नुकसान झाल्यास त्याची सर्वस्वी भरपाई मी स्वतः देण्यास बांधील राहीन.</li>
          <li>सदर जागेचे वीज बिल व पाणी बिल वापरानुसार दरमहा नियमितपणे परस्पर भरेन अथवा घरमालकाकडे वेळेवर जमा करीन.</li>
          <li>सदर जागेमध्ये मी कोणत्याही प्रकारे अनधिकृत बांधकाम, अंतर्गत फेरबदल करणार नाही किंवा सदर जागा इतर कोणासही पोटभाड्याने देणार नाही.</li>
          <li>कराराची मुदत संपताच जागेचा ताबा घरमालकास विनाअट शांततेने सुपूर्द करीन.</li>
          <li>मला जागा रिकामी करावयाची असल्यास किंवा घरमालकास जागा रिकामी हवी असल्यास दोन्ही बाजूंकडून १ महिना आधी पूर्वसूचना देणे बंधनकारक राहील.</li>
        </ol>
      </div>

      <p class="doc-paragraph">
        वरील सर्व अटी व शर्ती मला मान्य व कबूल असून त्याचे मी तंतोतंत पालन करीन. मी अटींचा भंग केल्यास घरमालकास मला जागेवरून त्वरित निष्कासित करण्याचा संपूर्ण कायदेशीर हक्क राहील.
      </p>

      <p class="concluding-declaration">
        सदर या परवान्याचा करारनामा मी स्व:खुशीने अवकल हुशारीने लिहून दिला आहे.
      </p>

      <div class="page1-footer">
        <p>दिनांक : <strong>${agreeDate}</strong></p>
        <p>ठिकाण : <strong>${execPlace}</strong></p>
      </div>

      <div class="doc-page-number">पान क्र. १</div>
    `;
  },

  /**
   * Render Page 2 — स्वाक्षरी, सोबत सूची, शासन निर्णय & स्वयंघोषणापत्र
   */
  renderPage2(data) {
    const tName = this.escapeHtml(data.tenantName) || '_______________________';
    const oName = this.escapeHtml(data.ownerName) || '_______________________';
    const oMobile = this.escapeHtml(data.ownerMobile) || '__________________';

    const tFather = this.escapeHtml(data.tenantFatherName) || '_______________________';
    const tAge = this.escapeHtml(data.tenantAge) || '__';
    const tAadhaar = this.escapeHtml(data.tenantAadhaar) || '____________________';
    const tOcc = this.escapeHtml(data.tenantOccupation) || 'शिक्षण';
    const tAddr = this.escapeHtml(data.tenantAddress) || '__________________________________________________';

    const execPlace = this.escapeHtml(data.executionPlace) || 'पुणे';
    const agreeDate = this.formatDate(data.agreementDate);

    // Photo Box markup
    let photoHtml = '';
    if (data.applicantPhoto) {
      photoHtml = `<img src="${data.applicantPhoto}" alt="Applicant Photo" />`;
    } else {
      photoHtml = `
        <div class="photo-placeholder">
          पासपोर्ट फोटो येथे चिकटवावा
        </div>
      `;
    }

    return `
      <div class="signatures-wrapper">
        <div class="sig-col sig-left">
          <p class="sig-label">सही</p>
          <div class="sig-space"></div>
          <p class="sig-role">(विद्यार्थी)</p>
          <p class="sig-name">नाव : <strong>${tName}</strong></p>
        </div>
        <div class="sig-col sig-right">
          <p class="sig-label">सही</p>
          <div class="sig-space"></div>
          <p class="sig-role">(घरमालक)</p>
          <p class="sig-name">नाव : <strong>${oName}</strong></p>
        </div>
      </div>

      <div class="supporting-docs-section">
        <p class="docs-heading">सोबत-</p>
        <ol class="docs-list">
          <li>घरमालकाचे लाईट बिलाची छायांकित प्रत.</li>
          <li>घरमालकाचे आधार कार्डची छायांकित प्रत,</li>
          <li>घरमालकाचे मोबाईल क्रमांक : <strong>${oMobile}</strong></li>
        </ol>
      </div>

      <div class="govt-heading-section">
        <div class="horizontal-rule"></div>
        <p class="govt-ref-number">शासन निर्णय क्रमांक: प्रसुधा १६१४/३४५/प्र.क्र.७१/१८-अ</p>
        <h2 class="prapatra-title">प्रपत्र-अ</h2>
        <h3 class="declaration-title">स्वयंघोषणापत्र</h3>
      </div>

      <div class="self-decl-container">
        <div class="photo-box-wrapper">
          <div class="photo-box">
            ${photoHtml}
          </div>
          <p class="photo-label">अर्जदाराचा फोटो</p>
        </div>

        <div class="decl-body">
          <p class="decl-text">
            मी <strong>${tName}</strong>, श्री. <strong>${tFather}</strong> यांचा मुलगा/मुलगी वय <strong>${tAge}</strong> वर्ष, आधार क्रमांक (असल्यास) <strong>${tAadhaar}</strong> व्यवसाय: <strong>${tOcc}</strong> राहणार <strong>${tAddr}</strong> याद्वारे घोषित करतो/करते की, वरील सर्व माहिती माझ्या व्यक्तिगत माहिती व समजूतीनुसार खरी आहे.
          </p>

          <p class="decl-text">
            सदर माहिती खोटी आढळून आल्यास, भारतीय दंड संहिता अन्वये आणि / किंवा संबंधित कायद्यानुसार माझ्यावर खटला भरला जाईल व त्यानुसार मी शिक्षेस पात्र राहीन याची मला पूर्ण जाणीव आहे.
          </p>
        </div>
      </div>

      <div class="page2-footer">
        <div class="p2-footer-left">
          <p>ठिकाण : <strong>${execPlace}</strong></p>
          <p style="margin-top: 5px;">दिनांक : <strong>${agreeDate}</strong></p>
        </div>
        <div class="p2-footer-right">
          <div class="sig-space" style="height: 24px;"></div>
          <p><strong>अर्जदाराची सही</strong></p>
          <p style="margin-top: 4px;">अर्जदाराचे नाव : <strong>${tName}</strong></p>
        </div>
      </div>

      <div class="doc-page-number">पान क्र. २</div>
    `;
  },

  /**
   * Render Page 3 — स्वाधार विद्यार्थी प्रतिज्ञापत्र / शपथपत्र
   * Official Swadhar Scheme Student Affidavit format
   */
  renderPage3(data) {
    const tName = this.escapeHtml(data.tenantName) || '_______________________';
    const tFather = this.escapeHtml(data.tenantFatherName) || '_______________________';
    const tAge = this.escapeHtml(data.tenantAge) || '__';
    const tAddr = this.escapeHtml(data.tenantAddress) || '__________________________________________________';
    const college = this.escapeHtml(data.tenantCollege) || '_____________________________________________';
    const course = this.escapeHtml(data.tenantCourse) || '____________________';
    const acadYear = this.escapeHtml(data.academicYear) || '२०२६-२०२७';
    const propFull = this.escapeHtml([data.propertyAddress, data.propertyCity].filter(Boolean).join(', ')) || '_____________________________________________';
    const tAadhaar = this.escapeHtml(data.tenantAadhaar) || '____________________';
    const tOcc = this.escapeHtml(data.tenantOccupation) || 'शिक्षण / विद्यार्थी';
    const execPlace = this.escapeHtml(data.executionPlace) || 'पुणे';
    const agreeDate = this.formatDate(data.agreementDate);

    // Photo Box markup
    let photoHtml = '';
    if (data.applicantPhoto) {
      photoHtml = `<img src="${data.applicantPhoto}" alt="Applicant Photo" />`;
    } else {
      photoHtml = `
        <div class="photo-placeholder">
          पासपोर्ट फोटो येथे चिकटवावा
        </div>
      `;
    }

    return `
      <div class="swadhar-document-content">
        <!-- TOP SECTION: प्रतिज्ञापत्र / शपथपत्र -->
        <div class="swadhar-top-section">
          <h2 class="swadhar-main-title">अर्जदाराचे प्रतिज्ञापत्र / शपथपत्र</h2>

          <div class="swadhar-to-block">
            <p>प्रति,</p>
            <p>मा.सहायक संचालक</p>
            <p>इतर मागास बहुजन कल्याण,पुणे</p>
          </div>

          <p class="swadhar-salutation">महोदय,</p>

          <p class="swadhar-body-text">
            मी लिहून देणार <strong>${tName}</strong> वय: <strong>${tAge}</strong> वर्षे, मूळ राहणार <strong>${tAddr}</strong> सत्य प्रतिज्ञापत्र कथन करितो/करीते की, मी वरील ठिकाणी कायमस्वरूपी रहिवासी आहे. मी <strong>${college}</strong> येथे <strong>${course}</strong> या अभ्यासक्रमाकरिता <strong>${acadYear}</strong> या वर्षात शिक्षण घेत असून मी सध्या <strong>${propFull}</strong> शिक्षणाकरिता येथे राहत आहे. तथापि सदरच्या शपथपत्रान्वये मी खालीलप्रमाणे लिहून देतो/देते की,
          </p>

          <ol class="swadhar-clauses">
            <li>१) मी कोणत्याही शासकीय वसतिगृहात राहत नाही व वसतिगृह संदर्भात कोणतीही सवलत घेतलेली नाही.</li>
            <li>२) मी पुणे येथील स्थानिक रहिवासी नाही.</li>
            <li>३) मी कोणतीही नोकरी व व्यवसाय करत नाही.</li>
            <li>४) मी माझे आई वडील व कुटुंबासोबत राहत नाही.</li>
          </ol>

          <p class="swadhar-penal-text">
            शपथपत्रातील सर्व मजकूर खरा व बरोबर आहे. सदरील माहिती खोटी आढळून आल्यास तर मी भा.द.वि.क. १९३ (२), १९९ व २०० प्रमाणे होणाऱ्या शिक्षेस पात्र राहील.
          </p>

          <div class="swadhar-sig-row">
            <div class="swadhar-sig-left">
              <p>ठिकाण: <strong>${execPlace}</strong></p>
              <p style="margin-top: 6px;">दिनांक: <strong>${agreeDate}</strong></p>
            </div>
            <div class="swadhar-sig-right">
              <p>अर्जदाराची सही <span>____________________</span></p>
              <p style="margin-top: 6px;">अर्जदाराचे नाव: <strong>${tName}</strong></p>
            </div>
          </div>
        </div>

        <!-- BOTTOM SECTION: शासन निर्णय प्रपत्र-अ स्वयंघोषणापत्र -->
        <div class="swadhar-bottom-section">
          <div class="swadhar-govt-header">
            <div class="swadhar-rule-with-title">
              <span class="rule-line"></span>
              <span class="govt-ref-number">शासन निर्णय क्रमांक: प्रसुधा १६१४/३४५/प्र.क्र.७१/१८-अ</span>
              <span class="rule-line"></span>
            </div>
            <h3 class="prapatra-title">प्रपत्र-अ</h3>
            <h4 class="declaration-title">स्वयंघोषणापत्र</h4>
          </div>

          <div class="swadhar-decl-container">
            <div class="swadhar-decl-body">
              <p class="decl-text">
                मी <strong>${tName}</strong>, श्री. <strong>${tFather}</strong> यांचा मुलगा/मुलगी वय <strong>${tAge}</strong> वर्ष, आधार क्रमांक (असल्यास) <strong>${tAadhaar}</strong> व्यवसाय: <strong>${tOcc}</strong> राहणार <strong>${tAddr}</strong> याद्वारे घोषित करतो / करते की, वरील सर्व माहिती माझ्या व्यक्तीगत माहिती व समजुतीनुसार खरी आहे. सदर माहिती खोटी आढळून आल्यास, भारतीय दंड संहिता अन्वये आणि / किंवा संबंधित कायदयानूसार माझ्यावर खटला भरला जाईल व त्यानुसार मी शिक्षेस पात्र राहीन याची मला पूर्ण जाणीव आहे.
              </p>
            </div>

            <div class="photo-box-wrapper">
              <div class="photo-box">
                ${photoHtml}
              </div>
              <p class="photo-label">अर्जदाराचा फोटो</p>
            </div>
          </div>

          <div class="swadhar-sig-row" style="margin-top: 10px;">
            <div class="swadhar-sig-left">
              <p>ठिकाण: <strong>${execPlace}</strong></p>
              <p style="margin-top: 6px;">दिनांक: <strong>${agreeDate}</strong></p>
            </div>
            <div class="swadhar-sig-right">
              <p>अर्जदाराची सही <span>____________________</span></p>
              <p style="margin-top: 6px;">अर्जदाराचे नाव: <strong>${tName}</strong></p>
            </div>
          </div>
        </div>
      </div>

      <div class="doc-page-number">पान क्र. ३</div>
    `;
  }
};

/* ==========================================================================
   AFFIDAVIT LOCALSTORAGE STORE
   ========================================================================== */
const AffidavitStore = {
  STORAGE_KEY: 'onpoint_bhade_affidavits_v1',

  getAll() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) {
        return this.seedDemoData();
      }
      return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to load affidavits:', e);
      return [];
    }
  },

  getById(id) {
    const list = this.getAll();
    return list.find(item => item.id === id) || null;
  },

  save(data) {
    const list = this.getAll();
    const now = new Date();
    let savedRecord = null;

    if (data.id) {
      // Update existing
      const index = list.findIndex(item => item.id === data.id);
      if (index !== -1) {
        list[index] = {
          ...data,
          updatedAt: now.toISOString()
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
        savedRecord = list[index];
      }
    }

    if (!savedRecord) {
      // Create new
      const newRecord = {
        ...data,
        id: data.id || ('AFF-' + Date.now().toString(36).toUpperCase()),
        createdAt: data.createdAt || now.toISOString(),
        updatedAt: now.toISOString()
      };
      list.unshift(newRecord);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
      savedRecord = newRecord;
    }

    // Asynchronously sync to Cloud Firebase if configured
    if (window.CloudDB && typeof window.CloudDB.saveRecord === 'function') {
      window.CloudDB.saveRecord(savedRecord).catch(err => {
        console.warn('Background cloud sync error:', err);
      });
    }

    return savedRecord;
  },

  delete(id) {
    let list = this.getAll();
    const initialLen = list.length;
    list = list.filter(item => item.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));

    // Asynchronously delete from Cloud Firebase if configured
    if (window.CloudDB && typeof window.CloudDB.deleteRecord === 'function') {
      window.CloudDB.deleteRecord(id).catch(err => {
        console.warn('Background cloud delete error:', err);
      });
    }

    return list.length < initialLen;
  },

  mergeCloudRecords(cloudRecords) {
    if (!Array.isArray(cloudRecords)) return;
    const local = this.getAll();
    const map = new Map();

    // Add local records to map
    local.forEach(item => {
      if (item && item.id) map.set(item.id, item);
    });

    // Merge cloud records (prefer whichever has newer updatedAt)
    cloudRecords.forEach(cloudItem => {
      if (!cloudItem || !cloudItem.id) return;
      const localItem = map.get(cloudItem.id);
      if (!localItem) {
        map.set(cloudItem.id, cloudItem);
      } else {
        const localTime = new Date(localItem.updatedAt || 0).getTime();
        const cloudTime = new Date(cloudItem.updatedAt || 0).getTime();
        if (cloudTime >= localTime) {
          map.set(cloudItem.id, cloudItem);
        }
      }
    });

    const merged = Array.from(map.values()).sort((a, b) => {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(merged));
    return merged;
  },

  seedDemoData() {
    const demoRecords = [
      {
        id: 'AFF-DEMO001',
        createdAt: '2026-10-25T10:30:00.000Z',
        tenantName: 'सौरभ अजिनाथ खरात',
        tenantAge: '२१',
        tenantFatherName: 'अजिनाथ खरात',
        tenantOccupation: 'विद्यार्थी / शिक्षण',
        tenantAadhaar: '७८९० १२३४ ५६७८',
        tenantAddress: 'मु. पो. चकोरे, ता. परांडा, जि. धाराशिव',
        tenantCollege: 'झील कॉलेज ऑफ इंजिनिअरिंग ॲण्ड रिसर्च, नऱ्हे, पुणे',
        tenantCourse: 'बी.टेक (रोबोटिक्स ॲण्ड ऑटोमेशन)',
        ownerName: 'सोमनाथ बबनराव सावंत',
        ownerAge: '४८',
        ownerOccupation: 'व्यवसाय',
        ownerAddress: 'फ्लॅट नं. ४०२, समर्थ रेसिडेन्सी, नऱ्हे, पुणे - ४११०४१',
        ownerMobile: '९८२२३३४४५५',
        academicYear: '२०२६-२०२७',
        propertyAddress: 'फ्लॅट नं. ४०२, समर्थ रेसिडेन्सी, नऱ्हे',
        propertyCity: 'पुणे',
        surveyNo: '४५/२',
        roomNo: '४०२',
        propertyArea: '५५० चौ. फूट',
        propertyConstruction: 'आर.सी.सी. बांधकाम',
        monthlyRent: '३५००',
        rentInWords: 'तीन हजार पाचशे',
        rentPaymentDay: '१०',
        rentStartDate: '2026-07-01',
        rentEndDate: '2027-05-31',
        rentDurationMonths: '११',
        agreementDate: '2026-07-01',
        executionPlace: 'पुणे',
        applicantPhoto: '',
        includeSwadhar: true
      },
      {
        id: 'AFF-DEMO002',
        createdAt: '2026-10-27T14:15:00.000Z',
        tenantName: 'तन्मय संजू पाटोळे',
        tenantAge: '१८',
        tenantFatherName: 'संजू सखाराम पाटोळे',
        tenantOccupation: 'विद्यार्थी',
        tenantAadhaar: '२१०० ४०३२ ००६६',
        tenantAddress: 'खोपोली, ता. खालापूर, जि. रायगड',
        tenantCollege: 'झील कॉलेज ऑफ इंजिनिअरिंग, नऱ्हे, पुणे',
        tenantCourse: 'बी.टेक (प्रथम वर्ष)',
        ownerName: 'रमेश पांडुरंग शिंदे',
        ownerAge: '५२',
        ownerOccupation: 'नोकरी',
        ownerAddress: 'घर नं. १२, शिवतीर्थ कॉलनी, कात्रज, पुणे - ४११०४६',
        ownerMobile: '९४०३८०६५१०',
        academicYear: '२०२६-२०२७',
        propertyAddress: 'खोली नं. २, शिवतीर्थ कॉलनी, कात्रज',
        propertyCity: 'पुणे',
        surveyNo: '३२/१',
        roomNo: '२',
        propertyArea: '२०० चौ. फूट',
        propertyConstruction: 'पक्के बांधकाम',
        monthlyRent: '३०००',
        rentInWords: 'तीन हजार',
        rentPaymentDay: '०५',
        rentStartDate: '2026-08-01',
        rentEndDate: '2027-06-30',
        rentDurationMonths: '११',
        agreementDate: '2026-08-01',
        executionPlace: 'पुणे',
        applicantPhoto: '',
        includeSwadhar: false
      }
    ];

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(demoRecords));
    return demoRecords;
  }
};

window.MarathiNumberWords = MarathiNumberWords;
window.AffidavitTemplate = AffidavitTemplate;
window.AffidavitStore = AffidavitStore;
