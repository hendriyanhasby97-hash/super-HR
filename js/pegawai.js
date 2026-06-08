import { supabase } from './koneksi.js';
import Papa from 'https://cdn.jsdelivr.net/npm/papaparse@5.4.1/+esm';

export function renderPegawai(container, userRole = 'superadmin') {
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
                <input type="text" id="inputCari" placeholder="🔍 Cari NIK atau Nama...">
                <select id="filterStatus">
                    <option value="">Semua Status Pegawai</option>
                </select>
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="btn btn-excel" id="btnExportExcel"><i class="fas fa-file-excel"></i> Excel</button>
                <button class="btn btn-pdf" id="btnExportPDF"><i class="fas fa-file-pdf"></i> PDF</button>
                <button class="btn btn-import" id="btnTriggerImport"><i class="fas fa-file-import"></i> Import CSV</button>
                <input type="file" id="inputCSV" accept=".csv" style="display: none;">
                <button class="btn btn-tambah" id="btnTambahBaru"><i class="fas fa-plus"></i> Tambah Pegawai</button>
            </div>
        </div>

        <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <table>
                <thead><tr><th>NIK/NIP</th><th>Nama</th><th>Jabatan</th><th>Ruangan</th><th>Status</th><th>Aksi</th></tr></thead>
                <tbody id="tabelMaster"><tr><td colspan="6" style="text-align:center;">Memuat data...</td></tr></tbody>
            </table>
        </div>

        <div class="modal" id="modalFormPegawai">
            <div class="modal-content">
                <h3 id="modalTitle" style="margin-bottom: 15px; border-bottom: 1px solid #ccc; padding-bottom:10px;">Form Pegawai</h3>
                <form id="formPegawai">
                    <input type="hidden" name="id_pegawai" id="form_id_pegawai">
                    
                    <fieldset><legend>Data Pribadi & Kontak</legend>
                        <div class="grid-2">
                            <div class="form-group"><label>NIK</label><input type="text" name="nik" id="form_nik" required></div>
                            <div class="form-group"><label>Nama</label><input type="text" name="nama" id="form_nama" required></div>
                            <div class="form-group"><label>Tempat Lahir</label><input type="text" name="tempat_lahir" id="form_tempat_lahir"></div>
                            <div class="form-group"><label>Tanggal Lahir</label><input type="date" name="tanggal_lahir" id="form_tanggal_lahir"></div>
                            <div class="form-group"><label>Jenis Kelamin</label>
                                <select name="jenis_kelamin" id="form_jenis_kelamin">
                                    <option value="" hidden>Pilih...</option><option value="Laki-laki">Laki-laki</option><option value="Perempuan">Perempuan</option>
                                </select>
                            </div>
                            <div class="form-group"><label>Agama</label>
                                <select name="agama" id="form_agama">
                                    <option value="" hidden>Pilih...</option><option value="Islam">Islam</option><option value="Kristen">Kristen</option><option value="Budha">Budha</option><option value="Hindu">Hindu</option><option value="Konghucu">Konghucu</option><option value="Kepercayaan Lainnya">Kepercayaan Lainnya</option>
                                </select>
                            </div>
                            <div class="form-group"><label>Status Keluarga</label>
                                <select name="status_keluarga" id="form_status_keluarga">
                                    <option value="" hidden>Pilih...</option><option value="Lajang">Lajang</option><option value="Menikah">Menikah</option><option value="Janda">Janda</option><option value="Duda">Duda</option>
                                </select>
                            </div>
                            <div class="form-group"><label>No Telp</label><input type="text" name="no_telp" id="form_no_telp"></div>
                            <div class="form-group"><label>Email</label><input type="email" name="email" id="form_email" placeholder="contoh@email.com"></div>
                            <div class="form-group"><label>Password Portal</label><input type="text" name="password" id="form_password" placeholder="Default: masuk123"></div>
                            <div class="form-group" style="grid-column: span 2;"><label>Alamat</label><input type="text" name="alamat" id="form_alamat"></div>
                        </div>
                    </fieldset>

                    <fieldset><legend>Data Kepegawaian & RS</legend>
                        <div class="grid-2">
                            <div class="form-group"><label>NIP</label><input type="text" name="nip" id="form_nip"></div>
                            <div class="form-group"><label>Status Pegawai</label>
                                <select name="status" id="form_status">
                                    <option value="" hidden>Pilih...</option><option value="Aktif">Aktif</option><option value="Mutasi">Mutasi</option><option value="Pensiun">Pensiun</option><option value="Resign">Resign</option><option value="Meninggal">Meninggal</option><option value="Lainnya">Lainnya</option>
                                </select>
                            </div>
                            <div class="form-group"><label>Kelompok Pegawai</label>
                                <select name="kelompok_pegawai" id="form_kelompok_pegawai">
                                    <option value="" hidden>Pilih...</option><option value="ASN">ASN</option><option value="APBD">APBD</option><option value="BLUD">BLUD</option><option value="Konsultan">Konsultan</option><option value="Magang">Magang</option>
                                </select>
                            </div>
                            <div class="form-group"><label>Kelompok Jabatan</label>
                                <select name="kelompok_jabatan" id="form_kelompok_jabatan">
                                    <option value="" hidden>Pilih...</option><option value="Management">Management</option><option value="Tenaga Medis">Tenaga Medis</option><option value="Tenaga Kesehatan">Tenaga Kesehatan</option><option value="Tenaga Penunjang Medis">Tenaga Penunjang Medis</option><option value="Tenaga Administrasi">Tenaga Administrasi</option><option value="Tenaga Non Administrasi">Tenaga Non Administrasi</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label>Golongan</label>
                                <select name="gol" id="form_gol"><option value="" hidden>Pilih Golongan...</option></select>
                            </div>
                            <div class="form-group">
                                <label>Jabatan</label>
                                <select name="jabatan" id="form_jabatan"><option value="" hidden>Pilih Jabatan...</option></select>
                            </div>
                            <div class="form-group">
                                <label>Ruangan</label>
                                <select name="ruangan" id="form_ruangan"><option value="" hidden>Pilih Ruangan...</option></select>
                            </div>
                            <div class="form-group"><label>TMT Pangkat</label><input type="date" name="tmt_pangkat" id="form_tmt_pangkat"></div>
                            <div class="form-group"><label>TMT Berikutnya</label><input type="date" name="tmt_berikutnya" id="form_tmt_berikutnya"></div>
                            <div class="form-group"><label>TMT CPNS</label><input type="date" name="tmt_cpns" id="form_tmt_cpns"></div>
                            <div class="form-group"><label>Tanggal Masuk RS</label><input type="date" name="masuk_rs" id="form_masuk_rs"></div>
                            <div class="form-group"><label>Masa Kerja RS</label><input type="text" name="masa_kerja_rs" id="form_masa_kerja_rs" readonly placeholder="Otomatis..."></div>
                            <div class="form-group"><label>Rentang BUP</label><input type="text" name="rentang_bup" id="form_rentang_bup"></div>
                            <div class="form-group"><label>TMT Pensiun</label><input type="date" name="tmt_pensiun" id="form_tmt_pensiun"></div>
                        </div>
                    </fieldset>

                    <fieldset><legend>Pendidikan & Identitas Negara</legend>
                        <div class="grid-2">
                            <div class="form-group"><label>Jenjang Pendidikan</label>
                                <select name="jenjang" id="form_jenjang">
                                    <option value="" hidden>Pilih...</option>
                                    <option value="SD">SD</option><option value="SMP">SMP</option><option value="SMA">SMA</option>
                                    <option value="D1">D1</option><option value="D3">D3</option><option value="D4">D4</option>
                                    <option value="S1">S1</option><option value="Profesi">Profesi</option><option value="Spesialis">Spesialis</option>
                                    <option value="Magister">Magister</option><option value="Konsultan">Konsultan</option>
                                </select>
                            </div>
                            <div class="form-group"><label>Fakultas</label><input type="text" name="fakultas" id="form_fakultas"></div>
                            <div class="form-group"><label>Jurusan</label><input type="text" name="jurusan" id="form_jurusan"></div>
                            <div class="form-group"><label>No BPJS Kesehatan</label><input type="text" name="no_bpjsn" id="form_no_bpjsn"></div>
                            <div class="form-group"><label>No BPJS TK/Taspen</label><input type="text" name="no_bpjsket_taspen" id="form_no_bpjsket_taspen"></div>
                            <div class="form-group"><label>NPWP</label><input type="text" name="npwp" id="form_npwp"></div>
                        </div>
                    </fieldset>

                    <div style="text-align: right; margin-top: 15px;">
                        <button type="button" class="btn" style="background:#94a3b8;" id="btnTutupModal">Batal</button>
                        <button type="submit" class="btn" style="background:#3b82f6;" id="btnSimpanData"><i class="fas fa-save"></i> Simpan Data</button>
                    </div>
                </form>
            </div>
        </div>

        <div class="modal" id="modalDetailPegawai">
            <div class="modal-content">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid #ccc; padding-bottom:10px; margin-bottom: 20px;">
                    <h3 style="margin:0;"><i class="fas fa-id-card" style="color:#0ea5e9;"></i> Detail Pegawai</h3>
                    <button class="btn" style="background:#ef4444; padding: 5px 10px;" id="btnTutupDetail"><i class="fas fa-times"></i></button>
                </div>
                <div id="kontenDetail" class="grid-2" style="grid-template-columns: 1fr 1fr 1fr;"></div>
            </div>
        </div>
    `;

    initLogikaPegawai(userRole);
}

function initLogikaPegawai(userRole) {
    const tbody = document.getElementById('tabelMaster');
    const modalForm = document.getElementById('modalFormPegawai');
    const modalDetail = document.getElementById('modalDetailPegawai');
    const form = document.getElementById('formPegawai');
    const modalTitle = document.getElementById('modalTitle');
    const kontenDetail = document.getElementById('kontenDetail');
    const inputCari = document.getElementById('inputCari');
    const filterStatus = document.getElementById('filterStatus');
    const btnTriggerImport = document.getElementById('btnTriggerImport');
    const inputCSV = document.getElementById('inputCSV');
    const btnExportExcel = document.getElementById('btnExportExcel');
    const btnExportPDF = document.getElementById('btnExportPDF');

    let currentData = [];

    // ==========================================
    // 1. FUNGSI EXPORT EXCEL & PDF
    // ==========================================
    if (userRole !== 'superadmin' && userRole !== 'admin') {
        if(btnExportExcel) btnExportExcel.style.display = 'none';
        if(btnExportPDF) btnExportPDF.style.display = 'none';
    }

    if(btnExportExcel) {
        btnExportExcel.addEventListener('click', () => {
            if (!currentData || currentData.length === 0) return alert("Data kosong.");
            try {
                const worksheet = XLSX.utils.json_to_sheet(currentData);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "Data Pegawai");
                XLSX.writeFile(workbook, `Data_Pegawai_${new Date().toISOString().split('T')[0]}.xlsx`);
            } catch (err) { alert("Gagal memproses Excel."); }
        });
    }

    if(btnExportPDF) {
        btnExportPDF.addEventListener('click', () => {
            if (!currentData || currentData.length === 0) return alert("Data kosong.");
            try {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF('landscape'); 
                doc.text("Laporan Data Pegawai Utama", 14, 15);
                const tableColumn = ["NIK", "Nama", "Kelompok Pegawai", "Jabatan", "Ruangan", "Status"];
                const tableRows = [];
                currentData.forEach(pegawai => {
                    const pegawaiData = [
                        pegawai.nik || '-', pegawai.nama || '-', pegawai.kelompok_pegawai || '-', 
                        pegawai.jabatan || '-', pegawai.ruangan || '-', pegawai.status || '-'
                    ];
                    tableRows.push(pegawaiData);
                });
                doc.autoTable({ head: [tableColumn], body: tableRows, startY: 20, theme: 'grid', styles: { fontSize: 8 }});
                doc.save(`Data_Pegawai_${new Date().toISOString().split('T')[0]}.pdf`);
            } catch (err) { alert("Gagal memproses PDF."); }
        });
    }

    // ==========================================
    // 2. LOAD DATA DROPDOWN MASTER PENGATURAN
    // ==========================================
    async function loadMasterDropdowns() {
        try {
            const [resGol, resJab, resRua] = await Promise.all([
                supabase.from('master_golongan').select('nama_golongan').order('nama_golongan', { ascending: true }),
                supabase.from('master_jabatan').select('nama_jabatan').order('nama_jabatan', { ascending: true }),
                supabase.from('master_ruangan').select('nama_ruangan').order('nama_ruangan', { ascending: true })
            ]);

            if (resGol.data) {
                document.getElementById('form_gol').innerHTML = '<option value="" hidden>Pilih Golongan...</option>' + 
                    resGol.data.map(d => `<option value="${d.nama_golongan}">${d.nama_golongan}</option>`).join('');
            }
            if (resJab.data) {
                document.getElementById('form_jabatan').innerHTML = '<option value="" hidden>Pilih Jabatan...</option>' + 
                    resJab.data.map(d => `<option value="${d.nama_jabatan}">${d.nama_jabatan}</option>`).join('');
            }
            if (resRua.data) {
                document.getElementById('form_ruangan').innerHTML = '<option value="" hidden>Pilih Ruangan...</option>' + 
                    resRua.data.map(d => `<option value="${d.nama_ruangan}">${d.nama_ruangan}</option>`).join('');
            }
        } catch (error) {
            console.error("Gagal menarik data master:", error);
        }
    }

    // ==========================================
    // 3. LOAD DATA MASTER DARI DATABASE
    // ==========================================
    async function loadData() {
        try {
            const { data, error } = await supabase.from('pegawai').select('*');
            if (error) {
                tbody.innerHTML = `<tr><td colspan="6" style="color:red; text-align:center;"><b>Koneksi Database Gagal:</b> ${error.message}</td></tr>`;
                return;
            }
            currentData = data || []; 
            updateOpsiFilter(); 
            renderTabel(currentData); 
        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="6" style="color:red; text-align:center;"><b>Sistem Gagal Memuat Data:</b> ${err.message}</td></tr>`;
        }
    }

    // ==========================================
    // 4. RENDER TABEL & FILTER
    // ==========================================
    function renderTabel(data) {
        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px;">Data Kosong. Silakan tambah data baru.</td></tr>`;
            return;
        }

        tbody.innerHTML = data.map(row => `
            <tr>
                <td><strong>NIK:</strong> ${row.nik || '-'}<br><span style="color:#64748b; font-size:0.8rem;">NIP: ${row.nip || '-'}</span></td>
                <td>${row.nama || '-'}</td>
                <td>${row.jabatan || '-'}</td>
                <td>${row.ruangan || '-'}</td>
                <td>${row.status || '-'}</td>
                <td>
                    <button class="btn btn-detail" onclick="bukaDetail('${row.id_pegawai}')" title="Lihat Detail"><i class="fas fa-eye"></i></button>
                    <button class="btn btn-edit" onclick="bukaForm('${row.id_pegawai}')" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-hapus" onclick="hapusDataPegawai('${row.id_pegawai}')" title="Hapus"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    }

    function terapkanPencarianDanFilter() {
        const keyword = inputCari.value.toLowerCase();
        const statusTerpilih = filterStatus.value;
        const dataTersaring = currentData.filter(pegawai => {
            const cocokKeyword = (pegawai.nama && pegawai.nama.toLowerCase().includes(keyword)) || 
                                 (pegawai.nik && pegawai.nik.toLowerCase().includes(keyword));
            const cocokStatus = (statusTerpilih === "") || (pegawai.status === statusTerpilih);
            return cocokKeyword && cocokStatus;
        });
        renderTabel(dataTersaring);
    }

    function updateOpsiFilter() {
        const baseOptions = ["Aktif", "Mutasi", "Pensiun", "Resign", "Meninggal", "Lainnya"];
        const dbStatus = [...new Set(currentData.map(p => p.status).filter(Boolean))];
        const allStatus = [...new Set([...baseOptions, ...dbStatus])];
        filterStatus.innerHTML = `<option value="">Semua Status Pegawai</option>` + 
            allStatus.map(status => `<option value="${status}">${status}</option>`).join('');
    }

    if(inputCari) inputCari.addEventListener('input', terapkanPencarianDanFilter);
    if(filterStatus) filterStatus.addEventListener('change', terapkanPencarianDanFilter);

    // ==========================================
    // 5. AUTO HITUNG MASA KERJA & TMT CPNS
    // ==========================================
    const inpKelompokPegawai = document.getElementById('form_kelompok_pegawai');
    const inptmtPangkat = document.getElementById('form_tmt_pangkat');
    const inptmtCpns = document.getElementById('form_tmt_cpns');
    const inptmtBerikutnya = document.getElementById('form_tmt_berikutnya');
    const inpNIP = document.getElementById('form_nip');
    const inpMasukRS = document.getElementById('form_masuk_rs');
    const inpMasaKerjaRS = document.getElementById('form_masa_kerja_rs');

    function cekStatusASN() {
        if (!inpKelompokPegawai) return;
        if (inpKelompokPegawai.value === 'ASN') {
            inptmtPangkat.readOnly = false;
            inptmtCpns.readOnly = false;
            inptmtBerikutnya.readOnly = false;
        } else {
            inptmtPangkat.readOnly = true;
            inptmtCpns.readOnly = true;
            inptmtBerikutnya.readOnly = true;
            inptmtPangkat.value = '';
            inptmtCpns.value = '';
            inptmtBerikutnya.value = '';
        }
    }
    if(inpKelompokPegawai) inpKelompokPegawai.addEventListener('change', cekStatusASN);

    if(inpNIP) {
        inpNIP.addEventListener('input', () => {
            let nip = inpNIP.value.replace(/[^0-9]/g, '');
            if (nip.length >= 13) {
                const year = nip.substring(5, 9);
                const month = nip.substring(9, 11);
                const day = nip.substring(11, 13);
                if (year > 1900 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
                    inptmtCpns.value = `${year}-${month}-${day}`;
                }
            }
        });
    }

    function hitungMasaKerja() {
        if (!inpMasukRS.value) { inpMasaKerjaRS.value = ''; return; }
        const start = new Date(inpMasukRS.value);
        const end = new Date();
        if (start > end) { inpMasaKerjaRS.value = '0 Tahun 0 Bulan 0 Hari'; return; }
        let years = end.getFullYear() - start.getFullYear();
        let months = end.getMonth() - start.getMonth();
        let days = end.getDate() - start.getDate();
        if (days < 0) { months--; const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0); days += prevMonth.getDate(); }
        if (months < 0) { years--; months += 12; }
        inpMasaKerjaRS.value = `${years} Tahun ${months} Bulan ${days} Hari`;
    }
    if(inpMasukRS) inpMasukRS.addEventListener('input', hitungMasaKerja);

    // ==========================================
    // 6. IMPORT CSV
    // ==========================================
    if(btnTriggerImport) btnTriggerImport.onclick = () => inputCSV.click();
    if(inputCSV) {
        inputCSV.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            btnTriggerImport.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Parsing CSV...`;
            btnTriggerImport.disabled = true;

            Papa.parse(file, {
                header: true, skipEmptyLines: true,
                complete: async function(results) {
                    const sanitizedData = results.data.map(row => {
                        const cleanRow = {};
                        Object.keys(row).forEach(key => {
                            let cleanKey = key.trim().toLowerCase().replace(/\s+/g, '_');
                            let value = row[key] ? row[key].trim() : null;
                            if (value === "") value = null;
                            if (cleanKey === 'id_pegawai' && value === null) return; 
                            cleanRow[cleanKey] = value;
                        });
                        if (!cleanRow.password) cleanRow.password = 'masuk123';
                        return cleanRow;
                    });
                    if (sanitizedData.length === 0) { alert("File CSV kosong."); resetTombolImport(); return; }
                    btnTriggerImport.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Mengirim...`;
                    const { error } = await supabase.from('pegawai').insert(sanitizedData);
                    if (error) alert("Gagal melakukan import massal: " + error.message);
                    else { alert(`Sukses menambahkan ${sanitizedData.length} data pegawai.`); loadData(); }
                    resetTombolImport();
                }
            });
        });
    }

    function resetTombolImport() {
        btnTriggerImport.innerHTML = `<i class="fas fa-file-import"></i> Import CSV`;
        btnTriggerImport.disabled = false; inputCSV.value = ''; 
    }

    // ==========================================
    // 7. FITUR MODAL DETAIL & FORM CRUD
    // ==========================================
    window.bukaDetail = (id) => {
        const pegawai = currentData.find(p => p.id_pegawai == id);
        if(!pegawai) return;
        kontenDetail.innerHTML = '';
        
        const kolomTampil = [
            { key: 'nik', label: 'NIK' }, { key: 'nip', label: 'NIP' }, { key: 'nama', label: 'Nama Lengkap' },
            { key: 'tempat_lahir', label: 'Tempat Lahir' }, { key: 'tanggal_lahir', label: 'Tgl Lahir' },
            { key: 'jenis_kelamin', label: 'Jenis Kelamin' }, { key: 'agama', label: 'Agama' },
            { key: 'status_keluarga', label: 'Status Keluarga' }, { key: 'no_telp', label: 'No Telp' },
            { key: 'email', label: 'Email' }, { key: 'alamat', label: 'Alamat' },
            { key: 'status', label: 'Status Pegawai' }, { key: 'kelompok_pegawai', label: 'Kelp. Pegawai' },
            { key: 'kelompok_jabatan', label: 'Kelp. Jabatan' }, { key: 'gol', label: 'Golongan' },
            { key: 'jabatan', label: 'Jabatan' }, { key: 'ruangan', label: 'Ruangan' },
            { key: 'tmt_pangkat', label: 'TMT Pangkat' }, { key: 'tmt_berikutnya', label: 'TMT Berikutnya' },
            { key: 'tmt_cpns', label: 'TMT CPNS' }, { key: 'masuk_rs', label: 'Masuk RS' },
            { key: 'masa_kerja_rs', label: 'Masa Kerja RS' }, { key: 'rentang_bup', label: 'Rentang BUP' },
            { key: 'tmt_pensiun', label: 'TMT Pensiun' }, { key: 'jenjang', label: 'Jenjang Pddk' },
            { key: 'fakultas', label: 'Fakultas' }, { key: 'jurusan', label: 'Jurusan' },
            { key: 'no_bpjsn', label: 'No BPJS Kesh' }, { key: 'no_bpjsket_taspen', label: 'No BPJS TK' },
            { key: 'npwp', label: 'NPWP' }
        ];

        kolomTampil.forEach(item => {
            const div = document.createElement('div');
            div.className = 'detail-item';
            let nilai = pegawai[item.key] || "-";
            div.innerHTML = `<span class="detail-label">${item.label}</span><span class="detail-value">${nilai}</span>`;
            if(item.key === 'alamat') div.style.gridColumn = 'span 3';
            kontenDetail.appendChild(div);
        });
        modalDetail.style.display = 'flex';
    };

    if(document.getElementById('btnTutupDetail')) {
        document.getElementById('btnTutupDetail').onclick = () => modalDetail.style.display = 'none';
    }
    
    if(document.getElementById('btnTambahBaru')) {
        document.getElementById('btnTambahBaru').onclick = () => {
            form.reset(); 
            document.getElementById('form_id_pegawai').value = ''; 
            document.getElementById('form_password').value = 'masuk123';
            cekStatusASN();
            modalTitle.innerText = "Tambah Master Pegawai Baru";
            modalForm.style.display = 'flex';
        };
    }
    
    window.bukaForm = (id) => {
        form.reset(); 
        modalTitle.innerText = "Edit Data Pegawai";
        const pegawai = currentData.find(p => p.id_pegawai == id);
        if(!pegawai) return;
        Object.keys(pegawai).forEach(key => {
            const inputElement = document.getElementById(`form_${key}`);
            if(inputElement) inputElement.value = pegawai[key] || '';
        });
        cekStatusASN();
        modalForm.style.display = 'flex';
    };

    if(form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btnSimpan = document.getElementById('btnSimpanData');
            btnSimpan.innerText = "Menyimpan...";
            const formData = new FormData(form);
            const dataObj = Object.fromEntries(formData.entries());
            const id_pegawai = dataObj.id_pegawai;
            delete dataObj.id_pegawai;

            Object.keys(dataObj).forEach(key => { if (dataObj[key] === "") dataObj[key] = null; });

            if (id_pegawai) {
                await supabase.from('pegawai').update(dataObj).eq('id_pegawai', id_pegawai);
            } else {
                await supabase.from('pegawai').insert([dataObj]);
            }
            btnSimpan.innerHTML = `<i class="fas fa-save"></i> Simpan Data`;
            modalForm.style.display = 'none';
            loadData();
        });
    }

    window.hapusDataPegawai = async (id) => {
        if(confirm('Yakin menghapus data ini?')) {
            await supabase.from('pegawai').delete().eq('id_pegawai', id);
            loadData(); 
        }
    };

    if(document.getElementById('btnTutupModal')) {
        document.getElementById('btnTutupModal').onclick = () => modalForm.style.display = 'none';
    }

    // Eksekusi load data
    loadMasterDropdowns(); // <-- Mengambil data dropdown master (Golongan, Jabatan, Ruangan)
    loadData(); // <-- Mengambil data tabel utama
}
