import { supabase } from './koneksi.js';

export function renderPegawai(container) {
    container.innerHTML = `
        <style>
            .btn { padding: 8px 12px; border: none; border-radius: 4px; cursor: pointer; color: white; font-weight: 600; }
            .btn-edit { background: #f59e0b; margin-right: 5px; }
            .btn-hapus { background: #ef4444; }
            .btn-simpan { background: #3b82f6; }
            .btn-batal { background: #94a3b8; }
            
            table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; }
            th, td { padding: 15px; text-align: left; border-bottom: 1px solid #e2e8f0; }
            th { background: #f8fafc; }
            
            .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); align-items: center; justify-content: center; }
            .modal-content { background: white; padding: 25px; border-radius: 8px; width: 400px; }
            .form-group { margin-bottom: 15px; }
            .form-group input { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; }
        </style>

        <table>
            <thead><tr><th>Nama</th><th>Jabatan</th><th>Tgl Masuk</th><th>Aksi</th></tr></thead>
            <tbody id="tabelPegawai"><tr><td colspan="4">Memuat data...</td></tr></tbody>
        </table>

        <div class="modal" id="modalEdit">
            <div class="modal-content">
                <h3>Edit Pegawai</h3>
                <input type="hidden" id="editId">
                <div class="form-group"><label>Nama</label><input type="text" id="editNama"></div>
                <div class="form-group"><label>Jabatan</label><input type="text" id="editJabatan"></div>
                <div class="form-group"><label>Tgl Masuk</label><input type="date" id="editTanggal"></div>
                <div style="text-align: right; margin-top: 15px;">
                    <button class="btn btn-batal" id="btnBatal">Batal</button>
                    <button class="btn btn-simpan" id="btnSimpan">Update</button>
                </div>
            </div>
        </div>
    `;

    initLogikaPegawai();
}

function initLogikaPegawai() {
    const tbody = document.getElementById('tabelPegawai');
    const modal = document.getElementById('modalEdit');
    
    async function loadData() {
        const { data, error } = await supabase.from('pegawai').select('*').order('created_at', { ascending: false });
        if (error) return tbody.innerHTML = `<tr><td colspan="4">Error: ${error.message}</td></tr>`;
        
        tbody.innerHTML = data.map(row => `
            <tr>
                <td>${row.nama}</td><td>${row.jabatan}</td><td>${row.tanggal_masuk}</td>
                <td>
                    <button class="btn btn-edit" onclick="bukaEdit('${row.id}', '${row.nama}', '${row.jabatan}', '${row.tanggal_masuk}')">Edit</button>
                    <button class="btn btn-hapus" onclick="hapusData('${row.id}')">Hapus</button>
                </td>
            </tr>
        `).join('');
    }

    window.hapusData = async (id) => {
        if(confirm('Hapus pegawai ini?')) {
            await supabase.from('pegawai').delete().eq('id', id);
            loadData();
        }
    };

    window.bukaEdit = (id, nama, jabatan, tgl) => {
        document.getElementById('editId').value = id;
        document.getElementById('editNama').value = nama;
        document.getElementById('editJabatan').value = jabatan;
        document.getElementById('editTanggal').value = tgl;
        modal.style.display = 'flex';
    };

    document.getElementById('btnBatal').onclick = () => modal.style.display = 'none';
    
    document.getElementById('btnSimpan').onclick = async () => {
        const id = document.getElementById('editId').value;
        await supabase.from('pegawai').update({
            nama: document.getElementById('editNama').value,
            jabatan: document.getElementById('editJabatan').value,
            tanggal_masuk: document.getElementById('editTanggal').value
        }).eq('id', id);
        modal.style.display = 'none';
        loadData();
    };

    loadData();
}
