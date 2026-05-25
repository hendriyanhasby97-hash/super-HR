import { supabase } from './koneksi.js';

// Dom Elemen
const loginSection = document.getElementById('login-section');
const portalLayout = document.getElementById('portal-layout');
const formLogin = document.getElementById('formLogin');
const btnLogout = document.getElementById('btnLogout');
const btnBukaModalPass = document.getElementById('btnBukaModalPass');
const loginError = document.getElementById('login_error');

const modalPassword = document.getElementById('modalPassword');
const formUbahPassword = document.getElementById('formUbahPassword');
const passError = document.getElementById('pass_error');

const formEditProfil = document.getElementById('formEditProfilSendiri');

let currentUserAktif = null;

// --- TAB SWITCHER SYSTEM ---
window.switchTab = (tabName) => {
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    
    document.getElementById(`tab-${tabName}`).style.display = 'block';
    document.getElementById(`menu-${tabName}`).classList.add('active');
    
    // Update Judul Topbar Dinamis
    const judul = { 'profil': 'Profil Saya', 'sik': 'Berkas SIK (Surat Izin Kerja)', 'str': 'Berkas STR (Surat Tanda Registrasi)' };
    document.getElementById('portal-page-title').innerText = judul[tabName];
};

// --- LOGIKA HITUNG MUNDUR SISA MASA BERLAKU BERKAS ---
function hitungSisaMasaBerlaku(tglAkhirStr) {
    if (!tglAkhirStr) return { teks: 'Seumur Hidup', bg: '#dcfce7', fg: '#10b981' };
    
    const hariIni = new Date();
    const tglAkhir = new Date(tglAkhirStr);
    hariIni.setHours(0,0,0,0); tglAkhir.setHours(0,0,0,0);

    if (tglAkhir < hariIni) return { teks: 'Expired / Mati', bg: '#fee2e2', fg: '#ef4444' };

    let thn = tglAkhir.getFullYear() - hariIni.getFullYear();
    let bln = tglAkhir.getMonth() - hariIni.getMonth();
    let hri = tglAkhir.getDate() - hariIni.getDate();

    if (hri < 0) {
        bln--;
        const bulanLalu = new Date(tglAkhir.getFullYear(), tglAkhir.getMonth(), 0);
        hri += bulanLalu.getDate();
    }
    if (bln < 0) { thn--; bln += 12; }

    const totalSisaBulan = (thn * 12) + bln + (hri / 30);

    let bg = '#dcfce7', fg = '#10b981'; 
    if (totalSisaBulan <= 3) { bg = '#fee2e2'; fg = '#ef4444'; } 
    else if (totalSisaBulan <= 6) { bg = '#fef9c3'; fg = '#d97706'; }

    let teksStr = '';
    if (thn > 0) teksStr += `${thn} Tahun `;
    if (bln > 0) teksStr += `${bln} Bulan `;
    teksStr += `${hri} Hari`;

    return { teks: teksStr.trim(), bg: bg, fg: fg };
}

// --- PROSES LOGIN ---
formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nik = document.getElementById('login_nik').value.trim();
    const password = document.getElementById('login_password').value;
    const btn = document.getElementById('btnSubmitLogin');
    
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Otentikasi...';
    btn.disabled = true;
    loginError.style.display = 'none';

    const { data, error } = await supabase
        .from('pegawai')
        .select('*')
        .eq('nik', nik)
        .eq('password', password)
        .maybeSingle();

    if (data) {
        currentUserAktif = data;
        loginSection.style.display = 'none';
        portalLayout.style.display = 'flex';
        
        setupMenuBerdasarkanJabatan(data.kelompok_jabatan);
        isiDataFormProfil(data);
        
        loadDokumenPribadi('berkas_str', nik, 'tabel_user_str', 'no_str');
        loadDokumenPribadi('berkas_sik', nik, 'tabel_user_sik', 'no_sip');
        switchTab('profil');
    } else {
        loginError.style.display = 'block';
    }
    btn.innerHTML = 'Masuk Portal <i class="fas fa-arrow-right"></i>';
    btn.disabled = false;
});

// --- ATUR VISIBILITAS MENU SIK & STR BERDASARKAN KELOMPOK JABATAN ---
function setupMenuBerdasarkanJabatan(kelompokJabatan) {
    const menuSik = document.getElementById('menu-sik');
    const menuStr = document.getElementById('menu-str');
    
    // Aturan: Jika kelompok jabatan SELEIN "Tenaga Administrasi", tampilkan berkas
    if (kelompokJabatan && kelompokJabatan.toLowerCase() !== 'tenaga administrasi') {
        menuSik.style.display = 'flex';
        menuStr.style.display = 'flex';
    } else {
        menuSik.style.display = 'none';
        menuStr.style.display = 'none';
    }
}

// --- ISI FORM PROFIL ---
function isiDataFormProfil(pegawai) {
    // Isi data field editable
    document.getElementById('form_id_pegawai').value = pegawai.id_pegawai;
    document.getElementById('form_nama').value = pegawai.nama || '';
    document.getElementById('form_tempat_lahir').value = pegawai.tempat_lahir || '';
    document.getElementById('form_tanggal_lahir').value = pegawai.tanggal_lahir || '';
    document.getElementById('form_jenis_kelamin').value = pegawai.jenis_kelamin || 'Laki-laki';
    document.getElementById('form_agama').value = pegawai.agama || 'Islam';
    document.getElementById('form_status_keluarga').value = pegawai.status_keluarga || 'Lajang';
    document.getElementById('form_no_telp').value = pegawai.no_telp || '';
    document.getElementById('form_email').value = pegawai.email || '';
    document.getElementById('form_alamat').value = pegawai.alamat || '';
    document.getElementById('form_jenjang').value = pegawai.jenjang || 'S1';
    document.getElementById('form_fakultas').value = pegawai.fakultas || '';
    document.getElementById('form_jurusan').value = pegawai.jurusan || '';
    document.getElementById('form_no_bpjsn').value = pegawai.no_bpjsn || '';
    document.getElementById('form_no_bpjsket_taspen').value = pegawai.no_bpjsket_taspen || '';
    document.getElementById('form_npwp').value = pegawai.npwp || '';

    // Isi data field Read Only (Kunci)
    document.getElementById('form_nik').value = pegawai.nik || '-';
    document.getElementById('form_nip').value = pegawai.nip || '-';
    document.getElementById('form_jabatan').value = pegawai.jabatan || '-';
    document.getElementById('form_ruangan').value = pegawai.ruangan || '-';
    document.getElementById('form_kelompok_jabatan').value = pegawai.kelompok_jabatan || '-';
    document.getElementById('form_masa_kerja_rs').value = pegawai.masa_kerja_rs || '-';
}

// --- AKSI SIMPAN PERUBAHAN DATA PROFIL OLEH PEGAWAI ---
formEditProfil.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btnSimpanProfil');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
    btn.disabled = true;

    const formData = new FormData(formEditProfil);
    const updatedData = Object.fromEntries(formData.entries());
    const id_pegawai = updatedData.id_pegawai;
    delete updatedData.id_pegawai;

    const { error } = await supabase
        .from('pegawai')
        .update(updatedData)
        .eq('id_pegawai', id_pegawai);

    if (error) {
        alert("Gagal memperbarui profil: " + error.message);
    } else {
        alert("Sukses! Profil Anda telah berhasil diperbarui.");
        // Perbarui cache data user aktif
        Object.assign(currentUserAktif, updatedData);
    }
    btn.innerHTML = '<i class="fas fa-save"></i> Simpan Perubahan Profil';
    btn.disabled = false;
});

// --- AMBIL DATA BERKAS MILIK PEGAWAI ---
async function loadDokumenPribadi(namaTabel, nikUser, idTabelTarget, kolomNomor) {
    const tbody = document.getElementById(idTabelTarget);
    const { data, error } = await supabase.from(namaTabel).select('*').eq('nik', nikUser);

    if (error || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#94a3b8;">Belum ada data berkas yang di-upload oleh HRD.</td></tr>`;
        return;
    }

    tbody.innerHTML = data.map(row => {
        const hitung = hitungSisaMasaBerlaku(row.tgl_berakhir);
        const linkFile = row.lampiran_url 
            ? `<a href="${row.lampiran_url}" target="_blank" class="countdown-badge" style="background:#0ea5e9; color:white; text-decoration:none;"><i class="fas fa-file-pdf"></i> Lihat File</a>` 
            : '<span style="color:#94a3b8">Tidak Ada Berkas</span>';

        return `
            <tr>
                <td><strong>${row[kolomNomor] || '-'}</strong></td>
                <td>${row.bidang || '-'}</td>
                <td>${row.tgl_berakhir || 'Seumur Hidup'}</td>
                <td><span class="countdown-badge" style="background:${hitung.bg}; color:${hitung.fg};">${hitung.teks}</span></td>
                <td>${linkFile}</td>
            </tr>
        `;
    }).join('');
}

// --- LOGIKA MODAL PASWORD ---
btnBukaModalPass.onclick = () => { formUbahPassword.reset(); passError.style.display = 'none'; modalPassword.style.display = 'flex'; };
document.getElementById('btnTutupModalPass').onclick = () => modalPassword.style.display = 'none';

formUbahPassword.addEventListener('submit', async (e) => {
    e.preventDefault();
    const passLama = document.getElementById('pass_lama').value;
    const passBaru = document.getElementById('pass_baru').value;
    const passBaruConfirm = document.getElementById('pass_baru_confirm').value;

    if (passLama !== currentUserAktif.password) { passError.innerText = "Password Lama Salah!"; passError.style.display = 'block'; return; }
    if (passBaru !== passBaruConfirm) { passError.innerText = "Konfirmasi Password Baru Tidak Cocok!"; passError.style.display = 'block'; return; }

    const { error } = await supabase.from('pegawai').update({ password: passBaru }).eq('id_pegawai', currentUserAktif.id_pegawai);
    if (!error) {
        currentUserAktif.password = passBaru;
        alert("Password berhasil diperbarui!");
        modalPassword.style.display = 'none';
    } else {
        alert(error.message);
    }
});

// LOGOUT
btnLogout.onclick = () => { currentUserAktif = null; loginSection.style.display = 'flex'; portalLayout.style.display = 'none'; formLogin.reset(); };
