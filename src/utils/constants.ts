import { MusicTrack } from '../types';

export interface PresetQuote {
  category: string;
  quote: string;
  authorOrVibe: string;
}

export const PRESET_QUOTES: PresetQuote[] = [
  {
    category: 'هيبة وكبرياء',
    quote: 'ما دمتَ تمشي مستقيماً فلا تبالِ بالعقول المائلة.. عش كما تحب واصنع مجدك بنفسك.',
    authorOrVibe: 'تريند فيسبوك الشهير',
  },
  {
    category: 'هيبة وكبرياء',
    quote: 'أنا لستُ فرصة ثانية ولا خياراً مؤجلاً.. أنا البداية والنهاية في كبريائي.',
    authorOrVibe: 'عزة نفس',
  },
  {
    category: 'هيبة وكبرياء',
    quote: 'اصنع لنفسك مكاناً في القمة، ففي القاع ازدحامٌ شديد لا يليق بك.',
    authorOrVibe: 'طموح وقوة',
  },
  {
    category: 'خواطر وعتاب',
    quote: 'سلامٌ على من رآنا نميل فأقامنا، ولم يُثقل علينا بحكمٍ ولا ملامة.',
    authorOrVibe: 'عميق ومؤثر',
  },
  {
    category: 'خواطر وعتاب',
    quote: 'نحن لا نتغير بل نكتشف من يستحق أن يبقى ومن كان مجرد عابر.',
    authorOrVibe: 'نضج ووعي',
  },
  {
    category: 'خواطر وعتاب',
    quote: 'كن لنفسك كل شيء.. فالظل يهجرك حين يغيب النور.',
    authorOrVibe: 'حكمة واقعية',
  },
  {
    category: 'أدعية وطمأنينة',
    quote: 'اللهم راحةً تسع المدى، وطمأنينة تملأ الروح، وتوفيقاً يلازم كل خطوة.',
    authorOrVibe: 'دعاء وسكينة',
  },
  {
    category: 'أدعية وطمأنينة',
    quote: 'سيُزهر الله ما ذبل، ويجبر ما انكسر، فإن بعد كل عُسرٍ يسراً.',
    authorOrVibe: 'أمل ويقين',
  },
  {
    category: 'نجاح وشغف',
    quote: 'لا تنتظر اللحظة المثالية، خذ اللحظة واجعلها أنت أسطورية.',
    authorOrVibe: 'تحفيز وإنجاز',
  },
  {
    category: 'حب وشعر',
    quote: 'وفي عينيك عهدٌ بالجمال، كأن الليل في كفيك ناما.',
    authorOrVibe: 'شعر وغزل',
  },
];

export const USER_CUSTOM_PHOTO_URL = '/src/assets/images/user_photo_1791554417804.jpg';

export interface PresetPhoto {
  id: string;
  title: string;
  tag: string;
  url: string;
}

export const PRESET_PHOTOS: PresetPhoto[] = [
  {
    id: 'user-photo',
    title: 'صورتي الشخصية (المحددة)',
    tag: 'صورتك الحالية ⭐',
    url: USER_CUSTOM_PHOTO_URL,
  },
  {
    id: 'default-viral',
    title: 'الصورة السينمائية الأصلية',
    tag: 'تريند فيسبوك',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1080&q=80',
  },
  {
    id: 'portrait-man',
    title: 'بورتريه شبابي فخم',
    tag: 'رسمي وأنيق',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1080&q=80',
  },
  {
    id: 'portrait-woman',
    title: 'بورتريه سينمائي هادئ',
    tag: 'جمالي وناعم',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1080&q=80',
  },
  {
    id: 'arabian-horse',
    title: 'خيل عربي أصيل',
    tag: 'فخامة وأصالة',
    url: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=1080&q=80',
  },
  {
    id: 'moody-coffee',
    title: 'قهوة ومطر ودفء',
    tag: 'خواطر وشتاء',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1080&q=80',
  },
  {
    id: 'luxury-city',
    title: 'أضواء المدينة والسيارات',
    tag: 'عصري وليلي',
    url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1080&q=80',
  },
];

export const MUSIC_LIBRARY: MusicTrack[] = [
  // 1. هادئة (Calm)
  {
    id: 'calm-piano',
    title: 'صوت أصلي • ريمكس بيانو وشتاء 🎹',
    artistOrVibe: 'عزف بيانو هادئ ولطيف',
    category: 'calm',
    categoryLabel: 'هادئة',
    badge: 'تريند هادئ ☕',
    icon: '🎹',
    duration: '0:30',
    description: 'نغمات بيانو كلاسيكية مريحة مع أصوات مطر خفيفة لخواطر الهدوء والسكينة',
  },
  {
    id: 'calm-oud',
    title: 'تقاسيم عود شرقي هادئ 🪕',
    artistOrVibe: 'أصالة وتأمل ليلي',
    category: 'calm',
    categoryLabel: 'هادئة',
    badge: 'طرب أصيل 🌙',
    icon: '🪕',
    duration: '0:28',
    description: 'عزف عود منفرد بنغمات بياتي ونهاوند دافئة تلامس الروح وتليق بالحالات الفخمة',
  },
  {
    id: 'calm-lofi',
    title: 'همسات الليل ونسيم الهدوء 🌧️',
    artistOrVibe: 'لوفاي وسكينة داخلية',
    category: 'calm',
    categoryLabel: 'هادئة',
    badge: 'استرخاء وتفكير 💭',
    icon: '🎧',
    duration: '0:35',
    description: 'موسيقى محيطية خافتة مع إيقاع ناعم جداً للتأمل ومقاطع الليل والقهوة',
  },
  {
    id: 'calm-duaa',
    title: 'أرواح مطمئنة وسكينة القلوب 🕊️',
    artistOrVibe: 'طمأنينة ودعاء',
    category: 'calm',
    categoryLabel: 'هادئة',
    badge: 'روحانيات ونور ✨',
    icon: '🕊️',
    duration: '0:30',
    description: 'خلفية صوتية هادئة تعزز مشاعر الرضا واليقين للأدعية والعبارات الإيمانية',
  },

  // 2. حماسية (Energetic)
  {
    id: 'energy-sheila',
    title: 'شيلة حماسية • فخامة وعزة نفس 🔥',
    artistOrVibe: 'هيبة وكبرياء أصيل',
    category: 'energetic',
    categoryLabel: 'حماسية',
    badge: 'شيلات وفخامة 👑',
    icon: '🔥',
    duration: '0:32',
    description: 'إيقاع حماسي قوي مفعم بعزة النفس والشموخ ومناسب لمقاطع الثقة والقوة',
  },
  {
    id: 'energy-phonk',
    title: 'فونك سينمائي • تريند المليون مشاهدة ⚡',
    artistOrVibe: 'دريفت وفيسبوك ريلز عصري',
    category: 'energetic',
    categoryLabel: 'حماسية',
    badge: 'تريند تيك توك 🚀',
    icon: '⚡',
    duration: '0:25',
    description: 'صوت بيز قوي مع إيقاع سريع وجذاب يلفت الانتباه من الثانية الأولى للريلز',
  },
  {
    id: 'energy-epic',
    title: 'إيقاع ملحمي صاعد • خطوات المجد 🏆',
    artistOrVibe: 'طموح وتحفيز للقمة',
    category: 'energetic',
    categoryLabel: 'حماسية',
    badge: 'تحفيز وإنجاز 💪',
    icon: '🏆',
    duration: '0:30',
    description: 'طبول ملحمية وتصاعد موسيقي بطولي يزرع الحماس لمقاطع الرياضة والنجاح',
  },
  {
    id: 'energy-pulse',
    title: 'نبض إلكتروني فخم • طاقة وحيوية 🏎️',
    artistOrVibe: 'عصري وليلي',
    category: 'energetic',
    categoryLabel: 'حماسية',
    badge: 'إيقاع سريع 💥',
    icon: '🏎️',
    duration: '0:29',
    description: 'موسيقى حديثة متناغمة مع الحركة السريعة والانتقالات البصرية الصاخبة',
  },

  // 3. درامية (Dramatic)
  {
    id: 'drama-orchestra',
    title: 'سيمفونية سينمائية درامية 🎬',
    artistOrVibe: 'أوركسترا حزينة وعميقة',
    category: 'dramatic',
    categoryLabel: 'درامية',
    badge: 'سينما هوليوود 🎻',
    icon: '🎬',
    duration: '0:34',
    description: 'وتريات كمان أوركسترالية مؤثرة تهز المشاعر وتعبر عن العمق والأثر الباقي',
  },
  {
    id: 'drama-cello',
    title: 'عزف تشيلو مؤثر • عتاب وذكريات 🎻',
    artistOrVibe: 'شجن وخواطر صادقة',
    category: 'dramatic',
    categoryLabel: 'درامية',
    badge: 'عتاب وفراق 💔',
    icon: '🎻',
    duration: '0:31',
    description: 'نغمات تشيلو عميقة ومنخفضة تحكي قصة ألم ونضج وعتاب راقٍ لا يُنسى',
  },
  {
    id: 'drama-noir',
    title: 'لحن الليل والغموض • حكايات لا تنتهي 🌑',
    artistOrVibe: 'سينمائي غامض ومثير',
    category: 'dramatic',
    categoryLabel: 'درامية',
    badge: 'غموض وهيبة 👁️',
    icon: '🌑',
    duration: '0:33',
    description: 'أجواء استوديو دخانية وموسيقى تصويرية غامضة تلائم البورتريهات الليلية والظلال',
  },
  {
    id: 'drama-hope',
    title: 'عودة الأمل بعد الانكسار 🌅',
    artistOrVibe: 'لحن درامي تصاعدي ملهم',
    category: 'dramatic',
    categoryLabel: 'درامية',
    badge: 'أمل وتفاؤل 🌟',
    icon: '🌅',
    duration: '0:30',
    description: 'بداية درامية حزينة تتحول تدريجياً إلى إشراقة أمل ونصر معبّر عن القوة الذاتية',
  },
];

export interface GradientPreset {
  id: string;
  name: string;
  colors: [string, string, string];
  css: string;
}

export const GRADIENT_PRESETS: GradientPreset[] = [
  {
    id: 'sunset-gold',
    name: 'غروب ذهبي وعنبري 🌅',
    colors: ['#180d04', '#b45309', '#f59e0b'],
    css: 'linear-gradient(135deg, #180d04 0%, #78350f 40%, #b45309 70%, #f59e0b 100%)',
  },
  {
    id: 'royal-purple',
    name: 'ملكي بنفسجي وأرجواني 👑',
    colors: ['#090214', '#581c87', '#a855f7'],
    css: 'linear-gradient(135deg, #090214 0%, #3b0764 45%, #7e22ce 80%, #a855f7 100%)',
  },
  {
    id: 'obsidian-dark',
    name: 'ليل داكن فخم 🌑',
    colors: ['#000000', '#09090b', '#27272a'],
    css: 'linear-gradient(135deg, #000000 0%, #09090b 50%, #27272a 100%)',
  },
  {
    id: 'emerald-night',
    name: 'زمردي غامق وفاخر 🌲',
    colors: ['#021a12', '#064e3b', '#10b981'],
    css: 'linear-gradient(135deg, #021a12 0%, #064e3b 45%, #047857 75%, #10b981 100%)',
  },
  {
    id: 'midnight-navy',
    name: 'كحلي بحري عميق 🌊',
    colors: ['#030712', '#1e3a8a', '#3b82f6'],
    css: 'linear-gradient(135deg, #030712 0%, #0c2340 45%, #1e3a8a 75%, #3b82f6 100%)',
  },
  {
    id: 'crimson-wine',
    name: 'نبيذي وعنابي درامي 🍷',
    colors: ['#180308', '#881337', '#e11d48'],
    css: 'linear-gradient(135deg, #180308 0%, #4c0519 45%, #881337 75%, #e11d48 100%)',
  },
  {
    id: 'cyber-neon',
    name: 'تيل ونيون عصري ⚡',
    colors: ['#02181d', '#0d9488', '#14b8a6'],
    css: 'linear-gradient(135deg, #02181d 0%, #115e59 45%, #0d9488 75%, #14b8a6 100%)',
  },
];
