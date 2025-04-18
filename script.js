import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  where,
  collection,
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAGpqDZoKxd6oTtVuXt2Cc8U3XCZV6S5_w",
  authDomain: "mec-kgm-klt.firebaseapp.com",
  projectId: "mec-kgm-klt",
  storageBucket: "mec-kgm-klt.firebasestorage.app",
  messagingSenderId: "1001961428291",
  appId: "1:1001961428291:web:3049033421bc8cad124bf6",
  measurementId: "G-ZXGS4GLEEJ",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const inputCari = document.getElementById("cariNama");
const hasilCari = document.getElementById("hasilCari");
const formNilai = document.getElementById("formNilai");
const judulFormNilai = document.getElementById("judulFormNilai");

const cariNilaiInput = document.getElementById("cariNilaiNama");
const hasilNilai = document.getElementById("hasilNilai");

// ======================= GLOBAL VARIABLES ==========================
let daftarMuridCache = [];
let siswaArray = [];
let nilaiCache = [];
let muridDipilih = null;
let editDocId = null;
let editNilaiId = null;
let currentPage = 1;
let currentPageNilai = 1;
const itemsPerPage = 5;
const itemsPerPageNilai = 5;

// === KONFIGURASI MAINTENANCE ===
const isUnderMaintenance = false; // Ubah menjadi true jika situs sedang perbaikan

const kunciWriting = {
  1: [
    "B",
    "A",
    "D",
    "D",
    "C", // 1–5
    "D",
    "A",
    "A",
    "B",
    "A", // 6–10
    "A",
    "B",
    ["A", "B"],
    "D",
    "A", // 11–15 (13: dua jawaban benar)
    "A",
    "C",
    "A",
    "B",
    "A", // 16–20
    "A",
    "D",
    "A",
    "A",
    "D", // 21–25
    "A",
    "B",
    "C",
    "D",
    "C", // 26–30
    "B",
    "B",
    "C",
    "C",
    "B", // 31–35
    "D",
    "B",
    "B",
    "A",
    "D", // 36–40
  ],
  2: [
    "D",
    "C",
    "A",
    "B",
    "A",
    "A",
    "A",
    "D",
    "B",
    "B",
    "C",
    "D",
    "A",
    "A",
    "B",
    "B",
    "A",
    "D",
    "D",
    "A",
    "C",
    "B",
    "C",
    "A",
    "D",
    "C",
    "B",
    "C",
    ["A", "B", "C", "D"], // index 28 (no.29) = BONUS
    "C", // no.30
    "A",
    "A",
    "D",
    "A",
    "D", // index 36 (no.37) = BONUS
    "A", // index 37 (no.38) = BONUS
    ["A", "B", "C", "D"],
    ["A", "B", "C", "D"],
    "C",
    "A",
  ],
  3: [
    "A",
    "D",
    "A",
    "B",
    "C",
    "B",
    "A",
    "C",
    "A",
    "D", // 1-10
    "A",
    "B",
    "C",
    "B",
    "B",
    "A",
    "A",
    ["A", "B", "C", "D"], // nomor 18 (index 17) = BONUS
    "A",
    "C",
    "A",
    "D",
    "A",
    "D",
    "D",
    "C",
    "D",
    "C", // 19-30
    "A",
    "B",
    "B",
    "A",
    "B",
    "C",
    "A",
    "C",
    "D",
    "B",
    "B",
    "A",
  ],
  4: [
    "B",
    "A",
    "B",
    "C",
    "C", // 1–5
    "D",
    "A",
    "B",
    "A",
    "C", // 6–10
    "B",
    "D",
    "A",
    "C",
    "B", // 11–15
    "B",
    "A",
    "D",
    "B",
    "A", // 16–20
    "A",
    "A",
    "B",
    "A",
    "A", // 21–25
    "D",
    "C",
    "A",
    "D",
    "A", // 26–30
    "D",
    "A",
    "A",
    "C",
    "B", // 31–35
    "D",
    "C",
    "C",
    "B",
    "D", // 36–40
  ],
};

let inputModeWriting = "manual"; // atau "otomatis"

// === CEK DAN ATUR TAMPILAN AKSES ===
function checkMaintenance() {
  if (isUnderMaintenance) {
    window.location.href = "404.html";
    return;
  }

  // Ambil parameter akses dari URL (misalnya: index.html?akses=tchr123)
  const akses = new URLSearchParams(window.location.search).get("akses");

  // Sembunyikan semua section terlebih dahulu
  document.querySelector("#siswa-container").style.display = "none";
  document.getElementById("uploadSiswaSection").style.display = "none";
  document.getElementById("uploadSiswaNilaiSection").style.display = "none";
  document.getElementById("daftarMuridSection").style.display = "none";
  document.getElementById("daftarNilaiSection").style.display = "none";
  document.getElementById("cariNilaiSection").style.display = "none";

  // Akses guru
  if (akses === "tchr123") {
    document.querySelector("#siswa-container").style.display = "block";
    document.getElementById("cariNilaiSection").style.display = "block";
  }

  // Akses admin
  if (akses === "admn123") {
    document.querySelector("#siswa-container").style.display = "block";
    document.getElementById("uploadSiswaSection").style.display = "block";
    document.getElementById("uploadSiswaNilaiSection").style.display = "block";
    document.getElementById("daftarMuridSection").style.display = "block";
    document.getElementById("daftarNilaiSection").style.display = "block";
  }

  // Tanpa akses: hanya bisa lihat fitur cari nilai
  if (!akses) {
    document.getElementById("cariNilaiSection").style.display = "block";
  }
}

// Jalankan saat halaman dimuat
window.onload = checkMaintenance;

document.getElementById("excelInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // ✅ Validasi format hanya .xlsx
  const allowedExtension = /\.xlsx$/i;
  if (!allowedExtension.test(file.name)) {
    Swal.fire(
      "Format Tidak Valid",
      "Silakan upload file berformat .xlsx saja.",
      "error"
    );
    e.target.value = ""; // reset input
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    const data = new Uint8Array(event.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    siswaArray = XLSX.utils.sheet_to_json(sheet, {
      header: ["noInduk", "nama", "kelas", "level", "cabang"], // ✅ Tambah ini
      range: 1,
    });

    if (siswaArray.length === 0) {
      Swal.fire("Kosong", "Tidak ada data ditemukan dalam file.", "info");
      return;
    }

    const invalidRows = siswaArray.filter(
      (s) => !s.noInduk || !s.nama || !s.kelas || !s.level || !s.cabang
    );
    if (invalidRows.length > 0) {
      Swal.fire(
        "❌ Validasi Gagal",
        "Ada baris yang belum lengkap. Pastikan semua kolom terisi.",
        "error"
      );
      return;
    }

    let htmlTable = "<table style='width:100%;text-align:left'>";
    htmlTable +=
      "<tr><th>noInduk</th><th>Nama</th><th>Kelas</th><th>Level</th><th>Cabang</th></tr>";
    siswaArray.forEach((s) => {
      htmlTable += `<tr><td>${s.noInduk}</td><td>${s.nama}</td><td>${s.kelas}</td><td>${s.level}</td><td>${s.cabang}</td></tr>`;
    });
    htmlTable += "</table>";

    Swal.fire({
      title: "Preview Data",
      html: htmlTable,
      width: "70%",
      confirmButtonText: "Cek & Simpan",
      showCancelButton: true,
      cancelButtonText: "Batal",
      preConfirm: () => simpanTanpaDuplikat(siswaArray),
    });
  };

  reader.readAsArrayBuffer(file);
});

document.getElementById("excelNilaiInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // ✅ Validasi format hanya .xlsx
  const allowedExtension = /\.xlsx$/i;
  if (!allowedExtension.test(file.name)) {
    Swal.fire(
      "Format Tidak Valid",
      "Silakan upload file berformat .xlsx saja.",
      "error"
    );
    e.target.value = ""; // reset input
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    const data = new Uint8Array(event.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    siswaArray = XLSX.utils.sheet_to_json(sheet, {
      header: [
        "noInduk",
        "nama",
        "reading",
        "listening",
        "writing",
        "speaking",
        "matematika",
      ],
      range: 1,
    });

    if (siswaArray.length === 0) {
      Swal.fire("Kosong", "Tidak ada data ditemukan dalam file.", "info");
      return;
    }

    const invalidRows = siswaArray.filter(
      (s) =>
        !s.noInduk ||
        !s.nama ||
        !s.reading ||
        !s.listening ||
        !s.writing ||
        !s.speaking
    );
    if (invalidRows.length > 0) {
      Swal.fire(
        "❌ Validasi Gagal",
        "Ada baris yang belum lengkap. Pastikan semua kolom terisi.",
        "error"
      );
      return;
    }

    let htmlTable = "<table style='width:100%;text-align:left'>";
    htmlTable +=
      "<tr><th>No Induk</th><th>Nama</th><th>Reading</th><th>Listening</th><th>Writing</th><th>Speaking</th><th>Matematika</th></tr>";
    siswaArray.forEach((s) => {
      htmlTable += `<tr><td>${s.noInduk}</td><td>${s.nama}</td><td>${s.reading}</td><td>${s.listening}</td><td>${s.writing}</td><td>${s.speaking}</td><td>${s.matematika}</td></tr>`;
    });
    htmlTable += "</table>";

    Swal.fire({
      title: "Preview Data",
      html: htmlTable,
      width: "70%",
      confirmButtonText: "Cek & Simpan",
      showCancelButton: true,
      cancelButtonText: "Batal",
      preConfirm: () => simpanNilaiTanpaDuplikat(siswaArray),
    });
  };

  reader.readAsArrayBuffer(file);
});

// === FETCH CACHE DATA SEKALI
async function loadCaches() {
  const [muridSnapshot, nilaiSnapshot] = await Promise.all([
    getDocs(collection(db, "murid")),
    getDocs(collection(db, "nilai")),
  ]);
  daftarMuridCache = muridSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  nilaiCache = nilaiSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

function initInputCari() {
  inputCari.addEventListener(
    "input",
    debounce(() => {
      if (daftarMuridCache.length === 0) {
        console.warn("⚠️ Cache murid belum siap");
        return;
      }

      const keyword = inputCari.value.toLowerCase();
      if (!keyword) return sembunyikanFormNilai();

      const hasil = daftarMuridCache.find((m) =>
        m.nama.toLowerCase().includes(keyword)
      );

      if (hasil) {
        muridDipilih = hasil;
        resetInputWriting();
        hasilCari.textContent = `Ditemukan: ${hasil.nama} (Kelas ${hasil.kelas}, Level ${hasil.level}, Cabang ${hasil.cabang})`;
        judulFormNilai.textContent = `Input / Edit nilai untuk ${hasil.nama}`;

        const data = nilaiCache.find(
          (n) => n.nama.toLowerCase() === hasil.nama.toLowerCase()
        );

        document.getElementById("reading").value = data?.reading ?? "";
        document.getElementById("listening").value = data?.listening ?? "";
        // ✅ Tambahan untuk writing (agar nilai apapun tetap tampil)
        const selectWriting = document.getElementById("writing");
        const nilaiWriting = data?.writing;

        if (
          nilaiWriting !== null &&
          nilaiWriting !== undefined &&
          !Array.from(selectWriting.options).some(
            (opt) => opt.value == nilaiWriting
          )
        ) {
          const newOption = document.createElement("option");
          newOption.value = nilaiWriting;
          newOption.textContent = nilaiWriting;
          selectWriting.appendChild(newOption);
        }
        selectWriting.value = nilaiWriting ?? "";
        document.getElementById("speaking").value = data?.speaking ?? "";
        document.getElementById("matematika").value = data?.matematika ?? "";

        formNilai.classList.remove("hidden");
      } else {
        hasilCari.textContent = "❌ Murid tidak ditemukan.";
        sembunyikanFormNilai();
      }
    }, 300)
  );
}

async function simpanTanpaDuplikat(siswaArray) {
  const total = siswaArray.length;
  let berhasil = 0;
  let duplikat = [];

  Swal.fire({
    title: "Menyimpan data...",
    html: `
      <div id="progressText">0 / ${total} disimpan</div>
      <div style="width: 100%; background: #ccc; border-radius: 5px; overflow: hidden; margin-top: 10px;">
        <div id="progressBar" style="width: 0%; height: 10px; background: #1976d2;"></div>
      </div>
    `,
    showConfirmButton: false,
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  });

  for (let i = 0; i < total; i++) {
    const siswa = siswaArray[i];
    const isDuplicate = daftarMuridCache.some((m) => m.nama === siswa.nama);

    if (isDuplicate) {
      duplikat.push(siswa.nama);
    } else {
      const docRef = await addDoc(collection(db, "murid"), siswa);
      daftarMuridCache.push({ id: docRef.id, ...siswa });
      berhasil++;
    }

    const percent = Math.floor(((i + 1) / total) * 100);
    document.getElementById("progressBar").style.width = `${percent}%`;
    document.getElementById("progressText").textContent = `${
      i + 1
    } / ${total} diproses`;
  }

  Swal.fire({
    icon: duplikat.length ? "warning" : "success",
    title: "Selesai",
    html: `✅ ${berhasil} berhasil disimpan.<br>❌ Duplikat: ${
      duplikat.length > 0 ? duplikat.join(", ") : "Tidak ada"
    }`,
  });

  document.getElementById("excelInput").value = "";
}

async function simpanNilaiTanpaDuplikat(siswaArray) {
  const total = siswaArray.length;
  let berhasil = 0;
  let duplikat = [];

  Swal.fire({
    title: "Menyimpan data...",
    html: `
      <div id="progressText">0 / ${total} disimpan</div>
      <div style="width: 100%; background: #ccc; border-radius: 5px; overflow: hidden; margin-top: 10px;">
        <div id="progressBar" style="width: 0%; height: 10px; background: #1976d2;"></div>
      </div>
    `,
    showConfirmButton: false,
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  });

  for (let i = 0; i < total; i++) {
    const s = siswaArray[i];

    const siswa = {
      noInduk: s.noInduk?.toString().trim() || "",
      nama: s.nama?.toString().trim() || "",
      reading: s.reading !== undefined ? parseInt(s.reading) : null,
      listening: s.listening !== undefined ? parseInt(s.listening) : null,
      writing: s.writing !== undefined ? parseInt(s.writing) : null,
      speaking: s.speaking !== undefined ? parseInt(s.speaking) : null,
      matematika: s.matematika !== undefined ? parseInt(s.matematika) : null,
      tanggal: new Date().toISOString(),
    };

    if (!siswa.nama || !siswa.noInduk) {
      continue; // skip baris tidak valid
    }

    const querySnapshot = await getDocs(
      query(collection(db, "nilai"), where("nama", "==", siswa.nama))
    );

    if (!querySnapshot.empty) {
      duplikat.push(siswa.nama);
    } else {
      await setDoc(doc(db, "nilai", siswa.nama.toLowerCase()), siswa);
      berhasil++;
    }

    // Progress bar
    const percent = Math.floor(((i + 1) / total) * 100);
    document.getElementById("progressBar").style.width = `${percent}%`;
    document.getElementById("progressText").textContent = `${
      i + 1
    } / ${total} diproses`;
  }

  Swal.fire({
    icon: duplikat.length ? "warning" : "success",
    title: "Selesai",
    html: `✅ ${berhasil} berhasil disimpan.<br>❌ Duplikat: ${
      duplikat.length > 0 ? duplikat.join(", ") : "Tidak ada"
    }`,
  });

  document.getElementById("excelNilaiInput").value = "";
}

function resetFormNilai() {
  ["reading", "listening", "writing", "speaking", "matematika"].forEach(
    (id) => (document.getElementById(id).value = "")
  );
}

function sembunyikanFormNilai() {
  formNilai.classList.add("hidden");
  hasilCari.textContent = "";
  inputCari.value = "";
  muridDipilih = null;
}

// ======================= TAMPILKAN MURID (PAKAI CACHE) ==========================
function tampilkanMurid() {
  renderMuridTablePage(daftarMuridCache, currentPage);
}

// ======================= LOAD DATA NILAI (DARI CACHE) ==========================
function loadDataNilaiMurid() {
  renderNilaiMuridPage(nilaiCache, currentPageNilai);
}

// === DEBOUNCE UTILITY
function debounce(func, delay = 300) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

// inputCari.addEventListener(
//   "input",
//   debounce(() => {
//     const keyword = inputCari.value.trim().toLowerCase();
//     if (!keyword) {
//       console.log("⛔ Keyword kosong. Tidak mencari apa pun.");
//       return sembunyikanFormNilai();
//     }

//     // ✅ Lihat isi cache murid dan nilai saat ini
//     console.log("📦 Cache Murid:", daftarMuridCache);
//     console.log("📦 Cache Nilai:", nilaiCache);

//     const hasil = daftarMuridCache.find((m) =>
//       m.nama.toLowerCase().includes(keyword)
//     );

//     if (hasil) {
//       console.log("✅ Ditemukan di cache murid:", hasil);

//       muridDipilih = hasil;
//       hasilCari.textContent = `Ditemukan: ${hasil.nama} (Kelas ${hasil.kelas}, Level ${hasil.level}, Cabang ${hasil.cabang})`;
//       judulFormNilai.textContent = `Input / Edit nilai untuk ${hasil.nama}`;

//       const nilai = nilaiCache.find(
//         (n) => n.nama.toLowerCase() === hasil.nama.toLowerCase()
//       );

//       console.log("📥 Nilai ditemukan di cache:", nilai);

//       document.getElementById("reading").value = nilai?.reading ?? "";
//       document.getElementById("listening").value = nilai?.listening ?? "";
//       document.getElementById("writing").value = nilai?.writing ?? "";
//       document.getElementById("speaking").value = nilai?.speaking ?? "";
//       document.getElementById("matematika").value = nilai?.matematika ?? "";

//       formNilai.classList.remove("hidden");
//     } else {
//       console.log("❌ Tidak ditemukan di cache murid");
//       hasilCari.textContent = "❌ Murid tidak ditemukan.";
//       sembunyikanFormNilai();
//     }
//   }, 300)
// );

document.getElementById("toggleModeWriting").addEventListener("change", (e) => {
  const isChecked = e.target.checked;
  inputModeWriting = isChecked ? "otomatis" : "manual";

  // Toggle tampilan
  document.getElementById("writing").disabled = isChecked;
  document
    .getElementById("writingSoalContainer")
    .classList.toggle("hidden", !isChecked);
});

function resetInputWriting() {
  const inputs = document.querySelectorAll(".jawaban-writing");
  inputs.forEach((input) => {
    input.value = "";
    input.style.backgroundColor = "#2a2a3b"; // Warna default
  });
}

function generateWritingInputs() {
  const group = document.getElementById("soalWritingGroup");
  group.innerHTML = ""; // reset
  const placeholders = ["A", "B", "C", "D"];
  for (let i = 1; i <= 40; i++) {
    const placeholder = placeholders[(i - 1) % 4]; // A B C D ulang
    const soal = document.createElement("div");
    soal.classList.add("soal-item");
    soal.innerHTML = `
      <span class="soal-no">${i}.</span>
      <input
        type="text"
        class="jawaban-writing"
        maxlength="1"
        placeholder="${placeholder}"
        data-index="${i - 1}"
      />
    `;
    group.appendChild(soal);
  }
}

document.addEventListener("keydown", (e) => {
  if (!e.target.classList.contains("jawaban-writing")) return;

  const index = parseInt(e.target.dataset.index);
  if (e.key === "Backspace" && e.target.value === "") {
    const prev = document.querySelector(
      `.jawaban-writing[data-index="${index - 1}"]`
    );
    if (prev) prev.focus();
  }
});

document.addEventListener("input", (e) => {
  if (!e.target.classList.contains("jawaban-writing")) return;

  let value = e.target.value.toUpperCase().trim();

  // Batasi hanya A, B, C, D
  if (!["A", "B", "C", "D"].includes(value)) {
    e.target.value = ""; // Hapus kalau bukan A-D
    e.target.style.backgroundColor = "#2a2a3b";
    return;
  }

  e.target.value = value; // Set ke huruf besar

  const index = parseInt(e.target.dataset.index);
  const level = muridDipilih?.level;
  const kunci = kunciWriting[level];

  if (kunci && kunci[index]) {
    let isCorrect = false;

    // Khusus Level 1, no 13
    if (level === 1 && index === 12) {
      isCorrect = value === "A" || value === "B";
    } else if (level === 3 && index === 17) {
      isCorrect = true; // Bonus soal level 3
    } else {
      const kunciNomor = kunci[index];
      isCorrect = Array.isArray(kunciNomor)
        ? kunciNomor.includes(value)
        : value === kunciNomor;
    }

    e.target.style.backgroundColor = isCorrect ? "#28a745" : "#dc3545";
  }

  // Fokus ke input berikutnya
  const next = document.querySelector(
    `.jawaban-writing[data-index="${index + 1}"]`
  );
  if (next) next.focus();
});

document
  .getElementById("simpanNilaiBtn")
  .addEventListener("click", async () => {
    if (!muridDipilih) return Swal.fire("❌ Belum memilih murid.");

    const nama = muridDipilih.nama;
    const level = muridDipilih.level;

    let writingScore = null;

    if (inputModeWriting === "otomatis") {
      const jawabanUser = Array.from(
        document.querySelectorAll(".jawaban-writing")
      ).map((el) => el.value.toUpperCase().trim());

      if (
        jawabanUser.length < 40 ||
        jawabanUser.some((j) => !["A", "B", "C", "D"].includes(j))
      ) {
        return Swal.fire(
          "❌ Jawaban tidak valid",
          "Isi semua soal dengan A-D",
          "warning"
        );
      }

      const kunci = kunciWriting[level];
      if (!kunci || kunci.length !== 40) {
        return Swal.fire(
          "❌ Error",
          "Kunci Writing belum tersedia atau tidak valid.",
          "error"
        );
      }

      // ✅ Hitung jumlah benar dengan logika fleksibel
      const benar = jawabanUser.filter((j, i) => {
        const kunciNomor = kunci[i];

        if (Array.isArray(kunciNomor)) {
          return kunciNomor.includes(j);
        }

        return j === kunciNomor;
      }).length;

      const skorAwal = benar * 2.5;

      // ✅ Pembulatan: .5 ke atas, lainnya dibulatkan normal
      writingScore =
        skorAwal % 1 === 0.5 ? Math.ceil(skorAwal) : Math.round(skorAwal);
    } else {
      // Manual input
      writingScore = parseInt(document.getElementById("writing").value) || null;
    }

    const nilai = {
      noInduk: muridDipilih.noInduk || "",
      nama: muridDipilih.nama,
      reading: parseInt(document.getElementById("reading").value) || null,
      listening: parseInt(document.getElementById("listening").value) || null,
      writing: writingScore,
      speaking: parseInt(document.getElementById("speaking").value) || null,
      matematika: parseInt(document.getElementById("matematika").value) || null,
      tanggal: new Date().toISOString(),
    };

    Swal.fire({
      title: "Menyimpan nilai...",
      didOpen: () => Swal.showLoading(),
    });

    try {
      await setDoc(doc(db, "nilai", muridDipilih.nama.toLowerCase()), nilai, {
        merge: true,
      });

      // ✅ Update cache
      const index = nilaiCache.findIndex((n) => n.nama === muridDipilih.nama);
      if (index !== -1) nilaiCache[index] = { ...nilaiCache[index], ...nilai };
      else nilaiCache.push({ id: muridDipilih.nama.toLowerCase(), ...nilai });

      if (inputModeWriting === "otomatis") {
        Swal.fire(
          "✅ Nilai Writing Disimpan",
          `${nama} mendapatkan ${writingScore} untuk Writing`,
          "success"
        ).then(() => {
          window.location.reload(); // ⬅️ Tambahkan ini
        });
      } else {
        Swal.fire("✅ Nilai berhasil disimpan", "", "success").then(() => {
          window.location.reload(); // ⬅️ Tambahkan ini juga
        });
      }

      resetFormNilai();
      sembunyikanFormNilai();
      renderNilaiMuridPage(nilaiCache, currentPageNilai); // opsional
    } catch (err) {
      console.error(err);
      Swal.fire("❌ Gagal menyimpan nilai", "", "error");
    }
  });

document.getElementById("batalNilaiBtn").addEventListener("click", () => {
  resetFormNilai();
  sembunyikanFormNilai();
});

cariNilaiInput.addEventListener(
  "input",
  debounce(() => {
    const keyword = cariNilaiInput.value.toLowerCase();
    hasilNilai.innerHTML = "";

    if (!keyword) return;

    const data = nilaiCache.find((d) => d.nama.toLowerCase().includes(keyword));

    if (data) {
      // Cari murid dari cache murid berdasarkan nama
      const murid = daftarMuridCache.find(
        (m) => m.nama.toLowerCase() === data.nama.toLowerCase()
      );

      hasilNilai.innerHTML = `
        <div class="nilai-card">
          <h3>${data.nama} - ${murid?.cabang || "-"}, Kelas ${
        murid?.kelas || "-"
      }, Level ${murid?.level || "-"}</h3>
          <p>📖 Reading: ${data.reading ?? "menunggu"}</p>
          <p>🎧 Listening: ${data.listening ?? "menunggu"}</p>
          <p>✍️ Writing: ${data.writing ?? "menunggu"}</p>
          <p>🗣️ Speaking: ${data.speaking ?? "menunggu"}</p>
          <p>🔢 Matematika: ${data.matematika ?? "menunggu"}</p>
        </div>
      `;
    } else {
      hasilNilai.textContent = "❌ Nilai tidak ditemukan.";
    }
  }, 500)
);

function renderMuridTablePage(data, page = 1) {
  const daftarMurid = document.getElementById("daftarMurid");
  daftarMurid.innerHTML = "";

  const sorted = [...data].sort((a, b) =>
    String(a.noInduk || "").localeCompare(String(b.noInduk || ""))
  );

  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedItems = sorted.slice(start, end);

  paginatedItems.forEach((murid) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="sticky-col">${murid.noInduk || "-"}</td>
      <td>${murid.nama}</td>
      <td>${murid.kelas}</td>
      <td>${murid.level}</td>
      <td>${murid.cabang}</td>
      <td>
        <button class="btn-edit" data-nama="${murid.nama}">✏️ Edit</button>
        <button class="btn-delete" data-nama="${murid.nama}">🗑 Hapus</button>
      </td>
    `;
    daftarMurid.appendChild(tr);
    bindDeleteButtons();
  });

  renderPaginationControls(data.length, page);
}

function renderPaginationControls(totalItems, currentPage) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const pagination = document.getElementById("paginationMurid");
  let html = "";

  const maxButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let endPage = startPage + maxButtons - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  if (currentPage > 1) {
    html += `<button onclick="changePage(${
      currentPage - 1
    })">&laquo; Prev</button>`;
  }

  // Tambahkan "1" dan "..." di depan jika startPage > 2
  if (startPage > 2) {
    html += `<button onclick="changePage(1)">1</button>`;
    html += `<span class="dots">...</span>`;
  } else if (startPage === 2) {
    html += `<button onclick="changePage(1)">1</button>`;
  }

  for (let i = startPage; i <= endPage; i++) {
    html += `<button class="${
      i === currentPage ? "active" : ""
    }" onclick="changePage(${i})">${i}</button>`;
  }

  // Tambahkan "..." dan "lastPage" di akhir jika endPage < totalPages - 1
  if (endPage < totalPages - 1) {
    html += `<span class="dots">...</span>`;
    html += `<button onclick="changePage(${totalPages})">${totalPages}</button>`;
  } else if (endPage === totalPages - 1) {
    html += `<button onclick="changePage(${totalPages})">${totalPages}</button>`;
  }

  if (currentPage < totalPages) {
    html += `<button onclick="changePage(${
      currentPage + 1
    })">Next &raquo;</button>`;
  }

  pagination.innerHTML = html;
}

document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-edit")) {
    const nama = e.target.dataset.nama;

    // Menampilkan modal "Memuat data..."
    Swal.fire({
      title: "Memuat data...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const q = query(collection(db, "murid"), where("nama", "==", nama));
    const snapshot = await getDocs(q);

    // Setelah data berhasil dimuat, tutup modal loading
    Swal.close();

    if (!snapshot.empty) {
      const docRef = snapshot.docs[0];
      const data = docRef.data();
      editDocId = docRef.id;

      document.getElementById("editNoInduk").value = data.noInduk || "";
      document.getElementById("editNama").value = data.nama || "";
      document.getElementById("editKelas").value = data.kelas || "";
      document.getElementById("editLevel").value = data.level || "";
      document.getElementById("editCabang").value = data.cabang || "";

      const modal = document.getElementById("modalEditMurid");

      // Reset animasi jika modal sedang terbuka
      modal.classList.remove("show");
      modal.classList.remove("hidden");

      // Pakai delay singkat agar animasi bisa dipicu ulang
      setTimeout(() => {
        modal.classList.add("show");
      }, 100);
    } else {
      Swal.fire("❌ Murid tidak ditemukan");
    }
  }
});

// Simpan Edit

document
  .getElementById("btnSimpanEditMurid")
  .addEventListener("click", async () => {
    if (!editDocId) return;

    const updatedData = {
      noInduk: document.getElementById("editNoInduk").value.trim(),
      nama: document.getElementById("editNama").value.trim(),
      kelas: document.getElementById("editKelas").value.trim(),
      level: document.getElementById("editLevel").value.trim(),
      cabang: document.getElementById("editCabang").value.trim(),
    };

    Swal.fire({
      title: "Menyimpan...",
      text: "Mohon tunggu, data murid sedang disimpan.",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      await setDoc(doc(db, "murid", editDocId), updatedData);

      // ✅ Update cache
      const index = daftarMuridCache.findIndex((m) => m.id === editDocId);
      if (index !== -1) {
        daftarMuridCache[index] = { id: editDocId, ...updatedData };
      }

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data murid berhasil disimpan.",
        timer: 1500,
        showConfirmButton: false,
      });

      // ✅ Tutup modal & render ulang tabel
      const modal = document.getElementById("modalEditMurid");
      modal.classList.remove("show");
      setTimeout(() => modal.classList.add("hidden"), 300);

      editDocId = null;
      renderMuridTablePage(daftarMuridCache, currentPage);
    } catch (err) {
      console.error("❌ Gagal edit murid:", err);
      Swal.fire("❌ Gagal menyimpan perubahan.");
    }
  });

// Batal
document.getElementById("btnBatalEditMurid").addEventListener("click", () => {
  const modal = document.getElementById("modalEditMurid");
  modal.classList.remove("show");
  setTimeout(() => {
    modal.classList.add("hidden");
  }, 300); // Sesuai dengan CSS transition
  editDocId = null;
});

function bindDeleteButtons() {
  document.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const nama = btn.dataset.nama;
      if (!nama) return;

      const konfirmasi = await Swal.fire({
        icon: "warning",
        title: "Hapus Murid?",
        text: `Yakin ingin menghapus murid "${nama}"?`,
        showCancelButton: true,
        confirmButtonText: "Ya, Hapus",
        cancelButtonText: "Batal",
      });

      if (!konfirmasi.isConfirmed) return;

      Swal.fire({
        title: "Menghapus data...",
        text: `Menghapus data siswa untuk ${nama}`,
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      try {
        const q = query(collection(db, "murid"), where("nama", "==", nama));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          Swal.fire(
            "Tidak ditemukan",
            `Murid "${nama}" tidak ditemukan.`,
            "info"
          );
          return;
        }

        for (const docSnap of snapshot.docs) {
          await deleteDoc(doc(db, "murid", docSnap.id));
        }

        daftarMuridCache = daftarMuridCache.filter((m) => m.nama !== nama); // ⬅️ update cache
        renderMuridTablePage(daftarMuridCache, currentPage);

        Swal.fire("Berhasil!", `Murid "${nama}" berhasil dihapus.`, "success");
      } catch (err) {
        console.error(err);
        Swal.fire("Gagal", "Terjadi kesalahan saat menghapus data.", "error");
      }
    });
  });
}

// Export nilai

document
  .getElementById("btnExportNilai")
  .addEventListener("click", async () => {
    if (nilaiCache.length === 0) {
      return Swal.fire(
        "Kosong",
        "Belum ada data nilai untuk diekspor.",
        "info"
      );
    }

    Swal.fire({
      title: "Mengekspor data...",
      text: "Mohon tunggu, sedang menyiapkan file Excel.",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const dataExport = nilaiCache.map((d) => ({
        Noinduk: d.noInduk || "",
        Nama: d.nama || "",
        Reading: d.reading ?? "",
        Listening: d.listening ?? "",
        Writing: d.writing ?? "",
        Speaking: d.speaking ?? "",
        Matematika: d.matematika ?? "",
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Nilai Siswa");

      XLSX.writeFile(workbook, "data_nilai_siswa.xlsx");

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "File Excel telah disimpan.",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Export error:", err);
      Swal.fire("Gagal", "Terjadi kesalahan saat ekspor data.", "error");
    }
  });

function filterAndExportNilaiInggirsByCabang(cabang) {
  const ENDPOINT_KGM =
    "https://script.google.com/macros/s/AKfycbwGOhGaQf5TiUQG1yXNeI6JRdnzU3AjU1pIMuRUYKDJzvj0EwyeWF04wF82SP7YE_cG1Q/exec";
  const ENDPOINT_KLT =
    "https://script.google.com/macros/s/AKfycbwlXpF2OChtBUe6n_joiTl58r_6e7MtUQaiNzuDNDdWc5dTgMRvX2j_Kfhu5tLmpattuw/exec";

  const endpoint = cabang.toUpperCase() === "KGM" ? ENDPOINT_KGM : ENDPOINT_KLT;

  // Gabungkan nilai dengan murid (tambahkan noInduk & cabang)
  const merged = nilaiCache.map((nilai) => {
    const murid = daftarMuridCache.find(
      (m) => m.nama.toLowerCase() === nilai.nama.toLowerCase()
    );
    return {
      ...nilai,
      cabang: murid?.cabang || "",
      noInduk: murid?.noInduk || "",
    };
  });

  // Filter berdasarkan cabang
  const sorted = merged
    .filter((n) =>
      (n.cabang || "").toLowerCase().includes(cabang.toLowerCase())
    )
    .sort((a, b) =>
      String(a.noInduk || "").localeCompare(String(b.noInduk || ""))
    );

  if (sorted.length === 0) {
    return Swal.fire({
      icon: "info",
      title: `❌ Tidak Ada Data ${cabang.toUpperCase()}`,
      text: `Tidak ditemukan murid dari cabang ${cabang.toUpperCase()} di daftar nilai.`,
    });
  }

  // Preview tetap ditampilkan meskipun ada yang kosong
  const previewTable = sorted
    .map(
      (n, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${n.noInduk || "-"}</td>
              <td>${n.nama || "-"}</td>
              <td>${n.reading ?? ""}</td>
              <td>${n.listening ?? ""}</td>
              <td>${n.writing ?? ""}</td>
              <td>${n.speaking ?? ""}</td>
            </tr>`
    )
    .join("");

  Swal.fire({
    title: `📋 Konfirmasi Export Nilai ${cabang.toUpperCase()}`,
    html: `
            <p>Berikut adalah data yang akan dikirim ke spreadsheet:</p>
            <div style="max-height: 300px; overflow-y: auto; text-align:left">
              <table style="width:100%; font-size: 12px; border-collapse: collapse;" border="1" cellpadding="4">
                <thead>
                  <tr style="background:#333; color:white">
                    <th>#</th>
                    <th>No Induk</th>
                    <th>Nama</th>
                    <th>Reading</th>
                    <th>Listening</th>
                    <th>Writing</th>
                    <th>Speaking</th>
                  </tr>
                </thead>
                <tbody>${previewTable}</tbody>
              </table>
            </div>
          `,
    width: 750,
    showCancelButton: true,
    confirmButtonText: "✅ Kirim Sekarang",
  }).then(async (result) => {
    if (!result.isConfirmed) return;

    const payload = {
      noInduk: sorted.map((n) => n.noInduk ?? ""),
      nama: sorted.map((n) => n.nama ?? ""),
      reading: sorted.map((n) => n.reading ?? ""),
      listening: sorted.map((n) => n.listening ?? ""),
      writing: sorted.map((n) => n.writing ?? ""),
      speaking: sorted.map((n) => n.speaking ?? ""),
    };

    Swal.fire({
      title: "Mengirim data...",
      text: `Sedang mengirim nilai ${cabang.toUpperCase()} ke spreadsheet...`,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      await fetch(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
      });

      Swal.fire(
        "✅ Sukses",
        `Data ${cabang.toUpperCase()} berhasil dikirim ke spreadsheet.`,
        "success"
      );
    } catch (err) {
      console.error("❌ Gagal kirim:", err);
      Swal.fire(
        "❌ Gagal",
        `Terjadi kesalahan saat mengirim data ${cabang.toUpperCase()}.`,
        "error"
      );
    }
  });
}

function filterAndExportNilaiMatematikaByCabang(cabang) {
  const ENDPOINT_KGM =
    "https://script.google.com/macros/s/AKfycbwQgkJIoK-KtXa5sLaojmiaZfvEktFgWRL_fARUu8kZqOh3OKioqFxEel4nmi_K4g2O/exec";
  const ENDPOINT_KLT =
    "https://script.google.com/macros/s/AKfycbwrPA7iWlw1juVFNxuo5rWkCv4acbw7AqHx6hc9HkwUwpBkKWgNkynIHLyBnxOvbB9z/exec";

  const endpoint = cabang.toUpperCase() === "KGM" ? ENDPOINT_KGM : ENDPOINT_KLT;

  // Gabungkan data nilai dengan data murid
  const merged = nilaiCache.map((nilai) => {
    const murid = daftarMuridCache.find(
      (m) => m.nama.toLowerCase() === nilai.nama.toLowerCase()
    );
    return {
      ...nilai,
      cabang: murid?.cabang || "",
      noInduk: murid?.noInduk || "",
    };
  });

  // Filter berdasarkan cabang
  const sorted = merged
    .filter((n) =>
      (n.cabang || "").toLowerCase().includes(cabang.toLowerCase())
    )
    .sort((a, b) =>
      String(a.noInduk || "").localeCompare(String(b.noInduk || ""))
    );

  if (sorted.length === 0) {
    return Swal.fire({
      icon: "info",
      title: `❌ Tidak Ada Data ${cabang.toUpperCase()}`,
      text: `Tidak ditemukan murid dari cabang ${cabang.toUpperCase()} di daftar nilai.`,
    });
  }

  // Tampilkan preview
  const previewTable = sorted
    .map(
      (n, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${n.noInduk}</td>
          <td>${n.nama}</td>
          <td>${n.matematika ?? ""}</td>
        </tr>`
    )
    .join("");

  Swal.fire({
    title: `📋 Konfirmasi Export Nilai Matematika ${cabang.toUpperCase()}`,
    html: `
        <p>Berikut adalah data yang akan dikirim ke spreadsheet:</p>
        <div style="max-height: 300px; overflow-y: auto; text-align:left">
          <table style="width:100%; font-size: 12px; border-collapse: collapse;" border="1" cellpadding="4">
            <thead>
              <tr style="background:#333; color:white">
                <th>#</th>
                <th>No Induk</th>
                <th>Nama</th>
                <th>Matematika</th>
              </tr>
            </thead>
            <tbody>${previewTable}</tbody>
          </table>
        </div>
      `,
    width: 600,
    showCancelButton: true,
    confirmButtonText: "✅ Kirim Sekarang",
  }).then(async (result) => {
    if (!result.isConfirmed) return;

    const payload = {
      noInduk: sorted.map((n) => n.noInduk ?? ""),
      nama: sorted.map((n) => n.nama ?? ""),
      matematika: sorted.map((n) => n.matematika ?? ""),
    };

    Swal.fire({
      title: "Mengirim data...",
      text: `Sedang mengirim nilai matematika cabang ${cabang.toUpperCase()}...`,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      await fetch(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
      });

      Swal.fire(
        "✅ Sukses",
        `Data nilai Matematika ${cabang.toUpperCase()} berhasil dikirim ke spreadsheet.`,
        "success"
      );
    } catch (err) {
      console.error("❌ Gagal kirim:", err);
      Swal.fire(
        "❌ Gagal",
        `Terjadi kesalahan saat mengirim data Matematika ${cabang.toUpperCase()}.`,
        "error"
      );
    }
  });
}

// Render nilai murid
function renderNilaiMuridPage(data, page = 1) {
  const tbody = document.getElementById("daftarNilaiMurid");
  tbody.innerHTML = "";

  const sorted = [...data].sort((a, b) =>
    String(a.noInduk || "").localeCompare(String(b.noInduk || ""))
  );

  const start = (page - 1) * itemsPerPageNilai;
  const end = start + itemsPerPageNilai;
  const paginatedItems = sorted.slice(start, end);

  paginatedItems.forEach((item) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.noInduk}</td>
      <td class="sticky-col">${item.nama}</td>
      <td>${item.reading !== null ? item.reading : "menunggu"}</td>
      <td>${item.listening !== null ? item.listening : "menunggu"}</td>
      <td>${item.writing !== null ? item.writing : "menunggu"}</td>
      <td>${item.speaking !== null ? item.speaking : "menunggu"}</td>
      <td>${
        item.matematika !== null ? item.matematika : "menunggu"
      }</td> <!-- Tambahkan kolom untuk nilai matematika -->
      <td>
        <button class="btn-edit-nilai" data-id="${item.id}">✏️ Edit</button>
        <button class="btn-delete-nilai" data-id="${item.id}" data-nama="${
      item.nama
    }">🗑 Hapus</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  renderPaginationNilai(data.length, page);
}

function renderPaginationNilai(totalItems, currentPage) {
  const pagination = document.getElementById("paginationNilaiMurid");
  let html = "";
  const totalPages = Math.ceil(totalItems / itemsPerPageNilai);
  const maxButtons = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let endPage = startPage + maxButtons - 1;
  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  if (currentPage > 1) {
    html += `<button onclick="changePageNilai(${
      currentPage - 1
    })">&laquo; Prev</button>`;
  }

  if (startPage > 2) {
    html += `<button onclick="changePageNilai(1)">1</button><span class="dots">...</span>`;
  } else if (startPage === 2) {
    html += `<button onclick="changePageNilai(1)">1</button>`;
  }

  for (let i = startPage; i <= endPage; i++) {
    html += `<button class="${
      i === currentPage ? "active" : ""
    }" onclick="changePageNilai(${i})">${i}</button>`;
  }

  if (endPage < totalPages - 1) {
    html += `<span class="dots">...</span><button onclick="changePageNilai(${totalPages})">${totalPages}</button>`;
  } else if (endPage === totalPages - 1) {
    html += `<button onclick="changePageNilai(${totalPages})">${totalPages}</button>`;
  }

  if (currentPage < totalPages) {
    html += `<button onclick="changePageNilai(${
      currentPage + 1
    })">Next &raquo;</button>`;
  }

  pagination.innerHTML = html;
}

document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-edit-nilai")) {
    const id = e.target.dataset.id;
    editNilaiId = id; // ⬅️ WAJIB diset supaya tombol simpan bisa bekerja

    const data = nilaiCache.find((item) => item.id === id);

    if (!data) {
      Swal.close();
      return Swal.fire("❌ Data tidak ditemukan.");
    }

    document.getElementById("editReading").value = data.reading ?? "";
    document.getElementById("editListening").value = data.listening ?? "";
    document.getElementById("editWriting").value = data.writing ?? "";
    document.getElementById("editSpeaking").value = data.speaking ?? "";
    document.getElementById("editMatematika").value = data.matematika ?? "";

    Swal.close();
    const modal = document.getElementById("modalEditNilai");
    modal.classList.remove("hidden");
    requestAnimationFrame(() => modal.classList.add("show"));
  }
});

// Simpan Edit Nilai
document
  .getElementById("btnSimpanEditNilai")
  .addEventListener("click", async () => {
    if (!editNilaiId) return;

    const updated = {
      reading: parseInt(document.getElementById("editReading")?.value) || null,
      listening:
        parseInt(document.getElementById("editListening")?.value) || null,
      writing: parseInt(document.getElementById("editWriting")?.value) || null,
      speaking:
        parseInt(document.getElementById("editSpeaking")?.value) || null,
      matematika:
        parseInt(document.getElementById("editMatematika")?.value) || null,
    };

    Swal.fire({
      title: "Menyimpan...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      await setDoc(doc(db, "nilai", editNilaiId), updated, { merge: true });

      // ✅ Update nilaiCache lokal
      const index = nilaiCache.findIndex((item) => item.id === editNilaiId);
      if (index !== -1) {
        nilaiCache[index] = { ...nilaiCache[index], ...updated };
      }

      Swal.fire({
        icon: "success",
        title: "✅ Berhasil",
        text: "Data nilai berhasil diperbarui.",
        timer: 1500,
        showConfirmButton: false,
      });

      editNilaiId = null;
      document.getElementById("modalEditNilai").classList.remove("show");
      setTimeout(() => {
        document.getElementById("modalEditNilai").classList.add("hidden");
      }, 300);

      // ✅ render ulang langsung dari cache
      renderNilaiMuridPage(nilaiCache, currentPageNilai);
    } catch (error) {
      console.error("❌ Error saat menyimpan nilai:", error);
      Swal.fire("❌ Gagal", "Terjadi kesalahan saat menyimpan.", "error");
    }
  });

// ✅ Batal
btnBatalEditNilai.addEventListener("click", () => {
  const modal = document.getElementById("modalEditNilai");
  modal.classList.remove("show");
  setTimeout(() => modal.classList.add("hidden"), 300);
  editNilaiId = null;
});

// Hapus Nilai
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-delete-nilai")) {
    const id = e.target.dataset.id;
    const nama = e.target.dataset.nama;

    const konfirmasi = await Swal.fire({
      icon: "warning",
      title: `Hapus Nilai?`,
      text: `Yakin ingin menghapus nilai murid "${nama}"?`,
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    });

    if (!konfirmasi.isConfirmed) return;

    Swal.fire({
      title: "Menghapus data...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      await deleteDoc(doc(db, "nilai", id));

      // Update nilaiCache secara langsung
      // Update nilaiCache secara langsung
      nilaiCache = nilaiCache.filter((item) => item.id !== id); // Hapus nilai dari cache

      Swal.fire("✅ Berhasil", "Data nilai berhasil dihapus.", "success");

      // Render ulang daftar nilai murid
      loadDataNilaiMurid(); // Memanggil fungsi untuk memuat data nilai murid
    } catch (err) {
      console.error(err);
      Swal.fire("❌ Gagal", "Gagal menghapus data.", "error");
    }
  }
});

// ✅ Pindah Halaman
window.changePageNilai = function (page) {
  currentPageNilai = page;
  renderNilaiMuridPage(nilaiCache, currentPageNilai);
};

window.changePage = function (page) {
  currentPage = page;
  renderMuridTablePage(daftarMuridCache, currentPage);
};

function isiOpsiNilaiSelect() {
  const nilaiOptions = [
    "",
    0,
    40,
    45,
    50,
    55,
    60,
    65,
    70,
    75,
    80,
    85,
    90,
    95,
    100,
  ];
  [
    "editReading",
    "editListening",
    "editWriting",
    "editSpeaking",
    "editMatematika",
  ].forEach((id) => {
    const select = document.getElementById(id);
    select.innerHTML = "";

    // Tambah nilai yang ada di cache jika belum masuk daftar option
    const nilaiUnik = new Set(nilaiOptions);
    nilaiCache.forEach((item) => {
      const key = id.replace("edit", "").toLowerCase();
      const nilai = item[key];
      if (nilai !== undefined && nilai !== null && !nilaiUnik.has(nilai)) {
        nilaiUnik.add(nilai);
      }
    });

    // Urutkan dan masukkan ke option
    Array.from(nilaiUnik)
      .sort((a, b) => (a === "" ? -1 : a - b))
      .forEach((val) => {
        const option = document.createElement("option");
        option.value = val;
        option.textContent = val === "" ? id.replace("edit", "") : val;
        select.appendChild(option);
      });
  });
}

document
  .getElementById("exportNilaiInggrisKGM")
  .addEventListener("click", () => {
    filterAndExportNilaiInggirsByCabang("KGM");
  });

document
  .getElementById("exportNilaiInggrisKLT")
  .addEventListener("click", () => {
    filterAndExportNilaiInggirsByCabang("KLT");
  });

document.getElementById("exportNilaiMatKGM").addEventListener("click", () => {
  filterAndExportNilaiMatematikaByCabang("KGM");
});

document.getElementById("exportNilaiMatKLT").addEventListener("click", () => {
  filterAndExportNilaiMatematikaByCabang("KLT");
});

window.addEventListener("DOMContentLoaded", async () => {
  await loadCaches(); // ✅ Ambil semua data murid dan nilai sekali saja
  tampilkanMurid(); // ✅ Render daftar murid
  renderNilaiMuridPage(nilaiCache, currentPageNilai); // ✅ Render nilai dari cache
  isiOpsiNilaiSelect();
  initInputCari(); // ⬅️ tambahkan ini di sini
  generateWritingInputs(); // panggil saat halaman load
});
