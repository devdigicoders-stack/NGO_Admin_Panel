// admin_panel/src/utils/registrationUtils.js

export const orgs = [
  { id: 'main_trust',   short: 'साधू लक्ष्मी जनकल्याण ट्रस्ट',           full: 'साधू लक्ष्मी जनकल्याण ट्रस्ट (मुख्य संस्था)',                 color: '#d97706', icon: '🏛️', logo: '/company/main/9.png', prefix: 'SLJT' },
  { id: 'patrakar',     short: 'राष्ट्रीय पत्रकार समर्पित संघ',           full: 'राष्ट्रीय पत्रकार समर्पित संघ (मीडिया सेल)',              color: '#821905', icon: '📰', logo: '/company/main/7.png', prefix: 'RPS' },
  { id: 'crime',        short: 'राष्ट्रीय क्राइम इन्वेस्टिगेशन ब्यूरो',        full: 'राष्ट्रीय क्राइम इन्वेस्टिगेशन ब्यूरो (क्राइम कंट्रोल सेल)',        color: '#a8170c', icon: '🔍', logo: '/company/main/3.png', prefix: 'RCIB' },
  { id: 'chikitsa',     short: 'आखिल भारतीय चिकित्सा संघ',     full: 'आखिल भारतीय चिकित्सा संघ (अखिल भारतीय महिला सेल)',  color: '#d81b60', icon: '👩', logo: '/company/main/8.png', prefix: 'ABCS' },
  { id: 'hindu',        short: 'राष्ट्रीय हिन्दू महासभा साधू',           full: 'राष्ट्रीय हिन्दू महासभा साधू (राष्ट्रीय हिन्दू रक्षा सेना)',               color: '#e65100', icon: '🕉️', logo: '/company/main/4.png', prefix: 'RHM' },
  { id: 'journalist',   short: 'इंडियन काउंसिल ऑफ जर्नलिस्ट साधू',       full: 'इंडियन काउंसिल ऑफ जर्नलिस्ट साधू (इन्डियन काउंसिल ऑफ प्रेस)',    color: '#5e35b1', icon: '✍️', logo: '/company/main/5.png', prefix: 'ICJ' },
  { id: 'manav',        short: 'राइट टू रिकॉल मंच',   full: 'राइट टू रिकॉल मंच',    color: '#00701a', icon: '⚖️', logo: '/company/main/1.png', prefix: 'RMA' },
  { id: 'bhrashtachar',  short: 'भ्रष्टाचार उन्मूलन अपराध अनुसंधान केन्द्र साधू',    full: 'भ्रष्टाचार उन्मूलन अपराध अनुसंधान केन्द्र साधू (भ्रष्टाचार विरोधी सेल)',  color: '#c43e00', icon: '🛡️', logo: '/company/main/2.png', prefix: 'BUAC' },
  { id: 'muslim',       short: 'भारतीय मुस्लिम मंच',           full: 'भारतीय मुस्लिम मंच (भारतीय भारतीय मुस्लिम मंच)',                 color: '#004d40', icon: '☪️', logo: '/company/main/6.png', prefix: 'BMM' },
]

export const extraFields = {
  patrakar: [
    { id: 'press_id', label: 'प्रेस आईडी कार्ड नंबर', type: 'text', placeholder: 'प्रेस आईडी नंबर दर्ज करें', required: true },
    { id: 'publication', label: 'समाचार पत्र / चैनल का नाम', type: 'text', placeholder: 'संस्था का नाम', required: true },
    { id: 'reporting_area', label: 'रिपोर्टिंग क्षेत्र', type: 'text', placeholder: 'अपना रिपोर्टिंग क्षेत्र लिखें', required: true }
  ],
  crime: [
    { id: 'prior_exp', label: 'पूर्व सुरक्षा / कानूनी अनुभव', type: 'select', options: ['हाँ (Yes)', 'नहीं (No)'], required: true },
    { id: 'police_station', label: 'स्थानीय पुलिस स्टेशन का नाम', type: 'text', placeholder: 'थाने का नाम दर्ज करें', required: true },
    { id: 'special_skills', label: 'विशेष योग्यता / कौशल', type: 'text', placeholder: 'जैसे: जांच, सुरक्षा प्रबंधन आदि', required: true }
  ],
  chikitsa: [
    { id: 'service_field', label: 'समाज सेवा का मुख्य क्षेत्र', type: 'select', options: ['महिला सशक्तिकरण', 'स्वास्थ्य सेवा', 'शिक्षा प्रसार', 'समाज कल्याण', 'अन्य'], required: true },
    { id: 'prev_work', label: 'पूर्व सामाजिक कार्य का विवरण', type: 'textarea', placeholder: 'अपने पिछले सामाजिक कार्यों के बारे में संक्षेप में लिखें', required: true }
  ],
  hindu: [
    { id: 'shakha', label: 'स्थानीय क्षेत्र / शाखा (Branch)', type: 'text', placeholder: 'अपनी शाखा या क्षेत्र का नाम लिखें', required: true },
    { id: 'preferred_role', label: 'पसंदीदा सेवा योगदान', type: 'select', options: ['सांस्कृतिक संरक्षण', 'धार्मिक उत्सव प्रबंधन', 'समाज सेवा', 'अन्य'], required: true }
  ],
  journalist: [
    { id: 'council_role', label: 'परिषद में अपेक्षित भूमिका / पद', type: 'text', placeholder: 'जैसे: सदस्य, समन्वयक आदि', required: true },
    { id: 'edu_background', label: 'शैक्षिक / कानूनी पृष्ठभूमि', type: 'text', placeholder: 'अपनी शैक्षिक योग्यता या कानूनी अनुभव लिखें', required: true }
  ],
  manav: [
    { id: 'focus_area', label: 'मानवाधिकार मुख्य रुचि क्षेत्र', type: 'select', options: ['बाल श्रम निवारण', 'महिला अधिकार', 'शोषण के विरुद्ध', 'कानूनी सहायता', 'अन्य'], required: true },
    { id: 'advocacy_exp', label: 'अधिवक्ता / मानवाधिकार कार्य अनुभव', type: 'text', placeholder: 'यदि कोई पूर्व अनुभव हो, तो लिखें', required: true }
  ],
  bhrashtachar: [
    { id: 'rti_exp', label: 'सतर्कता एवं RTI अनुभव', type: 'select', options: ['हाँ (Yes)', 'नहीं (No)'], required: true },
    { id: 'dept', label: 'भ्रष्टाचार विरोधी अभियान में भूमिका', type: 'text', placeholder: 'अपनी इच्छित भूमिका लिखें', required: true }
  ],
  muslim: [
    { id: 'welfare_interest', label: 'कल्याणकारी प्रशिक्षण रुचि', type: 'select', options: ['मुफ़्त शिक्षा', 'रोजगार प्रशिक्षण', 'सामाजिक कल्याण', 'अन्य'], required: true },
    { id: 'local_masjid', label: 'स्थानीय संस्था / मस्जिद का नाम', type: 'text', placeholder: 'संस्था या मस्जिद का नाम लिखें', required: true }
  ],
  main_trust: []
}
