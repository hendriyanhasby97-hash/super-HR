import { supabase } from './koneksi.js';

export function renderSKP(container, userRole = 'superadmin') {
    container.innerHTML = `
        <style>
            .btn { padding: 8px 15px; border: none; border-radius: 4px; cursor: pointer; color: white; font-weight: 600; display: inline-flex; align-items: center; gap: 5px; }
            .btn-edit { background: #f59e0b; padding: 6px 10px; font-size: 0.85rem;}
            .btn-hapus { background: #ef4444; padding: 6px 10px; font-size: 0.85rem;}
            .btn-detail { background: #0ea5e9; padding: 6px 10px; font-size: 0.85rem; margin-right: 5px;}
            .btn-tambah { background: #10b981; }
            .btn-link { background: #64748b; padding: 6px 10px; font-size: 0.85rem;}
            .btn-excel { background: #16a34a; }
            .btn-pdf { background: #dc2626; }
            
            table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; font-size: 0.9rem;}
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
            th { background: #f8fafc; }
            
            .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .filter-group { display: flex; gap: 10px; flex: 1; }
            .filter-group input { padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 4px; outline: none; width: 300px; }
            
            .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); align-items: flex-start; justify-content: center; z-index: 9999; padding: 20px; }
            .modal-content { background: white; padding: 30px; border-radius: 8px; width: 800px; max-width: 100%; max-height: 90vh; overflow-y: auto; margin-top: 2vh; }
            
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;}
            .form-group label { display: block; font-weight: 600; font-size: 0.85rem; color: #475569; margin-bottom: 4px;}
            .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; outline: none;}
            .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #3b82f6; }
            .form-group input[readonly] { background: #f1f5f9; cursor: not-allowed; }
            
            fieldset { border: 1px solid #e2e8f0; padding: 15px; border-radius: 6px; margin-bottom: 15px; background: #fafafa;}
            legend { font-weight: bold; background: #3b82f6; color: white; padding: 4px 10px; border-radius: 4px; font-size: 0.9rem;}

            .detail-item { border-bottom: 1px dashed #e2e8f0; padding: 8px 0; display: flex; flex-direction: column;}
            .detail-label { font-size: 0.75rem; color: #64748b; font-weight: 600; text-transform: uppercase;}
            .detail-value { font-size: 0.95rem; color: #1e293b; font-weight: 500; margin-top: 3px; word-wrap: break-word; white-space: normal; }
        </style>

        <div class="toolbar">
            <div class="filter-group">
                <input type="text" id="inputCariSKP" placeholder="🔍 Cari NIK, Nama, atau Tahun SKP...">
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="btn btn-excel" id="btnExportExcelSKP"><i class="fas fa-file-excel"></i> Excel</button>
                <button class="btn btn-pdf" id="btnExportPDFSKP"><i class="fas fa-file-pdf"></i> PDF</button>
                <button class="btn btn-tambah" id="btnTambahSKP"><i class="fas fa-plus"></i> Tambah SKP</button>
            </div>
        </div>

        <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <table>
                <thead>
                    <tr>
                        <th>Pegawai</th>
                        <th>Jabatan</th>
                        <th>Tahun</th>
                        <th>Predikat</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody id="tabelSKP"><tr><td colspan="5" style="text-align:center;">Memuat data...</td></tr></tbody>
            </table>
        </div>

        <div class="modal" id="modalFormSKP">
            <div class="modal-content">
                <h3 id="modalTitleSKP" style="margin-bottom: 15px; border-bottom: 1px solid #ccc; padding-bottom:10px;">Form Sasaran Kinerja Pegawai</h3>
                <form id="formSKP">
                    <input type="hidden" name="id" id="form_id_skp">
                    
                    <fieldset><legend>Data Pegawai</legend>
                        <div class="grid-2">
                            <datalist id="list_pegawai_skp"></datalist>
                            <div class="form-group" style="grid-column: span 2;">
                                <label>Nama Lengkap (Ketik untuk mencari)</label>
                                <input type="text" name="nama" id="form_nama_skp" list="list_pegawai_skp" placeholder="Ketik nama pegawai..." autocomplete="off" required>
                            </div>
                            <div class="form-group"><label>NIK</label><input type="text" name="nik" id="form_nik_skp" readonly required></div>
                            <div class="form-group"><label>NIP</label><input type="text" name="nip" id="form_nip_skp" readonly></div>
                            <div class="form-group" style="grid-column: span 2;"><label>Jabatan Saat Ini</label><input type="text" name="jabatan" id="form_jabatan_skp"></div>
                        </div>
                    </fieldset>

                    <fieldset><legend>Detail Penilaian SKP</legend>
                        <div class="grid-2">
                            <div class="form-group"><label>Pejabat Penilai</label><input type="text" name="pejabat_penilai" id="form_pejabat_penilai" required></div>
                            <div class="form-group"><label>Atasan Pejabat Penilai</label><input type="text" name="atasan_pejabat_penilai" id="form_atasan_pejabat_penilai" required></div>
                            <div class="form-group" style="grid-column: span 2;"><label>Tahun SKP</label><input type="number" name="tahun_skp" id="form_tahun_skp" required></div>
                        </div>
                    </fieldset>

                    <fieldset><legend>Hasil Evaluasi Kinerja</legend>
                        <div class="grid-2">
                            <div class="form-group">
                                <label>Capaian Kinerja Organisasi</label>
                                <select name="capaian_kinerja_organisasi" id="form_capaian_kinerja_organisasi">
                                    <option value="" hidden>Pilih Capaian...</option>
                                    <option value="Sangat Baik">Sangat Baik</option>
                                    <option value="Baik">Baik</option>
                                    <option value="Cukup">Cukup</option>
                                    <option value="Kurang">Kurang</option>
                                    <option value="Sangat Kurang">Sangat Kurang</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Predikat Kinerja Pegawai</label>
                                <select name="predikat_kinerja_pegawai" id="form_predikat_kinerja_pegawai">
                                    <option value="" hidden>Pilih Predikat...</option>
                                    <option value="Sangat Baik">Sangat Baik</option>
                                    <option value="Baik">Baik</option>
                                    <option value="Butuh Perbaikan">Butuh Perbaikan</option>
                                    <option value="Kurang">Kurang</option>
                                    <option value="Sangat Kurang">Sangat Kurang</option>
                                </select>
                            </div>
                            <div class="form-group" style="grid-column: span 2;">
                                <label>Catatan / Rekomendasi</label>
                                <textarea name="catatan_rekomendasi" id="form_catatan_rekomendasi" rows="3" placeholder="Tambahkan catatan atau rekomendasi..."></textarea>
                            </div>
                        </div>
                    </fieldset>

                    <fieldset><legend>Dokumen Lampiran</legend>
                        <div class="form-group">
                            <label>Upload File SKP (PDF/JPG/PNG)</label>
                            <input type="file" id="form_file_skp" accept=".pdf, .jpg, .jpeg, .png">
                            <input type="hidden" id="form_old_file_skp">
                            <div id="file_lama_info_skp" style="font-size: 0.8rem; margin-top: 5px; color:#64748b;"></div>
                        </div>
                    </fieldset>

                    <div style="text-align: right; margin-top: 15px;">
                        <button type="button" class="btn" style="background:#94a3b8;" id="btnTutupFormSKP">Batal</button>
                        <button type="submit" class="btn" style="background:#3b82f6;" id="btnSimpanSKP"><i class="fas fa-save"></i> Simpan Data</button>
                    </div>
                </form>
            </div>
        </div>

        <div class="modal" id="modalDetailSKP">
            <div class="modal-content">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid #ccc; padding-bottom:10px; margin-bottom: 20px;">
                    <h3 style="margin:0;"><i class="fas fa-file-signature" style="color:#0ea5e9;"></i> Detail Sasaran Kinerja Pegawai</h3>
                    <button class="btn" style="background:#ef4444; padding: 5px 10px;" id="btnTutupDetailSKP"><i class="fas fa-times"></i></button>
                </div>
                <div id="kontenDetailSKP" class="grid-2"></div>
            </div>
        </div>
    `;

    initLogikaSKP(userRole);
}

function initLogikaSKP(userRole) {
    const tbody = document.getElementById('tabelSKP');
    const modalForm = document.getElementById('modalFormSKP');
    const modalDetail = document.getElementById('modalDetailSKP');
    const form = document.getElementById('formSKP');
    const modalTitle = document.getElementById('modalTitleSKP');
    const kontenDetail = document.getElementById('kontenDetailSKP');
    const inputCari = document.getElementById('inputCariSKP');
    
    const btnExportExcel = document.getElementById('btnExportExcelSKP');
    const btnExportPDF = document.getElementById('btnExportPDFSKP');
    
    let currentData = [];
    let daftarPegawai = []; 

    if (userRole !== 'superadmin' && userRole !== 'admin') {
        if(btnExportExcel) btnExportExcel.style.display = 'none';
        if(btnExportPDF) btnExportPDF.style.display = 'none';
    }

    if(btnExportExcel) {
        btnExportExcel.addEventListener('click', () => {
            if (currentData.length === 0) return alert("Data kosong.");
            try {
                const dataForExcel = currentData.map(item => ({
                    "NIK": item.nik,
                    "NIP": item.nip || "-",
                    "Nama Pegawai": item.nama,
                    "Jabatan": item.jabatan || "-",
                    "Tahun SKP": item.tahun_skp,
                    "Pejabat Penilai": item.pejabat_penilai,
                    "Atasan Penilai": item.atasan_pejabat_penilai,
                    "Capaian Organisasi": item.capaian_kinerja_organisasi || "-",
                    "Predikat Pegawai": item.predikat_kinerja_pegawai || "-",
                    "Catatan/Rekomendasi": item.catatan_rekomendasi || "-",
                    "Link File": item.lampiran_skp || "Tidak ada file"
                }));
                const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "Data SKP");
                XLSX.writeFile(workbook, `Data_SKP_Pegawai_${new Date().toISOString().split('T')[0]}.xlsx`);
            } catch (err) { alert("Gagal memproses Excel."); }
        });
    }

    if(btnExportPDF) {
        btnExportPDF.addEventListener('click', () => {
            if (currentData.length === 0) return alert("Data kosong.");
            try {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF('landscape'); 
                doc.text("Laporan Sasaran Kinerja Pegawai (SKP)", 14, 15);
                
                const tableColumn = ["NIK", "Nama Pegawai", "Jabatan", "Tahun", "Capaian Org.", "Predikat"];
                const tableRows = currentData.map(item => [
                    item.nik || '-', item.nama || '-', item.jabatan || '-', item.tahun_skp || '-',
                    item.capaian_kinerja_organisasi || '-', item.predikat_kinerja_pegawai || '-'
                ]);
                
                doc.autoTable({ head: [tableColumn], body: tableRows, startY: 20, theme: 'grid', styles: { fontSize: 8 }});
                doc.save(`Data_SKP_Pegawai_${new Date().toISOString().split('T')[0]}.pdf`);
            } catch (err) { alert("Gagal memproses PDF."); }
        });
    }

    async function loadData() {
        try {
            const { data, error } = await supabase.from('skp_pegawai').select('*').order('tahun_skp', { ascending: false });
            if (error) throw error;
            currentData = data || []; 
            renderTabel(currentData); 
        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="5" style="color:red; text-align:center;"><b>Error:</b> ${err.message}</td></tr>`;
        }
    }

    async function loadDataPegawai() {
        const { data, error } = await supabase.from('pegawai').select('nik, nama, nip, jabatan');
        if (!error && data) {
            daftarPegawai = data;
            document.getElementById('list_pegawai_skp').innerHTML = data.map(p => `<option value="${p.nama}">`).join('');
        }
    }

    loadData();
    loadDataPegawai();

    const inputNama = document.getElementById('form_nama_skp');
    const inputNik = document.getElementById('form_nik_skp');
    const inputNip = document.getElementById('form_nip_skp');
    const inputJabatan = document.getElementById('form_jabatan_skp');

    inputNama.addEventListener('input', (e) => {
        const pegawaiDitemukan = daftarPegawai.find(p => p.nama === e.target.value);
        if (pegawaiDitemukan) {
            inputNik.value = pegawaiDitemukan.nik || '';
            inputNip.value = pegawaiDitemukan.nip || '';
            inputJabatan.value = pegawaiDitemukan.jabatan || '';
            inputNik.style.backgroundColor = '#e2e8f0';
        } else {
            inputNik.value = ''; inputNip.value = '';
            inputNik.style.backgroundColor = '#f1f5f9';
        }
    });

    function renderTabel(data) {
        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px;">Belum ada data SKP.</td></tr>`;
            return;
        }
        tbody.innerHTML = data.map(row => `
            <tr>
                <td><strong>${row.nama || '-'}</strong><br><span style="color:#64748b; font-size:0.8rem;">NIK: ${row.nik || '-'}</span></td>
                <td>${row.jabatan || '-'}</td>
                <td><span style="background:#e0f2fe; color:#0369a1; padding: 4px 10px; border-radius: 4px; font-weight:bold;">${row.tahun_skp || '-'}</span></td>
                <td>${row.predikat_kinerja_pegawai ? `<span style="background:#dcfce7; color:#059669; padding: 4px 10px; border-radius: 4px;">${row.predikat_kinerja_pegawai}</span>` : '-'}</td>
                <td>
                    <button class="btn btn-detail" onclick="bukaDetailSKP('${row.id}')"><i class="fas fa-eye"></i></button>
                    ${row.lampiran_skp ? `<a href="${row.lampiran_skp}" target="_blank" class="btn btn-link"><i class="fas fa-file-download"></i></a>` : ''}
                    <button class="btn btn-edit" onclick="bukaFormSKP('${row.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-hapus" onclick="hapusSKP('${row.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    }

    if(inputCari) {
        inputCari.addEventListener('input', () => {
            const keyword = inputCari.value.toLowerCase();
            renderTabel(currentData.filter(item => 
                (item.nama && item.nama.toLowerCase().includes(keyword)) || 
                (item.nik && item.nik.toLowerCase().includes(keyword)) ||
                (item.tahun_skp && item.tahun_skp.toString().includes(keyword))
            ));
        });
    }

    window.bukaDetailSKP = (id) => {
        const item = currentData.find(p => p.id === id);
        if(!item) return;
        kontenDetail.innerHTML = '';
        const kolomTampil = [
            { key: 'nik', label: 'NIK Pegawai' }, { key: 'nip', label: 'NIP Pegawai' },
            { key: 'nama', label: 'Nama Pegawai' }, { key: 'jabatan', label: 'Jabatan' },
            { key: 'tahun_skp', label: 'Tahun SKP' }, { key: 'lampiran_skp', label: 'Dokumen Lampiran SKP' },
            { key: 'pejabat_penilai', label: 'Pejabat Penilai' }, { key: 'atasan_pejabat_penilai', label: 'Atasan Pejabat Penilai' },
            { key: 'capaian_kinerja_organisasi', label: 'Capaian Kinerja Organisasi' }, { key: 'predikat_kinerja_pegawai', label: 'Predikat Kinerja Pegawai' },
            { key: 'catatan_rekomendasi', label: 'Catatan / Rekomendasi' }
        ];

        kolomTampil.forEach(col => {
            const div = document.createElement('div');
            div.className = 'detail-item';
            let nilai = item[col.key] || "-";
            if(col.key === 'lampiran_skp' && item[col.key]) nilai = `<a href="${item[col.key]}" target="_blank" style="color:#0ea5e9;">Buka Lampiran</a>`;
            
            div.innerHTML = `<span class="detail-label">${col.label}</span><span class="detail-value">${nilai}</span>`;
            if(['nama', 'lampiran_skp', 'catatan_rekomendasi'].includes(col.key)) div.style.gridColumn = 'span 2';
            kontenDetail.appendChild(div);
        });
        modalDetail.style.display = 'flex';
    };

    if(document.getElementById('btnTutupDetailSKP')) document.getElementById('btnTutupDetailSKP').onclick = () => modalDetail.style.display = 'none';

    if(document.getElementById('btnTambahSKP')) {
        document.getElementById('btnTambahSKP').onclick = () => {
            form.reset(); 
            document.getElementById('form_id_skp').value = ''; 
            document.getElementById('form_old_file_skp').value = '';
            document.getElementById('file_lama_info_skp').innerHTML = '';
            modalTitle.innerText = "Tambah SKP Baru";
            modalForm.style.display = 'flex';
        };
    }

    window.bukaFormSKP = (id) => {
        form.reset(); 
        modalTitle.innerText = "Edit Data SKP";
        const item = currentData.find(p => p.id === id);
        if(!item) return;

        Object.keys(item).forEach(key => {
            const inputElement = document.getElementById(`form_${key}_skp`); 
            if(inputElement && key !== 'lampiran_skp') inputElement.value = item[key] || '';
            const inputNormal = document.getElementById(`form_${key}`);
            if(inputNormal && key !== 'lampiran_skp') inputNormal.value = item[key] || '';
        });

        document.getElementById('form_old_file_skp').value = item.lampiran_skp || '';
        const fileInfo = document.getElementById('file_lama_info_skp');
        if (item.lampiran_skp) fileInfo.innerHTML = `File saat ini: <a href="${item.lampiran_skp}" target="_blank">Lihat Dokumen</a>`;
        else fileInfo.innerHTML = 'Belum ada file lampiran.';

        modalForm.style.display = 'flex';
    };

    if(form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btnSimpan = document.getElementById('btnSimpanSKP');
            btnSimpan.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Menyimpan...`;
            btnSimpan.disabled = true;
            
            const dataObj = Object.fromEntries(new FormData(form).entries());
            const idData = dataObj.id; delete dataObj.id;
            Object.keys(dataObj).forEach(key => { if (dataObj[key] === "") dataObj[key] = null; });

            const file = document.getElementById('form_file_skp').files[0];
            let finalFileUrl = document.getElementById('form_old_file_skp').value; 

            if (file) {
                const uniqueFileName = `SKP_${Date.now()}_${Math.random().toString(36).substring(2,9)}.${file.name.split('.').pop()}`;
                const { error: uploadError } = await supabase.storage.from('lampiran').upload(uniqueFileName, file, { cacheControl: '3600', upsert: false });
                if (uploadError) { alert("Upload Gagal!\nPesan: " + uploadError.message); btnSimpan.innerHTML = "Simpan Data"; btnSimpan.disabled = false; return; }
                finalFileUrl = supabase.storage.from('lampiran').getPublicUrl(uniqueFileName).data.publicUrl;
            }

            dataObj.lampiran_skp = finalFileUrl === "" ? null : finalFileUrl;

            if (idData) await supabase.from('skp_pegawai').update(dataObj).eq('id', idData);
            else await supabase.from('skp_pegawai').insert([dataObj]);
            
            btnSimpan.innerHTML = `<i class="fas fa-save"></i> Simpan Data`;
            btnSimpan.disabled = false;
            modalForm.style.display = 'none';
            loadData(); 
        });
    }

    window.hapusSKP = async (id) => {
        if(confirm('Yakin ingin menghapus SKP ini?')) {
            await supabase.from('skp_pegawai').delete().eq('id', id);
            loadData(); 
        }
    };

    if(document.getElementById('btnTutupFormSKP')) document.getElementById('btnTutupFormSKP').onclick = () => modalForm.style.display = 'none';
}
