import { supabase } from './koneksi.js';
import Papa from 'https://cdn.jsdelivr.net/npm/papaparse@5.4.1/+esm';

// Tambahkan parameter userRole untuk mengecek hak akses
export function renderPegawai(container, userRole = 'user') {
    container.innerHTML = `
        <style>
            .btn { padding: 8px 15px; border: none; border-radius: 4px; cursor: pointer; color: white; font-weight: 600; display: inline-flex; align-items: center; gap: 5px; }
            .btn-edit { background: #f59e0b; padding: 6px 10px; font-size: 0.85rem;}
            .btn-hapus { background: #ef4444; padding: 6px 10px; font-size: 0.85rem;}
            .btn-detail { background: #0ea5e9; padding: 6px 10px; font-size: 0.85rem; margin-right: 5px;}
            .btn-tambah { background: #10b981; }
            .btn-import { background: #0284c7; }
            
            /* Warna tombol Export baru */
            .btn-excel { background: #16a34a; }
            .btn-pdf { background: #dc2626; }
            
            table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; font-size: 0.9rem;}
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
            th { background: #f8fafc; }
            
            .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .filter-group { display: flex; gap: 10px; flex: 1; }
            .filter-group input, .filter-group select { padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 4px; outline: none; }
            .filter-group input { width: 250px; }
            
            .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); align-items: center; justify-content: center; z-index: 100;}
            .modal-content { background: white; padding: 25px; border-radius: 8px; width: 800px; max-height: 90vh; overflow-y: auto; }
            
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;}
            .form-group label { display: block; font-weight: 600; font-size: 0.85rem; color: #475569; margin-bottom: 4px;}
            .form-group input, .form-group select { width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; outline: none;}
            .form-group input:focus, .form-group select:focus { border-color: #3b82f6; }
            .form-group input[readonly] { background: #f1f5f9; cursor: not-allowed; }
            
            fieldset { border: 1px solid #e2e8f0; padding: 15px; border-radius: 6px; margin-bottom: 15px; background: #fafafa;}
            legend { font-weight: bold; background: #3b82f6; color: white; padding: 4px 10px; border-radius: 4px; font-size: 0.9rem;}

            .detail-item { border-bottom: 1px dashed #e2e8f0; padding: 8px 0; display: flex; flex-direction: column;}
            .detail-label { font-size: 0.75rem; color: #64748b; font-weight: 600; text-transform: uppercase;}
            .detail-value { font-size: 0.95rem; color: #1e293b; font-weight: 500; margin-top: 3px;}
        </style>

        <div class="toolbar">
            <div class="filter-group">
                <input type="text" id="inputCari" placeholder="🔍 Cari NIK atau Nama...">
                <select id="filterStatus">
                    <option value="">Semua Status Pegawai</option>
                </select>
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="btn btn-excel" id="btnExportExcel" style="display: none;"><i class="fas fa-file-excel"></i> Excel</button>
                <button class="btn btn-pdf" id="btnExportPDF" style="display: none;"><i class="fas fa-file-pdf"></i> PDF</button>
                
                <button class="btn btn-import" id="btnTriggerImport"><i class="fas fa-file-import"></i> Import CSV</button>
                <input type="file" id="inputCSV" accept=".csv" style="display: none;">
                <button class="btn btn-tambah" id="btnTambahBaru"><i class="fas fa-plus"></i> Tambah Pegawai</button>
            </div>
        </div>

        <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <table>
                <thead><tr><th>NIK/NIP</th><th>Nama</th><th>Jabatan</th><th>Ruangan</th><th>Status</th><th>Aksi</th></tr></thead>
                <tbody id="tabelMaster"><tr><td colspan="6" style="text-align:center;">Memuat data...</td></tr></tbody>
            </table>
        </div>

        <div class="modal" id="modalFormPegawai">
            <div class="modal-content">
                <h3 id="modalTitle" style="margin-bottom: 15px; border-bottom: 1px solid #ccc; padding-bottom:10px;">Form Pegawai</h3>
                <form id="formPegawai">
                    <input type="hidden" name="id_pegawai" id="form_id_pegawai">
                    <div style="text-align: right; margin-top: 15px;">
                        <button type="button" class="btn" style="background:#94a3b8;" id="btnTutupModal">Batal</button>
                        <button type="submit" class="btn" style="background:#3b82f6;" id="btnSimpanData"><i class="fas fa-save"></i> Simpan Data</button>
                    </div>
                </form>
            </div>
        </div>

        <div class="modal" id="modalDetailPegawai">
            <div class="modal-content">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid #ccc; padding-bottom:10px; margin-bottom: 20px;">
                    <h3 style="margin:0;"><i class="fas fa-id-card" style="color:#0ea5e9;"></i> Detail Informasi Pegawai</h3>
                    <button class="btn" style="background:#ef4444; padding: 5px 10px;" id="btnTutupDetail"><i class="fas fa-times"></i></button>
                </div>
                <div id="kontenDetail" class="grid-2" style="grid-template-columns: 1fr 1fr 1fr;"></div>
            </div>
        </div>
    `;

    // Kirim userRole ke dalam inisialisasi logika
    initLogikaPegawai(userRole);
}

function initLogikaPegawai(userRole) {
    const tbody = document.getElementById('tabelMaster');
    const inputCari = document.getElementById('inputCari');
    const filterStatus = document.getElementById('filterStatus');
    const btnExportExcel = document.getElementById('btnExportExcel');
    const btnExportPDF = document.getElementById('btnExportPDF');
    
    let currentData = [];

    // --- LOGIKA ROLE UNTUK TOMBOL EXPORT ---
    // Jika role adalah superadmin atau admin, tampilkan tombol
    if (userRole === 'superadmin' || userRole === 'admin') {
        btnExportExcel.style.display = 'inline-flex';
        btnExportPDF.style.display = 'inline-flex';
    }

    // --- FUNGSI EXPORT KE EXCEL ---
    btnExportExcel.addEventListener('click', () => {
        if (currentData.length === 0) return alert("Tidak ada data untuk diexport!");
        
        // Buat Worksheet baru dari data JSON (currentData)
        const worksheet = XLSX.utils.json_to_sheet(currentData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data Pegawai");
        
        // Buat file dan download
        XLSX.writeFile(workbook, `Data_Pegawai_${new Date().toISOString().split('T')[0]}.xlsx`);
    });

    // --- FUNGSI EXPORT KE PDF ---
    btnExportPDF.addEventListener('click', () => {
        if (currentData.length === 0) return alert("Tidak ada data untuk diexport!");
        
        // Panggil jsPDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('landscape'); // Menggunakan format lanskap agar muat banyak kolom

        doc.text("Laporan Data Pegawai", 14, 15);

        // Tentukan kolom mana saja yang ingin dimasukkan ke PDF (agar tidak terlalu penuh)
        const tableColumn = ["NIK", "NIP", "Nama", "Kelompok Pegawai", "Jabatan", "Ruangan", "Status"];
        const tableRows = [];

        currentData.forEach(pegawai => {
            const pegawaiData = [
                pegawai.nik || '-',
                pegawai.nip || '-',
                pegawai.nama || '-',
                pegawai.kelompok_pegawai || '-',
                pegawai.jabatan || '-',
                pegawai.ruangan || '-',
                pegawai.status || '-'
            ];
            tableRows.push(pegawaiData);
        });

        // Generate tabel di PDF
        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 20,
            theme: 'grid',
            styles: { fontSize: 8 }
        });

        doc.save(`Data_Pegawai_${new Date().toISOString().split('T')[0]}.pdf`);
    });

    // ... (LANJUTKAN DENGAN SEMUA KODE initLogikaPegawai ANDA SEBELUMNYA DI SINI SEPERTI LOGIKA FORM, HITUNG NIP, LOAD DATA, DSB) ...
    // Pastikan membiarkan fungsi loadData(), renderTabel(), dll utuh seperti aslinya.
}
