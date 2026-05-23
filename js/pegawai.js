import { supabase } from './koneksi.js';

export async function renderPegawai(container) {
    container.innerHTML = `
        <h2>Data Pegawai</h2>
        <div id="table-container">Loading...</div>
    `;

    const { data, error } = await supabase
        .from('pegawai') // Pastikan nama tabel di Supabase adalah 'pegawai'
        .select('*');

    if (error) {
        container.innerHTML = `<p>Error: ${error.message}</p>`;
    } else {
        renderTable(data);
    }
}

function renderTable(data) {
    const tableContainer = document.getElementById('table-container');
    let html = '<table border="1"><tr><th>Nama</th><th>Jabatan</th></tr>';
    data.forEach(row => {
        html += `<tr><td>${row.nama}</td><td>${row.jabatan}</td></tr>`;
    });
    html += '</table>';
    tableContainer.innerHTML = html;
}

// Fungsi tambah data contoh
export async function tambahPegawai(nama, jabatan) {
    const { data, error } = await supabase
        .from('pegawai')
        .insert([{ nama: nama, jabatan: jabatan }]);
    
    if (error) console.error(error);
    else alert('Data berhasil ditambahkan');
}
