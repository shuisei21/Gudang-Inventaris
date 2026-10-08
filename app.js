// ========== DATA DEFAULT (3 BARANG PERCETAKAN) ==========
const DATA_DEFAULT = [
    { id: "PRT-001", nama: "Tinta Print Hitam", harga: 125000, stokAwal: 24, stokMasuk: 0, stokKeluar: 0 },
    { id: "PRT-002", nama: "Kertas A4", harga: 55000, stokAwal: 45, stokMasuk: 0, stokKeluar: 0 },
    { id: "PRT-003", nama: "Kamus", harga: 89000, stokAwal: 12, stokMasuk: 0, stokKeluar: 0 }
];

// ========== VARIABEL GLOBAL ==========
let data = [];
let riwayat = [];

// ========== ELEMEN DOM ==========
const selectBarang = document.getElementById('selectBarang');
const jenisTransaksi = document.getElementById('jenisTransaksi');
const tipePengambilan = document.getElementById('tipePengambilan');
const jumlahInput = document.getElementById('jumlahInput');
const namaPengambil = document.getElementById('namaPengambil');
const keterangan = document.getElementById('keterangan');
const btnProses = document.getElementById('btnProses');
const btnResetRiwayat = document.getElementById('btnResetRiwayat');
const tabelStok = document.getElementById('tabelStok');
const tabelRiwayat = document.getElementById('tabelRiwayat');
const pesan = document.getElementById('messageBox');

// ========== FUNGSI FORMAT RUPIAH ==========
function rupiah(angka) {
    if (isNaN(angka) || angka === undefined) angka = 0;
    return new Intl.NumberFormat('id-ID', { 
        style: 'currency', 
        currency: 'IDR', 
        minimumFractionDigits: 0 
    }).format(angka);
}

// ========== HITUNG STOK AKHIR ==========
function hitungStokAkhir(item) {
    return item.stokAwal + item.stokMasuk - item.stokKeluar;
}

// ========== UPDATE DROPDOWN ==========
function updateDropdown() {
    const sebelumnya = selectBarang.value;
    selectBarang.innerHTML = '<option value="">-- Pilih Barang --</option>';
    
    for (let i = 0; i < data.length; i++) {
        let stokAkhir = hitungStokAkhir(data[i]);
        let option = document.createElement('option');
        option.value = data[i].id;
        option.textContent = data[i].id + ' - ' + data[i].nama + ' (Stok: ' + stokAkhir + ')';
        selectBarang.appendChild(option);
    }
    
    if (sebelumnya && data.some(b => b.id === sebelumnya)) {
        selectBarang.value = sebelumnya;
    }
}

// ========== TAMPILKAN TABEL STOK ==========
function tampilkanTabelStok() {
    tabelStok.innerHTML = '';
    
    for (let i = 0; i < data.length; i++) {
        let item = data[i];
        let stokAkhir = hitungStokAkhir(item);
        let totalNilai = stokAkhir * item.harga;
        
        let baris = tabelStok.insertRow();
        
        baris.insertCell(0).innerHTML = '<b>' + item.id + '</b>';
        baris.insertCell(1).innerHTML = item.nama;
        baris.insertCell(2).innerHTML = rupiah(item.harga);
        baris.insertCell(3).innerHTML = item.stokAwal;
        baris.insertCell(4).innerHTML = item.stokMasuk;
        baris.insertCell(5).innerHTML = item.stokKeluar;
        baris.insertCell(6).innerHTML = '<b>' + stokAkhir + '</b>';
        baris.insertCell(7).innerHTML = rupiah(totalNilai);
    }
}

// ========== TAMPILKAN RIWAYAT ==========
function tampilkanRiwayat() {
    tabelRiwayat.innerHTML = '';
    
    if (riwayat.length === 0) {
        tabelRiwayat.innerHTML = '<tr><td colspan="8" style="text-align:center;">Belum ada transaksi</td></tr>';
        return;
    }
    
    // Tampilkan dari yang terbaru ke lama (reverse)
    for (let i = riwayat.length - 1; i >= 0; i--) {
        let r = riwayat[i];
        let baris = tabelRiwayat.insertRow();
        
        baris.insertCell(0).innerHTML = r.tanggal;
        baris.insertCell(1).innerHTML = r.barang;
        
        let jenisSpan = r.jenis === 'masuk' 
            ? '<span style="color:#27ae60; font-weight:bold;">STOK MASUK</span>' 
            : '<span style="color:#e67e22; font-weight:bold;">STOK KELUAR</span>';
        baris.insertCell(2).innerHTML = jenisSpan;
        
        baris.insertCell(3).innerHTML = r.tipe;
        baris.insertCell(4).innerHTML = r.jumlah;
        baris.insertCell(5).innerHTML = r.pengambil || '-';
        baris.insertCell(6).innerHTML = r.keterangan || '-';
        baris.insertCell(7).innerHTML = r.stokAkhir;
    }
}

// ========== TAMPILKAN SEMUA ==========
function tampilkanSemua() {
    tampilkanTabelStok();
    tampilkanRiwayat();
    updateDropdown();
}

// ========== RESET KE DATA DEFAULT ==========
function resetKeDataDefault() {
    data = JSON.parse(JSON.stringify(DATA_DEFAULT));
    riwayat = [];
    tampilkanSemua();
    pesanMuncul('Data telah direset ke default: Tinta Print, Kertas A4, Kamus');
}

// ========== TAMPIL PESAN ==========
function pesanMuncul(text, isError = false) {
    pesan.textContent = text;
    pesan.style.backgroundColor = isError ? '#fee8e8' : '#eef4fc';
    pesan.style.borderLeftColor = isError ? '#e05a5a' : '#2c7da0';
    
    setTimeout(() => {
        if (pesan.textContent === text) {
            pesan.style.backgroundColor = '#eef4fc';
            pesan.style.borderLeftColor = '#2c7da0';
            pesan.textContent = 'Sistem siap. Pilih barang dan isi form transaksi.';
        }
    }, 3000);
}

// ========== PROSES TRANSAKSI ==========
function prosesTransaksi() {
    const idBarang = selectBarang.value;
    if (!idBarang) {
        pesanMuncul('Peringatan: Silakan pilih barang terlebih dahulu!', true);
        return;
    }
    
    const jenis = jenisTransaksi.value;
    const tipe = tipePengambilan.value;
    const jumlah = parseInt(jumlahInput.value);
    const pengambil = namaPengambil.value.trim();
    const catatan = keterangan.value.trim();
    
    if (isNaN(jumlah) || jumlah <= 0) {
        pesanMuncul('Error: Jumlah harus angka positif!', true);
        return;
    }
    
    const indexBarang = data.findIndex(b => b.id === idBarang);
    if (indexBarang === -1) {
        pesanMuncul('Error: Barang tidak ditemukan!', true);
        return;
    }
    
    const barang = data[indexBarang];
    const stokSaatIni = hitungStokAkhir(barang);
    
    // Validasi stok untuk transaksi keluar
    if (jenis === 'keluar' && jumlah > stokSaatIni) {
        pesanMuncul('Error: Stok tidak mencukupi! Stok saat ini: ' + stokSaatIni, true);
        return;
    }
    
    // Update stok masuk atau keluar
    if (jenis === 'masuk') {
        barang.stokMasuk += jumlah;
        pesanMuncul('STOK MASUK: +' + jumlah + ' ' + barang.nama + '. Stok akhir: ' + hitungStokAkhir(barang));
    } else {
        barang.stokKeluar += jumlah;
        pesanMuncul('STOK KELUAR: -' + jumlah + ' ' + barang.nama + ' oleh ' + (pengambil || '-') + '. Stok akhir: ' + hitungStokAkhir(barang));
    }
    
    // Simpan ke riwayat
    const now = new Date();
    const tanggal = now.toLocaleDateString('id-ID') + ' ' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    
    riwayat.push({
        tanggal: tanggal,
        barang: barang.nama + ' (' + barang.id + ')',
        jenis: jenis,
        tipe: tipe === 'karyawan' ? 'Karyawan' : 'Konsumen',
        jumlah: jumlah,
        pengambil: pengambil || (jenis === 'masuk' ? 'Supplier' : '-'),
        keterangan: catatan || '-',
        stokAkhir: hitungStokAkhir(barang)
    });
    
    // Update tampilan
    tampilkanSemua();
    
    // Reset form
    jumlahInput.value = '1';
    namaPengambil.value = '';
    keterangan.value = '';
}

// ========== HAPUS RIWAYAT ==========
function resetRiwayat() {
    if (confirm('Hapus semua riwayat transaksi? Data stok tidak akan berubah.')) {
        riwayat = [];
        tampilkanRiwayat();
        pesanMuncul('Riwayat transaksi telah dihapus.');
    }
}

// ========== EVENT LISTENER ==========
btnProses.onclick = prosesTransaksi;
btnResetRiwayat.onclick = resetRiwayat;

// ========== START APLIKASI ==========
resetKeDataDefault();