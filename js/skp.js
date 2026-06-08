import { supabase } from './koneksi.js';

export function renderSKP(container, userRole = 'superadmin', userNik = null) {
    container.innerHTML = `
        <style>
            .btn { padding: 8px 15px; border: none; border-radius: 4px; cursor: pointer; color: white; font-weight: 600; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 5px; }
            .btn-edit { background: #f59e0b; } .btn-hapus { background: #ef4444; } .btn-tambah, .btn-simpan { background: #10b981; } .btn-excel { background: #16a34a; } .btn-pdf { background: #dc2626; } .btn-link { background: #64748b; }
            table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; font-size: 0.9rem;} th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; } th { background: #f8fafc; color: #475569;}
            .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .filter-group { display: flex; gap: 10px; flex: 1; } .filter-group input, .filter-group select { padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 4px; outline: none; } .filter-group input{width:250px;}
            .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); align-items: flex-start; justify-content: center; z-index: 9999; padding: 20px; }
            .modal-content { background: white; padding: 30px; border-radius: 8px; width: 850px; max-width: 100%; max-height: 90vh; overflow-y: auto; margin-top: 2vh; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;}
            .form-group label { display: block; font-weight: 600; font-size: 0.85rem; color: #475569; margin-bottom: 4px;} .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; outline: none;} .form-group input[readonly] { background: #e2e8f0; cursor: not-allowed; font-weight:bold;}
            fieldset { border: 1px solid #e2e8f0; padding: 15px; border-radius: 6px; margin-bottom: 15px; background: #fafafa;} legend { font-weight: bold; background: #3b82f6; color: white; padding: 4px 10px; border-radius: 4px; font-size: 0.9rem;}
        </style>

        <div class="toolbar">
            <div class="filter-group">
                <input type="text" id="inputCariSKP" placeholder="🔍 Cari NIK atau Nama...">
                <select id="filterTahunSKP"><option value="">Semua Tahun</option></select>
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="btn btn-excel" id="btnExportExcelSKP"><i class="fas fa-file-excel"></i> Excel</button>
                <button class="btn btn-pdf" id="btnExportPDFSKP"><i class="fas fa-file-pdf"></i> PDF</button>
                <button class="btn btn-tambah" id="btnTambahSKP"><i class="fas fa-plus"></i> Tambah SKP</button>
            </div>
        </div>

        <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <table>
                <thead><tr><th>Pegawai</th><th>Jabatan</th><th>Tahun</th><th>Capaian Org.</th><th>Predikat Pegawai</th><th>Aksi</th></tr></thead>
                <tbody id="tabelSKP"><tr><td colspan="6" style="text-align:center;">Memuat data...</td></tr></tbody>
            </table>
        </div>

        <div class="modal" id="modalFormSKP">
            <div class="modal-content">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid #ccc; padding-bottom:10px; margin-bottom: 20px;">
                    <h3 id="modalTitleSKP" style="margin:0;"><i class="fas fa-edit" style="color:#0ea5e9;"></i> Form SKP</h3>
                    <button class="btn btn-hapus" id="btnTutupFormSKP"><i class="fas fa-times"></i></button>
                </div>
                <form id="formSKP">
                    <input type="hidden" name="id" id="fskp_id">
                    <fieldset><legend>Data Pegawai</legend>
                        <div class="grid-2">
                            <datalist id="list_pegawai_skp"></datalist>
                            <div class="form-group" style="grid-column: span 2;">
                                <label>Nama Lengkap</label>
                                <input type="text" name="nama" id="fskp_nama" list="list_pegawai_skp" placeholder="Ketik nama..." required autocomplete="off">
                            </div>
                            <div class="form-group"><label>NIK</label><input type="text" name="nik" id="fskp_nik" readonly required></div>
                            <div class="form-group"><label>NIP</label><input type="text" name="nip" id="fskp_nip" readonly></div>
                        </div>
                    </fieldset>
                    <fieldset><legend>Detail Penilaian SKP</legend>
                        <div class="grid-2">
                            <div class="form-group"><label>Tahun SKP</label><input type="number" name="tahun_skp" id="fskp_tahun_skp" required></div>
                            <div class="form-group"><label>Jabatan Saat Penilaian</label><input type="text" name="jabatan" id="fskp_jabatan" required></div>
                            <div class="form-group"><label>Pejabat Penilai</label><input type="text" name="pejabat_penilai" id="fskp_pejabat_penilai" required></div>
                            <div class="form-group"><label>Atasan Pejabat Penilai</label><input type="text" name="atasan_pejabat_penilai" id="fskp_atasan_pejabat_penilai" required></div>
                        </div>
                    </fieldset>
                    <fieldset><legend>Hasil Evaluasi Kinerja</legend>
                        <div class="grid-2">
                            <div class="form-group">
                                <label>Capaian Kinerja Organisasi</label>
                                <select name="capaian_kinerja_organisasi" id="fskp_capaian_kinerja_organisasi">
                                    <option value="" hidden>Pilih Capaian...</option>
                                    <option value="Sangat Baik">Sangat Baik</option><option value="Baik">Baik</option><option value="Cukup">Cukup</option><option value="Kurang">Kurang</option><option value="Sangat Kurang">Sangat Kurang</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Predikat Kinerja Pegawai</label>
                                <select name="predikat_kinerja_pegawai" id="fskp_predikat_kinerja_pegawai">
                                    <option value="" hidden>Pilih Predikat...</option>
                                    <option value="Sangat Baik">Sangat Baik</option><option value="Baik">Baik</option><option value="Butuh Perbaikan">Butuh Perbaikan</option><option value="Kurang">Kurang</option><option value="Sangat Kurang">Sangat Kurang</option>
                                </select>
                            </div>
                            <div class="form-group" style="grid-column: span 2;">
                                <label>Catatan / Rekomendasi</label>
                                <textarea name="catatan_rekomendasi" id="fskp_catatan_rekomendasi" rows="2" placeholder="Tambahkan catatan..."></textarea>
                            </div>
                            <div class="form-group" style="grid-column: span 2;">
                                <label>Upload Dokumen SKP (PDF/JPG/PNG)</label>
                                <input type="file" id="fskp_lampiran_skp" accept=".pdf, .jpg, .jpeg, .png">
                                <input type="hidden" id="fskp_old_lampiran">
                                <div id="file_info_skp" style="font-size: 0.8rem; margin-top: 5px; color:#64748b;"></div>
                            </div>
                        </div>
                    </fieldset>
                    <div style="text-align: right; margin-top: 15px;"><button type="submit" class="btn btn-simpan" id="btnSimpanSKP">Simpan SKP</button></div>
                </form>
            </div>
        </div>
    `;

    initLogikaSKP(userRole, userNik);
}

function initLogikaSKP(userRole, userNik) {
    const tbody = document.getElementById('tabelSKP');
    const modalForm = document.getElementById('modalFormSKP');
    const form = document.getElementById('formSKP');
    let currentData = []; let daftarPegawai = []; let currentUserData = null;

    async function initUserContext() {
        if (userRole === 'user' && userNik) {
            const { data } = await supabase.from('pegawai').select('nik, nama, nip, jabatan').eq('nik', userNik).single();
            currentUserData = data;
        }
    }

    async function loadData() {
        let query = supabase.from('skp_pegawai').select('*').order('tahun_skp', { ascending: false });
        if (userRole === 'user' && userNik) query = query.eq('nik', userNik);
        
        const { data, error } = await query;
        if (error) { tbody.innerHTML = `<tr><td colspan="6">Error: ${error.message}</td></tr>`; return; }
        currentData = data || [];
        
        const tahunList = [...new Set(currentData.map(i => i.tahun_skp).filter(Boolean))].sort((a,b) => b-a);
        document.getElementById('filterTahunSKP').innerHTML = `<option value="">Semua Tahun</option>` + tahunList.map(t => `<option value="${t}">${t}</option>`).join('');

        renderTabel(currentData);
    }

    async function loadDataPegawai() {
        if (userRole === 'user') return; 
        const { data } = await supabase.from('pegawai').select('nik, nama, nip');
        if (data) { daftarPegawai = data; document.getElementById('list_pegawai_skp').innerHTML = data.map(p => `<option value="${p.nama}">`).join(''); }
    }

    initUserContext().then(() => { loadData(); loadDataPegawai(); });

    const inputNama = document.getElementById('fskp_nama'); const inputNik = document.getElementById('fskp_nik'); const inputNip = document.getElementById('fskp_nip');
    if (userRole !== 'user') {
        inputNama.addEventListener('input', (e) => {
            const p = daftarPegawai.find(x => x.nama === e.target.value);
            if(p) { inputNik.value = p.nik; inputNip.value = p.nip || ''; } else { inputNik.value = ''; inputNip.value = ''; }
        });
    }

    function renderTabel(data) {
        if (data.length === 0) { tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Belum ada arsip SKP.</td></tr>`; return; }
        
        const keyword = document.getElementById('inputCariSKP').value.toLowerCase();
        const tahun = document.getElementById('filterTahunSKP').value;
        const filtered = data.filter(i => {
            const matchKW = (i.nama && i.nama.toLowerCase().includes(keyword)) || (i.nik && i.nik.includes(keyword));
            const matchTahun = tahun === "" || i.tahun_skp == tahun; return matchKW && matchTahun;
        });

        tbody.innerHTML = filtered.map(row => `
            <tr>
                <td><strong>${row.nama || '-'}</strong><br><small>${row.nik || '-'}</small></td>
                <td>${row.jabatan || '-'}</td>
                <td><span style="background:#e0f2fe; color:#0369a1; padding: 4px 10px; border-radius: 4px; font-weight:bold;">${row.tahun_skp || '-'}</span></td>
                <td>${row.capaian_kinerja_organisasi || '-'}</td>
                <td>${row.predikat_kinerja_pegawai ? `<span style="background:#dcfce7; color:#059669; padding: 4px 10px; border-radius: 4px;">${row.predikat_kinerja_pegawai}</span>` : '-'}</td>
                <td>
                    ${row.lampiran_skp ? `<a href="${row.lampiran_skp}" target="_blank" class="btn btn-link"><i class="fas fa-download"></i></a>` : ''}
                    <button class="btn btn-edit" onclick="bukaFormSKP('${row.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-hapus" onclick="hapusSKP('${row.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    }

    document.getElementById('inputCariSKP').addEventListener('input', () => renderTabel(currentData));
    document.getElementById('filterTahunSKP').addEventListener('change', () => renderTabel(currentData));

    document.getElementById('btnTambahSKP').onclick = () => {
        form.reset(); document.getElementById('fskp_id').value = ''; document.getElementById('fskp_old_lampiran').value = ''; document.getElementById('file_info_skp').innerHTML = '';
        document.getElementById('modalTitleSKP').innerHTML = `<i class="fas fa-plus" style="color:#10b981;"></i> Tambah SKP`;
        if (userRole === 'user' && currentUserData) {
            inputNama.value = currentUserData.nama; inputNama.readOnly = true;
            inputNik.value = currentUserData.nik; inputNip.value = currentUserData.nip || '';
            document.getElementById('fskp_jabatan').value = currentUserData.jabatan || '';
        }
        modalForm.style.display = 'flex';
    };

    window.bukaFormSKP = (id) => {
        form.reset(); document.getElementById('modalTitleSKP').innerHTML = `<i class="fas fa-edit" style="color:#f59e0b;"></i> Edit SKP`;
        const item = currentData.find(p => p.id === id);
        if(!item) return;

        Object.keys(item).forEach(key => { const el = document.getElementById(`fskp_${key}`); if(el && key !== 'lampiran_skp') el.value = item[key] || ''; });
        if (userRole === 'user') inputNama.readOnly = true;

        document.getElementById('fskp_old_lampiran').value = item.lampiran_skp || '';
        document.getElementById('file_info_skp').innerHTML = item.lampiran_skp ? `File saat ini: <a href="${item.lampiran_skp}" target="_blank">Lihat</a>` : '';
        modalForm.style.display = 'flex';
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btnSimpanSKP'); btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Menyimpan...`; btn.disabled = true;
        
        try {
            const dataObj = Object.fromEntries(new FormData(form).entries());
            const idData = dataObj.id; delete dataObj.id;
            Object.keys(dataObj).forEach(key => { if (dataObj[key] === "") dataObj[key] = null; });

            if (userRole === 'user' && currentUserData) { 
                dataObj.nik = currentUserData.nik; dataObj.nama = currentUserData.nama; dataObj.nip = currentUserData.nip || null;
            }

            const fileInput = document.getElementById('fskp_lampiran_skp');
            let finalFileUrl = document.getElementById('fskp_old_lampiran').value; 
            if (fileInput.files[0]) {
                const file = fileInput.files[0];
                const uniqueName = `SKP_${Date.now()}_${Math.random().toString(36).substring(2,7)}.${file.name.split('.').pop()}`;
                const { error: errUp } = await supabase.storage.from('lampiran').upload(uniqueName, file, { upsert: false });
                if (errUp) throw errUp;
                finalFileUrl = supabase.storage.from('lampiran').getPublicUrl(uniqueName).data.publicUrl;
            }

            dataObj.lampiran_skp = finalFileUrl === "" ? null : finalFileUrl;
            
            let res;
            if (idData) res = await supabase.from('skp_pegawai').update(dataObj).eq('id', idData);
            else res = await supabase.from('skp_pegawai').insert([dataObj]);
            
            if (res.error) throw res.error; 

            alert("Data SKP berhasil disimpan!"); modalForm.style.display = 'none'; loadData(); 
        } catch (err) {
            console.error("Error Detail:", err); alert("Gagal menyimpan SKP: " + err.message); 
        } finally {
            btn.innerHTML = `Simpan SKP`; btn.disabled = false; 
        }
    });

    window.hapusSKP = async (id) => { if(confirm('Hapus dokumen ini?')) { await supabase.from('skp_pegawai').delete().eq('id', id); loadData(); } };
    document.getElementById('btnTutupFormSKP').onclick = () => modalForm.style.display = 'none';
}
