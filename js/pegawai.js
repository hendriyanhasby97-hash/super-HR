import { supabase } from './koneksi.js';

export function renderPegawai(container) {
    container.innerHTML = `
        <style>
            .btn { padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer; color: white; font-weight: 600; }
            .btn-edit { background: #f59e0b; margin-right: 5px; }
            .btn-hapus { background: #ef4444; }
            
            table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; font-size: 0.9rem;}
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
            th { background: #f8fafc; }
            
            /* Modal Lebar untuk 30+ Kolom */
            .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); align-items: center; justify-content: center; z-index: 100;}
            .modal-content { background: white; padding: 20px; border-radius: 8px; width: 800px; max-height: 90vh; overflow-y: auto; }
            
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;}
            .form-group label { display: block; font-weight: 600; font-size: 0.85rem; color: #475569; margin-bottom: 4px;}
            .form-group input, .form-group select { width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; }
            
            fieldset { border: 1px solid #e2e8f0; padding: 15px; border-radius: 6px; margin-bottom: 15px; background: #fafafa;}
            legend { font-weight: bold; background: #3b82f6; color: white; padding: 4px 10px; border-radius: 4px; font-size: 0.9rem;}
        </style>

        <div style="background: white; padding: 20px; border-radius: 8px;">
            <div style="display:flex; justify-content:space-between; margin-bottom: 15px;">
                <h2>Master Data Pegawai</h2>
            </div>
            <table>
                <thead><tr><th>NIK/NIP</th><th>Nama</th><th>Jabatan</th><th>Ruangan</th><th>Status</th><th>Aksi</th></tr></thead>
                <tbody id="tabelMaster"><tr><td colspan="6">Memuat data...</td></tr></tbody>
            </table>
        </div>

        <!-- MODAL EDIT SUPER LENGKAP -->
        <div class="modal" id="modalEditPegawai">
            <div class="modal-content">
                <h3 style="margin-bottom: 15px; border-bottom: 1px solid #ccc; padding-bottom:10px;">Edit Data Lengkap Pegawai</h3>
                
                <form id="formEditPegawai">
                    <input type="hidden" name="id_pegawai" id="edit_id_pegawai">
                    
                    <fieldset>
                        <legend>Data Pribadi & Kontak</legend>
                        <div class="grid-2">
                            <div class="form-group"><label>NIK</label><input type="text" name="nik" id="edit_nik"></div>
                            <div class="form-group"><label>Nama</label><input type="text" name="nama" id="edit_nama"></div>
                            <div class="form-group"><label>Tempat Lahir</label><input type="text" name="tempat_lahir" id="edit_tempat_lahir"></div>
                            <div class="form-group"><label>Tanggal Lahir</label><input type="date" name="tanggal_lahir" id="edit_tanggal_lahir"></div>
                            <div class="form-group"><label>Jenis Kelamin</label>
                                <select name="jenis_kelamin" id="edit_jenis_kelamin">
                                    <option value="Laki-laki">Laki-laki</option><option value="Perempuan">Perempuan</option>
                                </select>
                            </div>
                            <div class="form-group"><label>Agama</label><input type="text" name="agama" id="edit_agama"></div>
                            <div class="form-group"><label>Status Keluarga</label><input type="text" name="status_keluarga" id="edit_status_keluarga"></div>
                            <div class="form-group"><label>No Telp</label><input type="text" name="no_telp" id="edit_no_telp"></div>
                            <div class="form-group"><label>Email</label><input type="email" name="email" id="edit_email"></div>
                            <div class="form-group"><label>Password (Sistem)</label><input type="text" name="password" id="edit_password"></div>
                            <div class="form-group" style="grid-column: span 2;"><label>Alamat</label><input type="text" name="alamat" id="edit_alamat"></div>
                        </div>
                    </fieldset>

                    <fieldset>
                        <legend>Data Kepegawaian & RS</legend>
                        <div class="grid-2">
                            <div class="form-group"><label>NIP</label><input type="text" name="nip" id="edit_nip"></div>
                            <div class="form-group"><label>Status Pegawai</label><input type="text" name="status" id="edit_status"></div>
                            <div class="form-group"><label>Kelompok Pegawai</label><input type="text" name="kelompok_pegawai" id="edit_kelompok_pegawai"></div>
                            <div class="form-group"><label>Kelompok Jabatan</label><input type="text" name="kelompok_jabatan" id="edit_kelompok_jabatan"></div>
                            <div class="form-group"><label>Golongan</label><input type="text" name="gol" id="edit_gol"></div>
                            <div class="form-group"><label>Jabatan</label><input type="text" name="jabatan" id="edit_jabatan"></div>
                            <div class="form-group"><label>Ruangan</label><input type="text" name="ruangan" id="edit_ruangan"></div>
                            <div class="form-group"><label>TMT Pangkat</label><input type="date" name="tmt_pangkat" id="edit_tmt_pangkat"></div>
                            <div class="form-group"><label>TMT Berikutnya</label><input type="date" name="tmt_berikutnya" id="edit_tmt_berikutnya"></div>
                            <div class="form-group"><label>TMT CPNS</label><input type="date" name="tmt_cpns" id="edit_tmt_cpns"></div>
                            <div class="form-group"><label>Masuk RS</label><input type="date" name="masuk_rs" id="edit_masuk_rs"></div>
                            <div class="form-group"><label>Masa Kerja RS</label><input type="text" name="masa_kerja_rs" id="edit_masa_kerja_rs"></div>
                            <div class="form-group"><label>Rentang BUP</label><input type="text" name="rentang_bup" id="edit_rentang_bup"></div>
                            <div class="form-group"><label>TMT Pensiun</label><input type="date" name="tmt_pensiun" id="edit_tmt_pensiun"></div>
                        </div>
                    </fieldset>

                    <fieldset>
                        <legend>Pendidikan & Identitas Negara</legend>
                        <div class="grid-2">
                            <div class="form-group"><label>Jenjang</label><input type="text" name="jenjang" id="edit_jenjang"></div>
                            <div class="form-group"><label>Fakultas</label><input type="text" name="fakultas" id="edit_fakultas"></div>
                            <div class="form-group"><label>Jurusan</label><input type="text" name="jurusan" id="edit_jurusan"></div>
                            <div class="form-group"><label>No BPJS Kesehatan</label><input type="text" name="no_bpjsn" id="edit_no_bpjsn"></div>
                            <div class="form-group"><label>No BPJS TK/Taspen</label><input type="text" name="no_bpjsket_taspen" id="edit_no_bpjsket_taspen"></div>
                            <div class="form-group"><label>NPWP</label><input type="text" name="npwp" id="edit_npwp"></div>
                        </div>
                    </fieldset>

                    <div style="text-align: right; margin-top: 15px;">
                        <button type="button" class="btn" style="background:#94a3b8;" id="btnTutupModal">Batal</button>
                        <button type="submit" class="btn" style="background:#3b82f6;" id="btnUpdateData">Update Data</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    initLogikaPegawai();
}

function initLogikaPegawai() {
    const tbody = document.getElementById('tabelMaster');
    const modal = document.getElementById('modalEditPegawai');
    const form = document.getElementById('formEditPegawai');

    // Simpan data asli secara lokal agar mudah di-load ke form tanpa fetch ulang
    let currentData = [];

    async function loadData() {
        const { data, error } = await supabase.from('pegawai').select('*');
        if (error) return tbody.innerHTML = `<tr><td colspan="6">Error: ${error.message}</td></tr>`;
        
        currentData = data; // Simpan ke variabel global modul
        
        tbody.innerHTML = data.map(row => `
            <tr>
                <td><strong>NIK:</strong> ${row.nik || '-'}<br><span style="color:#64748b; font-size:0.8rem;">NIP: ${row.nip || '-'}</span></td>
                <td>${row.nama || '-'}</td>
                <td>${row.jabatan || '-'}</td>
                <td>${row.ruangan || '-'}</td>
                <td>${row.status || '-'}</td>
                <td>
                    <button class="btn btn-edit" onclick="bukaEditPegawai('${row.id_pegawai}')"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn btn-hapus" onclick="hapusDataPegawai('${row.id_pegawai}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    }

    // Fungsi Hapus
    window.hapusDataPegawai = async (id) => {
        if(confirm('Yakin ingin menghapus data master pegawai ini?')) {
            await supabase.from('pegawai').delete().eq('id_pegawai', id);
            loadData();
        }
    };

    // Fungsi Buka Modal & Isi Form
    window.bukaEditPegawai = (id) => {
        const pegawai = currentData.find(p => p.id_pegawai == id);
        if(!pegawai) return;

        // Looping otomatis untuk mengisi semua input yang id-nya sesuai format "edit_namakolom"
        Object.keys(pegawai).forEach(key => {
            const inputElement = document.getElementById(`edit_${key}`);
            if(inputElement) {
                inputElement.value = pegawai[key] || '';
            }
        });

        modal.style.display = 'flex';
    };

    document.getElementById('btnTutupModal').onclick = () => modal.style.display = 'none';

    // Logika Submit Form Update
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btnUpdate = document.getElementById('btnUpdateData');
        btnUpdate.innerText = "Menyimpan...";

        // Ambil ID dan hapus dari object agar tidak ikut ter-update (Primary Key)
        const id_pegawai = document.getElementById('edit_id_pegawai').value;
        
        const formData = new FormData(form);
        const dataObj = Object.fromEntries(formData.entries());
        delete dataObj.id_pegawai; // Mencegah error update PK

        const { error } = await supabase
            .from('pegawai')
            .update(dataObj)
            .eq('id_pegawai', id_pegawai);

        if (error) {
            alert('Gagal update: ' + error.message);
        } else {
            modal.style.display = 'none';
            loadData();
        }
        btnUpdate.innerText = "Update Data";
    });

    loadData();
}
