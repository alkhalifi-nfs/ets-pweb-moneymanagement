# Catatan Keuangan Driver Ojol

Aplikasi web pencatat keuangan pribadi untuk ETS Pemrograman Web. Dibuat dengan HTML, CSS, dan JavaScript murni, dengan data disimpan di localStorage.

- **Nama:** Muhammad Nafis Al Khalifi
- **NRP:** 5053251019
- **Link aplikasi (GitHub Pages):** https://alkhalifi-nfs.github.io/ets-pweb-moneymanagement/

## Persona

Persona saya adalah driver ojek online. Situasi dari driver ojek online memiliki beberapa masalah diantaranya adalah pendapatan harian yang tidak tetap dan bensin dan servis memakan sebagian besar pendapatan. Karena situasi tersebut fitur khas yang ada dalam aplikasi adalah menandai pengeluaran sebagai "operasional" dan "pribadi" serta menampilkan pendapatan bersih hari ini untuk memudahkan driver mengetahui berapa uang yang benar-benar didapat dari bekerja hari ini.


## Fitur yang selesai

### Fitur wajib
- **W1 – Tambah transaksi:** form berisi tanggal, jenis, kategori (8 pilihan yang menyesuaikan jenis), nominal, dan catatan opsional
- **W2 – Daftar transaksi:** dirender dari JavaScript, transaksi terbaru di atas, nominal dalam format Rupiah
- **W3 – Hapus transaksi:** dengan konfirmasi sebelum dihapus
- **W4 – Data persisten:** disimpan di localStorage, tetap ada setelah refresh
- **W5 – Ringkasan:** total pemasukan, total pengeluaran, dan saldo, diperbarui otomatis
- **W6 – Validasi form:** field wajib dan nominal > 0, pesan error tampil di halaman

### Fitur khas persona
- Setiap pengeluaran ditandai **operasional** atau **pribadi**
- Menampilkan **pendapatan bersih hari ini** = pendapatan hari ini − biaya operasional hari ini (pengeluaran pribadi tidak ikut dikurangkan)

### Fitur bonus
- Filter berdasarkan jenis, sifat, kategori, rentang tanggal, dan pencarian kata kunci pada catatan
- Tampilan responsif untuk layar HP selebar 360px
- Ekspor data ke file JSON dan impor kembali sebagai backup

## Fitur yang belum selesai
- Edit transaksi yang sudah tersimpan
- Budget per kategori dengan peringatan

## Struktur file
- `index.html`: struktur halaman
- `style.css`: tampilan
- `app.js`: logika aplikasi
- `PROSES.md`: proses kerja, rancangan data, keputusan desain, dan bug
- `AI-LOG.md`: catatan penggunaan AI