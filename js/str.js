import { supabase } from './koneksi.js';

export function renderSTR(container, userRole = 'superadmin', userNik = null) {
    container.innerHTML = `
        <style>
            .btn { padding: 8px 15px; border: none; border-radius: 4px; cursor: pointer; color: white; font-weight: 600; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 5px; }
            .btn-edit { background: #f59e0b; } .btn-hapus { background: #ef4444; } .btn-detail { background: #0ea5e9; } .btn-tambah, .btn-simpan { background: #10b981; } .btn-excel { background: #16a34a; } .btn-pdf { background: #dc2626; } .btn-link { background: #64748b; }
            table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; font-size: 0.9rem;} th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; } th { background: #f8fafc; color: #475569;}
            .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .filter-group { display: flex; gap: 10px; flex: 1; } .filter-group input { padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 4px; outline: none; width:250px;}
            .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); align-items: flex-start; justify-content: center; z-index: 9999; padding: 20px; }
            .modal-content { background: white; padding: 30px; border-radius: 8px; width: 700px; max-width: 100%; max-height: 90vh; overflow-y: auto; margin-top: 2vh; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;}
            .form-group label { display: block; font-weight: 600; font-size: 0.85rem; color: #475569; margin-bottom: 4px;} .form-group input, .form-group select { width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; outline: none;} .form-group input[readonly] { background: #e2e8f0; cursor: not-allowed; font-weight:bold;}
            fieldset { border: 1px solid #e2e8f0; padding: 15px; border-radius: 6px; margin-bottom: 15px; background: #fafafa;} legend { font-weight: bold; background: #3b82f6; color: white; padding: 4px 10px; border-radius: 4px; font-size: 0.9rem;}
        </style>

        <div class="toolbar">
            <div class="filter-group">
                <input type="text" id="inputCariSTR" placeholder="🔍 Cari Nomor STR atau Nama...">
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="btn btn-excel" id="btnExportExcelSTR"><i class="fas fa-file-excel"></i> Excel</button>
                <button class="btn btn-pdf" id="btnExportPDFSTR"><i class="fas fa-file-pdf"></i> PDF</button>
                <button class="btn btn-tambah" id="btnTambahSTR"><i class="fas fa-plus"></i> Tambah STR</button>
            </div>
        </div>

        <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <table>
                <thead><tr><th>Pegawai</th><th>No. STR</th><th>Tanggal Terbit</th><th>Berlaku Sampai</th><th>Aksi</th></tr></thead>
                <tbody id="tabelSTR"><tr><td colspan="5" style="text-align:center;">Memuat data...</td></tr></tbody>
            </table>
        </div>

        <div class="modal" id="modalFormSTR">
            <div class="modal-content">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid #ccc; padding-bottom:10px; margin-bottom: 20px;">
                    <h3 id="modalTitleSTR" style="margin:0;"><i class="fas fa-edit" style="color:#0ea5e9;"></i> Form STR</h3>
                    <button class="btn btn-hapus" id="btnTutupFormSTR"><i class="fas fa-times"></i></button>
                </div>
                <form id="formSTR">
                    <input type="hidden" name="id" id="f_id_str">
                    <fieldset><legend>Identitas Pegawai</legend>
                        <div class="grid-2">
                            <datalist id="list_pegawai_str"></datalist>
                            <div class="form-group" style="grid-column: span 2;">
                                <label>Nama Lengkap</label>
                                <input type="text" name="nama" id="f_nama_str" list="list_pegawai_str" placeholder="Ketik nama..." required autocomplete="off">
                            </div>
                            <div class="form-group" style="grid-column: span 2;"><label>NIK</label><input type="text" name="nik" id="f_nik_str" readonly required></div>
                        </div>
                    </fieldset>
                    <fieldset><legend>Data Dokumen</legend>
                        <div class="grid-2">
                            <div class="form-group" style="grid-column: span 2;"><label>Nomor STR</label><input type="text" name="nomor" id="f_no_surat_str" required></div>
                            <div class="form-group"><label>Tanggal Terbit</label><input type="date" name="tgl_terbit" id="f_tgl_terbit_str" required></div>
                            
                            <div class="form-group">
                                <label style="display: flex; justify-content: space-between; align-items: center;">
                                    Berlaku Sampai
                                    <span style="font-size: 0.8rem; font-weight: normal; display: flex; align-items: center; gap: 5px; cursor: pointer;">
                                        <input type="checkbox" id="f_seumur_hidup_str" style="width: auto; margin: 0; cursor: pointer;"> Seumur Hidup
                                    </span>
                                </label>
                                <input type="date" name="tgl_berlaku" id="f_tgl_berlaku_str" required>
                            </div>

                            <div class="form-group" style="grid-column: span 2;">
                                <label>Upload Dokumen (PDF/JPG/PNG)</label>
                                <input type="file" id="f_file_str" accept=".pdf, .jpg, .jpeg, .png">
                                <input type="hidden" id="f_old_file_str">
                                <div id="file_info_str" style="font-size: 0.8rem; margin-top: 5px; color:#64748b;"></div>
                            </div>
                        </div>
                    </fieldset>
                    <div style="text-align: right; margin-top: 15px;"><button type="submit" class="btn btn-simpan" id="btnSimpanSTR">Simpan Dokumen</button></div>
                </form>
            </div>
        </div>
    `;

    initLogikaSTR(userRole, userNik);
}

function initLogikaSTR(userRole, userNik) {
    const tbody = document.getElementById('tabelSTR');
    const modalForm = document.getElementById('modalFormSTR');
    const form = document.getElementById('formSTR');
    
    // Elemen Seumur Hidup
    const checkboxSeumurHidup = document.getElementById('f_seumur_hidup_str');
    const inputTglBerlaku = document.getElementById('f_tgl_berlaku_str');

    let currentData = [];
    let daftarPegawai = [];
    let currentUserData = null;

    // --- LOGIKA CHECKBOX SEUMUR HIDUP ---
    checkboxSeumurHidup.addEventListener('change', (e) => {
        if (e.target.checked) {
            inputTglBerlaku.type = 'text';
            inputTglBerlaku.value = 'Seumur Hidup';
            inputTglBerlaku.readOnly = true;
            inputTglBerlaku.style.backgroundColor = '#e2e8f0';
        } else {
            inputTglBerlaku.type = 'date';
            inputTglBerlaku.value = '';
            inputTglBerlaku.readOnly = false;
            inputTglBerlaku.style.backgroundColor = ''; 
        }
    });

    async function initUserContext() {
        if (userRole === 'user' && userNik) {
            const { data } = await supabase.from('pegawai').select('nik, nama').eq('nik', userNik).single();
            currentUserData = data;
        }
    }

    async function loadData() {
        let query = supabase.from('berkas_str').select('*').order('tgl_terbit', { ascending: false });
        if (userRole === 'user' && userNik) query = query.eq('nik', userNik);
        
        const { data, error } = await query;
        if (error) { tbody.innerHTML = `<tr><td colspan="5">Error: ${error.message}</td></tr>`; return; }
        currentData = data || [];
        renderTabel(currentData);
    }

    async function loadDataPegawai() {
        if (userRole === 'user') return; 
        const { data } = await supabase.from('pegawai').select('nik, nama');
        if (data) {
            daftarPegawai = data;
            document.getElementById('list_pegawai_str').innerHTML = data.map(p => `<option value="${p.nama}">`).join('');
        }
    }

    initUserContext().then(() => { loadData(); loadDataPegawai(); });

    const inputNama = document.getElementById('f_nama_str');
    const inputNik = document.getElementById('f_nik_str');
    if (userRole !== 'user') {
        inputNama.addEventListener('input', (e) => {
            const p = daftarPegawai.find(x => x.nama === e.target.value);
            if(p) inputNik.value = p.nik; else inputNik.value = '';
        });
    }

    function renderTabel(data) {
        if (data.length === 0) { tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Belum ada data STR.</td></tr>`; return; }
        tbody.innerHTML = data.map(row => `
            <tr>
                <td><strong>${row.nama || '-'}</strong><br><small>${row.nik || '-'}</small></td>
                <td><strong>${row.nomor || '-'}</strong></td>
                <td>${row.tgl_terbit || '-'}</td>
                <td>
                    ${row.tgl_berlaku === 'Seumur Hidup' ? `<span style="background:#dcfce7; color:#059669; padding: 4px 10px; border-radius: 4px; font-weight:bold;">Seumur Hidup</span>` : (row.tgl_berlaku || '-')}
                </td>
                <td>
                    ${row.file_str ? `<a href="${row.file_str}" target="_blank" class="btn btn-link"><i class="fas fa-download"></i></a>` : ''}
                    <button class="btn btn-edit" onclick="bukaFormSTR('${row.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-hapus" onclick="hapusSTR('${row.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    }

    document.getElementById('inputCariSTR').addEventListener('input', (e) => {
        const kw = e.target.value.toLowerCase();
        renderTabel(currentData.filter(i => (i.nama && i.nama.toLowerCase().includes(kw)) || (i.nomor && i.nomor.toLowerCase().includes(kw))));
    });

    document.getElementById('btnTambahSTR').onclick = () => {
        form.reset(); document.getElementById('f_id_str').value = ''; document.getElementById('f_old_file_str').value = ''; document.getElementById('file_info_str').innerHTML = '';
        document.getElementById('modalTitleSTR').innerHTML = `<i class="fas fa-plus" style="color:#10b981;"></i> Tambah STR`;
        
        // Reset Checkbox & Input
        checkboxSeumurHidup.checked = false;
        inputTglBerlaku.type = 'date';
        inputTglBerlaku.readOnly = false;
        inputTglBerlaku.style.backgroundColor = '';

        if (userRole === 'user' && currentUserData) {
            inputNama.value = currentUserData.nama; inputNama.readOnly = true;
            inputNik.value = currentUserData.nik;
        }
        modalForm.style.display = 'flex';
    };

    window.bukaFormSTR = (id) => {
        form.reset(); document.getElementById('modalTitleSTR').innerHTML = `<i class="fas fa-edit" style="color:#f59e0b;"></i> Edit STR`;
        const item = currentData.find(p => p.id === id);
        if(!item) return;

        document.getElementById('f_id_str').value = item.id;
        document.getElementById('f_nama_str').value = item.nama || '';
        document.getElementById('f_nik_str').value = item.nik || '';
        document.getElementById('f_no_surat_str').value = item.nomor || '';
        document.getElementById('f_tgl_terbit_str').value = item.tgl_terbit || '';
        
        // Cek dan set status Seumur Hidup
        if (item.tgl_berlaku === 'Seumur Hidup') {
            checkboxSeumurHidup.checked = true;
            inputTglBerlaku.type = 'text';
            inputTglBerlaku.value = 'Seumur Hidup';
            inputTglBerlaku.readOnly = true;
            inputTglBerlaku.style.backgroundColor = '#e2e8f0';
        } else {
            checkboxSeumurHidup.checked = false;
            inputTglBerlaku.type = 'date';
            inputTglBerlaku.value = item.tgl_berlaku || '';
            inputTglBerlaku.readOnly = false;
            inputTglBerlaku.style.backgroundColor = '';
        }
        
        if (userRole === 'user') inputNama.readOnly = true;

        document.getElementById('f_old_file_str').value = item.file_str || '';
        document.getElementById('file_info_str').innerHTML = item.file_str ? `File saat ini: <a href="${item.file_str}" target="_blank">Lihat</a>` : '';
        modalForm.style.display = 'flex';
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btnSimpanSTR'); btn.innerHTML = `Menyimpan...`; btn.disabled = true;
        
        const dataObj = Object.fromEntries(new FormData(form).entries());
        const idData = dataObj.id; delete dataObj.id;
        Object.keys(dataObj).forEach(key => { if (dataObj[key] === "") dataObj[key] = null; });

        if (userRole === 'user' && currentUserData) { dataObj.nik = currentUserData.nik; dataObj.nama = currentUserData.nama; }

        const fileInput = document.getElementById('f_file_str');
        let finalFileUrl = document.getElementById('f_old_file_str').value; 
        if (fileInput.files[0]) {
            const file = fileInput.files[0];
            const uniqueName = `STR_${Date.now()}_${Math.random().toString(36).substring(2,7)}.${file.name.split('.').pop()}`;
            const { error: errUp } = await supabase.storage.from('lampiran').upload(uniqueName, file, { upsert: false });
            if (!errUp) finalFileUrl = supabase.storage.from('lampiran').getPublicUrl(uniqueName).data.publicUrl;
        }

        dataObj.file_str = finalFileUrl === "" ? null : finalFileUrl;
        
        // Memastikan isian "Seumur Hidup" dikirim ke database
        if (checkboxSeumurHidup.checked) {
            dataObj.tgl_berlaku = 'Seumur Hidup';
        }

        if (idData) await supabase.from('berkas_str').update(dataObj).eq('id', idData);
        else await supabase.from('berkas_str').insert([dataObj]);
        
        btn.innerHTML = `Simpan Dokumen`; btn.disabled = false; modalForm.style.display = 'none'; loadData(); 
    });

    window.hapusSTR = async (id) => { if(confirm('Hapus dokumen ini?')) { await supabase.from('berkas_str').delete().eq('id', id); loadData(); } };
    document.getElementById('btnTutupFormSTR').onclick = () => modalForm.style.display = 'none';
    
    // Fitur Download
    document.getElementById('btnExportExcelSTR').onclick = () => {
        if(currentData.length === 0) return;
        const ws = XLSX.utils.json_to_sheet(currentData.map(i => ({"NIK": i.nik, "Nama": i.nama, "No STR": i.nomor, "Terbit": i.tgl_terbit, "Berlaku": i.tgl_berlaku, "File": i.file_str})));
        const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "STR"); XLSX.writeFile(wb, `Data_STR.xlsx`);
    };
    document.getElementById('btnExportPDFSTR').onclick = () => {
        if(currentData.length === 0) return;
        const { jsPDF } = window.jspdf; const doc = new jsPDF('landscape'); doc.text("Laporan STR Pegawai", 14, 15);
        doc.autoTable({ head: [["NIK", "Nama", "No STR", "Tgl Terbit", "Berlaku"]], body: currentData.map(i => [i.nik||'-', i.nama||'-', i.nomor||'-', i.tgl_terbit||'-', i.tgl_berlaku||'-']), startY: 20 }); doc.save(`Data_STR.pdf`);
    };
}
