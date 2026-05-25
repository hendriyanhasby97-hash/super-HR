import { supabase } from './koneksi.js';
import Papa from 'https://cdn.jsdelivr.net/npm/papaparse@5.4.1/+esm';
import * as XLSX from 'https://cdn.sheetjs.com/xlsx-0.19.3/package/xlsx.mjs';
import { jsPDF } from 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/+esm';
import autoTable from 'https://cdn.jsdelivr.net/npm/jspdf-autotable@3.5.31/+esm';

export function renderSIK(container) {
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
            .form-group input, .form-group select { width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 4px; outline: none; }
            .form-group input:focus, .form-group select:focus { border-color: #3b82f6; }
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

        <div class="form-box" id="boxFormSIK">
            <div class="form-header">
                <h2 style="margin:0; color:#1e293b;"><i class="fas fa-file-medical"></i> Form Input SIK (Surat Izin Kerja)</h2>
                <button class="btn btn-toggle" id="btnSembunyikanFormSIK"><i class="fas fa-eye-slash"></i> Sembunyikan Form</button>
            </div>
            
            <form id="formSIK">
                <div class="grid-2">
                    <div class="form-group"><label>NIK</label><input type="text" name="nik" id="ins_nik_sik" required autocomplete="off" placeholder="Ketik NIK..."></div>
                    <div class="form-group"><label>Nama Lengkap</label><input type="text" name="nama" id="ins_nama_sik" required autocomplete="off" placeholder="Otomatis dicari..."></div>
                    <div class="form-group"><label>Bidang / Profesi</label><input type="text" name="bidang" required placeholder="Contoh: Perawat, Dokter" autocomplete="off"></div>
                    <div class="form-group"><label>No. SIP / SIK</label><input type="text" name="no_sip" required autocomplete="off"></div>
                    <div class="form-group"><label>Tanggal Terbit</label><input type="date" name="tgl_terbit" required></div>
                    
                    <div class="form-group">
                        <label>Tanggal Berakhir</label>
                        <input type="date" name="tgl_berakhir" id="ins_tgl_berakhir" required>
                        <label style="display:inline-flex; align-items:center; gap:5px; margin-top:8px; font-weight:normal; font-size:0.85rem;">
                            <input type="checkbox" id="chk_seumur_hidup"> Seumur Hidup
                        </label>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Lampiran Berkas (PDF)</label>
                    <input type="file" id="form_file_sik" accept=".pdf">
                </div>

                <div style="display:flex; justify-content:flex-end;">
                    <button type="submit" class="btn btn-submit" id="btnSimpanSIK"><i class="fas fa-save"></i> Simpan Data SIK</button>
                </div>
            </form>
        </div>

        <div id="boxShowFormSIK" style="display:none; margin-bottom: 20px;">
            <button class="btn btn-toggle" style="background:#3b82f6;" id="btnTampilkanFormSIK"><i class="fas fa-eye"></i> Tampilkan Form Input SIK</button>
        </div>

        <div class="toolbar">
            <input type="text" id="inputCariSIK" class="search-box" placeholder="🔍 Cari berdasarkan NIK, Nama, No SIP...">
            <div style="display:flex; gap:10px;">
                <button class="btn btn-import" id="btnTriggerImportSIK"><i class="fas fa-file-import"></i> Import CSV</button>
                <input type="file" id="inputCSVSIK" accept=".csv" style="display: none;">
                <button class="btn btn-excel" id="btnExportExcelSIK"><i class="fas fa-file-excel"></i> Excel</button>
                <button class="btn btn-pdf" id="btnExportPDFSIK"><i class="fas fa-file-pdf"></i> PDF</button>
            </div>
        </div>

        <div class="table-container">
            <h3 style="margin-bottom: 15px; color: #1e293b;">Daftar Surat Izin Kerja (SIK)</h3>
            <table>
                <thead>
                    <tr>
                        <th>NIK</th>
                        <th>Nama</th>
                        <th>No. SIP</th>
                        <th>Tanggal Berakhir</th>
                        <th>Sisa Masa Berlaku</th>
                        <th>Berkas</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody id="tabelSIK"><tr><td colspan="7" style="text-align:center;">Memuat data...</td></tr></tbody>
            </table>
        </div>

        <div class="modal" id="modalEditSIK">
            <div class="modal-content">
                <h3 style="margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Edit Data SIK</h3>
                <form id="formEditSIK">
                    <input type="hidden" name="id_sik" id="edit_id_sik">
                    <div class="grid-2">
                        <div class="form-group"><label>NIK</label><input type="text" name="nik" id="edit_nik_sik" required></div>
                        <div class="form-group"><label>Nama Lengkap</label><input type="text" name="nama" id="edit_nama_sik" required></div>
                        <div class="form-group"><label>Bidang</label><input type="text" name="bidang" id="edit_bidang" required></div>
                        <div class="form-group"><label>No. SIP</label><input type="text" name="no_sip" id="edit_no_sip" required></div>
                        <div class="form-group"><label>Tanggal Terbit</label><input type="date" name="tgl_terbit" id="edit_tgl_terbit" required></div>
                        <div class="form-group">
                            <label>Tanggal Berakhir</label>
                            <input type="date" name="tgl_berakhir" id="edit_tgl_berakhir">
                            <label style="display:inline-flex; align-items:center; gap:5px; margin-top:8px; font-weight:normal; font-size:0.85rem;">
                                <input type="checkbox" id="edit_chk_seumur_hidup"> Seumur Hidup
                            </label>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Ganti Lampiran Berkas Baru (PDF)</label>
                        <input type="file" id="edit_file_sik" accept=".pdf">
                    </div>
                    <div style="text-align: right; margin-top: 15px;">
                        <button type="button" class="btn" style="background:#94a3b8;" id="btnTutupEditSIK">Batal</button>
                        <button type="submit" class="btn" style="background:#3b82f6;" id="btnUpdateSIK"><i class="fas fa-save"></i> Update</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    initLogikaSIK();
}

function initLogikaSIK() {
    const formInsert = document.getElementById('formSIK');
    const formEdit = document.getElementById('formEditSIK');
    const tbody = document.getElementById('tabelSIK');
    const modal = document.getElementById('modalEditSIK');
    
    const chkIns = document.getElementById('chk_seumur_hidup');
    const tglIns = document.getElementById('ins_tgl_berakhir');
    const chkEdit = document.getElementById('edit_chk_seumur_hidup');
    const tglEdit = document.getElementById('edit_tgl_berakhir');

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
                        .maybeSingle(); // maybeSingle mencegah error jika data tidak ditemukan

                    if (data && data.nama) {
                        inputNama.value = data.nama;
                    } else {
                        inputNama.placeholder = "Data tidak ditemukan. Ketik manual...";
                    }
                }, 500); // Jeda 0.5 detik agar database tidak di-spam saat mengetik cepat
            }
        });
    }

    // Pasang fitur Auto-Search ke Form Tambah dan Form Edit
    setupAutoSearchNIK('ins_nik_sik', 'ins_nama_sik');
    setupAutoSearchNIK('edit_nik_sik', 'edit_nama_sik');


    // Logika Checkbox Seumur Hidup
    chkIns.addEventListener('change', () => {
        if(chkIns.checked) { tglIns.disabled = true; tglIns.value = ''; tglIns.required = false; }
        else { tglIns.disabled = false; tglIns.required = true; }
    });
    chkEdit.addEventListener('change', () => {
        if(chkEdit.checked) { tglEdit.disabled = true; tglEdit.value = ''; }
        else { tglEdit.disabled = false; }
    });

    // Toggle Form
    document.getElementById('btnSembunyikanFormSIK').onclick = () => { document.getElementById('boxFormSIK').style.display = 'none'; document.getElementById('boxShowFormSIK').style.display = 'block'; };
    document.getElementById('btnTampilkanFormSIK').onclick = () => { document.getElementById('boxFormSIK').style.display = 'block'; document.getElementById('boxShowFormSIK').style.display = 'none'; };

    // Fungsi Hitung Mundur Sisa Masa Berlaku
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
        const { data, error } = await supabase.from('berkas_sik').select('*').order('tgl_terbit', { ascending: false });
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
                    <td>${row.no_sip || '-'}</td>
                    <td>${row.tgl_berakhir || '-'}</td>
                    <td><span class="countdown-badge" style="background:${hitung.bg}; color:${hitung.fg};">${hitung.teks}</span></td>
                    <td>${row.lampiran_url ? `<a href="${row.lampiran_url}" target="_blank" class="btn btn-view"><i class="fas fa-file-pdf"></i> Lihat</a>` : '-'}</td>
                    <td>
                        <button class="btn btn-edit" onclick="bukaEditSIK('${row.id_sik}')"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-hapus" onclick="hapusSIK('${row.id_sik}')"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    document.getElementById('inputCariSIK').addEventListener('input', (e) => {
        const kw = e.target.value.toLowerCase();
        filteredData = listData.filter(p => p.nama.toLowerCase().includes(kw) || p.nik.includes(kw) || p.no_sip.toLowerCase().includes(kw));
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
        const btn = document.getElementById('btnSimpanSIK');
        btn.innerText = "Menyimpan..."; btn.disabled = true;

        const url = await uploadFile(document.getElementById('form_file_sik'), 'lampiran_sik');
        const dataObj = Object.fromEntries(new FormData(formInsert).entries());
        
        dataObj.tgl_berakhir = chkIns.checked ? null : dataObj.tgl_berakhir;
        if(url) dataObj.lampiran_url = url;

        const { error } = await supabase.from('berkas_sik').insert([dataObj]);
        if(!error) { formInsert.reset(); chkIns.checked = false; tglIns.disabled = false; loadData(); }
        btn.innerHTML = `<i class="fas fa-save"></i> Simpan Data SIK`; btn.disabled = false;
    });

    window.bukaEditSIK = (id) => {
        const item = listData.find(p => p.id_sik == id);
        if(!item) return;
        Object.keys(item).forEach(key => {
            // Karena ID input nama & nik di edit form berubah, kita tangani khusus
            if (key === 'nik') document.getElementById('edit_nik_sik').value = item[key] || '';
            else if (key === 'nama') document.getElementById('edit_nama_sik').value = item[key] || '';
            else {
                const el = document.getElementById(`edit_${key}`);
                if(el) el.value = item[key] || '';
            }
        });
        if(!item.tgl_berakhir) { chkEdit.checked = true; tglEdit.disabled = true; tglEdit.value = ''; }
        else { chkEdit.checked = false; tglEdit.disabled = false; }
        modal.style.display = 'flex';
    };

    document.getElementById('btnTutupEditSIK').onclick = () => modal.style.display = 'none';

    formEdit.addEventListener('submit', async (e) => {
        e.preventDefault();
        const dataObj = Object.fromEntries(new FormData(formEdit).entries());
        const id = dataObj.id_sik; delete dataObj.id_sik;

        const url = await uploadFile(document.getElementById('edit_file_sik'), 'lampiran_sik');
        dataObj.tgl_berakhir = chkEdit.checked ? null : dataObj.tgl_berakhir;
        if(url) dataObj.lampiran_url = url;

        const { error } = await supabase.from('berkas_sik').update(dataObj).eq('id_sik', id);
        if(!error) { modal.style.display = 'none'; loadData(); }
    });

    window.hapusSIK = async (id) => {
        if(confirm('Hapus data SIK ini?')) { await supabase.from('berkas_sik').delete().eq('id_sik', id); loadData(); }
    };

    document.getElementById('btnExportExcelSIK').onclick = () => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(filteredData.map(r => ({ NIK: r.nik, Nama: r.nama, Bidang: r.bidang, "No SIP": r.no_sip, "Tgl Terbit": r.tgl_terbit, "Tgl Berakhir": r.tgl_berakhir || 'Seumur Hidup' })));
        XLSX.utils.book_append_sheet(wb, ws, "SIK");
        XLSX.writeFile(wb, "Laporan_SIK.xlsx");
    };

    document.getElementById('btnExportPDFSIK').onclick = () => {
        const doc = new jsPDF();
        doc.text("Laporan Surat Izin Kerja (SIK) Pegawai", 14, 15);
        autoTable(doc, { head: [['NIK', 'Nama', 'Bidang', 'No SIP', 'Tgl Berakhir']], body: filteredData.map(r => [r.nik, r.nama, r.bidang, r.no_sip, r.tgl_berakhir || 'Seumur Hidup']), startY: 22 });
        doc.save("Laporan_SIK.pdf");
    };

    document.getElementById('btnTriggerImportSIK').onclick = () => document.getElementById('inputCSVSIK').click();
    document.getElementById('inputCSVSIK').onchange = (e) => {
        Papa.parse(e.target.files[0], { header: true, skipEmptyLines: true, complete: async (res) => {
            const clean = res.data.map(r => {
                let obj = {};
                Object.keys(r).forEach(k => obj[k.trim().toLowerCase().replace(/\s+/g, '_')] = r[k] || null);
                return obj;
            });
            const { error } = await supabase.from('berkas_sik').insert(clean);
            if(!error) loadData(); else alert(error.message);
        }});
    };

    loadData();
}
