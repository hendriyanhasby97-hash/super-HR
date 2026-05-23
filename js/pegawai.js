import { supabase } from './koneksi.js';

export function renderPegawai(container) {
    // 1. Render UI (Tabel & Modal Form) beserta CSS khusus untuk halaman ini
    container.innerHTML = `
        <style>
            .header-action { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
            .btn-tambah { background: var(--primary-color); color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; font-weight: 600; display: flex; gap: 8px; align-items: center; }
            .btn-tambah:hover { background: #2563eb; }
            
            .data-table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .data-table th, .data-table td { padding: 15px; text-align: left; border-bottom: 1px solid #e2e8f0; }
            .data-table th { background: #f8fafc; font-weight: 600; color: #475569; }
            
            .btn-edit { background: #f59e0b; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; margin-right: 5px; }
            .btn-hapus { background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; }
            
            /* Modal Styles */
            .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); align-items: center; justify-content: center; z-index: 100; }
            .modal-content { background: white; padding: 25px; border-radius: 8px; width: 400px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .form-group { margin-bottom: 15px; }
            .form-group label { display: block; margin-bottom: 5px; font-weight: 600; font-size: 0.9rem; }
            .form-group input { width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 4px; outline: none; }
            .form-group input:focus { border-color: var(--primary-color); }
            .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
            .btn-batal { background: #e2e8f0; color: #475569; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-weight: 600; }
            .btn-simpan { background: var(--primary-color); color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-weight: 600; }
        </style>

        <div class="header-action">
            <h2>Data Utama Pegawai</h2>
            <button class="btn-tambah" id="btnTambah"><i class="fas fa-plus"></i> Tambah Data</button>
        </div>

        <table class="data-table">
            <thead>
                <tr>
                    <th>Nama</th>
                    <th>Jabatan</th>
                    <th>Tanggal Masuk</th>
                    <th>Masa Kerja</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody id="tableBody">
                <tr><td colspan="5" style="text-align:center;">Memuat data...</td></tr>
            </tbody>
        </table>

        <!-- Modal Form CRUD -->
        <div class="modal" id="modalForm">
            <div class="modal-content">
                <h3 id="modalTitle" style="margin-bottom: 15px;">Tambah Pegawai</h3>
                <input type="hidden" id="inputId"> <!-- Hidden input untuk nyimpan ID saat Edit -->
                
                <div class="form-group">
                    <label>Nama Pegawai</label>
                    <input type="text" id="inputNama" required autocomplete="off">
                </div>
                <div class="form-group">
                    <label>Jabatan</label>
                    <input type="text" id="inputJabatan" required autocomplete="off">
                </div>
                <div class="form-group">
                    <label>Tanggal Masuk</label>
                    <input type="date" id="inputTanggalMasuk" required>
                </div>
                
                <div class="modal-actions">
                    <button class="btn-batal" id="btnBatal">Batal</button>
                    <button class="btn-simpan" id="btnSimpan">Simpan</button>
                </div>
            </div>
        </div>
    `;

    // 2. Jalankan Fungsi Logika
    initCRUDLogic();
}

function initCRUDLogic() {
    const modal = document.getElementById('modalForm');
    const btnTambah = document.getElementById('btnTambah');
    const btnBatal = document.getElementById('btnBatal');
    const btnSimpan = document.getElementById('btnSimpan');
    const tableBody = document.getElementById('tableBody');

    // Load Data Pertama Kali
    fetchPegawai();

    // Event Listeners Modal
    btnTambah.addEventListener('click', () => bukaModal('tambah'));
    btnBatal.addEventListener('click', tutupModal);
    btnSimpan.addEventListener('click', simpanData);

    // Event Listener untuk Tombol Edit & Hapus di dalam Tabel (Event Delegation)
    tableBody.addEventListener('click', (e) => {
        if (e.target.closest('.btn-hapus')) {
            const id = e.target.closest('.btn-hapus').dataset.id;
            hapusData(id);
        }
        if (e.target.closest('.btn-edit')) {
            const btn = e.target.closest('.btn-edit');
            bukaModal('edit', {
                id: btn.dataset.id,
                nama: btn.dataset.nama,
                jabatan: btn.dataset.jabatan,
                tanggal_masuk: btn.dataset.tanggal
            });
        }
    });

    // --- FUNGSI DATABASE (SUPABASE) ---

    async function fetchPegawai() {
        const { data, error } = await supabase
            .from('pegawai') // Nama tabel harus 'pegawai'
            .select('*')
            .order('created_at', { ascending: false }); // Urutkan data terbaru di atas

        if (error) {
            tableBody.innerHTML = `<tr><td colspan="5" style="color:red;">Gagal memuat: ${error.message}</td></tr>`;
            return;
        }

        renderTabel(data);
    }

    async function simpanData() {
        const id = document.getElementById('inputId').value;
        const nama = document.getElementById('inputNama').value;
        const jabatan = document.getElementById('inputJabatan').value;
        const tanggal_masuk = document.getElementById('inputTanggalMasuk').value;

        if (!nama || !jabatan || !tanggal_masuk) {
            alert("Harap isi semua kolom!");
            return;
        }

        btnSimpan.innerText = "Menyimpan...";

        if (id) {
            // Logika UPDATE
            const { error } = await supabase
                .from('pegawai')
                .update({ nama, jabatan, tanggal_masuk })
                .eq('id', id);
            
            if (error) alert("Gagal update: " + error.message);
        } else {
            // Logika INSERT
            const { error } = await supabase
                .from('pegawai')
                .insert([{ nama, jabatan, tanggal_masuk }]);
            
            if (error) alert("Gagal simpan: " + error.message);
        }

        btnSimpan.innerText = "Simpan";
        tutupModal();
        fetchPegawai(); // Refresh tabel setelah simpan
    }

    async function hapusData(id) {
        if (confirm("Apakah Anda yakin ingin menghapus pegawai ini?")) {
            const { error } = await supabase
                .from('pegawai')
                .delete()
                .eq('id', id);

            if (error) {
                alert("Gagal menghapus: " + error.message);
            } else {
                fetchPegawai(); // Refresh tabel setelah hapus
            }
        }
    }

    // --- FUNGSI UTILITY & UI ---

    function renderTabel(data) {
        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Belum ada data pegawai.</td></tr>`;
            return;
        }

        tableBody.innerHTML = '';
        data.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.nama}</td>
                <td>${row.jabatan}</td>
                <td>${formatTanggal(row.tanggal_masuk)}</td>
                <td><strong>${hitungMasaKerja(row.tanggal_masuk)}</strong></td>
                <td>
                    <button class="btn-edit" 
                        data-id="${row.id}" 
                        data-nama="${row.nama}" 
                        data-jabatan="${row.jabatan}" 
                        data-tanggal="${row.tanggal_masuk}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-hapus" data-id="${row.id}">
                        <i class="fas fa-trash"></i> Hapus
                    </button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    function bukaModal(mode, data = null) {
        const modal = document.getElementById('modalForm');
        const title = document.getElementById('modalTitle');
        
        if (mode === 'tambah') {
            title.innerText = 'Tambah Pegawai Baru';
            document.getElementById('inputId').value = '';
            document.getElementById('inputNama').value = '';
            document.getElementById('inputJabatan').value = '';
            document.getElementById('inputTanggalMasuk').value = '';
        } else if (mode === 'edit') {
            title.innerText = 'Edit Data Pegawai';
            document.getElementById('inputId').value = data.id;
            document.getElementById('inputNama').value = data.nama;
            document.getElementById('inputJabatan').value = data.jabatan;
            document.getElementById('inputTanggalMasuk').value = data.tanggal_masuk;
        }
        
        modal.style.display = 'flex';
    }

    function tutupModal() {
        document.getElementById('modalForm').style.display = 'none';
    }

    function hitungMasaKerja(tanggalMasuk) {
        if (!tanggalMasuk) return '-';
        const masuk = new Date(tanggalMasuk);
        const sekarang = new Date();
        
        let tahun = sekarang.getFullYear() - masuk.getFullYear();
        let bulan = sekarang.getMonth() - masuk.getMonth();
        
        if (bulan < 0) {
            tahun--;
            bulan += 12;
        }
        
        if (tahun === 0 && bulan === 0) return "Baru masuk";
        return `${tahun} Thn, ${bulan} Bln`;
    }

    function formatTanggal(tanggal) {
        if (!tanggal) return '-';
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return new Date(tanggal).toLocaleDateString('id-ID', options);
    }
}
