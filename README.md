# PDA Simulator — Pushdown Automaton

> Program simulator Pushdown Automaton (PDA) interaktif berbasis web untuk mengotomasi dan menguji keanggotaan string pada mesin PDA.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

---

## 📋 Deskripsi

PDA Simulator adalah aplikasi web yang memungkinkan pengguna untuk:
- Mendefinisikan mesin PDA secara lengkap (7-tuple)
- Menginputkan string dan menguji keanggotaannya (**Accepted** / **Rejected**)
- Melihat jejak eksekusi langkah demi langkah
- Memvisualisasikan kondisi stack secara real-time

## ✨ Fitur

| Fitur | Keterangan |
|-------|------------|
| **Definisi PDA Lengkap** | Input states (Q), alfabet input (Σ), alfabet stack (Γ), fungsi transisi (δ), state awal (q₀), simbol awal stack (Z₀), dan state penerima (F) |
| **Nondeterministic PDA** | Engine mendukung PDA nondeterministik menggunakan BFS untuk mengeksplorasi semua jalur komputasi |
| **3 Mode Penerimaan** | Final State, Empty Stack, atau keduanya |
| **Jejak Eksekusi** | Tabel trace lengkap dengan navigasi step-by-step dan fitur auto-play |
| **Visualisasi Stack** | Tampilan visual stack real-time per langkah eksekusi |
| **Pengujian Batch** | Uji banyak string sekaligus dalam satu kali klik |
| **Contoh PDA Bawaan** | 5 contoh PDA siap pakai: aⁿbⁿ, palindrom, aⁿb²ⁿ, balanced parentheses, aⁱbʲcᵏ |
| **Definisi Formal** | Tampilan otomatis 7-tuple M = (Q, Σ, Γ, δ, q₀, Z₀, F) |
| **UI Modern** | Dark theme, glassmorphism, gradient, micro-animations, responsive |

## 🚀 Cara Menjalankan

### Opsi 1: Dengan Python (Recommended)

```bash
git clone https://github.com/Shadow2j/Tugas-Praktikum-3-Otomata.git
cd Tugas-Praktikum-3-Otomata
python -m http.server 3000
```
Buka browser di `http://localhost:3000`

### Opsi 2: Dengan Node.js

```bash
git clone https://github.com/Shadow2j/Tugas-Praktikum-3-Otomata.git
cd Tugas-Praktikum-3-Otomata
npm run dev
```
Aplikasi akan terbuka otomatis di browser pada `http://localhost:3000`

### Opsi 3: Langsung Buka File

Cukup buka file `index.html` langsung di browser (double-click).

---

## 📤 Upload ke GitHub

```bash
cd Tugas-Praktikum-3-Otomata
git init
git add .
git commit -m "Initial commit: PDA Simulator"
git branch -M main
git remote add origin https://github.com/Shadow2j/Tugas-Praktikum-3-Otomata.git
git push -u origin main
```

## 📖 Cara Menggunakan

1. **Definisikan PDA**
   - Masukkan daftar states, alfabet input, dan alfabet stack (pisahkan dengan koma)
   - Pilih state awal dan simbol awal stack
   - Centang state-state penerima
   - Pilih mode penerimaan (Final State / Empty Stack / Keduanya)

2. **Tambahkan Fungsi Transisi**
   - Klik tombol **Tambah** untuk menambahkan baris transisi
   - Format: `δ(state, input, stackTop) = (nextState, pushStack)`
   - Gunakan `ε` untuk transisi epsilon (tanpa membaca input)
   - Gunakan `ε` pada Push Stack untuk melakukan pop tanpa push

3. **Uji String**
   - Masukkan string pada kolom input
   - Klik **Jalankan** untuk melihat hasil (Accepted/Rejected)
   - Aktifkan mode langkah-langkah untuk melihat jejak eksekusi detail

4. **Pengujian Batch**
   - Masukkan beberapa string (satu per baris)
   - Klik **Jalankan Semua** untuk menguji semua string sekaligus

5. **Contoh PDA**
   - Klik tombol **Contoh** untuk memuat contoh PDA yang sudah tersedia

## 🏗️ Struktur Proyek

```
├── index.html          # Halaman utama aplikasi
├── style.css           # Stylesheet (dark theme + glassmorphism)
├── pda-engine.js       # Core PDA engine (validasi, eksekusi, BFS)
├── app.js              # UI controller & interaksi pengguna
├── package.json        # Konfigurasi npm
├── .gitignore          # Git ignore rules
└── README.md           # Dokumentasi
```

## 🧠 Konsep PDA

Pushdown Automaton (PDA) didefinisikan sebagai **7-tuple**:

**M = (Q, Σ, Γ, δ, q₀, Z₀, F)**

| Simbol | Keterangan |
|--------|------------|
| Q | Himpunan state |
| Σ | Alfabet input |
| Γ | Alfabet stack |
| δ | Fungsi transisi: Q × (Σ ∪ {ε}) × Γ → Q × Γ* |
| q₀ | State awal |
| Z₀ | Simbol awal stack |
| F | Himpunan state penerima |

## 📄 Lisensi

MIT License
