import { renderPegawai } from './pegawai.js';
import { renderPegawaiBaru } from './pegawai-baru.js';

window.loadPage = (page, element = null) => {
    const container = document.getElementById('app-content');
    const pageTitle = document.getElementById('page-title');
    
    // Atur status aktif pada menu
    if (element) {
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        element.classList.add('active');
    }

    // Routing
    switch (page) {
        case 'dashboard':
            pageTitle.innerText = "DASHBOARD";
            container.innerHTML = `
                <div style="background: white; padding: 20px; border-radius: 8px;">
                    <h2>Selamat Datang</h2>
                    <p style="color: #64748b;">Pilih menu di samping untuk mulai mengelola data.</p>
                </div>`;
            break;

        case 'pegawai':
            pageTitle.innerText = "DATA UTAMA PEGAWAI";
            renderPegawai(container); 
            break;

        case 'pegawai-baru':
            pageTitle.innerText = "REGISTRASI PEGAWAI BARU";
            renderPegawaiBaru(container);
            break;

        default:
            pageTitle.innerText = "ERROR 404";
            container.innerHTML = `<h3>Halaman tidak ditemukan</h3>`;
    }
};

window.addEventListener('DOMContentLoaded', () => {
    window.loadPage('dashboard');
});
