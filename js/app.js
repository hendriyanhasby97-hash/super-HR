import { renderDashboard } from './dashboard.js';
import { renderPegawai } from './pegawai.js';
// Impor file lain sesuai kebutuhan

window.loadPage = (page) => {
    const container = document.getElementById('app-content');
    container.innerHTML = ''; // Reset konten

    switch(page) {
        case 'dashboard': renderDashboard(container); break;
        case 'pegawai': renderPegawai(container); break;
        // Tambah case lain di sini
        default: container.innerHTML = '<h1>Halaman Tidak Ditemukan</h1>';
    }
};

// Load default halaman
window.loadPage('dashboard');
