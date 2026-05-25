import { supabase } from './koneksi.js';
import Papa from 'https://cdn.jsdelivr.net/npm/papaparse@5.4.1/+esm';
import * as XLSX from 'https://cdn.sheetjs.com/xlsx-0.19.3/package/xlsx.mjs';
import { jsPDF } from 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/+esm';
import autoTable from 'https://cdn.jsdelivr.net/npm/jspdf-autotable@3.5.31/+esm';

export function renderSTR(container) {
    container.innerHTML = `
        <style>
            .btn { padding: 8px 12px; border: none; border-radius: 4px; cursor: pointer; color: white; font-weight: 600; display: inline-flex; align-items: center; gap: 5px; }
            .btn-edit { background: #f59e0b; margin-right: 5px; font-size: 0.8rem; padding: 6px 10px;}
            .btn-hapus { background: #ef4444; font-size: 0.8rem; padding: 6px 10px;}
            .btn-submit { padding: 12px 20px; background: #3b82f6; color: white; border: none; border-radius: 4px; font-weight: 600; cursor: pointer; }
            .btn-view { background: #0ea5e9; font-size: 0.8rem; padding: 6px 10px; }
            
            .btn-toggle { background: #64748b; font-size: 0.85rem; padding: 6px 12px; }
            .btn-excel { background: #10b981; }
            .btn-pdf { background: #ef4444; }
            .btn-import { background: #0284c7; }

            .form-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; }
            .form-box { background: white; padding: 25px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 20px; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
            .form-group { margin-bottom: 15px; }
            .form-group label { display: block; font-weight: 600; margin-bottom: 5px; font-size: 0.9rem; color: #475569; }
            .form-group input { width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 4px; outline: none; }
            .form-group input:focus { border-color: #3b82f6; }
            .form-group input:disabled { background: #f1f5f9; cursor: not-allowed; }
            
            .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .search-box { padding: 8px 15px; border: 1px solid #cbd5e1; border-radius: 4px; outline: none; width: 300px; }

            .table-container { background: white; padding: 20px; border-radius: 8px; overflow-x: auto; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
            th { background: #f8fafc; color: #475569; }
            
            .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); align-items: center; justify-content: center; z-index: 100; }
            .modal-content { background: white; padding: 25px; border-radius: 8px; width: 600px; max-height: 90vh; overflow-y: auto; }
            
            .countdown-badge { padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 0.8rem; display: inline-block; }
        </style>

        <div class="form-box" id="boxFormSTR">
            <div class="form-header">
                <h2 style="margin:0; color:#1e293b;"><i class="fas fa-id-card-alt"></i> Form Input STR (Surat Tanda Registrasi)</h2>
                <button class="btn btn-toggle" id="btnSembunyikanFormSTR"><i class="fas fa-eye-slash"></i> Sembunyikan Form</button>
            </div>
            
            <form id="formSTR">
                <div class="grid-2">
                    <div class="form-group"><label>NIK</label><input type="text" name="nik" id="ins_nik_str" required autocomplete="off" placeholder="Ketik NIK..."></div>
                    <div class="form-group"><label>Nama Lengkap</label><input type="text" name="nama" id="ins_nama_str" required autocomplete="off" placeholder="Otomatis dicari..."></div>
                    <div class="form-group"><label>Bidang / Profesi</label><input type="text" name="bidang" required placeholder="Contoh: Bidan, Apoteker" autocomplete="off"></div>
                    <div class="form-group"><label>No. STR</label><input type="text" name="no_str" required autocomplete="off"></div>
                    <div class="form-group"><label>Tanggal Terbit</label><input type="date" name="tgl_terbit" required></div>
                    <div class="form-group">
                        <label>Tanggal Berakhir</label>
                        <input type="date" name="tgl_berakhir" id="ins_tgl_berakhir_str" required>
                        <label style="display:inline-flex; align-items:center; gap:5px; margin-top:8px; font-weight:normal; font-size:0.85rem;">
                            <input type="checkbox" id="chk_seumur_hidup_str"> Seumur Hidup
                        </label>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Lampiran Berkas STR (PDF)</label>
                    <input type="file" id="form_file_str" accept=".pdf">
                </div>

                <div style="display:flex; justify-content:flex-end;">
                    <button type="submit" class="btn btn-submit" id="btnSimpanSTR"><i class="fas fa-save"></i> Simpan Data STR</button>
                </div>
            </form>
        </div>

        <div id="boxShowFormSTR" style="display:none; margin-bottom: 20px;">
            <button class="btn btn-toggle" style="background:#3b82f6;" id="btnTampilkanFormSTR"><i class="fas fa-eye"></i> Tampilkan Form Input STR</button>
        </div>

        <div class="toolbar">
            <input type="text" id="inputCariSTR" class="search-box" placeholder="🔍 Cari berdasarkan NIK, Nama, No STR...">
            <div style="display:flex; gap:10px;">
                <button class="btn btn-import" id="btnTriggerImportSTR"><i class="fas fa-file-import"></i> Import CSV</button>
                <input type="file" id="inputCSVSTR" accept=".csv" style="display: none;">
                <button class="btn btn-excel" id="btnExportExcelSTR"><i class="fas fa-file-excel"></i> Excel</button>
                <button class="btn btn-pdf" id="btnExportPDFSTR"><i class="fas fa-file-pdf"></i> PDF</button>
            </div>
        </div>

        <div class="table-container">
            <h3 style="margin-bottom: 15px; color: #1e293b;">Daftar Surat Tanda Registrasi (STR)</h3>
            <table>
                <thead>
                    <tr>
                        <th>NIK</th>
                        <th>Nama</th>
                        <th>No. STR</th>
                        <th>Tanggal Berakhir</th>
                        <th>Sisa Masa Berlaku</th>
                        <th>Berkas</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody id="tabelSTR"><tr><td colspan="7" style="text-align:center;">Memuat data...</td></tr></tbody>
            </table>
        </div>

        <div class="modal" id="modalEditSTR">
            <div class="modal-content">
                <h3 style="margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Edit Data STR</h3>
                <form id="formEditSTR">
                    <input type="hidden" name="id_str" id="edit_id_str">
                    <div class="grid-2">
                        <div class="form-group"><label>NIK</label><input type="text" name="nik" id="edit_nik_str" required></div>
                        <div class="form-group"><label>Nama Lengkap</label><input type="text" name="nama" id="edit_nama_str" required></div>
                        <div class="form-group"><label>Bidang</label><input type="text" name="bidang" id="edit_bidang" required></div>
                        <div class="form-group"><label>No. STR</label><input type="text" name="no_str" id="edit_no_str" required></div>
                        <div class="form-group"><label>Tanggal Terbit</label><input type="date" name="tgl_terbit" id="edit_tgl_terbit" required></div>
                        <div class="form-group">
                            <label>Tanggal Berakhir</label>
                            <input type="date" name="tgl_berakhir" id="edit_tgl_berakhir_str">
                            <label style="display:inline-flex; align-items:center; gap:5px; margin-top:8px; font-weight:normal; font-size:0.85rem;">
                                <input type="checkbox" id="edit_chk_seumur_hidup_str"> Seumur Hidup
                            </label>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Ganti Lampiran Berkas STR Baru (PDF)</label>
                        <input type="file" id="edit_file_str" accept=".pdf">
                    </div>
                    <div style="text-align: right; margin-top: 15px;">
                        <button type="button" class="btn" style="background:#94a3b8;" id="btnTutupEditSTR">Batal</button>
                        <button type="submit" class="btn" style="background:#3b82f6;" id="btnUpdateSTR"><i class="fas fa-save"></i> Update</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    initLogikaSTR();
}

function initLogikaSTR() {
    const formInsert = document.getElementById('formSTR');
    const formEdit = document.getElementById('formEditSTR');
    const tbody = document.getElementById('tabelSTR');
    const modal = document.getElementById('modalEditSTR');
    
    const chkIns = document.getElementById('chk_seumur_hidup_str');
    const tglIns = document.getElementById('ins_tgl_berakhir_str');
    const chkEdit = document.getElementById('edit_chk_seumur_hidup_str');
    const tglEdit = document.getElementById('edit_tgl_berakhir_str');

    let listData = [];
    let filteredData = [];

    // FITUR AUTO-SEARCH NAMA BERDASARKAN NIK
    function setupAutoSearchNIK(inputNikId, inputNamaId) {
        const inputNik = document.getElementById(inputNikId);
        const inputNama = document.getElementById(inputNamaId);
        let timerId;

        inputNik.addEventListener('input', (e) => {
            clearTimeout(timerId);
            const nikValue = e.target.value.trim();

            if (nikValue.length >= 6) { // Mulai mencari jika NIK >= 6 digit
                inputNama.placeholder = "Mencari data pegawai...";
                timerId = setTimeout(async () => {
                    const { data, error } = await supabase
                        .from('pegawai')
                        .select('nama')
                        .eq('nik', nikValue)
                        .maybeSingle(); 

                    if (data && data.nama) {
                        inputNama.value = data.nama;
                    } else {
                        inputNama.placeholder = "Data tidak ditemukan. Ketik manual...";
                    }
                }, 500); 
            }
        });
    }

    setupAutoSearchNIK('ins_nik_str', 'ins_nama_str');
    setupAutoSearchNIK('edit_nik_str', 'edit_nama_str');

    // Logika Checkbox Seumur Hidup
    chkIns.addEventListener('change', () => {
        if(chkIns.checked) { tglIns.disabled = true; tglIns.value = ''; tglIns.required = false; }
        else { tglIns.disabled = false; tglIns.required = true; }
    });
    chkEdit.addEventListener('change', () => {
        if(chkEdit.checked) { tglEdit.disabled = true; tglEdit.value = ''; }
        else { tglEdit.disabled = false; }
    });

    document.getElementById('btnSembunyikanFormSTR').onclick = () => { document.getElementById('boxFormSTR').style.display = 'none'; document.getElementById('boxShowFormSTR').style.display = 'block'; };
    document.getElementById('btnTampilkanFormSTR').onclick = () => { document.getElementById('boxFormSTR').style.display = 'block'; document.getElementById('boxShowFormSTR').style.display = 'none'; };

    function hitungSisaMasaBerlaku(tglAkhirStr) {
        if (!tglAkhirStr) return { teks: 'Seumur Hidup', bg: '#dcfce7', fg: '#10b981' };
        
        const hariIni = new Date();
        const tglAkhir = new Date(tglAkhirStr);
        hariIni.setHours(0,0,0,0); tglAkhir.setHours(0,0,0,0);

        if (tglAkhir < hariIni) return { teks: 'Expired / Mati', bg: '#fee2e2', fg: '#ef4444' };

        let thn = tglAkhir.getFullYear() - hariIni.getFullYear();
        let bln = tglAkhir.getMonth() - hariIni.getMonth();
        let hri = tglAkhir.getDate() - hariIni.getDate();

        if (hri < 0) {
            bln--;
            const bulanLalu = new Date(tglAkhir.getFullYear(), tglAkhir.getMonth(), 0);
            hri += bulanLalu.getDate();
        }
        if (bln < 0) { thn--; bln += 12; }

        const totalSisaBulan = (thn * 12) + bln + (hri / 30);

        let bg = '#dcfce7', fg = '#10b981'; 
        if (totalSisaBulan <= 3) { bg = '#fee2e2'; fg = '#ef4444'; } 
        else if (totalSisaBulan <= 6) { bg = '#fef9c3'; fg = '#d97706'; }

        let teksStr = '';
        if (thn > 0) teksStr += `${thn} Tahun `;
        if (bln > 0) teksStr += `${bln} Bulan `;
        teksStr += `${hri} Hari`;
        if (teksStr === '') teksStr = '0 Hari';

        return { teks: teksStr.trim(), bg: bg, fg: fg };
    }

    async function loadData() {
        const { data, error } = await supabase.from('berkas_str').select('*').order('tgl_berakhir', { ascending: true });
        if (!error) { listData = data; filteredData = data; renderTabel(filteredData); }
    }

    function renderTabel(data) {
        if(data.length === 0) { tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Data kosong.</td></tr>`; return; }
        
        tbody.innerHTML = data.map(row => {
            const hitung = hitungSisaMasaBerlaku(row.tgl_berakhir);
            return `
                <tr>
                    <td>${row.nik || '-'}</td>
                    <td><strong>${row.nama || '-'}</strong></td>
                    <td>${row.no_str || '-'}</td>
                    <td>${row.tgl_berakhir || '-'}</td>
                    <td><span class="countdown-badge" style="background:${hitung.bg}; color:${hitung.fg};">${hitung.teks}</span></td>
                    <td>${row.lampiran_url ? `<a href="${row.lampiran_url}" target="_blank" class="btn btn-view"><i class="fas fa-file-pdf"></i> Lihat</a>` : '-'}</td>
                    <td>
                        <button class="btn btn-edit" onclick="bukaEditSTR('${row.id_str}')"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-hapus" onclick="hapusSTR('${row.id_str}')"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    document.getElementById('inputCariSTR').addEventListener('input', (e) => {
        const kw = e.target.value.toLowerCase();
        filteredData = listData.filter(p => p.nama.toLowerCase().includes(kw) || p.nik.includes(kw) || p.no_str.toLowerCase().includes(kw));
        renderTabel(filteredData);
    });

    async function uploadFile(fileInput, bucketName) {
        if (!fileInput || fileInput.files.length === 0) return null;
        const file = fileInput.files[0];
        const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        const { data, error } = await supabase.storage.from(bucketName).upload(fileName, file);
        if (error) { alert('Gagal upload berkas: ' + error.message); return null; }
        return supabase.storage.from(bucketName).getPublicUrl(fileName).data.publicUrl;
    }

    formInsert.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btnSimpanSTR');
        btn.innerText = "Menyimpan..."; btn.disabled = true;

        const url = await uploadFile(document.getElementById('form_file_str'), 'lampiran_str');
        const dataObj = Object.fromEntries(new FormData(formInsert).entries());
        
        dataObj.tgl_berakhir = chkIns.checked ? null : dataObj.tgl_berakhir;
        if(url) dataObj.lampiran_url = url;

        const { error } = await supabase.from('berkas_str').insert([dataObj]);
        if(!error) { formInsert.reset(); chkIns.checked = false; tglIns.disabled = false; loadData(); }
        btn.innerHTML = `<i class="fas fa-save"></i> Simpan Data STR`; btn.disabled = false;
    });

    window.bukaEditSTR = (id) => {
        const item = listData.find(p => p.id_str == id);
        if(!item) return;
        
        document.getElementById('edit_id_str').value = item.id_str;
        document.getElementById('edit_nik_str').value = item.nik || '';
        document.getElementById('edit_nama_str').value = item.nama || '';
        document.getElementById('edit_bidang').value = item.bidang || '';
        document.getElementById('edit_no_str').value = item.no_str || '';
        document.getElementById('edit_tgl_terbit').value = item.tgl_terbit || '';
        
        if(!item.tgl_berakhir) { chkEdit.checked = true; tglEdit.disabled = true; tglEdit.value = ''; }
        else { chkEdit.checked = false; tglEdit.disabled = false; tglEdit.value = item.tgl_berakhir; }

        modal.style.display = 'flex';
    };

    document.getElementById('btnTutupEditSTR').onclick = () => modal.style.display = 'none';

    formEdit.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit_id_str').value;
        
        const dataObj = {
            nik: document.getElementById('edit_nik_str').value,
            nama: document.getElementById('edit_nama_str').value,
            bidang: document.getElementById('edit_bidang').value,
            no_str: document.getElementById('edit_no_str').value,
            tgl_terbit: document.getElementById('edit_tgl_terbit').value,
            tgl_berakhir: chkEdit.checked ? null : document.getElementById('edit_tgl_berakhir_str').value,
        };

        const url = await uploadFile(document.getElementById('edit_file_str'), 'lampiran_str');
        if(url) dataObj.lampiran_url = url;

        const { error } = await supabase.from('berkas_str').update(dataObj).eq('id_str', id);
        if(!error) { modal.style.display = 'none'; loadData(); } else { alert(error.message); }
    });

    window.hapusSTR = async (id) => {
        if(confirm('Hapus data STR ini?')) { await supabase.from('berkas_str').delete().eq('id_str', id); loadData(); }
    };

    document.getElementById('btnExportExcelSTR').onclick = () => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(filteredData.map(r => ({ NIK: r.nik, Nama: r.nama, Bidang: r.bidang, "No STR": r.no_str, "Tgl Berakhir": r.tgl_berakhir || 'Seumur Hidup' })));
        XLSX.utils.book_append_sheet(wb, ws, "STR");
        XLSX.writeFile(wb, "Laporan_STR.xlsx");
    };

    document.getElementById('btnExportPDFSTR').onclick = () => {
        const doc = new jsPDF();
        doc.text("Laporan Surat Tanda Registrasi (STR) Pegawai", 14, 15);
        autoTable(doc, { head: [['NIK', 'Nama', 'No STR', 'Tanggal Berakhir']], body: filteredData.map(r => [r.nik, r.nama, r.no_str, r.tgl_berakhir || 'Seumur Hidup']), startY: 22 });
        doc.save("Laporan_STR.pdf");
    };

    document.getElementById('btnTriggerImportSTR').onclick = () => document.getElementById('inputCSVSTR').click();
    document.getElementById('inputCSVSTR').onchange = (e) => {
        Papa.parse(e.target.files[0], { header: true, skipEmptyLines: true, complete: async (res) => {
            const clean = res.data.map(r => {
                let obj = {};
                Object.keys(r).forEach(k => obj[k.trim().toLowerCase().replace(/\s+/g, '_')] = r[k] || null);
                return obj;
            });
            const { error } = await supabase.from('berkas_str').insert(clean);
            if(!error) loadData(); else alert(error.message);
        }});
    };

    loadData();
}
