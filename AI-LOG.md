# AI-LOG

## 1. Evaluasi kerangka HTML & CSS

- Prompt: "Pelajari materi kuliah dan requirement ETS, evaluasi kerangka HTML dan CSS saya, lalu buatkan planning untuk menyelesaikan requirement."
- Dipakai:
  - Perbaikan selector `.invalid` menjadi `input.invalid, select.invalid` di style.css (masalah specificity)
  - Aturan baru `#khas-bersih.negatif` di style.css untuk pendapatan bersih yang negatif
  - Kategori di index.html dikelompokkan dengan `<optgroup>` Pemasukan/Pengeluaran, dan "Lainnya" dipecah menjadi "Pemasukan Lain" dan "Pengeluaran Lain"
  - Planning per checkpoint (urutan W1–W4, W5–W6 + fitur khas, bonus)
- Diubah: -

## 2. W1 — Tambah transaksi

- Prompt: "Bantu saya bagaimana kode untuk fitur W1, sertakan penjelasan tiap blok di explanation.md."
- Dipakai (app.js):
  - Pengambilan elemen dengan `querySelector` dan state `daftarTransaksi`
  - `tanggalHariIni()`: tanggal lokal `YYYY-MM-DD` (sengaja tidak memakai `toISOString()` karena UTC)
  - `aturFieldSifat()`: menampilkan/menyembunyikan pilihan operasional/pribadi
  - `bacaForm()`: isi form diubah menjadi objek transaksi, dengan `nominal` dikonversi menggunakan `Number()`
  - Listener `submit` (dengan `preventDefault`, `push`, `form.reset()`) dan listener `reset`
  - `defaultValue` pada input tanggal supaya tanggal kembali ke hari ini setelah reset
- Diubah: Hasil AI masih membolehkan kategori pengeluaran dipilih untuk pemasukan, saya tambahkan agar optgroup yang tidak sesuai jenis tidak dapat dipilih.

## 3. Bug kategori setelah reset

- Prompt: "Hal tersebut terjadi karena pada fungsi reset tidak diberi perintah inputKategori.value = "", apakah begitu?"
- Dipakai: penjelasan AI bahwa dugaan saya salah. `form.reset()` sudah mengosongkan nilai kategori, tetapi tidak mengubah `disabled` pada `<optgroup>`, dan event `reset` terpicu sebelum nilai dikembalikan. Kode perbaikannya (menonaktifkan semua optgroup di listener `reset`) saya ketik sendiri.
- Diubah: -

## 4. W2 — Daftar transaksi

- Prompt: "Lanjut bantu saya membuat fitur W2."
- Dipakai (app.js):
  - `formatRupiah()` memakai `toLocaleString("id-ID", { style: "currency", currency: "IDR" })`
  - `renderDaftar(daftar)`: kosongkan `<ul>`, salin array dengan `[...daftar]` sebelum `sort()` (tanggal terbaru di atas, lalu `id`), buat `<li>` dengan `createElement` + `textContent`, badge sifat, dan class warna nominal
  - Pemanggilan `renderDaftar()` setelah `push` di listener submit dan saat inisialisasi; `console.log` sementara dari W1 dihapus
- Diubah: -

## 5. W3 — Hapus transaksi

- Prompt: "Lanjut ke fitur W3, bagaimana kodenya?"
- Dipakai (app.js):
  - Tombol Hapus di `renderDaftar()` dengan `dataset.id` berisi id transaksi
  - `hapusTransaksi(id)` memakai `filter()` lalu render ulang
  - Satu listener `click` di `<ul>` (delegasi event) dengan `closest(".btn-hapus")`, `confirm()`, dan `Number(dataset.id)`
- Diubah: -

## 6. W4 — Data persisten (localStorage)

- Prompt: "Berikutnya W4."
- Dipakai (app.js):
  - Konstanta `KUNCI_STORAGE = "transaksi-ojol"`
  - `simpanData(daftar)` memakai `localStorage.setItem` + `JSON.stringify`
  - `muatData()` memakai `localStorage.getItem` + `JSON.parse`, dengan `try/catch` dan `Array.isArray` supaya data rusak tidak membuat aplikasi crash
  - `simpanData()` dipanggil setelah `push` (submit) dan `filter` (hapus); `muatData()` dipanggil sekali di bagian inisialisasi sebelum render
- Diubah: -

## 7. W5 — Ringkasan

- Prompt: "Sekarang bagaimana kode untuk fitur W5?"
- Dipakai:
  - app.js: `hitungRingkasan(daftar)` memakai `filter` + `reduce` untuk total pemasukan/pengeluaran, dan saldo
  - app.js: `renderRingkasan(ringkasan)` memakai `formatRupiah` dan `classList.toggle("negatif", ...)`
  - app.js: `renderSemua()` sebagai satu pintu render; pemanggilan `renderDaftar(daftarTransaksi)` di submit, hapus, dan inisialisasi diganti `renderSemua()`
  - style.css: selector `#saldo.negatif` ditambahkan ke aturan `#khas-bersih.negatif` (saldo minus berwarna merah)
- Diubah: <!-- TODO: isi sendiri setelah dites -->

## 8. Fitur khas — Pendapatan bersih hari ini

- Prompt: "Sekarang buatkan aku fitur khasnya terlebih dahulu."
- Dipakai (app.js):
  - `hitungBersihHariIni(daftar)`: `filter` transaksi dengan tanggal = `tanggalHariIni()`, lalu `filter` + `reduce` untuk pendapatan dan pengeluaran yang `sifat === "operasional"`; bersih = pendapatan − operasional
  - `renderKhas(hasil)`: isi tiga `<dd>` di `#fitur-khas` dengan `formatRupiah`, dan `classList.toggle("negatif", ...)` jika bersih minus
  - Satu baris `renderKhas(hitungBersihHariIni(daftarTransaksi))` ditambahkan di `renderSemua()`
- Diubah: <!-- TODO: isi sendiri setelah dites -->

## 9. W6 — Validasi form

- Prompt: "Lanjut buatkan fitur W6."
- Dipakai (app.js):
  - `validasiForm(data)` mengembalikan objek error per field: tanggal, jenis, kategori wajib; sifat wajib hanya untuk pengeluaran; nominal dicek dengan `!(nominal > 0)` supaya `NaN` juga tertangkap
  - `tampilkanError(error)` menulis pesan ke `#error-<field>` dan `classList.toggle("invalid", ...)` ke `#input-<field>`; `tampilkanError({})` menghapus semua pesan
  - Di listener submit: `if (Object.keys(error).length > 0) { tampilkanError(error); return; }` sebelum `push`; di listener reset: `tampilkanError({})`
- Diubah: <!-- TODO: isi sendiri setelah dites -->
