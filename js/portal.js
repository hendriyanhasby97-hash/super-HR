import { supabase } from './koneksi.js';

// Elemen UI
const loginSection = document.getElementById('login-section');
const profileSection = document.getElementById('profile-section');
const formLogin = document.getElementById('formLogin');
const btnLogout = document.getElementById('btnLogout');
const loginError = document.getElementById('login_error');

// Logika Hitung Mundur Sisa Masa Berlaku (Sama seperti di Admin)
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

    // Cek kecocokan NIK dan Password di tabel pegawai
    const { data, error } = await supabase
        .from('pegawai')
        .select('*')
        .eq('nik', nik)
        .eq('password', password)
        .maybeSingle();

    if (data) {
        // Login Sukses!
        loginSection.style.display = 'none';
        profileSection.style.display = 'block';
        btnLogout.style.display = 'block';
        
        tampilkanDataProfil(data);
        loadDokumenPribadi('berkas_str', nik, 'tabel_user_str', 'no_str');
        loadDokumenPribadi('berkas_sik', nik, 'tabel_user_sik', 'no_sip');
    } else {
        // Login Gagal
        loginError.style.display = 'block';
    }

    btn.innerHTML = 'Masuk <i class="fas fa-arrow-right"></i>';
    btn.disabled = false;
});

// LOGOUT
btnLogout.addEventListener('click', () => {
    loginSection.style.display = 'block';
    profileSection.style.display = 'none';
    btnLogout.style.display = 'none';
    formLogin.reset();
});

// TAMPILKAN PROFIL KE KARTU
function tampilkanDataProfil(pegawai) {
    document.getElementById('user_nama').innerText = pegawai.nama || '-';
    document.getElementById('user_nik').innerText = `${pegawai.nik || '-'} / ${pegawai.nip || '-'}`;
    document.getElementById('user_jabatan').innerText = pegawai.jabatan || '-';
    document.getElementById('user_ruangan').innerText = pegawai.ruangan || '-';
    document.getElementById('user_status').innerText = `${pegawai.status || '-'} (${pegawai.kelompok_pegawai || '-'})`;
    
    // Fitur Hitung Otomatis Masa Kerja RS saat ini (Sama seperti Admin)
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

// AMBIL BERKAS (STR / SIK) KHUSUS UNTUK NIK YANG LOGIN
async function loadDokumenPribadi(namaTabel, nikUser, idTabelTarget, kolomNomor) {
    const tbody = document.getElementById(idTabelTarget);
    
    const { data, error } = await supabase
        .from(namaTabel)
        .select('*')
        .eq('nik', nikUser);

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
