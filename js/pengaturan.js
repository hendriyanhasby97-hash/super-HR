import { supabase } from './koneksi.js';

// File ini menangani 3 halaman sekaligus berdasarkan parameter "tipe"
export function renderPengaturan(container, tipe) {
    // Menyesuaikan nama tabel dan nama kolom berdasarkan tipe yang diklik
    let tableDB = `master_${tipe}`;
    let kolomNama = `nama_${tipe}`;
    let titleLabel = tipe.charAt(0).toUpperCase() + tipe.slice(1);

    container.innerHTML = `
        <style>
            .btn { padding: 8px 15px; border: none; border-radius: 4px; cursor: pointer; color: white; font-weight: 600; display: inline-flex; align-items: center; gap: 5px; }
            .btn-hapus { background: #ef4444; padding: 6px 10px; font-size: 0.85rem;}
            .btn-tambah { background: #10b981; }
            
            table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; font-size: 0.9rem;}
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
            th { background: #f8fafc; }
            
            .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .form-tambah { display: flex; gap: 10px; }
            .form-tambah input { padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 4px; outline: none; width: 300px; }
            .form-tambah input:focus { border-color: #0ea5e9; box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15); }
        </style>

        <div class="toolbar">
            <div>
                <h3>Data Master ${titleLabel}</h3>
                <p style="font-size: 0.85rem; color: #64748b;">Tambahkan daftar ${tipe} di sini agar muncul di form dropdown Pegawai.</p>
            </div>
            <form class="form-tambah" id="formTambahMaster">
                <input type="text" id="inputNamaMaster" placeholder="Ketik nama ${tipe} baru..." required autocomplete="off">
                <button type="submit" class="btn btn-tambah" id="btnSimpanMaster"><i class="fas fa-plus"></i> Tambah</button>
            </form>
        </div>

        <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <table>
                <thead>
                    <tr>
                        <th style="width: 50px;">No</th>
                        <th>Nama ${titleLabel}</th>
                        <th style="width:100px;">Aksi</th>
                    </tr>
                </thead>
                <tbody id="tabelDataMaster"><tr><td colspan="3" style="text-align:center;">Memuat data...</td></tr></tbody>
            </table>
        </div>
    `;

    initLogikaPengaturan(tableDB, kolomNama);
}

function initLogikaPengaturan(tableDB, kolomNama) {
    const tbody = document.getElementById('tabelDataMaster');
    const form = document.getElementById('formTambahMaster');
    const inputNama = document.getElementById('inputNamaMaster');
    const btnSimpan = document.getElementById('btnSimpanMaster');

    // Load Data dari Supabase
    async function loadData() {
        try {
            const { data, error } = await supabase.from(tableDB).select('*').order(kolomNama, { ascending: true });
            
            if (error) throw error;
            
            if (!data || data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding: 20px;">Belum ada pilihan data. Silakan ketik dan tambah di atas.</td></tr>`;
                return;
            }

            tbody.innerHTML = data.map((row, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td><strong>${row[kolomNama]}</strong></td>
                    <td>
                        <button class="btn btn-hapus" onclick="hapusMaster('${row.id}')" title="Hapus"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="3" style="color:red; text-align:center;">Gagal memuat data: ${err.message}</td></tr>`;
        }
    }

    // Tambah Data Baru
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        btnSimpan.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        btnSimpan.disabled = true;

        const nilaiInput = inputNama.value.trim();
        const dataObj = {};
        dataObj[kolomNama] = nilaiInput; // Set nama kolom secara dinamis

        const { error } = await supabase.from(tableDB).insert([dataObj]);
        
        btnSimpan.innerHTML = '<i class="fas fa-plus"></i> Tambah';
        btnSimpan.disabled = false;

        if (error) {
            alert('Gagal menambah data: ' + error.message);
        } else {
            inputNama.value = ''; // Kosongkan input
            loadData(); // Refresh tabel
        }
    });

    // Hapus Data
    window.hapusMaster = async (id) => {
        if(confirm('Yakin ingin menghapus data ini dari pilihan dropdown?')) {
            await supabase.from(tableDB).delete().eq('id', id);
            loadData(); 
        }
    };

    // Eksekusi Load Data Pertama Kali
    loadData();
}
