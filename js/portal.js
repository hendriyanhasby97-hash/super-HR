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
                // PERBAIKAN NAMA TABEL DI SINI
                renderPerizinanUser(container, 'berkas_sik', 'SIK / SIP', pegawai);
                break;
            case 'str': 
                pageTitle.innerText = "DOKUMEN STR SAYA"; 
                // PERBAIKAN NAMA TABEL DI SINI
                renderPerizinanUser(container, 'berkas_str', 'STR', pegawai);
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
        .modal-content { background: white; padding: 32px; border-radius: 12px; width: 900px; max-width: 1
