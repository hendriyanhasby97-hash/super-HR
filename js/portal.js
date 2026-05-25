import { supabase } from './koneksi.js';

let currentUserAktif = null;

document.addEventListener('DOMContentLoaded', async () => {
    const nikUser = sessionStorage.getItem('nik_user');
    if (sessionStorage.getItem('hris_role') === 'user' && nikUser) {
        const { data: pegawai } = await supabase.from('pegawai').select('*').eq('nik', nikUser).maybeSingle();
        if (pegawai) {
            currentUserAktif = pegawai;
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('portal-layout').style.display = 'flex';
            
            // Isi Profil & Menu
            document.getElementById('form_id_pegawai').value = pegawai.id_pegawai;
            document.getElementById('form_nama').value = pegawai.nama;
            document.getElementById('form_email').value = pegawai.email;
            document.getElementById('form_no_telp').value = pegawai.no_telp;
            document.getElementById('form_alamat').value = pegawai.alamat;

            // Logika Menu Jabatan
            if (pegawai.kelompok_jabatan !== 'Tenaga Administrasi') {
                document.getElementById('menu-sik').style.display = 'flex';
                document.getElementById('menu-str').style.display = 'flex';
                loadDokumen('berkas_str', nikUser, 'tabel_user_str', 'no_str');
                loadDokumen('berkas_sik', nikUser, 'tabel_user_sik', 'no_sip');
            }
        }
    }
});

window.switchTab = (id) => {
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById(`tab-${id}`).style.display = 'block';
    document.getElementById(`menu-${id}`).classList.add('active');
};

async function loadDokumen(tabel, nik, target, kolom) {
    const { data } = await supabase.from(tabel).select('*').eq('nik', nik);
    document.getElementById(target).innerHTML = (data||[]).map(r => 
        `<tr><td>${r[kolom]}</td><td>${r.bidang}</td><td>${r.tgl_berakhir||'Seumur Hidup'}</td><td><span class="countdown-badge" style="background:#dcfce7">OK</span></td><td><a href="${r.lampiran_url}" target="_blank">Lihat</a></td></tr>`
    ).join('');
}

document.getElementById('formEditProfilSendiri').onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('form_id_pegawai').value;
    const data = { nama: document.getElementById('form_nama').value, email: document.getElementById('form_email').value, no_telp: document.getElementById('form_no_telp').value, alamat: document.getElementById('form_alamat').value };
    await supabase.from('pegawai').update(data).eq('id_pegawai', id);
    alert("Profil diperbarui!");
};

document.getElementById('formUbahPassword').onsubmit = async (e) => {
    e.preventDefault();
    if (document.getElementById('pass_lama').value !== currentUserAktif.password) { alert("Pass lama salah!"); return; }
    await supabase.from('pegawai').update({ password: document.getElementById('pass_baru').value }).eq('id_pegawai', currentUserAktif.id_pegawai);
    alert("Berhasil!"); location.reload();
};

document.getElementById('btnBukaModalPass').onclick = () => document.getElementById('modalPassword').style.display = 'flex';
document.getElementById('btnLogout').onclick = () => { sessionStorage.clear(); location.href = 'index.html'; };
