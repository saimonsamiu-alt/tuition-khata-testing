// ============================================================================
// auth.js -- part of the পরীক্ষার খাতা frontend, split out of the original
// single inline <script> in index.html for readability. Loaded via plain
// <script src="js/auth.js"> tags (in the order listed in index.html), which
// all share one global scope in the browser -- exactly like the original
// single script did, so nothing about how functions call each other changes.
// ============================================================================

// ================= STUDENT AUTHENTICATION (Login / Registration with Unique Code) =================
let studentAuthTab = 'login';
function renderStudentAuth(){
  const isLogin = studentAuthTab === 'login';
  app.innerHTML = `
    ${header('শিক্ষার্থী প্রবেশ')}
    <div class="card" style="padding: 24px 20px;">
      <div class="tab-group">
        <button class="tab-btn ${isLogin?'active':''}" onclick="studentAuthTab='login'; renderStudentAuth();">🔑 লগইন করো</button>
        <button class="tab-btn ${!isLogin?'active':''}" onclick="studentAuthTab='register'; renderStudentAuth();">✨ নতুন একাউন্ট</button>
      </div>

      ${isLogin ? `
        <h2>শিক্ষার্থী লগইন</h2>
        <p class="hint">পূর্বে তৈরি করা নাম/ইউজারনেম ও পাসওয়ার্ড দিয়ে প্রবেশ করো।</p>
        <label class="field-label">ইউজারনেম / ডাকনাম</label>
        <input type="text" id="studLoginSlug" placeholder="যেমন: rahim বা shuvo24" onkeydown="if(event.key==='Enter') submitStudentLogin()">
        <label class="field-label">পাসওয়ার্ড</label>
        <input type="password" id="studLoginPass" placeholder="তোমার গোপন পাসওয়ার্ড" onkeydown="if(event.key==='Enter') submitStudentLogin()">
        <button class="btn btn-primary btn-block" style="margin-top:6px;" onclick="submitStudentLogin()">🚀 লগইন করে ড্যাশবোর্ডে যাও</button>
        <p class="hint center" style="margin-top:16px;">প্রথমবার এসেছো? <a class="link-back" onclick="studentAuthTab='register'; renderStudentAuth();">শিক্ষকের কোড দিয়ে নতুন একাউন্ট খোলো</a></p>
      ` : `
        <h2>নতুন অ্যাকাউন্ট তৈরি</h2>
        <p class="hint">অ্যাকাউন্ট খোলার জন্য শিক্ষকের দেওয়া রেজিস্ট্রেশন কোড প্রদান করা বাধ্যতামূলক।</p>
        <label class="field-label">তোমার পুরো নাম</label>
        <input type="text" id="regFullName" placeholder="যেমন: মো: আব্দুর রহিম">
        <label class="field-label">ইউজারনেম / রোল (লগইনে লাগবে)</label>
        <input type="text" id="regSlug" placeholder="যেমন: rahim25">
        <label class="field-label">পাসওয়ার্ড</label>
        <input type="password" id="regPass" placeholder="কমপক্ষে ৪ সংখ্যার পাসওয়ার্ড">
        <label class="field-label">🔑 শিক্ষকের দেওয়া রেজিস্ট্রেশন কোড</label>
        <input type="text" id="regCodeInput" placeholder="যেমন: TUT-A89K2" style="text-transform:uppercase; font-family:var(--font-mono); font-weight:700; letter-spacing:1px;">
        <div style="background:#FEF6E8; border-radius:8px; padding:10px 12px; margin-bottom:14px; font-size:12.5px; color:#7B4F06; line-height:1.4;">
          ⚠️ <b>শিক্ষকের অনুমতি প্রয়োজন:</b> অ্যাকাউন্ট তৈরি করতে আপনার শিক্ষকের কাছ থেকে একটি ইউনিক কোড (যেমন: TUT-XXXXX) সংগ্রহ করুন।
        </div>
        <button class="btn btn-gold btn-block" onclick="submitStudentRegister()">🌟 অ্যাকাউন্ট তৈরি ও প্রবেশ</button>
        <p class="hint center" style="margin-top:16px;">ইতিমধ্যে অ্যাকাউন্ট আছে? <a class="link-back" onclick="studentAuthTab='login'; renderStudentAuth();">লগইন করো</a></p>
      `}
      <div class="center" style="margin-top:18px;"><a class="link-back" onclick="go('landing')">← ফিরে যাও</a></div>
    </div>
    ${creditFooter()}
  `;
}

window.submitStudentLogin = async function(){
  const slugInput = ((document.getElementById('studLoginSlug')||{}).value||'').trim();
  const passInput = ((document.getElementById('studLoginPass')||{}).value||'').trim();
  if(!slugInput || !passInput){ toast('ইউজারনেম ও পাসওয়ার্ড দুটোই দিন'); return; }
  const slug = slugify(slugInput);
  toast('যাচাই করা হচ্ছে...');
  const res = await postToScript('studentLogin', { slug, password: passInput });
  if(res && res.status === 'success'){
    setLoggedStudent({ slug: res.slug||slug, name: res.name||slugInput, studentCode: res.studentCode||'' });
    toast(`স্বাগতম, ${res.name||slug}!`);
    playSfx('combo');
    go('studentDashboard');
  } else if(res && res.message === 'wrong_password'){
    toast('❌ ভুল পাসওয়ার্ড! আবার চেষ্টা করুন');
    playSfx('wrong');
  } else if(res && res.message === 'not_registered'){
    toast('❌ এই ইউজারনেমে কোনো অ্যাকাউন্ট নেই! আগে সাইন আপ করুন');
    playSfx('wrong');
  } else {
    toast('লগইন ব্যর্থ হয়েছে! ইন্টারনেট কানেকশন চেক করুন');
  }
};

window.submitStudentRegister = async function(){
  const name = ((document.getElementById('regFullName')||{}).value||'').trim();
  const slugInput = ((document.getElementById('regSlug')||{}).value||'').trim();
  const pass = ((document.getElementById('regPass')||{}).value||'').trim();
  const regCode = ((document.getElementById('regCodeInput')||{}).value||'').trim().toUpperCase();

  if(!name || !slugInput || !pass || !regCode){
    toast('সবগুলো তথ্য এবং রেজিস্ট্রেশন কোড পূরণ করুন');
    return;
  }
  const slug = slugify(slugInput);
  toast('অ্যাকাউন্ট তৈরি হচ্ছে...');
  const res = await postToScript('studentSignUp', { name, slug, password: pass, regCode });
  if(res && res.status === 'success'){
    setLoggedStudent({ slug, name, studentCode: res.studentCode||'' });
    toast('🎉 অভিনন্দন! অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে');
    playSfx('victory');
    go('studentDashboard');
  } else if(res && res.message === 'missing_reg_code'){
    toast('❌ শিক্ষকের দেওয়া রেজিস্ট্রেশন কোড দিন');
    playSfx('wrong');
  } else if(res && res.message === 'invalid_reg_code'){
    toast('❌ রেজিস্ট্রেশন কোডটি সঠিক নয়! শিক্ষককে বলুন');
    playSfx('wrong');
  } else if(res && res.message === 'code_already_used'){
    toast('❌ এই কোডটি আগেই ব্যবহৃত হয়েছে! নতুন কোড নিন');
    playSfx('wrong');
  } else if(res && res.message === 'already_registered'){
    toast('❌ এই ইউজারনেমে আগেই একাউন্ট রয়েছে, লগইন করুন');
    playSfx('wrong');
  } else {
    toast('রেজিস্ট্রেশন ব্যর্থ হয়েছে! আবার চেষ্টা করুন');
  }
};

// ================= UNIFIED STUDENT DASHBOARD =================
window.__studentDashCache = null;
async function renderStudentDashboard(){
  const stud = getLoggedStudent();
  if(!stud){
    go('studentAuth');
    return;
  }
  const slug = stud.slug;

  if(!window.__studentDashCache || window.__studentDashCache.slug !== slug){
    app.innerHTML = `
      ${header('আমার ড্যাশবোর্ড')}
      <div class="card center" style="padding:40px 20px;">
        <div style="font-size:32px; animation: pulse 1s infinite;">⏳</div>
        <h3 style="margin-top:12px;">ড্যাশবোর্ড লোড হচ্ছে...</h3>
        <p class="hint">হাজিরা, পরীক্ষা ও প্রোগ্রেস ডাটা সংগ্রহ করা হচ্ছে</p>
      </div>
      ${creditFooter()}
    `;
    const res = await postToScript('getStudentDashboard', { slug });
    if(res && res.status === 'success'){
      if(res.couponBalance === null || res.couponBalance === undefined || !isFinite(Number(res.couponBalance))){
        const cb = await getCouponBalanceRemote(slug);
        res.couponBalance = cb.balance;
      }
      window.__studentDashCache = { ...res, slug };
    } else {
      window.__studentDashCache = {
        slug,
        studentName: stud.name,
        studentCode: stud.studentCode,
        todayAttended: false,
        todayStatus: 'none',
        couponBalance: 0,
        publicExams: [],
        recentResults: []
      };
    }
  }

  const d = window.__studentDashCache;
  const isPresentToday = d.todayAttended;
  const attStatus = d.todayStatus;
  const balance = Number(d.couponBalance || 0);

  let attWidgetHtml = '';
  if(isPresentToday && attStatus === 'approved'){
    attWidgetHtml = `
      <div style="background:#EBF7EE; border:1.5px solid #A3E0B5; border-radius:12px; padding:14px; display:flex; align-items:center; justify-content:space-between; gap:10px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="font-size:24px;">✅</div>
          <div>
            <div style="font-weight:700; color:var(--green); font-size:14.5px;">আজকের ক্লাসে উপস্থিত আছো!</div>
            <div style="font-size:12px; color:var(--pencil);">আজকের হাজিরা নেওয়া হয়েছে ✓</div>
          </div>
        </div>
        <button class="info-btn" onclick="openStudentAttendanceCalendar('${slug}', '${escapeHtml(d.studentName)}')">📅 ক্যালেন্ডার</button>
      </div>
    `;
  } else if(isPresentToday && attStatus === 'pending'){
    // [NEW] the teacher already marked today as a class day -> one tap from the student confirms it
    attWidgetHtml = `
      <div style="background:#FEF8EC; border:1.5px solid #F8DA9D; border-radius:12px; padding:14px; text-align:center;">
        <div style="font-size:24px;">📌</div>
        <div style="font-weight:700; color:#9B6A15; font-size:14.5px; margin:4px 0;">শিক্ষক আজকের ক্লাস মার্ক করেছেন</div>
        <p class="hint" style="margin-bottom:10px;">তুমি উপস্থিত থাকলে নিচের বোতাম চেপে নিশ্চিত করো</p>
        <button class="btn btn-gold btn-block" onclick="dashMarkTodayAttendance('${slug}')">✅ হ্যাঁ, আমি উপস্থিত ছিলাম</button>
        <div style="margin-top:8px;"><a class="link-back" style="font-size:12px;" onclick="openStudentAttendanceCalendar('${slug}', '${escapeHtml(d.studentName)}')">📅 ক্যালেন্ডার দেখো</a></div>
      </div>
    `;
  } else {
    attWidgetHtml = `
      <div style="background:#FCFDFE; border:1.5px dashed #D9A441; border-radius:12px; padding:16px; text-align:center;">
        <div style="font-size:26px; margin-bottom:4px;">📅</div>
        <div style="font-weight:700; color:var(--ink); font-size:15px; margin-bottom:4px;">আজকের ক্লাসে উপস্থিতি দেওয়া হয়নি</div>
        <p class="hint" style="margin-bottom:12px;">ক্লাসে উপস্থিত থাকলে এখনই নিচের বোতাম চাপো</p>
        <button class="btn btn-gold btn-block" onclick="dashMarkTodayAttendance('${slug}')">✨ আজকের উপস্থিতি নিশ্চিত করো</button>
        <div style="margin-top:8px;"><a class="link-back" style="font-size:12px;" onclick="openStudentAttendanceCalendar('${slug}', '${escapeHtml(d.studentName)}')">📅 পুরো মাসের ক্যালেন্ডার দেখো</a></div>
      </div>
    `;
  }

  if(FEATURE_CLASS_PLAN) attWidgetHtml += classSummaryHtml(d.classSummary); // [NEW] total classes this month, remaining / extra

  const examItems = (d.publicExams || []).map(ex => `
    <div class="exam-item" style="padding:12px 14px; margin-bottom:8px;">
      <div class="row-top">
        <div>
          <div style="font-weight:700; font-size:14.5px; color:var(--ink);">${escapeHtml(ex.title)}</div>
          <div class="meta">${escapeHtml(ex.subject)} · ${ex.qCount||0}টি প্রশ্ন · ${ex.duration} মিনিট</div>
        </div>
        <button class="btn btn-primary" style="padding:6px 14px; font-size:12.5px;" onclick="goPracticeEntry('${ex.code}')">শুরু করো</button>
      </div>
    </div>
  `).join('');

  app.innerHTML = `
    ${header('আমার ড্যাশবোর্ড')}

    <div class="pwa-banner pwa-install-banner" style="display:none;">
      <div class="pwa-banner-text">
        <strong>📲 অ্যাপটি ফোনে ইনস্টল করো</strong><br>
        <span style="opacity:0.85; font-size:12px;">হোম স্ক্রিন থেকে সরাসরি দ্রুত ওপেন ও অফলাইন পড়ার সুবিধা</span>
      </div>
      <button class="pwa-btn" onclick="installPwa()">ইনস্টল</button>
    </div>

    <!-- Hero Profile & Stats Card -->
    <div class="hero-card">
      <div class="hero-profile-row">
        <div style="display:flex; align-items:center; gap:12px;">
          <div class="hero-avatar">🧑‍🎓</div>
          <div>
            <div style="font-size:12.5px; color:rgba(255,255,255,0.75);">স্বাগতম, শিক্ষার্থী</div>
            <h2 style="color:#fff; margin:0; font-size:22px;">${escapeHtml(d.studentName || stud.name)}</h2>
            <div style="font-size:12px; margin-top:2px;">
              <span style="background:rgba(255,255,255,0.15); padding:2px 8px; border-radius:10px; font-family:var(--font-mono); font-weight:700; color:var(--gold);">ID: #${d.studentCode || stud.studentCode || ''}</span>
            </div>
          </div>
        </div>
        <button class="info-btn" style="color:#fff; border-color:rgba(255,255,255,0.25);" onclick="studentLogout()">🚪 লগআউট</button>
      </div>

      <div class="hero-stats-row">
        <div class="stat-badge">
          <div class="stat-val"><span class="streak-fire">🔥</span> ৩ দিন</div>
          <div class="stat-lbl">স্টাডি স্ট্রিক</div>
        </div>
        <div class="stat-badge" onclick="openMyCoupons('couponBalance')" style="cursor:pointer;">
          <div class="stat-val" style="color:var(--gold);">🪙 ৳ ${balance}</div>
          <div class="stat-lbl">ট্রিট ব্যালেন্স</div>
        </div>
        <div class="stat-badge" onclick="go('battleWorldMap')" style="cursor:pointer;">
          <div class="stat-val">⚔️ যোদ্ধা</div>
          <div class="stat-lbl">ব্যাটেল লেভেল</div>
        </div>
      </div>
    </div>

    <!-- Smart Widgets Grid -->
    <div class="widget-grid">
      <!-- 1. Today's Attendance Widget -->
      <div class="widget">
        <div class="widget-header">
          <h3 class="widget-title">📅 ক্লাসের উপস্থিতি</h3>
          <span class="widget-tag ${isPresentToday?'tag-green':'tag-red'}">${isPresentToday?(attStatus==='approved'?'উপস্থিত':'নিশ্চিত করো'):'অনুপস্থিত'}</span>
        </div>
        ${attWidgetHtml}
      </div>

      <!-- 2. Boss Battle Gateway Widget -->
      <div class="widget" style="background: linear-gradient(135deg, #182238 0%, #202F4F 100%); color:#fff; border-color:#2C3E66;">
        <div class="widget-header">
          <h3 class="widget-title" style="color:#fff;">⚔️ বস ব্যাটেল (RPG Game Mode)</h3>
          <span class="widget-tag tag-gold">🎮 লাইভ যুদ্ধ</span>
        </div>
        <p style="font-size:13.5px; color:rgba(255,255,255,0.8); margin:0 0 14px 0; line-height:1.5;">
          পদার্থ, রসায়ন, গণিত, জীববিজ্ঞান ও আইসিটির দানবদের বিরুদ্ধে লড়াই করো। প্রশ্ন সঠিক উত্তর দিয়ে দানবের HP কমাও এবং বিশ্ব বসকে আনলক করো!
        </p>
        <button class="btn btn-gold btn-block" style="box-shadow:0 4px 16px rgba(217,164,65,0.35);" onclick="go('battleWorldMap')">🎮 ৫টি বিশ্বের দানব যুদ্ধে নামো ⚔️</button>
      </div>

      <!-- 3. Exams & Quiz Hub -->
      <div class="widget">
        <div class="widget-header">
          <h3 class="widget-title">📝 পরীক্ষা ও মূল্যায়ন</h3>
          <span class="widget-tag tag-blue">এমসিকিউ</span>
        </div>
        <label class="field-label" style="font-size:12.5px;">🔑 শিক্ষকের দেওয়া এক্সাম কোড দিয়ে সরাসরি পরীক্ষা শুরু করো</label>
        <div style="display:flex; gap:8px; margin-bottom:14px;">
          <input type="text" id="dashExamCode" placeholder="যেমন: 7K3PQ" style="text-transform:uppercase; margin-bottom:0; font-family:var(--font-mono); font-weight:700;">
          <button class="btn btn-primary" style="white-space:nowrap;" onclick="dashStartExamByCode()">শুরু করো</button>
        </div>
        <button class="btn btn-outline btn-block" style="margin-bottom:8px;" onclick="go('practiceList')">🎯 Practice</button> <!-- [NEW] one button; the full list is on the Practice page -->
        <div class="row" style="margin-top:6px;">
          <button class="btn btn-primary btn-block" onclick="go('pastExams')">📜 Past Exams</button>
          <button class="btn btn-outline btn-block" onclick="openMyMastery()">📊 মাস্টারি প্রোগ্রেস</button>
        </div>
      </div>

      <!-- 4. Written CQ Exam Widget -->
      <div class="widget">
        <div class="widget-header">
          <h3 class="widget-title">✍️ লিখিত সৃজনশীল পরীক্ষা</h3>
          <span class="widget-tag tag-gold">Gemini AI Vision</span>
        </div>
        <p class="hint" style="margin-bottom:12px;">হাতে লেখা খাতার ছবি তুলে সরাসরি আপলোড করো — এআই তাৎক্ষণিক মূল্যায়ন ও নম্বর প্রদান করবে।</p>
        <button class="btn btn-outline btn-block" onclick="go('writtenEntry')">📝 লিখিত পরীক্ষায় অংশ নাও ও খাতা আপলোড করো</button>
      </div>

      <!-- 5. Treat Wallet & Rewards Shop -->
      <div class="widget">
        <div class="widget-header">
          <h3 class="widget-title">🎁 ট্রিট কুপন ও রিওয়ার্ড ওয়ালেট</h3>
          <span class="widget-tag tag-green">৳ ${balance} জমানো</span>
        </div>
        <p class="hint" style="margin-bottom:12px;">পরীক্ষায় ভালো রেজাল্ট করে টাকা জমাও এবং বিকাশ ক্যাশআউট বা শপ থেকে গিফট নাও!</p>
        <div class="row">
          <button class="btn btn-gold btn-block" onclick="openMyCoupons('couponBalance')">💸 বিকাশ ক্যাশআউট</button>
          <button class="btn btn-outline btn-block" onclick="openMyCoupons('shopList')">🛍️ রিওয়ার্ড শপ</button>
        </div>
      </div>

      <!-- 6. AI Doubt Solver & Study Notes -->
      <div class="widget">
        <div class="widget-header">
          <h3 class="widget-title">💡 পড়াশোনার সহায়ক</h3>
        </div>
        <div class="row">
          <button class="btn btn-outline btn-block" onclick="go('doubtEntry')">🤖 AI ডাউট সমাধান</button>
          <button class="btn btn-outline btn-block" onclick="go('notesGate')">📑 ক্লাস নোট ও স্লাইড</button>
        </div>
      </div>
    </div>

    ${creditFooter()}
  `;
}

// Dashboard -> coupon wallet / shop. Those screens need name/slug/balance/history in `state`,
// so fetch the logged-in student's balance first (otherwise they showed "৳undefined").
window.openMyCoupons = async function(target){
  const stud = getLoggedStudent();
  if(!stud){ go('studentAuth'); return; }
  toast('লোড হচ্ছে...');
  const data = await getCouponBalanceRemote(stud.slug);
  go(target || 'couponBalance', couponState(stud.name, stud.slug, data)); // [NEW] carries pending-withdraw info
};

window.dashMarkTodayAttendance = async function(slug){
  toast('হাজিরা পাঠানো হচ্ছে...');
  // [NEW] source 'self': the student's own tap counts right away (no waiting for approval)
  const res = await postToScript('markAttendance', { slug, date: todayStr(), source: 'self' });
  if(res && res.status === 'success'){
    playSfx('combo');
    toast('✅ হাজিরা নেওয়া হয়েছে!');
    await refreshStudentDashboard(slug); // re-loads so this month's class count updates too
  } else {
    toast('হাজিরা পাঠাতে সমস্যা হয়েছে, আবার চেষ্টা করো');
  }
};

window.openStudentAttendanceCalendar = async function(slug, name){
  toast('ক্যালেন্ডার লোড হচ্ছে...');
  const records = await listAttendanceRemote(slug);
  go('attendanceStudentView', { slug, name, records });
};

window.dashStartExamByCode = async function(){
  const code = ((document.getElementById('dashExamCode')||{}).value||'').trim().toUpperCase();
  if(!code){ toast('পরীক্ষার কোড লিখুন'); return; }
  const stud = getLoggedStudent();
  if(!stud){ go('studentAuth'); return; }
  toast('পরীক্ষা খোঁজা হচ্ছে...');
  const examRaw = await sget('exam:'+code);
  if(!examRaw){ alert('পরীক্ষা পাওয়া যায়নি! কোডটি সঠিক কিনা যাচাই করুন।'); return; }
  const exam = JSON.parse(examRaw.value);
  const slug = stud.slug;

  // 🎁 Treat exams carry real money: still need the teacher's per-exam password
  if(exam.isTreat){
    const pass = (prompt('এটা একটা 🎁 Treat পরীক্ষা। শিক্ষকের দেওয়া পাসওয়ার্ড লিখুন:') || '').trim();
    if(!pass){ return; }
    if(pass !== String(exam.treatPassword)){ toast('পাসওয়ার্ড ভুল হয়েছে'); return; }
  }

  // same attempt rules as the normal entry flow
  const existingResults = await getRemoteResults(code);
  const myAttempts = existingResults.filter(r => (r.slug ? r.slug === slug : slugify(r.studentName||'') === slug));
  if(myAttempts.length > 0){
    myAttempts.sort((a,b)=> b.submittedAt - a.submittedAt);
    if(exam.isTreat){ go('treatBlocked', { exam, attempt: myAttempts[0] }); return; }
    go('studentChoice', { exam, slug, name: stud.name, attempts: myAttempts });
    return;
  }
  runCheckingSequence(exam, slug, stud.name, 1);
};

// ================= TEACHER: REGISTRATION CODE GENERATOR =================
let teacherRegCodesCache = [];
async function renderTeacherRegCodes(){
  app.innerHTML = `
    ${header('রেজিস্ট্রেশন কোড জেনারেটর')}
    <div class="card center">কোড তালিকা লোড হচ্ছে...</div>
    ${creditFooter()}
  `;
  const res = await fetch(`${SCRIPT_URL}?action=listRegCodes`);
  const json = await res.json();
  teacherRegCodesCache = (json && json.status === 'success') ? json.data : [];

  const listRows = teacherRegCodesCache.map(c => {
    const isUsed = c.status === 'used';
    const isRevoked = c.status === 'revoked';
    const badgeColor = isUsed ? 'var(--pencil)' : (isRevoked ? 'var(--red)' : 'var(--green)');
    const badgeText = isUsed ? `ব্যবহৃত (${c.usedBySlug||''})` : (isRevoked ? 'বাতিল' : 'সক্রিয়');
    return `
      <div class="exam-item" style="display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:8px; padding:10px 14px;">
        <div>
          <div style="font-family:var(--font-mono); font-size:16px; font-weight:700; color:var(--ink); letter-spacing:1px;">${c.code}</div>
          <div style="font-size:12px; color:var(--pencil); margin-top:2px;">ব্যাচ: ${escapeHtml(c.batch||'সাধারণ')} · <span style="color:${badgeColor}; font-weight:600;">${badgeText}</span></div>
        </div>
        <div style="display:flex; gap:6px;">
          ${!isUsed && !isRevoked ? `
            <button class="btn btn-primary" style="padding:6px 12px; font-size:12px;" onclick="copyTeacherRegCode('${c.code}', '${escapeHtml(c.batch||'')}')">📋 কপি</button>
            <button class="btn btn-danger" style="padding:6px 10px; font-size:12px;" onclick="revokeTeacherRegCode('${c.code}')">✕</button>
          ` : `
            <span style="font-size:12px; color:var(--pencil);">${isUsed ? 'সম্পন্ন' : 'বাতিল'}</span>
          `}
        </div>
      </div>
    `;
  }).join('');

  app.innerHTML = `
    ${header('রেজিস্ট্রেশন কোড জেনারেটর')}
    <div class="card">
      <h2>🔑 নতুন রেজিস্ট্রেশন কোড তৈরি করো</h2>
      <p class="hint">ছাত্রছাত্রীরা এই কোডটি ব্যবহার করে প্রথমবারের মতো তাদের অ্যাকাউন্ট খুলতে পারবে। প্রতি কোড একজন ছাত্রের জন্য কার্যকর।</p>
      
      <div class="row">
        <div>
          <label class="field-label">কয়টি কোড তৈরি করবে?</label>
          <select id="regGenCount">
            <option value="1">১ টি কোড</option>
            <option value="5" selected>৫ টি কোড</option>
            <option value="10">১০ টি কোড</option>
            <option value="20">২০ টি কোড</option>
          </select>
        </div>
        <div>
          <label class="field-label">ব্যাচের নাম (ঐচ্ছিক)</label>
          <input type="text" id="regGenBatch" placeholder="যেমন: ব্যাচ ২০২৫">
        </div>
      </div>
      <button class="btn btn-gold btn-block" onclick="generateNewTeacherCodes()">✨ কোড তৈরি করো</button>
    </div>

    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <h3 style="margin:0;">বিদ্যমান কোডসমূহ (${teacherRegCodesCache.length}টি)</h3>
        <button class="info-btn" onclick="renderTeacherRegCodes()">🔄 রিফ্রেশ</button>
      </div>
      ${listRows || '<div class="empty-state">এখনো কোনো রেজিস্ট্রেশন কোড তৈরি করা হয়নি। উপরে থেকে কোড তৈরি করো।</div>'}
    </div>

    <div class="center" style="margin-top:14px;"><a class="link-back" onclick="go('teacherDashboard')">← শিক্ষক ড্যাশবোর্ডে ফিরে যাও</a></div>
    ${creditFooter()}
  `;
}

window.generateNewTeacherCodes = async function(){
  const count = (document.getElementById('regGenCount')||{}).value || 5;
  const batch = ((document.getElementById('regGenBatch')||{}).value || '').trim() || 'সাধারণ ব্যাচ';
  toast('কোড তৈরি হচ্ছে...');
  const res = await postToScript('generateRegCodes', { count, batch, teacherId: (currentTeacher && currentTeacher.name) || 'Teacher' });
  if(res && res.status === 'success'){
    playSfx('combo');
    toast(`🎉 ${res.codes.length}টি নতুন কোড তৈরি হয়েছে!`);
    renderTeacherRegCodes();
  } else {
    toast('কোড তৈরিতে সমস্যা হয়েছে');
  }
};

window.copyTeacherRegCode = function(code, batch){
  const appUrl = window.location.href.split('?')[0];
  const msg = `পরীক্ষার খাতা অ্যাপে রেজিস্ট্রেশন কোড: ${code}\nব্যাচ: ${batch}\nঅ্যাপ লিংক: ${appUrl}\n\nএই কোডটি প্রদান করে তোমার নতুন অ্যাকাউন্ট তৈরি করো।`;
  navigator.clipboard.writeText(msg).then(()=>{
    toast('কোড ও মেসেজ কপি হয়েছে (WhatsApp এ পাঠান)');
  }).catch(()=> toast('কপি করা সম্ভব হয়নি'));
};

window.revokeTeacherRegCode = async function(code){
  if(!confirm(`আপনি কি নিশ্চিত কোড "${code}" বাতিল করতে চান?`)) return;
  toast('বাতিল করা হচ্ছে...');
  const res = await postToScript('revokeRegCode', { code });
  if(res && res.status === 'success'){
    toast('কোড বাতিল করা হয়েছে');
    renderTeacherRegCodes();
  } else {
    toast('বাতিল করা যায়নি');
  }
};
