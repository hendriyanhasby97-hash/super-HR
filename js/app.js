import { renderPegawai } from './pegawai.js';
import { renderPegawaiMasuk } from './pegawai-masuk.js';

window.loadPage = (page, element = null) => {
    const container = document.getElementById('app-content');
    const pageTitle = document.getElementById('page-title');
    
    // Atur status aktif pada menu sidebar
    if (element) {
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        element.classList.add('active');
    }

    // Routing Halaman
    switch (page) {
        case 'dashboard':
            pageTitle.innerText = "DASHBOARD";
            container.innerHTML = `
                <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <h2>Selamat Datang di Sistem HRIS/SIMRS</h2>
                    <p style="color: #64748b; margin-top:10px;">Gunakan menu navigasi di samping untuk mengelola Master Data Pegawai dan Data Pegawai Masuk.</p>
                </div>`;
            break;

        case 'pegawai':
            pageTitle.innerText = "MASTER DATA PEGAWAI";
            renderPegawai(container); 
            break;

        case 'pegawai-masuk':
            pageTitle.innerText = "DATA PEGAWAI MASUK";
            renderPegawaiMasuk(container);
            break;

        default:
            pageTitle.innerText = "ERROR 404";
            container.innerHTML = `
                <div style="background: white; padding: 20px; border-radius: 8px;">
                    <h3>Halaman tidak ditemukan</h3>
                </div>`;
    }
};

// Jalankan dashboard otomatis saat web pertama dibuka
window.addEventListener('DOMContentLoaded', () => {
    window.loadPage('dashboard');
});
