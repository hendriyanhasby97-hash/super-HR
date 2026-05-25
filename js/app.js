import { renderDashboard } from './dashboard.js';
import { renderPegawai } from './pegawai.js';
import { renderPegawaiMasuk } from './pegawai-masuk.js';
import { renderPegawaiKeluar } from './pegawai-keluar.js';
import { renderSIK } from './sik.js'; // Import SIK
import { renderSTR } from './str.js'; // Import STR

window.loadPage = (page, element = null) => {
    const container = document.getElementById('app-content');
    const pageTitle = document.getElementById('page-title');
    
    if (element) {
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        element.classList.add('active');
    }

    switch (page) {
        case 'dashboard':
            pageTitle.innerText = "DASHBOARD STATISTIK SDM";
            renderDashboard(container); 
            break;

        case 'pegawai':
            pageTitle.innerText = "MASTER DATA PEGAWAI";
            renderPegawai(container); 
            break;

        case 'pegawai-masuk':
            pageTitle.innerText = "DATA PEGAWAI MASUK (BARU)";
            renderPegawaiMasuk(container);
            break;

        case 'pegawai-keluar':
            pageTitle.innerText = "DATA PEGAWAI KELUAR / MUTASI";
            renderPegawaiKeluar(container);
            break;

        case 'sik':
            pageTitle.innerText = "SURAT IZIN KERJA (SIK / SIP)";
            renderSIK(container);
            break;

        case 'str':
            pageTitle.innerText = "SURAT TANDA REGISTRASI (STR)";
            renderSTR(container);
            break;

        default:
            pageTitle.innerText = "ERROR 404";
            container.innerHTML = `<div style="background: white; padding: 20px; border-radius: 8px;"><h3>Halaman tidak ditemukan</h3></div>`;
    }
};

window.addEventListener('DOMContentLoaded', () => {
    window.loadPage('dashboard');
});
