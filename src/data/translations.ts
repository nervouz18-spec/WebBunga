import { Language } from '../types/store';

export const copy: Record<
  Language,
  {
    nav: {
      home: string;
      shop: string;
      subscriptions: string;
      simulator: string;
      services: string;
      about: string;
      contact: string;
      crm: string;
      bag: string;
      shopMenu: {
        sunsetReverie: string;
        allProducts: string;
        bespoke: string;
        bloomBoxes: string;
        bouquet: string;
        preserved: string;
        tableArrangements: string;
        vase: string;
      };
      servicesMenu: {
        corporate: string;
        events: string;
        weddings: string;
        workshops: string;
        flowerStand: string;
      };
      aboutMenu: {
        ourStory: string;
        blogs: string;
      };
      contactMenu: {
        enquiries: string;
        faq: string;
        returns: string;
      };
    };
    hero: {
      kicker: string;
      headline: string;
      subcopy: string;
      primaryCta: string;
      secondaryCta: string;
      crmCta: string;
      promises: { index: string; title: string; detail: string }[];
    };
    catalog: {
      heading: string;
      subheading: string;
      searchPlaceholder: string;
      allTab: string;
      sunsetTab: string;
      bouquetsTab: string;
      bloomboxesTab: string;
      vaseTab: string;
      preservedTab: string;
      selectAction: string;
      emptyState: string;
      resetFilters: string;
    };
    simulator: {
      kicker: string;
      heading: string;
      subheading: string;
      step1Title: string;
      step2Title: string;
      step3Title: string;
      presetsLabel: string;
      resetStems: string;
      summaryTitle: string;
      tierLabel: string;
      formatLine: string;
      stemsLine: string;
      addonsLine: string;
      totalLabel: string;
      paletteLabel: string;
      deliveryDateLabel: string;
      cardNoteLabel: string;
      cardNotePlaceholder: string;
      addToBagBtn: string;
      requestProposalBtn: string;
      whatsappBtn: string;
      noStemsHint: string;
      addedToast: string;
      proposalFormTitle: string;
      clientNameLabel: string;
      clientContactLabel: string;
      eventTitleLabel: string;
      venueLabel: string;
      sendToCrmBtn: string;
      cancelBtn: string;
      crmSentTitle: string;
      crmSentDesc: string;
      openInCrmBtn: string;
    };
    modal: {
      stemNotes: string;
      careGuide: string;
      selectSize: string;
      selectPalette: string;
      deliveryDate: string;
      cardMessage: string;
      cardPlaceholder: string;
      addToBag: string;
      close: string;
    };
    subscriptions: {
      kicker: string;
      heading: string;
      description: string;
      homeSpace: string;
      corporateSpace: string;
      deliveriesLabel: string;
      perMonth: string;
      addPlan: string;
      addedFeedback: string;
    };
    services: {
      kicker: string;
      heading: string;
      description: string;
      tabs: {
        id: 'corporate' | 'events' | 'weddings' | 'workshops' | 'flower-stand';
        label: string;
        detail: string;
      }[];
      formTitle: string;
      nameLabel: string;
      emailLabel: string;
      phoneLabel: string;
      dateLabel: string;
      venueLabel: string;
      scopeLabel: string;
      budgetLabel: string;
      notesLabel: string;
      submitBtn: string;
      confirmedTitle: string;
      confirmedDesc: string;
      newInquiryBtn: string;
    };
    atelier: {
      kicker: string;
      heading: string;
      story: string;
      quote: string;
      quoteAuthor: string;
      quoteRole: string;
      readJournalBtn: string;
    };
    cart: {
      title: string;
      emptyTitle: string;
      emptyDesc: string;
      browseBtn: string;
      subtotal: string;
      deliveryFee: string;
      freeLabel: string;
      freeHint: string;
      total: string;
      proceedCheckout: string;
      backToBag: string;
      checkoutTitle: string;
      customerName: string;
      customerPhone: string;
      customerEmail: string;
      recipientName: string;
      deliveryAddress: string;
      postalCode: string;
      deliverySlot: string;
      paymentMethod: string;
      placeOrder: string;
      whatsappOrder: string;
      confirmedTitle: string;
      confirmedSubtitle: string;
      doneBtn: string;
    };
    crm: {
      brandSub: string;
      backToStore: string;
      newLeadBtn: string;
      sections: {
        pipeline: string;
        proposals: string;
        stems: string;
        orders: string;
        clients: string;
      };
      kpis: {
        pipelineValue: string;
        activeProposals: string;
        bookedRevenue: string;
        stemsNeeded: string;
      };
      stages: {
        estimate: string;
        lead: string;
        'proposal-sent': string;
        'contract-signed': string;
        booked: string;
      };
      searchPlaceholder: string;
      boardView: string;
      tableView: string;
      exportCsv: string;
      emptyTitle: string;
      emptyDesc: string;
    };
    footer: {
      studioHoursLabel: string;
      contactLabel: string;
      integrationBtn: string;
      languageLabel: string;
      currencyLabel: string;
      copyright: string;
    };
  }
> = {
  en: {
    nav: {
      home: 'Home',
      shop: 'Shop',
      subscriptions: 'Subscriptions',
      simulator: 'Price Simulator',
      services: 'Services',
      about: 'About Us',
      contact: 'Contact',
      crm: 'Studio CRM',
      bag: 'Bag',
      shopMenu: {
        sunsetReverie: '[NEW] Sunset Reverie Collection',
        allProducts: 'All Products',
        bespoke: 'Bespoke',
        bloomBoxes: 'Bloom Boxes',
        bouquet: 'Bouquet',
        preserved: 'Preserved Flowers',
        tableArrangements: 'Table Arrangements',
        vase: 'Vase',
      },
      servicesMenu: {
        corporate: 'Corporate',
        events: 'Events',
        weddings: 'Weddings',
        workshops: 'Workshops',
        flowerStand: 'Flower Stand',
      },
      aboutMenu: {
        ourStory: 'Our Story',
        blogs: 'Blogs',
      },
      contactMenu: {
        enquiries: 'Enquiries',
        faq: 'FAQ',
        returns: 'Returns and Refunds',
      },
    },
    hero: {
      kicker: 'Floral Storefront & Studio CRM Platform',
      headline: 'From instant client estimates to signed floral proposals—in one calm studio.',
      subcopy:
        'Clients browse seasonal collections or build their own stem estimate using our live simulator. Every estimate and enquiry flows straight into your Florist CRM pipeline.',
      primaryCta: 'Shop Collections',
      secondaryCta: 'Price Simulator',
      crmCta: 'Open Studio CRM',
      promises: [
        {
          index: '01.',
          title: 'Daily Market Stems',
          detail: 'Hand-selected seasonal blooms sourced fresh every morning.',
        },
        {
          index: '02.',
          title: 'Live Stem Estimator',
          detail: 'Clients pick containers, stems, and view real-time pricing.',
        },
        {
          index: '03.',
          title: 'Estimate-to-Booked CRM',
          detail: 'Every website quote turns into a proposal, contract & payment.',
        },
        {
          index: '04.',
          title: 'Automated Stem Counter',
          detail: 'Aggregate market stem counts across all confirmed events.',
        },
      ],
    },
    catalog: {
      heading: 'Shop Collections',
      subheading:
        'Select an arrangement to customize stem size, colour palette, preferred delivery date, and personal gift message.',
      searchPlaceholder: 'Search blooms or vessels...',
      allTab: 'All Products',
      sunsetTab: 'Sunset Reverie',
      bouquetsTab: 'Bouquet',
      bloomboxesTab: 'Bloom Boxes',
      vaseTab: 'Table & Vase',
      preservedTab: 'Preserved Flowers',
      selectAction: 'Customize & Order',
      emptyState: 'No floral arrangements match your current filter.',
      resetFilters: 'Show All Arrangements',
    },
    simulator: {
      kicker: 'Pre-Inquiry Floral Estimator',
      heading: 'Custom Arrangement & Price Simulator',
      subheading:
        'Build a floral arrangement from scratch. Select your vessel, pick stems, and either add directly to bag or send your estimate into our Studio CRM for a formal visual proposal.',
      step1Title: '01. Select Vessel & Format',
      step2Title: '02. Choose Your Blooms & Stems',
      step3Title: '03. Palette, Wrapping & Add-Ons',
      presetsLabel: 'Quick Presets:',
      resetStems: 'Clear Stems',
      summaryTitle: 'Simulated Estimate',
      tierLabel: 'Composition Scale',
      formatLine: 'Format & Vessel',
      stemsLine: 'Selected Blooms',
      addonsLine: 'Styling & Add-Ons',
      totalLabel: 'Estimated Total',
      paletteLabel: 'Colour Direction',
      deliveryDateLabel: 'Delivery / Event Date',
      cardNoteLabel: 'Personal Card Note (Optional)',
      cardNotePlaceholder: 'Write a short message for the recipient...',
      addToBagBtn: 'Add Custom Arrangement to Bag',
      requestProposalBtn: 'Request Formal Proposal (Save to CRM)',
      whatsappBtn: 'Send Quote via WhatsApp',
      noStemsHint: 'Add at least 3 stems to compose your custom arrangement.',
      addedToast: 'Custom arrangement added to your bag',
      proposalFormTitle: 'Convert Estimate into Studio Proposal',
      clientNameLabel: 'Your Name *',
      clientContactLabel: 'Email or WhatsApp *',
      eventTitleLabel: 'Occasion / Event Title',
      venueLabel: 'Venue / City',
      sendToCrmBtn: 'Send Estimate to Studio CRM',
      cancelBtn: 'Cancel',
      crmSentTitle: 'Estimate Saved to Studio CRM',
      crmSentDesc:
        'Your stem selection has been logged in the CRM pipeline as a new lead ready for proposal review.',
      openInCrmBtn: 'View in Studio CRM',
    },
    modal: {
      stemNotes: 'Seasonal Stem Notes',
      careGuide: 'Atelier Care Guide',
      selectSize: 'Select Proportion',
      selectPalette: 'Colour Direction',
      deliveryDate: 'Preferred Delivery Date',
      cardMessage: 'Gift Card Message (Optional)',
      cardPlaceholder: 'Write a personal note for the recipient...',
      addToBag: 'Add to Bag',
      close: 'Close',
    },
    subscriptions: {
      kicker: 'Recurring Botanical Service',
      heading: 'Floral Subscriptions for Homes & Studios',
      description:
        'Keep your dining console, reception desk, or living space alive with seasonal market harvests delivered on your schedule—complete with clean ceramic vessel swaps.',
      homeSpace: 'Home Sanctuary',
      corporateSpace: 'Studio & Corporate',
      deliveriesLabel: 'deliveries / month',
      perMonth: 'per month',
      addPlan: 'Add Subscription to Bag',
      addedFeedback: 'Added to your bag',
    },
    services: {
      kicker: 'Bespoke Services & CRM Lead Intake',
      heading: 'Corporate, Events, Weddings, Workshops & Flower Stands.',
      description:
        'Every enquiry submitted here enters the Studio CRM pipeline automatically so your team can turn leads into visual proposals and signed contracts.',
      tabs: [
        {
          id: 'corporate',
          label: 'Corporate',
          detail: 'Weekly lobby installations, client gifting campaigns, and VIP desk florals.',
        },
        {
          id: 'events',
          label: 'Events',
          detail: 'Brand launches, editorial dinner tablescapes, and gallery floral styling.',
        },
        {
          id: 'weddings',
          label: 'Weddings',
          detail: 'Bridal bouquets, ceremony arches, meadow runners, and personal corsages.',
        },
        {
          id: 'workshops',
          label: 'Workshops',
          detail: 'Guided hand-tied bouquet and ikebana sessions for private groups or teams.',
        },
        {
          id: 'flower-stand',
          label: 'Flower Stand',
          detail: 'Architectural wooden easel stands for store openings, exhibitions, and milestones.',
        },
      ],
      formTitle: 'Enquire for This Service',
      nameLabel: 'Your Name',
      emailLabel: 'Email Address',
      phoneLabel: 'WhatsApp / Phone',
      dateLabel: 'Event / Delivery Date',
      venueLabel: 'Venue / Location',
      scopeLabel: 'Service Category',
      budgetLabel: 'Estimated Budget',
      notesLabel: 'Palette & Aesthetic Notes',
      submitBtn: 'Submit Enquiry to CRM',
      confirmedTitle: 'Service Enquiry Logged in CRM',
      confirmedDesc:
        'We have recorded your brief inside the Studio CRM pipeline. Our lead florist will prepare a visual proposal within 24 hours.',
      newInquiryBtn: 'Submit Another Enquiry',
    },
    atelier: {
      kicker: 'About Us · Our Story',
      heading: 'Designed with restraint, rooted in hospitality and craft.',
      story:
        'Founded by designers trained across floral artistry, hospitality, and spatial curation, our studio treats every stem as architecture—balancing airy negative space with fragrant seasonal texture.',
      quote:
        '“They translated a single linen fabric swatch into forty tables of garden roses and sweet peas. Guests asked about the florals all evening.”',
      quoteAuthor: 'Clarissa Tan',
      quoteRole: 'Hospitality Director, The Conservatory House',
      readJournalBtn: 'Read Studio Journal & Blogs',
    },
    cart: {
      title: 'Your Floral Bag',
      emptyTitle: 'Your bag is currently empty',
      emptyDesc: 'Explore our seasonal collections or build a custom arrangement in the simulator.',
      browseBtn: 'Browse Collections',
      subtotal: 'Subtotal',
      deliveryFee: 'Courier Delivery',
      freeLabel: 'Complimentary',
      freeHint: 'Free courier delivery unlocked on orders over',
      total: 'Total',
      proceedCheckout: 'Proceed to Delivery Details',
      backToBag: 'Back to Bag',
      checkoutTitle: 'Delivery & Confirmation',
      customerName: 'Sender Full Name',
      customerPhone: 'Phone / WhatsApp',
      customerEmail: 'Email Address',
      recipientName: 'Recipient Name',
      deliveryAddress: 'Delivery Street Address',
      postalCode: 'Postal Code',
      deliverySlot: 'Delivery Time Window',
      paymentMethod: 'Payment & Integration Method',
      placeOrder: 'Confirm Order',
      whatsappOrder: 'Send Order via WhatsApp',
      confirmedTitle: 'Order Confirmed',
      confirmedSubtitle: 'Preparing your seasonal stems at the atelier',
      doneBtn: 'Continue Browsing',
    },
    crm: {
      brandSub: 'Studio CRM',
      backToStore: 'View Storefront',
      newLeadBtn: '+ New Lead',
      sections: {
        pipeline: 'Pipeline',
        proposals: 'Proposals & Contracts',
        stems: 'Stem Counter',
        orders: 'Storefront Orders',
        clients: 'Client Directory',
      },
      kpis: {
        pipelineValue: 'Active Pipeline Value',
        activeProposals: 'Open Estimates & Proposals',
        bookedRevenue: 'Confirmed Booked Value',
        stemsNeeded: 'Stems Required (Active)',
      },
      stages: {
        estimate: 'Estimate',
        lead: 'Lead',
        'proposal-sent': 'Proposal Sent',
        'contract-signed': 'Contract Signed',
        booked: 'Booked & Paid',
      },
      searchPlaceholder: 'Search clients, events, or references...',
      boardView: 'Board',
      tableView: 'Table',
      exportCsv: 'Export CSV',
      emptyTitle: 'No matching leads found',
      emptyDesc: 'Adjust your search filter or create a new floral lead.',
    },
    footer: {
      studioHoursLabel: 'Atelier Hours',
      contactLabel: 'Direct Concierge',
      integrationBtn: 'View Integration & Webhook Schema',
      languageLabel: 'Language',
      currencyLabel: 'Currency',
      copyright: 'All rights reserved. Independent Floral Storefront & CRM.',
    },
  },
  id: {
    nav: {
      home: 'Beranda',
      shop: 'Belanja',
      subscriptions: 'Langganan',
      simulator: 'Simulasi Harga',
      services: 'Layanan',
      about: 'Tentang Kami',
      contact: 'Kontak',
      crm: 'Studio CRM',
      bag: 'Tas',
      shopMenu: {
        sunsetReverie: '[BARU] Koleksi Sunset Reverie',
        allProducts: 'Semua Produk',
        bespoke: 'Bespoke / Custom',
        bloomBoxes: 'Bloom Boxes',
        bouquet: 'Buket Bunga',
        preserved: 'Bunga Awet',
        tableArrangements: 'Rangkaian Meja',
        vase: 'Vas Keramik',
      },
      servicesMenu: {
        corporate: 'Korporat',
        events: 'Acara & Event',
        weddings: 'Pernikahan',
        workshops: 'Workshop',
        flowerStand: 'Flower Stand',
      },
      aboutMenu: {
        ourStory: 'Cerita Studio',
        blogs: 'Artikel & Blog',
      },
      contactMenu: {
        enquiries: 'Pertanyaan & Penawaran',
        faq: 'FAQ',
        returns: 'Kebijakan Pengembalian',
      },
    },
    hero: {
      kicker: 'Storefront Bunga & Studio CRM Terpadu',
      headline: 'Dari estimasi harga instan hingga kontrak proposal—dalam satu studio.',
      subcopy:
        'Pelanggan dapat memilih koleksi siap kirim atau menyusun estimasi tangkai bunga sendiri di Simulasi Harga. Setiap estimasi dan permintaan acara otomatis masuk ke pipeline Studio CRM Anda.',
      primaryCta: 'Lihat Koleksi',
      secondaryCta: 'Simulasi Harga',
      crmCta: 'Buka Studio CRM',
      promises: [
        {
          index: '01.',
          title: 'Bunga Segar Harian',
          detail: 'Bunga musiman pilihan yang dikurasi langsung setiap pagi.',
        },
        {
          index: '02.',
          title: 'Simulasi Harga Langsung',
          detail: 'Klien memilih wadah, tangkai bunga, dan melihat estimasi harga instan.',
        },
        {
          index: '03.',
          title: 'Pipeline CRM Otomatis',
          detail: 'Setiap simulasi berubah menjadi Proposal, Kontrak Digital, & Pembayaran.',
        },
        {
          index: '04.',
          title: 'Rekap Kebutuhan Tangkai',
          detail: 'Hitung otomatis total tangkai belanja pasar dari seluruh acara terjadwal.',
        },
      ],
    },
    catalog: {
      heading: 'Koleksi Belanja',
      subheading:
        'Pilih rangkaian untuk menyesuaikan ukuran, palet warna, tanggal pengiriman, serta pesan pribadi Anda.',
      searchPlaceholder: 'Cari jenis bunga atau vas...',
      allTab: 'Semua Produk',
      sunsetTab: 'Sunset Reverie',
      bouquetsTab: 'Buket',
      bloomboxesTab: 'Bloom Box',
      vaseTab: 'Meja & Vas',
      preservedTab: 'Bunga Awet',
      selectAction: 'Pilih & Pesan',
      emptyState: 'Tidak ada rangkaian yang sesuai dengan filter Anda.',
      resetFilters: 'Tampilkan Semua',
    },
    simulator: {
      kicker: 'Kalkulator Estimasi Pra-Order',
      heading: 'Simulasi Harga & Rangkai Bunga Sendiri',
      subheading:
        'Rancang komposisi bunga sesuai selera Anda. Pilih bentuk wadah, tentukan jumlah tiap tangkai bunga, lalu masukkan ke tas atau kirim langsung ke Studio CRM sebagai permintaan proposal resmi.',
      step1Title: '01. Pilih Wadah & Bentuk Rangkaian',
      step2Title: '02. Pilih Bunga & Jumlah Tangkai',
      step3Title: '03. Palet Warna, Pita & Tambahan',
      presetsLabel: 'Preset Cepat:',
      resetStems: 'Reset Tangkai',
      summaryTitle: 'Rincian Simulasi Harga',
      tierLabel: 'Skala Rangkaian',
      formatLine: 'Bentuk & Wadah',
      stemsLine: 'Bunga Pilihan',
      addonsLine: 'Tambahan & Pita',
      totalLabel: 'Estimasi Total',
      paletteLabel: 'Arah Warna',
      deliveryDateLabel: 'Tanggal Kirim / Acara',
      cardNoteLabel: 'Catatan Kartu Ucapan (Opsional)',
      cardNotePlaceholder: 'Tuliskan pesan singkat untuk penerima...',
      addToBagBtn: 'Masukkan Rangkaian ke Tas',
      requestProposalBtn: 'Ajukan Proposal Resmi (Kirim ke CRM)',
      whatsappBtn: 'Kirim Estimasi via WhatsApp',
      noStemsHint: 'Pilih minimal 3 tangkai bunga untuk membuat rangkaian custom.',
      addedToast: 'Rangkaian custom berhasil ditambahkan ke tas',
      proposalFormTitle: 'Kirim Estimasi ke Pipeline CRM Studio',
      clientNameLabel: 'Nama Lengkap *',
      clientContactLabel: 'Email atau WhatsApp *',
      eventTitleLabel: 'Nama Acara / Kebutuhan',
      venueLabel: 'Lokasi / Kota',
      sendToCrmBtn: 'Simpan Estimasi ke CRM',
      cancelBtn: 'Batal',
      crmSentTitle: 'Estimasi Tersimpan di Studio CRM',
      crmSentDesc:
        'Pilihan tangkai bunga Anda sudah tercatat di pipeline CRM sebagai prospek baru siap dibuatkan proposal.',
      openInCrmBtn: 'Lihat di Studio CRM',
    },
    modal: {
      stemNotes: 'Komposisi Bunga Musiman',
      careGuide: 'Panduan Perawatan',
      selectSize: 'Pilih Ukuran',
      selectPalette: 'Arah Warna',
      deliveryDate: 'Tanggal Pengiriman',
      cardMessage: 'Pesan Kartu Ucapan (Opsional)',
      cardPlaceholder: 'Tuliskan pesan pribadi untuk penerima...',
      addToBag: 'Tambah ke Tas',
      close: 'Tutup',
    },
    subscriptions: {
      kicker: 'Layanan Bunga Berkala',
      heading: 'Langganan Bunga untuk Hunian & Ruang Kerja',
      description:
        'Hadirkan kesegaran alami di ruang keluarga, meja resepsionis, atau butik Anda secara rutin—lengkap dengan rotasi vas keramik bersih.',
      homeSpace: 'Hunian Pribadi',
      corporateSpace: 'Kantor & Studio',
      deliveriesLabel: 'pengiriman / bulan',
      perMonth: 'per bulan',
      addPlan: 'Tambah Paket ke Tas',
      addedFeedback: 'Ditambahkan ke tas',
    },
    services: {
      kicker: 'Layanan Khusus & Input Prospek CRM',
      heading: 'Korporat, Acara, Pernikahan, Workshop & Flower Stand.',
      description:
        'Setiap permintaan layanan yang dikirim di sini langsung masuk ke pipeline Studio CRM agar tim dapat menyusun proposal visual dan kontrak digital.',
      tabs: [
        {
          id: 'corporate',
          label: 'Corporate',
          detail: 'Instalasi lobi mingguan, bingkisan klien, dan rangkaian meja eksekutif.',
        },
        {
          id: 'events',
          label: 'Events',
          detail: 'Peluncuran merek, penataan meja makan editorial, dan pameran galeri.',
        },
        {
          id: 'weddings',
          label: 'Weddings',
          detail: 'Buket pengantin, dekorasi altar, meja panjang, dan korsase keluarga.',
        },
        {
          id: 'workshops',
          label: 'Workshops',
          detail: 'Kelas merangkai buket atau vas untuk komunitas dan tim perusahaan.',
        },
        {
          id: 'flower-stand',
          label: 'Flower Stand',
          detail: 'Standing flower papan kayu estetis untuk pembukaan gerai dan ucapan selamat.',
        },
      ],
      formTitle: 'Ajukan Penawaran Layanan',
      nameLabel: 'Nama Lengkap',
      emailLabel: 'Alamat Email',
      phoneLabel: 'WhatsApp / Telepon',
      dateLabel: 'Tanggal Acara / Kirim',
      venueLabel: 'Lokasi / Kota',
      scopeLabel: 'Kategori Layanan',
      budgetLabel: 'Estimasi Anggaran',
      notesLabel: 'Catatan Palet & Konsep',
      submitBtn: 'Kirim Permintaan ke CRM',
      confirmedTitle: 'Permintaan Tercatat di CRM Studio',
      confirmedDesc:
        'Detail kebutuhan Anda telah masuk ke pipeline Studio CRM. Tim florist kami akan menyiapkan proposal visual dalam 24 jam.',
      newInquiryBtn: 'Buat Permintaan Baru',
    },
    atelier: {
      kicker: 'Tentang Kami · Cerita Studio',
      heading: 'Dirancang dengan ketenangan visual dan dedikasi kriya botani.',
      story:
        'Didirikan oleh desainer dengan latar belakang tata bunga, perhotelan, dan kurasi visual, studio kami memperlakukan setiap tangkai layaknya elemen arsitektur.',
      quote:
        '“Mereka menerjemahkan satu sampel kain linen menjadi empat puluh meja mawar taman dan sweet pea yang memukau sepanjang malam.”',
      quoteAuthor: 'Clarissa Tan',
      quoteRole: 'Direktur Hospitality, The Conservatory House',
      readJournalBtn: 'Baca Jurnal & Blog Studio',
    },
    cart: {
      title: 'Tas Belanja Bunga',
      emptyTitle: 'Tas belanja Anda masih kosong',
      emptyDesc: 'Jelajahi koleksi musiman atau rangkai sendiri di tab Simulasi Harga.',
      browseBtn: 'Lihat Koleksi',
      subtotal: 'Subtotal',
      deliveryFee: 'Biaya Pengiriman',
      freeLabel: 'Gratis',
      freeHint: 'Gratis pengiriman tersedia untuk pesanan di atas',
      total: 'Total',
      proceedCheckout: 'Lanjut ke Pengiriman',
      backToBag: 'Kembali ke Tas',
      checkoutTitle: 'Detail Pengiriman & Konfirmasi',
      customerName: 'Nama Pemesan',
      customerPhone: 'Nomor WhatsApp / Telepon',
      customerEmail: 'Alamat Email',
      recipientName: 'Nama Penerima',
      deliveryAddress: 'Alamat Lengkap Pengiriman',
      postalCode: 'Kode Pos',
      deliverySlot: 'Waktu Pengiriman',
      paymentMethod: 'Metode Pembayaran & Integrasi',
      placeOrder: 'Konfirmasi Pesanan',
      whatsappOrder: 'Kirim Pesanan via WhatsApp',
      confirmedTitle: 'Pesanan Dikonfirmasi',
      confirmedSubtitle: 'Rangkaian Anda sedang disiapkan di studio',
      doneBtn: 'Kembali ke Halaman Utama',
    },
    crm: {
      brandSub: 'Studio CRM',
      backToStore: 'Lihat Storefront',
      newLeadBtn: '+ Prospek Baru',
      sections: {
        pipeline: 'Pipeline Prospek',
        proposals: 'Proposal & Kontrak',
        stems: 'Hitung Tangkai Pasar',
        orders: 'Pesanan Storefront',
        clients: 'Direktori Klien',
      },
      kpis: {
        pipelineValue: 'Nilai Pipeline Aktif',
        activeProposals: 'Estimasi & Proposal Terbuka',
        bookedRevenue: 'Total Booking Terkonfirmasi',
        stemsNeeded: 'Total Tangkai (Aktif)',
      },
      stages: {
        estimate: 'Estimasi',
        lead: 'Prospek',
        'proposal-sent': 'Proposal Terkirim',
        'contract-signed': 'Kontrak Ditandatangani',
        booked: 'Booked & Lunas',
      },
      searchPlaceholder: 'Cari klien, acara, atau nomor referensi...',
      boardView: 'Papan Kanban',
      tableView: 'Tabel',
      exportCsv: 'Ekspor CSV',
      emptyTitle: 'Tidak ada data prospek',
      emptyDesc: 'Ubah kata kunci pencarian atau tambah prospek baru.',
    },
    footer: {
      studioHoursLabel: 'Jam Operasional',
      contactLabel: 'Layanan Pelanggan',
      integrationBtn: 'Lihat Skema Integrasi & Webhook',
      languageLabel: 'Bahasa',
      currencyLabel: 'Mata Uang',
      copyright: 'Hak cipta dilindungi. Storefront Bunga & CRM Independen.',
    },
  },
};
