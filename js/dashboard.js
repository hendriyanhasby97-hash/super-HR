import { supabase } from './koneksi.js';

export function renderDashboard(container) {
    container.innerHTML = `
        <style>
            /* Layout Grid Ringkasan / Katu Informasi */
            .card-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
            .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: space-between; }
            .card-info h3 { font-size: 2rem; color: #1e293b; margin-bottom: 5px; }
            .card-info p { font-size: 0.85rem; color: #64748b; font-weight: 600; text-transform: uppercase; }
            .card-icon { width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; }
            
            /* Warna khusus icon keping informasi */
            .bg-total { background: #e0f2fe; color: #0369a1; }
            .bg-aktif { background: #dcfce7; color: #15803d; }
            .bg-masuk { background: #fef9c3; color: #a16207; }
            .bg-keluar { background: #fee2e2; color: #b91c1c; }

            /* Layout Grid untuk Tabel-Tabel Rekapitulasi */
            .recap-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 25px; }
            .recap-box { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .recap-box h4 { margin-bottom: 15px; color: #334155; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; display: flex; align-items: center; gap: 8px;}
            
            .recap-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
            .recap-table th, .recap-table td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #f1f5f9; }
            .recap-table th { background: #f8fafc; color: #475569; font-weight: 600; }
            .recap-table tr:hover { background: #f8fafc; }
            
            /* Badge penanda data kosong */
            .badge-warn { background: #fff7ed; color: #c2410c; padding: 2px 6px; border-radius: 4px; font-weight: 600; font-size: 0.8rem; border: 1px solid #ffedd5; }
        </style>

        <div class="card-grid">
            <div class="card">
                <div class="card-info"><h3 id="dash_total">-</h3><p>Total Pegawai</p></div>
                <div class="card-icon bg-total"><i class="fas fa-users"></i></div>
            </div>
            <div class="card">
                <div class="card-info"><h3 id="dash_aktif">-</h3><p>Pegawai Aktif</p></div>
                <div class="card-icon bg-aktif"><i class="fas fa-user-check"></i></div>
            </div>
            <div class="card">
                <div class="card-info"><h3 id="dash_masuk">-</h3><p>Pegawai Masuk</p></div>
                <div class="card-icon bg-masuk"><i class="fas fa-door-open"></i></div>
            </div>
            <div class="card">
                <div class="card-info"><h3 id="dash_keluar">-</h3><p>Pegawai Keluar</p></div>
                <div class="card-icon bg-keluar"><i class="fas fa-door-closed"></i></div>
            </div>
        </div>

        <div class="recap-grid">
            
            <div class="recap-box">
                <h4><i class="fas fa-pray" style="color:#3b82f6;"></i> Rekapitulasi Agama</h4>
                <table class="recap-table">
                    <thead><tr><th>Agama</th><th>Jumlah</th></tr></thead>
                    <tbody id="recap_agama"><tr><td colspan="2">Menghitung...</td></tr></tbody>
                </table>
            </div>

            <div class="recap-box">
                <h4><i class="fas fa-venus-mars" style="color:#ec4899;"></i> Rekapitulasi Jenis Kelamin</h4>
                <table class="recap-table">
                    <thead><tr><th>Jenis Kelamin</th><th>Jumlah</th></tr></thead>
                    <tbody id="recap_gender"><tr><td colspan="2">Menghitung...</td></tr></tbody>
                </table>
            </div>

            <div class="recap-box">
                <h4><i class="fas fa-id-badge" style="color:#10b981;"></i> Rekapitulasi Kelompok Pegawai</h4>
                <table class="recap-table">
                    <thead><tr><th>Kelompok Pegawai</th><th>Jumlah</th></tr></thead>
                    <tbody id="recap_kelompok"><tr><td colspan="2">Menghitung...</td></tr></tbody>
                </table>
            </div>

            <div class="recap-box">
                <h4><i class="fas fa-briefcase" style="color:#f59e0b;"></i> Rekapitulasi Kelompok Jabatan</h4>
                <table class="recap-table">
                    <thead><tr><th>Kelompok Jabatan</th><th>Jumlah</th></tr></thead>
                    <tbody id="recap_jabatan"><tr><td colspan="2">Menghitung...</td></tr></tbody>
                </table>
            </div>

            <div class="recap-box" style="grid-column: span 2;">
                <h4><i class="fas fa-hospital-user" style="color:#0ea5e9;"></i> Rekapitulasi Penempatan Ruangan</h4>
                <table class="recap-table">
                    <thead><tr><th>Nama Ruangan / Unit</th><th>Jumlah Pegawai</th></tr></thead>
                    <tbody id="recap_ruangan"><tr><td colspan="2">Menghitung...</td></tr></tbody>
                </table>
            </div>

        </div>
    `;

    initDashboardLogic();
}

async function initDashboardLogic() {
    // 1. Ambil seluruh data dari Supabase secara paralel demi efisiensi performa
    const [resPegawai, resMasuk] = await Promise.all([
        supabase.from('pegawai').select('status, agama, jenis_kelamin, kelompok_pegawai, kelompok_jabatan, ruangan'),
        supabase.from('pegawai_masuk').select('id_masuk', { count: 'exact' })
    ]);

    if (resPegawai.error) {
        console.error("Gagal memuat dashboard:", resPegawai.error.message);
        return;
    }

    const pegawaiData = resPegawai.data;
    const totalPegawaiMasuk = resMasuk.count || 0;

    // 2. Kalkulasi Ringkasan Utama Atas
    const totalPegawai = pegawaiData.length;
    const pegawaiAktif = pegawaiData.filter(p => p.status === 'Aktif').length;
    
    // Pegawai Keluar dihitung dari status non-aktif di master data master (Mutasi, Pensiun, Resign, Meninggal)
    const pegawaiKeluar = pegawaiData.filter(p => ['Mutasi', 'Pensiun', 'Resign', 'Meninggal'].includes(p.status)).length;

    // Tampilkan nilai ringkasan ke komponen UI
    document.getElementById('dash_total').innerText = totalPegawai;
    document.getElementById('dash_aktif').innerText = pegawaiAktif;
    document.getElementById('dash_masuk').innerText = totalPegawaiMasuk;
    document.getElementById('dash_keluar').innerText = pegawaiKeluar;

    // 3. Pemrosesan Data Rekapitulasi (In-Memory Aggregation)

    // A. Distribusi Agama
    const listAgama = ['Islam', 'Kristen', 'Budha', 'Hindu', 'Konghucu', 'Kepercayaan Lainnya'];
    hitungDanRenderKategori(pegawaiData, 'agama', listAgama, 'recap_agama');

    // B. Distribusi Jenis Kelamin
    const listGender = ['Laki-laki', 'Perempuan'];
    hitungDanRenderKategori(pegawaiData, 'jenis_kelamin', listGender, 'recap_gender');

    // C. Distribusi Kelompok Pegawai
    const listKelompok = ['ASN', 'APBD', 'BLUD', 'Konsultan', 'Magang'];
    hitungDanRenderKategori(pegawaiData, 'kelompok_pegawai', listKelompok, 'recap_kelompok');

    // D. Distribusi Kelompok Jabatan
    const listJabatan = ['Management', 'Tenaga Medis', 'Tenaga Kesehatan', 'Tenaga Penunjang Medis', 'Tenaga Administrasi', 'Tenaga Non Administrasi'];
    hitungDanRenderKategori(pegawaiData, 'kelompok_jabatan', listJabatan, 'recap_jabatan');

    // E. Distribusi Ruangan (Dihitung dinamis karena nama ruangan bervariasi sesuai isi database)
    hitungDanRenderRuanganDinamis(pegawaiData, 'recap_ruangan');
}

// Fungsi pembantu untuk mengelompokkan data berdasarkan kategori terstruktur tetap
function hitungDanRenderKategori(data, key, predefinedList, targetElementId) {
    const counts = {};
    
    // Inisialisasi awal nilai counter
    predefinedList.forEach(item => counts[item] = 0);
    counts['Belum Mengisi'] = 0;

    // Proses perhitungan baris data
    data.forEach(p => {
        const val = p[key];
        if (val === null || val === undefined || val.trim() === "") {
            counts['Belum Mengisi']++;
        } else if (counts[val] !== undefined) {
            counts[val]++;
        } else {
            // Jaga-jaga jika ada isian teks manual di luar dropdown pilihan resmi
            if (!counts[val]) counts[val] = 0;
            counts[val]++;
        }
    });

    // Susun baris HTML tabel rekapitulasi
    const targetEl = document.getElementById(targetElementId);
    let html = '';

    // Tampilkan list resmi pilihan terlebih dahulu
    Object.keys(counts).forEach(k => {
        if (k !== 'Belum Mengisi') {
            html += `<tr><td>${k}</td><td><strong>${counts[k]}</strong> pegawai</td></tr>`;
        }
    });

    // Tempatkan baris data "Belum Mengisi" pada bagian paling bawah dengan aksen badge warna merah/oranye
    html += `<tr>
        <td><span class="badge-warn">Belum Mengisi Data</span></td>
        <td><span style="color:#c2410c; font-weight:700;">${counts['Belum Mengisi']}</span> pegawai</td>
    </tr>`;

    targetEl.innerHTML = html;
}

// Fungsi pembantu khusus pengelompokan data ruangan (dinamis menyesuaikan variasi isian database)
function hitungDanRenderRuanganDinamis(data, targetElementId) {
    const counts = {};
    let belumMengisiCount = 0;

    data.forEach(p => {
        const ruangan = p.ruangan;
        if (ruangan === null || ruangan === undefined || ruangan.trim() === "") {
            belumMengisiCount++;
        } else {
            const cleanKey = ruangan.trim();
            counts[cleanKey] = (counts[cleanKey] || 0) + 1;
        }
    });

    // Urutkan nama ruangan secara alfabetis dari A ke Z agar rapi
    const sortedRuangan = Object.keys(counts).sort();

    const targetEl = document.getElementById(targetElementId);
    let html = '';

    if (sortedRuangan.length === 0 && belumMengisiCount === 0) {
        targetEl.innerHTML = `<tr><td colspan="2" style="text-align:center; color:#94a3b8;">Tidak ada data penempatan ruangan.</td></tr>`;
        return;
    }

    sortedRuangan.forEach(r => {
        html += `<tr><td><i class="fas fa-door-open" style="color:#94a3b8; margin-right:8px;"></i>${r}</td><td><strong>${counts[r]}</strong> pegawai</td></tr>`;
    });

    // Tampilkan rekap data ruangan kosong di baris terbawah
    html += `<tr>
        <td><span class="badge-warn">Belum Mengisi Ruangan / Unit</span></td>
        <td><span style="color:#c2410c; font-weight:700;">${belumMengisiCount}</span> pegawai</td>
    </tr>`;

    targetEl.innerHTML = html;
}
