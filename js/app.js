// PASTIKAN 3 BARIS IMPORT INI ADA DI PALING ATAS
import { renderPegawai } from './pegawai.js';
import { renderPegawaiMasuk } from './pegawai-masuk.js';
import { renderDashboard } from './dashboard.js'; 

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
            pageTitle.innerText = "DASHBOARD STATISTIK SDM";
            renderDashboard(container); // Sekarang fungsi ini sudah dikenali
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
