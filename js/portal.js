import { supabase } from './koneksi.js';

// Elemen UI
const loginSection = document.getElementById('login-section');
const profileSection = document.getElementById('profile-section');
const formLogin = document.getElementById('formLogin');
const btnLogout = document.getElementById('btnLogout');
const btnBukaModalPass = document.getElementById('btnBukaModalPass');
const loginError = document.getElementById('login_error');

// Elemen Modal Password
const modalPassword = document.getElementById('modalPassword');
const formUbahPassword = document.getElementById('formUbahPassword');
const passError = document.getElementById('pass_error');

// Menyimpan data pegawai yang sedang aktif login
let currentUserAktif = null; 

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
    if (teksStr === '') teksStr = '0 Hari';

    return { teks: teksStr.trim(), bg: bg, fg: fg };
}

// PROSES LOGIN
formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nik = document.getElementById('login_nik').value;
    const password = document.getElementById('login_password').value;
    const btn = document.getElementById('btnSubmitLogin');
    
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memeriksa...';
    btn.disabled = true;
    loginError.style.display = 'none';

    const { data, error } = await supabase
        .from('pegawai')
        .select('*')
        .eq('nik', nik)
        .eq('password', password)
        .maybeSingle();

    if (data) {
        currentUserAktif = data; // Simpan data user ke memori
        loginSection.style.display = 'none';
        profileSection.style.display = 'block';
        btnLogout.style.display = 'flex';
        btnBukaModalPass.style.display = 'flex';
        
        tampilkanDataProfil(data);
        loadDokumenPribadi('berkas_str', nik, 'tabel_user_str', 'no_str');
        loadDokumenPribadi('berkas_sik', nik, 'tabel_user_sik', 'no_sip');
    } else {
        loginError.style.display = 'block';
    }

    btn.innerHTML = 'Masuk <i class="fas fa-arrow-right"></i>';
    btn.disabled = false;
});

// LOGOUT
btnLogout.addEventListener('click', () => {
    currentUserAktif = null;
    loginSection.style.display = 'block';
    profileSection.style.display = 'none';
    btnLogout.style.display = 'none';
    btnBukaModalPass.style.display = 'none';
    formLogin.reset();
});

// TAMPILKAN PROFIL
function tampilkanDataProfil(pegawai) {
    document.getElementById('user_nama').innerText = pegawai.nama || '-';
    document.getElementById('user_nik').innerText = `${pegawai.nik || '-'} / ${pegawai.nip || '-'}`;
    document.getElementById('user_jabatan').innerText = pegawai.jabatan || '-';
    document.getElementById('user_ruangan').innerText = pegawai.ruangan || '-';
    document.getElementById('user_status').innerText = `${pegawai.status || '-'} (${pegawai.kelompok_pegawai || '-'})`;
    
    if (pegawai.masuk_rs) {
        const start = new Date(pegawai.masuk_rs);
        const end = new Date();
        let years = end.getFullYear() - start.getFullYear();
        let months = end.getMonth() - start.getMonth();
        if (months < 0) { years--; months += 12; }
        document.getElementById('user_masa_kerja').innerText = `${years} Tahun ${months} Bulan`;
    } else {
        document.getElementById('user_masa_kerja').innerText = '-';
    }
}

// AMBIL BERKAS
async function loadDokumenPribadi(namaTabel, nikUser, idTabelTarget, kolomNomor) {
    const tbody = document.getElementById(idTabelTarget);
    const { data, error } = await supabase.from(namaTabel).select('*').eq('nik', nikUser);

    if (error || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#94a3b8;">Belum ada berkas terdaftar.</td></tr>`;
        return;
    }

    tbody.innerHTML = data.map(row => {
        const hitung = hitungSisaMasaBerlaku(row.tgl_berakhir);
        const linkFile = row.lampiran_url 
            ? `<a href="${row.lampiran_url}" target="_blank" style="color:#0ea5e9; text-decoration:none; font-weight:bold;"><i class="fas fa-download"></i> Unduh</a>` 
            : '-';

        return `
            <tr>
                <td><strong>${row[kolomNomor] || '-'}</strong></td>
                <td>${row.tgl_terbit || '-'}</td>
                <td><span class="badge" style="background:${hitung.bg}; color:${hitung.fg};">${hitung.teks}</span></td>
                <td>${linkFile}</td>
            </tr>
        `;
    }).join('');
}


// --- LOGIKA UBAH PASSWORD ---

// Buka Modal
btnBukaModalPass.addEventListener('click', () => {
    formUbahPassword.reset();
    passError.style.display = 'none';
    modalPassword.style.display = 'flex';
});

// Tutup Modal
document.getElementById('btnTutupModalPass').addEventListener('click', () => {
    modalPassword.style.display = 'none';
});

// Submit Form Ubah Password
formUbahPassword.addEventListener('submit', async (e) => {
    e.preventDefault();
    const passLama = document.getElementById('pass_lama').value;
    const passBaru = document.getElementById('pass_baru').value;
    const passBaruConfirm = document.getElementById('pass_baru_confirm').value;
    const btnSimpanPass = document.getElementById('btnSimpanPass');

    // Validasi 1: Cek apakah password lama yang dimasukkan sesuai dengan database
    if (passLama !== currentUserAktif.password) {
        passError.innerText = "Password Lama tidak cocok!";
        passError.style.display = 'block';
        return;
    }

    // Validasi 2: Cek kecocokan konfirmasi password
    if (passBaru !== passBaruConfirm) {
        passError.innerText = "Konfirmasi Password Baru tidak cocok!";
        passError.style.display = 'block';
        return;
    }

    // Lolos Validasi -> Proses Update ke Supabase
    btnSimpanPass.innerText = "Menyimpan...";
    btnSimpanPass.disabled = true;

    const { error } = await supabase
        .from('pegawai')
        .update({ password: passBaru })
        .eq('id_pegawai', currentUserAktif.id_pegawai);

    if (error) {
        passError.innerText = "Gagal mengubah password: " + error.message;
        passError.style.display = 'block';
    } else {
        // Update sukses
        currentUserAktif.password = passBaru; // Update di memori lokal agar tidak perlu login ulang
        alert("Password berhasil diubah! Silakan gunakan password baru ini untuk login berikutnya.");
        modalPassword.style.display = 'none';
    }

    btnSimpanPass.innerText = "Simpan Password";
    btnSimpanPass.disabled = false;
});
