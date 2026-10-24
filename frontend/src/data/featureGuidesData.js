/**
 * FEATURE GUIDES DATA
 * Data panduan fitur kontekstual untuk setiap halaman di aplikasi MealPlanner.
 * Bersih, profesional, bebas emoji dan ornamen AI-slop.
 */

export const PAGE_GUIDES = {
    '/dashboard': {
        route: '/dashboard',
        title: 'Dashboard Utama',
        iconName: 'LayoutDashboard',
        color: '#2c4a2e',
        bg: 'var(--bg-muted)',
        border: 'var(--border-color)',
        tagline: 'Pusat kendali harian keluarga Anda dalam satu tampilan terpadu',
        description:
            'Dashboard adalah halaman utama yang merangkum semua informasi penting keluarga secara ringkas: menu makan hari ini, status anggaran makan, peringatan stok dapur yang menipis, dan akses cepat ke fitur-fitur utama.',
        workflow: [
            {
                step: 1,
                title: 'Lihat Menu Hari Ini',
                desc: 'Blok "Menu Makan Hari Ini" menampilkan jadwal sarapan, makan siang, dan makan malam berdasarkan Meal Plan aktif yang sudah dibuat.',
            },
            {
                step: 2,
                title: 'Cek Status Anggaran',
                desc: 'Kartu anggaran menampilkan persentase pengeluaran makan saat ini dibanding batas anggaran mingguan yang Anda tetapkan.',
            },
            {
                step: 3,
                title: 'Tanggapi Peringatan Sistem',
                desc: 'Jika ada bahan dapur yang stoknya menipis atau mendekati tanggal kadaluarsa, sistem akan menampilkan peringatan di dashboard.',
            },
        ],
        integration: [
            { label: 'Anggaran Makan', desc: 'Status budget harian & mingguan ditarik dari halaman Anggaran.' },
            { label: 'Stok Bahan', desc: 'Peringatan kadaluarsa & stok menipis diambil dari halaman Inventaris.' },
            { label: 'Meal Plan', desc: 'Menu hari ini otomatis tampil dari rencana makan aktif di Jadwal Tersimpan.' },
        ],
        tips: [
            'Pastikan Meal Plan mingguan selalu aktif agar menu harian tampil di Dashboard.',
            'Periksa Dashboard setiap pagi untuk memastikan tidak ada bahan yang akan kadaluarsa.',
            'Gunakan tombol cepat di Dashboard untuk akses fitur utama tanpa harus navigasi panjang.',
        ],
    },

    '/family': {
        route: '/family',
        title: 'Anggota Keluarga',
        iconName: 'Users',
        color: '#1a5f7a',
        bg: 'var(--bg-muted)',
        border: 'var(--border-color)',
        tagline: 'Profil keluarga menentukan target gizi seluruh sistem',
        description:
            'Halaman ini digunakan untuk mendaftarkan dan mengelola profil semua anggota keluarga. Data profil (usia, berat badan, tinggi, jenis kelamin, dan tingkat aktivitas) digunakan sistem untuk menghitung kebutuhan kalori dan nutrisi harian secara otomatis sesuai standar Angka Kecukupan Gizi (AKG) Kemenkes RI.',
        workflow: [
            {
                step: 1,
                title: 'Tambahkan Profil Anggota',
                desc: 'Klik tombol "Tambah Anggota" lalu isi nama, usia, jenis kelamin, berat badan (kg), tinggi badan (cm), dan tingkat aktivitas fisik harian.',
            },
            {
                step: 2,
                title: 'Sistem Hitung AKG Otomatis',
                desc: 'Setelah data tersimpan, sistem otomatis menghitung BMR (Basic Metabolic Rate) dan TDEE (Total Daily Energy Expenditure) masing-masing anggota menggunakan formula Harris-Benedict.',
            },
            {
                step: 3,
                title: 'Target Gizi Keluarga Terakumulasi',
                desc: 'Target kalori, protein, lemak, dan karbohidrat semua anggota dijumlahkan menjadi target gizi keluarga, yang menjadi acuan saat mesin Meal Plan Optimizer bekerja.',
            },
        ],
        integration: [
            { label: 'Buat Meal Plan', desc: 'Target gizi keluarga menjadi acuan otomatis dalam menyusun jadwal makan seimbang di halaman Rancang Menu.' },
            { label: 'Tracker Nutrisi', desc: 'Progress asupan harian dibandingkan dengan target AKG yang dihitung di halaman ini.' },
            { label: 'Preferensi', desc: 'Alergi dan pantangan dapat diatur per anggota keluarga untuk keamanan menu.' },
        ],
        tips: [
            'Isi data berat & tinggi badan seluruh anggota keluarga agar target kalori presisi.',
            'Pilih tingkat aktivitas "Sangat Aktif" untuk anggota yang berolahraga rutin agar tidak kekurangan kalori.',
            'Perbarui berat badan anak secara berkala karena kebutuhan gizi anak berubah seiring pertumbuhan.',
        ],
    },

    '/budget': {
        route: '/budget',
        title: 'Anggaran Makan',
        iconName: 'Wallet',
        color: '#15803d',
        bg: 'var(--bg-muted)',
        border: 'var(--border-color)',
        tagline: 'Batas anggaran adalah pondasi perencanaan menu yang efisien',
        description:
            'Halaman Anggaran Makan digunakan untuk menetapkan batas pengeluaran makan keluarga per periode (harian, mingguan, atau bulanan). Nilai anggaran ini menjadi batas maksimal otomatis sehingga sistem tidak akan pernah merekomendasikan menu yang melebihi batas yang Anda tetapkan.',
        workflow: [
            {
                step: 1,
                title: 'Tentukan Periode Anggaran',
                desc: 'Pilih periode: Mingguan (paling disarankan karena sesuai frekuensi belanja bahan segar di pasar tradisional).',
            },
            {
                step: 2,
                title: 'Masukkan Nominal Anggaran',
                desc: 'Isi nominal dalam Rupiah. Contoh: Rp 500.000/minggu untuk keluarga 4 orang, atau Rp 2.000.000/bulan.',
            },
            {
                step: 3,
                title: 'Simpan & Aktifkan',
                desc: 'Setelah disimpan, tombol "Buat Meal Plan" di halaman Rekomendasi baru bisa digunakan dan sistem akan memenuhi target gizi dalam batas anggaran ini.',
            },
        ],
        integration: [
            { label: 'Buat Meal Plan', desc: 'Anggaran menjadi batas biaya total menu yang selalu dipatuhi oleh peracik menu otomatis.' },
            { label: 'Dashboard', desc: 'Persentase penggunaan anggaran ditampilkan real-time di kartu budget Dashboard.' },
            { label: 'Daftar Belanja', desc: 'Total estimasi belanja ditampilkan dan dibandingkan dengan anggaran yang tersisa.' },
        ],
        tips: [
            'Anggaran mingguan lebih fleksibel dan sesuai pola belanja kebanyakan keluarga Indonesia.',
            'Mulai dari anggaran yang realistis, lalu evaluasi secara berkala untuk menemukan nilai paling efisien.',
            'Jika sistem menampilkan status anggaran tidak mencukupi, pertimbangkan menaikkan batas 10-20%.',
        ],
    },

    '/preferences': {
        route: '/preferences',
        title: 'Preferensi & Pantangan',
        iconName: 'SlidersHorizontal',
        color: '#b85c38',
        bg: 'var(--bg-muted)',
        border: 'var(--border-color)',
        tagline: 'Keamanan menu dimulai dari pencatatan pantangan yang tepat',
        description:
            'Halaman ini untuk mendaftarkan preferensi makan (makanan favorit dan yang tidak disukai), riwayat alergi bahan makanan, serta pantangan diet khusus (vegetarian, bebas gluten, dll). Data ini disaring secara otomatis sehingga menu yang melanggar pantangan tidak pernah masuk ke daftar rekomendasi.',
        workflow: [
            {
                step: 1,
                title: 'Tandai Bahan Alergi',
                desc: 'Pilih bahan-bahan pemicu alergi dari daftar (susu, telur, kacang, seafood, gluten, dll). Sistem akan menyaring seluruh resep yang mengandung bahan tersebut.',
            },
            {
                step: 2,
                title: 'Atur Pantangan Diet',
                desc: 'Aktifkan mode diet khusus jika diperlukan: Vegetarian (tanpa daging), Vegan (tanpa produk hewani), atau bebas laktosa.',
            },
            {
                step: 3,
                title: 'Tambahkan Preferensi Menu',
                desc: 'Tandai resep atau kategori yang disukai keluarga. Algoritma akan memberikan bobot prioritas lebih tinggi pada jenis menu tersebut.',
            },
        ],
        integration: [
            { label: 'Buat Meal Plan', desc: 'Penyaringan otomatis memastikan menu aman dari alergi dan pantangan keluarga.' },
            { label: 'Katalog Resep', desc: 'Resep yang mengandung bahan alergi akan mendapat label peringatan di katalog.' },
            { label: 'Anggota Keluarga', desc: 'Pantangan dapat diatur spesifik per anggota keluarga untuk presisi lebih tinggi.' },
        ],
        tips: [
            'Aktifkan pantangan alergi bahkan jika reaksinya ringan demi keamanan seluruh keluarga.',
            'Tandai beberapa resep favorit agar sistem memprioritaskan menu yang memang disukai keluarga.',
            'Tinjau preferensi setiap 1-2 bulan sesuai perubahan selera atau kondisi kesehatan keluarga.',
        ],
    },

    '/inventory': {
        route: '/inventory',
        title: 'Stok Bahan Dapur',
        iconName: 'Package',
        color: '#d97706',
        bg: 'var(--bg-muted)',
        border: 'var(--border-color)',
        tagline: 'Stok dapur yang tercatat = belanja yang lebih hemat dan minim pemborosan',
        description:
            'Halaman Stok Bahan menginventarisasi semua bahan pangan yang sudah ada di dapur rumah Anda beserta jumlah stok dan tanggal kadaluarsa. Sistem menggunakan data ini untuk mengurangi kebutuhan belanja dari Daftar Belanja (prinsip Zero Food Waste: gunakan yang ada dulu sebelum beli baru).',
        workflow: [
            {
                step: 1,
                title: 'Catat Bahan yang Ada di Dapur',
                desc: 'Klik "Tambah Bahan" lalu pilih nama bahan dari daftar, isi jumlah stok (dalam gram/ml/buah), dan tanggal kadaluarsa.',
            },
            {
                step: 2,
                title: 'Perbarui Stok Setelah Belanja',
                desc: 'Setelah berbelanja bahan baru, perbarui jumlah stok di halaman ini atau gunakan tombol sinkronisasi di halaman Daftar Belanja.',
            },
            {
                step: 3,
                title: 'Pantau Peringatan Kadaluarsa',
                desc: 'Sistem menandai bahan yang mendekati masa kadaluarsa dalam 3 hari ke depan agar segera diprioritaskan untuk dimasak.',
            },
        ],
        integration: [
            { label: 'Daftar Belanja', desc: 'Stok yang ada otomatis dikurangi dari kebutuhan belanja: Beli = Butuh - Stok.' },
            { label: 'Dashboard', desc: 'Peringatan stok menipis dan kadaluarsa muncul sebagai notifikasi di Dashboard.' },
            { label: 'Katalog Resep', desc: 'Ketersediaan bahan mempengaruhi kesiapan resep untuk dieksekusi hari ini.' },
        ],
        tips: [
            'Perbarui stok segera setelah belanja agar kalkulasi Daftar Belanja selalu akurat.',
            'Isi tanggal kadaluarsa saat mencatat stok untuk mengaktifkan notifikasi otomatis.',
            'Bahan yang sudah habis atau rusak sebaiknya diperbarui dari inventaris.',
        ],
    },

    '/equipment': {
        route: '/equipment',
        title: 'Peralatan Masak',
        iconName: 'Wrench',
        color: '#7c3aed',
        bg: 'var(--bg-muted)',
        border: 'var(--border-color)',
        tagline: 'Inventaris peralatan memastikan seluruh resep rekomendasi dapat dieksekusi',
        description:
            'Halaman Peralatan Masak mendaftarkan alat memasak yang tersedia di dapur Anda (kompor, oven, blender, rice cooker, wajan, panci, dll). Sistem menggunakan data ini untuk filter kompatibilitas resep — mencegah rekomendasi menu yang membutuhkan peralatan yang tidak dimiliki.',
        workflow: [
            {
                step: 1,
                title: 'Pilih Peralatan yang Dimiliki',
                desc: 'Centang dari daftar peralatan standar: kompor gas, wajan, panci, spatula, oven, blender, rice cooker, dan lainnya.',
            },
            {
                step: 2,
                title: 'Tambahkan Peralatan Tambahan',
                desc: 'Jika memiliki peralatan khusus (air fryer, slow cooker, pemanggang listrik), tambahkan agar resep yang relevan dapat direkomendasikan.',
            },
            {
                step: 3,
                title: 'Sistem Filter Otomatis',
                desc: 'Saat menyusun Meal Plan, resep yang memerlukan alat di luar daftar Anda akan otomatis disingkirkan dari kandidat menu.',
            },
        ],
        integration: [
            { label: 'Buat Meal Plan', desc: 'Sistem memastikan seluruh resep yang dipilih hanya membutuhkan peralatan yang Anda miliki di rumah.' },
            { label: 'Katalog Resep', desc: 'Resep yang membutuhkan alat yang belum dimiliki akan ditandai secara visual.' },
        ],
        tips: [
            'Pastikan alat dasar tercentang: kompor, wajan, panci, dan rice cooker agar ribuan resep dapat diakses.',
            'Tambahkan oven jika tersedia untuk membuka opsi resep panggang bernutrisi tinggi.',
            'Perbarui daftar jika Anda menambah peralatan baru untuk memperluas variasi resep.',
        ],
    },

    '/recipes': {
        route: '/recipes',
        title: 'Katalog Resep',
        iconName: 'UtensilsCrossed',
        color: '#c2410c',
        bg: 'var(--bg-muted)',
        border: 'var(--border-color)',
        tagline: 'Koleksi resep terverifikasi dengan data gizi lengkap dan estimasi biaya per porsi',
        description:
            'Katalog Resep adalah ensiklopedia masakan Indonesia yang menjadi bank data kandidat menu. Setiap resep dilengkapi dengan foto masakan, rincian bahan dan takaran, total kandungan kalori & makronutrisi, estimasi biaya per porsi, tingkat kesulitan, serta waktu memasak.',
        workflow: [
            {
                step: 1,
                title: 'Cari & Filter Resep',
                desc: 'Gunakan kotak pencarian untuk menemukan resep berdasarkan nama masakan, atau filter berdasarkan kategori (Lauk, Sayur, Sup, Sarapan) dan tingkat kesulitan.',
            },
            {
                step: 2,
                title: 'Lihat Rincian Nutrisi & Biaya',
                desc: 'Buka kartu resep untuk melihat foto makanan, daftar bahan, takaran gramasi, estimasi biaya per porsi, dan kandungan kalori/protein/karbohidrat/lemak.',
            },
            {
                step: 3,
                title: 'Basis Input Peracikan Menu',
                desc: 'Semua resep aktif di katalog ini menjadi pilihan kombinasi menu yang disesuaikan dengan gizi dan anggaran keluarga.',
            },
        ],
        integration: [
            { label: 'Buat Meal Plan', desc: 'Seluruh resep aktif di katalog menjadi pilihan menu lezat untuk keluarga.' },
            { label: 'Daftar Belanja', desc: 'Daftar bahan resep terpilih diakumulasikan menjadi kebutuhan belanja total.' },
            { label: 'Tracker Nutrisi', desc: 'Data gizi resep diakumulasikan untuk memantau asupan nutrisi harian keluarga.' },
        ],
        tips: [
            'Filter berdasarkan tingkat kesulitan "Mudah" untuk menemukan resep cepat saji (di bawah 25 menit).',
            'Perhatikan estimasi harga per porsi untuk memilih menu pendukung yang ramah kantong.',
            'Administrator dapat menambah resep baru melalui Panel Admin untuk memperkaya database masakan.',
        ],
    },

    '/recommendation': {
        route: '/recommendation',
        title: 'Perencanaan Menu (Meal Plan)',
        iconName: 'CalendarPlus',
        color: '#2563eb',
        bg: 'var(--bg-muted)',
        border: 'var(--border-color)',
        tagline: 'Penyusunan jadwal menu otomatis bergizi seimbang dan ramah anggaran',
        description:
            'Halaman ini adalah pusat perencanaan menu MealPlanner. Sistem cerdas secara terstruktur menyusun jadwal menu makan keluarga yang paling optimal: memenuhi target gizi AKG tanpa melampaui batas anggaran belanja Anda.',
        workflow: [
            {
                step: 1,
                title: 'Pilih Mode Optimasi',
                desc: 'Tersedia 3 mode terukur: Mode Hemat (meminimalkan pengeluaran total), Mode Gizi Seimbang (mengoptimalkan kepatuhan target AKG), dan Mode Praktis (fokus pada resep mudah dan variasi seimbang).',
            },
            {
                step: 2,
                title: 'Tentukan Durasi Perencanaan',
                desc: 'Pilih rentang hari: 3 hari, 5 hari, 7 hari (mingguan — standar pasar), 10 hari, atau 14 hari. Sistem akan menyusun slot sarapan, makan siang, dan makan malam.',
            },
            {
                step: 3,
                title: 'Peracikan Menu Cerdas',
                desc: 'Sistem memverifikasi anggaran, menyaring alergi & peralatan, lalu menyusun kombinasi menu terbaik dalam beberapa detik.',
            },
            {
                step: 4,
                title: 'Review & Simpan Rencana',
                desc: 'Evaluasi jadwal menu, ringkasan biaya, dan pemenuhan nutrisi. Klik "Simpan Rencana" agar jadwal aktif di Dashboard dan Daftar Belanja siap digunakan.',
            },
        ],
        integration: [
            { label: 'Anggota Keluarga', desc: 'Target AKG keluarga menjadi batasan nutrisi minimum yang wajib dipenuhi kombinasi menu.' },
            { label: 'Anggaran Makan', desc: 'Nilai budget menjadi batas biaya total tertinggi pada peracikan menu.' },
            { label: 'Preferensi', desc: 'Sistem langsung mengeliminasi bahan yang memicu alergi sebelum jadwal menu disusun.' },
            { label: 'Peralatan Masak', desc: 'Hanya resep yang cocok dengan alat masak dapur Anda yang akan dipilih.' },
            { label: 'Stok Bahan', desc: 'Bahan yang tersedia di dapur diperhitungkan untuk menghemat estimasi belanja riil.' },
        ],
        tips: [
            'Mode Gizi Seimbang sangat direkomendasikan untuk kebutuhan harian keluarga jangka panjang.',
            'Jika optimasi tidak menemukan solusi valid, coba naikkan batas anggaran 10-15% atau tinjau kembali pantangan yang terlalu ketat.',
            'Lakukan perencanaan setiap awal pekan agar jadwal belanja di pasar selalu selaras.',
        ],
    },

    '/meal-plans': {
        route: '/meal-plans',
        title: 'Jadwal Tersimpan',
        iconName: 'CalendarDays',
        color: '#0369a1',
        bg: 'var(--bg-muted)',
        border: 'var(--border-color)',
        tagline: 'Manajemen kalender rencana makan keluarga yang aktif maupun riwayat',
        description:
            'Halaman Jadwal Tersimpan menampilkan seluruh rencana makan keluarga yang pernah dibuat dan disimpan. Setiap rencana dapat dibuka untuk melihat rincian jadwal menu harian lengkap per slot waktu (Sarapan, Makan Siang, Makan Malam) beserta analisis biayanya.',
        workflow: [
            {
                step: 1,
                title: 'Pilih Rencana Makan',
                desc: 'Daftar rencana tampil terurut dari yang terbaru dengan ringkasan status (Aktif / Selesai), estimasi biaya total, dan durasi hari.',
            },
            {
                step: 2,
                title: 'Inspeksi Detail Kalender',
                desc: 'Buka rencana untuk melihat kalender jadwal per hari, rincian menu per slot makan, dan total kalori harian yang terpenuhi.',
            },
            {
                step: 3,
                title: 'Ekspor ke Daftar Belanja',
                desc: 'Rencana yang berstatus aktif secara otomatis menjadi sumber acuan pembentukan Daftar Belanja untuk periode tersebut.',
            },
        ],
        integration: [
            { label: 'Buat Meal Plan', desc: 'Hasil optimasi yang disimpan di halaman Rekomendasi akan diarsipkan di sini.' },
            { label: 'Dashboard', desc: 'Rencana dengan status aktif menampilkan menu hari ini langsung di halaman muka.' },
            { label: 'Daftar Belanja', desc: 'Bahan dari resep rencana aktif diakumulasikan menjadi kebutuhan belanja mingguan.' },
        ],
        tips: [
            'Simpan variasi rencana (misal versi hemat dan versi variatif) sebagai opsi perencanaan cepat.',
            'Hapus rencana kadaluarsa yang tidak digunakan agar arsip tetap rapi.',
            'Rencana terdahulu dapat dijadikan referensi pola makan keluarga pada bulan-bulan berikutnya.',
        ],
    },

    '/shopping': {
        route: '/shopping',
        title: 'Daftar Belanja',
        iconName: 'ShoppingCart',
        color: '#059669',
        bg: 'var(--bg-muted)',
        border: 'var(--border-color)',
        tagline: 'Daftar belanja bahan otomatis: Kebutuhan Resep dikurangi Stok Dapur',
        description:
            'Daftar Belanja adalah fitur yang secara presisi mengkalkulasi bahan apa saja yang harus dibeli di pasar. Rumus perhitungan: Total Kebutuhan Resep (dari Meal Plan aktif) dikurangi Stok Tersedia di Dapur (dari Inventaris) = Kebutuhan Belanja Riil.',
        workflow: [
            {
                step: 1,
                title: 'Kalkulasi Otomatis dari Rencana',
                desc: 'Saat Meal Plan aktif dipilih, sistem langsung mengagregasi semua bahan resep, mengurangkan stok dapur yang masih ada, dan menyusun daftar belanja.',
            },
            {
                step: 2,
                title: 'Checklist Saat Berbelanja',
                desc: 'Gunakan fitur checklist di perangkat mobile saat berada di pasar atau supermarket untuk menandai barang yang sudah terbeli.',
            },
            {
                step: 3,
                title: 'Sinkronisasi ke Stok Dapur',
                desc: 'Setelah belanja selesai, klik tombol perbarui stok agar inventaris dapur langsung terisi sesuai barang yang dibeli tanpa perlu input manual.',
            },
        ],
        integration: [
            { label: 'Jadwal Tersimpan', desc: 'Daftar bahan ditarik dari seluruh resep pada Meal Plan aktif.' },
            { label: 'Stok Bahan', desc: 'Stok dapur yang masih mencukupi tidak akan dimasukkan ke dalam daftar belanja.' },
            { label: 'Anggaran Makan', desc: 'Estimasi total biaya belanja dibandingkan langsung dengan plafon anggaran yang tersisa.' },
        ],
        tips: [
            'Sinkronkan inventaris segera setelah belanja agar data stok selalu konsisten.',
            'Gunakan estimasi harga per kategori bahan untuk menyiapkan dana tunai atau dompet digital yang cukup.',
            'Daftar belanja dapat difilter per kategori pasar (sayuran, protein, bumbu dapur) untuk mempermudah alur belanja.',
        ],
    },

    '/nutrition': {
        route: '/nutrition',
        title: 'Tracker Nutrisi',
        iconName: 'Activity',
        color: '#0284c7',
        bg: 'var(--bg-muted)',
        border: 'var(--border-color)',
        tagline: 'Pemantauan asupan kalori dan makronutrien terhadap standar AKG Kemenkes',
        description:
            'Tracker Nutrisi memberikan visualisasi real-time tentang asupan kalori dan makronutrisi (protein, lemak, karbohidrat) keluarga berdasarkan menu yang direncanakan. Data dikomparasikan langsung dengan target AKG yang dihitung dari profil seluruh anggota keluarga.',
        workflow: [
            {
                step: 1,
                title: 'Pantau Realisasi Kalori Harian',
                desc: 'Indikator cincin kalori menunjukkan persentase kalori yang dipenuhi oleh menu hari ini terhadap target kebutuhan keluarga.',
            },
            {
                step: 2,
                title: 'Evaluasi Keseimbangan Makronutrien',
                desc: 'Bilah progres untuk protein, karbohidrat, dan lemak memperlihatkan proporsi asupan zat gizi makro sesuai anjuran gizi seimbang.',
            },
            {
                step: 3,
                title: 'Analisis Pola Mingguan',
                desc: 'Grafik tren mingguan memetakan stabilitas asupan energi dari hari ke hari guna mendeteksi defisit atau kelebihan kalori.',
            },
        ],
        integration: [
            { label: 'Anggota Keluarga', desc: 'Standar AKG keluarga menjadi garis batas pembanding pada seluruh grafik nutrisi.' },
            { label: 'Meal Plan', desc: 'Komposisi nutrisi resep pada Meal Plan aktif menjadi sumber data kalkulasi asupan.' },
            { label: 'Laporan & Analitik', desc: 'Riwayat nutrisi harian dirangkum menjadi laporan tren jangka panjang.' },
        ],
        tips: [
            'Perhatikan asupan protein harian agar tidak kurang dari 15-20% dari total kalori keluarga.',
            'Jika grafik kalori konsisten berada di bawah target, tambahkan menu pendukung tinggi kalori sehat seperti kacang-kacangan atau buah.',
            'Periksa tracker secara berkala setiap awal dan pertengahan pekan untuk evaluasi kualitas menu.',
        ],
    },

    '/analytics': {
        route: '/analytics',
        title: 'Laporan & Analitik',
        iconName: 'BarChart3',
        color: '#7c3aed',
        bg: 'var(--bg-muted)',
        border: 'var(--border-color)',
        tagline: 'Evaluasi data performa dapur: efisiensi anggaran, tren gizi, dan frekuensi menu',
        description:
            'Halaman Laporan menyajikan analitik komprehensif mengenai pengelolaan makanan keluarga: tren pengeluaran aktual vs anggaran, tingkat efisiensi belanja, resep yang paling sering dimasak, dan distribusi makronutrisi bulanan.',
        workflow: [
            {
                step: 1,
                title: 'Pilih Rentang Waktu',
                desc: 'Filter analitik berdasarkan rentang waktu evaluasi: 7 hari terakhir, 30 hari, atau 3 bulan terakhir.',
            },
            {
                step: 2,
                title: 'Analisis Efisiensi Pengeluaran',
                desc: 'Bandingkan total pengeluaran aktual terhadap batas anggaran. Ketahui persentase efisiensi anggaran yang berhasil dicapai.',
            },
            {
                step: 3,
                title: 'Tinjau Frekuensi & Variasi Resep',
                desc: 'Periksa masakan yang paling sering disajikan dan evaluasi apakah variasi menu sudah cukup seimbang dan tidak monoton.',
            },
        ],
        integration: [
            { label: 'Anggaran Makan', desc: 'Data anggaran menjadi tolok ukur garis target pada grafik pengeluaran.' },
            { label: 'Tracker Nutrisi', desc: 'Akumulasi log nutrisi diolah menjadi tren kepatuhan gizi jangka panjang.' },
            { label: 'Jadwal Tersimpan', desc: 'Riwayat biaya dari setiap rencana makan yang telah selesai menjadi data dasar laporan.' },
        ],
        tips: [
            'Lakukan review laporan setiap akhir bulan untuk merumuskan plafon anggaran bulan berikutnya.',
            'Jika ada tren lonjakan biaya di minggu tertentu, periksa apakah dipicu oleh resep dengan bahan berharga tinggi.',
            'Gunakan data frekuensi resep untuk menambah variasi masakan baru agar keluarga tidak bosan.',
        ],
    },

    '/history': {
        route: '/history',
        title: 'Riwayat Aktivitas',
        iconName: 'History',
        color: '#475569',
        bg: 'var(--bg-muted)',
        border: 'var(--border-color)',
        tagline: 'Catatan audit kronologis seluruh aksi dan perubahan data dalam sistem',
        description:
            'Halaman Riwayat mencatat secara kronologis semua kejadian dan aksi penting dalam aplikasi: pembuatan rencana makan, perubahan anggaran, pembaruan stok dapur, modifikasi preferensi keluarga, dan aktivitas belanja.',
        workflow: [
            {
                step: 1,
                title: 'Pantau Log Kronologis',
                desc: 'Daftar aktivitas tersaji dari peristiwa paling baru dengan timestamp lengkap, kategori aksi, dan rincian perubahan.',
            },
            {
                step: 2,
                title: 'Filter Kategori Aktivitas',
                desc: 'Saring tampilan menurut kategori tertentu (Meal Plan, Anggaran, Inventaris, atau Pengaturan) untuk pelacakan spesifik.',
            },
            {
                step: 3,
                title: 'Verifikasi Transparansi Data',
                desc: 'Gunakan catatan riwayat untuk menelusuri riwayat perubahan data dan memastikan konsistensi perencanaan dapur.',
            },
        ],
        integration: [
            { label: 'Seluruh Sistem', desc: 'Setiap operasi pencatatan, pengubahan, dan penghapusan data tercatat otomatis di modul Riwayat.' },
        ],
        tips: [
            'Gunakan riwayat untuk memastikan kapan stok bahan terakhir kali disinkronkan.',
            'Bila terjadi selisih anggaran, periksa riwayat perubahan batas budget untuk menemukan waktu perubahan.',
        ],
    },

    '/settings': {
        route: '/settings',
        title: 'Pengaturan Sistem',
        iconName: 'Settings',
        color: '#475569',
        bg: 'var(--bg-muted)',
        border: 'var(--border-color)',
        tagline: 'Konfigurasi akun, preferensi tema antarmuka, dan keamanan data',
        description:
            'Halaman Pengaturan menyediakan kontrol atas preferensi akun pengguna, pergantian tema visual (Mode Terang / Mode Gelap), pengelolaan informasi profil, dan pembaharuan kredensial keamanan akun.',
        workflow: [
            {
                step: 1,
                title: 'Kelola Profil Pengguna',
                desc: 'Perbarui nama lengkap, alamat email, dan informasi dasar akun yang terdaftar dalam sistem.',
            },
            {
                step: 2,
                title: 'Pilih Tema Tampilan',
                desc: 'Sesuaikan kenyamanan visual antara tema Terang (Light) atau Gelap (Dark) yang tersimpan permanen per sesi.',
            },
            {
                step: 3,
                title: 'Perbarui Kredensial Keamanan',
                desc: 'Ubah kata sandi secara berkala dengan memasukkan kata sandi saat ini dan kata sandi baru yang memenuhi standar keamanan.',
            },
        ],
        integration: [
            { label: 'Seluruh Aplikasi', desc: 'Pengaturan tema visual dan parameter akun berlaku seragam di semua halaman aplikasi.' },
        ],
        tips: [
            'Gunakan kata sandi kombinasi huruf, angka, dan simbol untuk keamanan maksimal.',
            'Mode Gelap disarankan saat mengakses aplikasi di ruangan redup untuk mengurangi kelelahan mata.',
        ],
    },

    '/data-center': {
        route: '/data-center',
        title: 'Data Center & Integrasi',
        iconName: 'Database',
        color: '#0369a1',
        bg: 'var(--bg-muted)',
        border: 'var(--border-color)',
        tagline: 'Pusat manajemen dataset pangan, validasi nutrisi, dan pipeline resep',
        description:
            'Data Center adalah modul administratif untuk memantau integritas dataset sistem: memvalidasi kecukupan data gizi bahan masakan, mengimpor dataset eksternal (TKPI, Mendeley, data institusi), memetakan terminologi bahan pangan, dan menjaga kualitas input algoritma optimasi.',
        workflow: [
            {
                step: 1,
                title: 'Pantau Metrik Integritas Data',
                desc: 'Inspeksi jumlah resep aktif, kelengkapan parameter nutrisi, bahan yang membutuhkan pemetaan (needs_review), dan rasio kesiapan data untuk solver.',
            },
            {
                step: 2,
                title: 'Impor & Validasi Dataset',
                desc: 'Unggah file data resep/bahan dalam format CSV atau JSON. Pipeline validasi akan memeriksa konsistensi tipe data sebelum committed ke database.',
            },
            {
                step: 3,
                title: 'Harmonisasi Nama Bahan',
                desc: 'Gunakan ruang kerja pemetaan untuk mencocokkan variasi penamaan bahan dari dataset eksternal ke basis data taksonomi standar internal.',
            },
        ],
        integration: [
            { label: 'Katalog Resep', desc: 'Resep yang berhasil divalidasi dan dipetakan secara otomatis aktif di katalog utama.' },
            { label: 'Buat Meal Plan', desc: 'Dataset bahan dan resep terverifikasi menjadi sumber inspirasi menu lezat dan bergizi.' },
        ],
        tips: [
            'Pastikan data makronutrisi (kalori, protein, lemak, karbohidrat) terisi lengkap agar resep dapat diproses oleh algoritma.',
            'Selesaikan pemetaan bahan berstatus "needs_review" sebelum merilis resep baru ke katalog umum.',
        ],
    },
};

/**
 * Mendapatkan data panduan berdasarkan pathname URL aktif.
 * @param {string} pathname - URL pathname saat ini (contoh: '/family', '/recipes')
 * @returns {object|null} - Data panduan halaman atau null jika tidak ada
 */
export function getGuideForPath(pathname) {
    if (!pathname) return null;
    const exact = PAGE_GUIDES[pathname];
    if (exact) return exact;

    const partial = Object.keys(PAGE_GUIDES).find(
        (key) => key !== '/' && pathname.startsWith(key)
    );
    return partial ? PAGE_GUIDES[partial] : null;
}

/**
 * Mendapatkan semua panduan untuk ditampilkan di direktori fitur.
 */
export function getAllGuides() {
    return Object.values(PAGE_GUIDES);
}
