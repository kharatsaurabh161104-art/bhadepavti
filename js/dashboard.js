/**
 * ONPOINT SERVICES — DASHBOARD CONTROLLER
 * Manages search, date filtering, records table, view modal, and actions
 */

document.addEventListener('DOMContentLoaded', () => {
  // Ensure authentication
  if (window.Auth) {
    window.Auth.protectRoute();
  }

  // Populate sidebar user data
  const currentUser = window.Auth ? window.Auth.getUser() : null;
  if (currentUser) {
    const userNameEl = document.querySelector('.user-name');
    const userRoleEl = document.querySelector('.user-role');
    const userAvatarEl = document.querySelector('.user-avatar');
    if (userNameEl) userNameEl.textContent = currentUser.name || currentUser.username;
    if (userRoleEl) userRoleEl.textContent = currentUser.role || 'प्रशासक (Admin)';
    if (userAvatarEl && currentUser.username) {
      userAvatarEl.textContent = currentUser.username.replace('@', '').slice(0, 2).toUpperCase();
    }
  }

  // State
  let allRecords = [];
  let filteredRecords = [];
  let pendingDeleteId = null;

  // DOM Elements
  const totalCountEl = document.getElementById('totalAffidavitsCount');
  const monthCountEl = document.getElementById('monthAffidavitsCount');
  const searchInput = document.getElementById('searchInput');
  const fromDateInput = document.getElementById('fromDateInput');
  const toDateInput = document.getElementById('toDateInput');
  const clearFiltersBtn = document.getElementById('clearFiltersBtn');
  const tableBody = document.getElementById('recordsTableBody');
  const emptyState = document.getElementById('emptyState');

  // Modal Elements
  const viewModal = document.getElementById('viewModal');
  const closeViewModal = document.getElementById('closeViewModal');
  const modalPage1 = document.getElementById('modalPage1');
  const modalPage2 = document.getElementById('modalPage2');
  const modalPage3 = document.getElementById('modalPage3');
  const modalDownloadPdf = document.getElementById('modalDownloadPdf');
  const modalPrintBtn = document.getElementById('modalPrintBtn');
  let currentViewingRecord = null;

  // Delete Confirmation Modal Elements
  const deleteModal = document.getElementById('deleteModal');
  const closeDeleteModal = document.getElementById('closeDeleteModal');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  const deleteTargetName = document.getElementById('deleteTargetName');

  // Load and initial render
  async function loadData() {
    allRecords = window.AffidavitStore.getAll();
    applyFilters();
    updateStats();

    // Fetch latest from SQLite Database Server
    if (window.AffidavitStore && typeof window.AffidavitStore.fetchAll === 'function') {
      try {
        const fresh = await window.AffidavitStore.fetchAll();
        if (Array.isArray(fresh)) {
          allRecords = fresh;
          applyFilters();
          updateStats();
          if (typeof updateDbUI === 'function') {
            updateDbUI();
          }
        }
      } catch (err) {
        console.warn('Backend database sync notice:', err);
      }
    }
  }

  function updateStats() {
    if (totalCountEl) {
      totalCountEl.textContent = allRecords.length;
    }
    if (monthCountEl) {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      const thisMonthCount = allRecords.filter(r => {
        const d = new Date(r.createdAt || r.agreementDate);
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      }).length;

      monthCountEl.textContent = thisMonthCount;
    }
  }

  function applyFilters() {
    const q = (searchInput.value || '').trim().toLowerCase();
    const from = fromDateInput.value;
    const to = toDateInput.value;

    filteredRecords = allRecords.filter(item => {
      // Search text match (owner or tenant)
      const tName = (item.tenantName || '').toLowerCase();
      const oName = (item.ownerName || '').toLowerCase();
      const matchText = !q || tName.includes(q) || oName.includes(q);

      // Date range match (on agreementDate or createdAt)
      const recDateStr = item.agreementDate || (item.createdAt ? item.createdAt.slice(0, 10) : '');
      let matchDate = true;

      if (from && recDateStr && recDateStr < from) {
        matchDate = false;
      }
      if (to && recDateStr && recDateStr > to) {
        matchDate = false;
      }

      return matchText && matchDate;
    });

    renderTable();
  }

  function renderTable() {
    tableBody.innerHTML = '';

    if (filteredRecords.length === 0) {
      tableBody.style.display = 'none';
      emptyState.style.display = 'block';
      return;
    }

    tableBody.style.display = '';
    emptyState.style.display = 'none';

    filteredRecords.forEach((record, index) => {
      const tr = document.createElement('tr');

      // Date formatting
      const dateDisplay = window.AffidavitTemplate.formatDate(record.agreementDate);

      tr.innerHTML = `
        <td style="font-weight: 600; color: #64748b; width: 60px;">${index + 1}</td>
        <td style="white-space: nowrap;">${dateDisplay}</td>
        <td>
          <div class="party-cell">
            <span class="party-name">${window.AffidavitTemplate.escapeHtml(record.ownerName)}</span>
            <span class="party-sub">${window.AffidavitTemplate.escapeHtml(record.ownerMobile || '')}</span>
          </div>
        </td>
        <td>
          <div class="party-cell">
            <span class="party-name">${window.AffidavitTemplate.escapeHtml(record.tenantName)}</span>
            <span class="party-sub">${window.AffidavitTemplate.escapeHtml(record.tenantCollege || '')}</span>
          </div>
        </td>
        <td style="width: 170px;">
          <div class="action-btns">
            <button class="btn-icon view" title="दस्तऐवज पाहा (View)" data-id="${record.id}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
            <button class="btn-icon download" title="PDF डाउनलोड करा (Download PDF)" data-id="${record.id}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </button>
            <button class="btn-icon edit" title="बदल करा (Edit)" data-id="${record.id}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="btn-icon delete" title="हटवा (Delete)" data-id="${record.id}" data-name="${window.AffidavitTemplate.escapeHtml(record.tenantName)}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </td>
      `;

      tableBody.appendChild(tr);
    });

    // Attach row button events
    tableBody.querySelectorAll('.btn-icon.view').forEach(btn => {
      btn.addEventListener('click', () => openViewModal(btn.dataset.id));
    });

    tableBody.querySelectorAll('.btn-icon.download').forEach(btn => {
      btn.addEventListener('click', () => handleDownload(btn.dataset.id));
    });

    tableBody.querySelectorAll('.btn-icon.edit').forEach(btn => {
      btn.addEventListener('click', () => {
        window.location.href = `create-affidavit.html?id=${btn.dataset.id}`;
      });
    });

    tableBody.querySelectorAll('.btn-icon.delete').forEach(btn => {
      btn.addEventListener('click', () => openDeleteModal(btn.dataset.id, btn.dataset.name));
    });
  }

  // View Modal
  function openViewModal(id) {
    const record = window.AffidavitStore.getById(id);
    if (!record) return;

    currentViewingRecord = record;
    modalPage1.innerHTML = window.AffidavitTemplate.renderPage1(record);
    modalPage2.innerHTML = window.AffidavitTemplate.renderPage2(record);
    if (modalPage3) {
      if (record.includeSwadhar) {
        modalPage3.innerHTML = window.AffidavitTemplate.renderPage3(record);
        modalPage3.style.display = 'flex';
      } else {
        modalPage3.innerHTML = '';
        modalPage3.style.display = 'none';
      }
    }
    viewModal.classList.add('show');
  }

  function closeView() {
    viewModal.classList.remove('show');
    currentViewingRecord = null;
  }

  if (closeViewModal) {
    closeViewModal.addEventListener('click', closeView);
  }

  if (modalDownloadPdf) {
    modalDownloadPdf.addEventListener('click', async () => {
      if (!currentViewingRecord) return;
      const safeName = (currentViewingRecord.tenantName || 'Affidavit').replace(/[^a-zA-Z0-9_\u0900-\u097F]/g, '_');
      await window.PDFGenerator.generatePDF(
        `Bhade_Chitthi_${safeName}.pdf`,
        modalPage1,
        modalPage2,
        currentViewingRecord.includeSwadhar ? modalPage3 : null
      );
    });
  }

  if (modalPrintBtn) {
    modalPrintBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Delete Modal
  function openDeleteModal(id, name) {
    pendingDeleteId = id;
    if (deleteTargetName) {
      deleteTargetName.textContent = name || 'सदर भाडे पत्र (this affidavit)';
    }
    deleteModal.classList.add('show');
  }

  function closeDelete() {
    deleteModal.classList.remove('show');
    pendingDeleteId = null;
  }

  if (closeDeleteModal) closeDeleteModal.addEventListener('click', closeDelete);
  if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', closeDelete);

  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', () => {
      if (!pendingDeleteId) return;
      const success = window.AffidavitStore.delete(pendingDeleteId);
      closeDelete();
      if (success) {
        showToast('✓ भाडे करारनामा यशस्वीरित्या हटवला गेला (Record deleted)', 'success');
        loadData();
      } else {
        showToast('हटवण्यात अयशस्वी! (Delete failed)', 'error');
      }
    });
  }

  // Direct Download Handler
  async function handleDownload(id) {
    let record = window.AffidavitStore.getById(id);
    if (!record && window.AffidavitStore.getByIdAsync) {
      record = await window.AffidavitStore.getByIdAsync(id);
    }
    if (!record) {
      alert('दस्तऐवज सापडला नाही (Record not found)');
      return;
    }
    await window.PDFGenerator.generateFromRecord(record);
  }

  // Search & Filter Listeners
  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }
  if (fromDateInput) {
    fromDateInput.addEventListener('change', applyFilters);
  }
  if (toDateInput) {
    toDateInput.addEventListener('change', applyFilters);
  }
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
      searchInput.value = '';
      fromDateInput.value = '';
      toDateInput.value = '';
      applyFilters();
    });
  }

  // ==========================================================================
  // SQLITE DATABASE MANAGEMENT CONTROLLER
  // ==========================================================================
  const dbManageBtn = document.getElementById('dbManageBtn');
  const dbModal = document.getElementById('dbModal');
  const closeDbModal = document.getElementById('closeDbModal');
  const closeDbModalBtn = document.getElementById('closeDbModalBtn');
  const dbStatusDot = document.getElementById('dbStatusDot');
  const dbStatusText = document.getElementById('dbStatusText');
  const dbStatusBanner = document.getElementById('dbStatusBanner');
  const dbBannerDot = document.getElementById('dbBannerDot');
  const dbBannerTitle = document.getElementById('dbBannerTitle');
  const dbBannerDesc = document.getElementById('dbBannerDesc');
  const dbTotalRecordsVal = document.getElementById('dbTotalRecordsVal');
  const dbMonthRecordsVal = document.getElementById('dbMonthRecordsVal');
  const dbUsersVal = document.getElementById('dbUsersVal');
  const dbEngineVal = document.getElementById('dbEngineVal');
  const downloadDbBackupBtn = document.getElementById('downloadDbBackupBtn');
  const refreshDbBtn = document.getElementById('refreshDbBtn');
  const restoreDbBtn = document.getElementById('restoreDbBtn');
  const dbRestoreFileInput = document.getElementById('dbRestoreFileInput');
  const dbFeedbackMsg = document.getElementById('dbFeedbackMsg');

  function updateDbUI() {
    const isConn = window.AppDB && window.AppDB.isServerConnected;
    const stats = window.AppDB ? window.AppDB.cachedStats : null;
    const engine = (window.AppDB && window.AppDB.serverEngine) || 'sqlite';

    // Navbar Badge
    if (dbStatusDot && dbStatusText) {
      if (isConn) {
        dbStatusDot.className = 'status-dot dot-online';
        dbStatusText.textContent = `${engine.toUpperCase()} डेटाबेस`;
      } else {
        dbStatusDot.className = 'status-dot dot-offline';
        dbStatusText.textContent = 'लोकल मोड (Offline)';
      }
    }

    // Modal Status Banner
    if (dbStatusBanner) {
      if (isConn) {
        dbStatusBanner.className = 'cloud-status-banner banner-connected';
        if (dbBannerDot) dbBannerDot.className = 'status-dot dot-online';
        if (dbBannerTitle) dbBannerTitle.textContent = `${engine.toUpperCase()} डेटाबेस सक्रिय (Active & Connected)`;
        if (dbBannerDesc) {
          dbBannerDesc.innerHTML = `सर्व डेटाबेस रेकॉर्ड्स <code>data/bhadepavti.db</code> मध्ये कायमस्वरूपी सुरक्षित आहेत. तुम्ही कधीही एडिट किंवा पीडीएफ डाउनलोड करू शकता.`;
        }
      } else {
        dbStatusBanner.className = 'cloud-status-banner banner-local';
        if (dbBannerDot) dbBannerDot.className = 'status-dot dot-offline';
        if (dbBannerTitle) dbBannerTitle.textContent = 'लोकल ब्राऊझर मोड (Local Cache Mode)';
        if (dbBannerDesc) {
          dbBannerDesc.textContent = 'डेटा सध्या ब्राऊझर लोकल स्टोरेजमध्ये सुरक्षित आहे. सर्व्हर सुरू केल्यास (node server.js) ऑटोमॅटिक सिंक होईल.';
        }
      }
    }

    // Modal Stats Numbers
    if (dbTotalRecordsVal) dbTotalRecordsVal.textContent = allRecords.length;
    if (dbMonthRecordsVal && monthCountEl) dbMonthRecordsVal.textContent = monthCountEl.textContent;
    if (dbUsersVal) dbUsersVal.textContent = (stats && stats.totalUsers) ? stats.totalUsers : '१';
    if (dbEngineVal) dbEngineVal.textContent = isConn ? engine.toUpperCase() : 'लोकल';
  }

  function showDbFeedback(msg, isSuccess = true) {
    if (!dbFeedbackMsg) return;
    dbFeedbackMsg.style.display = 'block';
    dbFeedbackMsg.style.background = isSuccess ? '#ecfdf5' : '#fef2f2';
    dbFeedbackMsg.style.color = isSuccess ? '#065f46' : '#b91c1c';
    dbFeedbackMsg.style.border = isSuccess ? '1px solid #a7f3d0' : '1px solid #fecaca';
    dbFeedbackMsg.textContent = msg;
  }

  function openDbModal() {
    if (dbModal) {
      dbModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (dbFeedbackMsg) dbFeedbackMsg.style.display = 'none';
      if (window.AppDB) {
        window.AppDB.checkConnection().then(() => updateDbUI());
      } else {
        updateDbUI();
      }
    }
  }

  function closeDbModalFn() {
    if (dbModal) {
      dbModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (dbManageBtn) dbManageBtn.addEventListener('click', openDbModal);
  if (closeDbModal) closeDbModal.addEventListener('click', closeDbModalFn);
  if (closeDbModalBtn) closeDbModalBtn.addEventListener('click', closeDbModalFn);

  // Backup Download Button
  if (downloadDbBackupBtn) {
    downloadDbBackupBtn.addEventListener('click', async () => {
      try {
        if (window.AppDB) {
          await window.AppDB.exportBackup();
          showDbFeedback('✓ डेटाबेस बॅकअप यशस्वीरित्या डाउनलोड झाला!', true);
          window.showToast('✓ डेटाबेस बॅकअप डाऊनलोड झाला!', 'success');
        }
      } catch (err) {
        showDbFeedback('बॅकअप डाऊनलोड त्रुटी: ' + err.message, false);
      }
    });
  }

  // Refresh DB Button
  if (refreshDbBtn) {
    refreshDbBtn.addEventListener('click', async () => {
      try {
        refreshDbBtn.disabled = true;
        refreshDbBtn.textContent = 'लोड करत आहे...';
        await loadData();
        showDbFeedback('✓ डेटाबेसमधून सर्व रेकॉर्ड्स रिफ्रेश झाले!', true);
        window.showToast('✓ डेटाबेस री-सिंक झाला!', 'success');
      } catch (err) {
        showDbFeedback('री-सिंक त्रुटी: ' + err.message, false);
      } finally {
        refreshDbBtn.disabled = false;
        refreshDbBtn.textContent = 'री-सिंक करा';
      }
    });
  }

  // Restore DB File
  if (restoreDbBtn && dbRestoreFileInput) {
    restoreDbBtn.addEventListener('click', () => {
      dbRestoreFileInput.value = '';
      dbRestoreFileInput.click();
    });

    dbRestoreFileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        restoreDbBtn.disabled = true;
        restoreDbBtn.textContent = 'इम्पोर्ट करत आहे...';
        const text = await file.text();
        const json = JSON.parse(text);

        if (window.AppDB) {
          const res = await window.AppDB.importBackup(json);
          showDbFeedback(`✓ यशस्वी! एकूण ${res.importedCount || 'सर्व'} भाडे करारनामे डेटाबेसमध्ये रिस्टोअर झाले.`, true);
          window.showToast(`✓ ${res.importedCount || 'सर्व'} रेकॉर्ड्स रिस्टोअर झाले!`, 'success');
          await loadData();
        }
      } catch (err) {
        showDbFeedback('रिस्टोअर त्रुटी: ' + err.message, false);
        window.showToast('रिस्टोअर अयशस्वी: ' + err.message, 'error');
      } finally {
        restoreDbBtn.disabled = false;
        restoreDbBtn.textContent = 'फाईल निवडा';
      }
    });
  }

  if (window.AppDB) {
    window.AppDB.onStatusChange(() => updateDbUI());
  }

  // ==========================================
  // CLOUD DATABASE (FIREBASE FIRESTORE) CONTROLLER
  // ==========================================
  const cloudSyncBtn = document.getElementById('cloudSyncBtn');
  const cloudModal = document.getElementById('cloudModal');
  const closeCloudModal = document.getElementById('closeCloudModal');
  const cloudStatusDot = document.getElementById('cloudStatusDot');
  const cloudStatusText = document.getElementById('cloudStatusText');
  const cloudStatusBanner = document.getElementById('cloudStatusBanner');
  const cloudBannerDot = document.getElementById('cloudBannerDot');
  const cloudBannerTitle = document.getElementById('cloudBannerTitle');
  const cloudBannerDesc = document.getElementById('cloudBannerDesc');
  const firebaseConfigInput = document.getElementById('firebaseConfigInput');
  const saveCloudConfigBtn = document.getElementById('saveCloudConfigBtn');
  const disconnectCloudBtn = document.getElementById('disconnectCloudBtn');
  const uploadLocalBtn = document.getElementById('uploadLocalBtn');
  const cloudFeedbackMsg = document.getElementById('cloudFeedbackMsg');

  function updateCloudUI() {
    const isConfigured = window.CloudDB && window.CloudDB.isConfigured();
    const isOnline = window.CloudDB && window.CloudDB.isInitialized;

    if (cloudStatusDot && cloudStatusText) {
      if (isOnline) {
        cloudStatusDot.className = 'status-dot dot-online';
        cloudStatusText.textContent = 'क्लाउड सिंक सुरू (Online)';
      } else if (isConfigured) {
        cloudStatusDot.className = 'status-dot dot-offline';
        cloudStatusText.textContent = 'कनेक्ट करत आहे...';
      } else {
        cloudStatusDot.className = 'status-dot dot-offline';
        cloudStatusText.textContent = 'लोकल मोड (Offline)';
      }
    }

    if (cloudStatusBanner) {
      if (isOnline) {
        cloudStatusBanner.className = 'cloud-status-banner banner-connected';
        if (cloudBannerDot) cloudBannerDot.className = 'status-dot dot-online';
        if (cloudBannerTitle) cloudBannerTitle.textContent = 'क्लाउड कनेक्टेड (Firebase Firestore Active)';
        if (cloudBannerDesc) cloudBannerDesc.textContent = 'डेटा सुरक्षितपणे Google Firebase Firestore वर रिअल-टाइम सिंक होत आहे.';
        if (disconnectCloudBtn) disconnectCloudBtn.style.display = 'inline-block';
        if (uploadLocalBtn) uploadLocalBtn.style.display = 'inline-block';
      } else {
        cloudStatusBanner.className = 'cloud-status-banner banner-local';
        if (cloudBannerDot) cloudBannerDot.className = 'status-dot dot-offline';
        if (cloudBannerTitle) cloudBannerTitle.textContent = 'लोकल स्टोरेज मोड (Local Storage Mode)';
        if (cloudBannerDesc) cloudBannerDesc.textContent = 'डेटा सध्या तुमच्या ब्राऊझरमध्ये स्थानिक पातळीवर सुरक्षित आहे. इतर डिव्हाइसेसवर डेटा सिंक करण्यासाठी खाली मोफत Firebase जोडा.';
        if (disconnectCloudBtn) disconnectCloudBtn.style.display = 'none';
        if (uploadLocalBtn) uploadLocalBtn.style.display = 'none';
      }
    }
  }

  function parseConfigInput(raw) {
    if (!raw || !raw.trim()) return null;
    let text = raw.trim();

    // If pasted JS like: const firebaseConfig = { ... };
    if (text.includes('{') && text.includes('}')) {
      const startIndex = text.indexOf('{');
      const endIndex = text.lastIndexOf('}');
      text = text.substring(startIndex, endIndex + 1);
    }

    // Try JSON.parse
    try {
      return JSON.parse(text);
    } catch (e) {
      // Fallback for JS object syntax (keys not quoted)
      try {
        const fn = new Function('return ' + text);
        return fn();
      } catch (err) {
        throw new Error('अवैध कॉन्फिग फॉरमॅट! कृपया Firebase कन्सोलवरून अचूक कोड पेस्ट करा.');
      }
    }
  }

  function showCloudFeedback(msg, isSuccess = true) {
    if (!cloudFeedbackMsg) return;
    cloudFeedbackMsg.style.display = 'block';
    cloudFeedbackMsg.style.background = isSuccess ? '#ecfdf5' : '#fef2f2';
    cloudFeedbackMsg.style.color = isSuccess ? '#065f46' : '#b91c1c';
    cloudFeedbackMsg.style.border = isSuccess ? '1px solid #a7f3d0' : '1px solid #fecaca';
    cloudFeedbackMsg.textContent = msg;
  }

  if (cloudSyncBtn && cloudModal) {
    cloudSyncBtn.addEventListener('click', () => {
      cloudModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (cloudFeedbackMsg) cloudFeedbackMsg.style.display = 'none';

      // Pre-fill existing config if any
      const existingConfig = window.CloudDB ? window.CloudDB.getConfig() : null;
      if (existingConfig && firebaseConfigInput) {
        firebaseConfigInput.value = JSON.stringify(existingConfig, null, 2);
      }
      updateCloudUI();
    });
  }

  function closeCloud() {
    if (cloudModal) {
      cloudModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (closeCloudModal) {
    closeCloudModal.addEventListener('click', closeCloud);
  }

  if (cloudModal) {
    cloudModal.addEventListener('click', (e) => {
      if (e.target === cloudModal) closeCloud();
    });
  }

  // Save Config Button
  if (saveCloudConfigBtn) {
    saveCloudConfigBtn.addEventListener('click', async () => {
      const rawText = firebaseConfigInput.value;
      try {
        const configObj = parseConfigInput(rawText);
        if (!configObj || !configObj.projectId) {
          throw new Error('कॉन्फिगमध्ये "projectId" सापडले नाही!');
        }

        saveCloudConfigBtn.disabled = true;
        saveCloudConfigBtn.textContent = 'कनेक्ट करत आहे...';

        const ok = window.CloudDB.saveConfig(configObj);
        if (ok) {
          showCloudFeedback('✓ Firebase यशस्वीरित्या कनेक्ट झाले!', true);
          updateCloudUI();
          
          // Initial fetch & merge from cloud
          const cloudRecords = await window.CloudDB.fetchAll();
          if (cloudRecords && cloudRecords.length) {
            window.AffidavitStore.mergeCloudRecords(cloudRecords);
            loadData();
          }

          // Start listening to real-time changes
          startCloudListener();

          setTimeout(() => {
            window.showToast('✓ Firebase क्लाउड डेटाबेस कनेक्ट झाला!', 'success');
            closeCloud();
          }, 1200);
        } else {
          showCloudFeedback('कनेक्शन अयशस्वी! कृपया API Key व Project ID तपासा.', false);
        }
      } catch (err) {
        showCloudFeedback(err.message, false);
      } finally {
        saveCloudConfigBtn.disabled = false;
        saveCloudConfigBtn.textContent = 'कनेक्ट करा व सेव्ह करा';
      }
    });
  }

  // Disconnect Button
  if (disconnectCloudBtn) {
    disconnectCloudBtn.addEventListener('click', () => {
      if (confirm('तुम्हाला Firebase क्लाउड कनेक्शन काढायचे आहे का? (डेटा लोकल स्टोरेजमध्ये सुरक्षित राहील)')) {
        window.CloudDB.disconnect();
        if (firebaseConfigInput) firebaseConfigInput.value = '';
        showCloudFeedback('क्लाउड कनेक्शन डिस्कनेक्ट झाले. आता ॲप लोकल मोडमध्ये आहे.', true);
        updateCloudUI();
        window.showToast('क्लाउड डिस्कनेक्ट झाले (लोकल मोड सक्रिय)', 'info');
      }
    });
  }

  // Upload Local Records to Cloud
  if (uploadLocalBtn) {
    uploadLocalBtn.addEventListener('click', async () => {
      try {
        uploadLocalBtn.disabled = true;
        uploadLocalBtn.textContent = 'अपलोड करत आहे...';
        const res = await window.CloudDB.syncLocalToCloud();
        showCloudFeedback(`✓ एकूण ${res.synced} भाडे पत्रे यशस्वीरित्या Firebase क्लाउडवर सिंक झाली!`, true);
        window.showToast(`✓ ${res.synced} रेकॉर्ड्स क्लाउडवर सिंक झाले!`, 'success');
      } catch (err) {
        showCloudFeedback('सिंक अयशस्वी: ' + err.message, false);
      } finally {
        uploadLocalBtn.disabled = false;
        uploadLocalBtn.textContent = '📤 लोकल डेटा क्लाउडवर सिंक करा';
      }
    });
  }

  function startCloudListener() {
    if (window.CloudDB && window.CloudDB.isConfigured()) {
      window.CloudDB.subscribe((cloudRecords) => {
        if (cloudRecords && cloudRecords.length) {
          window.AffidavitStore.mergeCloudRecords(cloudRecords);
          loadData();
        }
      });
    }
  }

  // Close modals on escape key or backdrop click
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeView();
      closeDelete();
      closeCloud();
      closeDbModalFn();
    }
  });

  [viewModal, deleteModal, cloudModal, dbModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeView();
          closeDelete();
          closeCloud();
          closeDbModalFn();
        }
      });
    }
  });

  // Global Toast function
  window.showToast = function(msg, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  };

  // Initial Data Load & Cloud Initialization
  loadData();
  updateDbUI();
  updateCloudUI();
  if (window.CloudDB && window.CloudDB.isConfigured()) {
    window.CloudDB.init();
    updateCloudUI();
    startCloudListener();
    // Background pull
    window.CloudDB.fetchAll().then(cloudRecords => {
      if (cloudRecords && cloudRecords.length) {
        window.AffidavitStore.mergeCloudRecords(cloudRecords);
        loadData();
      }
    }).catch(console.warn);
  }
});

