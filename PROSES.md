## Persona dan masalahnya

Saya mendapat persona driver ojek online. Situasi dari driver ojek online memiliki beberapa masalah diantaranya adalah pendapatan harian yang tidak tetap dan bensin dan servis memakan sebagian besar pendapatan. Karena situasi tersebut fitur khas yang harus ada dalam aplikasi yang akan dibuat adalah menandai pengeluaran sebagai "operasional" dan "pribadi" serta menampilkan pendapatan bersih hari ini. Dimana pendapatan bersih merupakan pendapatan - biaya operasional.

## Rancangan struktur data

Semua transaksi disimpan di localStorage dengan key `"transaksi-ojol"` sebagai **array of objek**. Disimpan dengan `JSON.stringify()` dan dibaca kembali dengan `JSON.parse()`.

```js
{
  id: 1760864000000,          // Date.now() saat transaksi dibuat
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

### 3. Kategori yang salah masih bisa dipilih setelah form di-reset

- **Gejala:** saya menambahkan fungsi `aturKategori()` yang menonaktifkan `<optgroup>` yang tidak sesuai dengan jenis. Saat dites, setelah memilih jenis Pengeluaran lalu klik Reset, jenis kembali ke "-- Pilih jenis --" tetapi kategori Pengeluaran masih bisa dipilih.
- **Dugaan awal saya (salah):** `inputKategori.value` tidak dikosongkan saat reset. Ternyata nilainya sudah ikut kosong karena `form.reset()` mengembalikan nilai semua field.
- **Penyebab sebenarnya:** `form.reset()` hanya mengembalikan **nilai** field, tidak mengubah properti `disabled` pada `<optgroup>`. Kasusnya sama dengan `hidden` pada fieldset sifat. Selain itu, `aturKategori()` tidak bisa langsung dipanggil di listener `reset`, karena event `reset` terpicu **sebelum** nilai dikembalikan. Akibatnya `inputJenis.value` di dalam listener masih berisi jenis lama, dan grup yang salah malah aktif lagi.
- **Solusi:** di listener `reset`, semua `<optgroup>` langsung dinonaktifkan (`grup.disabled = true`), karena setelah reset jenis pasti kosong.

### 4. Nominal desimal lolos validasi

- **Gejala:** nominal `1500.5` bisa disimpan, lalu tampil di daftar sebagai "Rp 1.501" karena `formatRupiah()` membulatkan (`maximumFractionDigits: 0`). Angka yang terlihat jadi tidak sama dengan angka yang tersimpan dan dijumlahkan, padahal Rupiah tidak memakai sen.
- **Penyebab:** di HTML input nominal sudah diberi `step="1"`, tetapi aturan itu tidak berlaku karena form memakai `novalidate`, sehingga semua validasi diserahkan ke JS. Sementara itu `validasiForm()` hanya mengecek `nominal > 0`, dan `1500.5 > 0` bernilai `true`.
- **Solusi:** di `validasiForm()` ditambahkan pengecekan `else if (!Number.isInteger(data.nominal))` dengan pesan "Nominal harus bilangan bulat.". Dipakai `else if` supaya kalau nominal kosong atau ≤ 0, yang tampil tetap pesan "harus lebih dari 0". Karena `transaksiValid()` (impor JSON) memakai ulang `validasiForm()`, transaksi bernominal desimal dari file impor juga ikut tertolak.
