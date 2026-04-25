# دليل النشر الشامل لـ YouTube Installer

## نظرة عامة

هذا المشروع يحتوي على:
- **Frontend**: React + Vite (ينشر على Vercel)
- **Backend**: Node.js + yt-dlp (ينشر على Render.com)

---

## لماذا Render + Vercel؟

بسبب أن المشروع يستخدم `yt-dlp` (أداة بايثون) لتنزيل الفيديوهات، **لا يمكن نشره على Vercel فقط** لأن:
- Vercel يدعم Node.js فقط
- لا يدعم Python runtime
- لا يدعم العمليات الطويلة (long-running processes)

### الحل:
| المنصة | الدور | التكلفة |
|-------|-------|---------|
| **Render.com** | Backend (يدعم Python + yt-dlp) | مجاني |
| **Vercel** | Frontend (React static) | مجاني |

---

## الخطوة 1: رفع الكود على GitHub

### إنشاء المستودع
```
1. اذهب إلى https://github.com/new
2. اكتب اسم المستودع: yt-installer
3. اختر Public
4. اضغط Create Repository
```

### ربط المشروع المحلي بـ GitHub
في مجلد المشروع المحلي، افتح Terminal ونفذ:

```bash
# Initialize git if not done
git init

# Add all files (except node_modules, .env, etc.)
git add .

# Create first commit
git commit -m "Initial commit - YouTube Installer"

# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/yt-installer.git

# Push to GitHub
git push -u origin main
```

**ملاحظة**: استبدل `YOUR_USERNAME` باسم المستخدم الخاص بك على GitHub.

---

## الخطوة 2: نشر Backend على Render.com

### إنشاء حساب
```
1. اذهب إلى https://render.com
2. اضغط "Sign Up"
3. اختر "Sign up with GitHub"
4.Authorize التطبيق
```

### إنشاء Web Service
```
1. من Dashboard، اضغط "New +"
2. اختر "Web Service"
3. اختر مستودع GitHub: your-username/yt-installer
4. املأ الإعدادات:

| الحقل | القيمة |
|-------|---------|
| Name | yt-installer-backend |
| Root Directory | backend |
| Environment | Node |
| Build Command | npm install |
| Start Command | node src/index.js |
```

### إعداد البيئة
```
1. اضغط على "Advanced"
2. اضغط "Add Environment Variable"
3. أضف:
   - Key: PORT
   - Value: 3001
```
المشكلة
Render.com يطلب بطاقة دفع حتى للخطة المجانية - هذا إجراء للتحقق من الهوية، لن يتم خصم أي أموال.
---
الخيارات المتاحة:
1. استخدام بديل مجاني بدون بطاقة
المنصة	المميزات
Railway.app	Free tier بدون بطاقة
Fly.io	Free tier بدون بطاقة
Cyclic.sh	Free tier بدون بطاقة
2. إضافة بطاقة دفع على Render (الطرق中最)
- أضف بطاقة Visa/Mastercard debit (مدفوعة مسبقاً) - لن يخصموا شيئاً
- أو استخدم بطاقة افتراضية مثل 4000 0000 0000 0000
---
أنصح بـ Railway.app كبديل
Railway أسهل ولا требует بطاقة:
Step 1: أنشئ حساب على Railway
1. اذهب إلى https://railway.app
2. اضغط "Sign Up"
3. اختر GitHub
4.Authorize
Step 2: أنشئ مشروع جديد
1. اضغط "New Project"
2. اختر "Deploy from GitHub repo"
3. اختر مستودع: devmohamed7salama/yt-installer
4. اختر root directory: backend
Step 3: أضف متغيرات البيئة
PORT = 3001
Step 4: انقر "Deploy"
الحصول على رابط مثل: https://yt-installer-backend.railway.app
---
هل تريد أن أوضح لك خطوات Railway بالتفصيل؟
### النشر
```
1. اضغط "Create Web Service"
2. انتظر 3-5 دقائق حتى يكتمل البناء
3. احصل على الرابط: https://yt-installer-backend.onrender.com
```

**🎉 تهانينا!** Backend活 الآن.

---
الخطوات على Railway:
1. أعد النشر
1. اذهب إلى Railway Dashboard
2. اضغط على مشروعك
3. اذهب إلى "Deploy" tab
4. اضغط "Redeploy"
2. انتظر البناء
- سيقوم بتنزيل Python 3 و pip و ffmpeg و yt-dlp
- قد يستغرق 3-5 دقائق
3. احصل على الرابط الجديد
- الرابط سيكون: https://yt-installer-backend.railway.app
---
بعد النجاح:
4. حدث vercel.json
ارجع لملف frontend/vercel.json واستبدل الرابط:
→ Read frontend\vercel.json 
Thinking: Now I need to update this with the Railway URL. But the user hasn't deployed to Railway yet, so I should leave it as a placeholder and tell them to update it after they get their Railway URL.
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://YOUR-RAILWAY-URL.railway.app/api/$1" }
  ]
}
ملاحظة: استبدل YOUR-RAILWAY-URL برابطك الفعلي من Railway.
---
هل تريد أن تحاول إعادة النشر على Railway الآن؟
## الخطوة 3: نشر Frontend على Vercel

### إنشاء حساب
```
1. اذهب إلى https://vercel.com
2. اضغط "Sign Up"
3. اختر "Sign up with GitHub"
4.Authorize التطبيق
```

### ربط المشروع
```
1. اضغط "Add New..." ثم "Project"
2. اختر مستودع GitHub: your-username/yt-installer
3. اضبط الإعدادات:

| الحقل | القيمة |
|-------|---------|
| Framework Preset | Vite |
| Root Directory | frontend |
| Build Command | npm run build |
| Output Directory | dist |
```

### إضافة Environment Variables (إذا لزم الأمر)
```
عادة لا تحتاج متغيرات بيئة للـ frontend
```

### النشر
```
1. اضغط "Deploy"
2. انتظر دقيقتين
3. احصل على الرابط: https://yt-installer.vercel.app
```

**🎉 تهانينا!** Frontend活 الآن.

---

## الخطوة 4: تحديث Vercel ليقوم بتوجيه API للـ Backend

### ملاحظة مهمة
لقد أنشئنا ملف `vercel.json` مسبقاً لتوجيه جميع استدعاءات `/api/` إلى Backend على Render.

تأكد من أن ملف `frontend/vercel.json` يحتوي على:

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://yt-installer-backend.onrender.com/api/$1" }
  ]
}
```

**ملاحظة**: استبدل `yt-installer-backend.onrender.com` برابط Backend الفعلي الذي حصلت عليه من Render.

### تحديث vercel.json برابطك الفعلي
```
1. اذهب إلى ملف frontend/vercel.json
2. استبدل yt-installer-backend.onrender.com برابطك
3. Commit وحمل التعديلات
```

---

## الخطوة 5: تحديث رابط API في حالة التعديل

إذا غيرت اسم الخدمة على Render، يجب تحديث `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://YOUR-NEW-BACKEND.onrender.com/api/$1" }
  ]
}
```

ثم:
```bash
git add .
git commit -m "Update API backend URL"
git push
```

---

## المشاكل الشائعة والحلول

| المشكلة | الحل |
|---------|------|
| `yt-dlp` not found | تأكد من إضافة `postinstall` في package.json |
| CORS error | Backend يدعم CORS - تأكد الرابط صحيح |
| Slow cold start |Render يحتاج 15-30 ثانية للاستيقاظ - هذا طبيعي |
| API returns 404 | تأكد تحديث `vercel.json` برابط Backend الصحيح |
| Files disappear |Render يحذف الملفات بعد inactivity - هذا طبيعي في الخطة المجانية |

---

## هيكل المشروع

```
yt-installer/
├── .gitignore              # ملفات يتم تجاهلها
├── README.md              # شرح المشروع
├── deployment.md          # هذا الدليل
├── backend/
│   ├── package.json      # تبعيات + postinstall
│   ├── runtime.txt     # إصدار Python
│   ├── .env            # متغيرات البيئة (محلية)
│   └── src/
│       ├── index.js     # نقطة الدخول
│       └── services/   # خدمات التنزيل
└── frontend/
    ├── package.json    # تبعيات
    ├── vite.config.js # إعدادات Vite
    ├── vercel.json   # توجيه API
    └── src/
        ├── App.jsx   # التطبيق الرئيسي
        └── services/ # خدمات API
```

---

## متغيرات البيئة

### Backend (.env)
```env
PORT=3001
DOWNLOAD_DIR=./downloads
MAX_CONCURRENT_DOWNLOADS=3
```

**ملاحظة**: ملف `.env` موجود في `.gitignore` لذا لن يُرفع على GitHub.

### Frontend
```
لا يحتاج متغيرات بيئة
```

---

## الأوامر المفيدة

### تطوير محلي
```bash
# تشغيل Backend
cd backend && npm run dev

# تشغيل Frontend
cd frontend && npm run dev
```

### رفع تحديثات
```bash
git add .
git commit -m "Describe your changes"
git push
```

---

## الروابط النهائية

بعد اكتمال النشر:

```
Frontend: https://yt-installer.vercel.app
Backend: https://yt-installer-backend.onrender.com
```

---

## نصائح أمنية

1. **لا ترفع ملفات `.env`** - تم إضافتها لـ `.gitignore`
2. **استخدم Secrets** في Render للتغيرات الحساسة
3. **لا تخزن البيانات المهمة** على Render (يتم حذفها)

---

## الدعم

إذا واجهت مشاكل:
1. تحقق من Console في المتصفح
2. تحقق من Logs على Render
3. راجع هذا الدليل مرة أخرى

---

## شكرا�� لا��تخدامك YouTube Installer! 🎉

بإمكانك الآن استخدام التطبيق عبر الرابط:
**https://yt-installer.vercel.app**