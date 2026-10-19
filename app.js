// =============================================================
// Catatan Keuangan Driver Ojol
// =============================================================

// ---------- Ambil elemen dari HTML ----------
const form = document.querySelector("#form-transaksi");
const inputTanggal = document.querySelector("#input-tanggal");
const inputJenis = document.querySelector("#input-jenis");
const fieldSifat = document.querySelector("#field-sifat");
const inputKategori = document.querySelector("#input-kategori");
const inputNominal = document.querySelector("#input-nominal");
const inputCatatan = document.querySelector("#input-catatan");
const wadahDaftar = document.querySelector("#daftar-transaksi");
const pesanKosong = document.querySelector("#daftar-kosong");
const elTotalPemasukan = document.querySelector("#total-pemasukan");
const elTotalPengeluaran = document.querySelector("#total-pengeluaran");
const elSaldo = document.querySelector("#saldo");
const elKhasPendapatan = document.querySelector("#khas-pendapatan");
const elKhasOperasional = document.querySelector("#khas-operasional");
const elKhasBersih = document.querySelector("#khas-bersih");

// ---------- State: semua transaksi ada di array ini ----------
let daftarTransaksi = [];

// W4: nama key untuk menyimpan data di localStorage
const KUNCI_STORAGE = "transaksi-ojol";

// ---------- W4: penyimpanan localStorage ----------

// Simpan array transaksi ke localStorage (objek → teks JSON)
function simpanData(daftar) {
  localStorage.setItem(KUNCI_STORAGE, JSON.stringify(daftar));
}

// Baca array transaksi dari localStorage (teks JSON → array objek)
function muatData() {
  const teks = localStorage.getItem(KUNCI_STORAGE);
  if (!teks) return []; // belum pernah menyimpan → mulai dari array kosong

  try {
    const data = JSON.parse(teks);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    // isi localStorage rusak (bukan JSON valid) → jangan sampai aplikasi crash
    console.warn("Data di localStorage rusak, mulai dari kosong.", error);
    return [];
  }
}

// ---------- Fungsi bantu ----------

// Tanggal hari ini dalam format "YYYY-MM-DD" menurut jam lokal (WIB).
// Tidak pakai toISOString() karena hasilnya UTC: sebelum jam 07.00 WIB
// tanggalnya masih kemarin.
function tanggalHariIni() {
  const sekarang = new Date();
  const tahun = sekarang.getFullYear();
  const bulan = String(sekarang.getMonth() + 1).padStart(2, "0"); // getMonth() mulai dari 0
  const hari = String(sekarang.getDate()).padStart(2, "0");
  return `${tahun}-${bulan}-${hari}`;
}

// Tampilkan pilihan operasional/pribadi hanya jika jenis = pengeluaran
function aturFieldSifat() {
  const isPengeluaran = inputJenis.value === "pengeluaran";
  fieldSifat.hidden = !isPengeluaran;

  if (!isPengeluaran) {
    // kosongkan pilihan supaya pemasukan tidak ikut membawa sifat
    form.querySelectorAll('input[name="sifat"]').forEach((radio) => {
      radio.checked = false;
    });
  }
}

// Hanya kategori yang sesuai jenis yang bisa dipilih
function aturKategori() {
  inputKategori.value = "";

  inputKategori.querySelectorAll("optgroup").forEach((grup) => {
    grup.disabled = grup.dataset.jenis !== inputJenis.value;
  });
}

// W1: baca isi form lalu ubah menjadi satu objek transaksi
function bacaForm() {
  const jenis = inputJenis.value;
  const radioSifat = form.querySelector('input[name="sifat"]:checked');

  return {
    id: Date.now(),
    tanggal: inputTanggal.value,
    jenis: jenis,
    sifat: jenis === "pengeluaran" && radioSifat ? radioSifat.value : null,
    kategori: inputKategori.value,
    nominal: Number(inputNominal.value), // simpan sebagai angka, bukan teks
    catatan: inputCatatan.value.trim(),
  };
}

// Ubah angka menjadi teks Rupiah, contoh: 25000 → "Rp 25.000"
function formatRupiah(angka) {
  return angka.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });
}

// W2: tampilkan semua transaksi ke <ul id="daftar-transaksi">
function renderDaftar(daftar) {
  wadahDaftar.innerHTML = ""; // kosongkan dulu supaya tidak dobel
  pesanKosong.hidden = daftar.length > 0;

  // salin dulu dengan [...daftar] karena sort() mengubah array aslinya.
  // Urutkan tanggal terbaru di atas; jika tanggal sama, yang terakhir diinput di atas.
  const terurut = [...daftar].sort((a, b) => {
    if (a.tanggal !== b.tanggal) {
      return b.tanggal.localeCompare(a.tanggal);
    }
    return b.id - a.id;
  });

  terurut.forEach((t) => {
    const item = document.createElement("li");
    item.className = "transaksi-item";

    // kiri: kategori, badge sifat, tanggal & catatan
    const info = document.createElement("div");
    info.className = "transaksi-info";

    const kategori = document.createElement("div");
    kategori.className = "transaksi-kategori";
    kategori.textContent = t.kategori + " ";

    if (t.sifat) {
      const badge = document.createElement("span");
      badge.className = `badge ${t.sifat}`;
      badge.textContent = t.sifat;
      kategori.appendChild(badge);
    }

    const meta = document.createElement("div");
    meta.className = "transaksi-meta";
    meta.textContent = t.catatan ? `${t.tanggal} · ${t.catatan}` : t.tanggal;

    info.appendChild(kategori);
    info.appendChild(meta);

    // kanan: nominal, + untuk pemasukan dan - untuk pengeluaran
    const nominal = document.createElement("span");
    nominal.className = `transaksi-nominal ${t.jenis}`;
    const tanda = t.jenis === "pemasukan" ? "+" : "-";
    nominal.textContent = tanda + formatRupiah(t.nominal);

    // W3: tombol hapus, id transaksi disimpan di atribut data-id
    const tombolHapus = document.createElement("button");
    tombolHapus.type = "button";
    tombolHapus.className = "btn-hapus";
    tombolHapus.textContent = "Hapus";
    tombolHapus.dataset.id = t.id;

    item.appendChild(info);
    item.appendChild(nominal);
    item.appendChild(tombolHapus);
    wadahDaftar.appendChild(item);
  });
}

// W5: hitung total pemasukan, total pengeluaran, dan saldo
function hitungRingkasan(daftar) {
  const totalPemasukan = daftar
    .filter((t) => t.jenis === "pemasukan")
    .reduce((total, t) => total + t.nominal, 0);

  const totalPengeluaran = daftar
    .filter((t) => t.jenis === "pengeluaran")
    .reduce((total, t) => total + t.nominal, 0);

  return {
    totalPemasukan: totalPemasukan,
    totalPengeluaran: totalPengeluaran,
    saldo: totalPemasukan - totalPengeluaran,
  };
}

// W5: tampilkan hasil hitungRingkasan() ke bagian Ringkasan
function renderRingkasan(ringkasan) {
  elTotalPemasukan.textContent = formatRupiah(ringkasan.totalPemasukan);
  elTotalPengeluaran.textContent = formatRupiah(ringkasan.totalPengeluaran);
  elSaldo.textContent = formatRupiah(ringkasan.saldo);
  elSaldo.classList.toggle("negatif", ringkasan.saldo < 0); // merah jika minus
}

// W6: periksa objek transaksi, kembalikan objek berisi pesan error per field.
// Objek kosong {} artinya semua valid.
function validasiForm(data) {
  const error = {};

  if (!data.tanggal) {
    error.tanggal = "Tanggal wajib diisi.";
  }
  if (!data.jenis) {
    error.jenis = "Pilih jenis transaksi.";
  }
  if (data.jenis === "pengeluaran" && !data.sifat) {
    error.sifat = "Pilih operasional atau pribadi.";
  }
  if (!data.kategori) {
    error.kategori = "Pilih kategori.";
  }
  // !(x > 0) juga menangkap NaN dan 0 (input kosong → Number("") = 0)
  if (!(data.nominal > 0)) {
    error.nominal = "Nominal harus lebih dari 0.";
  }

  return error;
}

// W6: tulis pesan error ke <p id="error-..."> dan beri border merah pada inputnya.
// tampilkanError({}) = hapus semua pesan error.
function tampilkanError(error) {
  const daftarField = ["tanggal", "jenis", "sifat", "kategori", "nominal"];

  daftarField.forEach((field) => {
    const pesan = error[field] || ""; // tidak ada error → string kosong
    document.querySelector(`#error-${field}`).textContent = pesan;

    // "sifat" berupa radio, tidak punya #input-sifat → dilewati
    const input = document.querySelector(`#input-${field}`);
    if (input) {
      input.classList.toggle("invalid", pesan !== "");
    }
  });
}

// FITUR KHAS: pendapatan bersih hari ini = pendapatan hari ini - biaya operasional hari ini
function hitungBersihHariIni(daftar) {
  const hariIni = tanggalHariIni();
  const transaksiHariIni = daftar.filter((t) => t.tanggal === hariIni);

  const pendapatan = transaksiHariIni
    .filter((t) => t.jenis === "pemasukan")
    .reduce((total, t) => total + t.nominal, 0);

  // hanya pengeluaran OPERASIONAL; pengeluaran pribadi tidak dikurangkan
  const operasional = transaksiHariIni
    .filter((t) => t.jenis === "pengeluaran" && t.sifat === "operasional")
    .reduce((total, t) => total + t.nominal, 0);

  return {
    pendapatan: pendapatan,
    operasional: operasional,
    bersih: pendapatan - operasional,
  };
}

// FITUR KHAS: tampilkan hasil hitungBersihHariIni() ke section #fitur-khas
function renderKhas(hasil) {
  elKhasPendapatan.textContent = formatRupiah(hasil.pendapatan);
  elKhasOperasional.textContent = formatRupiah(hasil.operasional);
  elKhasBersih.textContent = formatRupiah(hasil.bersih);
  elKhasBersih.classList.toggle("negatif", hasil.bersih < 0); // merah jika rugi
}

// Satu pintu untuk memperbarui SEMUA tampilan setiap kali data berubah
function renderSemua() {
  renderDaftar(daftarTransaksi);
  renderRingkasan(hitungRingkasan(daftarTransaksi));
  renderKhas(hitungBersihHariIni(daftarTransaksi));
}

// W3: hapus satu transaksi berdasarkan id
function hapusTransaksi(id) {
  // filter mengembalikan array BARU berisi semua transaksi kecuali yang id-nya sama
  daftarTransaksi = daftarTransaksi.filter((t) => t.id !== id);
  simpanData(daftarTransaksi);
  renderSemua();
}

// ---------- Event listener ----------

// W3: satu listener di <ul> (delegasi event), karena tombol hapus
// dibuat ulang setiap render
wadahDaftar.addEventListener("click", (event) => {
  const tombol = event.target.closest(".btn-hapus");
  if (!tombol) return; // yang diklik bukan tombol hapus

  const yakin = confirm("Hapus transaksi ini?");
  if (!yakin) return;

  hapusTransaksi(Number(tombol.dataset.id)); // dataset selalu string → ubah ke angka
});

inputJenis.addEventListener("change", aturFieldSifat);
inputJenis.addEventListener("change", aturKategori);

form.addEventListener("submit", (event) => {
  event.preventDefault(); // cegah halaman reload

  const transaksi = bacaForm();

  // W6: kalau ada error, tampilkan dan berhenti (data TIDAK disimpan)
  const error = validasiForm(transaksi);
  if (Object.keys(error).length > 0) {
    tampilkanError(error);
    return;
  }

  daftarTransaksi.push(transaksi);
  simpanData(daftarTransaksi);

  renderSemua();

  form.reset();
});

// Terpanggil saat tombol Reset diklik DAN saat form.reset() dipanggil
form.addEventListener("reset", () => {
  fieldSifat.hidden = true;
  tampilkanError({}); // W6: hapus semua pesan error
  inputKategori.querySelectorAll("optgroup").forEach((grup) => {
    grup.disabled = true;
  });
});

// ---------- Inisialisasi saat halaman dibuka ----------

// defaultValue = nilai yang dipakai lagi setiap kali form di-reset
inputTanggal.defaultValue = tanggalHariIni();
inputTanggal.value = tanggalHariIni();
aturKategori();
daftarTransaksi = muatData(); // W4: baca data lama saat halaman dibuka / di-refresh
renderSemua();