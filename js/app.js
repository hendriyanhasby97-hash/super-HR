import { renderPegawai } from './pegawai.js';

// Jadikan loadPage bersifat global (window) agar bisa dipanggil dari onclick HTML
window.loadPage = (page) => {
    const container = document.getElementById('app-content');
    const pageTitle = document.getElementById('page-title');
    
    // 1. Atur Warna Menu Aktif di Sidebar
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    // event.currentTarget menangkap elemen menu yang sedang diklik
    if (event && event.currentTarget && event.currentTarget.tagName === 'LI') {
        event.currentTarget.classList.add('active');
    }

    // 2. Routing (Pilih halaman mana yang mau dirender)
    switch (page) {
        case 'dashboard':
            pageTitle.innerText = "DASHBOARD";
            container.innerHTML = `
                <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <h2>Selamat Datang</h2>
                    <p style="color: #64748b; margin-top: 10px;">Gunakan menu di sebelah kiri untuk mengelola data SDM.</p>
                </div>
            `;
            break;

        case 'pegawai':
            pageTitle.innerText = "MANAJEMEN DATA PEGAWAI";
            // Panggil fungsi CRUD dari pegawai.js dan masukkan ke dalam container
            renderPegawai(container); 
            break;

        case 'pegawai-masuk':
            pageTitle.innerText = "PEGAWAI MASUK";
            container.innerHTML = `<p>Fitur form pegawai masuk belum diaktifkan.</p>`;
            break;

        case 'pegawai-keluar':
            pageTitle.innerText = "PEGAWAI KELUAR";
            container.innerHTML = `<p>Fitur form pegawai keluar belum diaktifkan.</p>`;
            break;

        default:
            pageTitle.innerText = "HALAMAN TIDAK DITEMUKAN";
            container.innerHTML = `<h3>404 Not Found</h3>`;
    }
};

// 3. Jalankan halaman dashboard secara otomatis saat website pertama kali dibuka
window.addEventListener('DOMContentLoaded', () => {
    // Karena kita tidak mengklik apapun saat reload, kita set dummy event agar tidak error
    window.loadPage('dashboard');
});
