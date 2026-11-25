import {
  BlogArticle,
  FaqEntry,
  FloralProduct,
  ProductSizeOption,
  SimulatorAddonOption,
  SimulatorFormatOption,
  SimulatorStemOption,
  SubscriptionPlan,
} from '../types/store';

export const HERO_IMAGE = '/src/assets/images/hero_floral_atelier_1795590877391.jpg';
export const WEDDING_IMAGE = '/src/assets/images/atelier_wedding_styling_1795590880196.jpg';

export const SIZE_OPTIONS: ProductSizeOption[] = [
  {
    id: 'petite',
    labelEn: 'Petite',
    labelId: 'Petite',
    dimensions: '24–28 cm',
    priceMultiplier: 1,
  },
  {
    id: 'classic',
    labelEn: 'Classic',
    labelId: 'Klasik',
    dimensions: '34–38 cm',
    priceMultiplier: 1.35,
  },
  {
    id: 'grand',
    labelEn: 'Grand Atelier',
    labelId: 'Grand Atelier',
    dimensions: '46–52 cm',
    priceMultiplier: 1.8,
  },
];

export const PALETTE_OPTIONS = [
  { id: 'sunset-reverie', labelEn: 'Sunset Reverie', labelId: 'Sunset Reverie' },
  { id: 'signature-ivory', labelEn: 'Ivory & Sage', labelId: 'Gading & Sage' },
  { id: 'blush-garden', labelEn: 'Blush & Peach', labelId: 'Blush & Persik' },
  { id: 'florist-choice', labelEn: "Florist's Seasonal Choice", labelId: 'Pilihan Musiman Studio' },
];

export const FLORAL_CATALOG: FloralProduct[] = [
  {
    id: 'prod-sunset-reverie-box',
    slug: 'sunset-reverie-bloombox',
    category: 'bloomboxes',
    isSunsetReverie: true,
    isBespoke: true,
    categoryLabelEn: 'Sunset Reverie Collection',
    categoryLabelId: 'Koleksi Sunset Reverie',
    freshnessLabelEn: 'New Seasonal Drop',
    freshnessLabelId: 'Koleksi Terbaru',
    nameEn: 'Sunset Reverie Bloombox',
    nameId: 'Bloombox Sunset Reverie',
    basePriceSGD: 128,
    image: '/src/assets/images/product_bloombox_classic_1795590878703.jpg',
    imageAlt: 'Warm peach ranunculus and blush roses arranged in an ivory studio bloom box',
    stemNotesEn: 'Peach ranunculus, terracotta garden roses, cream lisianthus, eucalyptus',
    stemNotesId: 'Ranunculus persik, mawar taman hangat, lisianthus krem, eukaliptus',
    descriptionEn:
      'Inspired by warm dusk light, pairing honeyed peach ranunculus with blush garden roses inside our signature ivory cylinder.',
    descriptionId:
      'Terinspirasi cahaya senja hangat, memadukan ranunculus persik madu dengan mawar taman blush di dalam silinder gading khas studio.',
    careGuideEn:
      'Pour 80 ml of fresh water slowly into the center foam every 48 hours to maintain petal turgor.',
    careGuideId:
      'Tuangkan 80 ml air bersih secara perlahan ke bagian tengah busa setiap 48 jam agar kelopak tetap segar.',
    availabilityTag: 'New',
  },
  {
    id: 'prod-peony-bouquet',
    slug: 'serene-peony-hand-tied',
    category: 'bouquets',
    isBespoke: true,
    categoryLabelEn: 'Hand-Tied Bouquet',
    categoryLabelId: 'Buket Tangan',
    freshnessLabelEn: 'Fresh Daily Market',
    freshnessLabelId: 'Segar Harian',
    nameEn: 'Serene Garden Peony Bouquet',
    nameId: 'Buket Peony Taman Serene',
    basePriceSGD: 85,
    image: '/src/assets/images/product_signature_bouquet_1795590878025.jpg',
    imageAlt: 'Hand-tied blush garden rose and cream peony bouquet wrapped in linen cotton paper',
    stemNotesEn: 'Blush garden roses, cream peonies, wild chamomile, olive foliage',
    stemNotesId: 'Mawar taman blush, peony krem, kamomil liar, daun zaitun',
    descriptionEn:
      'Composed in loose meadow proportions and wrapped in breathable cotton linen paper with frayed silk ribbon. Designed to unfold softly over five to seven days.',
    descriptionId:
      'Dirangkai dalam proporsi alami dan dibalut kertas linen katun bernapas dengan pita sutra. Dirancang untuk mekar perlahan selama lima hingga tujuh hari.',
    careGuideEn:
      'Trim stems diagonally by 1.5 cm upon arrival. Refresh cool water every two days and keep away from direct afternoon heat.',
    careGuideId:
      'Potong miring ujung batang 1,5 cm saat tiba. Ganti air dingin setiap dua hari dan jauhkan dari sinar matahari langsung.',
    availabilityTag: 'Bestseller',
  },
  {
    id: 'prod-stoneware-vase',
    slug: 'atelier-stoneware-vessel',
    category: 'table-vase',
    isVase: true,
    categoryLabelEn: 'Table & Vase',
    categoryLabelId: 'Rangkaian Vas',
    freshnessLabelEn: 'Vessel Included',
    freshnessLabelId: 'Termasuk Vas Keramik',
    nameEn: 'Atelier Stoneware Arrangement',
    nameId: 'Rangkaian Vas Keramik Atelier',
    basePriceSGD: 148,
    image: '/src/assets/images/product_vase_arrangement_1795590879038.jpg',
    imageAlt: 'Asymmetric floral arrangement of white delphinium and cosmos in a matte ceramic vase',
    stemNotesEn: 'White delphinium, hellebores, garden cosmos, Queen Anne lace, sculptural branches',
    stemNotesId: 'Delphinium putih, hellebore, kosmos taman, dahan skulptural',
    descriptionEn:
      'Architectural silhouettes inspired by quiet botanical stillness, styled in a reusable hand-thrown speckled stoneware vessel without floral foam.',
    descriptionId:
      'Siluet arsitektural yang terinspirasi ketenangan botani, ditata dalam vas keramik stoneware buatan tangan tanpa busa sintetis.',
    careGuideEn:
      'Top up vessel water daily as tall stems hydrate rapidly. Remove spent blooms to extend branching life.',
    careGuideId:
      'Tambahkan air ke dalam vas setiap hari dan singkirkan kelopak yang layu agar bunga lain bertahan lebih lama.',
  },
  {
    id: 'prod-preserved-compote',
    slug: 'champagne-everlasting-compote',
    category: 'preserved',
    isVase: true,
    categoryLabelEn: 'Preserved Flora',
    categoryLabelId: 'Bunga Awet',
    freshnessLabelEn: 'Lasts 12+ Months',
    freshnessLabelId: 'Tahan 12+ Bulan',
    nameEn: 'Champagne Everlasting Compote',
    nameId: 'Rangkaian Awet Champagne',
    basePriceSGD: 132,
    image: '/src/assets/images/product_preserved_dome_1795590879225.jpg',
    imageAlt: 'Champagne preserved roses and dried hydrangea styled in a speckled ceramic bowl',
    stemNotesEn: 'Preserved champagne roses, dried hydrangea, bunny tails, bleached ruscus',
    stemNotesId: 'Mawar awet champagne, hydrangea kering, lagurus, daun ruscus',
    descriptionEn:
      'Real blooms preserved at peak openness for lasting interior warmth. Styled inside a low speckled ceramic bowl suited for shelves, consoles, and sunlit studios.',
    descriptionId:
      'Bunga asli yang diawetkan pada puncak mekarnya dalam mangkuk keramik rendah, menghadirkan kehangatan jangka panjang untuk rak atau konsol.',
    careGuideEn:
      'Do not water. Keep indoors away from high humidity and strong direct sunlight to preserve tone.',
    careGuideId:
      'Jangan disiram. Letakkan di dalam ruangan yang kering dan hindari paparan matahari langsung.',
  },
  {
    id: 'prod-meadow-centrepiece',
    slug: 'conservatory-meadow-centrepiece',
    category: 'table-vase',
    isSunsetReverie: true,
    isBespoke: true,
    isVase: true,
    categoryLabelEn: 'Table Arrangements',
    categoryLabelId: 'Rangkaian Meja',
    freshnessLabelEn: 'Made to Order',
    freshnessLabelId: 'Dibuat Sesuai Pesanan',
    nameEn: 'Conservatory Table Compote',
    nameId: 'Rangkaian Meja Konservatori',
    basePriceSGD: 165,
    image: '/src/assets/images/hero_floral_atelier_1795590877391.jpg',
    imageAlt: 'Ivory garden roses, butterfly ranunculus, and trailing sweet peas in a stoneware vase',
    stemNotesEn: 'Ivory O’Hara roses, butterfly ranunculus, sweet peas, jasmine vine, silver eucalyptus',
    stemNotesId: 'Mawar gading O’Hara, butterfly ranunculus, sweet pea, melati rambat',
    descriptionEn:
      'Designed specifically for intimate dining tables and celebratory brunches, featuring fragrant garden blooms held low for effortless conversation across the table.',
    descriptionId:
      'Dirancang khusus untuk meja makan intim dan jamuan spesial dengan komposisi rendah agar percakapan tetap nyaman.',
    careGuideEn:
      'Mist delicate sweet peas lightly in air-conditioned rooms and replenish clean water every second morning.',
    careGuideId:
      'Semprot halus bagian sweet pea di ruangan ber-AC dan ganti air bersih setiap dua pagi sekali.',
    availabilityTag: 'Limited Seasonal',
  },
  {
    id: 'prod-petite-atelier-box',
    slug: 'morning-bloombox-petite',
    category: 'bloomboxes',
    categoryLabelEn: 'Bloom Boxes',
    categoryLabelId: 'Bloombox',
    freshnessLabelEn: 'Same-Day Eligible',
    freshnessLabelId: 'Kirim Hari Ini',
    nameEn: 'Morning Garden Bloombox',
    nameId: 'Bloombox Taman Pagi',
    basePriceSGD: 92,
    image: '/src/assets/images/product_bloombox_classic_1795590878703.jpg',
    imageAlt: 'Pastel seasonal floral arrangement inside an ivory studio bloom box',
    stemNotesEn: 'Spray garden roses, seasonal ranunculus, waxflower, soft fern fronds',
    stemNotesId: 'Mawar spray taman, ranunculus musiman, waxflower, pakis lembut',
    descriptionEn:
      'A lighter everyday edition of our signature bloombox, thoughtfully proportioned for welcoming gestures, thank-you notes, and thoughtful desk surprises.',
    descriptionId:
      'Edisi harian yang lebih ringkas dari bloombox signature kami, proporsional untuk ucapan terima kasih maupun kejutan meja kerja.',
    careGuideEn:
      'Keep in a cool interior spot and add a splash of water directly to the base every two days.',
    careGuideId:
      'Simpan di ruangan sejuk dan tambahkan sedikit air ke dasar rangkaian setiap dua hari.',
  },
];

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'weekly',
    cadenceLabelEn: 'Weekly Refresh',
    cadenceLabelId: 'Setiap Minggu',
    deliveriesPerMonth: 4,
    homePriceSGD: 260,
    corporatePriceSGD: 420,
    summaryEn: '4 fresh seasonal deliveries per month with complimentary vessel rotation.',
    summaryId: '4 pengiriman bunga segar per bulan termasuk rotasi vas keramik gratis.',
  },
  {
    id: 'biweekly',
    cadenceLabelEn: 'Bi-Weekly Edit',
    cadenceLabelId: 'Dua Minggu Sekali',
    deliveriesPerMonth: 2,
    homePriceSGD: 145,
    corporatePriceSGD: 240,
    summaryEn: '2 curated market edits per month tailored to your interior palette.',
    summaryId: '2 rangkaian kurasi pasar per bulan yang disesuaikan dengan palet interior Anda.',
  },
  {
    id: 'monthly',
    cadenceLabelEn: 'Monthly Ritual',
    cadenceLabelId: 'Bulanan',
    deliveriesPerMonth: 1,
    homePriceSGD: 82,
    corporatePriceSGD: 135,
    summaryEn: '1 statement botanical arrival each month on your preferred morning.',
    summaryId: '1 rangkaian botani spesial setiap bulan pada pagi hari pilihan Anda.',
  },
];

export const SIMULATOR_FORMATS: SimulatorFormatOption[] = [
  {
    id: 'hand-tied',
    nameEn: 'Hand-Tied Bouquet',
    nameId: 'Buket Tangan (Wrapping Linen)',
    descEn: 'Artisanal cotton wrap & silk ribbon',
    descId: 'Balutan kertas katun linen & pita sutra',
    baseFeeSGD: 18,
    image: '/src/assets/images/product_signature_bouquet_1795590878025.jpg',
  },
  {
    id: 'bloom-box',
    nameEn: 'Signature Bloom Box',
    nameId: 'Bloom Box Silinder',
    descEn: 'Matte ivory box with hydration foam',
    descId: 'Kotak silinder gading dengan busa hidrasi',
    baseFeeSGD: 28,
    image: '/src/assets/images/product_bloombox_classic_1795590878703.jpg',
  },
  {
    id: 'ceramic-vase',
    nameEn: 'Stoneware Vase Arrangement',
    nameId: 'Rangkaian Vas Keramik',
    descEn: 'Includes reusable speckled ceramic vessel',
    descId: 'Termasuk vas keramik stoneware',
    baseFeeSGD: 38,
    image: '/src/assets/images/product_vase_arrangement_1795590879038.jpg',
  },
  {
    id: 'preserved-bowl',
    nameEn: 'Preserved Compote Bowl',
    nameId: 'Mangkuk Bunga Awet',
    descEn: 'Dry-styled everlasting ceramic compote',
    descId: 'Tata kering jangka panjang dalam mangkuk keramik',
    baseFeeSGD: 34,
    image: '/src/assets/images/product_preserved_dome_1795590879225.jpg',
  },
  {
    id: 'flower-stand',
    nameEn: 'Opening Flower Stand',
    nameId: 'Standing Flower / Congratulatory Stand',
    descEn: 'Wooden studio easel with cascading florals',
    descId: 'Penyangga kayu studio dengan rangkaian berdiri',
    baseFeeSGD: 75,
    image: '/src/assets/images/hero_floral_atelier_1795590877391.jpg',
  },
];

export const SIMULATOR_STEMS: SimulatorStemOption[] = [
  {
    id: 'garden-rose',
    group: 'focal',
    nameEn: "Garden Rose (O'Hara)",
    nameId: "Mawar Taman (O'Hara)",
    originNote: 'Ecuador / Kenya',
    pricePerStemSGD: 11,
  },
  {
    id: 'dutch-peony',
    group: 'focal',
    nameEn: 'Dutch Peony',
    nameId: 'Peony Belanda',
    originNote: 'Holland',
    pricePerStemSGD: 16,
  },
  {
    id: 'ranunculus',
    group: 'focal',
    nameEn: 'Butterfly Ranunculus',
    nameId: 'Butterfly Ranunculus',
    originNote: 'Italy / Japan',
    pricePerStemSGD: 12,
  },
  {
    id: 'hydrangea',
    group: 'focal',
    nameEn: 'Antique Hydrangea',
    nameId: 'Hydrangea Impor',
    originNote: 'Holland',
    pricePerStemSGD: 15,
  },
  {
    id: 'orchid',
    group: 'focal',
    nameEn: 'Phalaenopsis Orchid',
    nameId: 'Anggrek Phalaenopsis',
    originNote: 'Taiwan / Local',
    pricePerStemSGD: 18,
  },
  {
    id: 'delphinium',
    group: 'secondary',
    nameEn: 'Tall Delphinium',
    nameId: 'Delphinium Tinggi',
    originNote: 'Holland',
    pricePerStemSGD: 9,
  },
  {
    id: 'lisianthus',
    group: 'secondary',
    nameEn: 'Ruffled Lisianthus',
    nameId: 'Lisianthus Berkelopak',
    originNote: 'Cameron / Japan',
    pricePerStemSGD: 7,
  },
  {
    id: 'chamomile',
    group: 'secondary',
    nameEn: 'Wild Chamomile / Waxflower',
    nameId: 'Kamomil / Waxflower',
    originNote: 'Seasonal Filler',
    pricePerStemSGD: 5,
  },
  {
    id: 'eucalyptus',
    group: 'foliage',
    nameEn: 'Silver Eucalyptus & Olive',
    nameId: 'Daun Eukaliptus & Zaitun',
    originNote: 'Foliage Base',
    pricePerStemSGD: 4,
  },
  {
    id: 'preserved-rose',
    group: 'preserved',
    nameEn: 'Preserved Champagne Rose',
    nameId: 'Mawar Awet Champagne',
    originNote: 'Japan Preserved',
    pricePerStemSGD: 15,
  },
];

export const SIMULATOR_ADDONS: SimulatorAddonOption[] = [
  {
    id: 'silk-ribbon',
    nameEn: 'Frayed French Silk Ribbon',
    nameId: 'Pita Sutra Prancis',
    priceSGD: 10,
  },
  {
    id: 'wax-seal-card',
    nameEn: 'Cotton Card with Wax Seal',
    nameId: 'Kartu Katun & Segel Lilin',
    priceSGD: 6,
  },
  {
    id: 'botanical-candle',
    nameEn: 'Soy Botanical Studio Candle',
    nameId: 'Lilin Aromaterapi Botani',
    priceSGD: 28,
  },
  {
    id: 'express-courier',
    nameEn: 'Priority 3-Hour Dispatch',
    nameId: 'Pengiriman Ekspres 3 Jam',
    priceSGD: 15,
  },
];

export const STUDIO_BLOGS: BlogArticle[] = [
  {
    id: 'blog-sunset-reverie',
    date: 'November 2026',
    readTime: '3 min read',
    titleEn: 'Inside the Sunset Reverie Palette',
    titleId: 'Di Balik Palet Sunset Reverie',
    excerptEn:
      'How warm apricot ranunculus, terracotta garden roses, and airy chamomile create gentle dusk tones indoors.',
    excerptId:
      'Memadukan ranunculus aprikot, mawar taman terakota, dan kamomil untuk menghadirkan nuansa senja yang tenang.',
    bodyEn:
      'Our Sunset Reverie edit pairs honeyed peach ranunculus with softened rose petals and silvery eucalyptus. Rather than saturated brights, we layer muted earth tones so the arrangement settles naturally against limestone, timber, and linen interiors.',
    bodyId:
      'Koleksi Sunset Reverie memadukan ranunculus persik lembut dengan mawar bernuansa hangat serta daun eukaliptus keperakan agar serasi dengan interior kayu, batu alam, maupun linen.',
  },
  {
    id: 'blog-stem-longevity',
    date: 'October 2026',
    readTime: '4 min read',
    titleEn: 'Conditioning Fresh Stems for Tropical Climates',
    titleId: 'Merawat Bunga Segar di Iklim Tropis',
    excerptEn:
      'Simple morning habits—diagonal cuts, cool water swaps, and foliage clearing—that add days to vase life.',
    excerptId:
      'Kebiasaan sederhana di pagi hari seperti potong miring batang dan ganti air dingin untuk memperpanjang kesegaran.',
    bodyEn:
      'Bacteria in standing water is the main reason blooms droop early. Strip any leaves below the waterline, recut stems at a crisp 45-degree angle every two days, and position vessels away from direct afternoon sun or air-conditioner drafts.',
    bodyId:
      'Bakteri di air adalah penyebab utama bunga cepat layu. Bersihkan daun yang terendam air, potong miring 45 derajat setiap dua hari, dan jauhkan vas dari hembusan AC langsung.',
  },
];

export const STUDIO_FAQS: FaqEntry[] = [
  {
    qEn: 'How far in advance should I place a bespoke or simulated order?',
    qId: 'Berapa lama sebelumnya saya harus memesan rangkaian custom/simulasi?',
    aEn: 'Standard bouquets and bloomboxes are available for next-day or same-day dispatch before 13:00. Custom stem selections with rare imported blooms are best booked 48 hours ahead.',
    aId: 'Buket standar dan bloombox tersedia untuk pengiriman hari yang sama sebelum pukul 13.00. Pesanan simulasi khusus dengan bunga impor disarankan dipesan minimal 48 jam sebelumnya.',
  },
  {
    qEn: 'Are the exact flowers in the Price Simulator guaranteed?',
    qId: 'Apakah bunga yang dipilih di Simulasi Harga pasti tersedia persis?',
    aEn: 'We source fresh daily at dawn. If a specific seasonal stem falls short of studio grade on the morning of dispatch, we substitute with an equal or higher-grade bloom in your chosen palette.',
    aId: 'Kami memilih bunga segar setiap fajar. Jika ada satu jenis bunga musiman yang kurang prima, kami menggantinya dengan bunga bernilai setara atau lebih tinggi dalam palet warna yang sama.',
  },
  {
    qEn: 'Do corporate subscriptions include vase swaps?',
    qId: 'Apakah paket langganan kantor sudah termasuk pergantian vas?',
    aEn: 'Yes. Every weekly or bi-weekly subscription includes clean ceramic vessel rotation on each delivery morning.',
    aId: 'Ya. Setiap pengiriman langganan mingguan maupun dua mingguan sudah termasuk rotasi vas keramik bersih secara gratis.',
  },
];
