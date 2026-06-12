import { useRef, useEffect } from 'react'
import QRCode from 'qrcode'
import { orgs, extraFields } from '../utils/registrationUtils'
import { resolveImageUrl } from '../utils/imageUrl'

// Map orgId → figure image in /ID/ folder
const ORG_FIGURE_MAP = {
  main_trust:   '/ID/main_trust.png',
  patrakar:     '/ID/press.png',
  crime:        '/ID/crime.png',
  chikitsa:     '/ID/akhil.png',
  hindu:        '/ID/hindu.png',
  journalist:   '/ID/indian_council.png',
  manav:        '/ID/right.png',
  bhrashtachar: '/ID/bhrast.png',
  muslim:       '/ID/mushlim.png',
}

// Map orgId → primary saffron/theme tones (top header gradient)
const ORG_HEADER_COLORS = {
  main_trust:   { from: '#B8860B', to: '#DAA520', accent: '#FFD700' },
  patrakar:     { from: '#8B1A00', to: '#CC3300', accent: '#FF6600' },
  crime:        { from: '#6B0000', to: '#AA1100', accent: '#CC2200' },
  chikitsa:     { from: '#880044', to: '#CC1166', accent: '#FF3399' },
  hindu:        { from: '#8B3A00', to: '#D45A00', accent: '#FF8C00' },
  journalist:   { from: '#2D1B6B', to: '#5735AA', accent: '#7B52CC' },
  manav:        { from: '#004D1A', to: '#007A2A', accent: '#00A836' },
  bhrashtachar: { from: '#7A2100', to: '#BB4400', accent: '#DD6600' },
  muslim:       { from: '#003330', to: '#005540', accent: '#007755' },
}

const ORG_MOHAR_MAP = {
  main_trust:   '/mohar/sadhuLakshmi.png',
  patrakar:     '/mohar/rashtriyapress.png',
  crime:        '/mohar/rashtriyacrime.png',
  chikitsa:     '/mohar/akhilbhartiya.png',
  hindu:        '/mohar/sadhuLakshmi.png',
  journalist:   '/mohar/indianCouncil.png',
  manav:        '/mohar/righttorecall.png',
  bhrashtachar: '/mohar/bhrashtachar.png',
  muslim:       '/mohar/bhartiyamushlim.png',
}

// Extra field label mapping for the ID card display
const EXTRA_FIELD_LABELS = {
  // patrakar
  press_id:       'प्रेस आईडी कार्ड नं.',
  publication:    'समाचार पत्र / चैनल',
  reporting_area: 'रिपोर्टिंग क्षेत्र',
  // crime
  prior_exp:      'पूर्व अनुभव',
  police_station: 'पुलिस स्टेशन',
  special_skills: 'विशेष कौशल',
  // chikitsa
  service_field:  'सेवा क्षेत्र',
  prev_work:      'पूर्व कार्य',
  // hindu
  shakha:         'शाखा / क्षेत्र',
  preferred_role: 'सेवा योगदान',
  // journalist
  council_role:   'परिषद भूमिका',
  edu_background: 'शैक्षिक पृष्ठभूमि',
  // manav
  focus_area:     'रुचि क्षेत्र',
  advocacy_exp:   'अनुभव',
  // bhrashtachar
  rti_exp:        'RTI अनुभव',
  dept:           'अभियान भूमिका',
  // muslim
  welfare_interest: 'कल्याण रुचि',
  local_masjid:   'स्थानीय संस्था',
}

// Dynamic layout settings for each organization to fit their template's white area
const ORG_LAYOUTS = {
  main_trust: {
    bodyY: 410,
    photoH: 180,
    rowHeight: 25,
    stampCY: 470,
    sigLineY: 570,
  },
  patrakar: {
    bodyY: 400,
    photoH: 195,
    rowHeight: 26,
    stampCY: 460,
    sigLineY: 550,
  },
  crime: {
    bodyY: 400,
    detY: 435,
    photoH: 195,
    rowHeight: 26,
    stampCY: 490,
    sigLineY: 580,
  },
  chikitsa: {
    bodyY: 405,
    photoH: 165,
    rowHeight: 23,
    stampCY: 455,
    sigLineY: 555,
  },
  hindu: {
    bodyY: 410,
    photoH: 180,
    rowHeight: 25,
    stampCY: 470,
    sigLineY: 570,
  },
  journalist: {
    bodyY: 345,
    photoH: 180,
    rowHeight: 25,
    stampCY: 410,
    sigLineY: 510,
  },
  manav: {
    bodyY: 400,
    photoH: 165,
    rowHeight: 23,
    stampCY: 450,
    sigLineY: 550,
  },
  bhrashtachar: {
    bodyY: 420,
    photoH: 165,
    rowHeight: 23,
    stampCY: 475,
    sigLineY: 575,
  },
  muslim: {
    bodyY: 410,
    photoH: 165,
    rowHeight: 23,
    stampCY: 460,
    sigLineY: 560,
  },
}

const ICON_TYPE_MAP = {
  name:           'name',
  father:         'father',
  dob:            'dob',
  mobile:         'mobile',
  address:        'address',
  press_id:       'press_id',
  publication:    'location',
  reporting_area: 'globe',
  prior_exp:      'id_card',
  police_station: 'location',
  special_skills: 'globe',
  service_field:  'id_card',
  prev_work:      'location',
  shakha:         'location',
  preferred_role: 'globe',
  council_role:   'id_card',
  edu_background: 'globe',
  focus_area:     'id_card',
  advocacy_exp:   'globe',
  rti_exp:        'id_card',
  dept:           'location',
  welfare_interest: 'id_card',
  local_masjid:   'location'
}

const drawIconCircle = (ctx, cx, cy, size, type) => {
  ctx.save()
  // Draw circle background
  ctx.fillStyle = '#122A54'
  ctx.beginPath()
  ctx.arc(cx, cy, size / 2, 0, Math.PI * 2)
  ctx.fill()

  // Draw white icon inside
  ctx.strokeStyle = '#FFFFFF'
  ctx.fillStyle = '#FFFFFF'
  ctx.lineWidth = 1.2
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  
  const r = size * 0.5
  
  if (type === 'name' || type === 'user') {
    ctx.beginPath()
    ctx.arc(cx, cy - r * 0.25, r * 0.3, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(cx - r * 0.5, cy + r * 0.5)
    ctx.quadraticCurveTo(cx, cy + r * 0.05, cx + r * 0.5, cy + r * 0.5)
    ctx.lineTo(cx - r * 0.5, cy + r * 0.5)
    ctx.fill()
  } else if (type === 'father' || type === 'people') {
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.beginPath()
    ctx.arc(cx + r * 0.2, cy - r * 0.3, r * 0.25, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(cx - r * 0.2, cy + r * 0.45)
    ctx.quadraticCurveTo(cx + r * 0.2, cy + r * 0.05, cx + r * 0.5, cy + r * 0.45)
    ctx.fill()
    
    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath()
    ctx.arc(cx - r * 0.15, cy - r * 0.2, r * 0.28, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(cx - r * 0.55, cy + r * 0.5)
    ctx.quadraticCurveTo(cx - r * 0.15, cy + r * 0.08, cx + r * 0.25, cy + r * 0.5)
    ctx.fill()
  } else if (type === 'dob' || type === 'calendar') {
    ctx.beginPath()
    ctx.rect(cx - r * 0.45, cy - r * 0.35, r * 0.9, r * 0.8)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(cx - r * 0.45, cy - r * 0.1)
    ctx.lineTo(cx + r * 0.45, cy - r * 0.1)
    ctx.stroke()
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(cx - r * 0.25, cy - r * 0.5, r * 0.1, r * 0.25)
    ctx.fillRect(cx + r * 0.15, cy - r * 0.5, r * 0.1, r * 0.25)
    ctx.beginPath()
    ctx.moveTo(cx - r * 0.2, cy + r * 0.15)
    ctx.lineTo(cx - r * 0.1, cy + r * 0.15)
    ctx.moveTo(cx + r * 0.1, cy + r * 0.15)
    ctx.lineTo(cx + r * 0.2, cy + r * 0.15)
    ctx.moveTo(cx - r * 0.2, cy + r * 0.35)
    ctx.lineTo(cx - r * 0.1, cy + r * 0.35)
    ctx.moveTo(cx + r * 0.1, cy + r * 0.35)
    ctx.lineTo(cx + r * 0.2, cy + r * 0.35)
    ctx.stroke()
  } else if (type === 'mobile' || type === 'phone') {
    ctx.beginPath()
    ctx.arc(cx + r * 0.1, cy - r * 0.1, r * 0.35, Math.PI * 0.9, Math.PI * 1.6)
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 2.5
    ctx.stroke()
    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath()
    ctx.arc(cx - r * 0.2, cy - r * 0.2, r * 0.12, 0, Math.PI * 2)
    ctx.arc(cx + r * 0.2, cy + r * 0.2, r * 0.12, 0, Math.PI * 2)
    ctx.fill()
  } else if (type === 'address' || type === 'home') {
    ctx.beginPath()
    ctx.moveTo(cx - r * 0.55, cy + r * 0.05)
    ctx.lineTo(cx, cy - r * 0.45)
    ctx.lineTo(cx + r * 0.55, cy + r * 0.05)
    ctx.stroke()
    ctx.beginPath()
    ctx.rect(cx - r * 0.4, cy + r * 0.05, r * 0.8, r * 0.45)
    ctx.stroke()
    ctx.fillRect(cx - r * 0.12, cy + r * 0.22, r * 0.24, r * 0.28)
  } else if (type === 'press_id' || type === 'id_card') {
    ctx.beginPath()
    ctx.rect(cx - r * 0.5, cy - r * 0.35, r * 1.0, r * 0.7)
    ctx.stroke()
    ctx.beginPath()
    ctx.rect(cx - r * 0.38, cy - r * 0.2, r * 0.28, r * 0.32)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(cx + r * 0.02, cy - r * 0.1)
    ctx.lineTo(cx + r * 0.38, cy - r * 0.1)
    ctx.moveTo(cx + r * 0.02, cy + r * 0.1)
    ctx.lineTo(cx + r * 0.38, cy + r * 0.1)
    ctx.stroke()
  } else if (type === 'publication' || type === 'location') {
    ctx.beginPath()
    ctx.arc(cx, cy - r * 0.15, r * 0.28, 0, Math.PI, true)
    ctx.lineTo(cx, cy + r * 0.5)
    ctx.closePath()
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(cx, cy - r * 0.15, r * 0.09, 0, Math.PI * 2)
    ctx.fill()
  } else if (type === 'reporting_area' || type === 'globe') {
    ctx.beginPath()
    ctx.arc(cx, cy, r * 0.48, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.ellipse(cx, cy, r * 0.2, r * 0.48, 0, 0, Math.PI * 2)
    ctx.moveTo(cx - r * 0.48, cy)
    ctx.lineTo(cx + r * 0.48, cy)
    ctx.ellipse(cx, cy, r * 0.48, r * 0.15, 0, 0, Math.PI * 2)
    ctx.stroke()
  } else {
    ctx.beginPath()
    ctx.arc(cx, cy, r * 0.25, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

const IDCardGenerator = ({ orgId, formData = {}, regNumber, onGenerated }) => {
  const frontCanvasRef = useRef(null)
  const backCanvasRef  = useRef(null)

  const formDataStr = JSON.stringify(formData);
  useEffect(() => {
    generateIDCard()
  }, [orgId, formDataStr, regNumber])

  const generateIDCard = async () => {
    const frontCanvas = frontCanvasRef.current
    const backCanvas  = backCanvasRef.current
    if (!frontCanvas || !backCanvas) return

    const frontCtx = frontCanvas.getContext('2d')
    const backCtx  = backCanvas.getContext('2d')

    const org        = orgs.find(o => o.id === orgId) || orgs[0]
    const hColors    = ORG_HEADER_COLORS[orgId] || ORG_HEADER_COLORS.hindu
    const figureUrl  = ORG_FIGURE_MAP[orgId] || ORG_FIGURE_MAP.hindu

    const W = 1050
    const H = 660

    frontCanvas.width  = W
    frontCanvas.height = H
    backCanvas.width   = W
    backCanvas.height  = H

    // ── Image Loader ──
    const loadImage = (src) => new Promise((resolve) => {
      if (!src) { resolve(null); return }
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload  = () => resolve(img)
      img.onerror = () => { console.warn('IMG failed:', src); resolve(null) }
      img.src = src
    })

    // Wait for fonts
    try { if (document.fonts) await document.fonts.ready } catch (_) {}

    // Generate QR Code data URL
    const buildQRData = (data, regNum) => {
      const omitKeys = ['photo', 'paymentScreenshot', '_id', '__v', 'createdAt', 'updatedAt', 'organization', 'status', 'id'];
      let qrText = `Organization: ${org.full || 'Organization'}\nReg No: ${regNum || 'N/A'}\n`;
      for (const key in data) {
        if (!omitKeys.includes(key) && data[key]) {
          const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          qrText += `${label}: ${data[key]}\n`;
        }
      }
      return qrText.trim();
    };

    const qrDataUrl = await QRCode.toDataURL(buildQRData(formData, regNumber), { 
      width: 400, 
      margin: 1,
      errorCorrectionLevel: 'L'
    });

    const [logoImg, photoImg, figureImg, moharImg, signImg, qrImg] = await Promise.all([
      loadImage(resolveImageUrl(org.logo)),
      loadImage(resolveImageUrl(formData.photo)),
      loadImage(figureUrl),
      loadImage(ORG_MOHAR_MAP[orgId] || ORG_MOHAR_MAP.hindu),
      loadImage(orgId === 'muslim' ? '/mushlim/signM.png' : '/letter/sign.png'),
      loadImage(qrDataUrl)
    ])

    frontCtx.imageSmoothingEnabled = true
    frontCtx.imageSmoothingQuality = 'high'
    backCtx.imageSmoothingEnabled  = true
    backCtx.imageSmoothingQuality  = 'high'

    // ════════════════════════════════════════════════════════════
    //  DRAW FRONT CARD
    // ════════════════════════════════════════════════════════════
    drawFrontCard(frontCtx, { W, H, org, hColors, logoImg, photoImg, figureImg, moharImg, signImg })

    // ════════════════════════════════════════════════════════════
    //  DRAW BACK CARD
    // ════════════════════════════════════════════════════════════
    drawBackCard(backCtx, { W, H, org, hColors, logoImg, photoImg, qrImg })

    if (onGenerated) {
      onGenerated({
        front: frontCanvas.toDataURL('image/png'),
        back:  backCanvas.toDataURL('image/png'),
      })
    }

    // ─────────────────────────────────────────────────────────────────────
    function drawFrontCard(ctx, { W, H, org, hColors, logoImg, photoImg, figureImg, moharImg, signImg }) {
      const layout = ORG_LAYOUTS[orgId] || ORG_LAYOUTS.hindu
      const BODY_Y = layout.bodyY
      const bodyLeft = 20

      // ── 1. Draw background ──
      if (figureImg) {
        ctx.drawImage(figureImg, 0, 0, W, H)
      } else {
        // Fallback card base if background image fails
        ctx.fillStyle = '#FFFDF5'
        roundRect(ctx, 0, 0, W, H, 18)
        ctx.fill()
        ctx.strokeStyle = '#D4AF37'
        ctx.lineWidth   = 3
        roundRectStroke(ctx, 1.5, 1.5, W - 3, H - 3, 17)
      }

      // ── 2. Member Photo (left side) ──
      const photoX  = layout.photoX !== undefined ? layout.photoX : (bodyLeft + 12)
      const photoY  = layout.photoY !== undefined ? layout.photoY : (BODY_Y + 10)
      const photoW  = layout.photoW !== undefined ? layout.photoW : 140
      const photoH  = layout.photoH

      // Photo border
      ctx.strokeStyle = layout.photoBorderColor || hColors.to
      ctx.lineWidth   = 3
      roundRectStroke(ctx, photoX, photoY, photoW, photoH, 6)

      if (photoImg) {
        ctx.save()
        roundRect(ctx, photoX + 2, photoY + 2, photoW - 4, photoH - 4, 5)
        ctx.clip()
        ctx.drawImage(photoImg, photoX + 2, photoY + 2, photoW - 4, photoH - 4)
        ctx.restore()
      } else {
        ctx.fillStyle = '#F5F0E8'
        roundRect(ctx, photoX + 2, photoY + 2, photoW - 4, photoH - 4, 5)
        ctx.fill()
        ctx.fillStyle    = '#999'
        ctx.font         = "13px 'Hind', sans-serif"
        ctx.textAlign    = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('फोटो', photoX + photoW / 2, photoY + photoH / 2 - 10)
        ctx.fillText('उपलब्ध नहीं', photoX + photoW / 2, photoY + photoH / 2 + 10)
      }

      // Registration Number badge below photo
      const regBadgeY = layout.regBadgeY !== undefined ? layout.regBadgeY : (photoY + photoH + 6)
      const regBadgeH = layout.regBadgeH !== undefined ? layout.regBadgeH : 32
      ctx.fillStyle = layout.regBadgeColor || hColors.to
      roundRect(ctx, photoX, regBadgeY, photoW, regBadgeH, 6)
      ctx.fill()
      
      ctx.fillStyle    = '#FFFFFF'
      ctx.textAlign    = 'center'
      ctx.textBaseline = 'top'
      
      let labelY = regBadgeY + 4
      let valY = regBadgeY + 18
      let labelFontSize = "bold 11px"
      let valFontSize = "bold 11px"
      if (regBadgeH > 40) {
        labelY = regBadgeY + 10
        valY = regBadgeY + 30
        labelFontSize = "bold 14px"
        valFontSize = "bold 15px"
      }
      
      ctx.font = `${labelFontSize} 'Hind', sans-serif`
      ctx.fillText('रजिस्ट्रेशन नंबर', photoX + photoW / 2, labelY)
      ctx.font = `${valFontSize} 'Poppins', sans-serif`
      ctx.fillText(regNumber || 'NGO/2026/000000', photoX + photoW / 2, valY)

      // ── 3. Member details (center) ──
      {
        const detX    = layout.detX !== undefined ? layout.detX : (photoX + photoW + 25)
        const detMaxW = layout.detMaxW !== undefined ? layout.detMaxW : 520
        let   detY    = layout.detY !== undefined ? layout.detY : (BODY_Y + 10)
        const rowHeight = layout.rowHeight

        const drawRow = (label, value) => {
          if (!value || value === 'N/A' || value === '') return
          const mid = Math.round(rowHeight / 2)

          ctx.fillStyle    = hColors.to
          ctx.font         = "bold 14px 'Hind', sans-serif"
          ctx.textAlign    = 'left'
          ctx.textBaseline = 'middle'
          ctx.fillText('●', detX, detY + mid)

          ctx.fillStyle = '#222222'
          ctx.font      = "bold 14px 'Hind', sans-serif"
          ctx.fillText(label, detX + 16, detY + mid)

          ctx.fillStyle = '#444444'
          ctx.font      = "600 14px 'Hind', sans-serif"
          ctx.fillText(':  ' + String(value).substring(0, 40), detX + 160, detY + mid)

          ctx.strokeStyle = 'rgba(180,150,100,0.2)'
          ctx.lineWidth   = 0.8
          ctx.beginPath()
          ctx.moveTo(detX, detY + rowHeight - 1)
          ctx.lineTo(detX + detMaxW, detY + rowHeight - 1)
          ctx.stroke()

          detY += rowHeight
        }

        drawRow('पद',              formData.role   || 'सदस्य')
        drawRow('सदस्य का नाम',     formData.name   || '')
        drawRow('पिता/पति का नाम', formData.father  || '')
        drawRow('जन्म तिथि',       formData.dob     || '')
        drawRow('मोबाइल नंबर',     formData.mobile  || '')
        drawRow('स्थायी पता',      (formData.address || '').substring(0, 40))

        if (formData.validFrom && formData.validUntil) {
          const formatFrom = formData.validFrom.split('-').reverse().join('/');
          const formatTo = formData.validUntil.split('-').reverse().join('/');
          drawRow('वैधता (Validity)', `${formatFrom} से ${formatTo}`);
        }

        const extra = extraFields[orgId] || []
        extra.forEach(f => {
          const label = EXTRA_FIELD_LABELS[f.id] || f.label
          const val   = formData[f.id] || ''
          if (val) drawRow(label, val)
        })
      }

      // ── 4. Signature + Stamp ──
      {
        const sigX    = layout.sigX !== undefined ? layout.sigX : (W - 200)
        const sigW    = layout.sigW !== undefined ? layout.sigW : 170
        const stampCX = layout.stampCX !== undefined ? layout.stampCX : (sigX + sigW / 2)
        const stampCY = layout.stampCY
        const stampR  = layout.stampR !== undefined ? layout.stampR : 42

        if (moharImg) {
          const stampSize = stampR * 2.8; // Adjust to fit
          const aspect = moharImg.width / moharImg.height;
          let drawW = stampSize;
          let drawH = stampSize;
          if (aspect > 1) {
            drawH = stampSize / aspect;
          } else {
            drawW = stampSize * aspect;
          }
          ctx.drawImage(moharImg, stampCX - drawW / 2, stampCY - drawH / 2, drawW, drawH);
        } else {
          ctx.save()
          ctx.strokeStyle = 'rgba(180,30,30,0.75)'
          ctx.lineWidth   = 2.5
          ctx.beginPath()
          ctx.arc(stampCX, stampCY, stampR, 0, Math.PI * 2)
          ctx.stroke()
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.arc(stampCX, stampCY, stampR - 6, 0, Math.PI * 2)
          ctx.stroke()
          ctx.fillStyle    = 'rgba(180,30,30,0.75)'
          ctx.font         = "bold 9px 'Hind', sans-serif"
          ctx.textAlign    = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText('साधू लक्ष्मी', stampCX, stampCY - 11)
          ctx.fillText('जनकल्याण ट्रस्ट', stampCX, stampCY + 1)
          ctx.font = "bold 8px 'Hind', sans-serif"
          ctx.fillText('सील', stampCX, stampCY + 12)
          ctx.strokeStyle = '#FFFDF5'
          ctx.lineWidth   = 1.5
          for (let i = 0; i < 5; i++) {
            ctx.beginPath()
            const rx = (Math.random() - 0.5) * 65
            const ry = (Math.random() - 0.5) * 65
            ctx.moveTo(stampCX + rx, stampCY + ry)
            ctx.lineTo(stampCX + (Math.random() - 0.5) * 65, stampCY + (Math.random() - 0.5) * 65)
            ctx.stroke()
          }
          ctx.restore()
        }

        const sigLineY = layout.sigLineY
        ctx.strokeStyle = '#999'
        ctx.lineWidth   = 1
        ctx.beginPath()
        ctx.moveTo(sigX + 10, sigLineY)
        ctx.lineTo(sigX + sigW - 10, sigLineY)
        ctx.stroke()
        
        if (signImg) {
          const targetW = 120;
          const targetH = targetW / (signImg.width / signImg.height);
          ctx.drawImage(signImg, stampCX - targetW / 2, sigLineY - targetH - 2, targetW, targetH);
        } else {
          ctx.fillStyle    = '#1A40B0'
          ctx.font         = "italic 26px 'Caveat', cursive, sans-serif"
          ctx.textAlign    = 'center'
          ctx.textBaseline = 'bottom'
          ctx.fillText('Sadhu Laxmi', stampCX, sigLineY - 4)
        }

        ctx.fillStyle    = '#444'
        ctx.font         = "bold 11px 'Hind', sans-serif"
        ctx.textAlign    = 'center'
        ctx.textBaseline = 'top'
        ctx.fillText('राष्ट्रीय अध्यक्ष', stampCX, sigLineY + 5)
        ctx.fillStyle = '#777'
        ctx.font      = "600 9px 'Hind', sans-serif"
        ctx.fillText('प्राधिकृत हस्ताक्षरकर्ता', stampCX, sigLineY + 18)
      }
    }

    // ════════════════════════════════════════════════════════════
    //  DRAW BACK CARD
    // ════════════════════════════════════════════════════════════
    function drawBackCard(ctx, { W, H, org, hColors, logoImg, photoImg, qrImg }) {

      // ══════════════════════════════════════════════
      //  OTHER CARDS — standard Terms & Conditions back
      // ══════════════════════════════════════════════
      const HEADER_H = 160

        ctx.fillStyle = '#FFFDF5'
        roundRect(ctx, 0, 0, W, H, 18)
        ctx.fill()

        ctx.strokeStyle = '#D4AF37'
        ctx.lineWidth   = 3
        roundRectStroke(ctx, 1.5, 1.5, W - 3, H - 3, 17)

        const grad = ctx.createLinearGradient(0, 0, W, HEADER_H)
        grad.addColorStop(0,   hColors.from)
        grad.addColorStop(0.5, hColors.to)
        grad.addColorStop(1,   hColors.accent)
        ctx.fillStyle = grad
        ctx.save()
        roundRect(ctx, 0, 0, W, HEADER_H + 18, 18)
        ctx.clip()
        ctx.fillRect(0, 0, W, HEADER_H + 18)
        ctx.restore()

        if (logoImg) {
          const lSize = 70
          ctx.save()
          ctx.beginPath()
          ctx.arc(60, HEADER_H / 2, lSize / 2 + 4, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(255,255,255,0.9)'
          ctx.fill()
          ctx.beginPath()
          ctx.arc(60, HEADER_H / 2, lSize / 2, 0, Math.PI * 2)
          ctx.clip()
          ctx.drawImage(logoImg, 60 - lSize / 2, HEADER_H / 2 - lSize / 2, lSize, lSize)
          ctx.restore()
          ctx.beginPath()
          ctx.arc(60, HEADER_H / 2, lSize / 2 + 4, 0, Math.PI * 2)
          ctx.strokeStyle = '#D4AF37'
          ctx.lineWidth   = 2
          ctx.stroke()
        }

        ctx.fillStyle    = '#FFFFFF'
        ctx.font         = "bold 30px 'Hind', sans-serif"
        ctx.textAlign    = 'left'
        ctx.textBaseline = 'middle'
        ctx.fillText('नियम एवं शर्तें', 120, HEADER_H / 2 - 12)
        ctx.fillStyle = 'rgba(255,255,255,0.75)'
        ctx.font      = "600 14px 'Hind', sans-serif"
        ctx.fillText('TERMS & CONDITIONS', 120, HEADER_H / 2 + 16)

        ctx.strokeStyle = '#D4AF37'
        ctx.lineWidth   = 1.5
        ctx.setLineDash([5, 4])
        ctx.beginPath()
        ctx.moveTo(20, HEADER_H + 10)
        ctx.lineTo(W - 20, HEADER_H + 10)
        ctx.stroke()
        ctx.setLineDash([])

        if (logoImg) {
          ctx.save()
          ctx.globalAlpha = 0.05
          ctx.drawImage(logoImg, W / 2 - 120, HEADER_H + 50, 240, 240)
          ctx.globalAlpha = 1
          ctx.restore()
        }

        const terms = [
          '१. यह पहचान पत्र साधू लक्ष्मी जनकल्याण ट्रस्ट का अधिकृत दस्तावेज है।',
          '२. संगठन से संबंधित कार्यों के दौरान इसे सदैव धारण करना अनिवार्य है।',
          '३. कार्ड खो जाने या चोरी होने पर तुरंत संगठन कार्यालय को सूचित करें।',
          '४. किसी भी अनधिकृत गतिविधि या दुरुपयोग पर यह कार्ड तत्काल रद्द माना जाएगा।',
          '५. इस कार्ड का उपयोग केवल संगठन के अधिकृत कार्यों हेतु किया जा सकता है।',
          '६. कार्ड अहस्तांतरणीय है एवं यह कार्ड धारक के नाम पर ही मान्य है।',
        ]

        let tY = HEADER_H + 50
        terms.forEach(t => {
          ctx.fillStyle    = '#333333'
          ctx.font         = "600 24px 'Hind', sans-serif"
          ctx.textAlign    = 'left'
          ctx.textBaseline = 'top'
          ctx.fillText(t, 60, tY)
          tY += 50
        })

        // DRAW QR CODE ON BACK
        if (qrImg) {
          const qrSize = 170;
          const qrX = W - qrSize - 40;
          const qrY = H - 24 - qrSize - 20; // 24 is footer height
          ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
          
          ctx.fillStyle = '#555';
          ctx.font = "bold 14px 'Hind', sans-serif";
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText('Scan for User Details', qrX + qrSize / 2, qrY + qrSize + 5);
        }

        ctx.fillStyle = hColors.to
        ctx.fillRect(0, H - 24, W, 24)
        ctx.fillStyle    = '#FFFFFF'
        ctx.font         = "bold 11px 'Hind', sans-serif"
        ctx.textAlign    = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(
          'www.sadhulaxmitrust.org  •  साधू लक्ष्मी जनकल्याण ट्रस्ट',
          W / 2, H - 12
        )

        ctx.strokeStyle = hColors.to
        ctx.lineWidth   = 4
        roundRectStroke(ctx, 2, 2, W - 4, H - 4, 17)
    }
  } // end generateIDCard

  return (
    <div style={{ display: 'none' }}>
      <canvas ref={frontCanvasRef} />
      <canvas ref={backCanvasRef} />
    </div>
  )
}

// ── Helpers ──
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function roundRectStroke(ctx, x, y, w, h, r) {
  roundRect(ctx, x, y, w, h, r)
  ctx.stroke()
}

export default IDCardGenerator
