import { supabase } from './koneksi.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. CEK AUTENTIKASI
    const userRole = sessionStorage.getItem('hris_role');
    const userNik = sessionStorage.getItem('nik_user');

    if (userRole !== 'user' || !userNik) {
        alert("Sesi tidak valid. Silakan login kembali.");
        window.location.href = 'index.html';
        return;
    }

    // 2. AMBIL DATA PEGAWAI DARI SUPABASE
    const { data: pegawai, error } = await supabase
        .from('pegawai')
        .select('*')
        .eq('nik', userNik)
        .single();

    if (error || !pegawai) {
        alert("Data Pegawai tidak ditemukan di server.");
        return;
    }

    // Tampilkan Nama di Topbar
    document.getElementById('badge-nama').innerHTML = `<i class="fas fa-user-check" style="color:#10b981;"></i> ${pegawai.nama}`;

    // 3. LOGIKA KONDISIONAL MENU 
    const allowedPerizinan = ['Management', 'Tenaga Medis', 'Tenaga Penunjang Medis', 'Tenaga Kesehatan'];
    if (!allowedPerizinan.includes(pegawai.kelompok_jabatan)) {
        const menuPerizinan = document.getElementById('menu-perizinan');
        if(menuPerizinan) menuPerizinan.style.display = 'none';
    }

    if (pegawai.kelompok_pegawai !== 'ASN') {
        const menuSkp = document.getElementById('menu-skp');
        if(menuSkp) menuSkp.style.display = 'none';
    }

    // 4. SISTEM ROUTING HALAMAN PORTAL
    window.loadPage = (page, element = null) => {
        const container = document.getElementById('app-content');
        const pageTitle = document.getElementById('page-title');
        
        if (element) {
            document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.submenu-item').forEach(el => el.classList.remove('active'));
            element.classList.add('active');
        }

        switch (page) {
            case 'profil': 
                pageTitle.innerText = "PROFIL SAYA"; 
                renderProfilSaya(container, pegawai); 
                break;
            case 'sik': 
                pageTitle.innerText = "DOKUMEN SIK / SIP SAYA"; 
                renderPerizinanUser(container, 'sik_pegawai', 'SIK / SIP', pegawai);
                break;
            case 'str': 
                pageTitle.innerText = "DOKUMEN STR SAYA"; 
                renderPerizinanUser(container, 'str_pegawai', 'STR', pegawai);
                break;
            case 'sertifikat': 
                pageTitle.innerText = "SERTIFIKAT SAYA"; 
                renderSertifikatUser(container, pegawai);
                break;
            case 'skp': 
                pageTitle.innerText = "SASARAN KINERJA (SKP) SAYA"; 
                renderSKPUser(container, pegawai);
                break;
        }
    };

    // 5. FUNGSI LOGOUT
    document.getElementById('btnUserLogout').addEventListener('click', () => {
        if(confirm("Apakah Anda yakin ingin keluar dari Portal?")) {
            sessionStorage.clear();
            window.location.href = 'index.html';
        }
    });

    window.loadPage('profil');
});

// ==============================================================
// GAYA CSS BERSAMA (Digunakan untuk semua modul User)
// ==============================================================
const commonCSS = `
    <style>
        .btn { padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; color: white; font-weight: 500; font-size: 0.875rem; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s ease; }
        .btn:hover { transform: translateY(-1px); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .btn-view, .btn-detail { background: #0ea5e9; padding: 6px 12px;}
        .btn-edit { background: #f59e0b; padding: 6px 12px;}
        .btn-hapus { background: #ef4444; padding: 6px 12px;}
        .btn-simpan, .btn-tambah { background: #10b981; }
        .btn-link { background: #f1f5f9; color: #475569; padding: 6px 12px; border: 1px solid #cbd5e1; }
        .btn-link:hover { background: #e2e8f0; color: #0f172a; }
        
        .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; background: white; padding: 16px 20px; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05); }
        .table-container { background: white; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); overflow: hidden; margin-top: 15px;}
        table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
        th, td { padding: 14px 20px; text-align: left; }
        th { background: #f8fafc; color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 0.75rem; border-bottom: 1px solid #e2e8f0; }
        td { color: #334155; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
        
        .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); align-items: flex-start; justify-content: center; z-index: 9999; padding: 20px; }
        .modal-content { background: white; padding: 32px; border-radius: 12px; width: 900px; max-width: 100%; max-height: 90vh; overflow-y: auto; margin-top: 2vh; border: 1px solid #e2e8f0; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);}
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;}
        .form-group label { display: block; font-weight: 600; font-size: 0.85rem; color: #475569; margin-bottom: 6px;}
        .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; background: #f8fafc; transition: all 0.2s;}
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #3b82f6; background: white; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
        .form-group input[readonly] { background: #e2e8f0; cursor: not-allowed; color: #64748b; font-weight: 600;}
        fieldset { border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin-bottom: 24px;}
        legend { font-weight: 600; background: #f1f5f9; color: #334155; padding: 6px 14px; border-radius: 6px; font-size: 0.85rem; border: 1px solid #e2e8f0;}
    </style>
`;

// ==============================================================
// MODUL 1: PROFIL SAYA
// ==============================================================
function renderProfilSaya(container, pegawai) {
    container.innerHTML = commonCSS + `
        <style>
            .summary-card { background: white; border-radius: 12px; padding: 25px; display: flex; align-items: center; gap: 25px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; margin-bottom: 25px;}
            .summary-icon { width: 80px; height: 80px; background: #e0f2fe; color: #0ea5e9; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; }
            .summary-info h3 { font-size: 1.5rem; color: #0f172a; margin-bottom: 5px; font-weight: 700;}
            .summary-info p { color: #64748b; font-size: 0.95rem; margin-bottom: 3px; font-weight: 500;}
            .detail-item { border-bottom: 1px solid #f1f5f9; padding: 12px 0; display: flex; flex-direction: column;}
            .detail-label { font-size: 0.75rem; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;}
            .detail-value { font-size: 0.95rem; color: #0f172a; font-weight: 500; margin-top: 6px; word-wrap: break-word; white-space: normal; }
        </style>

        <div class="summary-card">
            <div class="summary-icon"><i class="fas fa-user-tie"></i></div>
            <div class="summary-info" style="flex:1;">
                <h3>${pegawai.nama}</h3>
                <p><i class="fas fa-id-card"></i> NIK: ${pegawai.nik} &nbsp;|&nbsp; <i class="fas fa-briefcase"></i> Jabatan: ${pegawai.jabatan || '-'}</p>
                <p><i class="fas fa-check-circle" style="color:#10b981;"></i> Status: ${pegawai.status || '-'} &nbsp;|&nbsp; <i class="fas fa-clock"></i> Masa Kerja RS: <span id="txt-masa-kerja">Menghitung...</span></p>
            </div>
            <div style="display:flex; gap:10px; flex-direction:column;">
                <button class="btn btn-view" id="btnViewUser"><i class="fas fa-eye"></i> View Detail Lengkap</button>
                <button class="btn btn-edit" id="btnEditUser"><i class="fas fa-edit"></i> Lengkapi Profil</button>
            </div>
        </div>

        <div style="background: white; border-radius: 12px; padding: 25px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
            <h4 style="margin-bottom: 15px; color: #0f172a;"><i class="fas fa-bullhorn"></i> Pengumuman Portal</h4>
            <p style="color: #475569; font-size: 0.95rem; line-height: 1.6;">Selamat datang di Portal HRIS Mandiri. Silakan periksa kelengkapan data pribadi, berkas perizinan, dan sertifikat Anda melalui menu yang tersedia. Anda memiliki akses penuh untuk menambah dan memperbarui dokumen Anda secara mandiri.</p>
        </div>

        <div class="modal" id="modalViewUser">
            <div class="modal-content">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid #e2e8f0; padding-bottom:15px; margin-bottom: 20px;">
                    <h3 style="margin:0; font-size: 1.25rem;"><i class="fas fa-id-card" style="color:#0ea5e9;"></i> Data Lengkap Kepegawaian Saya</h3>
                    <button class="btn btn-hapus" onclick="document.getElementById('modalViewUser').style.display='none'"><i class="fas fa-times"></i></button>
                </div>
                <div id="kontenDetailUser" class="grid-2" style="grid-template-columns: 1fr 1fr 1fr;"></div>
            </div>
        </div>

        <div class="modal" id="modalEditUser">
            <div class="modal-content">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid #e2e8f0; padding-bottom:15px; margin-bottom: 20px;">
                    <h3 style="margin:0; font-size: 1.25rem;"><i class="fas fa-user-edit" style="color:#f59e0b;"></i> Update Profil & Kepegawaian</h3>
                    <button class="btn btn-hapus" onclick="document.getElementById('modalEditUser').style.display='none'"><i class="fas fa-times"></i></button>
                </div>
                
                <form id="formPegawaiUser">
                    <fieldset><legend>Data Pribadi & Kontak</legend>
                        <div class="grid-2">
                            <div class="form-group"><label>NIK (Tidak dapat diubah)</label><input type="text" name="nik" id="form_nik" readonly></div>
                            <div class="form-group"><label>Nama Lengkap</label><input type="text" name="nama" id="form_nama" required></div>
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
                            <div class="form-group"><label>Email</label><input type="email" name="email" id="form_email"></div>
                            <div class="form-group"><label>Password Portal (Ganti Jika Perlu)</label><input type="text" name="password" id="form_password"></div>
                            <div class="form-group" style="grid-column: span 2;"><label>Alamat Lengkap</label><input type="text" name="alamat" id="form_alamat"></div>
                        </div>
                    </fieldset>

                    <fieldset><legend>Data Kepegawaian & Instansi</legend>
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
                            <div class="form-group"><label>Golongan</label><select name="gol" id="form_gol"><option value="" hidden>Pilih Golongan...</option></select></div>
                            <div class="form-group"><label>Jabatan</label><select name="jabatan" id="form_jabatan"><option value="" hidden>Pilih Jabatan...</option></select></div>
                            <div class="form-group"><label>Ruangan</label><select name="ruangan" id="form_ruangan"><option value="" hidden>Pilih Ruangan...</option></select></div>
                            <div class="form-group"><label>TMT Pangkat</label><input type="date" name="tmt_pangkat" id="form_tmt_pangkat"></div>
                            <div class="form-group"><label>TMT Berikutnya</label><input type="date" name="tmt_berikutnya" id="form_tmt_berikutnya"></div>
                            <div class="form-group"><label>TMT CPNS</label><input type="date" name="tmt_cpns" id="form_tmt_cpns"></div>
                            <div class="form-group"><label>Tanggal Masuk RS</label><input type="date" name="masuk_rs" id="form_masuk_rs"></div>
                            <div class="form-group"><label>Masa Kerja RS (Otomatis)</label><input type="text" name="masa_kerja_rs" id="form_masa_kerja_rs" readonly placeholder="Otomatis dihitung..."></div>
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
                        <button type="submit" class="btn btn-simpan" id="btnSimpanProfil"><i class="fas fa-save"></i> Simpan Perubahan</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Ambil Data Master untuk Dropdown
    async function loadMasterDropdownsUser() {
        try {
            const [resGol, resJab, resRua] = await Promise.all([
                supabase.from('master_golongan').select('nama_golongan').order('nama_golongan', { ascending: true }),
                supabase.from('master_jabatan').select('nama_jabatan').order('nama_jabatan', { ascending: true }),
                supabase.from('master_ruangan').select('nama_ruangan').order('nama_ruangan', { ascending: true })
            ]);
            if (resGol.data) document.getElementById('form_gol').innerHTML += resGol.data.map(d => `<option value="${d.nama_golongan}">${d.nama_golongan}</option>`).join('');
            if (resJab.data) document.getElementById('form_jabatan').innerHTML += resJab.data.map(d => `<option value="${d.nama_jabatan}">${d.nama_jabatan}</option>`).join('');
            if (resRua.data) document.getElementById('form_ruangan').innerHTML += resRua.data.map(d => `<option value="${d.nama_ruangan}">${d.nama_ruangan}</option>`).join('');
        } catch (error) { console.error(error); }
    }
    loadMasterDropdownsUser(); 

    // Perhitungan Masa Kerja
    function hitungMasaKerja() {
        const inpMasuk = document.getElementById('form_masuk_rs');
        const inpMasa = document.getElementById('form_masa_kerja_rs');
        if (!inpMasuk || !inpMasa || !inpMasuk.value) return;
        const start = new Date(inpMasuk.value);
        const end = new Date();
        let years = end.getFullYear() - start.getFullYear();
        let months = end.getMonth() - start.getMonth();
        let days = end.getDate() - start.getDate();
        if (days < 0) { months--; const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0); days += prevMonth.getDate(); }
        if (months < 0) { years--; months += 12; }
        inpMasa.value = `${years} Tahun ${months} Bulan ${days} Hari`;
    }

    if (pegawai.masuk_rs) {
        const start = new Date(pegawai.masuk_rs);
        const end = new Date();
        let years = end.getFullYear() - start.getFullYear();
        let months = end.getMonth() - start.getMonth();
        if (months < 0) { years--; months += 12; }
        document.getElementById('txt-masa-kerja').innerText = `${years} Tahun ${months} Bulan`;
    } else {
        document.getElementById('txt-masa-kerja').innerText = "-";
    }

    // Modal Events
    document.getElementById('btnViewUser').onclick = () => {
        const kontenDetail = document.getElementById('kontenDetailUser');
        kontenDetail.innerHTML = '';
        const keys = ['nik','nip','nama','tempat_lahir','tanggal_lahir','jenis_kelamin','agama','status_keluarga','no_telp','email','alamat','status','kelompok_pegawai','kelompok_jabatan','gol','jabatan','ruangan','tmt_pangkat','tmt_berikutnya','tmt_cpns','masuk_rs','masa_kerja_rs','rentang_bup','tmt_pensiun','jenjang','fakultas','jurusan','no_bpjsn','no_bpjsket_taspen','npwp'];
        keys.forEach(k => {
            const div = document.createElement('div');
            div.className = 'detail-item';
            div.innerHTML = `<span class="detail-label" style="font-size:0.7rem; color:#64748b; font-weight:bold; text-transform:uppercase;">${k.replace(/_/g, ' ')}</span><span class="detail-value" style="font-size:0.95rem; font-weight:500; margin-top:5px;">${pegawai[k] || "-"}</span>`;
            if(k === 'alamat') div.style.gridColumn = 'span 3';
            kontenDetail.appendChild(div);
        });
        document.getElementById('modalViewUser').style.display = 'flex';
    };

    document.getElementById('btnEditUser').onclick = () => {
        Object.keys(pegawai).forEach(key => {
            const inputElement = document.getElementById(`form_${key}`);
            if(inputElement) inputElement.value = pegawai[key] || '';
        });
        document.getElementById('form_masuk_rs').addEventListener('input', hitungMasaKerja);
        hitungMasaKerja();
        document.getElementById('modalEditUser').style.display = 'flex';
    };

    document.getElementById('formPegawaiUser').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btnSimpanProfil');
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Menyimpan...`;
        btn.disabled = true;
        
        const formData = new FormData(e.target);
        const dataObj = Object.fromEntries(formData.entries());
        Object.keys(dataObj).forEach(key => { if (dataObj[key] === "") dataObj[key] = null; });
        delete dataObj.nik; // Kunci NIK agar tidak bisa dirubah
        
        const { error } = await supabase.from('pegawai').update(dataObj).eq('nik', pegawai.nik);
        if (error) { 
            alert("Gagal menyimpan: " + error.message); 
            btn.innerHTML = `<i class="fas fa-save"></i> Simpan Perubahan`;
            btn.disabled = false;
        } else {
            alert("Profil berhasil diperbarui secara mandiri! Halaman akan dimuat ulang.");
            location.reload(); 
        }
    });
}

// ==============================================================
// MODUL 2: SERTIFIKAT (Tambah & Edit)
// ==============================================================
function renderSertifikatUser(container, pegawai) {
    container.innerHTML = commonCSS + `
        <div class="toolbar">
            <h3 style="color:#0f172a;"><i class="fas fa-certificate"></i> Daftar Sertifikat & Pelatihan Saya</h3>
            <button class="btn btn-tambah" onclick="window.bukaFormSertifUser()"><i class="fas fa-plus"></i> Tambah Baru</button>
        </div>
        <div class="table-container">
            <table>
                <thead><tr><th>No. Sertifikat</th><th>Judul Kegiatan</th><th>Jenis</th><th>JPL / SKP</th><th>Aksi</th></tr></thead>
                <tbody id="tabelDataSertif"><tr><td colspan="5" style="text-align:center;">Memuat data...</td></tr></tbody>
            </table>
        </div>

        <div class="modal" id="modalSertifUser">
            <div class="modal-content">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid #e2e8f0; padding-bottom:15px; margin-bottom: 20px;">
                    <h3 id="modalTitleSertif" style="margin:0; font-size: 1.25rem;"><i class="fas fa-edit" style="color:#f59e0b;"></i> Form Sertifikat</h3>
                    <button class="btn btn-hapus" onclick="document.getElementById('modalSertifUser').style.display='none'"><i class="fas fa-times"></i></button>
                </div>
                <form id="formSertifUser">
                    <input type="hidden" name="id" id="fs_id">
                    <div class="form-group" style="margin-bottom:15px;">
                        <label>Judul Kegiatan / Pelatihan</label><textarea name="judul_kegiatan" id="fs_judul_kegiatan" rows="2" required></textarea>
                    </div>
                    <div class="grid-2">
                        <div class="form-group"><label>No. Sertifikat</label><input type="text" name="no_sertifikat" id="fs_no_sertifikat" required></div>
                        <div class="form-group">
                            <label>Jenis Sertifikat</label>
                            <select name="jenis_sertifikat" id="fs_jenis_sertifikat" required>
                                <option value="Pelatihan">Pelatihan</option><option value="Seminar">Seminar</option>
                                <option value="Workshop">Workshop</option><option value="Bimtek">Bimtek</option><option value="Lainnya">Lainnya</option>
                            </select>
                        </div>
                        <div class="form-group"><label>Tanggal Pelaksanaan</label><input type="date" name="tanggal_pelaksanaan" id="fs_tanggal_pelaksanaan"></div>
                        <div class="form-group"><label>Nilai SKP</label><input type="number" step="0.01" name="skp" id="fs_skp"></div>
                        <div class="form-group"><label>JPL</label><input type="number" name="jpl" id="fs_jpl"></div>
                        <div class="form-group" style="grid-column: span 2;">
                            <label>Upload Sertifikat (PDF/JPG/PNG)</label>
                            <input type="file" id="fs_file_sertifikat" accept=".pdf, .jpg, .jpeg, .png">
                            <input type="hidden" id="fs_old_file_sertifikat">
                            <div id="file_info_sertif" style="font-size: 0.8rem; margin-top: 5px; color:#64748b;"></div>
                        </div>
                    </div>
                    <div style="text-align: right; margin-top: 15px;"><button type="submit" class="btn btn-simpan" id="btnSimpanSertif">Simpan Sertifikat</button></div>
                </form>
            </div>
        </div>
    `;

    let dataSertif = [];

    async function loadSertif() {
        const tbody = document.getElementById('tabelDataSertif');
        const { data, error } = await supabase.from('sertifikat_pegawai').select('*').eq('nik', pegawai.nik).order('created_at', { ascending: false });
        if (error) { tbody.innerHTML = `<tr><td colspan="5">Error: ${error.message}</td></tr>`; return; }
        dataSertif = data || [];

        if (dataSertif.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px;">Belum ada arsip Sertifikat.</td></tr>`;
        } else {
            tbody.innerHTML = dataSertif.map(item => `
                <tr>
                    <td>${item.no_sertifikat || '-'}</td><td>${item.judul_kegiatan || '-'}</td><td>${item.jenis_sertifikat || '-'}</td>
                    <td>JPL: ${item.jpl || '0'} | SKP: ${item.skp || '0'}</td>
                    <td>
                        ${item.file_sertifikat ? `<a href="${item.file_sertifikat}" target="_blank" class="btn btn-view" title="Buka File"><i class="fas fa-file-download"></i></a>` : ''}
                        <button class="btn btn-edit" onclick="bukaFormSertifUser('${item.id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-hapus" onclick="hapusSertifUser('${item.id}')"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        }
    }
    loadSertif();

    window.bukaFormSertifUser = (id = null) => {
        document.getElementById('formSertifUser').reset();
        document.getElementById('fs_id').value = '';
        document.getElementById('fs_old_file_sertifikat').value = '';
        document.getElementById('file_info_sertif').innerHTML = '';
        document.getElementById('modalTitleSertif').innerHTML = id ? `<i class="fas fa-edit"></i> Edit Sertifikat` : `<i class="fas fa-plus"></i> Tambah Sertifikat`;
        
        if(id) {
            const item = dataSertif.find(p => p.id === id);
            if(item) {
                Object.keys(item).forEach(key => {
                    const inputElement = document.getElementById(`fs_${key}`);
                    if(inputElement && key !== 'file_sertifikat') inputElement.value = item[key] || '';
                });
                document.getElementById('fs_old_file_sertifikat').value = item.file_sertifikat || '';
                if(item.file_sertifikat) document.getElementById('file_info_sertif').innerHTML = `File saat ini: <a href="${item.file_sertifikat}" target="_blank">Lihat Dokumen</a>`;
            }
        }
        document.getElementById('modalSertifUser').style.display = 'flex';
    };

    document.getElementById('formSertifUser').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btnSimpanSertif');
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Menyimpan...`; btn.disabled = true;
        
        const dataObj = Object.fromEntries(new FormData(e.target).entries());
        const idData = dataObj.id; delete dataObj.id;
        
        // HARCODED SECURITY (Paksa agar NIK dan Nama adalah milik user login)
        dataObj.nik = pegawai.nik;
        dataObj.nama = pegawai.nama;
        Object.keys(dataObj).forEach(key => { if (dataObj[key] === "") dataObj[key] = null; });

        const fileInput = document.getElementById('fs_file_sertifikat');
        const file = fileInput.files[0];
        let finalFileUrl = document.getElementById('fs_old_file_sertifikat').value; 

        if (file) {
            const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(2,9)}.${file.name.split('.').pop()}`;
            const { error: uploadError } = await supabase.storage.from('lampiran').upload(uniqueFileName, file, { cacheControl: '3600', upsert: false });
            if (uploadError) { alert("Upload Gagal: " + uploadError.message); btn.innerHTML = "Simpan"; btn.disabled = false; return; }
            finalFileUrl = supabase.storage.from('lampiran').getPublicUrl(uniqueFileName).data.publicUrl;
        }

        dataObj.file_sertifikat = finalFileUrl === "" ? null : finalFileUrl;

        if (idData) await supabase.from('sertifikat_pegawai').update(dataObj).eq('id', idData);
        else await supabase.from('sertifikat_pegawai').insert([dataObj]);
        
        btn.innerHTML = `Simpan Sertifikat`; btn.disabled = false;
        document.getElementById('modalSertifUser').style.display = 'none';
        loadSertif(); 
    });

    window.hapusSertifUser = async (id) => {
        if(confirm('Hapus dokumen ini secara permanen?')) {
            await supabase.from('sertifikat_pegawai').delete().eq('id', id);
            loadSertif(); 
        }
    };
}

// ==============================================================
// MODUL 3: SKP (Tambah & Edit)
// ==============================================================
function renderSKPUser(container, pegawai) {
    container.innerHTML = commonCSS + `
        <div class="toolbar">
            <h3 style="color:#0f172a;"><i class="fas fa-file-signature"></i> Sasaran Kinerja Pegawai (SKP)</h3>
            <button class="btn btn-tambah" onclick="window.bukaFormSKPUser()"><i class="fas fa-plus"></i> Tambah SKP Baru</button>
        </div>
        <div class="table-container">
            <table>
                <thead><tr><th>Tahun</th><th>Jabatan</th><th>Pejabat Penilai</th><th>Lampiran</th><th>Aksi</th></tr></thead>
                <tbody id="tabelDataSKP"><tr><td colspan="5" style="text-align:center;">Memuat data...</td></tr></tbody>
            </table>
        </div>

        <div class="modal" id="modalSKPUser">
            <div class="modal-content" style="width: 700px;">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid #e2e8f0; padding-bottom:15px; margin-bottom: 20px;">
                    <h3 id="modalTitleSKP" style="margin:0; font-size: 1.25rem;"><i class="fas fa-edit" style="color:#f59e0b;"></i> Form SKP</h3>
                    <button class="btn btn-hapus" onclick="document.getElementById('modalSKPUser').style.display='none'"><i class="fas fa-times"></i></button>
                </div>
                <form id="formSKPUser">
                    <input type="hidden" name="id" id="fskp_id">
                    <div class="grid-2">
                        <div class="form-group"><label>Tahun SKP</label><input type="number" name="tahun_skp" id="fskp_tahun_skp" required></div>
                        <div class="form-group"><label>Jabatan Saat Penilaian</label><input type="text" name="jabatan" id="fskp_jabatan" required></div>
                        <div class="form-group"><label>Pejabat Penilai</label><input type="text" name="pejabat_penilai" id="fskp_pejabat_penilai" required></div>
                        <div class="form-group"><label>Atasan Pejabat Penilai</label><input type="text" name="atasan_pejabat_penilai" id="fskp_atasan_pejabat_penilai" required></div>
                        <div class="form-group" style="grid-column: span 2;">
                            <label>Upload File SKP (PDF/JPG/PNG)</label>
                            <input type="file" id="fskp_lampiran_skp" accept=".pdf, .jpg, .jpeg, .png">
                            <input type="hidden" id="fskp_old_lampiran">
                            <div id="file_info_skp" style="font-size: 0.8rem; margin-top: 5px; color:#64748b;"></div>
                        </div>
                    </div>
                    <div style="text-align: right; margin-top: 15px;"><button type="submit" class="btn btn-simpan" id="btnSimpanSKP">Simpan SKP</button></div>
                </form>
            </div>
        </div>
    `;

    let dataSKP = [];

    async function loadSKP() {
        const tbody = document.getElementById('tabelDataSKP');
        const { data, error } = await supabase.from('skp_pegawai').select('*').eq('nik', pegawai.nik).order('tahun_skp', { ascending: false });
        if (error) { tbody.innerHTML = `<tr><td colspan="5">Error: ${error.message}</td></tr>`; return; }
        dataSKP = data || [];

        if (dataSKP.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px;">Belum ada arsip SKP.</td></tr>`;
        } else {
            tbody.innerHTML = dataSKP.map(item => `
                <tr>
                    <td><span style="font-weight:bold; color:#0369a1;">${item.tahun_skp || '-'}</span></td>
                    <td>${item.jabatan || '-'}</td><td>${item.pejabat_penilai || '-'}</td>
                    <td>${item.lampiran_skp ? `<a href="${item.lampiran_skp}" target="_blank" class="btn btn-view"><i class="fas fa-file-download"></i></a>` : 'Tidak ada'}</td>
                    <td>
                        <button class="btn btn-edit" onclick="bukaFormSKPUser('${item.id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-hapus" onclick="hapusSKPUser('${item.id}')"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        }
    }
    loadSKP();

    window.bukaFormSKPUser = (id = null) => {
        document.getElementById('formSKPUser').reset();
        document.getElementById('fskp_id').value = '';
        document.getElementById('fskp_old_lampiran').value = '';
        document.getElementById('file_info_skp').innerHTML = '';
        document.getElementById('modalTitleSKP').innerHTML = id ? `<i class="fas fa-edit"></i> Edit SKP` : `<i class="fas fa-plus"></i> Tambah SKP`;
        
        // Auto fill jabatan jika tambah baru
        if (!id) document.getElementById('fskp_jabatan').value = pegawai.jabatan || '';

        if(id) {
            const item = dataSKP.find(p => p.id === id);
            if(item) {
                Object.keys(item).forEach(key => {
                    const inputElement = document.getElementById(`fskp_${key}`);
                    if(inputElement && key !== 'lampiran_skp') inputElement.value = item[key] || '';
                });
                document.getElementById('fskp_old_lampiran').value = item.lampiran_skp || '';
                if(item.lampiran_skp) document.getElementById('file_info_skp').innerHTML = `File saat ini: <a href="${item.lampiran_skp}" target="_blank">Lihat Dokumen</a>`;
            }
        }
        document.getElementById('modalSKPUser').style.display = 'flex';
    };

    document.getElementById('formSKPUser').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btnSimpanSKP');
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Menyimpan...`; btn.disabled = true;
        
        const dataObj = Object.fromEntries(new FormData(e.target).entries());
        const idData = dataObj.id; delete dataObj.id;
        
        dataObj.nik = pegawai.nik; dataObj.nama = pegawai.nama; dataObj.nip = pegawai.nip;
        Object.keys(dataObj).forEach(key => { if (dataObj[key] === "") dataObj[key] = null; });

        const fileInput = document.getElementById('fskp_lampiran_skp');
        const file = fileInput.files[0];
        let finalFileUrl = document.getElementById('fskp_old_lampiran').value; 

        if (file) {
            const uniqueFileName = `SKP_${Date.now()}_${Math.random().toString(36).substring(2,9)}.${file.name.split('.').pop()}`;
            const { error: uploadError } = await supabase.storage.from('lampiran').upload(uniqueFileName, file, { cacheControl: '3600', upsert: false });
            if (uploadError) { alert("Upload Gagal: " + uploadError.message); btn.innerHTML = "Simpan"; btn.disabled = false; return; }
            finalFileUrl = supabase.storage.from('lampiran').getPublicUrl(uniqueFileName).data.publicUrl;
        }

        dataObj.lampiran_skp = finalFileUrl === "" ? null : finalFileUrl;

        if (idData) await supabase.from('skp_pegawai').update(dataObj).eq('id', idData);
        else await supabase.from('skp_pegawai').insert([dataObj]);
        
        btn.innerHTML = `Simpan SKP`; btn.disabled = false;
        document.getElementById('modalSKPUser').style.display = 'none';
        loadSKP(); 
    });

    window.hapusSKPUser = async (id) => {
        if(confirm('Hapus dokumen ini secara permanen?')) {
            await supabase.from('skp_pegawai').delete().eq('id', id);
            loadSKP(); 
        }
    };
}

// ==============================================================
// MODUL 4: PERIZINAN (SIK & STR)
// ==============================================================
function renderPerizinanUser(container, tableName, titleMenu, pegawai) {
    container.innerHTML = commonCSS + `
        <div class="toolbar">
            <h3 style="color:#0f172a;"><i class="fas fa-folder-open"></i> Arsip Dokumen ${titleMenu}</h3>
            <button class="btn btn-tambah" onclick="window.bukaFormIzinUser()"><i class="fas fa-plus"></i> Tambah Dokumen</button>
        </div>
        <div class="table-container">
            <table>
                <thead><tr><th>Nomor Dokumen</th><th>Tanggal Terbit</th><th>Berlaku Sampai</th><th>Lampiran</th><th>Aksi</th></tr></thead>
                <tbody id="tabelDataIzin"><tr><td colspan="5" style="text-align:center;">Memuat data...</td></tr></tbody>
            </table>
        </div>

        <div class="modal" id="modalIzinUser">
            <div class="modal-content" style="width: 700px;">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid #e2e8f0; padding-bottom:15px; margin-bottom: 20px;">
                    <h3 id="modalTitleIzin" style="margin:0; font-size: 1.25rem;"><i class="fas fa-edit" style="color:#f59e0b;"></i> Form ${titleMenu}</h3>
                    <button class="btn btn-hapus" onclick="document.getElementById('modalIzinUser').style.display='none'"><i class="fas fa-times"></i></button>
                </div>
                <form id="formIzinUser">
                    <input type="hidden" name="id" id="fizin_id">
                    <div class="grid-2">
                        <div class="form-group" style="grid-column: span 2;"><label>Nomor ${titleMenu}</label><input type="text" name="nomor" id="fizin_nomor" required></div>
                        <div class="form-group"><label>Tanggal Terbit</label><input type="date" name="tgl_terbit" id="fizin_tgl_terbit" required></div>
                        <div class="form-group"><label>Berlaku Sampai</label><input type="date" name="tgl_berlaku" id="fizin_tgl_berlaku" required></div>
                        <div class="form-group" style="grid-column: span 2;">
                            <label>Upload File / Dokumen (PDF/JPG/PNG)</label>
                            <input type="file" id="fizin_lampiran" accept=".pdf, .jpg, .jpeg, .png">
                            <input type="hidden" id="fizin_old_lampiran">
                            <div id="file_info_izin" style="font-size: 0.8rem; margin-top: 5px; color:#64748b;"></div>
                        </div>
                    </div>
                    <div style="text-align: right; margin-top: 15px;"><button type="submit" class="btn btn-simpan" id="btnSimpanIzin">Simpan Dokumen</button></div>
                </form>
            </div>
        </div>
    `;

    let dataIzin = [];
    const colFile = tableName === 'sik_pegawai' ? 'file_sik' : (tableName === 'str_pegawai' ? 'file_str' : 'lampiran');
    
    // Perbaikan nama kolom form jika tabel menggunakan 'no_surat' untuk SIK
    const colNomor = tableName === 'sik_pegawai' ? 'no_surat' : 'nomor'; 

    async function loadIzin() {
        const tbody = document.getElementById('tabelDataIzin');
        const { data, error } = await supabase.from(tableName).select('*').eq('nik', pegawai.nik).order('created_at', { ascending: false });
        if (error) { tbody.innerHTML = `<tr><td colspan="5">Error: ${error.message}</td></tr>`; return; }
        dataIzin = data || [];

        if (dataIzin.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px;">Belum ada arsip ${titleMenu}.</td></tr>`;
        } else {
            tbody.innerHTML = dataIzin.map(item => `
                <tr>
                    <td><span style="font-weight:bold;">${item[colNomor] || item.nomor || '-'}</span></td>
                    <td>${item.tgl_terbit || '-'}</td><td>${item.tgl_berlaku || '-'}</td>
                    <td>${item[colFile] || item.lampiran ? `<a href="${item[colFile] || item.lampiran}" target="_blank" class="btn btn-view"><i class="fas fa-file-download"></i></a>` : 'Tidak ada'}</td>
                    <td>
                        <button class="btn btn-edit" onclick="bukaFormIzinUser('${item.id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-hapus" onclick="hapusIzinUser('${item.id}')"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        }
    }
    loadIzin();

    window.bukaFormIzinUser = (id = null) => {
        document.getElementById('formIzinUser').reset();
        document.getElementById('fizin_id').value = '';
        document.getElementById('fizin_old_lampiran').value = '';
        document.getElementById('file_info_izin').innerHTML = '';
        document.getElementById('modalTitleIzin').innerHTML = id ? `<i class="fas fa-edit"></i> Edit Dokumen` : `<i class="fas fa-plus"></i> Tambah Dokumen`;

        if(id) {
            const item = dataIzin.find(p => p.id === id);
            if(item) {
                document.getElementById('fizin_id').value = item.id;
                document.getElementById('fizin_nomor').value = item[colNomor] || item.nomor || '';
                document.getElementById('fizin_tgl_terbit').value = item.tgl_terbit || '';
                document.getElementById('fizin_tgl_berlaku').value = item.tgl_berlaku || '';
                
                const currentFile = item[colFile] || item.lampiran || '';
                document.getElementById('fizin_old_lampiran').value = currentFile;
                if(currentFile) document.getElementById('file_info_izin').innerHTML = `File saat ini: <a href="${currentFile}" target="_blank">Lihat Dokumen</a>`;
            }
        }
        document.getElementById('modalIzinUser').style.display = 'flex';
    };

    document.getElementById('formIzinUser').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btnSimpanIzin');
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Menyimpan...`; btn.disabled = true;
        
        const dataObj = Object.fromEntries(new FormData(e.target).entries());
        const idData = dataObj.id; delete dataObj.id;
        
        // Pindahkan nomor dokumen ke nama kolom aslinya
        dataObj[colNomor] = dataObj.nomor;
        if (colNomor !== 'nomor') delete dataObj.nomor;

        dataObj.nik = pegawai.nik; dataObj.nama = pegawai.nama; 
        Object.keys(dataObj).forEach(key => { if (dataObj[key] === "") dataObj[key] = null; });

        const fileInput = document.getElementById('fizin_lampiran');
        const file = fileInput.files[0];
        let finalFileUrl = document.getElementById('fizin_old_lampiran').value; 

        if (file) {
            const uniqueFileName = `${titleMenu.replace(/\//g,'')}_${Date.now()}_${Math.random().toString(36).substring(2,9)}.${file.name.split('.').pop()}`;
            const { error: uploadError } = await supabase.storage.from('lampiran').upload(uniqueFileName, file, { cacheControl: '3600', upsert: false });
            if (uploadError) { alert("Upload Gagal: " + uploadError.message); btn.innerHTML = "Simpan Dokumen"; btn.disabled = false; return; }
            finalFileUrl = supabase.storage.from('lampiran').getPublicUrl(uniqueFileName).data.publicUrl;
        }

        dataObj[colFile] = finalFileUrl === "" ? null : finalFileUrl;

        if (idData) await supabase.from(tableName).update(dataObj).eq('id', idData);
        else await supabase.from(tableName).insert([dataObj]);
        
        btn.innerHTML = `Simpan Dokumen`; btn.disabled = false;
        document.getElementById('modalIzinUser').style.display = 'none';
        loadIzin(); 
    });

    window.hapusIzinUser = async (id) => {
        if(confirm('Hapus dokumen ini secara permanen?')) {
            await supabase.from(tableName).delete().eq('id', id);
            loadIzin(); 
        }
    };
}
