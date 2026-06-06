import { supabase } from './koneksi.js';
import { renderDashboard } from './dashboard.js';
import { renderPegawai } from './pegawai.js';
import { renderPegawaiMasuk } from './pegawai-masuk.js';
import { renderPegawaiKeluar } from './pegawai-keluar.js';
import { renderSIK } from './sik.js';
import { renderSTR } from './str.js';
import { renderSertifikat } from './sertifikat.js';
import { renderSKP } from './skp.js';

// IMPORT FILE PENGATURAN BARU
import { renderPengaturan } from './pengaturan.js';

window.loadPage = (page, element = null) => {
    const container = document.getElementById('app-content');
    const pageTitle = document.getElementById('page-title');
    
    // AMBIL ROLE DARI SESSION STORAGE
    const currentRole = sessionStorage.getItem('hris_role');
    
    if (element) {
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.submenu-item').forEach(el => el.classList.remove('active'));
        element.classList.add('active');
    }

    switch (page) {
        case 'dashboard': 
            pageTitle.innerText = "DASHBOARD STATISTIK SDM"; 
            renderDashboard(container); 
            break;
        case 'pegawai': 
            pageTitle.innerText = "MASTER DATA PEGAWAI"; 
            renderPegawai(container, currentRole); 
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
        case 'sertifikat': 
            pageTitle.innerText = "SERTIFIKAT PEGAWAI"; 
            renderSertifikat(container, currentRole);
            break;
        case 'skp': 
            pageTitle.innerText = "SASARAN KINERJA PEGAWAI (SKP)"; 
            renderSKP(container, currentRole);
            break;
            
        // --- ROUTE UNTUK MENU PENGATURAN ---
        case 'pengaturan-golongan': 
            pageTitle.innerText = "PENGATURAN MASTER GOLONGAN"; 
            renderPengaturan(container, 'golongan');
            break;
        case 'pengaturan-jabatan': 
            pageTitle.innerText = "PENGATURAN MASTER JABATAN"; 
            renderPengaturan(container, 'jabatan');
            break;
        case 'pengaturan-ruangan': 
            pageTitle.innerText = "PENGATURAN MASTER RUANGAN"; 
            renderPengaturan(container, 'ruangan');
            break;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('login-admin-container');
    const mainLayout = document.getElementById('main-admin-layout');
    const formLoginUtama = document.getElementById('formLoginUtama');
    const loginError = document.getElementById('login_error');
    const roleBadge = document.getElementById('role-badge');

    const SUPERADMIN_USER = "superadmin";
    const SUPERADMIN_PASS = "superadmin123";

    const ADMIN_USER = "admin";
    const ADMIN_PASS = "admin123";

    function setupLayoutAkses() {
        loginContainer.style.display = 'none';
        
        const currentRole = sessionStorage.getItem('hris_role');
        
        if (currentRole === 'superadmin') {
            document.body.classList.remove('view-only-mode');
            roleBadge.innerHTML = '<i class="fas fa-crown" style="color: #f59e0b;"></i> Superadmin (Full Akses)';
            mainLayout.style.display = 'flex';
            window.loadPage('dashboard');
        } 
        else if (currentRole === 'admin') {
            document.body.classList.add('view-only-mode'); 
            roleBadge.innerHTML = '<i class="fas fa-eye" style="color: #10b981;"></i> Admin (View Only)';
            mainLayout.style.display = 'flex';
            window.loadPage('dashboard');
        } 
        else if (currentRole === 'user') {
            window.location.href = 'portal.html';
        }
    }

    if (sessionStorage.getItem('hris_role')) {
        setupLayoutAkses();
    }

    formLoginUtama.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const userInput = document.getElementById('input_username').value.trim();
        const passInput = document.getElementById('input_password').value;
        const btnSubmit = document.getElementById('btnSubmitLogin');

        loginError.style.display = 'none';
        btnSubmit.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Memvalidasi...`;

        if (userInput === SUPERADMIN_USER && passInput === SUPERADMIN_PASS) {
            sessionStorage.setItem('hris_role', 'superadmin');
            setupLayoutAkses();
        } 
        else if (userInput === ADMIN_USER && passInput === ADMIN_PASS) {
            sessionStorage.setItem('hris_role', 'admin');
            setupLayoutAkses();
        } 
        else {
            const { data, error } = await supabase
                .from('pegawai')
                .select('*')
                .eq('nik', userInput)
                .eq('password', passInput)
                .maybeSingle();

            if (data) {
                sessionStorage.setItem('hris_role', 'user');
                sessionStorage.setItem('nik_user', data.nik); 
                window.location.href = 'portal.html';
            } else {
                loginError.style.display = 'block';
                btnSubmit.innerHTML = `Masuk Sistem <i class="fas fa-sign-in-alt"></i>`;
            }
        }
    });

    document.getElementById('btnAdminLogout').addEventListener('click', () => {
        if (confirm("Keluar dari Dashboard HRIS?")) {
            sessionStorage.clear();
            location.reload(); 
        }
    });
});
