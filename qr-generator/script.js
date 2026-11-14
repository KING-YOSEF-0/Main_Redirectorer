const QRGenerator = (() => {
  const state = {
    currentQR: null,
    logoImage: null,
    batchResults: [],
  };

  const elements = {};

  function init() {
    cacheElements();
    bindEvents();
    startBubbles();
    generateRandomDemo();
  }

  function cacheElements() {
    elements.qrType = document.getElementById('qr-type');
    elements.qrSize = document.getElementById('qr-size');
    elements.qrEcc = document.getElementById('qr-ecc');
    elements.qrFgColor = document.getElementById('qr-fg-color');
    elements.qrBgColor = document.getElementById('qr-bg-color');
    elements.qrMargin = document.getElementById('qr-margin');
    elements.qrLogo = document.getElementById('qr-logo');
    elements.qrLogoSize = document.getElementById('qr-logo-size');
    elements.qrLogoSizeValue = document.getElementById('qr-logo-size-value');
    elements.btnGenerate = document.getElementById('btn-generate');
    elements.btnRandom = document.getElementById('btn-random');
    elements.btnBatchGenerate = document.getElementById('btn-batch-generate');
    elements.batchInput = document.getElementById('batch-input');
    elements.batchPrefix = document.getElementById('batch-prefix');
    elements.batchProgress = document.getElementById('batch-progress');
    elements.progressFill = document.getElementById('progress-fill');
    elements.batchStatus = document.getElementById('batch-status');
    elements.qrPreview = document.getElementById('qr-preview');
    elements.batchPreview = document.getElementById('batch-preview');
    elements.batchGrid = document.getElementById('batch-grid');
    elements.exportActions = document.getElementById('export-actions');
    elements.btnDownloadPng = document.getElementById('btn-download-png');
    elements.btnDownloadSvg = document.getElementById('btn-download-svg');
    elements.btnDownloadPdf = document.getElementById('btn-download-pdf');
    elements.btnCopyImage = document.getElementById('btn-copy-image');
    elements.btnShare = document.getElementById('btn-share');

    // Type-specific fields
    elements.typeFields = document.querySelectorAll('.type-field');
    elements.qrUrl = document.getElementById('qr-url');
    elements.qrText = document.getElementById('qr-text');
    elements.wifiSsid = document.getElementById('wifi-ssid');
    elements.wifiPassword = document.getElementById('wifi-password');
    elements.wifiEncryption = document.getElementById('wifi-encryption');
    elements.wifiHidden = document.getElementById('wifi-hidden');
    elements.vcardName = document.getElementById('vcard-name');
    elements.vcardOrg = document.getElementById('vcard-org');
    elements.vcardTitle = document.getElementById('vcard-title');
    elements.vcardPhone = document.getElementById('vcard-phone');
    elements.vcardEmail = document.getElementById('vcard-email');
    elements.vcardUrl = document.getElementById('vcard-url');
    elements.vcardAddress = document.getElementById('vcard-address');
    elements.emailTo = document.getElementById('email-to');
    elements.emailSubject = document.getElementById('email-subject');
    elements.emailBody = document.getElementById('email-body');
    elements.smsPhone = document.getElementById('sms-phone');
    elements.smsBody = document.getElementById('sms-body');
    elements.phoneNumber = document.getElementById('phone-number');
    elements.geoLat = document.getElementById('geo-lat');
    elements.geoLng = document.getElementById('geo-lng');
    elements.geoQuery = document.getElementById('geo-query');
    elements.eventTitle = document.getElementById('event-title');
    elements.eventStart = document.getElementById('event-start');
    elements.eventEnd = document.getElementById('event-end');
    elements.eventLocation = document.getElementById('event-location');
    elements.eventDescription = document.getElementById('event-description');
  }

  function bindEvents() {
    elements.qrType.addEventListener('change', showTypeFields);
    elements.qrLogo.addEventListener('change', handleLogoUpload);
    elements.qrLogoSize.addEventListener('input', () => {
      elements.qrLogoSizeValue.textContent = elements.qrLogoSize.value + '%';
    });

    elements.btnGenerate.addEventListener('click', generateQR);
    elements.btnRandom.addEventListener('click', generateRandomDemo);
    elements.btnBatchGenerate.addEventListener('click', generateBatch);

    elements.btnDownloadPng.addEventListener('click', () => downloadQR('png'));
    elements.btnDownloadSvg.addEventListener('click', () => downloadQR('svg'));
    elements.btnDownloadPdf.addEventListener('click', () => downloadQR('pdf'));
    elements.btnCopyImage.addEventListener('click', copyQRImage);
    elements.btnShare.addEventListener('click', shareQR);

    // Auto-generate on input change for URL type
    elements.qrUrl.addEventListener('input', debounce(generateQR, 300));
    elements.qrText.addEventListener('input', debounce(generateQR, 300));
  }

  function showTypeFields() {
    const type = elements.qrType.value;
    elements.typeFields.forEach(field => {
      field.hidden = field.dataset.type !== type;
    });
    generateQR();
  }

  function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        state.logoImage = img;
        generateQR();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  function getQRContent() {
    const type = elements.qrType.value;

    switch (type) {
      case 'url':
        return elements.qrUrl.value.trim() || 'https://example.com';

      case 'text':
        return elements.qrText.value.trim() || 'Hello, World!';

      case 'wifi': {
        const ssid = elements.wifiSsid.value.trim();
        const password = elements.wifiPassword.value;
        const encryption = elements.wifiEncryption.value;
        const hidden = elements.wifiHidden.checked ? 'true' : 'false';
        if (!ssid) return 'WIFI:T:WPA;S:MyWiFi;P:password;;';
        return `WIFI:T:${encryption};S:${escapeWifi(ssid)};P:${escapeWifi(password)};H:${hidden};;`;
      }

      case 'vcard': {
        const name = elements.vcardName.value.trim() || 'John Doe';
        const org = elements.vcardOrg.value.trim();
        const title = elements.vcardTitle.value.trim();
        const phone = elements.vcardPhone.value.trim();
        const email = elements.vcardEmail.value.trim();
        const url = elements.vcardUrl.value.trim();
        const address = elements.vcardAddress.value.trim();

        let vcard = 'BEGIN:VCARD\nVERSION:3.0\n';
        vcard += `FN:${escapeVCard(name)}\n`;
        if (org) vcard += `ORG:${escapeVCard(org)}\n`;
        if (title) vcard += `TITLE:${escapeVCard(title)}\n`;
        if (phone) vcard += `TEL:${escapeVCard(phone)}\n`;
        if (email) vcard += `EMAIL:${escapeVCard(email)}\n`;
        if (url) vcard += `URL:${escapeVCard(url)}\n`;
        if (address) vcard += `ADR:;;${escapeVCard(address)};;;;\n`;
        vcard += 'END:VCARD';
        return vcard;
      }

      case 'email': {
        const to = elements.emailTo.value.trim();
        const subject = elements.emailSubject.value.trim();
        const body = elements.emailBody.value.trim();
        let mailto = 'mailto:';
        if (to) mailto += encodeURIComponent(to);
        const params = [];
        if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
        if (body) params.push(`body=${encodeURIComponent(body)}`);
        if (params.length) mailto += '?' + params.join('&');
        return mailto || 'mailto:';
      }

      case 'sms': {
        const phone = elements.smsPhone.value.trim();
        const body = elements.smsBody.value.trim();
        let sms = 'sms:';
        if (phone) sms += encodeURIComponent(phone);
        if (body) sms += `?body=${encodeURIComponent(body)}`;
        return sms || 'sms:';
      }

      case 'phone': {
        const phone = elements.phoneNumber.value.trim();
        return phone ? `tel:${encodeURIComponent(phone)}` : 'tel:';
      }

      case 'location': {
        const lat = elements.geoLat.value;
        const lng = elements.geoLng.value;
        const query = elements.geoQuery.value.trim();
        if (!lat || !lng) return 'geo:0,0';
        let geo = `geo:${lat},${lng}`;
        if (query) geo += `?q=${encodeURIComponent(query)}`;
        return geo;
      }

      case 'event': {
        const title = elements.eventTitle.value.trim() || 'Event';
        const start = elements.eventStart.value;
        const end = elements.eventEnd.value;
        const location = elements.eventLocation.value.trim();
        const description = elements.eventDescription.value.trim();

        const formatDate = (dt) => {
          if (!dt) return '';
          return dt.replace('T', '').replace(/-/g, '').replace(/:/g, '') + 'Z';
        };

        let ical = 'BEGIN:VEVENT\n';
        ical += `SUMMARY:${escapeICAL(title)}\n`;
        if (start) ical += `DTSTART:${formatDate(start)}\n`;
        if (end) ical += `DTEND:${formatDate(end)}\n`;
        if (location) ical += `LOCATION:${escapeICAL(location)}\n`;
        if (description) ical += `DESCRIPTION:${escapeICAL(description)}\n`;
        ical += 'END:VEVENT';
        return ical;
      }

      default:
        return 'https://example.com';
    }
  }

  function escapeWifi(str) {
    return str.replace(/[;,\\]/g, '\\$&');
  }

  function escapeVCard(str) {
    return str.replace(/[;,\n]/g, '\\$&');
  }

  function escapeICAL(str) {
    return str.replace(/[;,\n]/g, '\\$&');
  }

  function generateQR() {
    const content = getQRContent();
    const size = parseInt(elements.qrSize.value) || 300;
    const ecc = elements.qrEcc.value;
    const fgColor = elements.qrFgColor.value;
    const bgColor = elements.qrBgColor.value;
    const margin = parseInt(elements.qrMargin.value) || 4;

    // Clear preview
    elements.qrPreview.innerHTML = '';

    // Create canvas for QR code
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    elements.qrPreview.appendChild(canvas);

    try {
      // Generate QR code using QRCode.js
      const qr = new QRCode(canvas, {
        text: content,
        width: size,
        height: size,
        colorDark: fgColor,
        colorLight: bgColor,
        correctLevel: getECCLevel(ecc),
      });

      // Add logo if present
      if (state.logoImage) {
        addLogoToCanvas(canvas, state.logoImage, size, parseInt(elements.qrLogoSize.value) || 20);
      }

      state.currentQR = { canvas, content, size, fgColor, bgColor };
      elements.exportActions.hidden = false;
      showToast('QR code generated');
    } catch (error) {
      console.error('QR generation error:', error);
      showToast('Failed to generate QR code');
      elements.qrPreview.innerHTML = '<div class="empty-results"><div class="empty-icon">⚠️</div><p>Failed to generate QR code</p></div>';
    }
  }

  function getECCLevel(level) {
    switch (level) {
      case 'L': return QRCode.CorrectLevel.L;
      case 'M': return QRCode.CorrectLevel.M;
      case 'Q': return QRCode.CorrectLevel.Q;
      case 'H': return QRCode.CorrectLevel.H;
      default: return QRCode.CorrectLevel.M;
    }
  }

  function addLogoToCanvas(canvas, logoImg, qrSize, logoPercent) {
    const ctx = canvas.getContext('2d');
    const logoSize = (qrSize * logoPercent) / 100;
    const x = (qrSize - logoSize) / 2;
    const y = (qrSize - logoSize) / 2;

    // Draw white background behind logo for better contrast
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 4, y - 4, logoSize + 8, logoSize + 8);

    // Draw logo
    ctx.drawImage(logoImg, x, y, logoSize, logoSize);
  }

  function generateRandomDemo() {
    const types = ['url', 'text', 'wifi', 'vcard', 'email', 'sms', 'phone', 'location', 'event'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    elements.qrType.value = randomType;
    showTypeFields();

    // Fill with demo data
    switch (randomType) {
      case 'url':
        elements.qrUrl.value = 'https://github.com/KING-YOSEF-0';
        break;
      case 'text':
        elements.qrText.value = 'Hello from KING_YOSEF_! 🎨';
        break;
      case 'wifi':
        elements.wifiSsid.value = 'KING_WiFi';
        elements.wifiPassword.value = 'bubble123';
        elements.wifiEncryption.value = 'WPA';
        break;
      case 'vcard':
        elements.vcardName.value = 'KING YOSEF';
        elements.vcardOrg.value = 'KING_YOSEF_ Projects';
        elements.vcardTitle.value = 'Developer';
        elements.vcardEmail.value = 'king@yosef.dev';
        elements.vcardUrl.value = 'https://king-yosef-0.github.io/';
        break;
      case 'email':
        elements.emailTo.value = 'hello@example.com';
        elements.emailSubject.value = 'Hello from QR Generator';
        elements.emailBody.value = 'Check out this cool QR code generator!';
        break;
      case 'sms':
        elements.smsPhone.value = '+1 555 0123';
        elements.smsBody.value = 'Hey! Check this out.';
        break;
      case 'phone':
        elements.phoneNumber.value = '+1 555 0123';
        break;
      case 'location':
        elements.geoLat.value = '40.7128';
        elements.geoLng.value = '-74.0060';
        elements.geoQuery.value = 'New York, NY';
        break;
      case 'event':
        elements.eventTitle.value = 'QR Code Workshop';
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(14, 0, 0, 0);
        elements.eventStart.value = tomorrow.toISOString().slice(0, 16);
        const endTime = new Date(tomorrow);
        endTime.setHours(16, 0, 0, 0);
        elements.eventEnd.value = endTime.toISOString().slice(0, 16);
        elements.eventLocation.value = 'Online';
        elements.eventDescription.value = 'Learn to generate QR codes!';
        break;
    }

    generateQR();
  }

  async function generateBatch() {
    const lines = elements.batchInput.value.trim().split('\n').filter(l => l.trim());
    if (lines.length === 0) {
      showToast('Enter at least one value');
      return;
    }

    const prefix = elements.batchPrefix.value.trim() || 'qr-code';
    const size = parseInt(elements.qrSize.value) || 300;
    const ecc = elements.qrEcc.value;
    const fgColor = elements.qrFgColor.value;
    const bgColor = elements.qrBgColor.value;

    elements.batchProgress.hidden = false;
    elements.batchPreview.hidden = false;
    elements.batchGrid.innerHTML = '';
    elements.progressFill.style.width = '0%';
    elements.batchStatus.textContent = `Generating ${lines.length} QR codes...`;

    state.batchResults = [];

    for (let i = 0; i < lines.length; i++) {
      const content = lines[i].trim();
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;

      try {
        new QRCode(canvas, {
          text: content,
          width: size,
          height: size,
          colorDark: fgColor,
          colorLight: bgColor,
          correctLevel: getECCLevel(ecc),
        });

        if (state.logoImage) {
          addLogoToCanvas(canvas, state.logoImage, size, parseInt(elements.qrLogoSize.value) || 20);
        }

        const dataUrl = canvas.toDataURL('image/png');
        state.batchResults.push({ index: i, content, canvas, dataUrl });

        // Add to grid
        const item = document.createElement('div');
        item.className = 'batch-item';
        item.innerHTML = `
          <canvas width="${size}" height="${size}"></canvas>
          <div class="batch-filename">${prefix}-${String(i + 1).padStart(3, '0')}.png</div>
        `;
        const itemCanvas = item.querySelector('canvas');
        itemCanvas.getContext('2d').drawImage(canvas, 0, 0);
        elements.batchGrid.appendChild(item);

        // Update progress
        const progress = ((i + 1) / lines.length) * 100;
        elements.progressFill.style.width = progress + '%';
        elements.batchStatus.textContent = `Generated ${i + 1} of ${lines.length}`;
      } catch (error) {
        console.error('Batch QR error:', error);
      }
    }

    elements.batchStatus.textContent = `Done! Generated ${state.batchResults.length} QR codes.`;
    showToast(`Batch complete: ${state.batchResults.length} codes`);
  }

  function downloadQR(format) {
    if (!state.currentQR) return;

    const { canvas, content, size, fgColor, bgColor } = state.currentQR;
    const safeContent = content.replace(/[^a-z0-9]/gi, '_').slice(0, 50);

    if (format === 'png') {
      const dataUrl = canvas.toDataURL('image/png');
      downloadDataUrl(dataUrl, `qr-${safeContent}.png`);
    } else if (format === 'svg') {
      const svg = generateSVG(content, size, fgColor, bgColor);
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      downloadUrl(url, `qr-${safeContent}.svg`);
      URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      generatePDF(canvas, content, size);
    }
  }

  function generateSVG(content, size, fgColor, bgColor) {
    // Simple SVG QR code generation (placeholder - would need proper SVG QR library)
    // For now, embed the PNG as base64 in SVG
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    new QRCode(canvas, {
      text: content,
      width: size,
      height: size,
      colorDark: fgColor,
      colorLight: bgColor,
      correctLevel: getECCLevel(elements.qrEcc.value),
    });
    if (state.logoImage) {
      addLogoToCanvas(canvas, state.logoImage, size, parseInt(elements.qrLogoSize.value) || 20);
    }
    const dataUrl = canvas.toDataURL('image/png');

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${bgColor}"/>
  <image width="${size}" height="${size}" href="${dataUrl}"/>
</svg>`;
  }

  function generatePDF(canvas, content, size) {
    // Create a simple PDF with the QR code
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) {
      // Load jsPDF dynamically
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = () => generatePDF(canvas, content, size);
      document.head.appendChild(script);
      return;
    }

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [size + 40, size + 80] });
    const dataUrl = canvas.toDataURL('image/png');
    pdf.addImage(dataUrl, 'PNG', 20, 20, size, size);
    pdf.text(content.slice(0, 80), 20, size + 40, { maxWidth: size });
    pdf.save(`qr-${content.replace(/[^a-z0-9]/gi, '_').slice(0, 50)}.pdf`);
  }

  async function copyQRImage() {
    if (!state.currentQR) return;

    try {
      const blob = await new Promise(resolve => state.currentQR.canvas.toBlob(resolve, 'image/png'));
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      showToast('QR code copied to clipboard!');
    } catch (error) {
      console.error('Copy failed:', error);
      showToast('Failed to copy. Try downloading instead.');
    }
  }

  async function shareQR() {
    if (!state.currentQR) return;

    try {
      const blob = await new Promise(resolve => state.currentQR.canvas.toBlob(resolve, 'image/png'));
      const file = new File([blob], 'qr-code.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'QR Code',
          text: `QR Code: ${state.currentQR.content.slice(0, 100)}`,
          files: [file],
        });
      } else {
        // Fallback: copy URL to clipboard
        await navigator.clipboard.writeText(state.currentQR.content);
        showToast('Content copied to clipboard (share not available)');
      }
    } catch (error) {
      console.error('Share failed:', error);
      showToast('Share failed');
    }
  }

  function downloadDataUrl(dataUrl, filename) {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    a.click();
  }

  function downloadUrl(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  }

  function debounce(fn, delay) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  function showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  function startBubbles() {
    const container = document.getElementById('bubbles');
    const colors = ['var(--accent)', 'var(--accent-2)', 'var(--accent-3)', 'var(--accent-4)', 'var(--accent-5)'];

    function spawn() {
      const bubble = document.createElement('div');
      bubble.className = 'float';
      const size = Math.random() * 60 + 20;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const left = Math.random() * 100;
      const duration = Math.random() * 20 + 15;
      const dx = (Math.random() - 0.5) * 200;

      bubble.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${left}%;
        --c: ${color};
        --duration: ${duration}s;
        --dx: ${dx}px;
      `;
      container.appendChild(bubble);
      setTimeout(() => bubble.remove(), duration * 1000);
    }

    setInterval(spawn, 800);
    for (let i = 0; i < 8; i++) setTimeout(spawn, i * 200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();