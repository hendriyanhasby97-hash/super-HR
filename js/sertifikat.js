import { supabase } from './koneksi.js';

export function renderSertifikat(container, userRole = 'superadmin', userNik = null) {
    container.innerHTML = `
        <style>
            .btn { padding: 8px 15px; border: none; border-radius: 4px; cursor: pointer; color: white; font-weight: 600; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 5px; }
            .btn-edit { background: #f59e0b; } .btn-hapus { background: #ef4444; } .btn-tambah, .btn-simpan { background: #10b981; } .btn-excel { background: #16a34a; } .btn-pdf { background: #dc2626; } .btn-link { background: #64748b; }
            table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; font-size: 0.9rem;} th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; } th { background: #f8fafc; color: #475569;}
            .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .filter-group { display: flex; gap: 10px; flex: 1; } .filter-group input { padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 4px; outline: none; width:250px;}
            .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); align-items: flex-start; justify-content: center; z-index: 9999; padding: 20px; }
            .modal-content { background: white; padding: 30px; border-radius: 8px; width: 800px; max-width: 100%; max-height: 90vh; overflow-y: auto; margin-top: 2vh; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;}
            .form-group label { display: block; font-weight: 600; font-size: 0.85rem; color: #475569; margin-bottom: 4px;} .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; outline: none;} .form-group input[readonly] { background: #e2e8f0; cursor: not-allowed; font-weight:bold;}
            fieldset { border: 1px solid #e2e8f0; padding: 15px; border-radius: 6px; margin-bottom: 15px; background: #fafafa;} legend { font-weight: bold; background: #3b82f6; color: white; padding: 4px 10px; border-radius: 4px; font-size: 0.9rem;}
        </style>

        <div class="toolbar">
            <div class="filter-group"><input type="text" id="inputCariSertif" placeholder="🔍 Cari NIK, Nama, atau Judul..."></div>
            <div style="display: flex; gap: 10px;">
                <button class="btn btn-excel" id="btnExportExcelSertif"><i class="fas fa-file-excel"></i> Excel</button>
                <button class="btn btn-pdf" id="btnExportPDFSertif"><i class="fas fa-file-pdf"></i> PDF</button>
                <button class="btn btn-tambah" id="btnTambahSertif"><i class="fas fa-plus"></i> Tambah Sertifikat</button>
            </div>
        </div>

        <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <table>
                <thead><tr><th>Pegawai</th><th>No. Sertifikat</th><th>Judul Kegiatan</th><th>Jenis</th><th>Waktu</th><th>JPL / SKP</th><th>Aksi</th></tr></thead>
                <tbody id="tabelSertifikat"><tr><td colspan="7" style="text-align:center;">Memuat data...</td></tr></tbody>
            </table>
        </div>

        <div class="modal" id="modalFormSertifikat">
            <div class="modal-content">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid #ccc; padding-bottom:10px; margin-bottom: 20px;">
                    <h3 id="modalTitleSertif" style="margin:0;"><i class="fas fa-certificate" style="color:#0ea5e9;"></i> Form Sertifikat</h3>
                    <button class="btn btn-hapus" id="btnTutupFormSertif"><i class="fas fa-times"></i></button>
                </div>
                <form id="formSertifikat">
                    <input type="hidden" name="id" id="fs_id">
                    <fieldset><legend>Data Pegawai</legend>
                        <div class="grid-2">
                            <datalist id="list_pegawai_sertif"></datalist>
                            <div class="form-group"><label>Nama Lengkap</label><input type="text" name="nama" id="fs_nama" list="list_pegawai_sertif" required autocomplete="off"></div>
                            <div class="form-group"><label>NIK</label><input type="text" name="nik" id="fs_nik" readonly required></div>
                        </div>
                    </fieldset>
                    <fieldset><legend>Detail Sertifikat</legend>
                        <div class="form-group" style="margin-bottom:15px;"><label>Judul Kegiatan</label><textarea name="judul_kegiatan" id="fs_judul_kegiatan" rows="2" required></textarea></div>
                        <div class="grid-2">
                            <div class="form-group"><label>No. Sertifikat</label><input type="text" name="no_sertifikat" id="fs_no_sertifikat" required></div>
                            <div class="form-group">
                                <label>Jenis Sertifikat</label>
                                <select name="jenis_sertifikat" id="fs_jenis_sertifikat" required>
                                    <option value="Pelatihan">Pelatihan</option><option value="Seminar">Seminar</option><option value="Workshop">Workshop</option><option value="Bimtek">Bimtek</option><option value="Lainnya">Lainnya</option>
                                </select>
                            </div>
                            <div class="form-group"><label>Tanggal Terbit Sertifikat</label><input type="date" name="tanggal_pelaksanaan" id="fs_tanggal_pelaksanaan"></div>
                            <div class="form-group"><label>Tanggal Mulai Kegiatan</label><input type="date" name="mulai" id="fs_mulai"></div>
                            <div class="form-group"><label>Tanggal Selesai Kegiatan</label><input type="date" name="selesai" id="fs_selesai"></div>
                            <div class="form-group"><label>JPL</label><input type="number" name="jpl" id="fs_jpl"></div>
                            <div class="form-group"><label>Nilai SKP</label><input type="number" step="0.01" name="skp" id="fs_skp"></div>
                            <div class="form-group" style="grid-column: span 2;">
                                <label>Upload Sertifikat (PDF/JPG/PNG)</label>
                                <input type="file" id="fs_file_sertifikat" accept=".pdf, .jpg, .jpeg, .png">
                                <input type="hidden" id="fs_old_file_sertifikat">
                                <div id="file_info_sertif" style="font-size: 0.8rem; margin-top: 5px; color:#64748b;"></div>
                            </div>
                        </div>
                    </fieldset>
                    <div style="text-align: right; margin-top: 15px;"><button type="submit" class="btn btn-simpan" id="btnSimpanSertif">Simpan Sertifikat</button></div>
                </form>
            </div>
        </div>
    `;

    initLogikaSertifikat(userRole, userNik);
}

function initLogikaSertifikat(userRole, userNik) {
    const tbody = document.getElementById('tabelSertifikat');
    const modalForm = document.getElementById('modalFormSertifikat');
    const form = document.getElementById('formSertifikat');
    let currentData = []; let daftarPegawai = []; let currentUserData = null;

    async function initUserContext() {
        if (userRole === 'user' && userNik) {
            const { data } = await supabase.from('pegawai').select('nik, nama').eq('nik', userNik).single();
            currentUserData = data;
        }
    }

    async function loadData() {
        let query = supabase.from('sertifikat_pegawai').select('*').order('created_at', { ascending: false });
        if (userRole === 'user' && userNik) query = query.eq('nik', userNik);
        
        const { data, error } = await query;
        if (error) { tbody.innerHTML = `<tr><td colspan="7">Error: ${error.message}</td></tr>`; return; }
        currentData = data || []; renderTabel(currentData);
    }

    async function loadDataPegawai() {
        if (userRole === 'user') return; 
        const { data } = await supabase.from('pegawai').select('nik, nama');
        if (data) { daftarPegawai = data; document.getElementById('list_pegawai_sertif').innerHTML = data.map(p => `<option value="${p.nama}">`).join(''); }
    }

    initUserContext().then(() => { loadData(); loadDataPegawai(); });

    const inputNama = document.getElementById('fs_nama'); const inputNik = document.getElementById('fs_nik');
    if (userRole !== 'user') {
        inputNama.addEventListener('input', (e) => {
            const p = daftarPegawai.find(x => x.nama === e.target.value);
            if(p) inputNik.value = p.nik; else inputNik.value = '';
        });
    }

    function renderTabel(data) {
        if (data.length === 0) { tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Belum ada data Sertifikat.</td></tr>`; return; }
        tbody.innerHTML = data.map(row => `
            <tr>
                <td><strong>${row.nama || '-'}</strong><br><small>${row.nik || '-'}</small></td>
                <td><strong>${row.no_sertifikat || '-'}</strong></td>
                <td>${row.judul_kegiatan || '-'}</td>
                <td>${row.jenis_sertifikat || '-'}</td>
                <td>${row.mulai || '-'} s/d ${row.selesai || '-'}</td>
                <td>JPL: ${row.jpl || '0'} | SKP: ${row.skp || '0'}</td>
                <td>
                    ${row.file_sertifikat ? `<a href="${row.file_sertifikat}" target="_blank" class="btn btn-link"><i class="fas fa-download"></i></a>` : ''}
                    <button class="btn btn-edit" onclick="bukaFormSertif('${row.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-hapus" onclick="hapusSertif('${row.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    }

    document.getElementById('inputCariSertif').addEventListener('input', (e) => {
        const kw = e.target.value.toLowerCase();
        renderTabel(currentData.filter(i => (i.nama && i.nama.toLowerCase().includes(kw)) || (i.judul_kegiatan && i.judul_kegiatan.toLowerCase().includes(kw))));
    });

    document.getElementById('btnTambahSertif').onclick = () => {
        form.reset(); document.getElementById('fs_id').value = ''; document.getElementById('fs_old_file_sertifikat').value = ''; document.getElementById('file_info_sertif').innerHTML = '';
        document.getElementById('modalTitleSertif').innerHTML = `<i class="fas fa-plus" style="color:#10b981;"></i> Tambah Sertifikat`;
        if (userRole === 'user' && currentUserData) { inputNama.value = currentUserData.nama; inputNama.readOnly = true; inputNik.value = currentUserData.nik; }
        modalForm.style.display = 'flex';
    };

    window.bukaFormSertif = (id) => {
        form.reset(); document.getElementById('modalTitleSertif').innerHTML = `<i class="fas fa-edit" style="color:#f59e0b;"></i> Edit Sertifikat`;
        const item = currentData.find(p => p.id === id);
        if(!item) return;

        document.getElementById('fs_id').value = item.id;
        document.getElementById('fs_nama').value = item.nama || '';
        document.getElementById('fs_nik').value = item.nik || '';
        document.getElementById('fs_no_sertifikat').value = item.no_sertifikat || '';
        document.getElementById('fs_judul_kegiatan').value = item.judul_kegiatan || '';
        document.getElementById('fs_jenis_sertifikat').value = item.jenis_sertifikat || '';
        document.getElementById('fs_tanggal_pelaksanaan').value = item.tanggal_pelaksanaan || '';
        document.getElementById('fs_mulai').value = item.mulai || '';
        document.getElementById('fs_selesai').value = item.selesai || '';
        document.getElementById('fs_skp').value = item.skp || '';
        document.getElementById('fs_jpl').value = item.jpl || '';
        
        if (userRole === 'user') inputNama.readOnly = true;

        document.getElementById('fs_old_file_sertifikat').value = item.file_sertifikat || '';
        document.getElementById('file_info_sertif').innerHTML = item.file_sertifikat ? `File saat ini: <a href="${item.file_sertifikat}" target="_blank">Lihat</a>` : '';
        modalForm.style.display = 'flex';
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btnSimpanSertif'); btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Menyimpan...`; btn.disabled = true;
        
        try {
            const dataObj = Object.fromEntries(new FormData(form).entries());
            const idData = dataObj.id; delete dataObj.id;
            Object.keys(dataObj).forEach(key => { if (dataObj[key] === "") dataObj[key] = null; });

            if (userRole === 'user' && currentUserData) { dataObj.nik = currentUserData.nik; dataObj.nama = currentUserData.nama; }

            const fileInput = document.getElementById('fs_file_sertifikat');
            let finalFileUrl = document.getElementById('fs_old_file_sertifikat').value; 
            if (fileInput.files[0]) {
                const file = fileInput.files[0];
                const uniqueName = `Sertifikat_${Date.now()}_${Math.random().toString(36).substring(2,7)}.${file.name.split('.').pop()}`;
                const { error: errUp } = await supabase.storage.from('lampiran').upload(uniqueName, file, { upsert: false });
                if (errUp) throw errUp;
                finalFileUrl = supabase.storage.from('lampiran').getPublicUrl(uniqueName).data.publicUrl;
            }

            dataObj.file_sertifikat = finalFileUrl === "" ? null : finalFileUrl;
            
            let res;
            if (idData) res = await supabase.from('sertifikat_pegawai').update(dataObj).eq('id', idData);
            else res = await supabase.from('sertifikat_pegawai').insert([dataObj]);
            
            if (res.error) throw res.error; 

            alert("Data Sertifikat berhasil disimpan!"); modalForm.style.display = 'none'; loadData(); 
        } catch (err) {
            console.error("Error Detail:", err); alert("Gagal menyimpan Sertifikat: " + err.message); 
        } finally {
            btn.innerHTML = `Simpan Sertifikat`; btn.disabled = false; 
        }
    });

    window.hapusSertif = async (id) => { if(confirm('Hapus dokumen ini?')) { await supabase.from('sertifikat_pegawai').delete().eq('id', id); loadData(); } };
    document.getElementById('btnTutupFormSertif').onclick = () => modalForm.style.display = 'none';
}
