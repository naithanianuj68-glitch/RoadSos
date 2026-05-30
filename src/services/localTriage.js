/**
 * Local AI Triage Engine — trained response database
 * Works 100% offline, no API key needed.
 * Covers: accident types, medical emergencies, vehicle breakdowns, 
 * crime/safety, multilingual (Hindi, Tamil, Telugu, English)
 */

const TRIAGE_RULES = [
  // ─── SEVERE ACCIDENTS ───
  {
    keywords: ['crash', 'crashed', 'collision', 'hit', 'accident', 'smash', 'wreck', 'rollover', 'flipped', 'overturned', 'pile up', 'pileup'],
    filter: 'ambulance',
    response: `🚨 **Accident detected. Stay calm.**

• If you can move safely, get away from the vehicle and traffic
• Call **112** (universal emergency) or **108** (ambulance) immediately
• Turn on hazard lights if the vehicle is still accessible
• Do NOT move an injured person unless there is immediate danger (fire, flood)
• If there is bleeding, apply pressure with a clean cloth

I've filtered the map to show **ambulances & hospitals** near you.`,
  },
  
  // ─── BLEEDING / INJURY ───
  {
    keywords: ['bleeding', 'blood', 'wound', 'cut', 'fracture', 'broken bone', 'hurt', 'injured', 'injury', 'pain', 'unconscious', 'fainted', 'not breathing'],
    filter: 'hospital',
    response: `🏥 **Medical emergency detected.**

• Call **108** (ambulance) immediately
• If bleeding: apply firm, direct pressure with a clean cloth
• If unconscious but breathing: place them in the **recovery position** (on their side)
• If not breathing: begin **CPR** — 30 chest compressions, 2 rescue breaths
• Do NOT give water or food to an unconscious person
• Keep the person warm and still until help arrives

Showing **nearest hospitals** on the map.`,
  },

  // ─── FIRE ───
  {
    keywords: ['fire', 'burning', 'flames', 'smoke', 'explosion', 'blast', 'explode'],
    filter: 'ambulance',
    response: `🔥 **Fire/Explosion emergency!**

• Move away from the vehicle immediately — at least 30 meters
• Call **101** (Fire) and **112** (Emergency)
• Do NOT try to extinguish a vehicle fire yourself unless you have an extinguisher and it's small
• If someone's clothes are on fire: **STOP, DROP, ROLL**
• Cover your nose and mouth with a wet cloth if there's smoke
• Alert other vehicles — wave them away from the scene

Showing **fire stations & ambulances** near you.`,
  },

  // ─── TYRE / BREAKDOWN ───
  {
    keywords: ['tire', 'tyre', 'flat', 'puncture', 'burst', 'deflated'],
    filter: 'mechanic',
    response: `🔧 **Flat tyre / puncture detected.**

• Pull over to a safe spot away from traffic
• Turn on your **hazard lights** immediately
• Place a warning triangle 50m behind your vehicle
• If you have a spare, change it on a flat surface
• If not, stay in the vehicle with doors locked and call for help

Showing **puncture shops & mechanics** near you.`,
  },

  {
    keywords: ['breakdown', 'engine', 'won\'t start', 'stalled', 'overheating', 'overheat', 'battery', 'dead battery', 'no power', 'car stopped', 'vehicle stopped', 'not starting'],
    filter: 'mechanic',
    response: `🚗 **Vehicle breakdown detected.**

• Move to the left shoulder/side of the road if possible
• Turn on hazard lights immediately
• Place a warning triangle behind your vehicle
• Pop the hood to signal distress to passing vehicles
• Stay inside the vehicle if on a highway — it's safer
• Do NOT attempt engine repairs on a busy road

Showing **mechanics & repair shops** near you.`,
  },

  // ─── TOWING ───
  {
    keywords: ['tow', 'towing', 'drag', 'stuck', 'ditch', 'mud', 'stranded', 'cannot move', 'can\'t move'],
    filter: 'mechanic',
    response: `🚚 **Towing assistance needed.**

• Ensure your vehicle is not blocking traffic
• Turn on hazard lights
• If in a ditch/mud, do NOT rev the engine — it makes it worse
• Take photos of the situation for insurance
• Stay with your vehicle until the tow truck arrives

Showing **towing services & mechanics** near you.`,
  },

  // ─── POLICE / CRIME ───
  {
    keywords: ['police', 'rob', 'robbery', 'theft', 'stolen', 'carjack', 'fight', 'assault', 'attack', 'danger', 'threatening', 'weapon', 'gun', 'knife', 'harassment', 'road rage'],
    filter: 'police',
    response: `🚔 **Safety threat detected.**

• Lock your doors and close windows immediately
• Call **100** (Police) or **112** (Emergency)
• Do NOT confront the attacker
• Try to drive to the nearest populated/well-lit area
• Note down details: vehicle number, appearance, direction
• If carjacked, give up the vehicle — your life is more important

Showing **nearest police stations** on the map.`,
  },

  // ─── MEDICAL / PHARMACY ───
  {
    keywords: ['headache', 'medicine', 'pill', 'tablet', 'fever', 'nausea', 'vomiting', 'allergy', 'allergic', 'dizzy', 'dizziness', 'pharmacy', 'drugstore', 'medical store', 'first aid kit'],
    filter: 'pharmacy',
    response: `💊 **Minor medical issue — pharmacy recommended.**

• If symptoms are mild, visit a nearby pharmacy
• For severe allergic reactions (swelling, difficulty breathing), call **108** immediately
• Stay hydrated and rest
• Avoid self-medicating with strong drugs without consulting a doctor

Showing **pharmacies** near you.`,
  },

  // ─── SHOWROOM / SERVICE ───
  {
    keywords: ['showroom', 'service center', 'service centre', 'car service', 'oil change', 'maintenance', 'repair shop', 'garage'],
    filter: 'mechanic',
    response: `🏭 **Vehicle service needed.**

• For routine maintenance, a nearby showroom/service centre can help
• If your vehicle is making unusual noises, avoid driving at high speed
• Check your dashboard warning lights for specific issues

Showing **car showrooms & service centres** near you.`,
  },

  // ─── HINDI ───
  {
    keywords: ['madad', 'help karo', 'dard', 'chot', 'khoon', 'accident ho gaya', 'gaadi', 'toot', 'police bulao', 'ambulance bulao', 'aag', 'hospital', 'dawai'],
    filter: 'hospital',
    response: `🚨 **आपकी मदद आ रही है।**

• शांत रहें — मदद रास्ते में है
• **112** पर कॉल करें (आपातकालीन)
• **108** — एम्बुलेंस के लिए
• **100** — पुलिस के लिए
• **101** — अग्निशमन सेवा
• अगर खून बह रहा है, तो साफ कपड़े से दबाव डालें
• घायल व्यक्ति को हिलाएं नहीं

मैप पर **नजदीकी अस्पताल और एम्बुलेंस** दिखाए गए हैं।`,
  },

  // ─── TAMIL ───
  {
    keywords: ['udavi', 'help pannu', 'accident aachi', 'blood varuthu', 'vali', 'police koopu', 'ambulance koopu', 'nerupu', 'marunthu'],
    filter: 'hospital',
    response: `🚨 **உதவி வருகிறது.**

• அமைதியாக இருங்கள்
• **112** — அவசர உதவி எண்
• **108** — ஆம்புலன்ஸ்
• **100** — காவல்துறை
• **101** — தீயணைப்பு
• இரத்தம் வந்தால், சுத்தமான துணியால் அழுத்தம் கொடுங்கள்

வரைபடத்தில் **அருகிலுள்ள மருத்துவமனை** காட்டப்பட்டுள்ளது.`,
  },

  // ─── TELUGU ───
  {
    keywords: ['sahayam', 'accident ayyindi', 'noppi', 'raktham', 'police pilavu', 'ambulance pilavu', 'mandu'],
    filter: 'hospital',
    response: `🚨 **సహాయం వస్తోంది.**

• ప్రశాంతంగా ఉండండి
• **112** — ఎమర్జెన్సీ
• **108** — అంబులెన్స్
• **100** — పోలీసులు
• **101** — అగ్నిమాపక సేవ
• రక్తస్రావం ఉంటే, శుభ్రమైన గుడ్డతో ఒత్తిడి అన్వయించండి

మ్యాప్‌లో **సమీపంలోని ఆసుపత్రి** చూపబడింది.`,
  },

  // ─── BYSTANDER ───
  {
    keywords: ['someone', 'bystander', 'witness', 'saw accident', 'another person', 'they are', 'he is', 'she is', 'person lying', 'person on road', 'help someone', 'i saw'],
    filter: 'ambulance',
    response: `👤 **Bystander assistance mode.**

Thank you for helping! Here's what to do:

• **Call 112 immediately** and describe the location clearly
• Check if the victim is conscious — talk to them, keep them calm
• Do NOT move the victim unless there's immediate danger
• If trained, check breathing and pulse — begin CPR if needed
• Control any visible bleeding with pressure
• Direct traffic away from the scene
• Stay until professional help arrives

Showing **ambulances & hospitals** on the map for the victim.`,
  },
];

// ─── Fallback response when no keywords match ───
const FALLBACK_RESPONSE = {
  filter: 'hospital',
  response: `🆘 **I understand you need help.**

Here's what to do right now:

• If it's a medical emergency → Call **108** (Ambulance)
• If it's a crime/danger → Call **100** (Police)
• If it's a fire → Call **101** (Fire)
• Universal emergency → Call **112**

I've shown **all nearby emergency services** on the map. Use the filter tabs above to find specific services.

💡 *Tip: You can describe your situation in Hindi, Tamil, or Telugu too!*`,
};

// ─── DIRECT CALL RULES ───
// When the user says "call X", auto-dial the number
const CALL_RULES = [
  { keywords: ['call ambulance', 'call 108', 'ambulance bulao', 'ambulance call', 'need ambulance'], number: '108', label: 'Ambulance', filter: 'ambulance' },
  { keywords: ['call police', 'call 100', 'police bulao', 'police call', 'need police', 'call cops'], number: '100', label: 'Police', filter: 'police' },
  { keywords: ['call fire', 'call 101', 'fire brigade', 'fire call', 'need fire'], number: '101', label: 'Fire Brigade', filter: 'ambulance' },
  { keywords: ['call emergency', 'call 112', 'emergency call', 'help call', 'sos call'], number: '112', label: 'Emergency', filter: 'hospital' },
  { keywords: ['call hospital', 'hospital call', 'need hospital', 'nearest hospital call'], number: '108', label: 'Ambulance (for hospital)', filter: 'hospital' },
  { keywords: ['call mechanic', 'mechanic call', 'need mechanic', 'call tow', 'tow call', 'call garage'], number: '112', label: 'Emergency (for roadside help)', filter: 'mechanic' },
  { keywords: ['call pharmacy', 'pharmacy call', 'need medicine', 'call medical'], number: '108', label: 'Health Helpline', filter: 'pharmacy' },
  { keywords: ['call doctor', 'doctor call', 'need doctor'], number: '108', label: 'Ambulance (Doctor)', filter: 'hospital' },
  // Hindi
  { keywords: ['phone karo', 'call karo', 'phone laga', 'call laga'], number: '112', label: 'Emergency', filter: 'hospital' },
  { keywords: ['ambulance ko call', 'ambulance phone'], number: '108', label: 'Ambulance', filter: 'ambulance' },
  { keywords: ['police ko call', 'police phone', 'police ko bulao'], number: '100', label: 'Police', filter: 'police' },
];

/**
 * Process user input and return a triage response with a filter tag.
 * @param {string} userInput - The user's message
 * @returns {{ response: string, filter: string, callNumber?: string, callLabel?: string }}
 */
export const getLocalTriageResponse = (userInput) => {
  const input = userInput.toLowerCase().trim();

  // ── Step 1: Check for direct CALL intent ──
  for (const rule of CALL_RULES) {
    for (const kw of rule.keywords) {
      if (input.includes(kw)) {
        return {
          response: `📞 **Calling ${rule.label} (${rule.number}) now...**\n\nYour phone's dialer will open automatically. If it doesn't, tap the number below:\n\n👉 **[${rule.number}](tel:${rule.number})**\n\nStay on the line and clearly state:\n• Your **location** (road name, landmark)\n• What happened (accident, fire, medical emergency)\n• Number of people injured\n• Your name and phone number`,
          filter: rule.filter,
          callNumber: rule.number,
          callLabel: rule.label,
        };
      }
    }
  }

  // ── Step 2: Score each triage rule by keyword match ──
  let bestMatch = null;
  let bestScore = 0;

  for (const rule of TRIAGE_RULES) {
    let score = 0;
    for (const kw of rule.keywords) {
      if (input.includes(kw.toLowerCase())) {
        score += kw.length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = rule;
    }
  }

  if (bestMatch && bestScore > 0) {
    return {
      response: bestMatch.response,
      filter: bestMatch.filter,
    };
  }

  return {
    response: FALLBACK_RESPONSE.response,
    filter: FALLBACK_RESPONSE.filter,
  };
};
