# Kahoot UZ 🇺🇿

**Ingliz tili darslari uchun o'yin platformasi** — Kahoot!ning o'zbekcha, milliy uslubdagi varianti.
O'qituvchi Google/Telegram orqali kiradi, test yaratadi (qo'lda yoki Gemini AI bilan), o'quvchi esa
faqat PIN kod bilan qo'shiladi. Natijalar (to'g'ri javob, ball, reyting) faqat o'yin **oxirida** ochiladi.

Dizayn tili: Samarqand koshinlari (feruza), suzana kashtasi, anor va 8 qirrali girih yulduzi motivlari.
Sayt pastida va bosh sahifada **"ZIYOBEK TEAM tomonidan yaratildi"** yozuvi bor.

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
│   │   │                    #   AnswerTile, SettingsDrawer, PreviewModal, GenerateModal (Gemini)
│   │   ├── pages/           # Landing, Login, Create (/yaratish), MyQuizzes (/testlarim),
│   │   │                    #   Host (/host/:pin), Play (/o'yin/:pin)
│   │   ├── lib/             # characters.js, motion.js, quiz.js (model), quizStore.js (server API),
│   │   │                    #   api.js (fetch wrapper), socket.js (Socket.IO), AuthContext.jsx
│   │   └── index.css        # dizayn tizimi: ranglar, shriftlar, tugmalar, forma klasslari
│   └── ...
└── server/          # Backend — Express 5 + Socket.IO + SQLite (better-sqlite3)
    └── src/
        ├── index.js        # HTTP + Socket.IO: o'yin state machine (question:show → answer:submit → game:ended)
        ├── auth.js         # Google OAuth + Telegram Login Widget + JWT cookie sessiyasi
        ├── teachers.js     # O'qituvchi hisoblari (+ har biriga namuna test)
        ├── quizzes.js      # Test CRUD API (/api/quizzes) — teacher_id bo'yicha ajratilgan
        ├── db.js           # SQLite ulanishi va sxema (server/data/kahoot.sqlite)
        ├── rooms.js        # Xotiradagi o'yin xonalari + PIN generatori
        ├── gameLogic.js    # Javobni tekshirish, ball hisoblash — to'g'ri javob hech qachon oldindan chiqmaydi
        └── ai/
            ├── gemini.js   # Gemini SDK chaqiruvlari (tekshirish + generatsiya)
            └── router.js   # /api/ai/check-question, /api/ai/generate-questions
```

---

## 🚀 Ishga tushirish

Talab: **Node.js 20+**

```bash
# 1. Barcha bog'liqliklarni o'rnatish
npm run install:all

# 2. server/.env.example'ni server/.env qilib nusxalang va sozlang (pastga qarang)

# 3. Frontend (http://localhost:5173)
npm run dev:client

# 4. Jonli o'yin serveri (http://localhost:4000) — endi shart, faqat ixtiyoriy emas
npm run dev:server
```

Client Vite proxy `/socket.io` va `/api` so'rovlarini `localhost:4000` serverga yo'naltiradi.

Ishlab chiqarish uchun frontend build:

```bash
npm run build        # natija: client/dist/
```

### 🔑 Kerakli kalitlar (`server/.env`)

`server/.env.example`ni nusxalab, quyidagilarni to'ldiring:

| Kalit | Qayerdan olinadi |
|---|---|
| `GOOGLE_CLIENT_ID` / `SECRET` | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → OAuth client ID → redirect URI: `http://localhost:5173/api/auth/google/callback` |
| `TELEGRAM_BOT_TOKEN` / `USERNAME` | @BotFather → `/newbot`, keyin `/setdomain` bilan haqiqiy domen ko'rsating (Telegram Login Widget `localhost`da ishlamaydi — deploy qilingan domen yoki tunnel kerak) |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/apikey) |

Kalitlar tayyor bo'lmaguncha `ALLOW_DEV_LOGIN=true` qoldiring — `/login` sahifasida "Sinov sifatida
kirish" tugmasi orqali auth'siz sinab ko'rish mumkin. **Productionda buni albatta `false` qiling.**

---

## 🌍 Production'ga chiqarish

Frontend (`client/`) va backend (`server/`) **ikki alohida joyga** deploy qilinadi — Netlify/Cloudflare
Pages statik fayllar uchun, Socket.IO+SQLite server esa doimiy Node jarayonini talab qiladi.

### 1. Backend → Render

1. [render.com](https://render.com)da hisob oching, GitHub repongizni ulang.
2. "New +" → "Blueprint" → shu repo'ni tanlang — Render root papkadagi [render.yaml](render.yaml) ni
   avtomatik o'qib, `server/` uchun web xizmat yaratadi.
3. Render dashboard'da (`sync: false` bo'lgan) maxfiy kalitlarni qo'lda kiriting: `CLIENT_ORIGIN`
   (keyingi qadamdagi Cloudflare Pages manzili), `GOOGLE_CLIENT_ID/SECRET`, `GOOGLE_CALLBACK_URL`
   (`https://<render-manzil>.onrender.com/api/auth/google/callback`), `TELEGRAM_BOT_TOKEN/USERNAME`,
   `GEMINI_API_KEY`.
4. ⚠️ **Free tarifda disk vaqtinchalik** — har deploy/uyqudan uyg'onishda `kahoot.sqlite` tozalanadi
   (o'qituvchilar va testlar o'chib ketadi). Real foydalanuvchilar uchun pullik tarifga o'tib
   "Persistent Disk" qo'shish kerak bo'ladi.

### 2. Frontend → Cloudflare Pages

1. Cloudflare Pages loyihasi sozlamalarida **Environment variables**ga qo'shing:
   `VITE_API_URL` = Render'dan olingan backend manzili (masalan `https://kahoot-uz-server.onrender.com`,
   oxirida `/` siz).
2. Build command: `npm run build` (yoki mavjud `client/wrangler.toml`dagi sozlama), output: `client/dist`.

### 3. Google / Telegram sozlamalarini yangilash

- Google Cloud Console → OAuth client → **Authorized JavaScript origins**ga Cloudflare Pages manzilini,
  **Authorized redirect URIs**ga `https://<render-manzil>.onrender.com/api/auth/google/callback`ni qo'shing
  (localhost qatorlarini o'chirish shart emas — ikkalasi baravar tura oladi).
- Telegram: @BotFather → botingiz → `/setdomain` → Cloudflare Pages domeningizni ko'rsating.

---

## ✅ Hozir tayyor

- **Autentifikatsiya** — o'qituvchi Google yoki Telegram orqali kiradi (JWT httpOnly cookie);
  o'quvchi hech qanday ro'yxatdan o'tmaydi, faqat PIN kiritadi.
- **Bosh sahifa (landing)** — Ingliz tili darslariga qaratilgan matn, "ZIYOBEK TEAM" belgisi, animatsiyalar.
- **Test yaratish ekrani** (`/yaratish`) — 4 xil savol turi, Gemini bilan tekshirish/yaratish, sozlamalar,
  ko'rib chiqish, endi server API'ga saqlanadi (o'qituvchi hisobiga bog'langan).
- **Testlarim ekrani** (`/testlarim`) — testlar ro'yxati + "O'yinni boshlash" tugmasi. Har yangi o'qituvchi
  uchun namuna "Present Simple — asoslari" testi avtomatik yaratiladi.
- **Jonli o'yin** — Host (`/host/:pin`) va Play (`/o'yin/:pin`) ekranlari: PIN, lobby, savol-javob sikli
  server tomonidan boshqariladi. **Natijalar (to'g'ri javob, ball, reyting) faqat o'yin oxirida** ochiladi —
  o'yin davomida hech qanday to'g'ri/noto'g'ri belgisi ko'rsatilmaydi.
- **Gemini AI** — o'qituvchi qo'lda yozgan savolni Gemini tekshiradi (grammatika, mantiq, to'g'ri javob
  mosligi); yoki mavzu bo'yicha savollarni Gemini yaratadi va o'zi qayta tekshirib beradi.
- **Qahramon tizimi** — `Mascot` komponenti: rang, do'ppi rangi, aksent va poza orqali sozlanadi.
- **Dizayn tizimi** — milliy rang palitrasi, qayta ishlatiladigan klasslar, `prefers-reduced-motion` hurmati.

## 🔜 Keyingi bosqichlar

| Bosqich | Tavsif |
|---|---|
| Production hosting | Node/Socket.IO serverini Render/Railway/Fly.io kabi doimiy serverga joylash (Netlify/Cloudflare Pages statik fayllar uchun, bu server uchun emas) |
| SQLite → boshqa DB | Ko'p nusxali (replika) hostingda SQLite fayli yetarli bo'lmasligi mumkin — kerak bo'lsa Postgres'ga o'tish |
| O'yin tarixi | O'tgan o'yinlar natijasini saqlash va o'qituvchiga statistikani ko'rsatish |
| Tayyor kontent kutubxonasi | Har xil Ingliz tili mavzulari bo'yicha tayyor testlar to'plami |

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
