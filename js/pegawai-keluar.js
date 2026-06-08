import { supabase } from './koneksi.js';
import Papa from 'https://cdn.jsdelivr.net/npm/papaparse@5.4.1/+esm';
import * as XLSX from 'https://cdn.sheetjs.com/xlsx-0.19.3/package/xlsx.mjs';
import { jsPDF } from 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/+esm';
import autoTable from 'https://cdn.jsdelivr.net/npm/jspdf-autotable@3.5.31/+esm';

export function renderPegawaiKeluar(container) {
    container.innerHTML = `
        <style>
            .btn { padding: 8px 12px; border: none; border-radius: 4px; cursor: pointer; color: white; font-weight: 600; display: inline-flex; align-items: center; gap: 5px; }
            .btn-edit { background: #f59e0b; margin-right: 5px; font-size: 0.8rem; padding: 6px 10px;}
            .btn-hapus { background: #ef4444; font-size: 0.8rem; padding: 6px 10px;}
            .btn-submit { padding: 12px 20px; background: #3b82f6; color: white; border: none; border-radius: 4px; font-weight: 600; cursor: pointer; }
            
            .btn-toggle { background: #64748b; font-size: 0.85rem; padding: 6px 12px; }
            .btn-toggle:hover { background: #475569; }
            .btn-excel { background: #10b981; }
            .btn-pdf { background: #ef4444; }
            .btn-import { background: #0284c7; }

            .form-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; }
            .form-box { background: white; padding: 25px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 20px; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
            .form-group { margin-bottom: 15px; }
            .form-group label { display: block; font-weight: 600; margin-bottom: 5px; font-size: 0.9rem; color: #475569; }
            .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 4px; outline: none; font-family: inherit;}
            .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #3b82f6; }
            
            .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .search-box { padding: 8px 15px; border: 1px solid #cbd5e1; border-radius: 4px; outline: none; width: 300px; }

            .table-container { background: white; padding: 20px; border-radius: 8px; overflow-x: auto; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
            th { background: #f8fafc; color: #475569; }
            
            .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); align-items: center; justify-content: center; z-index: 100; }
            .modal-content { background: white; padding: 25px; border-radius: 8px; width: 600px; max-height: 90vh; overflow-y: auto; }
            
            .badge { padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; color: white; }
            .badge-pensiun { background: #64748b; }
            .badge-mutasi { background: #f59e0b; }
            .badge-resign { background: #ef4444; }
            .badge-meninggal { background: #1e293b; }
            .badge-lainnya { background: #0ea5e9; }
        </style>

        <div class="form-box" id="boxFormKeluar">
            <div class="form-header">
                <h2 style="margin:0; color:#1e293b;"><i class="fas fa-sign-out-alt"></i> Form Input Pegawai Keluar</h2>
                <button class="btn btn-toggle" id="btnSembunyikanFormKeluar"><i class="fas fa-eye-slash"></i> Sembunyikan Form</button>
            </div>
            
            <form id="formKeluar">
                <div class="grid-2">
                    <div class="form-group"><label>NIK</label><input type="text" name="nik" required autocomplete="off"></div>
                    <div class="form-group"><label>Nama Lengkap</label><input type="text" name="nama" required autocomplete="off"></div>
                    <div class="form-group"><label>Bagian</label><input type="text" name="bagian" required autocomplete="off"></div>
                    <div class="form-group"><label>Unit Tugas</label><input type="text" name="unit_tugas" required autocomplete="off"></div>
                    
                    <div class="form-group"><label>TMT Keluar</label><input type="date" name="tmt_keluar" id="ins_tmt_keluar" required></div>
                    <div class="form-group">
                        <label>Jenis Keluar</label>
                        <select name="jenis_keluar" required>
                            <option value="" hidden>Pilih...</option>
                            <option value="Pensiun">Pensiun</option>
                            <option value="Mutasi">Mutasi</option>
                            <option value="Resign">Resign</option>
                            <option value="Meninggal">Meninggal</option>
                            <option value="Lainnya">Lainnya</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Keterangan</label>
                    <textarea name="keterangan" rows="3" placeholder="Tambahkan catatan jika diperlukan..."></textarea>
                </div>
                <div style="display:flex; justify-content:flex-end;">
                    <button type="submit" class="btn btn-submit" id="btnSimpanKeluar"><i class="fas fa-save"></i> Simpan Data Keluar</button>
                </div>
            </form>
        </div>

        <div id="boxShowFormKeluar" style="display:none; margin-bottom: 20px;">
            <button class="btn btn-toggle" style="background:#3b82f6;" id="btnTampilkanFormKeluar"><i class="fas fa-eye"></i> Tampilkan Form Input Pegawai Keluar</button>
        </div>

        <div class="toolbar">
            <input type="text" id="inputCariKeluar" class="search-box" placeholder="🔍 Cari berdasarkan NIK atau Nama...">
            <div style="display:flex; gap:10px;">
                <button class="btn btn-import" id="btnTriggerImportKeluar"><i class="fas fa-file-import"></i> Import CSV</button>
                <input type="file" id="inputCSVKeluar" accept=".csv" style="display: none;">
                
                <button class="btn btn-excel" id="btnExportExcelKeluar"><i class="fas fa-file-excel"></i> Download Excel</button>
                <button class="btn btn-pdf" id="btnExportPDFKeluar"><i class="fas fa-file-pdf"></i> Download PDF</button>
            </div>
        </div>

        <div class="table-container">
            <h3 style="margin-bottom: 15px; color: #1e293b;">Histori Pegawai Keluar</h3>
            <table>
                <thead>
                    <tr>
                        <th>NIK</th>
                        <th>Nama</th>
                        <th>Bagian / Unit Tugas</th>
                        <th>TMT Keluar</th>
                        <th>Jenis Keluar</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody id="tabelKeluar"><tr><td colspan="6" style="text-align:center;">Memuat data...</td></tr></tbody>
            </table>
        </div>

        <div class="modal" id="modalEditKeluar">
            <div class="modal-content">
                <h3 style="margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Edit Data Pegawai Keluar</h3>
                <form id="formEditKeluar">
                    <input type="hidden" name="id_keluar" id="edit_id_keluar">
                    <div class="grid-2">
                        <div class="form-group"><label>NIK</label><input type="text" name="nik" id="edit_nik" required></div>
                        <div class="form-group"><label>Nama Lengkap</label><input type="text" name="nama" id="edit_nama" required></div>
                        <div class="form-group"><label>Bagian</label><input type="text" name="bagian" id="edit_bagian" required></div>
                        <div class="form-group"><label>Unit Tugas</label><input type="text" name="unit_tugas" id="edit_unit_tugas" required></div>
                        
                        <div class="form-group"><label>TMT Keluar</label><input type="date" name="tmt_keluar" id="edit_tmt_keluar" required></div>
                        <div class="form-group">
                            <label>Jenis Keluar</label>
                            <select name="jenis_keluar" id="edit_jenis_keluar" required>
                                <option value="Pensiun">Pensiun</option>
                                <option value="Mutasi">Mutasi</option>
                                <option value="Resign">Resign</option>
                                <option value="Meninggal">Meninggal</option>
                                <option value="Lainnya">Lainnya</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Keterangan</label>
                        <textarea name="keterangan" id="edit_keterangan" rows="3"></textarea>
                    </div>
                    <div style="text-align: right; margin-top: 15px;">
                        <button type="button" class="btn" style="background:#94a3b8;" id="btnTutupEditKeluar">Batal</button>
                        <button type="submit" class="btn" style="background:#3b82f6;" id="btnUpdateKeluar"><i class="fas fa-save"></i> Update Data</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    initLogikaKeluar();
}

function initLogikaKeluar() {
    const formInsert = document.getElementById('formKeluar');
    const formEdit = document.getElementById('formEditKeluar');
    const tbody = document.getElementById('tabelKeluar');
    const modal = document.getElementById('modalEditKeluar');
    const inputCari = document.getElementById('inputCariKeluar');
    
    const boxForm = document.getElementById('boxFormKeluar');
    const boxShowForm = document.getElementById('boxShowFormKeluar');
    
    const btnTriggerImport = document.getElementById('btnTriggerImportKeluar');
    const inputCSV = document.getElementById('inputCSVKeluar');

    let listData = [];
    let currentFilteredData = [];

    document.getElementById('ins_tmt_keluar').value = new Date().toISOString().split('T')[0];

    // --- 1. FITUR TOGGLE FORM ---
    document.getElementById('btnSembunyikanFormKeluar').onclick = () => {
        boxForm.style.display = 'none';
        boxShowForm.style.display = 'block';
    };
    document.getElementById('btnTampilkanFormKeluar').onclick = () => {
        boxForm.style.display = 'block';
        boxShowForm.style.display = 'none';
    };

    // --- 2. AMBIL DATA DARI DATABASE (Urutan Terlama ke Terbaru) ---
    async function loadData() {
        const { data, error } = await supabase
            .from('pegawai_keluar')
            .select('*')
            .order('tmt_keluar', { ascending: true }); // Menggunakan ascending: true agar tahun paling lama di atas

        if (error) {
            tbody.innerHTML = `<tr><td colspan="6" style="color:red;">Error: ${error.message}</td></tr>`;
            return;
        }
        listData = data;
        currentFilteredData = data; 
        renderTabel(currentFilteredData);
    }

    // --- Helper Warna Badge Status ---
    function getBadgeClass(status) {
        switch(status) {
            case 'Pensiun': return 'badge-pensiun';
            case 'Mutasi': return 'badge-mutasi';
            case 'Resign': return 'badge-resign';
            case 'Meninggal': return 'badge-meninggal';
            default: return 'badge-lainnya';
        }
    }

    // --- 3. RENDER TABEL ---
    function renderTabel(data) {
        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Tidak ada data ditemukan.</td></tr>`;
            return;
        }
        tbody.innerHTML = data.map(row => `
            <tr>
                <td>${row.nik || '-'}</td>
                <td><strong>${row.nama || '-'}</strong></td>
                <td>${row.bagian || '-'}<br><span style="font-size:0.8rem; color:#64748b;">${row.unit_tugas || '-'}</span></td>
                <td>${row.tmt_keluar || '-'}</td>
                <td><span class="badge ${getBadgeClass(row.jenis_keluar)}">${row.jenis_keluar || '-'}</span></td>
                <td>
                    <button class="btn btn-edit" onclick="bukaEditKeluar('${row.id_keluar}')" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-hapus" onclick="hapusDataKeluar('${row.id_keluar}')" title="Hapus"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    }

    // --- 4. FITUR PENCARIAN ---
    inputCari.addEventListener('input', () => {
        const keyword = inputCari.value.toLowerCase();
        currentFilteredData = listData.filter(p => {
            return (p.nama && p.nama.toLowerCase().includes(keyword)) || 
                   (p.nik && p.nik.toLowerCase().includes(keyword));
        });
        renderTabel(currentFilteredData);
    });

    // --- 5. FITUR IMPORT CSV ---
    btnTriggerImport.onclick = () => inputCSV.click();

    inputCSV.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        btnTriggerImport.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Parsing...`;
        btnTriggerImport.disabled = true;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async function(results) {
                const sanitizedData = results.data.map(row => {
                    const cleanRow = {};
                    Object.keys(row).forEach(key => {
                        let cleanKey = key.trim().toLowerCase().replace(/\s+/g, '_');
                        let value = row[key] ? row[key].trim() : null;
                        if (value === "") value = null;
                        
                        if (cleanKey === 'id_keluar' && value === null) return;
                        cleanRow[cleanKey] = value;
                    });
                    return cleanRow;
                });

                if (sanitizedData.length === 0) {
                    alert("File CSV kosong atau format salah.");
                    resetTombolImport();
                    return;
                }

                btnTriggerImport.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Menyimpan...`;
                const { error } = await supabase.from('pegawai_keluar').insert(sanitizedData);

                if (error) alert("Gagal melakukan import massal:\n" + error.message);
                else {
                    alert(`Sukses! Berhasil mengimpor ${sanitizedData.length} data pegawai keluar.`);
                    loadData();
                }
                resetTombolImport();
            },
            error: function(err) {
                alert("Gagal membaca file CSV: " + err.message);
                resetTombolImport();
            }
        });
    });

    function resetTombolImport() {
        btnTriggerImport.innerHTML = `<i class="fas fa-file-import"></i> Import CSV`;
        btnTriggerImport.disabled = false;
        inputCSV.value = '';
    }

    // --- 6. EXPORT EXCEL ---
    document.getElementById('btnExportExcelKeluar').addEventListener('click', () => {
        if(currentFilteredData.length === 0) return alert("Tidak ada data untuk di-download.");
        const dataUntukExcel = currentFilteredData.map(row => ({
            "NIK": row.nik, "Nama Lengkap": row.nama, "Bagian": row.bagian,
            "Unit Tugas": row.unit_tugas, "TMT Keluar": row.tmt_keluar, 
            "Jenis Keluar": row.jenis_keluar, "Keterangan": row.keterangan
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataUntukExcel);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data Keluar");
        XLSX.writeFile(workbook, "Laporan_Pegawai_Keluar.xlsx");
    });

    // --- 7. EXPORT PDF ---
    document.getElementById('btnExportPDFKeluar').addEventListener('click', () => {
        if(currentFilteredData.length === 0) return alert("Tidak ada data untuk di-download.");
        const doc = new jsPDF();
        doc.setFontSize(16); doc.text("Laporan Histori Pegawai Keluar", 14, 15);
        doc.setFontSize(10); doc.text("Dicetak pada: " + new Date().toLocaleDateString('id-ID'), 14, 22);

        const tableBody = currentFilteredData.map(row => [
            row.nik, row.nama, row.bagian, row.unit_tugas, row.tmt_keluar, row.jenis_keluar
        ]);
        autoTable(doc, {
            head: [['NIK', 'Nama Lengkap', 'Bagian', 'Unit Tugas', 'TMT Keluar', 'Jenis Keluar']],
            body: tableBody, startY: 28, theme: 'grid', headStyles: { fillColor: [2, 132, 199] }
        });
        doc.save("Laporan_Pegawai_Keluar.pdf");
    });

    // --- 8. CRUD LOGIC (INSERT, EDIT, DELETE) ---
    formInsert.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btnSimpanKeluar');
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Menyimpan...`;
        
        const dataObj = Object.fromEntries(new FormData(formInsert).entries());
        const { error } = await supabase.from('pegawai_keluar').insert([dataObj]);

        if (error) alert('Gagal menyimpan: ' + error.message);
        else {
            formInsert.reset();
            document.getElementById('ins_tmt_keluar').value = new Date().toISOString().split('T')[0];
            loadData();
        }
        btn.innerHTML = `<i class="fas fa-save"></i> Simpan Data Keluar`;
    });

    window.bukaEditKeluar = (id) => {
        const item = listData.find(p => p.id_keluar == id);
        if (!item) return;
        Object.keys(item).forEach(key => {
            const inputElement = document.getElementById(`edit_${key}`);
            if (inputElement) inputElement.value = item[key] || '';
        });
        modal.style.display = 'flex';
    };

    document.getElementById('btnTutupEditKeluar').onclick = () => modal.style.display = 'none';

    formEdit.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btnUpdate = document.getElementById('btnUpdateKeluar');
        btnUpdate.innerText = "Mengubah...";

        const dataObj = Object.fromEntries(new FormData(formEdit).entries());
        const id_keluar = dataObj.id_keluar;
        delete dataObj.id_keluar; 

        const { error } = await supabase.from('pegawai_keluar').update(dataObj).eq('id_keluar', id_keluar);

        if (error) alert('Gagal memperbarui data: ' + error.message);
        else {
            modal.style.display = 'none';
            loadData();
        }
        btnUpdate.innerHTML = `<i class="fas fa-save"></i> Update Data`;
    });

    window.hapusDataKeluar = async (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus catatan pegawai keluar ini?')) {
            const { error } = await supabase.from('pegawai_keluar').delete().eq('id_keluar', id);
            if (error) alert('Gagal menghapus: ' + error.message);
            else loadData();
        }
    };

    loadData();
}
