import { useRef, useEffect } from 'react'
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
    
    const letterLogoPath = letterLogos[org.id] || org.logo
    const [logoImg, signImg] = await Promise.all([
      loadImage(resolveImageUrl(letterLogoPath)),
      loadImage(org.id === 'muslim' ? '/mushlim/signM.png' : '/letter/sign.png')
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
    let contentY = Math.max(450, headerHeight + 80)
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

    contentY = drawDetail('To', userName, contentY)
    contentY = drawDetail('Date', today, contentY)
    contentY = drawDetail('ID No', regNumber || 'NGO/XXXX/0000', contentY)
    contentY = drawDetail('Address', userAddress, contentY)

    if (formData.validFrom && formData.validUntil) {
      const formatFrom = formData.validFrom.split('-').reverse().join('/');
      const formatTo = formData.validUntil.split('-').reverse().join('/');
      contentY = drawDetail('Validity', `${formatFrom} to ${formatTo}`, contentY);
    }

    contentY += 60

    // Joining Letter Content (Hindi)
    ctx.fillStyle = '#334155'
    ctx.font = "500 24px 'Hind', sans-serif"
    
    const paragraphs = [
      `प्रिय ${userName},`,
      ``,
      `हमें आपको यह सूचित करते हुए अत्यंत हर्ष हो रहा है कि आपको "${org.full}" में ${formData.role || 'सदस्य'} के पद पर नियुक्त किया गया है। आपका यह पंजीकरण साधू लक्ष्मी जनकल्याण ट्रस्ट के अंतर्गत किया गया है।`,
      '',
      `संस्था को यह पूर्ण विश्वास है कि आप अपने कौशल, अनुभव और निष्ठा के साथ हमारे संगठन के उद्देश्यों को प्राप्त करने में महत्वपूर्ण योगदान देंगे। हम आपसे यह अपेक्षा करते हैं कि आप संस्था के सभी नियमों और विनियमों का पूरी तरह से पालन करेंगे।`,
      ``,
      `हम आपके उज्ज्वल भविष्य की कामना करते हैं और संस्था परिवार में आपका हार्दिक स्वागत करते हैं।`
    ]

    const maxTextW = 1000
    paragraphs.forEach(para => {
      if(para === '') {
        contentY += 25
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
          contentY += 40
        } else {
          line = test
        }
      }
      ctx.fillText(line, 120, contentY)
      contentY += 40
    })

    contentY += 80

    // Regards & Signature
    ctx.font = "bold 26px 'Poppins', sans-serif"
    ctx.fillStyle = '#1e293b'
    ctx.fillText('Regards,', 120, contentY)

    // Signature Image or Cursive
    if (signImg) {
      const targetW = 160;
      const targetH = targetW / (signImg.width / signImg.height);
      ctx.drawImage(signImg, 120, contentY + 10, targetW, targetH);
      contentY += 10 + targetH + 10;
    } else {
      contentY += 80
      ctx.fillStyle = primaryColor
      ctx.font = "italic 48px 'Caveat', cursive, sans-serif"
      ctx.fillText('Sadhu Laxmi', 120, contentY)
      contentY += 45
    }
    
    // Line under signature
    ctx.strokeStyle = '#cbd5e1'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(120, contentY)
    ctx.lineTo(400, contentY)
    ctx.stroke()

    contentY += 20
    ctx.fillStyle = '#64748b'
    ctx.font = "600 22px 'Hind', sans-serif"
    ctx.fillText('National President / राष्ट्रीय अध्यक्ष', 120, contentY)

    // Contact Us Section (Bottom Right)
    const contactX = width - 120
    let contactY = contentY - 85 // start slightly higher
    
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
    // contactY += 35
    // // ctx.fillText('www.sadhulaxmitrust.org', contactX, contactY)

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
