export type Locale = 'en' | 'ar'

export const LOCALES: Locale[] = ['en', 'ar']

export const translations = {
  en: {
    dir: 'ltr' as const,
    nav: {
      story: 'Story',
      menu: 'Menu',
      play: 'Play',
      visit: 'Visit Us',
      switchLang: 'العربية',
      switchLangAria: 'Switch language to Arabic',
    },
    hero: {
      brand: 'Amigo',
      titleTop: 'AMIGO',
      titleBottom: 'CAFE',
      tagline:
        'Specialty coffee by day, PlayStation lounge by night. Grab a cup, grab a controller — every guest is a friend.',
      scroll: 'Scroll to taste the journey',
    },
    marquee: ['Espresso', 'Amigos', 'Cortado', 'Buenos Dias', 'Cold Brew', 'Hola'],
    journey: {
      label: 'From bean to cup journey',
      chapters: [
        {
          title: 'The Bean',
          body: 'Single-origin beans, hand-picked at high altitude. We roast in small batches every morning so the first cup of the day smells like the farm it came from.',
        },
        {
          title: 'The Craft',
          body: 'Nine grams of pressure, twenty-five seconds of patience. Our baristas treat every shot like a signature — dialed in, tasted, and pulled with intention.',
        },
        {
          title: 'The Play',
          body: 'When the cup is empty, the games begin. Grab a controller, pick your match, and settle into our PlayStation lounge — where the only thing more intense than the espresso is the rivalry.',
        },
      ],
    },
    vibe: {
      label: '(Our Philosophy)',
      manifesto:
        'A cafe is not a place. It is a feeling. The smell of fresh roast, the hum of conversation, a stranger who becomes an amigo.',
    },
    gallery: {
      label: 'Cafe gallery',
      titleTop: 'Inside',
      titleBottom: 'Amigo',
      caption:
        'A few frames from a typical day — the bar, the pour, the screens, the people. Scroll through the room we built for you.',
    },
    menu: {
      titleTop: 'The Menu,',
      titleBottom: 'Amigo Style',
      caption:
        "Roasted in-house, poured with intention. Prices in EGP — ask your barista about today's rotating single origin.",
      currency: 'EGP',
      groups: [
        {
          category: 'Espresso',
          caption: 'Pulled to order',
          items: [
            { name: 'Cafe de Olla', desc: 'Cinnamon, piloncillo, slow-brewed', tags: ['Signature'] },
            { name: 'Cortado Amigo', desc: 'Double shot, silky oat milk', tags: [] },
            { name: 'Horchata Latte', desc: 'House horchata, espresso, ice', tags: ['Iced'] },
          ],
        },
        {
          category: 'Slow Bar',
          caption: 'Single origin, hand-poured',
          items: [
            { name: 'V60 Pour Over', desc: 'Rotating single-origin, 320ml', tags: [] },
            { name: 'Cold Brew Tonic', desc: '18hr steep, citrus, tonic', tags: ['Iced'] },
          ],
        },
        {
          category: 'Pan Dulce',
          caption: 'Baked each morning',
          items: [
            { name: 'Concha & Cafe', desc: 'Fresh pan dulce, drip pairing', tags: ['Pairing'] },
            { name: 'Butter Croissant', desc: 'Laminated 72 hours, sea salt', tags: [] },
          ],
        },
      ],
    },
    playstation: {
      label: 'PlayStation gaming lounge',
      pressStart: '(Press Start)',
      titleTop: 'Game',
      titleBottom: 'On',
      caption:
        "Amigo isn't just coffee. It's a PlayStation lounge built for late nights, long sessions, and bragging rights. Pull up, plug in.",
      loungeTag: 'The Lounge',
      consoles: [
        {
          name: 'PS5 Booths',
          desc: 'Private booths with 4K screens and the latest PlayStation 5 — solo grind or squad up.',
          detail: '6 Stations',
        },
        {
          name: 'Co-op Couches',
          desc: 'Big-screen leather lounges built for FIFA nights, fighting games, and friendly trash talk.',
          detail: '4 Lounges',
        },
        {
          name: 'Tournaments',
          desc: 'Weekly brackets with a leaderboard, prizes, and a free Cafe de Olla for the champion.',
          detail: 'Every Thursday',
        },
      ],
      ratesLabel: 'Play Rates',
      currency: 'EGP',
      rates: [
        { label: 'Solo / hr', note: 'One controller, one player' },
        { label: 'Duo / hr', note: 'Two controllers, split a couch' },
        { label: 'Squad / hr', note: 'Up to four players, full booth' },
      ],
    },
    location: {
      kicker: 'Find Your Way',
      title: 'Come Say Hola',
      addressLabel: 'Address',
      address: ['Qasr El Saadawy, New Branch', 'Belbeis, Sharqia'],
      hoursLabel: 'Hours',
      hours: 'Daily: 8am – 12am',
      directions: 'Get Directions',
    },
    footer: {
      findLabel: 'Find Us',
      address: ['Qasr El Saadawy, New Branch', 'Belbeis, Sharqia'],
      hoursLabel: 'Hours',
      hours: ['Daily: 8am – 12am'],
      sayLabel: 'Say Hola',
      copyright: '© 2026 Amigo Cafe. Roasted with soul.',
      tagline: 'Every cup is a story.',
    },
    theme: {
      toLight: 'Switch to light mode',
      toDark: 'Switch to dark mode',
      toggle: 'Toggle color theme',
    },
  },

  ar: {
    dir: 'rtl' as const,
    nav: {
      story: 'حكايتنا',
      menu: 'المنيو',
      play: 'العب',
      visit: 'زورنا',
      switchLang: 'English',
      switchLangAria: 'تغيير اللغة إلى الإنجليزية',
    },
    hero: {
      brand: 'أميجو',
      titleTop: 'أميجو',
      titleBottom: 'كافيه',
      tagline:
        'قهوة مختصة في النهار، ولاونج بلايستيشن في الليل. خُد لك فنجان، وامسك الدراع — كل ضيف عندنا صاحب.',
      scroll: 'انزل تحت وتذوّق الرحلة',
    },
    marquee: ['إسبريسو', 'أصحاب', 'كورتادو', 'صباح الفل', 'قهوة باردة', 'أهلاً'],
    journey: {
      label: 'رحلة من حبة البن إلى الفنجان',
      chapters: [
        {
          title: 'حبة البن',
          body: 'حبوب أحادية المصدر، منتقاة باليد من المرتفعات العالية. بنحمّصها على دفعات صغيرة كل صباح، عشان أول فنجان في اليوم تحس فيه ريحة المزرعة اللي جه منها.',
        },
        {
          title: 'الحِرفة',
          body: 'تسعة جرامات من الضغط، وخمسة وعشرون ثانية من الصبر. الباريستا عندنا بيعامل كل شوت كأنه توقيع — مضبوط، ومتذوّق، ومسحوب بنية صافية.',
        },
        {
          title: 'اللعب',
          body: 'لما يخلص الفنجان، تبدأ الألعاب. امسك الدراع، اختار ماتشك، واستقر في لاونج البلايستيشن — المكان الوحيد اللي المنافسة فيه أقوى من الإسبريسو.',
        },
      ],
    },
    vibe: {
      label: '(فلسفتنا)',
      manifesto:
        'الكافيه مش مكان، الكافيه إحساس. ريحة التحميص الطازج، وهمسة الكلام، وغريب بيبقى صاحب.',
    },
    gallery: {
      label: 'معرض صور الكافيه',
      titleTop: 'جوّه',
      titleBottom: 'أميجو',
      caption:
        'كام لقطة من يوم عادي عندنا — البار، صب القهوة، الشاشات، والناس. اتفرّج على المكان اللي بنيناه عشانك.',
    },
    menu: {
      titleTop: 'المنيو،',
      titleBottom: 'على طريقة أميجو',
      caption:
        'محمّصة في المحل، ومسحوبة بنية صافية. الأسعار بالجنيه المصري — اسأل الباريستا عن قهوة اليوم أحادية المصدر.',
      currency: 'ج.م',
      groups: [
        {
          category: 'إسبريسو',
          caption: 'تتحضّر عند الطلب',
          items: [
            { name: 'كافيه دي أويا', desc: 'قرفة، سكر بني، تحضير بطيء', tags: ['المميز'] },
            { name: 'كورتادو أميجو', desc: 'دبل شوت، حليب شوفان حريري', tags: [] },
            { name: 'لاتيه الأرز', desc: 'مشروب الأرز البيتي، إسبريسو، تلج', tags: ['بارد'] },
          ],
        },
        {
          category: 'سلو بار',
          caption: 'أحادي المصدر، مصبوب باليد',
          items: [
            { name: 'في60 بور أوفر', desc: 'أحادي المصدر متغير، 320 مل', tags: [] },
            { name: 'كولد برو تونيك', desc: 'نقع 18 ساعة، حمضيات، تونيك', tags: ['بارد'] },
          ],
        },
        {
          category: 'مخبوزات حلوة',
          caption: 'تتخبز كل صباح',
          items: [
            { name: 'كونشا وقهوة', desc: 'حلويات طازجة مع قهوة درِب', tags: ['تشكيلة'] },
            { name: 'كرواسون بالزبدة', desc: 'مفرّد على مدى 72 ساعة، ملح بحري', tags: [] },
          ],
        },
      ],
    },
    playstation: {
      label: 'لاونج ألعاب بلايستيشن',
      pressStart: '(اضغط ستارت)',
      titleTop: 'يلا',
      titleBottom: 'نلعب',
      caption:
        'أميجو مش بس قهوة. ده لاونج بلايستيشن متعمّل لليالي الطويلة، والجلسات اللي ما تخلصش، والفخر بالفوز. تعالى، وصّل الدراع، وابدأ.',
      loungeTag: 'اللاونج',
      consoles: [
        {
          name: 'كبائن PS5',
          desc: 'كبائن خاصة بشاشات 4K وأحدث بلايستيشن 5 — العب لوحدك أو لمّ الشلة.',
          detail: '6 محطات',
        },
        {
          name: 'كنب كو-أوب',
          desc: 'كنب جلد بشاشات كبيرة، متعمّل لليالي فيفا، وألعاب القتال، والهزار الودّي.',
          detail: '4 لاونجات',
        },
        {
          name: 'البطولات',
          desc: 'بطولات أسبوعية بلوحة متصدرين، وجوايز، وكافيه دي أويا مجاني للبطل.',
          detail: 'كل خميس',
        },
      ],
      ratesLabel: 'أسعار اللعب',
      currency: 'ج.م',
      rates: [
        { label: 'فردي / ساعة', note: 'دراع واحد، لاعب واحد' },
        { label: 'ثنائي / ساعة', note: 'دراعين، نص كنبة' },
        { label: 'شلة / ساعة', note: 'لحد أربع لاعبين، كابينة كاملة' },
      ],
    },
    location: {
      kicker: 'تعرف طريقك',
      title: 'تعالى قول أهلاً',
      addressLabel: 'العنوان',
      address: ['قصر السعداوي، الفرع الجديد', 'بلبيس، الشرقية'],
      hoursLabel: 'مواعيد العمل',
      hours: 'يومياً: 8 صباحاً – 12 منتصف الليل',
      directions: 'احصل على الاتجاهات',
    },
    footer: {
      findLabel: 'لاقينا',
      address: ['قصر السعداوي، الفرع الجديد', 'بلبيس، الشرقية'],
      hoursLabel: 'مواعيد العمل',
      hours: ['يومياً: 8 صباحاً – 12 منتصف الليل'],
      sayLabel: 'قول أهلاً',
      copyright: '© 2026 أميجو كافيه. محمّصة بحب.',
      tagline: 'كل فنجان حكاية.',
    },
    theme: {
      toLight: 'التبديل للوضع الفاتح',
      toDark: 'التبديل للوضع الداكن',
      toggle: 'تبديل سمة الألوان',
    },
  },
} as const

export type Translation = (typeof translations)[Locale]
