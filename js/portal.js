import { supabase } from './koneksi.js';

// --- SISTEM PROTEKSI HALAMAN (MIDDLEWARE) ---
const role = sessionStorage.getItem('hris_role');
const userDataStr = sessionStorage.getItem('userData_aktif');

// Jika bukan User Pegawai yang login, lemparkan kembali ke index.html
if (role !== 'user' || !userDataStr) {
    window.location.href = 'index.html';
}

const currentUserAktif = JSON.parse(userDataStr);

// Elemen Dom
const formEditProfil = document.getElementById('formEditProfilSendiri');
const btnLogout = document.getElementById('btnLogout');
const btnBukaModalPass = document.getElementById('btnBukaModalPass');
const modalPassword = document.getElementById('modalPassword');
const formUbahPassword = document.getElementById('formUbahPassword');
const passError = document.getElementById('pass_error');

// Inisialisasi Halaman
document.addEventListener('DOMContentLoaded', () => {
    setupMenuBerdasarkanJabatan(currentUserAktif.kelompok_jabatan);
    isiDataFormProfil(currentUserAktif);
    
    loadDokumenPribadi('berkas_str', currentUserAktif.nik, 'tabel_user_str', 'no_str');
    loadDokumenPribadi('berkas_sik', currentUserAktif.nik, 'tabel_user_sik', 'no_sip');
});

window.switchTab = (tabName) => {
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    
    document.getElementById(`tab-${tabName}`).style.display = 'block';
    document.getElementById(`menu-${tabName}`).classList.add('active');
    
    const judul = { 'profil': 'Profil Saya', 'sik': 'Berkas SIK (Surat Izin Kerja)', 'str': 'Berkas STR (Surat Tanda Registrasi)' };
    document.getElementById('portal-page-title').innerText = judul[tabName];
};

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

function setupMenuBerdasarkanJabatan(kelompokJabatan) {
    const menuSik = document.getElementById('menu-sik');
    const menuStr = document.getElementById('menu-str');
    
    if (kelompokJabatan && kelompokJabatan.toLowerCase() !== 'tenaga administrasi') {
        menuSik.style.display = 'flex';
        menuStr.style.display = 'flex';
    } else {
        menuSik.style.display = 'none';
        menuStr.style.display = 'none';
    }
}

function isiDataFormProfil(pegawai) {
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

    // Kunci
    document.getElementById('form_nik').value = pegawai.nik || '-';
    document.getElementById('form_nip').value = pegawai.nip || '-';
    document.getElementById('form_jabatan').value = pegawai.jabatan || '-';
    document.getElementById('form_ruangan').value = pegawai.ruangan || '-';
    document.getElementById('form_kelompok_jabatan').value = pegawai.kelompok_jabatan || '-';
    document.getElementById('form_masa_kerja_rs').value = pegawai.masa_kerja_rs || '-';
}

formEditProfil.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btnSimpanProfil');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
    btn.disabled = true;

    const formData = new FormData(formEditProfil);
    const updatedData = Object.fromEntries(formData.entries());
    const id_pegawai = updatedData.id_pegawai;
    delete updatedData.id_pegawai;

    const { error } = await supabase.from('pegawai').update(updatedData).eq('id_pegawai', id_pegawai);

    if (error) {
        alert("Gagal memperbarui profil: " + error.message);
    } else {
        alert("Sukses! Profil Anda telah diperbarui.");
        Object.assign(currentUserAktif, updatedData);
        sessionStorage.setItem('userData_aktif', JSON.stringify(currentUserAktif)); // Update cache session
    }
    btn.innerHTML = '<i class="fas fa-save"></i> Simpan Perubahan Profil';
    btn.disabled = false;
});

async function loadDokumenPribadi(namaTabel, nikUser, idTabelTarget, kolomNomor) {
    const tbody = document.getElementById(idTabelTarget);
    const { data, error } = await supabase.from(namaTabel).select('*').eq('nik', nikUser);

    if (error || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#94a3b8;">Belum ada data berkas dari HRD.</td></tr>`;
        return;
    }

    tbody.innerHTML = data.map(row => {
        const hitung = hitungSisaMasaBerlaku(row.tgl_berakhir);
        const linkFile = row.lampiran_url ? `<a href="${row.lampiran_url}" target="_blank" class="countdown-badge" style="background:#0ea5e9; color:white; text-decoration:none;"><i class="fas fa-file-pdf"></i> Lihat File</a>` : '-';
        return `<tr><td><strong>${row[kolomNomor] || '-'}</strong></td><td>${row.bidang || '-'}</td><td>${row.tgl_berakhir || 'Seumur Hidup'}</td><td><span class="countdown-badge" style="background:${hitung.bg}; color:${hitung.fg};">${hitung.teks}</span></td><td>${linkFile}</td></tr>`;
    }).join('');
}

// LOGIKA UBAH PASSWORD
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
        sessionStorage.setItem('userData_aktif', JSON.stringify(currentUserAktif));
        alert("Password berhasil diperbarui!");
        modalPassword.style.display = 'none';
    } else {
        alert(error.message);
    }
});

btnLogout.onclick = () => {
    sessionStorage.clear(); // Hapus semua data
    window.location.href = 'index.html'; // Kembali ke gerbang login utama
};
