import { supabase } from './koneksi.js';

export function renderSKP(container, userRole = 'superadmin') {
    container.innerHTML = `
        <style>
            /* TOMBOL MODERN */
            .btn { padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; color: white; font-weight: 500; font-size: 0.875rem; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s ease; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
            .btn:hover { transform: translateY(-1px); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
            .btn-edit { background: #f59e0b; padding: 6px 12px; font-size: 0.8rem;}
            .btn-hapus { background: #ef4444; padding: 6px 12px; font-size: 0.8rem;}
            .btn-detail { background: #0ea5e9; padding: 6px 12px; font-size: 0.8rem; margin-right: 5px;}
            .btn-tambah { background: #0f172a; } /* Hitam pekat modern */
            .btn-tambah:hover { background: #1e293b; }
            .btn-import { background: #64748b; }
            .btn-excel { background: #10b981; }
            .btn-pdf { background: #f43f5e; }
            .btn-link { background: #f1f5f9; color: #475569; padding: 6px 12px; font-size: 0.8rem; border: 1px solid #cbd5e1; }
            .btn-link:hover { background: #e2e8f0; color: #0f172a; }
            
            /* TABEL MODERN SAAS */
            .table-container { background: white; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); overflow: hidden; margin-top: 15px;}
            table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
            th, td { padding: 14px 20px; text-align: left; }
            th { background: #f8fafc; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.75rem; border-bottom: 1px solid #e2e8f0; }
            td { color: #334155; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
            tbody tr:hover { background-color: #f8fafc; }
            tbody tr:last-child td { border-bottom: none; }
            
            /* TOOLBAR */
            .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; background: white; padding: 16px 20px; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05); }
            .filter-group { display: flex; gap: 12px; flex: 1; }
            .filter-group input, .filter-group select { padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; transition: all 0.2s; background: #f8fafc; font-size: 0.875rem; color: #334155; }
            .filter-group input:focus, .filter-group select:focus { border-color: #0ea5e9; background: white; box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1); }
            .filter-group input { width: 300px; }
            
            /* MODAL SCROLL PENUH */
            .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); align-items: flex-start; justify-content: center; z-index: 9999; padding: 20px; }
            .modal-content { background: white; padding: 32px; border-radius: 12px; width: 900px; max-width: 100%; max-height: 90vh; overflow-y: auto; margin-top: 2vh; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); border: 1px solid #e2e8f0;}
            
            /* FORM MODERN */
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;}
            .form-group label { display: block; font-weight: 600; font-size: 0.85rem; color: #475569; margin-bottom: 6px;}
            .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; background: #f8fafc; transition: all 0.2s; font-size: 0.9rem;}
            .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #3b82f6; background: white; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
            .form-group input[readonly] { background: #e2e8f0; cursor: not-allowed; color: #64748b; }
            
            fieldset { border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin-bottom: 24px; background: white; box-shadow: 0 1px 2px rgba(0,0,0,0.02);}
            legend { font-weight: 600; background: #f1f5f9; color: #334155; padding: 6px 14px; border-radius: 6px; font-size: 0.85rem; border: 1px solid #e2e8f0; letter-spacing: 0.02em;}

            .detail-item { border-bottom: 1px solid #f1f5f9; padding: 12px 0; display: flex; flex-direction: column;}
            .detail-label { font-size: 0.75rem; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;}
            .detail-value { font-size: 0.95rem; color: #0f172a; font-weight: 500; margin-top: 6px; word-wrap: break-word; white-space: normal; }
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
                        <th>Pejabat Penilai</th>
                        <th>Tahun</th>
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
                            <div class="form-group">
                                <label>NIK (Otomatis Terisi)</label>
                                <input type="text" name="nik" id="form_nik_skp" placeholder="NIK" readonly required>
                            </div>
                            <div class="form-group">
                                <label>NIP (Otomatis Terisi jika ada)</label>
                                <input type="text" name="nip" id="form_nip_skp" placeholder="NIP" readonly>
                            </div>
                            <div class="form-group" style="grid-column: span 2;">
                                <label>Jabatan Saat Ini</label>
                                <input type="text" name="jabatan" id="form_jabatan_skp" placeholder="Jabatan">
                            </div>
                        </div>
                    </fieldset>

                    <fieldset><legend>Detail Penilaian SKP</legend>
                        <div class="grid-2">
                            <div class="form-group">
                                <label>Pejabat Penilai</label>
                                <input type="text" name="pejabat_penilai" id="form_pejabat_penilai" placeholder="Nama Pejabat Penilai" required>
                            </div>
                            <div class="form-group">
                                <label>Atasan Pejabat Penilai</label>
                                <input type="text" name="atasan_pejabat_penilai" id="form_atasan_pejabat_penilai" placeholder="Nama Atasan Pejabat Penilai" required>
                            </div>
                            <div class="form-group">
                                <label>Tahun SKP</label>
                                <input type="number" name="tahun_skp" id="form_tahun_skp" min="2000" max="2099" step="1" placeholder="Misal: 2023" required>
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
    
    // Tombol Export
    const btnExportExcel = document.getElementById('btnExportExcelSKP');
    const btnExportPDF = document.getElementById('btnExportPDFSKP');
    
    // Variabel Penampung
    let currentData = [];
    let daftarPegawai = []; 

    // ==========================================
    // 0. LOGIKA EXPORT EXCEL & PDF
    // ==========================================
    // Sembunyikan tombol export jika login sebagai user/pegawai biasa
    if (userRole !== 'superadmin' && userRole !== 'admin') {
        if(btnExportExcel) btnExportExcel.style.display = 'none';
        if(btnExportPDF) btnExportPDF.style.display = 'none';
    }

    if(btnExportExcel) {
        btnExportExcel.addEventListener('click', () => {
            if (!currentData || currentData.length === 0) {
                alert("Data belum termuat atau tabel kosong. Tidak ada yang bisa di-export.");
                return;
            }
            try {
                // Menyiapkan data yang lebih rapi untuk Excel
                const dataForExcel = currentData.map(item => ({
                    "NIK": item.nik,
                    "NIP": item.nip || "-",
                    "Nama Pegawai": item.nama,
                    "Jabatan": item.jabatan || "-",
                    "Pejabat Penilai": item.pejabat_penilai,
                    "Atasan Pejabat Penilai": item.atasan_pejabat_penilai,
                    "Tahun SKP": item.tahun_skp,
                    "Link File": item.lampiran_skp || "Tidak ada file"
                }));

                const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "Data SKP Pegawai");
                XLSX.writeFile(workbook, `Data_SKP_Pegawai_${new Date().toISOString().split('T')[0]}.xlsx`);
            } catch (err) {
                alert("Gagal memproses Excel. Error: " + err.message);
            }
        });
    }

    if(btnExportPDF) {
        btnExportPDF.addEventListener('click', () => {
            if (!currentData || currentData.length === 0) {
                alert("Data belum termuat atau tabel kosong. Tidak ada yang bisa di-export.");
                return;
            }
            try {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF('landscape'); 
                doc.text("Laporan Sasaran Kinerja Pegawai (SKP)", 14, 15);
                
                const tableColumn = ["NIK", "Nama Pegawai", "NIP", "Jabatan", "Pejabat Penilai", "Atasan Penilai", "Tahun"];
                const tableRows = [];
                
                currentData.forEach(item => {
                    const itemData = [
                        item.nik || '-', 
                        item.nama || '-', 
                        item.nip || '-', 
                        item.jabatan || '-',
                        item.pejabat_penilai || '-', 
                        item.atasan_pejabat_penilai || '-', 
                        item.tahun_skp || '-'
                    ];
                    tableRows.push(itemData);
                });
                
                doc.autoTable({ 
                    head: [tableColumn], 
                    body: tableRows, 
                    startY: 20, 
                    theme: 'grid', 
                    styles: { fontSize: 8 }
                });
                doc.save(`Data_SKP_Pegawai_${new Date().toISOString().split('T')[0]}.pdf`);
            } catch (err) {
                alert("Gagal memproses PDF. Error: " + err.message);
            }
        });
    }

    // ==========================================
    // 1. LOAD DATA SKP & DATA PEGAWAI (AUTOCOMPLETE)
    // ==========================================
    async function loadData() {
        try {
            const { data, error } = await supabase.from('skp_pegawai').select('*').order('tahun_skp', { ascending: false });
            if (error) throw error;
            currentData = data || []; 
            renderTabel(currentData); 
        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="5" style="color:red; text-align:center;"><b>Error Sistem:</b> ${err.message}</td></tr>`;
        }
    }

    async function loadDataPegawai() {
        // Tarik nik, nama, nip, dan jabatan untuk Autofill form
        const { data, error } = await supabase.from('pegawai').select('nik, nama, nip, jabatan');
        if (!error && data) {
            daftarPegawai = data;
            const dataList = document.getElementById('list_pegawai_skp');
            dataList.innerHTML = data.map(p => `<option value="${p.nama}">`).join('');
        }
    }

    // Eksekusi load data awal
    loadData();
    loadDataPegawai();

    // ==========================================
    // 2. LOGIKA AUTO-FILL BERDASARKAN NAMA
    // ==========================================
    const inputNama = document.getElementById('form_nama_skp');
    const inputNik = document.getElementById('form_nik_skp');
    const inputNip = document.getElementById('form_nip_skp');
    const inputJabatan = document.getElementById('form_jabatan_skp');

    inputNama.addEventListener('input', (e) => {
        const namaDipilih = e.target.value;
        const pegawaiDitemukan = daftarPegawai.find(p => p.nama === namaDipilih);
        
        if (pegawaiDitemukan) {
            inputNik.value = pegawaiDitemukan.nik || '';
            inputNip.value = pegawaiDitemukan.nip || '';
            inputJabatan.value = pegawaiDitemukan.jabatan || '';
            
            inputNik.style.backgroundColor = '#e2e8f0';
            inputNip.style.backgroundColor = '#e2e8f0';
        } else {
            inputNik.value = ''; 
            inputNip.value = '';
            inputNik.style.backgroundColor = '#f1f5f9';
            inputNip.style.backgroundColor = '#f1f5f9';
        }
    });

    // ==========================================
    // 3. RENDER TABEL & PENCARIAN
    // ==========================================
    function renderTabel(data) {
        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px;">Belum ada data SKP pegawai.</td></tr>`;
            return;
        }

        tbody.innerHTML = data.map(row => `
            <tr>
                <td><strong>${row.nama || '-'}</strong><br><span style="color:#64748b; font-size:0.8rem;">NIK: ${row.nik || '-'}</span></td>
                <td>${row.jabatan || '-'}</td>
                <td>${row.pejabat_penilai || '-'}</td>
                <td><span style="background:#e0f2fe; color:#0369a1; padding: 4px 10px; border-radius: 4px; font-weight:bold;">${row.tahun_skp || '-'}</span></td>
                <td>
                    <button class="btn btn-detail" onclick="bukaDetailSKP('${row.id}')" title="Lihat Detail"><i class="fas fa-eye"></i></button>
                    ${row.lampiran_skp ? `<a href="${row.lampiran_skp}" target="_blank" class="btn btn-link" title="Buka Dokumen"><i class="fas fa-file-download"></i></a>` : ''}
                    <button class="btn btn-edit" onclick="bukaFormSKP('${row.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-hapus" onclick="hapusSKP('${row.id}')" title="Hapus"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    }

    if(inputCari) {
        inputCari.addEventListener('input', () => {
            const keyword = inputCari.value.toLowerCase();
            const dataTersaring = currentData.filter(item => {
                return (item.nama && item.nama.toLowerCase().includes(keyword)) || 
                       (item.nik && item.nik.toLowerCase().includes(keyword)) ||
                       (item.tahun_skp && item.tahun_skp.toString().includes(keyword));
            });
            renderTabel(dataTersaring);
        });
    }

    // ==========================================
    // 4. FITUR DETAIL SKP
    // ==========================================
    window.bukaDetailSKP = (id) => {
        const item = currentData.find(p => p.id === id);
        if(!item) return;
        
        kontenDetail.innerHTML = '';
        const kolomTampil = [
            { key: 'nik', label: 'NIK Pegawai' }, { key: 'nip', label: 'NIP Pegawai' },
            { key: 'nama', label: 'Nama Pegawai' }, { key: 'jabatan', label: 'Jabatan' },
            { key: 'pejabat_penilai', label: 'Pejabat Penilai' }, { key: 'atasan_pejabat_penilai', label: 'Atasan Pejabat Penilai' },
            { key: 'tahun_skp', label: 'Tahun SKP' }, { key: 'lampiran_skp', label: 'Dokumen Lampiran SKP' }
        ];

        kolomTampil.forEach(col => {
            const div = document.createElement('div');
            div.className = 'detail-item';
            let nilai = item[col.key] || "-";
            
            if(col.key === 'lampiran_skp' && item[col.key]) {
                nilai = `<a href="${item[col.key]}" target="_blank" style="color:#0ea5e9; text-decoration:none;"><i class="fas fa-external-link-alt"></i> Klik untuk Buka Lampiran</a>`;
            }

            div.innerHTML = `<span class="detail-label">${col.label}</span><span class="detail-value">${nilai}</span>`;
            if(col.key === 'nama' || col.key === 'lampiran_skp') div.style.gridColumn = 'span 2';
            kontenDetail.appendChild(div);
        });
        modalDetail.style.display = 'flex';
    };

    if(document.getElementById('btnTutupDetailSKP')) {
        document.getElementById('btnTutupDetailSKP').onclick = () => modalDetail.style.display = 'none';
    }

    // ==========================================
    // 5. FORM TAMBAH / EDIT
    // ==========================================
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

        // Isi form otomatis dengan data lama
        Object.keys(item).forEach(key => {
            const inputElement = document.getElementById(`form_${key}_skp`); // perhatikan penambahan _skp
            if(inputElement && key !== 'lampiran_skp') {
                inputElement.value = item[key] || '';
            }
            // Karena nama element di HTML tanpa "_skp" untuk beberapa input, kita mapping manual jika gagal
            const inputNormal = document.getElementById(`form_${key}`);
            if(inputNormal && key !== 'lampiran_skp') {
                inputNormal.value = item[key] || '';
            }
        });

        document.getElementById('form_old_file_skp').value = item.lampiran_skp || '';
        const fileInfo = document.getElementById('file_lama_info_skp');
        if (item.lampiran_skp) {
            fileInfo.innerHTML = `File saat ini: <a href="${item.lampiran_skp}" target="_blank">Lihat Dokumen</a> (Biarkan kosong jika tidak ingin mengganti file)`;
        } else {
            fileInfo.innerHTML = 'Belum ada file lampiran yang diupload.';
        }

        modalForm.style.display = 'flex';
    };

    // ==========================================
    // 6. LOGIKA SIMPAN & UPLOAD KE STORAGE
    // ==========================================
    if(form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btnSimpan = document.getElementById('btnSimpanSKP');
            btnSimpan.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Menyimpan Data & File...`;
            btnSimpan.disabled = true;
            
            const formData = new FormData(form);
            const dataObj = Object.fromEntries(formData.entries());
            const idData = dataObj.id;
            delete dataObj.id;

            Object.keys(dataObj).forEach(key => { 
                if (dataObj[key] === "") dataObj[key] = null; 
            });

            // Logika upload file ke Supabase Storage ('lampiran')
            const fileInput = document.getElementById('form_file_skp');
            const file = fileInput.files[0];
            let finalFileUrl = document.getElementById('form_old_file_skp').value; 

            if (file) {
                const fileExt = file.name.split('.').pop();
                const uniqueFileName = `SKP_${Date.now()}_${Math.random().toString(36).substring(2,9)}.${fileExt}`;
                
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('lampiran')
                    .upload(uniqueFileName, file, { cacheControl: '3600', upsert: false });

                if (uploadError) {
                    alert("Gagal mengupload file!\nPastikan bucket 'lampiran' sudah dibuat dan public.\nPesan: " + uploadError.message);
                    btnSimpan.innerHTML = `<i class="fas fa-save"></i> Simpan Data`;
                    btnSimpan.disabled = false;
                    return; 
                }

                const { data: publicUrlData } = supabase.storage.from('lampiran').getPublicUrl(uniqueFileName);
                finalFileUrl = publicUrlData.publicUrl;
            }

            // Simpan link file ke objek database
            dataObj.lampiran_skp = finalFileUrl === "" ? null : finalFileUrl;

            if (idData) {
                await supabase.from('skp_pegawai').update(dataObj).eq('id', idData);
            } else {
                await supabase.from('skp_pegawai').insert([dataObj]);
            }
            
            btnSimpan.innerHTML = `<i class="fas fa-save"></i> Simpan Data`;
            btnSimpan.disabled = false;
            modalForm.style.display = 'none';
            loadData(); 
        });
    }

    // ==========================================
    // 7. FITUR HAPUS
    // ==========================================
    window.hapusSKP = async (id) => {
        if(confirm('Yakin ingin menghapus SKP ini? Data tidak bisa dikembalikan.')) {
            await supabase.from('skp_pegawai').delete().eq('id', id);
            loadData(); 
        }
    };

    if(document.getElementById('btnTutupFormSKP')) {
        document.getElementById('btnTutupFormSKP').onclick = () => modalForm.style.display = 'none';
    }
}
