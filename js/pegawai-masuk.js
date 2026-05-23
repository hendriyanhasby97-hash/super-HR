import { supabase } from './koneksi.js';

export function renderPegawaiMasuk(container) {
    // 1. Render UI: Formulir Pendaftaran & Status
    container.innerHTML = `
        <style>
            .form-container { background: white; padding: 25px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); max-width: 600px; margin-bottom: 20px; }
            .form-group { margin-bottom: 15px; }
            .form-group label { display: block; margin-bottom: 5px; font-weight: 600; font-size: 0.9rem; color: #475569; }
            .form-group input { width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; transition: 0.2s; }
            .form-group input:focus { border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
            
            .btn-submit { background: var(--primary-color); color: white; border: none; padding: 12px 20px; border-radius: 6px; cursor: pointer; font-weight: 600; width: 100%; margin-top: 10px; font-size: 1rem; }
            .btn-submit:hover { background: #2563eb; }
            
            .alert { padding: 12px; border-radius: 6px; margin-top: 15px; display: none; font-weight: 500; }
            .alert-success { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
            .alert-error { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
        </style>

        <div class="form-container">
            <h2 style="margin-bottom: 20px; color: #1e293b;"><i class="fas fa-user-plus"></i> Form Registrasi Pegawai Baru</h2>
            
            <form id="formPegawaiBaru">
                <div class="form-group">
                    <label>Nama Lengkap</label>
                    <input type="text" id="pmNama" placeholder="Masukkan nama lengkap" required autocomplete="off">
                </div>
                <div class="form-group">
                    <label>Jabatan / Posisi</label>
                    <input type="text" id="pmJabatan" placeholder="Contoh: Staff IT, Marketing" required autocomplete="off">
                </div>
                <div class="form-group">
                    <label>Tanggal Masuk / Bergabung</label>
                    <!-- Default otomatis diisi hari ini oleh JS -->
                    <input type="date" id="pmTanggal" required>
                </div>
                
                <button type="submit" class="btn-submit" id="btnSubmitPM">Daftarkan Pegawai</button>
            </form>

            <div id="alertMessage" class="alert"></div>
        </div>
    `;

    // 2. Inisialisasi Logika Form
    initPegawaiMasukLogic();
}

function initPegawaiMasukLogic() {
    const form = document.getElementById('formPegawaiBaru');
    const inputNama = document.getElementById('pmNama');
    const inputJabatan = document.getElementById('pmJabatan');
    const inputTanggal = document.getElementById('pmTanggal');
    const btnSubmit = document.getElementById('btnSubmitPM');
    const alertMessage = document.getElementById('alertMessage');

    // Set default tanggal hari ini
    const hariIni = new Date().toISOString().split('T')[0];
    inputTanggal.value = hariIni;

    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Mencegah halaman refresh
        
        const nama = inputNama.value.trim();
        const jabatan = inputJabatan.value.trim();
        const tanggal_masuk = inputTanggal.value;

        // Tampilan loading
        btnSubmit.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Menyimpan...`;
        btnSubmit.disabled = true;
        alertMessage.style.display = 'none';

        // Proses simpan ke Supabase
        const { error } = await supabase
            .from('pegawai')
            .insert([{ nama, jabatan, tanggal_masuk }]);

        if (error) {
            showAlert(`Gagal menyimpan data: ${error.message}`, 'error');
        } else {
            showAlert(`Berhasil! ${nama} telah didaftarkan sebagai pegawai.`, 'success');
            // Reset form
            inputNama.value = '';
            inputJabatan.value = '';
            inputTanggal.value = hariIni;
            inputNama.focus(); // Kembalikan kursor ke input nama
        }

        // Kembalikan tombol ke semula
        btnSubmit.innerHTML = `Daftarkan Pegawai`;
        btnSubmit.disabled = false;
    });

    function showAlert(text, type) {
        alertMessage.innerText = text;
        alertMessage.className = `alert alert-${type}`;
        alertMessage.style.display = 'block';
        
        // Sembunyikan alert otomatis setelah 4 detik
        setTimeout(() => {
            alertMessage.style.display = 'none';
        }, 4000);
    }
}
