import { useRef, useEffect } from 'react'
import QRCode from 'qrcode'
import { orgs } from '../utils/registrationUtils'
import { resolveImageUrl } from '../utils/imageUrl'

const JoiningLetterGenerator = ({ orgId, formData = {}, regNumber, onGenerated }) => {
  const canvasRef = useRef(null)

  const formDataStr = JSON.stringify(formData);
  useEffect(() => {
    generateLetter()
  }, [orgId, formDataStr, regNumber])

  const darkenColor = (hex, percent) => {
    if (!hex || !hex.startsWith('#')) return '#0f172a'
    const num = parseInt(hex.replace('#', ''), 16)
    const amt = Math.round(2.55 * percent)
    const R = (num >> 16) - amt
    const G = (num >> 8 & 0x00FF) - amt
    const B = (num & 0x0000FF) - amt
    return "#" + (
      0x1000000 +
      (R < 0 ? 0 : R > 255 ? 255 : R) * 0x10000 +
      (G < 0 ? 0 : G > 255 ? 255 : G) * 0x100 +
      (B < 0 ? 0 : B > 255 ? 255 : B)
    ).toString(16).slice(1)
  }

  const generateLetter = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const org = orgs.find(o => o.id === orgId) || orgs[0]
    const primaryColor = org.color || '#007ad9'
    const secondaryColor = darkenColor(primaryColor, 35)
    
    // A4 dimensions at 150 DPI
    const width = 1240
    const height = 1754
    canvas.width = width
    canvas.height = height

    // High quality rendering
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // Load Logo
    const loadImage = (src) => {
      return new Promise((resolve) => {
        if (!src) return resolve(null)
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => resolve(img)
        img.onerror = () => resolve(null)
        img.src = src
      })
    }
    const letterLogos = {
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

    const moharPath = ORG_MOHAR_MAP[org.id] || ORG_MOHAR_MAP.hindu
    const letterLogoPath = letterLogos[org.id] || org.logo

    // Generate QR Code data URL
    const buildQRData = (data, regNum) => {
      const omitKeys = ['photo', 'paymentScreenshot', '_id', '__v', 'createdAt', 'updatedAt', 'organization', 'status', 'id'];
      let qrText = `Organization: ${org.full}\nReg No: ${regNum || 'N/A'}\n`;
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
    
    const [logoImg, signImg, photoImg, moharImg, qrImg] = await Promise.all([
      loadImage(resolveImageUrl(letterLogoPath)),
      loadImage(org.id === 'muslim' ? '/mushlim/signM.png' : '/letter/sign.png'),
      loadImage(resolveImageUrl(formData.photo)),
      loadImage(moharPath),
      loadImage(qrDataUrl)
    ])

    // Wait for fonts
    if (document.fonts) await document.fonts.ready

    // Clear and Fill Background here (AFTER awaits to avoid concurrent interleaving issues)
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)

    // Draw Full Header Image (Cropped to just the header portion)
    let headerHeight = 0;
    if (logoImg) {
      // Determine crop ratio: use 1.0 for muslim since it is now just a banner, 0.68 for others
      let cropRatio = 0.68;
      if (org.id === 'muslim') cropRatio = 1.0;
      if (org.id === 'main_trust') cropRatio = 0.42;
      const sWidth = logoImg.width;
      const sHeight = logoImg.height * cropRatio;
      headerHeight = width * (sHeight / sWidth);
      ctx.drawImage(logoImg, 0, 0, sWidth, sHeight, 0, 0, width, headerHeight);
    } else {
      // Fallback simple header if no image
      ctx.fillStyle = primaryColor;
      ctx.fillRect(0, 0, width, 150);
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = "bold 46px 'Poppins', sans-serif";
      ctx.fillText(org.full, width / 2, 75);
      headerHeight = 150;
    }

    // Details Section
    let contentY = Math.max(450, headerHeight + 30)
    if (org.id === 'muslim') contentY = 550
    if (org.id === 'main_trust') contentY = 420
    ctx.fillStyle = '#1e293b'
    ctx.font = "bold 24px 'Poppins', sans-serif"
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'

    const drawDetail = (label, value, y) => {
      ctx.font = "bold 24px 'Poppins', sans-serif"
      ctx.fillText(`${label}:`, 120, y)
      ctx.font = "500 24px 'Poppins', sans-serif"
      
      // wrap value if needed
      const maxW = 700
      let words = value.split(' ')
      let line = ''
      let currentY = y
      for(let i=0; i<words.length; i++){
        let test = line + words[i] + ' '
        let metrics = ctx.measureText(test)
        if(metrics.width > maxW && i > 0) {
          ctx.fillText(line, 300, currentY)
          line = words[i] + ' '
          currentY += 35
        } else {
          line = test
        }
      }
      ctx.fillText(line, 300, currentY)
      return currentY + 45
    }

    const userName = formData.name || 'सदस्य का नाम'
    const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    const userAddress = formData.address || 'पता उपलब्ध नहीं'

    const initialContentY = contentY;

    contentY = drawDetail('To', userName, contentY)
    contentY = drawDetail('Date', today, contentY)
    contentY = drawDetail('ID No', regNumber || 'NGO/XXXX/0000', contentY)
    contentY = drawDetail('Address', userAddress, contentY)

    if (formData.validFrom && formData.validUntil) {
      const formatFrom = formData.validFrom.split('-').reverse().join('/');
      const formatTo = formData.validUntil.split('-').reverse().join('/');
      contentY = drawDetail('Validity', `${formatFrom} to ${formatTo}`, contentY);
    }

    // Draw Candidate Image Top-Right
    if (photoImg) {
      const photoW = 140;
      const photoH = 175;
      const photoX = width - photoW - 120; // 120px from right
      const photoY = initialContentY; // align with 'To'
      
      ctx.lineWidth = 3;
      ctx.strokeStyle = primaryColor;
      ctx.strokeRect(photoX, photoY, photoW, photoH);
      ctx.drawImage(photoImg, photoX, photoY, photoW, photoH);
    }

    contentY += 25

    // Joining Letter Content (Hindi)
    ctx.fillStyle = '#334155'
    ctx.font = "500 24px 'Hind', sans-serif"
    
    const paragraphs = [
      `प्रिय ${userName},`,
      ``,
      `हमें आपको यह सूचित करते हुए अत्यंत हर्ष हो रहा है कि आपको "${org.full}" में ${formData.role || 'सदस्य'} के पद पर अवैतनिक नियुक्त किया गया है। आपका यह पंजीकरण साधू लक्ष्मी जनकल्याण ट्रस्ट के अंतर्गत किया गया है।`,
      '',
      `संस्था को यह पूर्ण विश्वास है कि आप अपने कौशल, अनुभव और निष्ठा के साथ हमारे संगठन के उद्देश्यों को प्राप्त करने में महत्वपूर्ण योगदान देंगे। हम आपसे यह अपेक्षा करते हैं कि आप संस्था के सभी नियमों और विनियमों का पूरी तरह से पालन करेंगे।`,
      ``,
      `हम आपके उज्ज्वल भविष्य की कामना करते हैं और संस्था परिवार में आपका हार्दिक स्वागत करते हैं।`
    ]

    const maxTextW = 1000
    paragraphs.forEach(para => {
      if(para === '') {
        contentY += 15
        return
      }
      let words = para.split(' ')
      let line = ''
      for(let i=0; i<words.length; i++){
        let test = line + words[i] + ' '
        let metrics = ctx.measureText(test)
        if(metrics.width > maxTextW && i > 0) {
          ctx.fillText(line, 120, contentY)
          line = words[i] + ' '
          contentY += 30
        } else {
          line = test
        }
      }
      ctx.fillText(line, 120, contentY)
      contentY += 30
    })

    contentY += 0; // Keep it tight

    contentY += 40; // Increased spacing to prevent overlapping text Block (Stacked)
    ctx.font = "bold 26px 'Poppins', sans-serif"
    ctx.fillStyle = '#1e293b'
    // ctx.fillText('Regards,', 120, contentY)

    contentY += 10; // Reduced spacing
    
    const blockCenterX = 240; // Center coordinate for the signature block
    
    // Draw Mohar/Stamp centered
    if (moharImg) {
      const stampSize = 180; // Size to match the reference
      const aspect = moharImg.width / moharImg.height;
      let drawW = stampSize;
      let drawH = stampSize;
      if (aspect > 1) {
        drawH = stampSize / aspect;
      } else {
        drawW = stampSize * aspect;
      }
      // Move stamp slightly higher relative to Regards
      ctx.drawImage(moharImg, blockCenterX - drawW / 2, contentY - 30, drawW, drawH);
      contentY += drawH - 70; // Overlap the signature tightly with the stamp
    }

    // Signature Image or Cursive centered
    if (signImg) {
      const targetW = 160;
      const targetH = targetW / (signImg.width / signImg.height);
      ctx.drawImage(signImg, blockCenterX - targetW / 2, contentY, targetW, targetH);
      contentY += targetH - 10; // Tighter spacing
    } else {
      contentY += 20
      ctx.fillStyle = primaryColor
      ctx.textAlign = 'center'
      ctx.font = "italic 48px 'Caveat', cursive, sans-serif"
      ctx.fillText('Sadhu Laxmi', blockCenterX, contentY)
      contentY += 20
      ctx.textAlign = 'left' // Reset
    }
    
    // Line under signature
    ctx.strokeStyle = '#cbd5e1'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(120, contentY)
    ctx.lineTo(360, contentY) // 240 +/- 120
    ctx.stroke()

    contentY += 25
    ctx.fillStyle = '#64748b'
    ctx.font = "600 22px 'Hind', sans-serif"
    ctx.textAlign = 'center'
    ctx.fillText('National President / राष्ट्रीय अध्यक्ष', blockCenterX, contentY)
    ctx.textAlign = 'left' // Reset

    // Contact Us Section (Bottom Right)
    const contactX = width - 120
    let contactY = contentY - 85 // start slightly higher

    // Draw QR Code
    if (qrImg) {
      const qrSize = 150;
      ctx.drawImage(qrImg, contactX - qrSize, contactY - 40, qrSize, qrSize);
      
      ctx.fillStyle = '#64748b'
      ctx.font = "500 14px 'Poppins', sans-serif"
      ctx.textAlign = 'center'
      ctx.fillText('Scan for User Details', contactX - (qrSize / 2), contactY + qrSize - 30)

      contactY += qrSize - 10; // Adjust spacing for Contact Us text below QR code
    }
    
    ctx.textAlign = 'right'
    ctx.font = "bold 26px 'Poppins', sans-serif"
    ctx.fillStyle = '#1e293b'
    ctx.fillText('Contact Us', contactX, contactY)
    
    contactY += 45
    ctx.font = "500 20px 'Poppins', sans-serif"
    ctx.fillStyle = '#64748b'
    
    // Align all elements to contactX so they are perfectly flush right
    // Phone
    ctx.fillText('+91-9569036324', contactX, contactY)
    // Email
    contactY += 35
    ctx.fillText('Shakti.singh20017@gmail.com', contactX, contactY)
    // Web
    contactY += 35
    ctx.fillText('https://www.sadhulaxmi.com/', contactX, contactY)

    // Bottom Wave
    ctx.fillStyle = secondaryColor
    ctx.beginPath()
    ctx.moveTo(width, height)
    ctx.lineTo(0, height)
    ctx.lineTo(0, height - 120)
    ctx.quadraticCurveTo(width / 2, height - 200, width, height - 70)
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = primaryColor
    ctx.beginPath()
    ctx.moveTo(width, height)
    ctx.lineTo(0, height)
    ctx.lineTo(0, height - 150)
    ctx.quadraticCurveTo(width / 2, height - 250, width, height - 100)
    ctx.closePath()
    ctx.fill()

    // Pass generated image to callback
    if (onGenerated) {
      onGenerated(canvas.toDataURL('image/png', 0.9))
    }
  }

  return (
    <div style={{ display: 'none' }}>
      <canvas ref={canvasRef} />
    </div>
  )
}

export default JoiningLetterGenerator
