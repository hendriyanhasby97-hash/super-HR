import { supabase } from './koneksi.js';

let currentUserAktif = null;

// --- INISIALISASI HALAMAN ---
document.addEventListener('DOMContentLoaded', async () => {
    const loginSection = document.getElementById('login-section');
    const portalLayout = document.getElementById('portal-layout');

    const role = sessionStorage.getItem('hris_role');
    const nikUser = sessionStorage.getItem('nik_user');

    if (role === 'user' && nikUser) {
        // Ambil data langsung dari Supabase berdasarkan NIK
        const { data: pegawai, error } = await supabase
            .from('pegawai')
            .select('*')
            .eq('nik', nikUser)
            .maybeSingle();

        if (pegawai) {
            currentUserAktif = pegawai;
            loginSection.style.display = 'none';
            portalLayout.style.display = 'flex';
            
            isiDataFormProfil(pegawai);
            setupMenuBerdasarkanJabatan(pegawai.kelompok_jabatan);
            loadDokumenPribadi('berkas_str', pegawai.nik, 'tabel_user_str', 'no_str');
            loadDokumenPribadi('berkas_sik', pegawai.nik, 'tabel_user_sik', 'no_sip');
        } else {
            sessionStorage.clear();
            location.reload();
        }
    } else {
        loginSection.style.display = 'flex';
        portalLayout.style.display = 'none';
    }
});

// --- FUNGSI MENU & TABS ---
window.switchTab = (tabName) => {
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).style.display = 'block';
    document.getElementById(`menu-${tabName}`).classList.add('active');
    const judul = { 'profil': 'Profil Saya', 'sik': 'Berkas SIK', 'str': 'Berkas STR' };
    document.getElementById('portal-page-title').innerText = judul[tabName];
};

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

// --- FUNGSI DATA ---
function isiDataFormProfil(pegawai) {
    document.getElementById('form_id_pegawai').value = pegawai.id_pegawai || '';
    document.getElementById('form_nama').value = pegawai.nama || '';
    document.getElementById('form_email').value = pegawai.email || '';
}

async function loadDokumenPribadi(namaTabel, nikUser, idTabelTarget, kolomNomor) {
    const tbody = document.getElementById(idTabelTarget);
    const { data } = await supabase.from(namaTabel).select('*').eq('nik', nikUser);

    if (!data || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Tidak ada berkas.</td></tr>`;
        return;
    }

    tbody.innerHTML = data.map(row => {
        const linkFile = row.lampiran_url ? `<a href="${row.lampiran_url}" target="_blank" style="background:#0ea5e9; color:white; padding:5px 10px; border-radius:4px; text-decoration:none;"><i class="fas fa-file-pdf"></i> Lihat</a>` : '-';
        return `<tr><td><strong>${row[kolomNomor] || '-'}</strong></td><td>${row.bidang || '-'}</td><td>${row.tgl_berakhir || 'Seumur Hidup'}</td><td>${linkFile}</td></tr>`;
    }).join('');
}

// --- LOGIKA LOGIN & PROFIL ---
document.getElementById('formLogin').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nik = document.getElementById('login_nik').value;
    const pass = document.getElementById('login_password').value;

    const { data } = await supabase.from('pegawai').select('*').eq('nik', nik).eq('password', pass).maybeSingle();
    if (data) {
        sessionStorage.setItem('hris_role', 'user');
        sessionStorage.setItem('nik_user', data.nik);
        location.reload();
    } else {
        document.getElementById('login_error').style.display = 'block';
    }
});

document.getElementById('formEditProfilSendiri').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('form_id_pegawai').value;
    const data = { nama: document.getElementById('form_nama').value, email: document.getElementById('form_email').value };
    
    await supabase.from('pegawai').update(data).eq('id_pegawai', id);
    alert("Profil diperbarui!");
});

// --- LOGIKA PASSWORD ---
document.getElementById('btnBukaModalPass').onclick = () => document.getElementById('modalPassword').style.display = 'flex';
document.getElementById('formUbahPassword').addEventListener('submit', async (e) => {
    e.preventDefault();
    const passLama = document.getElementById('pass_lama').value;
    const passBaru = document.getElementById('pass_baru').value;
    
    if (passLama !== currentUserAktif.password) { alert("Password lama salah!"); return; }
    await supabase.from('pegawai').update({ password: passBaru }).eq('id_pegawai', currentUserAktif.id_pegawai);
    alert("Password berhasil diubah!");
    document.getElementById('modalPassword').style.display = 'none';
});

document.getElementById('btnLogout').onclick = () => { sessionStorage.clear(); window.location.href = 'index.html'; };
