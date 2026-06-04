import { useRef, useEffect } from 'react'
import { orgs } from '../utils/registrationUtils'
import { resolveImageUrl } from '../utils/imageUrl'

const IDCardGenerator = ({ orgId, formData = {}, regNumber, onGenerated }) => {
  const frontCanvasRef = useRef(null)
  const backCanvasRef = useRef(null)

  useEffect(() => {
    generateIDCard()
  }, [orgId, formData, regNumber])

  // Helper function to programmatically darken a hex color by a percentage
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

  const generateIDCard = async () => {
    const frontCanvas = frontCanvasRef.current
    const backCanvas = backCanvasRef.current
    if (!frontCanvas || !backCanvas) return

    const frontCtx = frontCanvas.getContext('2d')
    const backCtx = backCanvas.getContext('2d')

    const org = orgs.find(o => o.id === orgId) || orgs[0]
    const primaryColor = org.color || '#007ad9'
    const secondaryColor = darkenColor(primaryColor, 35)

    // Set dimensions for individual cards
    const cardWidth = 1012
    const cardHeight = 638
    
    frontCanvas.width = cardWidth
    frontCanvas.height = cardHeight
    backCanvas.width = cardWidth
    backCanvas.height = cardHeight

    // Helper to load image asynchronously
    const loadImage = (src) => {
      return new Promise((resolve) => {
        if (!src) {
          resolve(null)
          return
        }
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => resolve(img)
        img.onerror = () => {
          console.warn('Failed to load image:', src)
          resolve(null)
        }
        img.src = src
      })
    }

    // Wait for fonts to load
    try {
      if (document.fonts) {
        await document.fonts.ready
      }
    } catch (e) {
      console.warn('Font loading check failed:', e)
    }

    // Load logo and user photo in parallel
    const [logoImg, photoImg] = await Promise.all([
      loadImage(resolveImageUrl(org.logo)),
      loadImage(resolveImageUrl(formData.photo))
    ])

    // Enable high-quality anti-aliasing
    frontCtx.imageSmoothingEnabled = true
    frontCtx.imageSmoothingQuality = 'high'
    backCtx.imageSmoothingEnabled = true
    backCtx.imageSmoothingQuality = 'high'

    // ─────────────────────────────────────────────────────────────
    // COMMON DRAWING FUNCTION FOR SHAPES AND BORDERS
    // ─────────────────────────────────────────────────────────────
    const drawCardFrame = (ctx) => {
      // 1. White Card Background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, cardWidth, cardHeight)

      // 2. Double border (outer: thin theme color, inner: thin gold accent)
      ctx.strokeStyle = primaryColor
      ctx.lineWidth = 6
      ctx.strokeRect(3, 3, cardWidth - 6, cardHeight - 6)

      ctx.strokeStyle = '#d4af37' // Gold border
      ctx.lineWidth = 2
      ctx.strokeRect(9, 9, cardWidth - 18, cardHeight - 18)

      // 3. Abstract Geometric Shapes (Timmerman Style)
      // Top-Right Overlapping Polygons
      ctx.fillStyle = secondaryColor
      ctx.beginPath()
      ctx.moveTo(cardWidth - 190, 0)
      ctx.lineTo(cardWidth, 0)
      ctx.lineTo(cardWidth, 210)
      ctx.lineTo(cardWidth - 45, 210)
      ctx.closePath()
      ctx.fill()

      ctx.fillStyle = primaryColor
      ctx.beginPath()
      ctx.moveTo(cardWidth - 145, 0)
      ctx.lineTo(cardWidth, 0)
      ctx.lineTo(cardWidth, 160)
      ctx.lineTo(cardWidth - 35, 160)
      ctx.closePath()
      ctx.fill()

      // Bottom-Left Vertical Stripes
      ctx.fillStyle = secondaryColor
      ctx.fillRect(0, cardHeight - 190, 24, 190)

      ctx.fillStyle = primaryColor
      ctx.fillRect(24, cardHeight - 230, 24, 230)

      // Left Edge Angular Accent
      ctx.fillStyle = secondaryColor
      ctx.beginPath()
      ctx.moveTo(0, cardHeight - 330)
      ctx.lineTo(35, cardHeight - 300)
      ctx.lineTo(35, cardHeight - 150)
      ctx.lineTo(0, cardHeight - 180)
      ctx.closePath()
      ctx.fill()
    }

    // Helper to draw background diagonal grid lines (clipped)
    const drawGridLines = (ctx) => {
      ctx.save()
      ctx.beginPath()
      ctx.rect(10, 10, cardWidth - 20, cardHeight - 20)
      ctx.clip()

      ctx.strokeStyle = 'rgba(15, 23, 42, 0.025)' // Very subtle slate lines
      ctx.lineWidth = 1
      for (let i = -cardHeight; i < cardWidth; i += 28) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i + cardHeight, cardHeight)
        ctx.stroke()
      }
      ctx.restore()
    }

    // Helper to draw header titles
    const drawHeader = (ctx) => {
      // Community Logo (Top-Left)
      if (logoImg) {
        const logoHeight = 65
        const aspect = logoImg.width / logoImg.height
        const logoWidth = logoHeight * aspect
        // Center the circular part of the logo at x = 82.5 (equal to original center x = 50 + 65/2)
        const drawX = 82.5 - logoWidth / 2
        ctx.drawImage(logoImg, drawX, 30, logoWidth, logoHeight)
      }

      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'

      // Title 1: Organization short name (e.g. मीडिया सेल)
      ctx.fillStyle = secondaryColor
      ctx.font = "bold 28px 'Hind', sans-serif"
      ctx.fillText(org.short, 130, 30)

      // Title 2: Trust name
      ctx.fillStyle = '#64748b' // Slate 500
      ctx.font = "600 14px 'Hind', sans-serif"
      ctx.fillText('साधू लक्ष्मी जनकल्याण ट्रस्ट (रजि. नं. IV/175/26)', 130, 68)
    }

    // ─────────────────────────────────────────────────────────────
    // RENDER FRONT CARD
    // ─────────────────────────────────────────────────────────────
    drawCardFrame(frontCtx)
    drawGridLines(frontCtx)
    drawHeader(frontCtx)

    // Main Horizontal Banner (Theme Color)
    frontCtx.fillStyle = primaryColor
    frontCtx.fillRect(0, 115, cardWidth, 95)

    frontCtx.fillStyle = '#ffffff'
    frontCtx.textAlign = 'left'
    frontCtx.textBaseline = 'top'
    frontCtx.font = "bold 32px 'Hind', sans-serif"
    frontCtx.fillText((formData.name || 'सदस्य का नाम').toUpperCase(), 130, 125)

    frontCtx.font = "500 15px 'Hind', sans-serif"
    frontCtx.fillText('सदस्य (MEMBER)', 130, 168)

    // Draw member details
    let currentY = 250
    const drawDetailRow = (label, value) => {
      frontCtx.fillStyle = secondaryColor
      frontCtx.font = "bold 18px 'Hind', sans-serif"
      frontCtx.fillText(label, 130, currentY)

      frontCtx.fillStyle = '#334155'
      frontCtx.font = "500 18px 'Hind', sans-serif"
      frontCtx.fillText(': ' + value, 260, currentY)
      currentY += 42
    }

    drawDetailRow('ID No', regNumber || 'NGO/2026/000000')
    drawDetailRow('Email', formData.email || 'N/A')
    drawDetailRow('Phone', formData.mobile || 'N/A')

    // Handle Address with wrapping
    frontCtx.fillStyle = secondaryColor
    frontCtx.font = "bold 18px 'Hind', sans-serif"
    frontCtx.fillText('Address', 130, currentY)

    frontCtx.fillStyle = '#334155'
    frontCtx.font = "500 18px 'Hind', sans-serif"
    const addressVal = formData.address || 'N/A'
    const maxAddrW = 380
    let addrLine = ': '
    let addrY = currentY
    const addrWords = addressVal.split(' ')

    for (let i = 0; i < addrWords.length; i++) {
      const testLine = addrLine + (i === 0 && addrLine === ': ' ? '' : ' ') + addrWords[i]
      const metrics = frontCtx.measureText(testLine)
      if (metrics.width > maxAddrW && i > 0) {
        frontCtx.fillText(addrLine, 260, addrY)
        addrLine = addrWords[i]
        addrY += 24
      } else {
        addrLine = testLine
      }
    }
    frontCtx.fillText(addrLine, 260, addrY)

    // ── Holder's Signature Section (Bottom-Left) ──
    const holderSigX1 = 130
    const holderSigX2 = 350
    const holderSigY = 525

    frontCtx.strokeStyle = '#cbd5e1'
    frontCtx.lineWidth = 1.5
    frontCtx.beginPath()
    frontCtx.moveTo(holderSigX1, holderSigY)
    frontCtx.lineTo(holderSigX2, holderSigY)
    frontCtx.stroke()

    frontCtx.fillStyle = '#64748b'
    frontCtx.font = "600 13px 'Hind', sans-serif"
    frontCtx.textAlign = 'left'
    frontCtx.textBaseline = 'top'
    frontCtx.fillText('धारक का हस्ताक्षर / Holder\'s Signature', holderSigX1 + 10, holderSigY + 6)

    // ── Draw Member Photo inside theme-colored border (Right Side) ──
    const photoX = 680
    const photoY = 250
    const photoW = 220
    const photoH = 270

    frontCtx.strokeStyle = primaryColor
    frontCtx.lineWidth = 4
    frontCtx.strokeRect(photoX, photoY, photoW, photoH)

    if (photoImg) {
      frontCtx.drawImage(photoImg, photoX + 2, photoY + 2, photoW - 4, photoH - 4)
    } else {
      frontCtx.fillStyle = '#f8fafc'
      frontCtx.fillRect(photoX + 2, photoY + 2, photoW - 4, photoH - 4)
      frontCtx.fillStyle = '#94a3b8'
      frontCtx.font = "bold 14px 'Hind', sans-serif"
      frontCtx.textAlign = 'center'
      frontCtx.textBaseline = 'middle'
      frontCtx.fillText('फोटो उपलब्ध नहीं', photoX + photoW / 2, photoY + photoH / 2)
    }

    // ── Authorized Signatory & Official Stamp (Below Photo) ──
    const authSigLineX1 = 680
    const authSigLineX2 = 900
    const authSigLineY = 525

    // Signatory Line
    frontCtx.strokeStyle = '#cbd5e1'
    frontCtx.lineWidth = 1.5
    frontCtx.beginPath()
    frontCtx.moveTo(authSigLineX1, authSigLineY)
    frontCtx.lineTo(authSigLineX2, authSigLineY)
    frontCtx.stroke()

    // Signatory Label
    frontCtx.fillStyle = '#64748b'
    frontCtx.font = "600 13px 'Hind', sans-serif"
    frontCtx.textAlign = 'center'
    frontCtx.textBaseline = 'top'
    frontCtx.fillText('प्राधिकृत हस्ताक्षरकर्ता / Auth. Signatory', (authSigLineX1 + authSigLineX2) / 2, authSigLineY + 6)

    // Cursive Blue Signature
    frontCtx.save()
    frontCtx.fillStyle = '#1d4ed8' // Royal Blue ink
    frontCtx.font = "italic 36px 'Caveat', cursive, sans-serif"
    frontCtx.textAlign = 'center'
    frontCtx.textBaseline = 'bottom'
    frontCtx.fillText('Sadhu Laxmi', (authSigLineX1 + authSigLineX2) / 2, authSigLineY - 6)
    frontCtx.restore()

    // Red Trust Stamp
    frontCtx.save()
    frontCtx.translate((authSigLineX1 + authSigLineX2) / 2, 445)
    frontCtx.rotate(-11 * Math.PI / 180)
    frontCtx.strokeStyle = 'rgba(220, 38, 38, 0.72)'
    frontCtx.fillStyle = 'rgba(220, 38, 38, 0.72)'
    
    frontCtx.lineWidth = 2.5
    frontCtx.beginPath()
    frontCtx.arc(0, 0, 45, 0, 2 * Math.PI)
    frontCtx.stroke()

    frontCtx.lineWidth = 1
    frontCtx.beginPath()
    frontCtx.arc(0, 0, 39, 0, 2 * Math.PI)
    frontCtx.stroke()

    frontCtx.textAlign = 'center'
    frontCtx.textBaseline = 'middle'
    frontCtx.font = "bold 9px 'Hind', sans-serif"
    frontCtx.fillText('साधू लक्ष्मी', 0, -11)
    frontCtx.fillText('जनकल्याण ट्रस्ट', 0, 3)
    frontCtx.font = "bold 8px 'Hind', sans-serif"
    frontCtx.fillText('रजि०', 0, 16)

    // Grunge/Distress effect
    frontCtx.strokeStyle = '#ffffff'
    frontCtx.lineWidth = 1.2
    for (let i = 0; i < 4; i++) {
      frontCtx.beginPath()
      frontCtx.moveTo(Math.random() * 80 - 40, Math.random() * 80 - 40)
      frontCtx.lineTo(Math.random() * 80 - 40, Math.random() * 80 - 40)
      frontCtx.stroke()
    }
    frontCtx.restore()


    // ─────────────────────────────────────────────────────────────
    // RENDER BACK CARD
    // ─────────────────────────────────────────────────────────────
    drawCardFrame(backCtx)
    drawGridLines(backCtx)
    drawHeader(backCtx)

    // Back Card Main Bar
    backCtx.fillStyle = primaryColor
    backCtx.fillRect(0, 115, cardWidth, 95)

    backCtx.fillStyle = '#ffffff'
    backCtx.textAlign = 'left'
    backCtx.textBaseline = 'top'
    backCtx.font = "bold 26px 'Poppins', sans-serif"
    backCtx.fillText('TERMS & CONDITIONS', 130, 125)

    backCtx.font = "600 15px 'Hind', sans-serif"
    backCtx.fillText('नियम एवं शर्तें', 130, 168)

    // Terms Bullet Points
    const rules = [
      '1. यह पहचान पत्र साधू लक्ष्मी जनकल्याण ट्रस्ट का अधिकृत दस्तावेज है।',
      '2. संगठन से संबंधित कार्यों के दौरान इसे सदैव धारण करना अनिवार्य है।',
      '3. कार्ड खो जाने या चोरी होने पर तुरंत संगठन कार्यालय को सूचित करें।',
      '4. किसी भी अनधिकृत गतिविधि या दुरुपयोग पर यह कार्ड तत्काल रद्द माना जाएगा।'
    ]

    backCtx.fillStyle = '#334155'
    backCtx.font = "600 16px 'Hind', sans-serif"
    backCtx.textAlign = 'left'
    backCtx.textBaseline = 'top'

    let ruleY = 260
    rules.forEach(rule => {
      backCtx.fillText(rule, 130, ruleY)
      ruleY += 45
    })

    // Trust Website Link at the Bottom
    backCtx.fillStyle = '#475569'
    backCtx.font = "italic bold 22px 'Poppins', sans-serif"
    backCtx.textAlign = 'center'
    backCtx.fillText('www.sadhulaxmitrust.org', cardWidth / 2, 520)

    // Return the generated image URLs (front and back separate) to the callback
    if (onGenerated) {
      onGenerated({
        front: frontCanvas.toDataURL('image/png'),
        back: backCanvas.toDataURL('image/png')
      })
    }
  }

  return (
    <div style={{ display: 'none' }}>
      <canvas ref={frontCanvasRef} />
      <canvas ref={backCanvasRef} />
    </div>
  )
}

export default IDCardGenerator
