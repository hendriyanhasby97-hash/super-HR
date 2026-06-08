import { supabase } from './koneksi.js';

// 1. IMPORT MODUL DARI FILE EKSTERNAL
import { renderSIK } from './sik.js';
import { renderSTR } from './str.js';
import { renderSertifikat } from './sertifikat.js';
import { renderSKP } from './skp.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 2. CEK AUTENTIKASI
    const userRole = sessionStorage.getItem('hris_role');
    const userNik = sessionStorage.getItem('nik_user');

    if (userRole !== 'user' || !userNik) {
        alert("Sesi tidak valid. Silakan login kembali.");
        window.location.href = 'index.html';
        return;
    }

    // 3. AMBIL DATA PEGAWAI DARI SUPABASE
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

    // 4. LOGIKA KONDISIONAL MENU (Sembunyikan menu berdasarkan jabatan)
    const allowedPerizinan = ['Management', 'Tenaga Medis', 'Tenaga Penunjang Medis', 'Tenaga Kesehatan'];
    if (!allowedPerizinan.includes(pegawai.kelompok_jabatan)) {
        const menuPerizinan = document.getElementById('menu-perizinan');
        if(menuPerizinan) menuPerizinan.style.display = 'none';
    }

    if (pegawai.kelompok_pegawai !== 'ASN' && pegawai.kelompok_pegawai !== 'PNS') {
        const menuSkp = document.getElementById('menu-skp');
        if(menuSkp) menuSkp.style.display = 'none';
    }

    // 5. SISTEM ROUTING HALAMAN PORTAL
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
                renderSIK(container, userRole, userNik);
                break;
            case 'str': 
                pageTitle.innerText = "DOKUMEN STR SAYA"; 
                renderSTR(container, userRole, userNik);
                break;
            case 'sertifikat': 
                pageTitle.innerText = "SERTIFIKAT SAYA"; 
                renderSertifikat(container, userRole, userNik);
                break;
            case 'skp': 
                pageTitle.innerText = "SASARAN KINERJA (SKP) SAYA"; 
                renderSKP(container, userRole, userNik);
                break;
            default:
                renderProfilSaya(container, pegawai);
        }
    };

    // 6. FUNGSI LOGOUT
    document.getElementById('btnUserLogout').addEventListener('click', () => {
        if(confirm("Apakah Anda yakin ingin keluar dari Portal?")) {
            sessionStorage.clear();
            window.location.href = 'index.html';
        }
    });

    window.loadPage('profil');
});

// ==============================================================
// GAYA CSS KHUSUS PROFIL
// ==============================================================
const commonCSS = `
    <style>
        .btn { padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; color: white; font-weight: 500; font-size: 0.875rem; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s ease; }
        .btn:hover { transform: translateY(-1px); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .btn-view, .btn-detail { background: #0ea5e9; padding: 6px 12px;}
        .btn-edit { background: #f59e0b; padding: 6px 12px;}
        .btn-hapus { background: #ef4444; padding: 6px 12px;}
        .btn-simpan, .btn-tambah { background: #10b981; }
        
        .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); align-items: flex-start; justify-content: center; z-index: 9999; padding: 20px; }
        .modal-content { background: white; padding: 32px; border-radius: 12px; width: 900px; max-width: 100%; max-height: 90vh; overflow-y: auto; margin-top: 2vh; border: 1px solid #e2e8f0; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);}
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;}
        .form-group label { display: block; font-weight: 600; font-size: 0.85rem; color: #475569; margin-bottom: 6px;}
        .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; background: #f8fafc; transition: all 0.2s;}
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #3b82f6; background: white; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
        .form-group input[readonly] { background: #e2e8f0; cursor: not-allowed; color: #64748b; font-weight: 600;}
        fieldset { border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin-bottom: 24px;}
        legend { font-weight: 600; background: #f1f5f9; color: #334155; padding: 6px 14px; border-radius: 6px; font-size: 0.85rem; border: 1px solid #e2e8f0;}
        
        .summary-card { background: white; border-radius: 12px; padding: 25px; display: flex; align-items: center; gap: 25px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; margin-bottom: 25px;}
        .summary-icon { width: 80px; height: 80px; background: #e0f2fe; color: #0ea5e9; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; }
        .summary-info h3 { font-size: 1.5rem; color: #0f172a; margin-bottom: 5px; font-weight: 700;}
        .summary-info p { color: #64748b; font-size: 0.95rem; margin-bottom: 3px; font-weight: 500;}
        .detail-item { border-bottom: 1px solid #f1f5f9; padding: 12px 0; display: flex; flex-direction: column;}
        .detail-label { font-size: 0.75rem; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;}
        .detail-value { font-size: 0.95rem; color: #0f172a; font-weight: 500; margin-top: 6px; word-wrap: break-word; white-space: normal; }
    </style>
`;

// ==============================================================
// MODUL PROFIL SAYA
// ==============================================================
function renderProfilSaya(container, pegawai) {
    container.innerHTML = commonCSS + `
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
                                    <option value="" hidden>Pilih...</option><option value="ASN">ASN</option><option value="PNS">PNS</option><option value="APBD">APBD</option><option value="BLUD">BLUD</option><option value="Konsultan">Konsultan</option><option value="Magang">Magang</option>
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
                            <div class="form-group"><label>TMT CPNS (Otomatis dari NIP)</label><input type="date" name="tmt_cpns" id="form_tmt_cpns" readonly placeholder="Otomatis dihitung..."></div>
                            <div class="form-group"><label>Tanggal Masuk RS</label><input type="date" name="masuk_rs" id="form_masuk_rs"></div>
                            <div class="form-group"><label>Masa Kerja RS (Otomatis)</label><input type="text" name="masa_kerja_rs" id="form_masa_kerja_rs" readonly placeholder="Otomatis dihitung..."></div>
                            <div class="form-group"><label>Rentang BUP (Tahun)</label><input type="number" name="rentang_bup" id="form_rentang_bup" placeholder="Contoh: 58"></div>
                            <div class="form-group"><label>TMT Pensiun (Otomatis)</label><input type="date" name="tmt_pensiun" id="form_tmt_pensiun" readonly></div>
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

    // 1. Ambil Data Master untuk Dropdown
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

    // Elemen Input untuk Hitung Otomatis
    const inpKelPegawai = document.getElementById('form_kelompok_pegawai');
    const inptmtPangkat = document.getElementById('form_tmt_pangkat');
    const inptmtBerikutnya = document.getElementById('form_tmt_berikutnya');
    const inpNip = document.getElementById('form_nip');
    const inptmtCpns = document.getElementById('form_tmt_cpns');

    const inpTglLahir = document.getElementById('form_tanggal_lahir');
    const inpBUP = document.getElementById('form_rentang_bup');
    const inpTmtPensiun = document.getElementById('form_tmt_pensiun');

    // 2. Fungsi Lock Field jika bukan PNS/ASN
    function cekStatusPegawai() {
        if (!inpKelPegawai) return;
        const isPNS = (inpKelPegawai.value === 'ASN' || inpKelPegawai.value === 'PNS');
        
        inptmtPangkat.readOnly = !isPNS;
        inptmtBerikutnya.readOnly = !isPNS;
        inpNip.readOnly = !isPNS;

        // Ubah warna agar terlihat jelas ter-lock
        inptmtPangkat.style.backgroundColor = !isPNS ? '#e2e8f0' : '';
        inptmtBerikutnya.style.backgroundColor = !isPNS ? '#e2e8f0' : '';
        inpNip.style.backgroundColor = !isPNS ? '#e2e8f0' : '';
    }
    if (inpKelPegawai) inpKelPegawai.addEventListener('change', cekStatusPegawai);

    // 3. Fungsi TMT CPNS dari NIP
    if (inpNip) {
        inpNip.addEventListener('input', () => {
            let nip = inpNip.value.replace(/[^0-9]/g, '');
            if (nip.length >= 14) {
                // Diambil dari NIP karakter ke-9 (index 8): 4 digit Tahun, 2 digit Bulan
                const year = nip.substring(8, 12);
                const month = nip.substring(12, 14);
                if (year > 1900 && month >= 1 && month <= 12) {
                    inptmtCpns.value = `${year}-${month}-01`;
                }
            }
        });
    }

    // 4. Fungsi TMT Pensiun dari Tgl Lahir + BUP
    function hitungTmtPensiun() {
        if (!inpTglLahir || !inpBUP || !inpTmtPensiun) return;
        const tglLahirVal = inpTglLahir.value;
        const bupVal = parseInt(inpBUP.value);

        if (tglLahirVal && !isNaN(bupVal)) {
            let tgl = new Date(tglLahirVal);
            tgl.setFullYear(tgl.getFullYear() + bupVal); // Tambah tahun BUP
            tgl.setMonth(tgl.getMonth() + 1);            // Maju ke bulan berikutnya
            tgl.setDate(1);                              // Set ke tanggal 1

            let y = tgl.getFullYear();
            let m = String(tgl.getMonth() + 1).padStart(2, '0');
            let d = '01';
            inpTmtPensiun.value = `${y}-${m}-${d}`;
        } else {
            inpTmtPensiun.value = '';
        }
    }
    if (inpTglLahir) inpTglLahir.addEventListener('input', hitungTmtPensiun);
    if (inpBUP) inpBUP.addEventListener('input', hitungTmtPensiun);

    // 5. Perhitungan Masa Kerja RS
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

    // Modal Events View
    document.getElementById('btnViewUser').onclick = () => {
        const kontenDetail = document.getElementById('kontenDetailUser');
        kontenDetail.innerHTML = '';
        const keys = ['nik','nip','nama','tempat_lahir','tanggal_lahir','jenis_kelamin','agama','status_keluarga','no_telp','email','alamat','status','kelompok_pegawai','kelompok_jabatan','gol','jabatan','ruangan','tmt_pangkat','tmt_berikutnya','tmt_cpns','masuk_rs','masa_kerja_rs','rentang_bup','tmt_pensiun','jenjang','fakultas','jurusan','no_bpjsn','no_bpjsket_taspen','npwp'];
        keys.forEach(k => {
            const div = document.createElement('div');
            div.className = 'detail-item';
            div.innerHTML = `<span class="detail-label">${k.replace(/_/g, ' ')}</span><span class="detail-value">${pegawai[k] || "-"}</span>`;
            if(k === 'alamat') div.style.gridColumn = 'span 3';
            kontenDetail.appendChild(div);
        });
        document.getElementById('modalViewUser').style.display = 'flex';
    };

    // Modal Events Edit
    document.getElementById('btnEditUser').onclick = () => {
        Object.keys(pegawai).forEach(key => {
            const inputElement = document.getElementById(`form_${key}`);
            if(inputElement) inputElement.value = pegawai[key] || '';
        });
        document.getElementById('form_masuk_rs').addEventListener('input', hitungMasaKerja);
        
        // Panggil trigger kalkulasi saat pertama kali form terbuka
        hitungMasaKerja();
        cekStatusPegawai();
        hitungTmtPensiun();

        document.getElementById('modalEditUser').style.display = 'flex';
    };

    // Submit Perubahan
    document.getElementById('formPegawaiUser').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btnSimpanProfil');
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Menyimpan...`;
        btn.disabled = true;
        
        const formData = new FormData(e.target);
        const dataObj = Object.fromEntries(formData.entries());
        Object.keys(dataObj).forEach(key => { if (dataObj[key] === "") dataObj[key] = null; });
        delete dataObj.nik; // Kunci NIK agar tidak bisa dirubah via payload
        
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
