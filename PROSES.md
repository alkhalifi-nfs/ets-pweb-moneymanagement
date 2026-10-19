# PROSES

## Persona dan masalahnya

Saya mendapat persona driver ojek online. Situasi dari driver ojek online memiliki beberapa masalah diantaranya adalah pendapatan harian yang tidak tetap dan bensin dan servis memakan sebagian besar pendapatan. Karena situasi tersebut fitur khas yang harus ada dalam aplikasi yang akan dibuat adalah menandai pengeluaran sebagai "operasional" dan "pribadi" serta menampilkan pendapatan bersih hari ini. Dimana pendapatan bersih merupakan pendapatan - biaya operasional.

## Rancangan struktur data

Semua transaksi disimpan di localStorage dengan key `"transaksi-ojol"` sebagai **array of objek**. Disimpan dengan `JSON.stringify()` dan dibaca kembali dengan `JSON.parse()`.

```js
{
  id: 1760864000000,          // Date.now() saat transaksi dibuat, unik
  tanggal: "2026-10-19",      // string YYYY-MM-DD dari <input type="date">
  jenis: "pengeluaran",       // "pemasukan" | "pengeluaran"
  sifat: "operasional",       // "operasional" | "pribadi" | null (null jika pemasukan)
  kategori: "Bensin",         // pilihan tetap dari <select>
  nominal: 20000,             // number, BUKAN teks "Rp20.000"
  catatan: "Pertalite"        // string, boleh kosong
}
```

Kategori yang tersedia:

| Jenis | Kategori |
|---|---|
| Pemasukan | Order, Tip & Bonus, Pemasukan Lain |
| Pengeluaran | Bensin, Servis, Makan, Pulsa & Kuota, Pengeluaran Lain |

Rumus fitur khas (hanya transaksi dengan `tanggal` = hari ini):

```
pendapatan bersih hari ini = total pemasukan hari ini − total pengeluaran (sifat = "operasional") hari ini
```

Pengeluaran pribadi tetap dihitung di ringkasan (total pengeluaran dan saldo), tetapi tidak mengurangi pendapatan bersih.

## Keputusan desain

**`sifat` dibuat sebagai field terpisah, bukan digabung ke kategori.**
Alasannya, satu kategori bisa bersifat operasional atau pribadi tergantung situasinya. Contohnya "Makan" saat menunggu order bisa dianggap operasional, sedangkan makan bersama keluarga termasuk pribadi. Dengan field terpisah, perhitungan pendapatan bersih cukup memakai `filter(t => t.sifat === "operasional")` tanpa harus mencocokkan daftar nama kategori. Untuk pemasukan, `sifat` diisi `null` karena tidak relevan.

**Kategori dikelompokkan dengan `<optgroup>` per jenis.**
Awalnya semua kategori ada dalam satu daftar, sehingga user bisa mencatat "Bensin" sebagai pemasukan. Sekarang kategori dikelompokkan per jenis, dan validasi di JS menolak kategori yang tidak cocok dengan jenis yang dipilih. Kategori "Lainnya" dipecah menjadi "Pemasukan Lain" dan "Pengeluaran Lain" supaya setiap kategori hanya milik satu jenis.

## Bug dan kendala

### 1. Border merah `.invalid` tidak muncul

- **Gejala:** saat review kerangka CSS, ditemukan bahwa class `.invalid` yang nanti ditambahkan oleh JS tidak akan mengubah warna border input.
- **Penyebab:** specificity. Selector `input[type="number"]` (elemen + atribut = 0,1,1) lebih kuat daripada `.invalid` (class = 0,1,0), jadi `border-color` dari `.invalid` kalah.
- **Solusi:** selector diganti menjadi `input.invalid, select.invalid` (0,1,1). Karena specificity-nya sama dan aturan ini ditulis lebih akhir di file CSS, aturan ini yang menang.

### 2. Pendapatan bersih negatif tetap berwarna hijau

- **Gejala:** `#khas-bersih` selalu hijau, padahal pendapatan bersih bisa negatif (misalnya hari ini servis besar tetapi order sedikit).
- **Solusi:** ditambahkan aturan `#khas-bersih.negatif { color: var(--keluar); }`. Nanti JS menambah atau menghapus class `negatif` sesuai hasil hitungan.

<!-- Tambahkan bug lain yang ditemui saat mengerjakan JS di sini -->
