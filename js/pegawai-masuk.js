import { supabase } from './koneksi.js';

export function renderPegawaiMasuk(container) {
    container.innerHTML = `
        <style>
            .form-box { background: white; padding: 25px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 20px; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
            .form-group { margin-bottom: 15px; }
            .form-group label { display: block; font-weight: 600; margin-bottom: 5px; font-size: 0.9rem;}
            .form-group input, .form-group select { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; }
            .btn-submit { padding: 12px 20px; background: #3b82f6; color: white; border: none; border-radius: 4px; font-weight: 600; cursor: pointer; }
            .table-container { background: white; padding: 20px; border-radius: 8px; overflow-x: auto; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
            th { background: #f8fafc; }
        </style>

        <div class="form-box">
            <h2 style="margin-bottom: 20px;"><i class="fas fa-user-plus"></i> Form Pegawai Masuk</h2>
            <form id="formMasuk">
                <div class="grid-2">
                    <div class="form-group"><label>NIK</label><input type="text" name="nik" required></div>
                    <div class="form-group"><label>Nama Lengkap</label><input type="text" name="nama" required></div>
                    <div class="form-group">
                        <label>Jenis Kelamin</label>
                        <select name="jenis_kelamin">
                            <option value="Laki-laki">Laki-laki</option>
                            <option value="Perempuan">Perempuan</option>
                        </select>
                    </div>
                    <div class="form-group"><label>Agama</label><input type="text" name="agama"></div>
                    <div class="form-group"><label>Bagian</label><input type="text" name="bagian" required></div>
                    <div class="form-group"><label>Pendidikan</label><input type="text" name="pendidikan"></div>
                    <div class="form-group"><label>TMT Masuk</label><input type="date" name="tmt_masuk" required></div>
                </div>
                <button type="submit" class="btn-submit" id="btnSimpanMasuk">Simpan Data Masuk</button>
            </form>
        </div>

        <div class="table-container">
            <h3>Histori Pegawai Masuk</h3>
            <br>
            <table>
                <thead><tr><th>NIK</th><th>Nama</th><th>Bagian</th><th>TMT Masuk</th></tr></thead>
                <tbody id="tabelMasuk"><tr><td colspan="4">Memuat data...</td></tr></tbody>
            </table>
        </div>
    `;

    initLogikaMasuk();
}

function initLogikaMasuk() {
    const form = document.getElementById('formMasuk');
    const tbody = document.getElementById('tabelMasuk');

    async function loadData() {
        const { data, error } = await supabase.from('pegawai_masuk').select('*').order('tmt_masuk', { ascending: false });
        if (error) return tbody.innerHTML = `<tr><td colspan="4">Error: ${error.message}</td></tr>`;
        
        tbody.innerHTML = data.map(row => `
            <tr>
                <td>${row.nik}</td>
                <td>${row.nama}</td>
                <td>${row.bagian}</td>
                <td>${row.tmt_masuk}</td>
            </tr>
        `).join('');
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btnSimpanMasuk');
        btn.innerText = "Menyimpan...";

        // Ambil semua data form otomatis berdasarkan atribut 'name'
        const formData = new FormData(form);
        const dataObj = Object.fromEntries(formData.entries());

        const { error } = await supabase.from('pegawai_masuk').insert([dataObj]);

        if (error) {
            alert('Error: ' + error.message);
        } else {
            form.reset();
            loadData();
        }
        btn.innerText = "Simpan Data Masuk";
    });

    loadData();
}
