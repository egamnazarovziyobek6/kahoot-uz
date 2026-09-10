# Kahoot UZ 🇺🇿

**O'yin orqali o'rganish platformasi** — Kahoot!ning o'zbekcha, milliy uslubdagi varianti.
Jonli viktorinalar, o'zbekcha tayyor to'plamlar va milliy do'ppi kiygan quvnoq qahramonlar bilan.

Dizayn tili: Samarqand koshinlari (feruza), suzana kashtasi, anor va 8 qirrali girih yulduzi motivlari.

---

## 📦 Loyiha tuzilishi

```
kahoot uz/
├── client/          # Frontend — React + Vite + Tailwind v4 + Motion
│   ├── src/
│   │   ├── components/
│   │   │   ├── mascots/     # Mascot.jsx — parametrik SVG qahramon (do'ppi bilan)
│   │   │   ├── decor/       # Naqsh, 8 qirrali yulduz, anor, bayroq, suzana fon
│   │   │   └── create/      # Test muharriri: QuestionRail, QuestionEditor,
│   │   │                    #   AnswerTile, SettingsDrawer, PreviewModal
│   │   ├── pages/           # Landing.jsx, Create.jsx (/yaratish), MyQuizzes.jsx (/testlarim)
│   │   ├── lib/             # characters.js, motion.js, quiz.js (model), quizStore.js (localStorage)
│   │   └── index.css        # dizayn tizimi: ranglar, shriftlar, tugmalar, forma klasslari
│   └── ...
└── server/          # Backend negizi — Express 5 + Socket.IO (jonli o'yin)
    └── src/
        ├── index.js        # socket hodisalari: host:create, player:join, lobby:update
        └── rooms.js        # xotiradagi o'yin xonalari + PIN generatori
```

---

## 🚀 Ishga tushirish

Talab: **Node.js 20+**

```bash
# 1. Barcha bog'liqliklarni o'rnatish
npm run install:all

# 2. Frontend (http://localhost:5173)
npm run dev:client

# 3. (ixtiyoriy) Jonli o'yin serveri (http://localhost:4000)
npm run dev:server
```

Client Vite proxy `/socket.io` va `/api` so'rovlarini `localhost:4000` serverga yo'naltiradi.

Ishlab chiqarish uchun frontend build:

```bash
npm run build        # natija: client/dist/
```

---

## ✅ Hozir tayyor

- **Bosh sahifa (landing)** — to'liq responsiv, animatsiyali:
  - Navbar (mobil menyu bilan), Hero + PIN kiritish kartasi
  - "Nega Kahoot UZ?" imkoniyatlar bo'limi
  - Qahramonlar galereyasi (Anora, Bobur, Gulnoza, Sardor)
  - "Uch qadamda o'yin" yo'riqnomasi
  - Tayyor viktorinalar vitrinasi
  - CTA banner + Footer
- **Test yaratish ekrani** (`/yaratish`) — o'qituvchi to'liq viktorina tuzadi:
  - 4 xil savol turi: Viktorina, Ko'p javobli, To'g'ri/Noto'g'ri, Yozma javob
  - Har savolda: matn, ixtiyoriy rasm, 2–4 rangli javob, to'g'ri javob(lar), vaqt (5–120s), ball (oddiy / 2× / ballsiz)
  - Chap panelda savollarni qo'shish, nusxa olish, tartiblash, o'chirish
  - "Sozlamalar" oynasi: nomi, tavsif, fan, sinf, mavzu rangi, muqova, ko'rinish
  - "Ko'rib chiqish" — savolni o'quvchi ko'zi bilan ko'rish
  - Avtomatik saqlash (localStorage) + tugallanmagan savollar belgisi
- **Testlarim ekrani** (`/testlarim`) — saqlangan testlar ro'yxati, tahrirlash / nusxa / o'chirish. Birinchi kirishda namuna "O'zbekiston tarixi" testi qo'shiladi.
- **Qahramon tizimi** — `Mascot` komponenti: rang, do'ppi rangi, aksent va poza (`idle`/`wave`/`cheer`) orqali sozlanadi.
- **Dizayn tizimi** — `index.css` da milliy rang palitrasi va qayta ishlatiladigan `btn`, `card`, `section`, `field`, `chip` klasslari.
- `prefers-reduced-motion` hurmat qilinadi.
- **Server negizi** — xona yaratish, PIN bilan qo'shilish, lobby ro'yxati.

## 🔜 Keyingi bosqichlar

| Bosqich | Tavsif |
|---|---|
| Host ekrani | Lobby (qo'shilgan o'yinchilar), savolni ko'rsatish, taymer, natijalar |
| O'yinchi ekrani | Qahramon tanlash, 4 rangli javob tugmalari, ball va reyting |
| Server o'yin sikli | `question:show` → `answer:submit` → `question:result` → `game:leaderboard` |
| Ma'lumotlar bazasi | PostgreSQL/Prisma yoki Firebase — viktorinalar va natijalarni saqlash |
| Autentifikatsiya | O'qituvchi hisoblari |
| Tayyor kontent | O'zbekiston tarixi, geografiya, Navoiy ijodi, tabiat/fan to'plamlari |

---

## 🎨 Rang palitrasi

| Nom | HEX | Qo'llanilishi |
|---|---|---|
| `samarkand` | `#0E7C9D` | asosiy feruza, tugmalar |
| `saffron` | `#F5A623` | urg'u, naqsh |
| `anor` | `#E24A3B` | asosiy CTA, Anora |
| `chaman` | `#1B7A4B` | yashil aksent, Sardor |
| `indigo-uz` | `#2B3A8C` | to'q ko'k detallar |
| `cream` | `#FBF3E4` | fon |
| `ink` | `#22304A` | matn |

## 🧩 Qahramonlar

| Qahramon | Rang | Fe'l-atvori |
|---|---|---|
| **Anora** | Anor qizil | Bilimlar malikasi — shaxdam javob beradi |
| **Bobur** | Feruza | Sarkarda — strategiya va ball ustasi |
| **Gulnoza** | Za'faron | Suzana chizuvchisi — chalkash savollarni yechadi |
| **Sardor** | Chaman yashil | Jamoa boshlig'i — doim yordam beradi |
