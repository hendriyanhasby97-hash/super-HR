import { supabase } from './koneksi.js';

export function renderSIK(container, userRole = 'superadmin', userNik = null) {
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
                <input type="text" id="inputCariSIK" placeholder="🔍 Cari Nomor SIK atau Nama...">
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="btn btn-excel" id="btnExportExcelSIK"><i class="fas fa-file-excel"></i> Excel</button>
                <button class="btn btn-pdf" id="btnExportPDFSIK"><i class="fas fa-file-pdf"></i> PDF</button>
                <button class="btn btn-tambah" id="btnTambahSIK"><i class="fas fa-plus"></i> Tambah SIK / SIP</button>
            </div>
        </div>

        <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <table>
                <thead><tr><th>Pegawai</th><th>No. SIK / SIP</th><th>Tanggal Terbit</th><th>Berlaku Sampai</th><th>Aksi</th></tr></thead>
                <tbody id="tabelSIK"><tr><td colspan="5" style="text-align:center;">Memuat data...</td></tr></tbody>
            </table>
        </div>

        <div class="modal" id="modalFormSIK">
            <div class="modal-content">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid #ccc; padding-bottom:10px; margin-bottom: 20px;">
                    <h3 id="modalTitleSIK" style="margin:0;"><i class="fas fa-edit" style="color:#0ea5e9;"></i> Form SIK / SIP</h3>
                    <button class="btn btn-hapus" id="btnTutupFormSIK"><i class="fas fa-times"></i></button>
                </div>
                <form id="formSIK">
                    <input type="hidden" name="id" id="f_id_sik">
                    <fieldset><legend>Identitas Pegawai</legend>
                        <div class="grid-2">
                            <datalist id="list_pegawai_sik"></datalist>
                            <div class="form-group" style="grid-column: span 2;">
                                <label>Nama Lengkap</label>
                                <input type="text" name="nama" id="f_nama_sik" list="list_pegawai_sik" placeholder="Ketik nama..." required autocomplete="off">
                            </div>
                            <div class="form-group" style="grid-column: span 2;"><label>NIK</label><input type="text" name="nik" id="f_nik_sik" readonly required></div>
                        </div>
                    </fieldset>
                    <fieldset><legend>Data Dokumen</legend>
                        <div class="grid-2">
                            <div class="form-group" style="grid-column: span 2;"><label>Nomor SIK / SIP</label><input type="text" name="no_surat" id="f_no_surat_sik" required></div>
                            <div class="form-group"><label>Tanggal Terbit</label><input type="date" name="tgl_terbit" id="f_tgl_terbit_sik" required></div>
                            <div class="form-group"><label>Berlaku Sampai</label><input type="date" name="tgl_berlaku" id="f_tgl_berlaku_sik" required></div>
                            <div class="form-group" style="grid-column: span 2;">
                                <label>Upload Dokumen (PDF/JPG/PNG)</label>
                                <input type="file" id="f_file_sik" accept=".pdf, .jpg, .jpeg, .png">
                                <input type="hidden" id="f_old_file_sik">
                                <div id="file_info_sik" style="font-size: 0.8rem; margin-top: 5px; color:#64748b;"></div>
                            </div>
                        </div>
                    </fieldset>
                    <div style="text-align: right; margin-top: 15px;"><button type="submit" class="btn btn-simpan" id="btnSimpanSIK">Simpan Dokumen</button></div>
                </form>
            </div>
        </div>
    `;

    initLogikaSIK(userRole, userNik);
}

function initLogikaSIK(userRole, userNik) {
    const tbody = document.getElementById('tabelSIK');
    const modalForm = document.getElementById('modalFormSIK');
    const form = document.getElementById('formSIK');
    let currentData = [];
    let daftarPegawai = [];
    let currentUserData = null;

    // Persiapan Data untuk Role User
    async function initUserContext() {
        if (userRole === 'user' && userNik) {
            const { data } = await supabase.from('pegawai').select('nik, nama').eq('nik', userNik).single();
            currentUserData = data;
        }
    }

    // Load Data Tabel
    async function loadData() {
        let query = supabase.from('berkas_sik').select('*').order('tgl_terbit', { ascending: false });
        if (userRole === 'user' && userNik) query = query.eq('nik', userNik);
        
        const { data, error } = await query;
        if (error) { tbody.innerHTML = `<tr><td colspan="5">Error: ${error.message}</td></tr>`; return; }
        currentData = data || [];
        renderTabel(currentData);
    }

    // Load Datalist untuk Admin
    async function loadDataPegawai() {
        if (userRole === 'user') return; // User tidak perlu load nama orang lain
        const { data } = await supabase.from('pegawai').select('nik, nama');
        if (data) {
            daftarPegawai = data;
            document.getElementById('list_pegawai_sik').innerHTML = data.map(p => `<option value="${p.nama}">`).join('');
        }
    }

    // Eksekusi Awal
    initUserContext().then(() => { loadData(); loadDataPegawai(); });

    // Autofill Nama -> NIK (Khusus Admin)
    const inputNama = document.getElementById('f_nama_sik');
    const inputNik = document.getElementById('f_nik_sik');
    if (userRole !== 'user') {
        inputNama.addEventListener('input', (e) => {
            const p = daftarPegawai.find(x => x.nama === e.target.value);
            if(p) inputNik.value = p.nik; else inputNik.value = '';
        });
    }

    function renderTabel(data) {
        if (data.length === 0) { tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Belum ada data SIK / SIP.</td></tr>`; return; }
        tbody.innerHTML = data.map(row => `
            <tr>
                <td><strong>${row.nama || '-'}</strong><br><small>${row.nik || '-'}</small></td>
                <td><strong>${row.no_surat || '-'}</strong></td>
                <td>${row.tgl_terbit || '-'}</td>
                <td>${row.tgl_berlaku || '-'}</td>
                <td>
                    ${row.file_sik ? `<a href="${row.file_sik}" target="_blank" class="btn btn-link"><i class="fas fa-download"></i></a>` : ''}
                    <button class="btn btn-edit" onclick="bukaFormSIK('${row.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-hapus" onclick="hapusSIK('${row.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    }

    document.getElementById('inputCariSIK').addEventListener('input', (e) => {
        const kw = e.target.value.toLowerCase();
        renderTabel(currentData.filter(i => (i.nama && i.nama.toLowerCase().includes(kw)) || (i.no_surat && i.no_surat.toLowerCase().includes(kw))));
    });

    document.getElementById('btnTambahSIK').onclick = () => {
        form.reset(); document.getElementById('f_id_sik').value = ''; document.getElementById('f_old_file_sik').value = ''; document.getElementById('file_info_sik').innerHTML = '';
        document.getElementById('modalTitleSIK').innerHTML = `<i class="fas fa-plus" style="color:#10b981;"></i> Tambah SIK / SIP`;
        
        // Kunci nama dan NIK jika login sebagai user
        if (userRole === 'user' && currentUserData) {
            inputNama.value = currentUserData.nama; inputNama.readOnly = true;
            inputNik.value = currentUserData.nik;
        }
        modalForm.style.display = 'flex';
    };

    window.bukaFormSIK = (id) => {
        form.reset(); document.getElementById('modalTitleSIK').innerHTML = `<i class="fas fa-edit" style="color:#f59e0b;"></i> Edit SIK / SIP`;
        const item = currentData.find(p => p.id === id);
        if(!item) return;

        document.getElementById('f_id_sik').value = item.id;
        document.getElementById('f_nama_sik').value = item.nama || '';
        document.getElementById('f_nik_sik').value = item.nik || '';
        document.getElementById('f_no_surat_sik').value = item.no_surat || '';
        document.getElementById('f_tgl_terbit_sik').value = item.tgl_terbit || '';
        document.getElementById('f_tgl_berlaku_sik').value = item.tgl_berlaku || '';
        
        if (userRole === 'user') inputNama.readOnly = true;

        document.getElementById('f_old_file_sik').value = item.file_sik || '';
        document.getElementById('file_info_sik').innerHTML = item.file_sik ? `File saat ini: <a href="${item.file_sik}" target="_blank">Lihat</a>` : '';
        modalForm.style.display = 'flex';
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btnSimpanSIK'); btn.innerHTML = `Menyimpan...`; btn.disabled = true;
        
        const dataObj = Object.fromEntries(new FormData(form).entries());
        const idData = dataObj.id; delete dataObj.id;
        Object.keys(dataObj).forEach(key => { if (dataObj[key] === "") dataObj[key] = null; });

        // Keamanan ekstra untuk role user
        if (userRole === 'user' && currentUserData) { dataObj.nik = currentUserData.nik; dataObj.nama = currentUserData.nama; }

        const fileInput = document.getElementById('f_file_sik');
        let finalFileUrl = document.getElementById('f_old_file_sik').value; 
        if (fileInput.files[0]) {
            const file = fileInput.files[0];
            const uniqueName = `SIK_${Date.now()}_${Math.random().toString(36).substring(2,7)}.${file.name.split('.').pop()}`;
            const { error: errUp } = await supabase.storage.from('lampiran').upload(uniqueName, file, { upsert: false });
            if (!errUp) finalFileUrl = supabase.storage.from('lampiran').getPublicUrl(uniqueName).data.publicUrl;
        }

        dataObj.file_sik = finalFileUrl === "" ? null : finalFileUrl;
        if (idData) await supabase.from('berkas_sik').update(dataObj).eq('id', idData);
        else await supabase.from('berkas_sik').insert([dataObj]);
        
        btn.innerHTML = `Simpan Dokumen`; btn.disabled = false; modalForm.style.display = 'none'; loadData(); 
    });

    window.hapusSIK = async (id) => { if(confirm('Hapus dokumen ini?')) { await supabase.from('berkas_sik').delete().eq('id', id); loadData(); } };
    document.getElementById('btnTutupFormSIK').onclick = () => modalForm.style.display = 'none';
    
    // Fitur Download
    document.getElementById('btnExportExcelSIK').onclick = () => {
        if(currentData.length === 0) return;
        const ws = XLSX.utils.json_to_sheet(currentData.map(i => ({"NIK": i.nik, "Nama": i.nama, "No SIK": i.no_surat, "Terbit": i.tgl_terbit, "Berlaku": i.tgl_berlaku, "File": i.file_sik})));
        const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "SIK"); XLSX.writeFile(wb, `Data_SIK.xlsx`);
    };
    document.getElementById('btnExportPDFSIK').onclick = () => {
        if(currentData.length === 0) return;
        const { jsPDF } = window.jspdf; const doc = new jsPDF('landscape'); doc.text("Laporan SIK/SIP Pegawai", 14, 15);
        doc.autoTable({ head: [["NIK", "Nama", "No SIK", "Tgl Terbit", "Berlaku"]], body: currentData.map(i => [i.nik||'-', i.nama||'-', i.no_surat||'-', i.tgl_terbit||'-', i.tgl_berlaku||'-']), startY: 20 }); doc.save(`Data_SIK.pdf`);
    };
}
