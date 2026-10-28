/**
 * ONPOINT SERVICES — BHADE PAVATI PDF GENERATOR
 * Generates an exact two-page A4 PDF matching the reference images
 * Uses html2canvas for 100% accurate Marathi Devanagari rendering + jsPDF
 */

const PDFGenerator = {
  /**
   * Generates a 2-page or 3-page A4 PDF from the rendered preview elements
   * @param {string} filename Optional custom filename
   * @param {HTMLElement} page1Elem Element for page 1
   * @param {HTMLElement} page2Elem Element for page 2
   * @param {HTMLElement} page3Elem Optional element for page 3 (Swadhar Student Affidavit)
   */
  async generatePDF(filename = 'Bhade_Chitthi_Kararnama.pdf', page1Elem = null, page2Elem = null, page3Elem = null) {
    const p1 = page1Elem || document.getElementById('previewPage1');
    const p2 = page2Elem || document.getElementById('previewPage2');
    const p3 = page3Elem !== undefined && page3Elem !== null ? page3Elem : document.getElementById('previewPage3');

    if (!p1 || !p2) {
      alert('दस्तऐवज पाने सापडली नाहीत (Document pages not found)');
      return;
    }

    // Show loading toast or indicator
    if (window.showToast) {
      window.showToast('PDF तयार होत आहे... कृपया वाट पाहा (Generating PDF...)', 'info');
    }

    try {
      const { jsPDF } = window.jspdf;
      // Standard A4 in mm: 210 x 297
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const a4Width = 210;
      const a4Height = 297;

      // Ensure all custom fonts (Devanagari Aparajita) are fully loaded before rendering
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      // Render Page 1 with html2canvas
      const canvas1 = await html2canvas(p1, {
        scale: 2.5, // High DPI for crisp Devanagari text
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      const imgData1 = canvas1.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgData1, 'JPEG', 0, 0, a4Width, a4Height);

      // Render Page 2 with html2canvas
      pdf.addPage('a4', 'portrait');
      const canvas2 = await html2canvas(p2, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      const imgData2 = canvas2.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgData2, 'JPEG', 0, 0, a4Width, a4Height);

      // Render Page 3 if provided and active
      const hasPage3 = p3 && p3.style.display !== 'none' && p3.innerHTML && p3.innerHTML.trim() !== '';
      if (hasPage3) {
        pdf.addPage('a4', 'portrait');
        const canvas3 = await html2canvas(p3, {
          scale: 2.5,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });
        const imgData3 = canvas3.toDataURL('image/jpeg', 0.95);
        pdf.addImage(imgData3, 'JPEG', 0, 0, a4Width, a4Height);
      }

      // Save PDF
      pdf.save(filename);

      if (window.showToast) {
        window.showToast('✓ PDF यशस्वीरित्या डाउनलोड झाली! (PDF downloaded successfully)', 'success');
      }
    } catch (err) {
      console.error('PDF Generation Error:', err);
      alert('PDF तयार करताना त्रुटी आली: ' + err.message);
      if (window.showToast) {
        window.showToast('PDF त्रुटी: ' + err.message, 'error');
      }
    }
  },

  /**
   * Backward-compatible alias for 2-page or 3-page PDF generation
   */
  async generate2PagePDF(filename = 'Bhade_Chitthi_Kararnama.pdf', page1Elem = null, page2Elem = null, page3Elem = null) {
    return this.generatePDF(filename, page1Elem, page2Elem, page3Elem);
  },

  /**
   * Helper to generate PDF directly from a saved record object (e.g. from Dashboard table)
   * @param {Object} record Record object from localStorage
   */
  async generateFromRecord(record) {
    if (!record) return;

    // Create an offscreen temporary render container
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.zIndex = '-1000';
    tempContainer.style.background = '#ffffff';

    const p1 = document.createElement('div');
    p1.className = 'a4-page page-1';
    p1.innerHTML = AffidavitTemplate.renderPage1(record);

    const p2 = document.createElement('div');
    p2.className = 'a4-page page-2';
    p2.innerHTML = AffidavitTemplate.renderPage2(record);

    tempContainer.appendChild(p1);
    tempContainer.appendChild(p2);

    let p3 = null;
    if (record.includeSwadhar) {
      p3 = document.createElement('div');
      p3.className = 'a4-page page-3';
      p3.style.display = 'flex';
      p3.innerHTML = AffidavitTemplate.renderPage3(record);
      tempContainer.appendChild(p3);
    }

    document.body.appendChild(tempContainer);

    const safeName = (record.tenantName || 'Affidavit').replace(/[^a-zA-Z0-9_\u0900-\u097F]/g, '_');
    const filename = `Bhade_Chitthi_${safeName}_${record.id || 'doc'}.pdf`;

    try {
      await this.generatePDF(filename, p1, p2, p3);
    } finally {
      document.body.removeChild(tempContainer);
    }
  },

  /**
   * Native browser print with high fidelity vector styling
   */
  print() {
    window.print();
  }
};

window.PDFGenerator = PDFGenerator;
