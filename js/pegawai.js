import { supabase } from './koneksi.js';

export function renderPegawai(container) {
    container.innerHTML = `
        <style>
            .btn { padding: 8px 15px; border: none; border-radius: 4px; cursor: pointer; color: white; font-weight: 600; display: inline-flex; align-items: center; gap: 5px; }
            .btn-edit { background: #f59e0b; padding: 6px 10px; font-size: 0.85rem;}
            .btn-hapus { background: #ef4444; padding: 6px 10px; font-size: 0.85rem;}
            .btn-detail { background: #0ea5e9; padding: 6px 10px; font-size: 0.85rem; margin-right: 5px;}
            .btn-tambah { background: #10b981; }
            
            table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; font-size: 0.9rem;}
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
            th { background: #f8fafc; }
            
            .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .filter-group { display: flex; gap: 10px; flex: 1; }
            .filter-group input, .filter-group select { padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 4px; outline: none; }
            .filter-group input { width: 250px; }
            
            /* Modal Styles */
            .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); align-items: center; justify-content: center; z-index: 100;}
            .modal-content { background: white; padding: 25px; border-radius: 8px; width: 800px; max-height: 90vh; overflow-y: auto; }
            
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;}
            .form-group label { display: block; font-weight: 600; font-size: 0.85rem; color: #475569; margin-bottom: 4px;}
            .form-group input, .form-group select { width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; }
            fieldset { border: 1px solid #e2e8f0; padding: 15px; border-radius: 6px; margin-bottom: 15px; background: #fafafa;}
            legend { font-weight: bold; background: #3b82f6; color: white; padding: 4px 10px; border-radius: 4px; font-size: 0.9rem;}

            /* Style Khusus Modal Detail */
            .detail-item { border-bottom: 1px dashed #e2e8f0; padding: 8px 0; display: flex; flex-direction: column;}
            .detail-label { font-size: 0.75rem; color: #64748b; font-weight: 600; text-transform: uppercase;}
            .detail-value { font-size: 0.95rem; color: #1e293b; font-weight: 500; margin-top: 3px;}
        </style>

        <div class="toolbar">
            <div class="filter-group">
                <input type="text" id="inputCari" placeholder="🔍 Cari NIK atau Nama...">
                <select id="filterStatus">
                    <option value="">Semua Status Pegawai</option>
                </select>
            </div>
            <button class="btn btn-tambah" id="btnTambahBaru"><i class="fas fa-plus"></i> Tambah Pegawai</button>
        </div>

        <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <table>
                <thead><tr><th>NIK/NIP</th><th>Nama</th><th>Jabatan</th><th>Ruangan</th><th>Status</th><th>Aksi</th></tr></thead>
                <tbody id="tabelMaster"><tr><td colspan="6" style="text-align:center;">Memuat data...</td></tr></tbody>
            </table>
        </div>

        <div class="modal" id="modalFormPegawai">
            <div class="modal-content">
                <h3 id="modalTitle" style="margin-bottom: 15px; border-bottom: 1px solid #ccc; padding-bottom:10px;">Form Pegawai</h3>
                
                <form id="formPegawai">
                    <input type="hidden" name="id_pegawai" id="form_id_pegawai">
                    
                    <fieldset><legend>Data Pribadi & Kontak</legend>
                        <div class="grid-2">
                            <div class="form-group"><label>NIK</label><input type="text" name="nik" id="form_nik" required></div>
                            <div class="form-group"><label>Nama</label><input type="text" name="nama" id="form_nama" required></div>
                            <div class="form-group"><label>Tempat Lahir</label><input type="text" name="tempat_lahir" id="form_tempat_lahir"></div>
                            <div class="form-group"><label>Tanggal Lahir</label><input type="date" name="tanggal_lahir" id="form_tanggal_lahir"></div>
                            <div class="form-group"><label>Jenis Kelamin</label>
                                <select name="jenis_kelamin" id="form_jenis_kelamin">
                                    <option value="Laki-laki">Laki-laki</option><option value="Perempuan">Perempuan</option>
                                </select>
                            </div>
                            <div class="form-group"><label>Agama</label><input type="text" name="agama" id="form_agama"></div>
                            <div class="form-group"><label>Status Keluarga</label><input type="text" name="status_keluarga" id="form_status_keluarga"></div>
                            <div class="form-group"><label>No Telp</label><input type="text" name="no_telp" id="form_no_telp"></div>
                            <div class="form-group"><label>Email</label><input type="email" name="email" id="form_email"></div>
                            <div class="form-group"><label>Password (Sistem)</label><input type="text" name="password" id="form_password"></div>
                            <div class="form-group" style="grid-column: span 2;"><label>Alamat</label><input type="text" name="alamat" id="form_alamat"></div>
                        </div>
                    </fieldset>

                    <fieldset><legend>Data Kepegawaian & RS</legend>
                        <div class="grid-2">
                            <div class="form-group"><label>NIP</label><input type="text" name="nip" id="form_nip"></div>
                            <div class="form-group"><label>Status Pegawai</label><input type="text" name="status" id="form_status"></div>
                            <div class="form-group"><label>Kelompok Pegawai</label><input type="text" name="kelompok_pegawai" id="form_kelompok_pegawai"></div>
                            <div class="form-group"><label>Kelompok Jabatan</label><input type="text" name="kelompok_jabatan" id="form_kelompok_jabatan"></div>
                            <div class="form-group"><label>Golongan</label><input type="text" name="gol" id="form_gol"></div>
                            <div class="form-group"><label>Jabatan</label><input type="text" name="jabatan" id="form_jabatan"></div>
                            <div class="form-group"><label>Ruangan</label><input type="text" name="ruangan" id="form_ruangan"></div>
                            <div class="form-group"><label>TMT Pangkat</label><input type="date" name="tmt_pangkat" id="form_tmt_pangkat"></div>
                            <div class="form-group"><label>TMT Berikutnya</label><input type="date" name="tmt_berikutnya" id="form_tmt_berikutnya"></div>
                            <div class="form-group"><label>TMT CPNS</label><input type="date" name="tmt_cpns" id="form_tmt_cpns"></div>
                            <div class="form-group"><label>Masuk RS</label><input type="date" name="masuk_rs" id="form_masuk_rs"></div>
                            <div class="form-group"><label>Masa Kerja RS</label><input type="text" name="masa_kerja_rs" id="form_masa_kerja_rs"></div>
                            <div class="form-group"><label>Rentang BUP</label><input type="text" name="rentang_bup" id="form_rentang_bup"></div>
                            <div class="form-group"><label>TMT Pensiun</label><input type="date" name="tmt_pensiun" id="form_tmt_pensiun"></div>
                        </div>
                    </fieldset>

                    <fieldset><legend>Pendidikan & Identitas Negara</legend>
                        <div class="grid-2">
                            <div class="form-group"><label>Jenjang</label><input type="text" name="jenjang" id="form_jenjang"></div>
                            <div class="form-group"><label>Fakultas</label><input type="text" name="fakultas" id="form_fakultas"></div>
                            <div class="form-group"><label>Jurusan</label><input type="text" name="jurusan" id="form_jurusan"></div>
                            <div class="form-group"><label>No BPJS Kesehatan</label><input type="text" name="no_bpjsn" id="form_no_bpjsn"></div>
                            <div class="form-group"><label>No BPJS TK/Taspen</label><input type="text" name="no_bpjsket_taspen" id="form_no_bpjsket_taspen"></div>
                            <div class="form-group"><label>NPWP</label><input type="text" name="npwp" id="form_npwp"></div>
                        </div>
                    </fieldset>

                    <div style="text-align: right; margin-top: 15px;">
                        <button type="button" class="btn" style="background:#94a3b8;" id="btnTutupModal">Batal</button>
                        <button type="submit" class="btn" style="background:#3b82f6;" id="btnSimpanData"><i class="fas fa-save"></i> Simpan Data</button>
                    </div>
                </form>
            </div>
        </div>

        <div class="modal" id="modalDetailPegawai">
            <div class="modal-content">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid #ccc; padding-bottom:10px; margin-bottom: 20px;">
                    <h3 style="margin:0;"><i class="fas fa-id-card" style="color:#0ea5e9;"></i> Detail Informasi Pegawai</h3>
                    <button class="btn" style="background:#ef4444; padding: 5px 10px;" id="btnTutupDetail"><i class="fas fa-times"></i></button>
                </div>
                
                <div id="kontenDetail" class="grid-2" style="grid-template-columns: 1fr 1fr 1fr;">
                    </div>
            </div>
        </div>
    `;

    initLogikaPegawai();
}

function initLogikaPegawai() {
    const tbody = document.getElementById('tabelMaster');
    const modalForm = document.getElementById('modalFormPegawai');
    const modalDetail = document.getElementById('modalDetailPegawai');
    const form = document.getElementById('formPegawai');
    const modalTitle = document.getElementById('modalTitle');
    const kontenDetail = document.getElementById('kontenDetail');
    
    const inputCari = document.getElementById('inputCari');
    const filterStatus = document.getElementById('filterStatus');

    let currentData = [];

    // --- 1. LOAD DATA DARI DATABASE ---
    async function loadData() {
        const { data, error } = await supabase.from('pegawai').select('*');
        if (error) {
            tbody.innerHTML = `<tr><td colspan="6">Error: ${error.message}</td></tr>`;
            return;
        }
        currentData = data; 
        updateOpsiFilter(); 
        renderTabel(currentData); 
    }

    // --- 2. RENDER TABEL HTML ---
    function renderTabel(data) {
        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Tidak ada data yang ditemukan.</td></tr>`;
            return;
        }

        tbody.innerHTML = data.map(row => `
            <tr>
                <td><strong>NIK:</strong> ${row.nik || '-'}<br><span style="color:#64748b; font-size:0.8rem;">NIP: ${row.nip || '-'}</span></td>
                <td>${row.nama || '-'}</td>
                <td>${row.jabatan || '-'}</td>
                <td>${row.ruangan || '-'}</td>
                <td>${row.status || '-'}</td>
                <td>
                    <button class="btn btn-detail" onclick="bukaDetail('${row.id_pegawai}')" title="Lihat Detail"><i class="fas fa-eye"></i></button>
                    <button class="btn btn-edit" onclick="bukaForm('${row.id_pegawai}')" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-hapus" onclick="hapusDataPegawai('${row.id_pegawai}')" title="Hapus"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    }

    // --- 3. FITUR PENCARIAN & FILTER ---
    function terapkanPencarianDanFilter() {
        const keyword = inputCari.value.toLowerCase();
        const statusTerpilih = filterStatus.value;
        const dataTersaring = currentData.filter(pegawai => {
            const cocokKeyword = (pegawai.nama && pegawai.nama.toLowerCase().includes(keyword)) || 
                                 (pegawai.nik && pegawai.nik.toLowerCase().includes(keyword));
            const cocokStatus = (statusTerpilih === "") || (pegawai.status === statusTerpilih);
            return cocokKeyword && cocokStatus;
        });
        renderTabel(dataTersaring);
    }

    function updateOpsiFilter() {
        const listStatus = [...new Set(currentData.map(p => p.status).filter(Boolean))];
        filterStatus.innerHTML = `<option value="">Semua Status Pegawai</option>` + 
            listStatus.map(status => `<option value="${status}">${status}</option>`).join('');
    }

    inputCari.addEventListener('input', terapkanPencarianDanFilter);
    filterStatus.addEventListener('change', terapkanPencarianDanFilter);

    // --- 4. FITUR VIEW DETAIL (BARU) ---
    window.bukaDetail = (id) => {
        const pegawai = currentData.find(p => p.id_pegawai == id);
        if(!pegawai) return;

        // Kosongkan konten sebelumnya
        kontenDetail.innerHTML = '';

        // Definisi kolom apa saja yang mau ditampilkan (Bisa disesuaikan urutannya)
        const kolomTampil = [
            { key: 'nik', label: 'NIK' }, { key: 'nip', label: 'NIP' }, { key: 'nama', label: 'Nama Lengkap' },
            { key: 'tempat_lahir', label: 'Tempat Lahir' }, { key: 'tanggal_lahir', label: 'Tgl Lahir' },
            { key: 'jenis_kelamin', label: 'Jenis Kelamin' }, { key: 'agama', label: 'Agama' },
            { key: 'status_keluarga', label: 'Status Keluarga' }, { key: 'no_telp', label: 'No Telp' },
            { key: 'email', label: 'Email' }, { key: 'alamat', label: 'Alamat' },
            { key: 'status', label: 'Status Pegawai' }, { key: 'kelompok_pegawai', label: 'Kelp. Pegawai' },
            { key: 'kelompok_jabatan', label: 'Kelp. Jabatan' }, { key: 'gol', label: 'Golongan' },
            { key: 'jabatan', label: 'Jabatan' }, { key: 'ruangan', label: 'Ruangan' },
            { key: 'tmt_pangkat', label: 'TMT Pangkat' }, { key: 'tmt_berikutnya', label: 'TMT Berikutnya' },
            { key: 'tmt_cpns', label: 'TMT CPNS' }, { key: 'masuk_rs', label: 'Masuk RS' },
            { key: 'masa_kerja_rs', label: 'Masa Kerja RS' }, { key: 'rentang_bup', label: 'Rentang BUP' },
            { key: 'tmt_pensiun', label: 'TMT Pensiun' }, { key: 'jenjang', label: 'Jenjang Pddk' },
            { key: 'fakultas', label: 'Fakultas' }, { key: 'jurusan', label: 'Jurusan' },
            { key: 'no_bpjsn', label: 'No BPJS Kesh' }, { key: 'no_bpjsket_taspen', label: 'No BPJS TK' },
            { key: 'npwp', label: 'NPWP' }
        ];

        // Looping untuk membuat elemen UI
        kolomTampil.forEach(item => {
            const div = document.createElement('div');
            div.className = 'detail-item';
            
            // Format ulang teks jika null/kosong
            let nilai = pegawai[item.key];
            if(nilai === null || nilai === "") nilai = "-";

            div.innerHTML = `
                <span class="detail-label">${item.label}</span>
                <span class="detail-value">${nilai}</span>
            `;
            
            // Jika alamat, buat agar memakan 3 kolom (full width)
            if(item.key === 'alamat') div.style.gridColumn = 'span 3';
            
            kontenDetail.appendChild(div);
        });

        modalDetail.style.display = 'flex';
    };

    // Tombol tutup Detail
    document.getElementById('btnTutupDetail').onclick = () => modalDetail.style.display = 'none';


    // --- 5. FITUR TAMBAH / EDIT ---
    document.getElementById('btnTambahBaru').onclick = () => {
        form.reset(); 
        document.getElementById('form_id_pegawai').value = ''; 
        modalTitle.innerText = "Tambah Master Pegawai Baru";
        modalForm.style.display = 'flex';
    };

    window.bukaForm = (id) => {
        form.reset(); 
        modalTitle.innerText = "Edit Data Pegawai";
        const pegawai = currentData.find(p => p.id_pegawai == id);
        if(!pegawai) return;

        Object.keys(pegawai).forEach(key => {
            const inputElement = document.getElementById(`form_${key}`);
            if(inputElement) inputElement.value = pegawai[key] || '';
        });
        modalForm.style.display = 'flex';
    };


    // --- 6. LOGIKA SIMPAN & HAPUS KE DATABASE ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btnSimpan = document.getElementById('btnSimpanData');
        btnSimpan.innerText = "Menyimpan...";

        const formData = new FormData(form);
        const dataObj = Object.fromEntries(formData.entries());
        const id_pegawai = dataObj.id_pegawai;
        delete dataObj.id_pegawai;

        Object.keys(dataObj).forEach(key => {
            if (dataObj[key] === "") dataObj[key] = null;
        });

        if (id_pegawai) {
            const { error } = await supabase.from('pegawai').update(dataObj).eq('id_pegawai', id_pegawai);
            if (error) alert('Gagal update: ' + error.message);
        } else {
            const { error } = await supabase.from('pegawai').insert([dataObj]);
            if (error) alert('Gagal menambah data: ' + error.message);
        }

        btnSimpan.innerHTML = `<i class="fas fa-save"></i> Simpan Data`;
        modalForm.style.display = 'none';
        loadData();
    });

    window.hapusDataPegawai = async (id) => {
        if(confirm('Yakin ingin menghapus data master pegawai ini?')) {
            await supabase.from('pegawai').delete().eq('id_pegawai', id);
            loadData(); 
        }
    };

    document.getElementById('btnTutupModal').onclick = () => modalForm.style.display = 'none';

    // Eksekusi load data
    loadData();
}
