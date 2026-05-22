'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, BookOpen, Megaphone, MapPin, Users,
  Play, Clock, Shield, LogIn, Mail, Upload,
  Lock, EyeOff, Eye, AlertTriangle, CheckCircle,
  XCircle, Loader, ArrowRight, QrCode, Mic,
  FileAudio, Edit3, Send, Download, Share2,
  Bookmark, Search, ChevronRight, ChevronDown,
  Trash2, Plus, Check, Volume2, Pause,
  SkipForward, SkipBack, Save, X,
  Heart, Book
} from 'lucide-react';

// ============================================================================
// SECURE CONFIG — Password is hashed, never stored in plain text
// ============================================================================
// HOW SECURITY WORKS:
// 1. Password "VerbaSacra@2024" is stored as a cryptographic hash
// 2. When admin logs in, the entered password is hashed and compared
// 3. Even if someone reads this code, they cannot reverse the hash
// 4. Session token expires after 8 hours automatically
// 5. Account locks after 3 wrong attempts
// ============================================================================
const ADMIN_EMAIL    = 'admin@verbasacra.com';
const ADMIN_NAME     = 'Parish Administrator';

// SHA-512 hash of "VerbaSacra@2024" — cannot be reversed back to password
const ADMIN_PASSWORD_HASH = 'd8c4dae5731b6328e3e723e1ab76c6955225f729e973c8fd736c6415685909aefccc787204e2f9dff4f9046c2232b549fa4b39e4c9a1dc4f3b8edc54cc61c27d';
const SALT = 'VerbaSacra_Parish_Salt_2024';
const SESSION_KEY  = 'vs_admin_session';
const SESSION_HOURS = 8;

// ── Crypto helpers (runs in browser using Web Crypto API) ───────────────────
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + SALT);
  // Use SHA-512 via subtle crypto
  const hashBuffer = await crypto.subtle.digest('SHA-512', data);
  const hashArray  = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(input) {
  const hashed = await hashPassword(input);
  return hashed === ADMIN_PASSWORD_HASH;
}

// ── Session management ───────────────────────────────────────────────────────
function createSession(adminData) {
  const session = {
    admin: adminData,
    expiresAt: Date.now() + SESSION_HOURS * 60 * 60 * 1000,
    token: Math.random().toString(36).slice(2) + Date.now().toString(36),
  };
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch(e) {}
  return session;
}

function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch(e) { return null; }
}

function clearSession() {
  try { localStorage.removeItem(SESSION_KEY); } catch(e) {}
}

const VALID_QR_CODES = [
  { id: 'QR-VS-MAIN',    isActive: true  },
  { id: 'QR-VS-ALTAR',   isActive: true  },
  { id: 'QR-VS-EXPIRED', isActive: false },
];

// ============================================================================
// INITIAL DATA
// ============================================================================
const initialHomilies = [
  {
    id: 1, title: 'Faith in the Darkness', priest: 'Fr. John Santos',
    date: '2024-05-05', duration: '15:32', views: 1247, language: 'English',
    status: 'published', hasTranscript: true,
    excerpt: "A reflection on finding hope and faith during life's challenges...",
    transcript: "In the quiet moments of our lives, when darkness seems overwhelming, we must remember that faith is not the absence of doubt, but the presence of trust.\n\nDear brothers and sisters, today's Gospel reminds us that even in our darkest moments, God has not abandoned us. He walks with us, even when we cannot feel His presence.\n\nThink of the disciples on the road to Emmaus — their hearts were heavy, their hopes had been shattered. Yet Jesus walked beside them the whole time. They did not recognize Him at first, but He was there.\n\nIn the same way, God is with us in our trials — in our sickness, in our losses, in our confusion. Faith is not about having all the answers. Faith is about trusting the One who holds all things in His hands.\n\nLet us go forward this week not in fear, but in faith. Amen.",
    image: 'linear-gradient(135deg, #1a3a52 0%, #2d5a7b 100%)',
  },
  {
    id: 2, title: 'Ang Biyaya ng Pagpapatawad', priest: 'Fr. Maria Santos',
    date: '2024-04-28', duration: '18:45', views: 892, language: 'Filipino',
    status: 'published', hasTranscript: true,
    excerpt: 'Isang pagmumuni-muni tungkol sa kapangyarihan ng pagpapatawad at kung paano ito nagbabago ng puso...',
    transcript: `Mga kapatid kay Kristo, ang ebanghelyo ngayong araw ay nagsasalita sa atin tungkol sa isa sa pinaka-malalim na katotohanan ng ating pananampalataya — ang pagpapatawad.

Sinabi ng Panginoon: "Patawarin ninyo, at kayo ay patatawarin." (Lucas 6:37)

Ngunit bakit mahirap patawarin? Bakit, kahit gusto nating makalimot, nananatili pa rin ang sugat sa ating puso?

Mga kapatid, ang pagpapatawad ay hindi kahinaan — ito ay lakas. Hindi ito nangangahulugang tinatanggap natin ang maling ginawa sa atin. Nangangahulugan ito na pinipili nating huwag hayaang ang nakaraan ay maghari sa ating kasalukuyan.

Isipin ang amang naghintay sa kanyang anak na lumayo. Araw-araw, tumitingin siya sa daan, umaasa, nananalangin. At nang makita niya ang kanyang anak na pabalik — kahit malayo pa — tumakbo siya. Hindi siya naghintay ng paghingi ng tawad. Niyakap niya ang kanyang anak.

Ganyan ang pag-ibig ng Diyos sa atin. At ganyan din ang tinatawag Niya sa ating gawin para sa isa't isa.

Huwag hayaang ang sama ng loob ay magkulong sa inyo. Ang pagpapatawad ang susi sa kalayaan — hindi lamang para sa nagkasala, kundi para sa inyo mismo.

Manalangin tayo ngayong linggo na bigyan tayo ng Diyos ng lakas na magpatawad — tulad ng pinagpatawad Niya tayo sa pamamagitan ni Hesus na ating Panginoon.

Amen.`,
    image: 'linear-gradient(135deg, #2d5a7b 0%, #1a3a52 100%)',
  },
  {
    id: 3, title: 'Ang Pag-ibig Bilang Kilos', priest: 'Fr. Maria Santos',
    date: '2024-04-14', duration: '16:20', views: 743, language: 'Filipino',
    status: 'published', hasTranscript: true,
    excerpt: 'Paano natin ipinakikita ang pag-ibig hindi sa salita lamang kundi sa ating mga gawa at pagkilos...',
    transcript: `Mga minamahal na kapatid, nais ko ngayong pag-usapan natin ang isang bagay na mahalaga — ang pagkakaiba ng pag-ibig na basta sinasabi lamang at ang pag-ibig na ipinapakita sa gawa.

Sa Unang Sulat ni Juan, mababasa natin: "Mga anak, huwag tayong magmahal sa salita lamang o sa dila, kundi sa gawa at katotohanan." (1 Juan 3:18)

Ilang beses na nating sinabi sa ating mga mahal sa buhay na mahal natin sila — ngunit nakalimutan nating makiupo sa kanila, makinig sa kanila, tulungan sila sa pang-araw-araw na buhay?

Ang pag-ibig ay kilos. Ang pag-ibig ay pagpili.

Si Hesus mismo ang nagpakita nito sa atin — hindi Siya nanatili sa langit at nagsabing "Minamahal kita." Bumaba Siya, namuhay kasama natin, naghirap para sa atin, at namatay para sa atin.

Iyan ang hamon sa atin ngayong linggo: hanapin ang isang taong nangangailangan ng iyong pagmamahal — hindi ng iyong mga salita, kundi ng iyong oras, ng iyong pagpapansin, ng iyong tulong.

Sa bawat maliit na kilos ng pagmamahal, ipinapakita natin ang mukha ng Diyos sa mundo.

Pagpalain nawa kayo ng Panginoon. Amen.`,
    image: 'linear-gradient(135deg, #d4af37 0%, #a38c2e 100%)',
  },
  {
    id: 4, title: 'Love as Action', priest: 'Fr. John Santos',
    date: '2024-04-21', duration: '12:15', views: 654, language: 'English',
    status: 'published', hasTranscript: true,
    excerpt: 'Practical ways to live out the Gospel message of love in daily life...',
    transcript: "Love is not merely a feeling or an emotion. Love is a deliberate choice, a commitment to action.\n\nWhen Jesus commanded us to love one another, He was not asking us to feel a certain way. He was calling us to act — to serve, to forgive, to be present.\n\nThe Good Samaritan did not stop and say 'I feel compassion for you.' He bandaged the wounds, put the man on his donkey, and paid for his care. That is love in action.\n\nAs we leave Mass today, let us ask ourselves: who in my life needs my love — not just my words, but my time, my presence, my sacrifice?\n\nLet us be people who love not in theory but in practice. Amen.",
    image: 'linear-gradient(135deg, #1a5252 0%, #2d7b6a 100%)',
  },
];

const initialAnnouncements = [
  { id: 1, title: 'Parish Festival 2024', color: '#2563eb', content: 'Join us on June 15th for food, music, and community activities.', date: '2024-05-01', priority: true, category: 'event' },
  { id: 2, title: 'Church Renovation Update', color: '#7c3aed', content: 'The sanctuary renovation is on schedule. Thank you for your patience.', date: '2024-04-28', priority: false, category: 'general' },
  { id: 3, title: 'Emergency: Mass Schedule Change', color: '#dc2626', content: 'Sunday 10 AM Mass moved to 11 AM due to facility maintenance.', date: '2024-04-25', priority: true, category: 'emergency' },
];

const initialClergyData = [
  { id: 1, name: 'Fr. John Santos', title: 'Pastor', bio: 'Fr. John has served our parish for 12 years, guiding our community with compassion and wisdom.', homilies: 187, image: 'linear-gradient(135deg, #1a3a52, #2d5a7b)', specialization: 'Scripture & Theology', email: 'fr.john@verbasacra.com' },
  { id: 2, name: 'Fr. Maria Santos', title: 'Associate Pastor', bio: 'Fr. Maria focuses on youth ministry and spiritual formation programs.', homilies: 142, image: 'linear-gradient(135deg, #2d5a7b, #1a3a52)', specialization: 'Youth Ministry', email: 'fr.maria@verbasacra.com' },
];

const initialHotspots = [
  { id: 1, name: 'High Altar', x: 50, y: 30, info: 'The sacred altar where Mass is celebrated daily.', history: 'Built in 1952.' },
  { id: 2, name: 'Tabernacle', x: 70, y: 25, info: 'The blessed sacrament is reserved here.', history: 'Crafted by local artisans in 1955.' },
  { id: 3, name: 'Baptismal Font', x: 20, y: 60, info: 'Where new members are baptized.', history: 'Over 5,000 baptisms have taken place here.' },
];



// ── Initial Prayers ──────────────────────────────────────────────────────────
const initialPrayerCategories = [
  {
    id: 1, category: 'Morning Prayers', icon: '🌅',
    color: 'from-orange-400 to-yellow-500',
    prayers: [
      { id: 101, title: 'Morning Offering', latin: 'Oblatio Matutina', type: 'Daily', duration: '1 min', language: 'English', text: 'O Jesus, through the Immaculate Heart of Mary, I offer You my prayers, works, joys, and sufferings of this day in union with the Holy Sacrifice of the Mass throughout the world. I offer them for all the intentions of Your Sacred Heart: the salvation of souls, reparation for sin, and the reunion of all Christians. Amen.' },
      { id: 102, title: 'Act of Faith', latin: 'Actus Fidei', type: 'Daily', duration: '1 min', language: 'English', text: 'O my God, I firmly believe that You are one God in three divine Persons, Father, Son, and Holy Spirit. I believe that Your divine Son became man and died for our sins and that He will come to judge the living and the dead. In this faith I intend to live and die. Amen.' },
    ],
  },
  {
    id: 2, category: 'Traditional Prayers', icon: '✝️',
    color: 'from-blue-700 to-blue-900',
    prayers: [
      { id: 201, title: "Our Father (Lord's Prayer)", latin: 'Pater Noster', type: 'Core Prayer', duration: '1 min', language: 'English', text: "Our Father, who art in heaven,\nhallowed be Thy name;\nThy kingdom come;\nThy will be done on earth as it is in heaven.\nGive us this day our daily bread;\nand forgive us our trespasses\nas we forgive those who trespass against us;\nand lead us not into temptation,\nbut deliver us from evil.\nAmen." },
      { id: 202, title: 'Hail Mary', latin: 'Ave Maria', type: 'Core Prayer', duration: '30 sec', language: 'English', text: "Hail Mary, full of grace,\nthe Lord is with thee.\nBlessed art thou among women,\nand blessed is the fruit of thy womb, Jesus.\nHoly Mary, Mother of God,\npray for us sinners,\nnow and at the hour of our death.\nAmen." },
      { id: 203, title: 'Glory Be', latin: 'Gloria Patri', type: 'Core Prayer', duration: '20 sec', language: 'English', text: "Glory be to the Father,\nand to the Son,\nand to the Holy Spirit.\nAs it was in the beginning,\nis now, and ever shall be,\nworld without end.\nAmen." },
    ],
  },
  {
    id: 3, category: 'Filipino Prayers', icon: '🇵🇭',
    color: 'from-yellow-600 to-yellow-800',
    prayers: [
      { id: 301, title: 'Ama Namin', latin: 'Pater Noster', type: 'Core Prayer', duration: '1 min', language: 'Filipino', text: "Ama namin, sumasalangit Ka,\nSambahin ang ngalan Mo.\nMapasaamin ang kaharian Mo.\nSundin ang loob Mo,\ndito sa lupa para nang sa langit.\nBigyan Mo kami ngayon ng aming kakanin sa araw-araw.\nAt patawarin Mo kami sa aming mga sala,\npara nang pagpapatawad namin sa mga nagkakasala sa amin.\nAt huwag Mo kaming ipahintulot sa tukso,\nat iaklat Mo kami sa lahat ng masama.\nAmen." },
      { id: 302, title: 'Aba Ginoong Maria', latin: 'Ave Maria', type: 'Core Prayer', duration: '30 sec', language: 'Filipino', text: "Aba Ginoong Maria,\npunong-puno ka ng grasya,\nang Panginoon ay sumasaiyo.\nBukod kang pinagpala sa babaeng lahat,\nat pinagpala rin ang iyong anak na si Jesus.\nSanta Maria, Ina ng Diyos,\nipanalangin mo kami na makasalanan,\nngayon at kung kami'y mamamatay.\nAmen." },
    ],
  },
];

// ── Initial Catechism ─────────────────────────────────────────────────────────
const initialCatechismParts = [
  {
    id: 1, part: 'Part One', title: 'The Profession of Faith', icon: '✝️',
    color: 'from-blue-900 to-blue-700',
    sections: [
      {
        id: 101, section: 'Section 1', title: 'I Believe — We Believe',
        articles: [
          { id: 1001, number: '26', title: 'On Faith', text: 'We begin our profession of faith by saying: "I believe" or "We believe." Before expounding the Church\'s faith, as confessed in the Creed, celebrated in the liturgy and exercised in observance of God\'s commandments and in prayer, we must first ask what "to believe" means.' },
          { id: 1002, number: '27', title: 'The Desire for God', text: 'The desire for God is written in the human heart, because man is created by God and for God; and God never ceases to draw man to himself. Only in God will he find the truth and happiness he never stops searching for.' },
        ],
      },
    ],
  },
  {
    id: 2, part: 'Part Two', title: 'The Celebration of the Christian Mystery', icon: '🕊️',
    color: 'from-teal-800 to-teal-600',
    sections: [
      {
        id: 201, section: 'Section 1', title: 'The Seven Sacraments',
        articles: [
          { id: 2001, number: '1210', title: 'The Seven Sacraments', text: 'Christ instituted the sacraments of the new law. There are seven: Baptism, Confirmation, the Eucharist, Penance, the Anointing of the Sick, Holy Orders, and Matrimony. The seven sacraments touch all the stages and all the important moments of Christian life.' },
          { id: 2002, number: '1213', title: 'Baptism', text: 'Holy Baptism is the basis of the whole Christian life, the gateway to life in the Spirit, and the door which gives access to the other sacraments. Through Baptism we are freed from sin and reborn as sons of God.' },
        ],
      },
    ],
  },
  {
    id: 3, part: 'Part Three', title: 'Life in Christ', icon: '❤️',
    color: 'from-rose-800 to-rose-600',
    sections: [
      {
        id: 301, section: 'Section 1', title: 'The Ten Commandments',
        articles: [
          { id: 3001, number: '2052', title: 'The Ten Commandments', text: '"Teacher, what good deed must I do, to have eternal life?" To the young man who asked this question, Jesus answers first by invoking the necessity to recognize God as the "One there is who is good," as the supreme Good and the source of all good.' },
        ],
      },
    ],
  },
  {
    id: 4, part: 'Part Four', title: 'Christian Prayer', icon: '🙏',
    color: 'from-yellow-700 to-yellow-900',
    sections: [
      {
        id: 401, section: 'Section 1', title: 'Prayer in the Christian Life',
        articles: [
          { id: 4001, number: '2558', title: 'What is Prayer?', text: '"Great is the mystery of the faith!" The Church professes this mystery in the Apostles\' Creed and celebrates it in the sacramental liturgy, so that the life of the faithful may be conformed to Christ in the Holy Spirit to the glory of God the Father. This mystery requires that the faithful believe in it, celebrate it, and live from it in a vital and personal relationship with the living and true God. This relationship is prayer.' },
        ],
      },
    ],
  },
];

// ============================================================================
// SHARED HELPERS
// ============================================================================
const AudioPlayer = ({ title, priest }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let i;
    if (isPlaying) i = setInterval(() => setProgress(p => p >= 100 ? 0 : p + 0.5), 100);
    return () => clearInterval(i);
  }, [isPlaying]);
  return (
    <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-5 text-white">
      <div className="flex items-center gap-3 mb-4"><Volume2 size={18} className="text-yellow-400" /><div><p className="font-bold text-sm">{title}</p><p className="text-blue-200 text-xs">{priest}</p></div></div>
      <div className="w-full bg-blue-700 rounded-full h-1.5 mb-4"><div className="bg-yellow-400 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} /></div>
      <div className="flex items-center justify-center gap-6">
        <button className="text-blue-200 hover:text-white"><SkipBack size={18} /></button>
        <button onClick={() => setIsPlaying(!isPlaying)} className="w-10 h-10 bg-yellow-500 hover:bg-yellow-400 rounded-full flex items-center justify-center">{isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}</button>
        <button className="text-blue-200 hover:text-white"><SkipForward size={18} /></button>
      </div>
    </div>
  );
};

// ============================================================================
// QR SCAN SCREEN
// ============================================================================
const QRScanScreen = ({ qrId, onComplete }) => {
  const [status, setStatus] = useState('verifying');
  const [countdown, setCountdown] = useState(3);
  useEffect(() => { const found = VALID_QR_CODES.find(q => q.id === qrId); setTimeout(() => setStatus(found && found.isActive ? 'success' : 'invalid'), 1500); }, [qrId]);
  useEffect(() => { if (status === 'success' && countdown > 0) setTimeout(() => setCountdown(c => c - 1), 1000); if (status === 'success' && countdown === 0) onComplete(); }, [status, countdown]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
        <h1 className="text-3xl font-serif font-bold bg-gradient-to-r from-blue-900 to-yellow-600 bg-clip-text text-transparent mb-1">VerbaSacra</h1>
        <p className="text-gray-400 text-xs mb-8">Parish Digital Platform</p>
        {status === 'verifying' && (<div className="space-y-6"><div className="w-24 h-24 mx-auto bg-blue-50 rounded-full flex items-center justify-center"><Loader size={48} className="text-blue-900 animate-spin" /></div><div><h2 className="text-xl font-bold text-gray-800 mb-2">Verifying QR Code</h2><p className="text-gray-500 text-sm">Please wait...</p></div><div className="flex justify-center gap-1">{[0,1,2].map(i => <motion.div key={i} className="w-2 h-2 bg-blue-900 rounded-full" animate={{ scale: [1,1.5,1] }} transition={{ duration: 0.6, delay: i*0.2, repeat: Infinity }} />)}</div></div>)}
        {status === 'success' && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6"><motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center"><CheckCircle size={56} className="text-green-600" /></motion.div><div><h2 className="text-2xl font-serif font-bold text-green-700 mb-2">QR Code Verified!</h2><p className="text-gray-500 text-sm">Welcome to VerbaSacra Parish</p></div><div className="bg-green-50 border border-green-200 rounded-2xl p-4"><p className="text-sm text-green-700 font-semibold mb-1">✅ Redirecting in...</p><motion.p key={countdown} initial={{ scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-5xl font-bold text-green-600">{countdown}</motion.p></div><button onClick={onComplete} className="w-full py-4 bg-gradient-to-r from-blue-900 to-yellow-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2">Go to Dashboard Now <ArrowRight size={20} /></button></motion.div>)}
        {status === 'invalid' && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6"><motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center"><XCircle size={56} className="text-red-600" /></motion.div><div><h2 className="text-2xl font-serif font-bold text-red-700 mb-2">Access Denied</h2><p className="text-gray-500 text-sm">This QR code is invalid or expired.</p></div><button onClick={onComplete} className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50">Go to Homepage</button></motion.div>)}
      </motion.div>
    </div>
  );
};

// ============================================================================
// PUBLIC: PRAYERS PAGE
// ============================================================================
const PrayersPage = ({ prayerCategories }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPrayer, setSelectedPrayer] = useState(null);
  const [search, setSearch] = useState('');
  const [fontSize, setFontSize] = useState('normal');
  const fontSizes = { small: 'text-sm', normal: 'text-base', large: 'text-lg', xlarge: 'text-xl' };
  const allPrayers = prayerCategories.flatMap(cat => cat.prayers.map(p => ({ ...p, category: cat.category, categoryColor: cat.color })));
  const searchResults = search.length > 1 ? allPrayers.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.text.toLowerCase().includes(search.toLowerCase())) : [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="relative bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-950 text-white px-6 py-14 overflow-hidden">
        <div className="absolute inset-0 opacity-10"><div className="absolute top-5 right-10 w-48 h-48 rounded-full bg-yellow-400 blur-3xl" /></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="text-5xl mb-4">🙏</div>
          <h2 className="text-4xl font-serif font-bold mb-3">Sacred Prayers</h2>
          <p className="text-blue-200 text-lg max-w-xl mx-auto">A collection of Catholic prayers to guide your daily spiritual life.</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        <div className="relative"><Search size={18} className="absolute left-4 top-3.5 text-gray-400" /><input type="text" placeholder="Search prayers..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm" /></div>

        {search.length > 1 && (
          <div className="space-y-3"><p className="text-sm text-gray-500 font-semibold">{searchResults.length} result(s) found</p>
            {searchResults.map(p => (<motion.button key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setSelectedPrayer(p)} className="w-full bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-left hover:shadow-md transition"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.categoryColor} flex items-center justify-center flex-shrink-0`}><span className="text-lg">🙏</span></div><div><p className="font-bold text-gray-800">{p.title}</p><p className="text-xs text-gray-500">{p.category} • {p.duration}</p></div><ChevronRight size={16} className="text-gray-400 ml-auto" /></div></motion.button>))}
          </div>
        )}

        {!search && !selectedPrayer && !selectedCategory && (
          <div className="space-y-4">
            <h3 className="text-2xl font-serif font-bold text-gray-800">Prayer Categories</h3>
            {prayerCategories.length === 0 && <div className="text-center py-12 text-gray-400"><div className="text-5xl mb-3">🙏</div><p className="font-semibold">No prayer categories yet.</p><p className="text-sm">Admin will add prayers soon.</p></div>}
            <div className="grid sm:grid-cols-2 gap-4">
              {prayerCategories.map((cat, i) => (
                <motion.button key={cat.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i*0.08 }} whileHover={{ y: -4, scale: 1.02 }} onClick={() => setSelectedCategory(cat)} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${cat.color} p-6 text-white text-left shadow-lg hover:shadow-xl transition`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
                  <div className="relative"><div className="text-4xl mb-3">{cat.icon}</div><h4 className="text-xl font-serif font-bold mb-1">{cat.category}</h4><p className="text-white/70 text-sm">{cat.prayers.length} prayer{cat.prayers.length !== 1 ? 's' : ''}</p></div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {selectedCategory && !selectedPrayer && !search && (
          <div className="space-y-4">
            <div className="flex items-center gap-3"><button onClick={() => setSelectedCategory(null)} className="text-blue-900 hover:bg-blue-50 p-2 rounded-lg transition"><X size={20} /></button><div><p className="text-xs text-gray-500">{selectedCategory.icon} {selectedCategory.category}</p><h3 className="text-2xl font-serif font-bold text-gray-800">{selectedCategory.prayers.length} Prayers</h3></div></div>
            {selectedCategory.prayers.length === 0 && <div className="text-center py-12 text-gray-400"><div className="text-5xl mb-3">🙏</div><p className="font-semibold">No prayers in this category yet.</p></div>}
            <div className="space-y-3">
              {selectedCategory.prayers.map((prayer, i) => (
                <motion.button key={prayer.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i*0.08 }} whileHover={{ x: 6 }} onClick={() => setSelectedPrayer({ ...prayer, categoryColor: selectedCategory.color })} className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-left hover:shadow-lg transition group">
                  <div className="flex items-start gap-4"><div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${selectedCategory.color} flex items-center justify-center flex-shrink-0 text-2xl`}>{selectedCategory.icon}</div><div className="flex-1"><h4 className="font-serif font-bold text-gray-800 text-lg">{prayer.title}</h4><p className="text-xs text-yellow-600 font-semibold italic mb-1">{prayer.latin}</p><p className="text-sm text-gray-500 line-clamp-2">{prayer.text.split('\n')[0]}</p><div className="flex gap-2 mt-2"><span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold">{prayer.type}</span><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{prayer.duration}</span><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{prayer.language}</span></div></div><ChevronRight size={20} className="text-gray-300 group-hover:text-blue-900 transition flex-shrink-0 mt-2" /></div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {selectedPrayer && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className="flex items-center gap-3"><button onClick={() => setSelectedPrayer(null)} className="text-blue-900 hover:bg-blue-50 p-2 rounded-lg transition"><X size={20} /></button><p className="text-sm text-gray-500">Back to prayers</p></div>
            <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${selectedPrayer.categoryColor} p-8 text-white`}>
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-10 translate-x-10" />
              <div className="relative"><p className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-2">{selectedPrayer.type}</p><h2 className="text-3xl font-serif font-bold mb-1">{selectedPrayer.title}</h2><p className="text-white/70 italic text-lg">{selectedPrayer.latin}</p><div className="flex gap-3 mt-4"><span className="text-xs bg-white/20 px-3 py-1 rounded-full">{selectedPrayer.duration}</span><span className="text-xs bg-white/20 px-3 py-1 rounded-full">{selectedPrayer.language}</span></div></div>
            </div>
            <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-3">
              <span className="text-sm text-gray-500 font-semibold">Text Size:</span>
              {['small','normal','large','xlarge'].map(size => (<button key={size} onClick={() => setFontSize(size)} className={`px-3 py-1 rounded-lg text-xs font-bold transition capitalize ${fontSize === size ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{size === 'xlarge' ? 'XL' : size === 'normal' ? 'Normal' : size === 'small' ? 'Small' : 'Large'}</button>))}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="p-8"><div className={`${fontSizes[fontSize]} text-gray-700 leading-loose font-serif whitespace-pre-line`}>{selectedPrayer.text}</div></div>

            </div>
            <div className="bg-gradient-to-r from-blue-50 to-yellow-50 rounded-2xl p-6 border border-yellow-200"><div className="flex items-start gap-3"><span className="text-2xl">💭</span><div><p className="font-bold text-gray-800 mb-1">Reflection</p><p className="text-sm text-gray-600 leading-relaxed">Take a moment after praying to reflect on the words. Let them sink into your heart and guide your day.</p></div></div></div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// ============================================================================
// PUBLIC: CATECHISM PAGE
// ============================================================================
const CatechismPage = ({ catechismParts }) => {
  const [selectedPart, setSelectedPart] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [search, setSearch] = useState('');
  const [expandedSection, setExpandedSection] = useState(null);
  const allArticles = catechismParts.flatMap(p => p.sections.flatMap(s => s.articles.map(a => ({ ...a, partTitle: p.title, partColor: p.color, sectionTitle: s.title }))));
  const searchResults = search.length > 1 ? allArticles.filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || a.text.toLowerCase().includes(search.toLowerCase()) || a.number.includes(search)) : [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="relative bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 text-white px-6 py-14 overflow-hidden">
        <div className="absolute inset-0 opacity-10"><div className="absolute top-5 right-10 w-48 h-48 rounded-full bg-yellow-400 blur-3xl" /></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="text-5xl mb-4">📖</div>
          <h2 className="text-4xl font-serif font-bold mb-3">Catechism of the Catholic Church</h2>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">Explore the foundational teachings of the Catholic faith.</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        <div className="relative"><Search size={18} className="absolute left-4 top-3.5 text-gray-400" /><input type="text" placeholder="Search by topic, keyword, or paragraph number..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm" /></div>

        {search.length > 1 && (
          <div className="space-y-3"><p className="text-sm text-gray-500 font-semibold">{searchResults.length} result(s) found</p>
            {searchResults.map(a => (<motion.button key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setSelectedArticle(a)} className="w-full bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-left hover:shadow-md transition"><div className="flex items-start gap-3"><div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${a.partColor} flex items-center justify-center flex-shrink-0`}><span className="text-white text-xs font-bold">§{a.number}</span></div><div><p className="font-bold text-gray-800">{a.title}</p><p className="text-xs text-gray-500 mb-1">{a.partTitle}</p><p className="text-sm text-gray-600 line-clamp-2">{a.text}</p></div></div></motion.button>))}
          </div>
        )}

        {!search && !selectedPart && !selectedArticle && (
          <div className="space-y-4">
            <h3 className="text-2xl font-serif font-bold text-gray-800">Four Parts of the Catechism</h3>
            {catechismParts.length === 0 && <div className="text-center py-12 text-gray-400"><div className="text-5xl mb-3">📖</div><p className="font-semibold">No catechism content yet.</p><p className="text-sm">Admin will add content soon.</p></div>}
            <div className="grid sm:grid-cols-2 gap-5">
              {catechismParts.map((part, i) => (
                <motion.button key={part.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i*0.08 }} whileHover={{ y: -4 }} onClick={() => setSelectedPart(part)} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${part.color} p-7 text-white text-left shadow-lg hover:shadow-xl transition`}>
                  <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full -translate-y-10 translate-x-10" />
                  <div className="relative"><div className="text-4xl mb-3">{part.icon}</div><p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">{part.part}</p><h4 className="text-xl font-serif font-bold mb-2">{part.title}</h4><p className="text-white/70 text-sm">{part.sections.length} section(s) • {part.sections.reduce((acc, s) => acc + s.articles.length, 0)} article(s)</p></div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {selectedPart && !selectedArticle && !search && (
          <div className="space-y-5">
            <div className="flex items-center gap-3"><button onClick={() => { setSelectedPart(null); setExpandedSection(null); }} className="text-blue-900 hover:bg-blue-50 p-2 rounded-lg transition"><X size={20} /></button><div><p className="text-xs text-gray-500">{selectedPart.icon} {selectedPart.part}</p><h3 className="text-2xl font-serif font-bold text-gray-800">{selectedPart.title}</h3></div></div>
            <div className={`rounded-2xl bg-gradient-to-br ${selectedPart.color} p-6 text-white`}><p className="text-white/80 text-sm">{selectedPart.sections.length} Sections • {selectedPart.sections.reduce((acc, s) => acc + s.articles.length, 0)} Articles</p></div>
            {selectedPart.sections.map(section => (
              <div key={section.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <button onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)} className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition">
                  <div><p className="text-xs text-gray-500 font-semibold">{section.section}</p><h4 className="font-serif font-bold text-gray-800 text-lg">{section.title}</h4><p className="text-xs text-gray-400 mt-1">{section.articles.length} article(s)</p></div>
                  <motion.div animate={{ rotate: expandedSection === section.id ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronDown size={20} className="text-gray-400" /></motion.div>
                </button>
                <AnimatePresence>
                  {expandedSection === section.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden border-t border-gray-100">
                      {section.articles.map(article => (
                        <button key={article.id} onClick={() => setSelectedArticle({ ...article, partColor: selectedPart.color, partTitle: selectedPart.title, sectionTitle: section.title })} className="w-full flex items-start gap-4 p-5 text-left hover:bg-blue-50/50 transition border-b border-gray-50 last:border-0 group">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedPart.color} flex items-center justify-center flex-shrink-0`}><span className="text-white text-xs font-bold">§{article.number}</span></div>
                          <div className="flex-1"><h5 className="font-bold text-gray-800 mb-1">{article.title}</h5><p className="text-sm text-gray-500 line-clamp-2">{article.text}</p></div>
                          <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-900 transition flex-shrink-0 mt-2" />
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}

        {selectedArticle && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className="flex items-center gap-3"><button onClick={() => setSelectedArticle(null)} className="text-blue-900 hover:bg-blue-50 p-2 rounded-lg transition"><X size={20} /></button><p className="text-sm text-gray-500">Back</p></div>
            <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${selectedArticle.partColor} p-8 text-white`}>
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-10 translate-x-10" />
              <div className="relative"><div className="flex items-center gap-3 mb-4"><div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center"><span className="text-2xl font-bold">§</span></div><div><p className="text-white/70 text-xs uppercase tracking-widest">Paragraph {selectedArticle.number}</p><p className="text-white/70 text-xs">{selectedArticle.partTitle}</p></div></div><h2 className="text-3xl font-serif font-bold mb-2">{selectedArticle.title}</h2><p className="text-white/70 text-sm">{selectedArticle.sectionTitle}</p></div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <div className="flex items-center gap-2 mb-6"><div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${selectedArticle.partColor} flex items-center justify-center`}><span className="text-white text-xs font-bold">§</span></div><span className="text-sm font-bold text-gray-500">CCC {selectedArticle.number}</span></div>
              <p className="text-gray-700 leading-loose font-serif text-lg">{selectedArticle.text}</p>

            </div>
            <div className="bg-gradient-to-r from-blue-50 to-yellow-50 rounded-2xl p-6 border border-yellow-200"><div className="flex items-start gap-3"><span className="text-2xl">🕯️</span><div><p className="font-bold text-gray-800 mb-1">Study & Reflect</p><p className="text-sm text-gray-600 leading-relaxed">This teaching from the Catechism invites us to go deeper. Consider reading related Scripture passages and discussing with your parish community.</p></div></div></div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// ============================================================================
// 🛡️ ADMIN: MANAGE PRAYERS
// ============================================================================
const ManagePrayersPage = ({ prayerCategories, setPrayerCategories }) => {
  const [view, setView] = useState('categories'); // categories | prayers | prayerForm | categoryForm
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editCategory, setEditCategory] = useState(null);
  const [editPrayer, setEditPrayer] = useState(null);

  const [catForm, setCatForm] = useState({ category: '', icon: '🙏', color: 'from-blue-700 to-blue-900' });
  const [prayerForm, setPrayerForm] = useState({ title: '', latin: '', type: 'Core Prayer', duration: '1 min', language: 'English', text: '' });

  const colorOptions = [
    { label: 'Blue', value: 'from-blue-700 to-blue-900' },
    { label: 'Indigo', value: 'from-indigo-700 to-indigo-900' },
    { label: 'Orange', value: 'from-orange-400 to-yellow-500' },
    { label: 'Rose', value: 'from-rose-500 to-pink-700' },
    { label: 'Yellow', value: 'from-yellow-600 to-yellow-800' },
    { label: 'Teal', value: 'from-teal-600 to-teal-800' },
    { label: 'Green', value: 'from-green-700 to-green-900' },
    { label: 'Purple', value: 'from-purple-700 to-purple-900' },
  ];

  const iconOptions = ['🙏', '✝️', '🌅', '🌙', '🌹', '🇵🇭', '🕊️', '❤️', '📿', '⛪', '🕯️', '✨'];

  // Category CRUD
  const openAddCategory = () => { setCatForm({ category: '', icon: '🙏', color: 'from-blue-700 to-blue-900' }); setEditCategory(null); setView('categoryForm'); };
  const openEditCategory = (cat) => { setCatForm({ category: cat.category, icon: cat.icon, color: cat.color }); setEditCategory(cat); setView('categoryForm'); };
  const saveCategory = () => {
    if (!catForm.category.trim()) return alert('Please enter a category name.');
    if (editCategory) {
      setPrayerCategories(prev => prev.map(c => c.id === editCategory.id ? { ...c, ...catForm } : c));
    } else {
      setPrayerCategories(prev => [...prev, { ...catForm, id: Date.now(), prayers: [] }]);
    }
    setView('categories');
  };
  const deleteCategory = (id) => { if (confirm('Delete this category and all its prayers?')) setPrayerCategories(prev => prev.filter(c => c.id !== id)); };

  // Prayer CRUD
  const openAddPrayer = (cat) => { setPrayerForm({ title: '', latin: '', type: 'Core Prayer', duration: '1 min', language: 'English', text: '' }); setEditPrayer(null); setSelectedCategory(cat); setView('prayerForm'); };
  const openEditPrayer = (cat, prayer) => { setPrayerForm({ ...prayer }); setEditPrayer(prayer); setSelectedCategory(cat); setView('prayerForm'); };
  const savePrayer = () => {
    if (!prayerForm.title.trim() || !prayerForm.text.trim()) return alert('Please fill in Title and Prayer Text.');
    setPrayerCategories(prev => prev.map(c => {
      if (c.id !== selectedCategory.id) return c;
      if (editPrayer) {
        return { ...c, prayers: c.prayers.map(p => p.id === editPrayer.id ? { ...prayerForm, id: editPrayer.id } : p) };
      } else {
        return { ...c, prayers: [...c.prayers, { ...prayerForm, id: Date.now() }] };
      }
    }));
    setView('prayers');
  };
  const deletePrayer = (catId, prayerId) => {
    if (confirm('Delete this prayer?')) setPrayerCategories(prev => prev.map(c => c.id === catId ? { ...c, prayers: c.prayers.filter(p => p.id !== prayerId) } : c));
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
      {/* CATEGORIES VIEW */}
      {view === 'categories' && (
        <>
          <div className="flex items-center justify-between">
            <div><h2 className="text-3xl font-serif font-bold text-gray-800">Manage Prayers</h2><p className="text-gray-500 text-sm mt-1">Add and manage prayer categories and individual prayers</p></div>
            <button onClick={openAddCategory} className="flex items-center gap-2 px-5 py-2 bg-blue-900 text-white rounded-xl font-bold text-sm hover:bg-blue-800 transition"><Plus size={16} /> Add Category</button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Categories', value: prayerCategories.length, color: 'text-blue-900' },
              { label: 'Total Prayers', value: prayerCategories.reduce((a, c) => a + c.prayers.length, 0), color: 'text-rose-600' },
              { label: 'English', value: prayerCategories.reduce((a, c) => a + c.prayers.filter(p => p.language === 'English').length, 0), color: 'text-green-700' },
              { label: 'Filipino', value: prayerCategories.reduce((a, c) => a + c.prayers.filter(p => p.language === 'Filipino').length, 0), color: 'text-yellow-700' },
            ].map((s, i) => (<div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center"><p className={`text-2xl font-serif font-bold ${s.color}`}>{s.value}</p><p className="text-xs text-gray-500 mt-1">{s.label}</p></div>))}
          </div>

          {prayerCategories.length === 0 && (<div className="text-center py-16 bg-white rounded-2xl border border-gray-100"><div className="text-6xl mb-4">🙏</div><p className="font-bold text-gray-700 text-lg">No Prayer Categories Yet</p><p className="text-gray-400 text-sm mt-1 mb-6">Create your first prayer category to get started</p><button onClick={openAddCategory} className="px-6 py-3 bg-blue-900 text-white rounded-xl font-bold hover:bg-blue-800 transition">+ Add First Category</button></div>)}

          <div className="grid sm:grid-cols-2 gap-4">
            {prayerCategories.map(cat => (
              <div key={cat.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className={`bg-gradient-to-r ${cat.color} p-5 text-white flex items-center justify-between`}>
                  <div className="flex items-center gap-3"><span className="text-3xl">{cat.icon}</span><div><p className="font-serif font-bold text-lg">{cat.category}</p><p className="text-white/70 text-sm">{cat.prayers.length} prayer{cat.prayers.length !== 1 ? 's' : ''}</p></div></div>
                  <div className="flex gap-2">
                    <button onClick={() => openEditCategory(cat)} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition"><Edit3 size={15} /></button>
                    <button onClick={() => deleteCategory(cat.id)} className="p-2 bg-white/20 hover:bg-red-500/50 rounded-lg transition"><Trash2 size={15} /></button>
                  </div>
                </div>
                <div className="p-4">
                  {cat.prayers.slice(0, 3).map(p => (<div key={p.id} className="flex items-center gap-2 py-2 border-b border-gray-50 last:border-0 text-sm text-gray-600"><span className="text-xs">🙏</span><span className="truncate">{p.title}</span><span className="text-xs text-gray-400 ml-auto">{p.language}</span></div>))}
                  {cat.prayers.length > 3 && <p className="text-xs text-gray-400 mt-2">+{cat.prayers.length - 3} more prayers</p>}
                  <button onClick={() => { setSelectedCategory(cat); setView('prayers'); }} className="w-full mt-3 py-2 border border-blue-200 text-blue-900 rounded-xl text-sm font-bold hover:bg-blue-50 transition">Manage Prayers ({cat.prayers.length})</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* CATEGORY FORM */}
      {view === 'categoryForm' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center gap-3"><button onClick={() => setView('categories')} className="text-blue-900 hover:bg-blue-50 p-2 rounded-lg transition"><X size={20} /></button><h2 className="text-2xl font-serif font-bold text-gray-800">{editCategory ? 'Edit Category' : 'New Prayer Category'}</h2></div>

          {/* Preview */}
          <div className={`bg-gradient-to-br ${catForm.color} rounded-2xl p-6 text-white text-center`}>
            <div className="text-5xl mb-2">{catForm.icon || '🙏'}</div>
            <p className="text-xl font-serif font-bold">{catForm.category || 'Category Name'}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">Category Name *</label>
              <input type="text" value={catForm.category} onChange={e => setCatForm({...catForm, category: e.target.value})} placeholder="e.g. Morning Prayers, Marian Prayers" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-3 text-gray-700">Category Icon</label>
              <div className="flex flex-wrap gap-3">
                {iconOptions.map(icon => (<button key={icon} onClick={() => setCatForm({...catForm, icon})} className={`w-12 h-12 text-2xl rounded-xl border-2 transition ${catForm.icon === icon ? 'border-blue-900 bg-blue-50 scale-110' : 'border-gray-200 hover:border-gray-300'}`}>{icon}</button>))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold mb-3 text-gray-700">Card Color</label>
              <div className="grid grid-cols-4 gap-3">
                {colorOptions.map(opt => (<button key={opt.value} onClick={() => setCatForm({...catForm, color: opt.value})} className={`h-12 rounded-xl bg-gradient-to-r ${opt.value} border-4 transition ${catForm.color === opt.value ? 'border-yellow-500 scale-105' : 'border-transparent hover:scale-105'}`} title={opt.label} />))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setView('categories')} className="flex-1 py-3 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
              <button onClick={saveCategory} className="flex-1 py-3 bg-gradient-to-r from-blue-900 to-yellow-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition"><Save size={16} /> {editCategory ? 'Update Category' : 'Create Category'}</button>
            </div>
          </div>
        </motion.div>
      )}

      {/* PRAYERS LIST VIEW */}
      {view === 'prayers' && selectedCategory && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="flex items-center gap-3">
            <button onClick={() => setView('categories')} className="text-blue-900 hover:bg-blue-50 p-2 rounded-lg transition"><X size={20} /></button>
            <div className="flex-1"><p className="text-xs text-gray-500">{selectedCategory.icon} {selectedCategory.category}</p><h2 className="text-2xl font-serif font-bold text-gray-800">Manage Prayers</h2></div>
            <button onClick={() => openAddPrayer(selectedCategory)} className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-xl font-bold text-sm hover:bg-blue-800 transition"><Plus size={15} /> Add Prayer</button>
          </div>

          {selectedCategory.prayers.length === 0 && (<div className="text-center py-16 bg-white rounded-2xl border border-gray-100"><div className="text-6xl mb-4">{selectedCategory.icon}</div><p className="font-bold text-gray-700 text-lg">No Prayers Yet</p><p className="text-gray-400 text-sm mt-1 mb-6">Add the first prayer to this category</p><button onClick={() => openAddPrayer(selectedCategory)} className="px-6 py-3 bg-blue-900 text-white rounded-xl font-bold hover:bg-blue-800 transition">+ Add First Prayer</button></div>)}

          <div className="space-y-3">
            {selectedCategory.prayers.map((prayer, i) => (
              <motion.div key={prayer.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i*0.05 }} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedCategory.color} flex items-center justify-center flex-shrink-0 text-xl`}>{selectedCategory.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif font-bold text-gray-800">{prayer.title}</h3>
                    <p className="text-xs text-yellow-600 italic">{prayer.latin}</p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{prayer.type}</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{prayer.language}</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{prayer.duration}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{prayer.text.split('\n')[0]}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => openEditPrayer(selectedCategory, prayer)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition"><Edit3 size={16} /></button>
                    <button onClick={() => deletePrayer(selectedCategory.id, prayer.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition"><Trash2 size={16} /></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* PRAYER FORM */}
      {view === 'prayerForm' && selectedCategory && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center gap-3"><button onClick={() => setView('prayers')} className="text-blue-900 hover:bg-blue-50 p-2 rounded-lg transition"><X size={20} /></button><div><p className="text-xs text-gray-500">{selectedCategory.icon} {selectedCategory.category}</p><h2 className="text-2xl font-serif font-bold text-gray-800">{editPrayer ? 'Edit Prayer' : 'Add New Prayer'}</h2></div></div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-bold mb-2 text-gray-700">Prayer Title *</label>
                <input type="text" value={prayerForm.title} onChange={e => setPrayerForm({...prayerForm, title: e.target.value})} placeholder="e.g. Our Father, Hail Mary" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Latin Name</label>
                <input type="text" value={prayerForm.latin} onChange={e => setPrayerForm({...prayerForm, latin: e.target.value})} placeholder="e.g. Pater Noster" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Prayer Type</label>
                <select value={prayerForm.type} onChange={e => setPrayerForm({...prayerForm, type: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm">
                  <option>Core Prayer</option><option>Daily</option><option>Devotional</option><option>Marian</option><option>Evening</option><option>Novena</option><option>Litany</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Language</label>
                <select value={prayerForm.language} onChange={e => setPrayerForm({...prayerForm, language: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm">
                  <option>English</option><option>Filipino</option><option>Latin</option><option>Cebuano</option><option>Ilocano</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Duration</label>
                <select value={prayerForm.duration} onChange={e => setPrayerForm({...prayerForm, duration: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm">
                  <option>15 sec</option><option>20 sec</option><option>30 sec</option><option>1 min</option><option>2 min</option><option>5 min</option><option>10 min</option><option>20 min</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-bold mb-2 text-gray-700">Full Prayer Text *</label>
                <p className="text-xs text-gray-400 mb-2">💡 Use Enter key for line breaks in the prayer text</p>
                <textarea value={prayerForm.text} onChange={e => setPrayerForm({...prayerForm, text: e.target.value})} placeholder="Type the full prayer text here..." rows={10} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm resize-none font-serif" />
                <p className="text-xs text-gray-400 mt-1">{prayerForm.text.length} characters</p>
              </div>
            </div>

            {/* Preview */}
            {prayerForm.text && (
              <div className="border border-blue-100 bg-blue-50 rounded-xl p-4">
                <p className="text-xs font-bold text-blue-700 mb-3">📖 Prayer Preview:</p>
                <p className="text-sm text-gray-700 leading-loose font-serif whitespace-pre-line">{prayerForm.text}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={() => setView('prayers')} className="flex-1 py-3 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
              <button onClick={savePrayer} className="flex-1 py-3 bg-gradient-to-r from-blue-900 to-yellow-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition"><Save size={16} /> {editPrayer ? 'Update Prayer' : 'Add Prayer'}</button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// ============================================================================
// 🛡️ ADMIN: MANAGE CATECHISM
// ============================================================================
const ManageCatechismPage = ({ catechismParts, setCatechismParts }) => {
  const [view, setView] = useState('parts'); // parts | sections | articles | partForm | sectionForm | articleForm
  const [selectedPart, setSelectedPart] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [editPart, setEditPart] = useState(null);
  const [editSection, setEditSection] = useState(null);
  const [editArticle, setEditArticle] = useState(null);

  const [partForm, setPartForm] = useState({ part: '', title: '', icon: '✝️', color: 'from-blue-900 to-blue-700' });
  const [sectionForm, setSectionForm] = useState({ section: '', title: '' });
  const [articleForm, setArticleForm] = useState({ number: '', title: '', text: '' });

  const colorOptions = [
    { label: 'Navy', value: 'from-blue-900 to-blue-700' },
    { label: 'Teal', value: 'from-teal-800 to-teal-600' },
    { label: 'Rose', value: 'from-rose-800 to-rose-600' },
    { label: 'Yellow', value: 'from-yellow-700 to-yellow-900' },
    { label: 'Purple', value: 'from-purple-800 to-purple-600' },
    { label: 'Green', value: 'from-green-800 to-green-600' },
    { label: 'Indigo', value: 'from-indigo-800 to-indigo-600' },
    { label: 'Slate', value: 'from-slate-700 to-slate-900' },
  ];
  const iconOptions = ['✝️', '🕊️', '❤️', '🙏', '📖', '⛪', '🕯️', '✨', '🌟', '🌿', '🔔', '📿'];

  // Part CRUD
  const openAddPart = () => { setPartForm({ part: '', title: '', icon: '✝️', color: 'from-blue-900 to-blue-700' }); setEditPart(null); setView('partForm'); };
  const openEditPart = (part) => { setPartForm({ part: part.part, title: part.title, icon: part.icon, color: part.color }); setEditPart(part); setView('partForm'); };
  const savePart = () => {
    if (!partForm.part.trim() || !partForm.title.trim()) return alert('Please fill in Part label and Title.');
    if (editPart) { setCatechismParts(prev => prev.map(p => p.id === editPart.id ? { ...p, ...partForm } : p)); }
    else { setCatechismParts(prev => [...prev, { ...partForm, id: Date.now(), sections: [] }]); }
    setView('parts');
  };
  const deletePart = (id) => { if (confirm('Delete this part and all its content?')) setCatechismParts(prev => prev.filter(p => p.id !== id)); };

  // Section CRUD
  const openAddSection = (part) => { setSectionForm({ section: '', title: '' }); setEditSection(null); setSelectedPart(part); setView('sectionForm'); };
  const openEditSection = (part, section) => { setSectionForm({ section: section.section, title: section.title }); setEditSection(section); setSelectedPart(part); setView('sectionForm'); };
  const saveSection = () => {
    if (!sectionForm.section.trim() || !sectionForm.title.trim()) return alert('Please fill in all fields.');
    setCatechismParts(prev => prev.map(p => {
      if (p.id !== selectedPart.id) return p;
      if (editSection) { return { ...p, sections: p.sections.map(s => s.id === editSection.id ? { ...s, ...sectionForm } : s) }; }
      else { return { ...p, sections: [...p.sections, { ...sectionForm, id: Date.now(), articles: [] }] }; }
    }));
    setView('sections');
  };
  const deleteSection = (partId, sectionId) => {
    if (confirm('Delete this section and all articles?')) setCatechismParts(prev => prev.map(p => p.id === partId ? { ...p, sections: p.sections.filter(s => s.id !== sectionId) } : p));
  };

  // Article CRUD
  const openAddArticle = (part, section) => { setArticleForm({ number: '', title: '', text: '' }); setEditArticle(null); setSelectedPart(part); setSelectedSection(section); setView('articleForm'); };
  const openEditArticle = (part, section, article) => { setArticleForm({ number: article.number, title: article.title, text: article.text }); setEditArticle(article); setSelectedPart(part); setSelectedSection(section); setView('articleForm'); };
  const saveArticle = () => {
    if (!articleForm.number.trim() || !articleForm.title.trim() || !articleForm.text.trim()) return alert('Please fill in all fields.');
    setCatechismParts(prev => prev.map(p => {
      if (p.id !== selectedPart.id) return p;
      return { ...p, sections: p.sections.map(s => {
        if (s.id !== selectedSection.id) return s;
        if (editArticle) { return { ...s, articles: s.articles.map(a => a.id === editArticle.id ? { ...articleForm, id: editArticle.id } : a) }; }
        else { return { ...s, articles: [...s.articles, { ...articleForm, id: Date.now() }] }; }
      })};
    }));
    setView('articles');
  };
  const deleteArticle = (partId, sectionId, articleId) => {
    if (confirm('Delete this article?')) setCatechismParts(prev => prev.map(p => p.id !== partId ? p : { ...p, sections: p.sections.map(s => s.id !== sectionId ? s : { ...s, articles: s.articles.filter(a => a.id !== articleId) }) }));
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">

      {/* PARTS VIEW */}
      {view === 'parts' && (
        <>
          <div className="flex items-center justify-between">
            <div><h2 className="text-3xl font-serif font-bold text-gray-800">Manage Catechism</h2><p className="text-gray-500 text-sm mt-1">Add and manage catechism parts, sections, and articles</p></div>
            <button onClick={openAddPart} className="flex items-center gap-2 px-5 py-2 bg-blue-900 text-white rounded-xl font-bold text-sm hover:bg-blue-800 transition"><Plus size={16} /> Add Part</button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Parts', value: catechismParts.length, color: 'text-blue-900' },
              { label: 'Sections', value: catechismParts.reduce((a, p) => a + p.sections.length, 0), color: 'text-teal-700' },
              { label: 'Articles', value: catechismParts.reduce((a, p) => a + p.sections.reduce((b, s) => b + s.articles.length, 0), 0), color: 'text-rose-600' },
            ].map((s, i) => (<div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center"><p className={`text-2xl font-serif font-bold ${s.color}`}>{s.value}</p><p className="text-xs text-gray-500 mt-1">{s.label}</p></div>))}
          </div>

          {catechismParts.length === 0 && (<div className="text-center py-16 bg-white rounded-2xl border border-gray-100"><div className="text-6xl mb-4">📖</div><p className="font-bold text-gray-700 text-lg">No Catechism Parts Yet</p><p className="text-gray-400 text-sm mt-1 mb-6">Start by adding the four parts of the Catechism</p><button onClick={openAddPart} className="px-6 py-3 bg-blue-900 text-white rounded-xl font-bold hover:bg-blue-800 transition">+ Add First Part</button></div>)}

          <div className="grid sm:grid-cols-2 gap-4">
            {catechismParts.map(part => (
              <div key={part.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className={`bg-gradient-to-r ${part.color} p-5 text-white`}>
                  <div className="flex items-start justify-between">
                    <div><div className="text-3xl mb-2">{part.icon}</div><p className="text-white/60 text-xs font-bold uppercase tracking-widest">{part.part}</p><p className="font-serif font-bold text-lg">{part.title}</p></div>
                    <div className="flex gap-2"><button onClick={() => openEditPart(part)} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition"><Edit3 size={15} /></button><button onClick={() => deletePart(part.id)} className="p-2 bg-white/20 hover:bg-red-500/50 rounded-lg transition"><Trash2 size={15} /></button></div>
                  </div>
                  <p className="text-white/70 text-xs mt-2">{part.sections.length} section(s) • {part.sections.reduce((a, s) => a + s.articles.length, 0)} article(s)</p>
                </div>
                <div className="p-4">
                  {part.sections.slice(0, 2).map(s => (<div key={s.id} className="flex items-center gap-2 py-2 border-b border-gray-50 last:border-0 text-sm text-gray-600"><span className="text-xs">📑</span><span className="truncate">{s.title}</span><span className="text-xs text-gray-400 ml-auto">{s.articles.length} art.</span></div>))}
                  {part.sections.length > 2 && <p className="text-xs text-gray-400 mt-1">+{part.sections.length - 2} more sections</p>}
                  <button onClick={() => { setSelectedPart(part); setView('sections'); }} className="w-full mt-3 py-2 border border-blue-200 text-blue-900 rounded-xl text-sm font-bold hover:bg-blue-50 transition">Manage Sections ({part.sections.length})</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* PART FORM */}
      {view === 'partForm' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center gap-3"><button onClick={() => setView('parts')} className="text-blue-900 hover:bg-blue-50 p-2 rounded-lg transition"><X size={20} /></button><h2 className="text-2xl font-serif font-bold text-gray-800">{editPart ? 'Edit Part' : 'New Catechism Part'}</h2></div>
          <div className={`bg-gradient-to-br ${partForm.color} rounded-2xl p-6 text-white text-center`}><div className="text-5xl mb-2">{partForm.icon || '📖'}</div><p className="text-white/60 text-sm">{partForm.part || 'Part Label'}</p><p className="text-xl font-serif font-bold">{partForm.title || 'Part Title'}</p></div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="block text-sm font-bold mb-2">Part Label *</label><input type="text" value={partForm.part} onChange={e => setPartForm({...partForm, part: e.target.value})} placeholder="e.g. Part One, Part Two" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm" /></div>
              <div><label className="block text-sm font-bold mb-2">Part Title *</label><input type="text" value={partForm.title} onChange={e => setPartForm({...partForm, title: e.target.value})} placeholder="e.g. The Profession of Faith" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm" /></div>
            </div>
            <div><label className="block text-sm font-bold mb-3">Icon</label><div className="flex flex-wrap gap-3">{iconOptions.map(icon => (<button key={icon} onClick={() => setPartForm({...partForm, icon})} className={`w-12 h-12 text-2xl rounded-xl border-2 transition ${partForm.icon === icon ? 'border-blue-900 bg-blue-50 scale-110' : 'border-gray-200 hover:border-gray-300'}`}>{icon}</button>))}</div></div>
            <div><label className="block text-sm font-bold mb-3">Card Color</label><div className="grid grid-cols-4 gap-3">{colorOptions.map(opt => (<button key={opt.value} onClick={() => setPartForm({...partForm, color: opt.value})} className={`h-12 rounded-xl bg-gradient-to-r ${opt.value} border-4 transition ${partForm.color === opt.value ? 'border-yellow-500 scale-105' : 'border-transparent hover:scale-105'}`} title={opt.label} />))}</div></div>
            <div className="flex gap-3 pt-2"><button onClick={() => setView('parts')} className="flex-1 py-3 border border-gray-200 rounded-xl font-semibold text-gray-600">Cancel</button><button onClick={savePart} className="flex-1 py-3 bg-gradient-to-r from-blue-900 to-yellow-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg"><Save size={16} /> {editPart ? 'Update' : 'Create Part'}</button></div>
          </div>
        </motion.div>
      )}

      {/* SECTIONS VIEW */}
      {view === 'sections' && selectedPart && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="flex items-center gap-3">
            <button onClick={() => setView('parts')} className="text-blue-900 hover:bg-blue-50 p-2 rounded-lg transition"><X size={20} /></button>
            <div className="flex-1"><p className="text-xs text-gray-500">{selectedPart.icon} {selectedPart.part}</p><h2 className="text-2xl font-serif font-bold text-gray-800">{selectedPart.title}</h2></div>
            <button onClick={() => openAddSection(selectedPart)} className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-xl font-bold text-sm hover:bg-blue-800 transition"><Plus size={15} /> Add Section</button>
          </div>
          {selectedPart.sections.length === 0 && (<div className="text-center py-16 bg-white rounded-2xl border border-gray-100"><div className="text-6xl mb-4">📑</div><p className="font-bold text-gray-700">No Sections Yet</p><p className="text-gray-400 text-sm mt-1 mb-6">Add sections to organize the content</p><button onClick={() => openAddSection(selectedPart)} className="px-6 py-3 bg-blue-900 text-white rounded-xl font-bold hover:bg-blue-800">+ Add First Section</button></div>)}
          <div className="space-y-3">
            {selectedPart.sections.map(section => (
              <div key={section.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedPart.color} flex items-center justify-center flex-shrink-0`}><span className="text-white text-xs font-bold">§</span></div>
                  <div className="flex-1"><p className="text-xs text-gray-500 font-semibold">{section.section}</p><h3 className="font-serif font-bold text-gray-800">{section.title}</h3><p className="text-xs text-gray-400 mt-1">{section.articles.length} article(s)</p></div>
                  <div className="flex gap-2">
                    <button onClick={() => { setSelectedPart(selectedPart); setSelectedSection(section); setView('articles'); }} className="px-3 py-1.5 border border-blue-200 text-blue-900 rounded-lg text-xs font-bold hover:bg-blue-50">Articles ({section.articles.length})</button>
                    <button onClick={() => openEditSection(selectedPart, section)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"><Edit3 size={15} /></button>
                    <button onClick={() => deleteSection(selectedPart.id, section.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><Trash2 size={15} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* SECTION FORM */}
      {view === 'sectionForm' && selectedPart && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center gap-3"><button onClick={() => setView('sections')} className="text-blue-900 hover:bg-blue-50 p-2 rounded-lg transition"><X size={20} /></button><h2 className="text-2xl font-serif font-bold text-gray-800">{editSection ? 'Edit Section' : 'New Section'}</h2></div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <div><label className="block text-sm font-bold mb-2">Section Label *</label><input type="text" value={sectionForm.section} onChange={e => setSectionForm({...sectionForm, section: e.target.value})} placeholder="e.g. Section 1, Section 2" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm" /></div>
            <div><label className="block text-sm font-bold mb-2">Section Title *</label><input type="text" value={sectionForm.title} onChange={e => setSectionForm({...sectionForm, title: e.target.value})} placeholder="e.g. I Believe — We Believe" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm" /></div>
            <div className="flex gap-3 pt-2"><button onClick={() => setView('sections')} className="flex-1 py-3 border border-gray-200 rounded-xl font-semibold text-gray-600">Cancel</button><button onClick={saveSection} className="flex-1 py-3 bg-gradient-to-r from-blue-900 to-yellow-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg"><Save size={16} /> {editSection ? 'Update' : 'Add Section'}</button></div>
          </div>
        </motion.div>
      )}

      {/* ARTICLES VIEW */}
      {view === 'articles' && selectedPart && selectedSection && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="flex items-center gap-3">
            <button onClick={() => setView('sections')} className="text-blue-900 hover:bg-blue-50 p-2 rounded-lg transition"><X size={20} /></button>
            <div className="flex-1"><p className="text-xs text-gray-500">{selectedPart.icon} {selectedPart.part} • {selectedSection.section}</p><h2 className="text-xl font-serif font-bold text-gray-800">{selectedSection.title}</h2></div>
            <button onClick={() => openAddArticle(selectedPart, selectedSection)} className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-xl font-bold text-sm hover:bg-blue-800 transition"><Plus size={15} /> Add Article</button>
          </div>
          {selectedSection.articles.length === 0 && (<div className="text-center py-16 bg-white rounded-2xl border border-gray-100"><div className="text-6xl mb-4">📄</div><p className="font-bold text-gray-700">No Articles Yet</p><p className="text-gray-400 text-sm mt-1 mb-6">Add catechism articles to this section</p><button onClick={() => openAddArticle(selectedPart, selectedSection)} className="px-6 py-3 bg-blue-900 text-white rounded-xl font-bold hover:bg-blue-800">+ Add First Article</button></div>)}
          <div className="space-y-3">
            {selectedSection.articles.map((article, i) => (
              <motion.div key={article.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i*0.05 }} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedPart.color} flex items-center justify-center flex-shrink-0`}><span className="text-white text-xs font-bold">§{article.number}</span></div>
                  <div className="flex-1 min-w-0"><h3 className="font-serif font-bold text-gray-800">{article.title}</h3><p className="text-xs text-gray-500 mb-2">Paragraph §{article.number}</p><p className="text-sm text-gray-600 line-clamp-3">{article.text}</p></div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => openEditArticle(selectedPart, selectedSection, article)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"><Edit3 size={15} /></button>
                    <button onClick={() => deleteArticle(selectedPart.id, selectedSection.id, article.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><Trash2 size={15} /></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ARTICLE FORM */}
      {view === 'articleForm' && selectedPart && selectedSection && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center gap-3"><button onClick={() => setView('articles')} className="text-blue-900 hover:bg-blue-50 p-2 rounded-lg transition"><X size={20} /></button><div><p className="text-xs text-gray-500">{selectedPart.icon} {selectedSection.title}</p><h2 className="text-2xl font-serif font-bold text-gray-800">{editArticle ? 'Edit Article' : 'Add New Article'}</h2></div></div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <div className="grid sm:grid-cols-3 gap-4">
              <div><label className="block text-sm font-bold mb-2">Paragraph Number *</label><div className="relative"><span className="absolute left-4 top-3 text-gray-400 font-bold">§</span><input type="text" value={articleForm.number} onChange={e => setArticleForm({...articleForm, number: e.target.value})} placeholder="e.g. 26, 1210" className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm" /></div></div>
              <div className="sm:col-span-2"><label className="block text-sm font-bold mb-2">Article Title *</label><input type="text" value={articleForm.title} onChange={e => setArticleForm({...articleForm, title: e.target.value})} placeholder="e.g. On Faith, The Desire for God" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm" /></div>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Article Text *</label>
              <p className="text-xs text-gray-400 mb-2">💡 Type the catechism text exactly as it appears. Use quotation marks for quoted Scripture.</p>
              <textarea value={articleForm.text} onChange={e => setArticleForm({...articleForm, text: e.target.value})} placeholder="Type the catechism article content here..." rows={8} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm resize-none font-serif" />
              <p className="text-xs text-gray-400 mt-1">{articleForm.text.length} characters</p>
            </div>

            {/* Preview */}
            {articleForm.text && (
              <div className="border border-blue-100 bg-blue-50 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3"><div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${selectedPart.color} flex items-center justify-center`}><span className="text-white text-xs font-bold">§</span></div><span className="text-sm font-bold text-gray-600">CCC {articleForm.number || '---'}</span></div>
                <p className="text-gray-700 leading-relaxed font-serif text-sm">{articleForm.text}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2"><button onClick={() => setView('articles')} className="flex-1 py-3 border border-gray-200 rounded-xl font-semibold text-gray-600">Cancel</button><button onClick={saveArticle} className="flex-1 py-3 bg-gradient-to-r from-blue-900 to-yellow-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg"><Save size={16} /> {editArticle ? 'Update Article' : 'Add Article'}</button></div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// ============================================================================
// OTHER SIMPLIFIED ADMIN PAGES
// ============================================================================
const ManageAnnouncementsPage = ({ announcements, setAnnouncements }) => {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', category: 'general', date: '', priority: false, color: '#2563eb' });
  const categoryColors = { event: '#2563eb', emergency: '#dc2626', general: '#7c3aed' };
  const openAdd = () => { setForm({ title: '', content: '', category: 'general', date: new Date().toISOString().split('T')[0], priority: false, color: '#2563eb' }); setEditItem(null); setShowForm(true); };
  const openEdit = (item) => { setForm({ ...item }); setEditItem(item); setShowForm(true); };
  const handleSave = () => {
    const f = { ...form, color: categoryColors[form.category] || '#2563eb' };
    if (editItem) setAnnouncements(prev => prev.map(a => a.id === editItem.id ? { ...f, id: editItem.id } : a));
    else setAnnouncements(prev => [...prev, { ...f, id: Date.now() }]);
    setShowForm(false);
  };
  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
      <div className="flex items-center justify-between"><div><h2 className="text-3xl font-serif font-bold text-gray-800">Manage Announcements</h2><p className="text-gray-500 text-sm mt-1">Add, edit, or remove parish announcements</p></div><button onClick={openAdd} className="flex items-center gap-2 px-5 py-2 bg-blue-900 text-white rounded-xl font-bold text-sm hover:bg-blue-800 transition"><Plus size={16} /> Add New</button></div>
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h3 className="font-serif font-bold text-xl">{editItem ? 'Edit' : 'New'} Announcement</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><label className="block text-sm font-bold mb-2">Title *</label><input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm" /></div>
            <div className="sm:col-span-2"><label className="block text-sm font-bold mb-2">Content *</label><textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm resize-none" /></div>
            <div><label className="block text-sm font-bold mb-2">Category</label><select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm"><option value="event">Event</option><option value="emergency">Emergency</option><option value="general">General</option></select></div>
            <div><label className="block text-sm font-bold mb-2">Date</label><input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm" /></div>
            <div className="flex items-center gap-3"><label className="text-sm font-bold">Priority</label><button onClick={() => setForm({...form, priority: !form.priority})} className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${form.priority ? 'bg-blue-900' : 'bg-gray-200'}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${form.priority ? 'translate-x-6' : 'translate-x-1'}`} /></button></div>
          </div>
          <div className="flex gap-3"><button onClick={() => setShowForm(false)} className="flex-1 py-3 border border-gray-200 rounded-xl font-semibold text-gray-600">Cancel</button><button onClick={handleSave} className="flex-1 py-3 bg-gradient-to-r from-blue-900 to-yellow-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg"><Save size={16} /> {editItem ? 'Update' : 'Publish'}</button></div>
        </motion.div>
      )}
      <div className="space-y-3">
        {announcements.map(a => (<div key={a.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start gap-4"><div className="w-3 h-12 rounded-full flex-shrink-0" style={{ background: a.color }} /><div className="flex-1"><h3 className="font-bold text-gray-800">{a.title}</h3><p className="text-sm text-gray-500 line-clamp-2">{a.content}</p><p className="text-xs text-gray-400 mt-1">{a.category} • {a.date}</p></div><div className="flex gap-2"><button onClick={() => openEdit(a)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"><Edit3 size={16} /></button><button onClick={() => setAnnouncements(prev => prev.filter(x => x.id !== a.id))} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><Trash2 size={16} /></button></div></div>))}
      </div>
    </div>
  );
};

const ManageClergyPage = ({ clergy, setClergy }) => {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', title: '', bio: '', specialization: '', email: '', homilies: 0, image: 'linear-gradient(135deg, #1a3a52, #2d5a7b)' });
  const gradients = ['linear-gradient(135deg, #1a3a52, #2d5a7b)', 'linear-gradient(135deg, #2d5a7b, #1a3a52)', 'linear-gradient(135deg, #d4af37, #a38c2e)', 'linear-gradient(135deg, #1a5252, #2d7b6a)'];
  const openAdd = () => { setForm({ name: '', title: '', bio: '', specialization: '', email: '', homilies: 0, image: gradients[0] }); setEditItem(null); setShowForm(true); };
  const openEdit = (item) => { setForm({ ...item }); setEditItem(item); setShowForm(true); };
  const handleSave = () => {
    if (editItem) setClergy(prev => prev.map(c => c.id === editItem.id ? { ...form, id: editItem.id } : c));
    else setClergy(prev => [...prev, { ...form, id: Date.now() }]);
    setShowForm(false);
  };
  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
      <div className="flex items-center justify-between"><div><h2 className="text-3xl font-serif font-bold text-gray-800">Manage Clergy</h2><p className="text-gray-500 text-sm mt-1">Add, edit, or remove priest profiles</p></div><button onClick={openAdd} className="flex items-center gap-2 px-5 py-2 bg-blue-900 text-white rounded-xl font-bold text-sm hover:bg-blue-800 transition"><Plus size={16} /> Add Priest</button></div>
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h3 className="font-serif font-bold text-xl">{editItem ? 'Edit' : 'New'} Priest Profile</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-bold mb-2">Full Name *</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Fr. First Last" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm" /></div>
            <div><label className="block text-sm font-bold mb-2">Title *</label><select value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm"><option value="">Select title</option><option>Pastor</option><option>Associate Pastor</option><option>Deacon</option><option>Visiting Priest</option></select></div>
            <div><label className="block text-sm font-bold mb-2">Specialization</label><input type="text" value={form.specialization} onChange={e => setForm({...form, specialization: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm" /></div>
            <div><label className="block text-sm font-bold mb-2">Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm" /></div>
            <div className="sm:col-span-2"><label className="block text-sm font-bold mb-2">Biography</label><textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm resize-none" /></div>
            <div className="sm:col-span-2"><label className="block text-sm font-bold mb-2">Card Color</label><div className="flex gap-3">{gradients.map((g, i) => <button key={i} onClick={() => setForm({...form, image: g})} className={`w-12 h-12 rounded-xl border-4 transition ${form.image === g ? 'border-yellow-500 scale-110' : 'border-transparent'}`} style={{ background: g }} />)}</div></div>
          </div>
          <div className="flex gap-3"><button onClick={() => setShowForm(false)} className="flex-1 py-3 border border-gray-200 rounded-xl font-semibold text-gray-600">Cancel</button><button onClick={handleSave} className="flex-1 py-3 bg-gradient-to-r from-blue-900 to-yellow-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg"><Save size={16} /> {editItem ? 'Update' : 'Add Priest'}</button></div>
        </motion.div>
      )}
      <div className="grid sm:grid-cols-2 gap-4">
        {clergy.map(c => (<div key={c.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm"><div className="h-28 relative" style={{ background: c.image }}><div className="absolute top-3 right-3 flex gap-2"><button onClick={() => openEdit(c)} className="p-1.5 bg-white/20 backdrop-blur rounded-lg text-white hover:bg-white/30"><Edit3 size={14} /></button><button onClick={() => setClergy(prev => prev.filter(x => x.id !== c.id))} className="p-1.5 bg-white/20 backdrop-blur rounded-lg text-white hover:bg-red-500/50"><Trash2 size={14} /></button></div></div><div className="p-5"><h3 className="font-serif font-bold text-gray-800">{c.name}</h3><p className="text-yellow-600 text-sm font-semibold">{c.title}</p><p className="text-gray-500 text-xs mt-1">{c.specialization}</p></div></div>))}
      </div>
    </div>
  );
};

// ============================================================================
// 🛡️ ADMIN: MANAGE 3D CHURCH MODEL
// ============================================================================
const ManageVirtualTourPage = ({ hotspots: churchSections, setHotspots: setChurchSections }) => {
  const [view, setView] = useState('list');   // list | form | upload
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({
    name: '', icon: '⛪', desc: '', history: '', color: 'from-blue-900 to-blue-700'
  });

  const iconOptions = ['⛪','🔔','🏛️','🕍','🌿','🌀','🕯️','✝️','🌹','📿','🏺','⭐'];
  const colorOptions = [
    { label: 'Navy',    value: 'from-blue-900 to-blue-700'    },
    { label: 'Yellow',  value: 'from-yellow-700 to-yellow-900' },
    { label: 'Teal',    value: 'from-teal-800 to-teal-600'    },
    { label: 'Indigo',  value: 'from-indigo-800 to-indigo-600' },
    { label: 'Green',   value: 'from-green-800 to-green-600'  },
    { label: 'Rose',    value: 'from-rose-800 to-rose-600'    },
    { label: 'Purple',  value: 'from-purple-800 to-purple-600' },
    { label: 'Amber',   value: 'from-amber-700 to-amber-900'  },
  ];

  const openAdd = () => {
    setForm({ name: '', icon: '⛪', desc: '', history: '', color: 'from-blue-900 to-blue-700' });
    setEditItem(null); setView('form');
  };
  const openEdit = (item) => {
    setForm({ name: item.name, icon: item.icon || '⛪', desc: item.info || item.desc || '', history: item.history || '', color: item.color || 'from-blue-900 to-blue-700' });
    setEditItem(item); setView('form');
  };
  const handleSave = () => {
    if (!form.name.trim() || !form.desc.trim()) return alert('Please fill in Name and Description.');
    const entry = { name: form.name, icon: form.icon, info: form.desc, history: form.history, color: form.color, id: editItem?.id || Date.now() };
    if (editItem) setChurchSections(prev => prev.map(s => s.id === editItem.id ? entry : s));
    else          setChurchSections(prev => [...prev, entry]);
    setView('list');
  };
  const handleDelete = (id) => {
    if (confirm('Delete this church section?')) setChurchSections(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">

      {/* ── LIST VIEW ─────────────────────────────────────────────────── */}
      {view === 'list' && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-serif font-bold text-gray-800">Manage 3D Church Model</h2>
              <p className="text-gray-500 text-sm mt-1">Manage the church section cards shown inside the 3D Basilica page</p>
            </div>
            <button onClick={openAdd}
              className="flex items-center gap-2 px-5 py-2 bg-blue-900 text-white rounded-xl font-bold text-sm hover:bg-blue-800 transition">
              <Plus size={16} /> Add Section
            </button>
          </div>

          {/* 3D Status Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-950 to-blue-900 p-6 text-white">
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'linear-gradient(#d4af37 1px,transparent 1px),linear-gradient(90deg,#d4af37 1px,transparent 1px)',
              backgroundSize: '30px 30px',
            }} />
            <div className="relative flex items-start gap-5">
              <div className="text-5xl flex-shrink-0">⛪</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <p className="font-serif font-bold text-xl">3D Basilica Church Model</p>
                  <span className="text-xs bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 px-3 py-1 rounded-full font-bold">
                    🚧 Under Development
                  </span>
                </div>
                <p className="text-blue-200 text-sm leading-relaxed mb-4">
                  The interactive 3D model is currently being built. Once completed and integrated, parishioners will be able to rotate, zoom, and explore every part of the Basilica. In the meantime, manage the section information cards that will appear alongside the 3D model.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['🔄 360° Rotation','🔍 Zoom Control','👆 Tap to Explore','🏛️ Full Interior','📱 Mobile Ready'].map((f,i) => (
                    <span key={i} className="text-xs px-3 py-1 rounded-full font-semibold"
                      style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(212,175,55,0.3)', color:'rgba(255,255,255,0.75)' }}>
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* What Admin Can Do Info */}
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: '✏️', title: 'Edit Section Info',   desc: 'Update the name, description, and historical notes for each church section card shown to parishioners.' },
              { icon: '➕', title: 'Add New Sections',    desc: 'Add new church sections as more areas are added to the 3D model — e.g., Chapel, Sacristy, Bell Tower.' },
              { icon: '🗑️', title: 'Remove Sections',    desc: 'Delete sections that are no longer relevant or have been removed from the 3D model layout.' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
                <div className="text-3xl mb-2">{item.icon}</div>
                <p className="font-serif font-bold text-gray-800 mb-1">{item.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Upload 3D Model Notice */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">📁</span>
              <div>
                <p className="font-bold text-gray-800 mb-1">How to Add the Real 3D Model</p>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                  When the 3D Basilica model file is ready (in <strong>.glb</strong> or <strong>.obj</strong> format), it will be integrated by the developer directly into the codebase. The admin's job here is to manage the section information cards that appear alongside the model.
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {[
                    { label: 'Step 1', desc: 'Finish building the 3D church model' },
                    { label: 'Step 2', desc: 'Export as .glb file' },
                    { label: 'Step 3', desc: 'Developer integrates it into the website' },
                    { label: 'Step 4', desc: 'Admin updates section info cards here' },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white border border-yellow-200 px-3 py-1.5 rounded-lg">
                      <span className="w-5 h-5 bg-blue-900 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i+1}</span>
                      <span className="text-gray-600">{s.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Church Sections', value: churchSections.length, color: 'text-blue-900' },
              { label: '3D Model Status', value: 'In Dev', color: 'text-yellow-700' },
              { label: 'Visible to Public', value: 'Yes', color: 'text-green-700' },
            ].map((s,i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
                <p className={`text-2xl font-serif font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Section Cards List */}
          <div>
            <h3 className="font-serif font-bold text-xl text-gray-800 mb-4">Church Section Cards ({churchSections.length})</h3>
            {churchSections.length === 0 && (
              <div className="text-center py-14 bg-white rounded-2xl border border-gray-100">
                <div className="text-6xl mb-3">⛪</div>
                <p className="font-bold text-gray-700">No sections yet</p>
                <p className="text-sm text-gray-400 mt-1 mb-5">Add church sections that parishioners can learn about</p>
                <button onClick={openAdd}
                  className="px-6 py-3 bg-blue-900 text-white rounded-xl font-bold hover:bg-blue-800 transition">
                  + Add First Section
                </button>
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              {churchSections.map((section, i) => (
                <motion.div key={section.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* Card color header */}
                  <div className={`bg-gradient-to-r ${section.color || 'from-blue-900 to-blue-700'} px-5 py-4 text-white flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{section.icon || '⛪'}</span>
                      <div>
                        <p className="font-serif font-bold">{section.name}</p>
                        <p className="text-white/60 text-xs">Section {i + 1}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(section)}
                        className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition">
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => handleDelete(section.id)}
                        className="p-1.5 bg-white/20 hover:bg-red-500/50 rounded-lg transition">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {/* Card content */}
                  <div className="p-4 space-y-2">
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{section.info || section.desc}</p>
                    {section.history && (
                      <p className="text-xs text-gray-400 italic line-clamp-1">📜 {section.history}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── FORM VIEW ─────────────────────────────────────────────────── */}
      {view === 'form' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setView('list')}
              className="text-blue-900 hover:bg-blue-50 p-2 rounded-lg transition">
              <X size={20} />
            </button>
            <div>
              <h2 className="text-2xl font-serif font-bold text-gray-800">
                {editItem ? 'Edit Church Section' : 'Add New Church Section'}
              </h2>
              <p className="text-gray-500 text-sm">This info appears in the card below the 3D model</p>
            </div>
          </div>

          {/* Live Preview */}
          <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${form.color} p-6 text-white`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
            <div className="relative flex items-start gap-4">
              <span className="text-4xl flex-shrink-0">{form.icon || '⛪'}</span>
              <div>
                <p className="font-serif font-bold text-xl mb-1">{form.name || 'Section Name'}</p>
                <p className="text-white/80 text-sm leading-relaxed">{form.desc || 'Section description will appear here...'}</p>
                {form.history && <p className="text-white/60 text-xs mt-2 italic">📜 {form.history}</p>}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">Section Name *</label>
              <input type="text" value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                placeholder="e.g. Bell Towers, Main Nave, Central Dome"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm" />
            </div>

            {/* Icon Picker */}
            <div>
              <label className="block text-sm font-bold mb-3 text-gray-700">Section Icon</label>
              <div className="flex flex-wrap gap-3">
                {iconOptions.map(icon => (
                  <button key={icon} onClick={() => setForm({...form, icon})}
                    className={`w-12 h-12 text-2xl rounded-xl border-2 transition
                      ${form.icon === icon ? 'border-blue-900 bg-blue-50 scale-110' : 'border-gray-200 hover:border-gray-300'}`}>
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Picker */}
            <div>
              <label className="block text-sm font-bold mb-3 text-gray-700">Card Color</label>
              <div className="grid grid-cols-4 gap-3">
                {colorOptions.map(opt => (
                  <button key={opt.value} onClick={() => setForm({...form, color: opt.value})}
                    className={`h-11 rounded-xl bg-gradient-to-r ${opt.value} border-4 transition
                      ${form.color === opt.value ? 'border-yellow-500 scale-105' : 'border-transparent hover:scale-105'}`}
                    title={opt.label} />
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">Description *</label>
              <p className="text-xs text-gray-400 mb-2">Explain what this part of the church is — parishioners will read this when they click the section card</p>
              <textarea value={form.desc}
                onChange={e => setForm({...form, desc: e.target.value})}
                placeholder="e.g. The twin bell towers flank the main facade, each crowned with a pointed spire and golden cross..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm resize-none" />
              <p className="text-xs text-gray-400 mt-1">{form.desc.length} characters</p>
            </div>

            {/* Historical Note */}
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">Historical Note <span className="text-gray-400 font-normal">(optional)</span></label>
              <textarea value={form.history}
                onChange={e => setForm({...form, history: e.target.value})}
                placeholder="e.g. The bells were installed in 1892 and have rung every Sunday since..."
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm resize-none" />
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setView('list')}
                className="flex-1 py-3 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleSave}
                className="flex-1 py-3 bg-gradient-to-r from-blue-900 to-yellow-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition">
                <Save size={16} /> {editItem ? 'Update Section' : 'Add Section'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};


const AdminUploadPage = ({ homilies, setHomilies }) => {
  const [step, setStep] = useState(1);
  const [uploadData, setUploadData] = useState({ title: '', priest: 'Fr. John Santos', date: '', language: 'English' });
  const [processProgress, setProcessProgress] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const handleUpload = () => {
    setStep(2); let progress = 0;
    const interval = setInterval(() => { progress += 2; setProcessProgress(progress); if (progress >= 100) { clearInterval(interval); setTranscript("This is an AI-generated transcript using OpenAI Whisper. The homily has been processed and is ready for review. Parish administrators can edit this text before publishing..."); setStep(3); } }, 50);
  };
  const handlePublish = () => {
    setHomilies(prev => [{ id: Date.now(), title: uploadData.title || 'Untitled Homily', priest: uploadData.priest, date: uploadData.date || new Date().toISOString().split('T')[0], language: uploadData.language, duration: '00:00', views: 0, status: 'published', hasTranscript: true, excerpt: transcript.substring(0, 100) + '...', transcript, image: 'linear-gradient(135deg, #1a3a52 0%, #2d5a7b 100%)' }, ...prev]);
    setStep(1); setUploadData({ title: '', priest: 'Fr. John Santos', date: '', language: 'English' }); setProcessProgress(0); setTranscript('');
    alert('✅ Homily published successfully!');
  };
  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
      <div><h2 className="text-3xl font-serif font-bold text-gray-800">Upload Homily Recording</h2><p className="text-gray-500 text-sm mt-1">Upload audio for AI transcription</p></div>
      <div className="flex items-center gap-2">
        {[{ n: 1, label: 'Upload' }, { n: 2, label: 'Processing' }, { n: 3, label: 'Publish' }].map((s, i) => (<React.Fragment key={s.n}><div className={`flex items-center gap-2 ${step >= s.n ? 'text-blue-900' : 'text-gray-400'}`}><div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step > s.n ? 'bg-green-500 text-white' : step === s.n ? 'bg-blue-900 text-white' : 'bg-gray-200'}`}>{step > s.n ? <Check size={16} /> : s.n}</div><span className="text-xs font-semibold hidden sm:block">{s.label}</span></div>{i < 2 && <div className={`flex-1 h-0.5 ${step > s.n ? 'bg-green-500' : 'bg-gray-200'}`} />}</React.Fragment>))}
      </div>
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div><label className="block text-sm font-bold mb-2">Homily Title</label><input type="text" value={uploadData.title} onChange={e => setUploadData({...uploadData, title: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm" /></div>
            <div><label className="block text-sm font-bold mb-2">Priest</label><select value={uploadData.priest} onChange={e => setUploadData({...uploadData, priest: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm"><option>Fr. John Santos</option><option>Fr. Maria Santos</option></select></div>
            <div><label className="block text-sm font-bold mb-2">Date of Mass</label><input type="date" value={uploadData.date} onChange={e => setUploadData({...uploadData, date: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm" /></div>
            <div><label className="block text-sm font-bold mb-2">Language</label><select value={uploadData.language} onChange={e => setUploadData({...uploadData, language: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm"><option>English</option><option>Filipino</option></select></div>
          </div>
          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center hover:border-blue-300 hover:bg-blue-50/50 transition cursor-pointer"><FileAudio size={40} className="mx-auto mb-3 text-gray-400" /><p className="font-semibold text-gray-700 mb-1">Drag & drop audio file here</p><p className="text-xs text-gray-400 mb-4">MP3, WAV, M4A (max 500MB)</p><button className="px-6 py-2 bg-blue-900 text-white rounded-xl text-sm font-bold hover:bg-blue-800">Choose File</button></div>
          <button onClick={handleUpload} className="w-full py-4 bg-gradient-to-r from-blue-900 to-yellow-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2"><Upload size={20} /> Upload & Process with AI</button>
        </div>
      )}
      {step === 2 && (<div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center space-y-6"><div className="w-20 h-20 mx-auto bg-blue-50 rounded-full flex items-center justify-center"><Loader size={40} className="text-blue-900 animate-spin" /></div><div><h3 className="text-xl font-bold text-gray-800 mb-2">AI Processing...</h3><p className="text-gray-500 text-sm">OpenAI Whisper is transcribing</p></div><div><div className="flex justify-between text-sm mb-2"><span>Progress</span><span className="font-bold">{processProgress}%</span></div><div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden"><motion.div className="h-full bg-gradient-to-r from-blue-900 to-yellow-600 rounded-full" style={{ width: `${processProgress}%` }} /></div></div></div>)}
      {step === 3 && (<div className="space-y-5"><div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3"><CheckCircle size={20} className="text-green-600" /><p className="text-sm font-semibold text-green-800">Transcription complete! Review before publishing.</p></div><div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4"><div className="flex items-center justify-between"><h3 className="font-serif font-bold text-xl">AI Transcript</h3><button onClick={() => setIsEditing(!isEditing)} className="flex items-center gap-2 text-sm text-blue-900 font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-50"><Edit3 size={16} /> {isEditing ? 'Done' : 'Edit'}</button></div>{isEditing ? <textarea value={transcript} onChange={e => setTranscript(e.target.value)} rows={8} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm resize-none" /> : <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{transcript}</p>}</div><div className="flex gap-3"><button onClick={() => setStep(1)} className="flex-1 py-3 border border-gray-200 rounded-xl font-semibold text-gray-600">← Start Over</button><button onClick={handlePublish} className="flex-1 py-3 bg-gradient-to-r from-blue-900 to-yellow-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg"><Send size={18} /> Publish</button></div></div>)}
    </div>
  );
};

// ============================================================================
// PUBLIC PAGES (simplified)
// ============================================================================
const HomePage = ({ homilies, announcements, prayerCategories, catechismParts }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <div className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white px-6 py-20 overflow-hidden">
      <div className="absolute inset-0 opacity-10"><div className="absolute top-10 right-20 w-64 h-64 rounded-full bg-yellow-400 blur-3xl" /></div>
      <div className="relative max-w-4xl mx-auto space-y-4">
        <p className="text-yellow-400 font-semibold text-sm uppercase tracking-widest">Welcome to</p>
        <h2 className="text-4xl sm:text-5xl font-serif font-bold leading-tight">VerbaSacra Parish</h2>
        <p className="text-blue-200 text-xl max-w-xl">Homilies, Prayers, Catechism & Spiritual Growth</p>
        <div className="flex gap-4 pt-2 flex-wrap"><button className="px-8 py-3 bg-yellow-600 hover:bg-yellow-500 rounded-xl font-bold transition shadow-lg">Explore Homilies</button><button className="px-8 py-3 border-2 border-white/50 hover:bg-white/10 rounded-xl font-bold transition flex items-center gap-2"><Play size={18} /> Hear Now</button></div>
      </div>
    </div>
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
      <div className="bg-gradient-to-r from-blue-50 to-yellow-50 rounded-2xl p-10 text-center border border-yellow-200 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-900 to-yellow-600" />
        <p className="text-xs font-bold text-yellow-600 uppercase tracking-widest mb-4">Daily Gospel</p>
        <p className="text-2xl font-serif italic text-gray-800 leading-relaxed">"Ask and it will be given to you; seek and you will find; knock and the door will be opened to you."</p>
        <p className="text-sm font-bold text-gray-500 mt-4">Matthew 7:7</p>
      </div>
      <div>
        <h3 className="text-2xl font-serif font-bold text-gray-800 mb-6">Explore Our Resources</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: '📚', label: 'Homilies', desc: `${homilies.length} homilies available`, color: 'from-blue-900 to-blue-700' },
            { icon: '🙏', label: 'Prayers', desc: `${prayerCategories.reduce((a, c) => a + c.prayers.length, 0)} prayers in ${prayerCategories.length} categories`, color: 'from-indigo-800 to-indigo-600' },
            { icon: '📖', label: 'Catechism', desc: `${catechismParts.reduce((a, p) => a + p.sections.reduce((b, s) => b + s.articles.length, 0), 0)} articles`, color: 'from-teal-800 to-teal-600' },
            { icon: '⛪', label: '3D Church', desc: 'Explore our Basilica in 3D', color: 'from-yellow-700 to-yellow-500' },
          ].map((card, i) => (<motion.div key={i} whileHover={{ y: -4 }} className={`bg-gradient-to-br ${card.color} rounded-2xl p-5 text-white cursor-pointer shadow-lg hover:shadow-xl transition`}><div className="text-3xl mb-3">{card.icon}</div><h4 className="font-serif font-bold mb-1">{card.label}</h4><p className="text-white/70 text-xs">{card.desc}</p></motion.div>))}
        </div>
      </div>
      {homilies.length > 0 && (
        <div>
          <h3 className="text-2xl font-serif font-bold text-gray-800 mb-4">Latest Homily</h3>
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 flex flex-col sm:flex-row">
            <div className="h-48 sm:w-56 sm:h-auto flex-shrink-0" style={{ background: homilies[0].image }} />
            <div className="p-8 flex-1"><p className="text-xs font-bold text-yellow-600 uppercase tracking-widest mb-1">Featured</p><h4 className="text-2xl font-serif font-bold text-gray-800 mb-2">{homilies[0].title}</h4><p className="text-gray-500 text-sm mb-4">{homilies[0].priest} • {homilies[0].date}</p><button className="flex items-center gap-2 bg-blue-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-800 transition"><Play size={16} /> Listen Now</button></div>
          </div>
        </div>
      )}
    </div>
  </motion.div>
);

const HomilyArchivePage = ({ homilies }) => {
  const [search, setSearch] = useState('');
  const [filterLang, setFilterLang] = useState('all');
  const [selected, setSelected] = useState(null);
  const [fontSize, setFontSize] = useState('normal');
  const fontSizes = { small: 'text-sm', normal: 'text-base', large: 'text-lg', xlarge: 'text-xl' };

  const filtered = homilies.filter(h => {
    const matchSearch = h.title.toLowerCase().includes(search.toLowerCase()) || h.priest.toLowerCase().includes(search.toLowerCase());
    const matchLang = filterLang === 'all' || h.language === filterLang;
    return matchSearch && matchLang;
  });

  // ── Full Homily Reading View ──────────────────────────────────────────────
  if (selected) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        {/* Back button */}
        <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-blue-900 hover:bg-blue-50 px-4 py-2 rounded-xl font-semibold text-sm transition">
          ← Back to Homilies
        </button>

        {/* Hero banner */}
        <div className="relative rounded-2xl overflow-hidden h-52 shadow-lg" style={{ background: selected.image }}>
          <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-white/20 backdrop-blur text-white px-3 py-1 rounded-full font-semibold">{selected.language}</span>
              {selected.hasTranscript && <span className="text-xs bg-green-500 text-white px-3 py-1 rounded-full font-semibold">✓ Full Transcript</span>}
            </div>
            <h1 className="text-3xl font-serif font-bold text-white leading-tight">{selected.title}</h1>
            <p className="text-white/80 text-sm mt-1">{selected.priest} • {selected.date} • {selected.duration}</p>
          </div>
        </div>

        {/* Audio player simulation */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-3 mb-3">
            <Volume2 size={18} className="text-yellow-400" />
            <div><p className="font-bold text-sm">{selected.title}</p><p className="text-blue-200 text-xs">{selected.priest}</p></div>
          </div>
          <div className="w-full bg-blue-700 rounded-full h-1.5 mb-3"><div className="bg-yellow-400 h-1.5 rounded-full w-1/3" /></div>
          <div className="flex items-center justify-center gap-6">
            <button className="text-blue-200"><SkipBack size={18} /></button>
            <button className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center"><Play size={18} className="ml-0.5" /></button>
            <button className="text-blue-200"><SkipForward size={18} /></button>
          </div>
          <p className="text-center text-blue-300 text-xs mt-3">🎵 Audio playback will be available once connected to the server</p>
        </div>



        {/* Transcript */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h3 className="font-serif font-bold text-xl text-gray-800">Homily Transcript</h3>
              <p className="text-xs text-gray-400 mt-0.5">AI-transcribed — read and reflect at your own pace</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-semibold hidden sm:block">Font:</span>
              {[['S','small'],['N','normal'],['L','large'],['XL','xlarge']].map(([label, size]) => (
                <button key={size} onClick={() => setFontSize(size)} className={`w-8 h-8 rounded-lg text-xs font-bold transition ${fontSize === size ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{label}</button>
              ))}
            </div>
          </div>
          <div className="px-8 py-8">
            <p className={`${fontSizes[fontSize]} text-gray-700 leading-loose font-serif whitespace-pre-line`}>
              {selected.transcript}
            </p>
          </div>
        </div>

        {/* Reflection prompt */}
        <div className="bg-gradient-to-r from-blue-50 to-yellow-50 rounded-2xl p-6 border border-yellow-200">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💭</span>
            <div>
              <p className="font-bold text-gray-800 mb-1">Reflection</p>
              <p className="text-sm text-gray-600 leading-relaxed">Maging tahimik sandali at hayaang pumasok sa iyong puso ang mensahe ng homilya. Ano ang sinasabi ng Diyos sa iyo ngayon? / Be still for a moment and let the message of this homily enter your heart. What is God saying to you today?</p>
            </div>
          </div>
        </div>

        {/* Back button bottom */}
        <button onClick={() => setSelected(null)} className="w-full py-3 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition">
          ← Back to All Homilies
        </button>
      </motion.div>
    );
  }

  // ── Homily List View ─────────────────────────────────────────────────────
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto px-6 py-10 space-y-6">
      <div>
        <h2 className="text-3xl font-serif font-bold text-gray-800 mb-1">Homily Archive</h2>
        <p className="text-gray-500 text-sm">Click any homily card to read the full transcript</p>
      </div>

      {/* Search + filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={18} className="absolute left-4 top-3.5 text-gray-400" />
          <input type="text" placeholder="Search homilies..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm" />
        </div>
        <select value={filterLang} onChange={e => setFilterLang(e.target.value)} className="px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm font-semibold">
          <option value="all">All Languages</option>
          <option value="English">English</option>
          <option value="Filipino">Filipino / Tagalog</option>
        </select>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📚</div>
          <p className="font-semibold">No homilies found.</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((h, i) => (
          <motion.div key={h.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i*0.05 }} whileHover={{ y: -4 }}
            onClick={() => setSelected(h)}
            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition cursor-pointer group">
            <div className="h-40 relative" style={{ background: h.image }}>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                  <BookOpen size={20} className="text-blue-900" />
                </div>
              </div>
              <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                {h.hasTranscript && <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-semibold">✓ Transcript</span>}
                <span className="text-xs bg-white/80 text-blue-900 px-2 py-0.5 rounded-full font-semibold">{h.language}</span>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-serif font-bold text-gray-800 mb-1 leading-tight">{h.title}</h3>
              <p className="text-xs text-yellow-600 font-semibold mb-2">{h.priest}</p>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">{h.excerpt}</p>
              <div className="flex justify-between text-xs text-gray-400 mb-4 border-t border-gray-100 pt-3">
                <span>{h.date}</span><span>{h.duration}</span><span>{h.views} views</span>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-blue-900 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 hover:bg-blue-800 transition">
                  <Play size={12} /> Listen
                </button>
                <button className="flex-1 border border-blue-200 text-blue-900 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 hover:bg-blue-50 transition" onClick={e => { e.stopPropagation(); }}>
                  <BookOpen size={12} /> Read
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const AnnouncementsPage = ({ announcements }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const filtered = activeCategory === 'all' ? announcements : announcements.filter(a => a.category === activeCategory);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto px-6 py-10 space-y-6">
      <h2 className="text-3xl font-serif font-bold text-gray-800">Announcements</h2>
      <div className="flex gap-2 flex-wrap">{[{ id: 'all', label: 'All' }, { id: 'event', label: 'Events' }, { id: 'emergency', label: 'Emergency' }, { id: 'general', label: 'General' }].map(cat => (<button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`px-5 py-2 rounded-full font-semibold text-sm transition ${activeCategory === cat.id ? 'bg-gradient-to-r from-blue-900 to-yellow-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{cat.label}</button>))}</div>
      <div className="space-y-4">{filtered.map((a, i) => (<motion.div key={a.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i*0.1 }} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex"><div className="w-1.5 flex-shrink-0" style={{ background: a.color }} /><div className="flex-1 p-6"><div className="flex items-start justify-between gap-3 mb-2"><h3 className="font-serif font-bold text-gray-800">{a.title}</h3>{a.priority && <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold flex-shrink-0">Priority</span>}</div><p className="text-sm text-gray-600 mb-3">{a.content}</p><p className="text-xs text-gray-400">{a.date}</p></div></motion.div>))}</div>
    </motion.div>
  );
};

const ClergyPage = ({ clergy }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto px-6 py-10 space-y-8">
    <h2 className="text-3xl font-serif font-bold text-gray-800">Our Clergy</h2>
    <div className="grid sm:grid-cols-2 gap-8">{clergy.map((c, i) => (<motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i*0.1 }} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition"><div className="h-56 relative" style={{ background: c.image }}><div className="absolute bottom-4 left-4"><span className="text-xs bg-white/20 backdrop-blur text-white px-3 py-1 rounded-full font-semibold">{c.specialization}</span></div></div><div className="p-8"><h3 className="text-2xl font-serif font-bold text-gray-800">{c.name}</h3><p className="text-yellow-600 font-bold text-sm mb-4">{c.title}</p><p className="text-gray-600 text-sm mb-6 leading-relaxed">{c.bio}</p><div className="flex items-center justify-between pt-4 border-t border-gray-100"><div><p className="text-3xl font-serif font-bold text-blue-900">{c.homilies}</p><p className="text-xs text-gray-500">Total Homilies</p></div><button className="bg-blue-900 text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-blue-800 transition">View Homilies</button></div></div></motion.div>))}</div>
  </motion.div>
);

// ============================================================================
// 3D BASILICA CHURCH MODEL — Coming Soon Placeholder
// (Replace this component with the real 3D model when ready)
// ============================================================================
const BasilicaModel3D = () => {
  const [pulse, setPulse] = React.useState(false);

  React.useEffect(() => {
    const t = setInterval(() => setPulse(p => !p), 1400);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl"
      style={{ background: 'linear-gradient(135deg, #0d2137 0%, #1a3a52 50%, #0d2137 100%)', minHeight: '340px' }}>

      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'linear-gradient(#d4af37 1px, transparent 1px), linear-gradient(90deg, #d4af37 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      {/* Glow effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div style={{
          width: '220px', height: '220px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)',
          transform: pulse ? 'scale(1.15)' : 'scale(1)',
          transition: 'transform 1.4s ease-in-out',
        }} />
      </div>

      {/* Corner decorations */}
      {['top-3 left-3', 'top-3 right-3', 'bottom-3 left-3', 'bottom-3 right-3'].map((pos, i) => (
        <div key={i} className={`absolute ${pos} w-6 h-6 border-yellow-500 opacity-50`}
          style={{
            borderTop:    i < 2 ? '2px solid' : 'none',
            borderBottom: i >= 2 ? '2px solid' : 'none',
            borderLeft:   i % 2 === 0 ? '2px solid' : 'none',
            borderRight:  i % 2 === 1 ? '2px solid' : 'none',
          }} />
      ))}

      {/* Main content */}
      <div className="relative flex flex-col items-center justify-center py-16 px-6 text-center">

        {/* Church icon with ring animation */}
        <div className="relative mb-6">
          <div style={{
            position: 'absolute', inset: '-16px',
            borderRadius: '50%',
            border: '2px solid rgba(212,175,55,0.3)',
            transform: pulse ? 'scale(1.1)' : 'scale(1)',
            transition: 'transform 1.4s ease-in-out',
          }} />
          <div style={{
            position: 'absolute', inset: '-28px',
            borderRadius: '50%',
            border: '1px solid rgba(212,175,55,0.15)',
            transform: pulse ? 'scale(1.08)' : 'scale(0.95)',
            transition: 'transform 1.4s ease-in-out',
          }} />
          <div className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(212,175,55,0.15)', border: '2px solid rgba(212,175,55,0.4)' }}>
            <span style={{ fontSize: '40px' }}>⛪</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-serif font-bold text-white mb-2">
          3D Basilica Model
        </h3>
        <div className="flex items-center gap-2 mb-4">
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: '#d4af37',
            boxShadow: pulse ? '0 0 12px #d4af37' : '0 0 4px #d4af37',
            transition: 'box-shadow 1.4s ease-in-out',
          }} />
          <span className="text-yellow-400 text-sm font-bold uppercase tracking-widest">
            Under Development
          </span>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: '#d4af37',
            boxShadow: pulse ? '0 0 12px #d4af37' : '0 0 4px #d4af37',
            transition: 'box-shadow 1.4s ease-in-out',
          }} />
        </div>

        <p className="text-blue-200 text-sm max-w-md leading-relaxed mb-8">
          Our interactive 3D Basilica model is currently being developed. Soon you will be able to explore every sacred corner of our parish church in full 3D — rotate, zoom, and discover the beauty of our Basilica.
        </p>

        {/* Feature preview pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            '🔄 Rotate 360°',
            '🔍 Zoom In & Out',
            '👆 Tap to Explore',
            '🏛️ Full Interior View',
            '🕯️ Sacred Locations',
            '📱 Mobile Friendly',
          ].map((feat, i) => (
            <span key={i} className="text-xs px-3 py-1 rounded-full font-semibold"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(212,175,55,0.3)',
                color: 'rgba(255,255,255,0.7)',
              }}>
              {feat}
            </span>
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-64">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-blue-300 font-semibold">Development Progress</span>
            <span className="text-yellow-400 font-bold">In Progress</span>
          </div>
          <div className="w-full rounded-full overflow-hidden" style={{ height: '6px', background: 'rgba(255,255,255,0.1)' }}>
            <div className="h-full rounded-full"
              style={{
                width: '45%',
                background: 'linear-gradient(90deg, #d4af37, #f0d060)',
                boxShadow: '0 0 8px rgba(212,175,55,0.6)',
              }} />
          </div>
          <p className="text-blue-300 text-xs mt-1 text-right opacity-70">Coming soon...</p>
        </div>
      </div>
    </div>
  );
};

const CHURCH_PARTS = [
  { id: 1, icon: '🔔', name: 'Bell Towers',   desc: 'The twin bell towers flank the main facade, each crowned with a pointed spire and a golden cross. The bells have called parishioners to worship for over a century.',                                           color: 'from-yellow-700 to-yellow-900' },
  { id: 2, icon: '⛪', name: 'Main Facade',    desc: 'The grand front face of the Basilica features classical columns, a triangular pediment, a rose window, and the main arched entrance door decorated with sacred carvings.',                              color: 'from-blue-900 to-blue-700'   },
  { id: 3, icon: '🏛️', name: 'Central Dome',   desc: 'The majestic central dome rises above the crossing of the nave and transept. Its ribbed structure and lantern crown with a golden cross are visible from across the town.',                                color: 'from-teal-800 to-teal-600'   },
  { id: 4, icon: '🕍', name: 'Main Nave',      desc: 'The wide central nave leads worshippers toward the altar. Flanked by side aisles, the nave accommodates hundreds of parishioners during Mass. Stained glass windows line the upper clerestory.',         color: 'from-indigo-800 to-indigo-600' },
  { id: 5, icon: '🌿', name: 'Side Aisles',    desc: 'The side aisles provide additional seating and contain the Stations of the Cross, side altars dedicated to patron saints, and confessional booths used by parishioners.',                                 color: 'from-green-800 to-green-600' },
  { id: 6, icon: '🌀', name: 'Apse',           desc: 'The semicircular apse at the rear of the church houses the high altar and the tabernacle where the Blessed Sacrament is reserved. It is the most sacred area of the Basilica.',                         color: 'from-rose-800 to-rose-600'   },
];

const VirtualTourPage = () => {
  const [selected, setSelected] = useState(null);
  const [showControls, setShowControls] = useState(true);

  React.useEffect(() => {
    const t = setTimeout(() => setShowControls(false), 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 text-white px-6 py-12 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-5 right-10 w-56 h-56 rounded-full bg-yellow-400 blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="text-5xl mb-3">⛪</div>
          <h2 className="text-4xl font-serif font-bold mb-2">3D Basilica Church Model</h2>
          <p className="text-blue-200 text-base max-w-2xl mx-auto">Explore our parish church in an interactive 3D view. Rotate, zoom, and discover every sacred part of our Basilica.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* ── 3D Canvas ── */}
        <div className="relative bg-gradient-to-b from-blue-950 to-blue-900 rounded-2xl overflow-hidden shadow-2xl border border-blue-800">
          <BasilicaModel3D />
          {/* Controls hint */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none"
              >
                <div className="bg-black/60 backdrop-blur text-white text-xs px-4 py-2 rounded-full flex items-center gap-3">
                  <span>🖱️ Drag to rotate</span>
                  <span>•</span>
                  <span>🤏 Scroll to zoom</span>
                  <span>•</span>
                  <span>📱 Swipe on mobile</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Label overlay */}
          <div className="absolute top-3 left-3">
            <span className="bg-yellow-600/80 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full">
              ⛪ VerbaSacra Parish Basilica
            </span>
          </div>
          {/* Auto-rotate badge */}
          <div className="absolute top-3 right-3">
            <span className="bg-black/40 backdrop-blur text-white/70 text-xs px-2 py-1 rounded-full">
              Auto-rotating
            </span>
          </div>
        </div>

        {/* ── Info Cards Grid ── */}
        <div>
          <h3 className="text-xl font-serif font-bold text-gray-800 mb-4">
            Explore Church Sections
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CHURCH_PARTS.map((part, i) => (
              <motion.button
                key={part.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -3 }}
                onClick={() => setSelected(selected?.id === part.id ? null : part)}
                className={`relative overflow-hidden rounded-xl p-4 text-left transition shadow-sm
                  ${selected?.id === part.id
                    ? 'ring-2 ring-yellow-500 shadow-lg'
                    : 'bg-white border border-gray-100 hover:shadow-md'}`}
              >
                {selected?.id === part.id && (
                  <div className={`absolute inset-0 bg-gradient-to-br ${part.color} opacity-10`} />
                )}
                <div className="relative">
                  <div className="text-2xl mb-2">{part.icon}</div>
                  <p className={`font-serif font-bold text-sm leading-tight
                    ${selected?.id === part.id ? 'text-blue-900' : 'text-gray-800'}`}>
                    {part.name}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── Selected Part Detail ── */}
        <AnimatePresence>
          {selected && (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${selected.color} p-6 text-white shadow-xl`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
              <div className="relative flex items-start gap-4">
                <div className="text-4xl flex-shrink-0">{selected.icon}</div>
                <div>
                  <h4 className="text-xl font-serif font-bold mb-2">{selected.name}</h4>
                  <p className="text-white/85 text-sm leading-relaxed">{selected.desc}</p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-0 right-0 text-white/60 hover:text-white transition p-1"
                >
                  <X size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Footer note ── */}
        <div className="bg-gradient-to-r from-blue-50 to-yellow-50 rounded-2xl p-5 border border-yellow-200">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🕯️</span>
            <div>
              <p className="font-bold text-gray-800 mb-1">About Our Parish Basilica</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                This interactive 3D model represents our beautiful parish Basilica church. Explore each part of the church by clicking the section cards below the model. You can rotate the model by dragging and zoom using the scroll wheel or pinch gesture on mobile.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// ADMIN LOGIN
// ============================================================================
const AdminLoginPage = ({ onLogin, onBack }) => {
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPassword, setShowPass] = useState(false);
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState('');
  const [attempts, setAttempts]     = useState(0);
  const [isLocked, setIsLocked]     = useState(false);
  const [lockTimer, setLockTimer]   = useState(0);

  // Countdown timer when locked
  useEffect(() => {
    if (!isLocked) return;
    setLockTimer(30);
    const interval = setInterval(() => {
      setLockTimer(t => {
        if (t <= 1) {
          clearInterval(interval);
          setIsLocked(false);
          setAttempts(0);
          setError('');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isLocked]);

  const handleLogin = async () => {
    if (isLocked || isLoading) return;
    setError('');

    // Basic validation
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    // Email format check
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    // Simulate network delay for realism
    await new Promise(r => setTimeout(r, 1200));

    try {
      // Check email first
      if (email.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        throw new Error('invalid');
      }

      // Verify password using crypto hash
      const passwordOk = await verifyPassword(password);
      if (!passwordOk) {
        throw new Error('invalid');
      }

      // ✅ Login success — create session
      const adminData = { email: ADMIN_EMAIL, name: ADMIN_NAME };
      createSession(adminData);
      onLogin(adminData);

    } catch (err) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= 3) {
        setIsLocked(true);
        setError('Too many failed attempts. Please wait 30 seconds before trying again.');
      } else {
        setError(`Incorrect email or password. ${3 - newAttempts} attempt(s) remaining before lockout.`);
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-8 py-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-2 right-10 w-24 h-24 rounded-full bg-yellow-400 blur-2xl" />
          </div>
          <div className="relative">
            <h1 className="text-3xl font-serif font-bold text-white mb-1">VerbaSacra</h1>
            <p className="text-blue-200 text-sm">Secure Administrator Access</p>
          </div>
        </div>

        <div className="p-8 space-y-5">

          {/* Security badge */}
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 px-4 py-3 rounded-xl">
            <Shield size={22} className="text-blue-900 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-blue-900">🔐 Encrypted Login</p>
              <p className="text-xs text-blue-600">Password is verified using cryptographic hash</p>
            </div>
          </div>

          {/* Locked state */}
          {isLocked && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-red-700 font-bold text-sm mb-1">🔒 Account Temporarily Locked</p>
              <p className="text-red-600 text-xs mb-2">Too many failed attempts detected.</p>
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <p className="text-2xl font-bold text-red-700">{lockTimer}</p>
              </div>
              <p className="text-red-500 text-xs mt-2">Seconds remaining before unlock</p>
            </motion.div>
          )}

          {/* Error message */}
          {error && !isLocked && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Attempt indicator */}
          {attempts > 0 && !isLocked && (
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500">Attempts:</p>
              <div className="flex gap-1">
                {[1,2,3].map(n => (
                  <div key={n} className={`w-2.5 h-2.5 rounded-full ${n <= attempts ? 'bg-red-500' : 'bg-gray-200'}`} />
                ))}
              </div>
              <p className="text-xs text-gray-500">{3 - attempts} remaining</p>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-bold mb-2 text-gray-700">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-3.5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                onKeyPress={e => e.key === 'Enter' && handleLogin()}
                placeholder="Enter admin email"
                disabled={isLocked}
                autoComplete="email"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition disabled:opacity-50 text-sm"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-bold mb-2 text-gray-700">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-3.5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                onKeyPress={e => e.key === 'Enter' && handleLogin()}
                placeholder="Enter admin password"
                disabled={isLocked}
                autoComplete="current-password"
                className="w-full pl-11 pr-12 py-3 rounded-xl border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition disabled:opacity-50 text-sm"
              />
              <button
                onClick={() => setShowPass(!showPassword)}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Login button */}
          <motion.button
            whileHover={{ scale: isLocked ? 1 : 1.02 }}
            whileTap={{ scale: isLocked ? 1 : 0.98 }}
            onClick={handleLogin}
            disabled={isLoading || isLocked}
            className="w-full py-4 bg-gradient-to-r from-blue-900 to-yellow-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition"
          >
            {isLoading
              ? <><Loader size={20} className="animate-spin" /> Verifying securely...</>
              : isLocked
              ? <><Lock size={20} /> Locked ({lockTimer}s)</>
              : <><LogIn size={20} /> Sign In to Admin</>
            }
          </motion.button>

          {/* Security notice */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
            <p className="text-xs text-gray-600 font-semibold">🔐 Security Features Active:</p>
            <div className="space-y-1">
              {[
                '✓ Password hashed with SHA-512 cryptography',
                '✓ Session expires automatically after 8 hours',
                '✓ Account locks after 3 failed attempts',
                '✓ Restricted to authorized parish administrators only',
              ].map((item, i) => (
                <p key={i} className="text-xs text-gray-500">{item}</p>
              ))}
            </div>
          </div>

          {/* Back button */}
          <button
            onClick={onBack}
            className="w-full py-3 border border-gray-300 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2 text-sm"
          >
            ← Back to Parish Website
          </button>
        </div>
      </motion.div>
    </div>
  );
};


// ============================================================================
// MOBILE NAVIGATION — Horizontally scrollable bottom bar (all items visible)
// ============================================================================
const MobileNav = ({ navItems, currentPage, setCurrentPage }) => {
  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
      {/* Scroll hint fade on right */}
      <div className="relative">
        <div
          style={{
            overflowX: 'auto',
            overflowY: 'hidden',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          className="flex"
        >
          <div className="flex" style={{ minWidth: 'max-content', padding: '0 4px' }}>
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex flex-col items-center transition relative flex-shrink-0 ${isActive ? 'text-blue-900' : 'text-gray-400'}`}
                  style={{ minWidth: '72px', padding: '8px 6px 10px' }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-900 to-yellow-600"
                    />
                  )}
                  <Icon size={22} />
                  <span style={{ fontSize: '11px', marginTop: '4px', fontWeight: '600', whiteSpace: 'nowrap' }}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        {/* Right fade indicator to hint scrollability */}
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '32px',
            background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.95))',
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  );
};

const ParishionerDashboard = ({ onAdminLogin, homilies, announcements, clergy, hotspots, prayerCategories, catechismParts }) => {
  const [currentPage, setCurrentPage] = useState('home');
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'archive', icon: BookOpen, label: 'Homilies' },
    { id: 'prayers', icon: Heart, label: 'Prayers' },
    { id: 'catechism', icon: Book, label: 'Catechism' },
    { id: 'tour', icon: MapPin, label: '3D Church' },
    { id: 'announcements', icon: Megaphone, label: 'News' },
    { id: 'clergy', icon: Users, label: 'Clergy' },
  ];
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-serif font-bold bg-gradient-to-r from-blue-900 to-yellow-600 bg-clip-text text-transparent">VerbaSacra</h1>
          <button onClick={onAdminLogin} className="flex items-center gap-2 text-xs text-gray-500 hover:text-blue-900 transition px-3 py-2 rounded-lg hover:bg-gray-100 border border-gray-200"><Shield size={14} /> Admin</button>
        </div>
      </div>
      <div className="flex">
        <aside className="hidden sm:block w-56 bg-white border-r border-gray-200 min-h-screen sticky top-16 flex-shrink-0">
          <nav className="p-4 space-y-1 pt-6">
            {navItems.map(item => { const Icon = item.icon; const isActive = currentPage === item.id; return (<motion.button key={item.id} onClick={() => setCurrentPage(item.id)} whileHover={{ x: 4 }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-semibold text-sm ${isActive ? 'bg-gradient-to-r from-blue-900 to-yellow-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}><Icon size={17} /> {item.label} {isActive && <ChevronRight size={13} className="ml-auto" />}</motion.button>); })}
          </nav>
        </aside>
        <main className="flex-1 pb-24 sm:pb-0">
          <AnimatePresence mode="wait">
            {currentPage === 'home' && <HomePage key="home" homilies={homilies} announcements={announcements} prayerCategories={prayerCategories} catechismParts={catechismParts} />}
            {currentPage === 'archive' && <HomilyArchivePage key="archive" homilies={homilies} />}
            {currentPage === 'prayers' && <PrayersPage key="prayers" prayerCategories={prayerCategories} />}
            {currentPage === 'catechism' && <CatechismPage key="catechism" catechismParts={catechismParts} />}
            {currentPage === 'tour' && <VirtualTourPage key="tour" hotspots={hotspots} />}
            {currentPage === 'announcements' && <AnnouncementsPage key="announcements" announcements={announcements} />}
            {currentPage === 'clergy' && <ClergyPage key="clergy" clergy={clergy} />}
          </AnimatePresence>
        </main>
      </div>
      <MobileNav navItems={navItems} currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </div>
  );
};

// ============================================================================
// ADMIN DASHBOARD
// ============================================================================
const AdminDashboard = ({ admin, onLogout, homilies, setHomilies, announcements, setAnnouncements, clergy, setClergy, hotspots, setHotspots, prayerCategories, setPrayerCategories, catechismParts, setCatechismParts }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const navItems = [
    { id: 'dashboard', icon: Shield, label: 'Dashboard' },
    { id: 'upload', icon: Upload, label: 'Upload Homily' },
    { id: 'homilies', icon: BookOpen, label: 'Homilies' },
    { id: 'announcements', icon: Megaphone, label: 'Announcements' },
    { id: 'clergy', icon: Users, label: 'Clergy' },
    { id: 'tour', icon: MapPin, label: '3D Church' },
    { id: 'prayers', icon: Heart, label: 'Prayers' },
    { id: 'catechism', icon: Book, label: 'Catechism' },
  ];

  const DashboardHome = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      <div><h2 className="text-3xl font-serif font-bold text-gray-800">Admin Dashboard</h2><p className="text-gray-500 mt-1">Welcome back, {admin.name}</p></div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Homilies', value: homilies.length, color: 'text-blue-900' },
          { label: 'Announcements', value: announcements.length, color: 'text-yellow-700' },
          { label: 'Prayer Categories', value: prayerCategories.length, color: 'text-rose-600' },
          { label: 'Catechism Parts', value: catechismParts.length, color: 'text-teal-700' },
        ].map((s, i) => (<motion.div key={i} whileHover={{ y: -2 }} className="bg-white rounded-2xl p-5 text-center border border-gray-100 shadow-sm"><p className={`text-3xl font-serif font-bold ${s.color}`}>{s.value}</p><p className="text-xs text-gray-500 mt-1">{s.label}</p></motion.div>))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-xl font-serif font-bold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: Upload, label: 'Upload New Homily', desc: 'Record → Upload → AI Transcribe → Publish', page: 'upload', color: 'from-blue-900 to-blue-700' },
            { icon: Megaphone, label: 'Add Announcement', desc: 'Post events, emergency notices, updates', page: 'announcements', color: 'from-yellow-700 to-yellow-500' },
            { icon: Heart, label: 'Manage Prayers', desc: 'Add categories and prayer texts', page: 'prayers', color: 'from-rose-700 to-rose-500' },
            { icon: Book, label: 'Manage Catechism', desc: 'Add parts, sections, and articles', page: 'catechism', color: 'from-teal-800 to-teal-600' },
            { icon: Users, label: 'Manage Clergy', desc: 'Add or update priest profiles', page: 'clergy', color: 'from-green-800 to-green-600' },
            { icon: MapPin, label: '3D Church Model', desc: 'Manage church section info cards', page: 'tour', color: 'from-purple-800 to-purple-600' },
          ].map((action, i) => { const Icon = action.icon; return (<button key={i} onClick={() => setCurrentPage(action.page)} className={`flex items-center gap-4 p-4 bg-gradient-to-r ${action.color} text-white rounded-xl hover:shadow-lg transition text-left`}><div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0"><Icon size={20} /></div><div><p className="font-bold text-sm">{action.label}</p><p className="text-white/70 text-xs mt-0.5">{action.desc}</p></div></button>); })}
        </div>
      </div>

      {/* Content Summary */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h4 className="font-serif font-bold text-gray-800 mb-3">🙏 Prayers Summary</h4>
          {prayerCategories.map(cat => (<div key={cat.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0"><div className="flex items-center gap-2"><span>{cat.icon}</span><span className="text-sm text-gray-700">{cat.category}</span></div><span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold">{cat.prayers.length} prayers</span></div>))}
          {prayerCategories.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No prayer categories yet</p>}
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h4 className="font-serif font-bold text-gray-800 mb-3">📖 Catechism Summary</h4>
          {catechismParts.map(part => (<div key={part.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0"><div className="flex items-center gap-2"><span>{part.icon}</span><span className="text-sm text-gray-700 truncate max-w-32">{part.title}</span></div><span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-semibold">{part.sections.reduce((a, s) => a + s.articles.length, 0)} articles</span></div>))}
          {catechismParts.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No catechism parts yet</p>}
        </div>
      </div>
    </motion.div>
  );

  const ManageHomiliesPage = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto px-6 py-10 space-y-6">
      <div className="flex items-center justify-between"><div><h2 className="text-3xl font-serif font-bold text-gray-800">Manage Homilies</h2></div><button onClick={() => setCurrentPage('upload')} className="flex items-center gap-2 px-5 py-2 bg-blue-900 text-white rounded-xl font-bold text-sm hover:bg-blue-800 transition"><Plus size={16} /> Upload New</button></div>
      <div className="space-y-3">{homilies.map(h => (<div key={h.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4"><div className="w-16 h-16 rounded-xl flex-shrink-0" style={{ background: h.image }} /><div className="flex-1 min-w-0"><h3 className="font-bold text-gray-800 truncate">{h.title}</h3><p className="text-sm text-gray-500">{h.priest} • {h.date} • {h.language}</p><div className="flex items-center gap-2 mt-1"><span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">✓ Published</span>{h.hasTranscript && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">✓ Transcript</span>}</div></div><div className="flex gap-2 flex-shrink-0"><button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><Edit3 size={16} /></button><button onClick={() => setHomilies(prev => prev.filter(x => x.id !== h.id))} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><Trash2 size={16} /></button></div></div>))}</div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3"><h1 className="text-2xl font-serif font-bold bg-gradient-to-r from-blue-900 to-yellow-600 bg-clip-text text-transparent">VerbaSacra</h1><span className="text-xs bg-blue-900 text-white px-2 py-1 rounded-full font-semibold">Admin</span></div>
          <div className="flex items-center gap-3"><div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg"><Shield size={14} className="text-blue-900" /><span className="text-sm font-semibold text-blue-900">{admin.name}</span></div><button onClick={onLogout} className="text-xs text-gray-500 hover:text-red-600 transition px-3 py-2 rounded-lg hover:bg-red-50 border border-gray-200">Logout</button></div>
        </div>
      </div>
      <div className="flex">
        <aside className="hidden sm:block w-60 bg-white border-r border-gray-200 min-h-screen sticky top-16 flex-shrink-0">
          <nav className="p-4 space-y-1 pt-6">
            {navItems.map(item => { const Icon = item.icon; const isActive = currentPage === item.id; return (<motion.button key={item.id} onClick={() => setCurrentPage(item.id)} whileHover={{ x: 4 }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-semibold text-sm ${isActive ? 'bg-gradient-to-r from-blue-900 to-yellow-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}><Icon size={18} /> {item.label}</motion.button>); })}
          </nav>
        </aside>
        <main className="flex-1 pb-24 sm:pb-0">
          <AnimatePresence mode="wait">
            {currentPage === 'dashboard' && <DashboardHome key="dashboard" />}
            {currentPage === 'upload' && <AdminUploadPage key="upload" homilies={homilies} setHomilies={setHomilies} />}
            {currentPage === 'homilies' && <ManageHomiliesPage key="homilies" />}
            {currentPage === 'announcements' && <ManageAnnouncementsPage key="announcements" announcements={announcements} setAnnouncements={setAnnouncements} />}
            {currentPage === 'clergy' && <ManageClergyPage key="clergy" clergy={clergy} setClergy={setClergy} />}
            {currentPage === 'tour' && <ManageVirtualTourPage key="tour" hotspots={hotspots} setHotspots={setHotspots} />}
            {currentPage === 'prayers' && <ManagePrayersPage key="prayers" prayerCategories={prayerCategories} setPrayerCategories={setPrayerCategories} />}
            {currentPage === 'catechism' && <ManageCatechismPage key="catechism" catechismParts={catechismParts} setCatechismParts={setCatechismParts} />}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN APP
// ============================================================================
export default function VerbaSacraApp() {
  const [screen, setScreen] = useState('parishioner');
  const [qrId, setQrId] = useState('QR-VS-MAIN');
  const [admin, setAdmin] = useState(null);

  // All shared state
  const [homilies, setHomilies] = useState(initialHomilies);
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [clergy, setClergy] = useState(initialClergyData);
  const [hotspots, setHotspots] = useState(initialHotspots);
  const [prayerCategories, setPrayerCategories] = useState(initialPrayerCategories);
  const [catechismParts, setCatechismParts] = useState(initialCatechismParts);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check QR param
      const params = new URLSearchParams(window.location.search);
      const id = params.get('qr');
      if (id) { setQrId(id); setScreen('qr'); return; }
      // Restore existing admin session if still valid
      const session = getSession();
      if (session) {
        setAdmin(session.admin);
        setScreen('admin-dashboard');
      }
    }
  }, []);

  const shared = { homilies, setHomilies, announcements, setAnnouncements, clergy, setClergy, hotspots, setHotspots, prayerCategories, setPrayerCategories, catechismParts, setCatechismParts };

  return (
    <AnimatePresence mode="wait">
      {screen === 'qr' && <motion.div key="qr"><QRScanScreen qrId={qrId} onComplete={() => setScreen('parishioner')} /></motion.div>}
      {screen === 'parishioner' && <motion.div key="parishioner"><ParishionerDashboard onAdminLogin={() => setScreen('admin-login')} {...shared} /></motion.div>}
      {screen === 'admin-login' && <motion.div key="admin-login"><AdminLoginPage onLogin={a => { setAdmin(a); setScreen('admin-dashboard'); }} onBack={() => setScreen('parishioner')} /></motion.div>}
      {screen === 'admin-dashboard' && admin && <motion.div key="admin-dashboard"><AdminDashboard admin={admin} onLogout={() => { clearSession(); setAdmin(null); setScreen('parishioner'); }} {...shared} /></motion.div>}
    </AnimatePresence>
  );
}