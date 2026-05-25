import { supabase } from './koneksi.js';
// Import Library untuk Export Excel dan PDF
import * as XLSX from 'https://cdn.sheetjs.com/xlsx-0.19.3/package/xlsx.mjs';
import { jsPDF } from 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/+esm';
import autoTable from 'https://cdn.jsdelivr.net/npm/jspdf-autotable@3.5.31/+esm';

export function renderPegawaiMasuk(container) {
    container.innerHTML = `
        <style>
            .btn { padding: 8px 12px; border: none; border-radius: 4px; cursor: pointer; color: white; font-weight: 600; display: inline-flex; align-items: center; gap: 5px; }
            .btn-edit { background: #f59e0b; margin-right: 5px; font-size: 0.8rem; padding: 6px 10px;}
            .btn-hapus { background: #ef4444; font-size: 0.8rem; padding: 6px 10px;}
            .btn-submit { padding: 12px 20px; background: #3b82f6; color: white; border: none; border-radius: 4px; font-weight: 600; cursor: pointer; width: 100%;}
            
            .btn-excel { background: #10b981; }
            .btn-pdf { background: #ef4444; }

            .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .search-box { padding: 8px 15px; border: 1px solid #cbd5e1; border-radius: 4px; outline: none; width: 300px; }
            .search-box:focus { border-color: #3b82f6; }

            .form-box { background: white; padding: 25px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 20px; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
            .form-group { margin-bottom: 15px; }
            .form-group label { display: block; font-weight: 600; margin-bottom: 5px; font-size: 0.9rem; color: #475569; }
            .form-group input, .form-group select { width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 4px; outline: none; }
            .form-group input:focus, .form-group select:focus { border-color: #3b82f6; }
            
            .table-container { background: white; padding: 20px; border-radius: 8px; overflow-x: auto; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
            th { background: #f8fafc; color: #475569; }
            
            .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); align-items: center; justify-content: center; z-index: 100; }
            .modal-content { background: white; padding: 25px; border-radius: 8px; width: 600px; max-height: 90vh; overflow-y: auto; }
        </style>

        <div class="form-box">
            <h2 style="margin-bottom: 20px;"><i class="fas fa-user-plus"></i> Form Pegawai Masuk</h2>
            <form id="formMasuk">
                <div class="grid-2">
                    <div class="form-group"><label>NIK</label><input type="text" name="nik" required autocomplete="off"></div>
                    <div class="form-group"><label>Nama Lengkap</label><input type="text" name="nama" required autocomplete="off"></div>
                    <div class="form-group">
                        <label>Jenis Kelamin</label>
                        <select name="jenis_kelamin" required>
                            <option value="" hidden>Pilih...</option>
                            <option value="Laki-laki">Laki-laki</option>
                            <option value="Perempuan">Perempuan</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Agama</label>
                        <select name="agama">
                            <option value="" hidden>Pilih...</option>
                            <option value="Islam">Islam</option>
                            <option value="Kristen">Kristen</option>
                            <option value="Budha">Budha</option>
                            <option value="Hindu">Hindu</option>
                            <option value="Konghucu">Konghucu</option>
                            <option value="Kepercayaan Lainnya">Kepercayaan Lainnya</option>
                        </select>
                    </div>
                    <div class="form-group"><label>Bagian</label><input type="text" name="bagian" required autocomplete="off"></div>
                    <div class="form-group"><label>Pendidikan</label><input type="text" name="pendidikan" placeholder="Contoh: S1 Keperawatan" autocomplete="off"></div>
                    <div class="form-group"><label>TMT Masuk</label><input type="date" name="tmt_masuk" id="ins_tmt_masuk" required></div>
                </div>
                <div style="display:flex; justify-content:flex-end;">
                    <button type="submit" class="btn-submit" id="btnSimpanMasuk" style="width:auto;"><i class="fas fa-save"></i> Simpan Data Masuk</button>
                </div>
            </form>
        </div>

        <div class="toolbar">
            <input type="text" id="inputCariMasuk" class="search-box" placeholder="🔍 Cari berdasarkan NIK atau Nama...">
            <div style="display:flex; gap:10px;">
                <button class="btn btn-excel" id="btnExportExcel"><i class="fas fa-file-excel"></i> Download Excel</button>
                <button class="btn btn-pdf" id="btnExportPDF"><i class="fas fa-file-pdf"></i> Download PDF</button>
            </div>
        </div>

        <div class="table-container">
            <h3 style="margin-bottom: 15px; color: #1e293b;">Histori Pegawai Masuk</h3>
            <table>
                <thead>
                    <tr>
                        <th>NIK</th>
                        <th>Nama</th>
                        <th>Bagian</th>
                        <th>Pendidikan</th>
                        <th>TMT Masuk</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody id="tabelMasuk"><tr><td colspan="6" style="text-align:center;">Memuat data...</td></tr></tbody>
            </table>
        </div>

        <div class="modal" id="modalEditMasuk">
            <div class="modal-content">
                <h3 style="margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Edit Data Pegawai Masuk</h3>
                <form id="formEditMasuk">
                    <input type="hidden" name="id_masuk" id="edit_id_masuk">
                    <div class="grid-2">
                        <div class="form-group"><label>NIK</label><input type="text" name="nik" id="edit_nik" required></div>
                        <div class="form-group"><label>Nama Lengkap</label><input type="text" name="nama" id="edit_nama" required></div>
                        <div class="form-group">
                            <label>Jenis Kelamin</label>
                            <select name="jenis_kelamin" id="edit_jenis_kelamin" required>
                                <option value="Laki-laki">Laki-laki</option>
                                <option value="Perempuan">Perempuan</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Agama</label>
                            <select name="agama" id="edit_agama">
                                <option value="Islam">Islam</option>
                                <option value="Kristen">Kristen</option>
                                <option value="Budha">Budha</option>
                                <option value="Hindu">Hindu</option>
                                <option value="Konghucu">Konghucu</option>
                                <option value="Kepercayaan Lainnya">Kepercayaan Lainnya</option>
                            </select>
                        </div>
                        <div class="form-group"><label>Bagian</label><input type="text" name="bagian" id="edit_bagian" required></div>
                        <div class="form-group"><label>Pendidikan</label><input type="text" name="pendidikan" id="edit_pendidikan"></div>
                        <div class="form-group"><label>TMT Masuk</label><input type="date" name="tmt_masuk" id="edit_tmt_masuk" required></div>
                    </div>
                    <div style="text-align: right; margin-top: 15px;">
                        <button type="button" class="btn" style="background:#94a3b8;" id="btnTutupEditMasuk">Batal</button>
                        <button type="submit" class="btn" style="background:#3b82f6;" id="btnUpdateMasuk"><i class="fas fa-save"></i> Update</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    initLogikaMasuk();
}

function initLogikaMasuk() {
    const formInsert = document.getElementById('formMasuk');
    const formEdit = document.getElementById('formEditMasuk');
    const tbody = document.getElementById('tabelMasuk');
    const modal = document.getElementById('modalEditMasuk');
    const inputCariMasuk = document.getElementById('inputCariMasuk');
    
    let listDataMasuk = [];
    let currentFilteredData = []; // Menyimpan data yang sedang terfilter untuk diexport

    document.getElementById('ins_tmt_masuk').value = new Date().toISOString().split('T')[0];

    // --- 1. AMBIL DATA (Diurutkan dari Terlama ke Terbaru) ---
    async function loadData() {
        // ascending: true membuat data terlama (tahun kecil) berada di atas
        const { data, error } = await supabase
            .from('pegawai_masuk')
            .select('*')
            .order('tmt_masuk', { ascending: true }); 

        if (error) {
            tbody.innerHTML = `<tr><td colspan="6" style="color:red;">Error: ${error.message}</td></tr>`;
            return;
        }
        
        listDataMasuk = data;
        currentFilteredData = data; 
        renderTabel(currentFilteredData);
    }

    // --- 2. RENDER TABEL ---
    function renderTabel(data) {
        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Tidak ada data ditemukan.</td></tr>`;
            return;
        }

        tbody.innerHTML = data.map(row => `
            <tr>
                <td>${row.nik || '-'}</td>
                <td>${row.nama || '-'}</td>
                <td>${row.bagian || '-'}</td>
                <td>${row.pendidikan || '-'}</td>
                <td>${row.tmt_masuk || '-'}</td>
                <td>
                    <button class="btn btn-edit" onclick="bukaEditMasuk('${row.id_masuk}')" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-hapus" onclick="hapusDataMasuk('${row.id_masuk}')" title="Hapus"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    }

    // --- 3. FITUR PENCARIAN ---
    inputCariMasuk.addEventListener('input', () => {
        const keyword = inputCariMasuk.value.toLowerCase();
        currentFilteredData = listDataMasuk.filter(p => {
            return (p.nama && p.nama.toLowerCase().includes(keyword)) || 
                   (p.nik && p.nik.toLowerCase().includes(keyword));
        });
        renderTabel(currentFilteredData);
    });

    // --- 4. FITUR EXPORT EXCEL ---
    document.getElementById('btnExportExcel').addEventListener('click', () => {
        if(currentFilteredData.length === 0) return alert("Tidak ada data untuk di-download.");
        
        // Memilih kolom spesifik yang mau diexport dan merapikan judul kolomnya
        const dataUntukExcel = currentFilteredData.map(row => ({
            "NIK": row.nik,
            "Nama Lengkap": row.nama,
            "Jenis Kelamin": row.jenis_kelamin,
            "Agama": row.agama,
            "Bagian": row.bagian,
            "Pendidikan": row.pendidikan,
            "TMT Masuk": row.tmt_masuk
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataUntukExcel);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data Masuk");
        XLSX.writeFile(workbook, "Laporan_Pegawai_Masuk.xlsx");
    });

    // --- 5. FITUR EXPORT PDF ---
    document.getElementById('btnExportPDF').addEventListener('click', () => {
        if(currentFilteredData.length === 0) return alert("Tidak ada data untuk di-download.");
        
        const doc = new jsPDF();
        
        // Judul Laporan
        doc.setFontSize(16);
        doc.text("Laporan Histori Pegawai Masuk", 14, 15);
        doc.setFontSize(10);
        doc.text("Dicetak pada: " + new Date().toLocaleDateString('id-ID'), 14, 22);

        // Menyiapkan data array 2D untuk autoTable
        const tableBody = currentFilteredData.map(row => [
            row.nik, 
            row.nama, 
            row.bagian, 
            row.pendidikan, 
            row.tmt_masuk
        ]);

        autoTable(doc, {
            head: [['NIK', 'Nama Lengkap', 'Bagian/Unit', 'Pendidikan', 'TMT Masuk']],
            body: tableBody,
            startY: 28,
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246] } // Warna biru (sesuai tema UI)
        });

        doc.save("Laporan_Pegawai_Masuk.pdf");
    });

    // --- 6. AKSI CRUD ---
    formInsert.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btnSimpanMasuk');
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Menyimpan...`;
        
        const dataObj = Object.fromEntries(new FormData(formInsert).entries());
        const { error } = await supabase.from('pegawai_masuk').insert([dataObj]);

        if (error) alert('Gagal menyimpan: ' + error.message);
        else {
            formInsert.reset();
            document.getElementById('ins_tmt_masuk').value = new Date().toISOString().split('T')[0];
            loadData();
        }
        btn.innerHTML = `<i class="fas fa-save"></i> Simpan Data Masuk`;
    });

    window.bukaEditMasuk = (id) => {
        const item = listDataMasuk.find(p => p.id_masuk == id);
        if (!item) return;
        Object.keys(item).forEach(key => {
            const inputElement = document.getElementById(`edit_${key}`);
            if (inputElement) inputElement.value = item[key] || '';
        });
        modal.style.display = 'flex';
    };

    document.getElementById('btnTutupEditMasuk').onclick = () => modal.style.display = 'none';

    formEdit.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btnUpdate = document.getElementById('btnUpdateMasuk');
        btnUpdate.innerText = "Mengubah...";

        const dataObj = Object.fromEntries(new FormData(formEdit).entries());
        const id_masuk = dataObj.id_masuk;
        delete dataObj.id_masuk; 

        const { error } = await supabase.from('pegawai_masuk').update(dataObj).eq('id_masuk', id_masuk);

        if (error) alert('Gagal memperbarui data: ' + error.message);
        else {
            modal.style.display = 'none';
            loadData();
        }
        btnUpdate.innerHTML = `<i class="fas fa-save"></i> Update`;
    });

    window.hapusDataMasuk = async (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
            const { error } = await supabase.from('pegawai_masuk').delete().eq('id_masuk', id);
            if (error) alert('Gagal menghapus: ' + error.message);
            else loadData();
        }
    };

    // Jalankan pemuatan data awal
    loadData();
}
