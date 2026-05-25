import { supabase } from './koneksi.js';
// Impor Chart.js secara langsung via modul CDN
import Chart from 'https://cdn.jsdelivr.net/npm/chart.js/auto/+esm';

// Variabel global untuk menyimpan grafik agar bisa dihancurkan saat pindah halaman (mencegah error canvas)
let chartInstances = [];

export function renderDashboard(container) {
    // Bersihkan grafik lama jika ada sebelum merender yang baru
    chartInstances.forEach(chart => chart.destroy());
    chartInstances = [];

    container.innerHTML = `
        <style>
            /* Layout Grid Ringkasan */
            .card-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
            .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: space-between; }
            .card-info h3 { font-size: 2rem; color: #1e293b; margin-bottom: 5px; }
            .card-info p { font-size: 0.85rem; color: #64748b; font-weight: 600; text-transform: uppercase; }
            .card-icon { width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; }
            
            .bg-total { background: #e0f2fe; color: #0369a1; }
            .bg-aktif { background: #dcfce7; color: #15803d; }
            .bg-masuk { background: #fef9c3; color: #a16207; }
            .bg-keluar { background: #fee2e2; color: #b91c1c; }

            /* Layout Grid Rekapitulasi & Chart */
            .recap-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 25px; }
            .recap-box { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .recap-box h4 { margin-bottom: 15px; color: #334155; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; display: flex; align-items: center; gap: 8px;}
            
            .recap-content { display: flex; flex-direction: column; gap: 20px; }
            @media(min-width: 768px) { .recap-content { flex-direction: row; align-items: center; } }
            
            .chart-wrapper { flex: 1; max-width: 200px; margin: 0 auto; }
            .table-wrapper { flex: 1.5; width: 100%; overflow-x: auto; }
            .chart-bar-wrapper { width: 100%; height: 300px; margin-bottom: 20px;}
            
            .recap-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
            .recap-table th, .recap-table td { padding: 8px 10px; text-align: left; border-bottom: 1px solid #f1f5f9; }
            .recap-table th { background: #f8fafc; color: #475569; font-weight: 600; }
            .recap-table tr:hover { background: #f8fafc; }
            
            .badge-warn { background: #fff7ed; color: #c2410c; padding: 2px 6px; border-radius: 4px; font-weight: 600; font-size: 0.75rem; border: 1px solid #ffedd5; }
            .percent { font-weight: 600; color: #3b82f6; }
        </style>

        <div class="card-grid">
            <div class="card"><div class="card-info"><h3 id="dash_total">-</h3><p>Total Pegawai</p></div><div class="card-icon bg-total"><i class="fas fa-users"></i></div></div>
            <div class="card"><div class="card-info"><h3 id="dash_aktif">-</h3><p>Pegawai Aktif</p></div><div class="card-icon bg-aktif"><i class="fas fa-user-check"></i></div></div>
            <div class="card"><div class="card-info"><h3 id="dash_masuk">-</h3><p>Pegawai Masuk</p></div><div class="card-icon bg-masuk"><i class="fas fa-door-open"></i></div></div>
            <div class="card"><div class="card-info"><h3 id="dash_keluar">-</h3><p>Pegawai Keluar</p></div><div class="card-icon bg-keluar"><i class="fas fa-door-closed"></i></div></div>
        </div>

        <div class="recap-grid">
            
            <div class="recap-box">
                <h4><i class="fas fa-pray" style="color:#3b82f6;"></i> Rekapitulasi Agama</h4>
                <div class="recap-content">
                    <div class="chart-wrapper"><canvas id="chart_agama"></canvas></div>
                    <div class="table-wrapper">
                        <table class="recap-table">
                            <thead><tr><th>Agama</th><th>Jml</th><th>%</th></tr></thead>
                            <tbody id="recap_agama"><tr><td colspan="3">Menghitung...</td></tr></tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="recap-box">
                <h4><i class="fas fa-venus-mars" style="color:#ec4899;"></i> Jenis Kelamin</h4>
                <div class="recap-content">
                    <div class="chart-wrapper"><canvas id="chart_gender"></canvas></div>
                    <div class="table-wrapper">
                        <table class="recap-table">
                            <thead><tr><th>Jenis Kelamin</th><th>Jml</th><th>%</th></tr></thead>
                            <tbody id="recap_gender"><tr><td colspan="3">Menghitung...</td></tr></tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="recap-box">
                <h4><i class="fas fa-id-badge" style="color:#10b981;"></i> Kelompok Pegawai</h4>
                <div class="recap-content">
                    <div class="chart-wrapper"><canvas id="chart_kelp_pegawai"></canvas></div>
                    <div class="table-wrapper">
                        <table class="recap-table">
                            <thead><tr><th>Kelompok</th><th>Jml</th><th>%</th></tr></thead>
                            <tbody id="recap_kelp_pegawai"><tr><td colspan="3">Menghitung...</td></tr></tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="recap-box">
                <h4><i class="fas fa-briefcase" style="color:#f59e0b;"></i> Kelompok Jabatan</h4>
                <div class="recap-content">
                    <div class="chart-wrapper"><canvas id="chart_kelp_jabatan"></canvas></div>
                    <div class="table-wrapper">
                        <table class="recap-table">
                            <thead><tr><th>Jabatan</th><th>Jml</th><th>%</th></tr></thead>
                            <tbody id="recap_kelp_jabatan"><tr><td colspan="3">Menghitung...</td></tr></tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="recap-box" style="grid-column: span 2;">
                <h4><i class="fas fa-hospital-user" style="color:#0ea5e9;"></i> Penempatan Ruangan</h4>
                <div style="display: flex; flex-direction: column;">
                    <div class="chart-bar-wrapper"><canvas id="chart_ruangan"></canvas></div>
                    <div class="table-wrapper">
                        <table class="recap-table">
                            <thead><tr><th>Nama Ruangan / Unit</th><th>Jumlah Pegawai</th><th>Persentase</th></tr></thead>
                            <tbody id="recap_ruangan"><tr><td colspan="3">Menghitung...</td></tr></tbody>
                        </table>
                    </div>
                </div>
            </div>

        </div>
    `;

    initDashboardLogic();
}

async function initDashboardLogic() {
    const [resPegawai, resMasuk] = await Promise.all([
        supabase.from('pegawai').select('status, agama, jenis_kelamin, kelompok_pegawai, kelompok_jabatan, ruangan'),
        supabase.from('pegawai_masuk').select('id_masuk', { count: 'exact' })
    ]);

    if (resPegawai.error) return console.error(resPegawai.error.message);

    const pegawaiData = resPegawai.data;
    const totalPegawaiMasuk = resMasuk.count || 0;
    const totalPegawai = pegawaiData.length;

    // Kartu Atas
    document.getElementById('dash_total').innerText = totalPegawai;
    document.getElementById('dash_aktif').innerText = pegawaiData.filter(p => p.status === 'Aktif').length;
    document.getElementById('dash_masuk').innerText = totalPegawaiMasuk;
    document.getElementById('dash_keluar').innerText = pegawaiData.filter(p => ['Mutasi', 'Pensiun', 'Resign', 'Meninggal'].includes(p.status)).length;

    // Palet Warna untuk Diagram
    const colors = ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444', '#14b8a6', '#f97316', '#64748b'];

    // 1. Agama (Pie)
    const listAgama = ['Islam', 'Kristen', 'Budha', 'Hindu', 'Konghucu', 'Kepercayaan Lainnya'];
    prosesDanRender(pegawaiData, 'agama', listAgama, 'recap_agama', 'chart_agama', 'pie', colors);

    // 2. Jenis Kelamin (Doughnut)
    const listGender = ['Laki-laki', 'Perempuan'];
    prosesDanRender(pegawaiData, 'jenis_kelamin', listGender, 'recap_gender', 'chart_gender', 'doughnut', ['#3b82f6', '#ec4899', '#64748b']);

    // 3. Kelompok Pegawai (Pie)
    const listKelompok = ['ASN', 'APBD', 'BLUD', 'Konsultan', 'Magang'];
    prosesDanRender(pegawaiData, 'kelompok_pegawai', listKelompok, 'recap_kelp_pegawai', 'chart_kelp_pegawai', 'pie', colors);

    // 4. Kelompok Jabatan (Doughnut)
    const listJabatan = ['Management', 'Tenaga Medis', 'Tenaga Kesehatan', 'Tenaga Penunjang Medis', 'Tenaga Administrasi', 'Tenaga Non Administrasi'];
    prosesDanRender(pegawaiData, 'kelompok_jabatan', listJabatan, 'recap_kelp_jabatan', 'chart_kelp_jabatan', 'doughnut', colors);

    // 5. Ruangan (Bar Chart Dinamis)
    prosesRuanganDinamis(pegawaiData, 'recap_ruangan', 'chart_ruangan', colors);
}

// FUNGSI UTAMA: Menghitung Data, Mengisi Tabel, dan Menggambar Diagram
function prosesDanRender(data, keyDb, listResmi, idTabel, idChart, chartType, colorPalette) {
    const totalData = data.length || 1; 
    const counts = {};
    
    listResmi.forEach(item => counts[item] = 0);
    counts['Belum Mengisi'] = 0;

    data.forEach(p => {
        const val = p[keyDb];
        if (!val || val.trim() === "") counts['Belum Mengisi']++;
        else if (counts[val] !== undefined) counts[val]++;
        else {
            if (!counts[val]) counts[val] = 0;
            counts[val]++;
        }
    });

    let htmlTabel = '';
    let chartLabels = [];
    let chartData = [];
    let chartBgColors = [];
    
    let colorIndex = 0;

    // Susun baris tabel dan data untuk diagram (Kecuali yang kosong)
    Object.keys(counts).forEach(k => {
        if (k !== 'Belum Mengisi') {
            const jml = counts[k];
            const persen = ((jml / totalData) * 100).toFixed(1);
            
            htmlTabel += `<tr><td>${k}</td><td><strong>${jml}</strong></td><td class="percent">${persen}%</td></tr>`;
            
            // Masukkan ke data grafik hanya jika jumlahnya > 0 agar grafik terlihat rapi
            if (jml > 0) {
                chartLabels.push(k);
                chartData.push(jml);
                chartBgColors.push(colorPalette[colorIndex % colorPalette.length]);
                colorIndex++;
            }
        }
    });

    // Tambahkan baris "Belum Mengisi" di akhir tabel
    const jmlKosong = counts['Belum Mengisi'];
    const persenKosong = ((jmlKosong / totalData) * 100).toFixed(1);
    htmlTabel += `<tr>
        <td><span class="badge-warn">Belum Mengisi Data</span></td>
        <td><span style="color:#c2410c; font-weight:700;">${jmlKosong}</span></td>
        <td style="color:#c2410c; font-weight:700;">${persenKosong}%</td>
    </tr>`;
    document.getElementById(idTabel).innerHTML = htmlTabel;

    // Render Diagram menggunakan Chart.js
    const ctx = document.getElementById(idChart).getContext('2d');
    const newChart = new Chart(ctx, {
        type: chartType,
        data: {
            labels: chartLabels,
            datasets: [{ data: chartData, backgroundColor: chartBgColors, borderWidth: 1 }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } }
            }
        }
    });
    chartInstances.push(newChart); // Simpan instance
}

// FUNGSI KHUSUS: Untuk Ruangan (Karena datanya dinamis dan butuh Bar Chart)
function prosesRuanganDinamis(data, idTabel, idChart, colorPalette) {
    const totalData = data.length || 1;
    const counts = {};
    let belumMengisiCount = 0;

    data.forEach(p => {
        const ruangan = p.ruangan;
        if (!ruangan || ruangan.trim() === "") {
            belumMengisiCount++;
        } else {
            const cleanKey = ruangan.trim();
            counts[cleanKey] = (counts[cleanKey] || 0) + 1;
        }
    });

    const sortedRuangan = Object.keys(counts).sort();
    let htmlTabel = '';
    let chartLabels = [];
    let chartData = [];

    if (sortedRuangan.length === 0 && belumMengisiCount === 0) {
        document.getElementById(idTabel).innerHTML = `<tr><td colspan="3" style="text-align:center;">Tidak ada data.</td></tr>`;
        return;
    }

    sortedRuangan.forEach(r => {
        const jml = counts[r];
        const persen = ((jml / totalData) * 100).toFixed(1);
        htmlTabel += `<tr><td>${r}</td><td><strong>${jml}</strong></td><td class="percent">${persen}%</td></tr>`;
        
        chartLabels.push(r);
        chartData.push(jml);
    });

    const persenKosong = ((belumMengisiCount / totalData) * 100).toFixed(1);
    htmlTabel += `<tr>
        <td><span class="badge-warn">Belum Mengisi Ruangan</span></td>
        <td><span style="color:#c2410c; font-weight:700;">${belumMengisiCount}</span></td>
        <td style="color:#c2410c; font-weight:700;">${persenKosong}%</td>
    </tr>`;
    document.getElementById(idTabel).innerHTML = htmlTabel;

    // Render Bar Chart
    const ctx = document.getElementById(idChart).getContext('2d');
    const newChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartLabels,
            datasets: [{
                label: 'Jumlah Pegawai',
                data: chartData,
                backgroundColor: colorPalette[0], // Gunakan satu warna biru untuk semua bar
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }, // Sembunyikan legend untuk Bar chart agar tidak penuh
            scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } // Hilangkan angka desimal di sumbu Y
        }
    });
    chartInstances.push(newChart);
}
