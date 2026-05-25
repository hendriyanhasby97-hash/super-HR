import { renderDashboard } from './dashboard.js';
import { renderPegawai } from './pegawai.js';
import { renderPegawaiMasuk } from './pegawai-masuk.js';
import { renderPegawaiKeluar } from './pegawai-keluar.js';
import { renderSIK } from './sik.js';
import { renderSTR } from './str.js';

// --- SISTEM KONTROL ROUTING HALAMAN ---
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


// --- SISTEM OTENTIKASI & LOGIN LOGIN ADMIN ---
document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('login-admin-container');
    const mainLayout = document.getElementById('main-admin-layout');
    const formLoginAdmin = document.getElementById('formLoginAdmin');
    const loginError = document.getElementById('login_error');
    const btnAdminLogout = document.getElementById('btnAdminLogout');

    // Kredensial akun Admin (Anda bisa mengganti isi username & password di bawah ini)
    const ADMIN_USERNAME_VALID = "admin";
    const ADMIN_PASSWORD_VALID = "adminhrd123";

    // Fungsi menampilkan dashboard setelah sukses otentikasi
    function berikanAksesMasuk() {
        loginContainer.style.display = 'none';
        mainLayout.style.display = 'flex';
        window.loadPage('dashboard'); // Jalankan render halaman awal
    }

    // 1. Cek Session Terlebih Dahulu (Jika admin sudah login sebelumnya di tab ini)
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        berikanAksesMasuk();
    }

    // 2. Event Listener Submit Form Login
    formLoginAdmin.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const usernameInput = document.getElementById('admin_username').value.trim();
        const passwordInput = document.getElementById('admin_password').value;
        const btnSubmit = document.getElementById('btnSubmitAdminLogin');

        loginError.style.display = 'none';
        btnSubmit.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Memvalidasi...`;

        if (usernameInput === ADMIN_USERNAME_VALID && passwordInput === ADMIN_PASSWORD_VALID) {
            // Berhasil login
            sessionStorage.setItem('adminLoggedIn', 'true');
            berikanAksesMasuk();
        } else {
            // Gagal login
            loginError.style.display = 'block';
            btnSubmit.innerHTML = `Masuk Sistem <i class="fas fa-sign-in-alt"></i>`;
        }
    });

    // 3. Event Listener Tombol Logout Admin
    btnAdminLogout.addEventListener('click', () => {
        if (confirm("Apakah Anda yakin ingin keluar dari sistem Admin HRIS?")) {
            sessionStorage.removeItem('adminLoggedIn');
            location.reload(); // Refresh halaman untuk kembali mengunci layout
        }
    });
});
