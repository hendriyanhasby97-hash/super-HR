import { supabase } from './koneksi.js';

export function renderSertifikat(container, userRole = 'superadmin') {
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
                <input type="text" id="inputCariSertif" placeholder="🔍 Cari NIK, Nama, atau Judul Kegiatan...">
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="btn btn-excel" id="btnExportExcelSertif"><i class="fas fa-file-excel"></i> Excel</button>
                <button class="btn btn-pdf" id="btnExportPDFSertif"><i class="fas fa-file-pdf"></i> PDF</button>
                
                <button class="btn btn-tambah" id="btnTambahSertif"><i class="fas fa-plus"></i> Tambah Sertifikat</button>
            </div>
        </div>

        <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <table>
                <thead>
                    <tr>
                        <th>Pegawai</th>
                        <th>No. Sertifikat</th>
                        <th>Judul Kegiatan</th>
                        <th>Jenis</th>
                        <th>JPL/SKP</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody id="tabelSertifikat"><tr><td colspan="6" style="text-align:center;">Memuat data...</td></tr></tbody>
            </table>
        </div>

        <div class="modal" id="modalFormSertifikat">
            <div class="modal-content">
                <h3 id="modalTitleSertif" style="margin-bottom: 15px; border-bottom: 1px solid #ccc; padding-bottom:10px;">Form Sertifikat Pegawai</h3>
                <form id="formSertifikat">
                    <input type="hidden" name="id" id="form_id">
                    
                    <fieldset><legend>Data Pegawai</legend>
                        <div class="grid-2">
                            <datalist id="list_pegawai"></datalist>
                            
                            <div class="form-group">
                                <label>Nama Lengkap (Ketik untuk mencari)</label>
                                <input type="text" name="nama" id="form_nama" list="list_pegawai" placeholder="Ketik nama pegawai..." autocomplete="off" required>
                            </div>
                            <div class="form-group">
                                <label>NIK (Otomatis Terisi)</label>
                                <input type="text" name="nik" id="form_nik" placeholder="NIK akan terisi otomatis" readonly required>
                            </div>
                        </div>
                    </fieldset>

                    <fieldset><legend>Detail Sertifikat & Kegiatan</legend>
                        <div class="form-group" style="margin-bottom:15px;">
                            <label>Judul Kegiatan</label>
                            <textarea name="judul_kegiatan" id="form_judul_kegiatan" rows="2" required></textarea>
                        </div>
                        <div class="grid-2">
                            <div class="form-group"><label>No. Sertifikat</label><input type="text" name="no_sertifikat" id="form_no_sertifikat" required></div>
                            <div class="form-group">
                                <label>Jenis Sertifikat</label>
                                <select name="jenis_sertifikat" id="form_jenis_sertifikat" required>
                                    <option value="" hidden>Pilih Jenis...</option>
                                    <option value="Pelatihan">Pelatihan</option>
                                    <option value="Seminar">Seminar</option>
                                    <option value="Workshop">Workshop</option>
                                    <option value="Webinar">Webinar</option>
                                    <option value="Bimtek">Bimtek</option>
                                    <option value="Simposium">Simposium</option>
                                    <option value="Lainnya">Lainnya</option>
                                </select>
                            </div>
                            <div class="form-group"><label>Tanggal Pelaksanaan</label><input type="date" name="tanggal_pelaksanaan" id="form_tanggal_pelaksanaan"></div>
                            <div class="form-group"><label>Tanggal Mulai</label><input type="date" name="mulai" id="form_mulai"></div>
                            <div class="form-group"><label>Tanggal Selesai</label><input type="date" name="selesai" id="form_selesai"></div>
                        </div>
                    </fieldset>

                    <fieldset><legend>Penilaian & Dokumen Lampiran</legend>
                        <div class="grid-2">
                            <div class="form-group"><label>JPL (Jam Pelajaran)</label><input type="number" name="jpl" id="form_jpl" min="0" placeholder="Misal: 20"></div>
                            <div class="form-group"><label>Nilai SKP</label><input type="number" step="0.01" name="skp" id="form_skp" min="0" placeholder="Misal: 2.5"></div>
                            <div class="form-group" style="grid-column: span 2;">
                                <label>Upload File Sertifikat (PDF/JPG/PNG)</label>
                                <input type="file" id="form_file_sertifikat" accept=".pdf, .jpg, .jpeg, .png">
                                <input type="hidden" id="form_old_file_sertifikat">
                                <div id="file_lama_info" style="font-size: 0.8rem; margin-top: 5px; color:#64748b;"></div>
                            </div>
                        </div>
                    </fieldset>

                    <div style="text-align: right; margin-top: 15px;">
                        <button type="button" class="btn" style="background:#94a3b8;" id="btnTutupFormSertif">Batal</button>
                        <button type="submit" class="btn" style="background:#3b82f6;" id="btnSimpanSertif"><i class="fas fa-save"></i> Simpan Data</button>
                    </div>
                </form>
            </div>
        </div>

        <div class="modal" id="modalDetailSertifikat">
            <div class="modal-content">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid #ccc; padding-bottom:10px; margin-bottom: 20px;">
                    <h3 style="margin:0;"><i class="fas fa-certificate" style="color:#0ea5e9;"></i> Detail Sertifikat</h3>
                    <button class="btn" style="background:#ef4444; padding: 5px 10px;" id="btnTutupDetailSertif"><i class="fas fa-times"></i></button>
                </div>
                <div id="kontenDetailSertif" class="grid-2"></div>
            </div>
        </div>
    `;

    initLogikaSertifikat(userRole);
}

function initLogikaSertifikat(userRole) {
    const tbody = document.getElementById('tabelSertifikat');
    const modalForm = document.getElementById('modalFormSertifikat');
    const modalDetail = document.getElementById('modalDetailSertifikat');
    const form = document.getElementById('formSertifikat');
    const modalTitle = document.getElementById('modalTitleSertif');
    const kontenDetail = document.getElementById('kontenDetailSertif');
    const inputCari = document.getElementById('inputCariSertif');
    
    // Tombol Export
    const btnExportExcel = document.getElementById('btnExportExcelSertif');
    const btnExportPDF = document.getElementById('btnExportPDFSertif');
    
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
                    "Nama Pegawai": item.nama,
                    "No Sertifikat": item.no_sertifikat,
                    "Jenis Sertifikat": item.jenis_sertifikat,
                    "Judul Kegiatan": item.judul_kegiatan,
                    "Tanggal Pelaksanaan": item.tanggal_pelaksanaan,
                    "Mulai": item.mulai,
                    "Selesai": item.selesai,
                    "JPL": item.jpl,
                    "Nilai SKP": item.skp,
                    "Link File": item.file_sertifikat || "Tidak ada file"
                }));

                const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "Sertifikat Pegawai");
                XLSX.writeFile(workbook, `Data_Sertifikat_Pegawai_${new Date().toISOString().split('T')[0]}.xlsx`);
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
                doc.text("Laporan Sertifikat & Kegiatan Pegawai", 14, 15);
                
                const tableColumn = ["NIK", "Nama Pegawai", "No Sertifikat", "Jenis", "Tanggal", "Judul Kegiatan", "JPL", "SKP"];
                const tableRows = [];
                
                currentData.forEach(item => {
                    const itemData = [
                        item.nik || '-', 
                        item.nama || '-', 
                        item.no_sertifikat || '-', 
                        item.jenis_sertifikat || '-',
                        item.tanggal_pelaksanaan || '-', 
                        item.judul_kegiatan || '-', 
                        item.jpl || '0', 
                        item.skp || '0'
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
                doc.save(`Data_Sertifikat_Pegawai_${new Date().toISOString().split('T')[0]}.pdf`);
            } catch (err) {
                alert("Gagal memproses PDF. Error: " + err.message);
            }
        });
    }

    // ==========================================
    // 1. LOAD DATA SERTIFIKAT & DATA PEGAWAI (AUTOCOMPLETE)
    // ==========================================
    async function loadData() {
        try {
            const { data, error } = await supabase.from('sertifikat_pegawai').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            currentData = data || []; 
            renderTabel(currentData); 
        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="6" style="color:red; text-align:center;"><b>Error Sistem:</b> ${err.message}</td></tr>`;
        }
    }

    async function loadDataPegawai() {
        const { data, error } = await supabase.from('pegawai').select('nik, nama');
        if (!error && data) {
            daftarPegawai = data;
            const dataList = document.getElementById('list_pegawai');
            dataList.innerHTML = data.map(p => `<option value="${p.nama}">`).join('');
        }
    }

    // Eksekusi load data
    loadData();
    loadDataPegawai();

    // ==========================================
    // 2. LOGIKA AUTO-FILL NIK BERDASARKAN NAMA
    // ==========================================
    const inputNama = document.getElementById('form_nama');
    const inputNik = document.getElementById('form_nik');

    inputNama.addEventListener('input', (e) => {
        const namaDipilih = e.target.value;
        const pegawaiDitemukan = daftarPegawai.find(p => p.nama === namaDipilih);
        
        if (pegawaiDitemukan) {
            inputNik.value = pegawaiDitemukan.nik;
            inputNik.style.backgroundColor = '#e2e8f0';
        } else {
            inputNik.value = ''; 
            inputNik.style.backgroundColor = '#f1f5f9';
        }
    });

    // ==========================================
    // 3. RENDER TABEL & PENCARIAN
    // ==========================================
    function renderTabel(data) {
        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px;">Belum ada data sertifikat pegawai.</td></tr>`;
            return;
        }

        tbody.innerHTML = data.map(row => `
            <tr>
                <td><strong>${row.nama || '-'}</strong><br><span style="color:#64748b; font-size:0.8rem;">NIK: ${row.nik || '-'}</span></td>
                <td>${row.no_sertifikat || '-'}</td>
                <td>${row.judul_kegiatan || '-'}</td>
                <td>${row.jenis_sertifikat || '-'}</td>
                <td>JPL: ${row.jpl || '0'} | SKP: ${row.skp || '0'}</td>
                <td>
                    <button class="btn btn-detail" onclick="bukaDetailSertif('${row.id}')" title="Lihat Detail"><i class="fas fa-eye"></i></button>
                    ${row.file_sertifikat ? `<a href="${row.file_sertifikat}" target="_blank" class="btn btn-link" title="Buka File"><i class="fas fa-file-download"></i></a>` : ''}
                    <button class="btn btn-edit" onclick="bukaFormSertif('${row.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-hapus" onclick="hapusSertif('${row.id}')" title="Hapus"><i class="fas fa-trash"></i></button>
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
                       (item.judul_kegiatan && item.judul_kegiatan.toLowerCase().includes(keyword));
            });
            renderTabel(dataTersaring);
        });
    }

    // ==========================================
    // 4. FITUR DETAIL SERTIFIKAT
    // ==========================================
    window.bukaDetailSertif = (id) => {
        const item = currentData.find(p => p.id === id);
        if(!item) return;
        
        kontenDetail.innerHTML = '';
        const kolomTampil = [
            { key: 'nik', label: 'NIK Pegawai' }, { key: 'nama', label: 'Nama Pegawai' },
            { key: 'no_sertifikat', label: 'No. Sertifikat' }, { key: 'jenis_sertifikat', label: 'Jenis Sertifikat' },
            { key: 'tanggal_pelaksanaan', label: 'Tanggal Pelaksanaan' }, { key: 'judul_kegiatan', label: 'Judul Kegiatan' },
            { key: 'mulai', label: 'Mulai Kegiatan' }, { key: 'selesai', label: 'Selesai Kegiatan' },
            { key: 'jpl', label: 'Total JPL' }, { key: 'skp', label: 'Nilai SKP' },
            { key: 'file_sertifikat', label: 'Dokumen Lampiran' }
        ];

        kolomTampil.forEach(col => {
            const div = document.createElement('div');
            div.className = 'detail-item';
            let nilai = item[col.key] || "-";
            
            if(col.key === 'file_sertifikat' && item[col.key]) {
                nilai = `<a href="${item[col.key]}" target="_blank" style="color:#0ea5e9; text-decoration:none;"><i class="fas fa-external-link-alt"></i> Klik untuk Buka Lampiran</a>`;
            }

            div.innerHTML = `<span class="detail-label">${col.label}</span><span class="detail-value">${nilai}</span>`;
            if(col.key === 'judul_kegiatan' || col.key === 'file_sertifikat') div.style.gridColumn = 'span 2';
            kontenDetail.appendChild(div);
        });
        modalDetail.style.display = 'flex';
    };

    if(document.getElementById('btnTutupDetailSertif')) {
        document.getElementById('btnTutupDetailSertif').onclick = () => modalDetail.style.display = 'none';
    }

    // ==========================================
    // 5. FORM TAMBAH / EDIT
    // ==========================================
    if(document.getElementById('btnTambahSertif')) {
        document.getElementById('btnTambahSertif').onclick = () => {
            form.reset(); 
            document.getElementById('form_id').value = ''; 
            document.getElementById('form_old_file_sertifikat').value = '';
            document.getElementById('file_lama_info').innerHTML = '';
            modalTitle.innerText = "Tambah Sertifikat Baru";
            modalForm.style.display = 'flex';
        };
    }

    window.bukaFormSertif = (id) => {
        form.reset(); 
        modalTitle.innerText = "Edit Data Sertifikat";
        const item = currentData.find(p => p.id === id);
        if(!item) return;

        Object.keys(item).forEach(key => {
            const inputElement = document.getElementById(`form_${key}`);
            if(inputElement && key !== 'file_sertifikat') {
                inputElement.value = item[key] || '';
            }
        });

        document.getElementById('form_old_file_sertifikat').value = item.file_sertifikat || '';
        const fileInfo = document.getElementById('file_lama_info');
        if (item.file_sertifikat) {
            fileInfo.innerHTML = `File saat ini: <a href="${item.file_sertifikat}" target="_blank">Lihat Dokumen</a> (Biarkan kosong jika tidak ingin mengganti file)`;
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
            const btnSimpan = document.getElementById('btnSimpanSertif');
            btnSimpan.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Menyimpan Data & File...`;
            btnSimpan.disabled = true;
            
            const formData = new FormData(form);
            const dataObj = Object.fromEntries(formData.entries());
            const idData = dataObj.id;
            delete dataObj.id;

            Object.keys(dataObj).forEach(key => { 
                if (dataObj[key] === "") dataObj[key] = null; 
            });

            const fileInput = document.getElementById('form_file_sertifikat');
            const file = fileInput.files[0];
            let finalFileUrl = document.getElementById('form_old_file_sertifikat').value; 

            if (file) {
                const fileExt = file.name.split('.').pop();
                const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(2,9)}.${fileExt}`;
                
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('lampiran')
                    .upload(uniqueFileName, file, { cacheControl: '3600', upsert: false });

                if (uploadError) {
                    alert("Gagal mengupload file!\nPastikan bucket 'lampiran' sudah dibuat dan public.\nPesan: " + uploadError.message);
                    btnSimpan.innerHTML = `<i class="fas fa-save"></i> Simpan Sertifikat`;
                    btnSimpan.disabled = false;
                    return; 
                }

                const { data: publicUrlData } = supabase.storage.from('lampiran').getPublicUrl(uniqueFileName);
                finalFileUrl = publicUrlData.publicUrl;
            }

            dataObj.file_sertifikat = finalFileUrl === "" ? null : finalFileUrl;

            if (idData) {
                await supabase.from('sertifikat_pegawai').update(dataObj).eq('id', idData);
            } else {
                await supabase.from('sertifikat_pegawai').insert([dataObj]);
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
    window.hapusSertif = async (id) => {
        if(confirm('Yakin ingin menghapus sertifikat ini? Data tidak bisa dikembalikan.')) {
            await supabase.from('sertifikat_pegawai').delete().eq('id', id);
            loadData(); 
        }
    };

    if(document.getElementById('btnTutupFormSertif')) {
        document.getElementById('btnTutupFormSertif').onclick = () => modalForm.style.display = 'none';
    }
}
