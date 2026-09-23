import sys
import re
import shutil

sys.stdout.reconfigure(encoding='utf-8')

backup_path = 'c:/Users/Dell/Desktop/raht/index.html.bak_chord6'
shutil.copyfile('c:/Users/Dell/Desktop/raht/index.html', backup_path)
print(f"Created backup at {backup_path}")

with open('c:/Users/Dell/Desktop/raht/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# ── 1. CSS STYLES FOR CHORD 6 (Slide 2, Schedules, Collaboration) ──
css_insertion = """
    /* ── Chord 6 (الدروس والمستقبل) Styles ── */
    .sp5-schedule-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0 5px;
    }
    .sp5-schedule-table th {
      color: #cbd5e1;
      font-size: 11.5px;
      font-weight: 600;
      padding: 6px 10px;
      border-bottom: 1px solid rgba(177, 133, 219, 0.2);
    }
    .sp5-schedule-table tbody tr {
      background: rgba(255, 255, 255, 0.035);
      transition: all 0.2s ease;
    }
    .sp5-schedule-table tbody tr:hover {
      background: rgba(177, 133, 219, 0.12);
      transform: translateX(-3px);
    }
    .sp5-schedule-table td {
      padding: 7px 10px;
      font-size: 12.5px;
      color: #e2e8f0;
      vertical-align: middle;
    }
    .collab-logo-box {
      transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .collab-logo-box:hover {
      transform: translateY(-6px) scale(1.03);
    }
    @keyframes collabPulseGlow {
      0%, 100% {
        box-shadow: 0 0 20px rgba(236, 72, 153, 0.35), 0 0 40px rgba(168, 85, 247, 0.2);
        transform: scale(1);
      }
      50% {
        box-shadow: 0 0 32px rgba(236, 72, 153, 0.6), 0 0 60px rgba(168, 85, 247, 0.4);
        transform: scale(1.08);
      }
    }
    .collab-x-badge {
      animation: collabPulseGlow 2.5s infinite ease-in-out;
    }
"""

# Insert CSS before </style>
if css_insertion.strip() not in content:
    style_end = content.find('</style>')
    if style_end != -1:
        content = content[:style_end] + css_insertion + content[style_end:]
        print("Appended Chord 6 CSS styles.")

# ── 2. NEW HTML FOR SP-5 SLIDES 2, 3, AND 4 ──
# Update counter badge in top bar
content = re.sub(
    r'<span class="ppt-counter-badge" id="ppt-counter-badge-5" title="الشريحة الحالية">١ / [٣|3]</span>',
    '<span class="ppt-counter-badge" id="ppt-counter-badge-5" title="الشريحة الحالية">١ / ٤</span>',
    content
)

# New Pills and Slide 2, 3, 4 HTML
new_sp5_body = """      <!-- Slide Selector Pills -->
      <div style="display: flex; justify-content: center; gap: 10px; margin-bottom: 14px; flex-wrap: wrap;">
        <button class="sp4-day-tab-btn active" id="sp5-pill-1" onclick="goToSp5Slide(1)" style="border-radius: 20px; padding: 6px 16px; font-size: 13px;">
          الشريحة ١ • التقييم الخارجي (قادة • خدام • أطفال)
        </button>
        <button class="sp4-day-tab-btn" id="sp5-pill-2" onclick="goToSp5Slide(2)" style="border-radius: 20px; padding: 6px 16px; font-size: 13px;">
          الشريحة ٢ • التقييم الداخلي (الشمس • المياه • تغير التحضير • الترامبولين)
        </button>
        <button class="sp4-day-tab-btn" id="sp5-pill-3" onclick="goToSp5Slide(3)" style="border-radius: 20px; padding: 6px 16px; font-size: 13px;">
          الشريحة ٣ • جداول انتشار الكنائس (٤ ⟷ ٨)
        </button>
        <button class="sp4-day-tab-btn" id="sp5-pill-4" onclick="goToSp5Slide(4)" style="border-radius: 20px; padding: 6px 16px; font-size: 13px;">
          الشريحة ٤ • الشراكة المستقبلية (رهط الوتر ✕ قلب ابتسامة)
        </button>
      </div>

      <!-- SLIDE 1: EXTERNAL FEEDBACK (3 Columns: Senior Leaders, Church Servants, Kids) -->
      <div class="sp5-slide-pane active" id="sp5-slide-1">
        <div class="stage-badge-wrap" style="text-align: center; margin-bottom: 12px;">
          <span class="stage-badge" style="border-color: rgba(177,133,219,0.4); color: #d8b4fe;">
            التقييم الخارجي • أصوات الشركاء والمخدومين
          </span>
          <h3 class="stage-title" style="margin: 4px 0 0 0; font-size: 1.3rem;">انطباعات وتقييمات الفئات الثلاث المشاركة</h3>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
          <!-- Column 1: تقييم القادة الكبار -->
          <div class="gm-rule-card" style="background: rgba(32, 20, 42, 0.75); border: 1px solid rgba(177,133,219,0.35); border-radius: 14px; padding: 18px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
              <div style="background: rgba(177,133,219,0.2); color: #d8b4fe; border-radius: 10px; padding: 8px; display: flex;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
              </div>
              <h4 style="margin: 0; font-size: 16px; color: #fff;">تقييم القادة الكبار</h4>
            </div>
            <ul style="margin: 0; padding-right: 18px; color: #cbd5e1; font-size: 13.5px; line-height: 1.7;">
              <li>إشادة بانضباط الجوالة الميداني وإن اليوم عدا كامل من غير غلطة ولا إصابة واحدة.</li>
            </ul>
          </div>

          <!-- Column 2: تقييم خدام الكنائس -->
          <div class="gm-rule-card" style="background: rgba(32, 20, 42, 0.75); border: 1px solid rgba(177,133,219,0.35); border-radius: 14px; padding: 18px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
              <div style="background: rgba(177,133,219,0.2); color: #d8b4fe; border-radius: 10px; padding: 8px; display: flex;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path></svg>
              </div>
              <h4 style="margin: 0; font-size: 16px; color: #fff;">تقييم خدام الكنائس</h4>
            </div>
            <ul style="margin: 0; padding-right: 18px; color: #cbd5e1; font-size: 13.5px; line-height: 1.7;">
              <li>شكرونا جداً إننا شلنا عنهم تعب اليوم واتعلموا أفكار كشفية جديدة هيكملوا بيها.</li>
            </ul>
          </div>

          <!-- Column 3: تقييم الأطفال -->
          <div class="gm-rule-card" style="background: rgba(32, 20, 42, 0.75); border: 1px solid rgba(177,133,219,0.35); border-radius: 14px; padding: 18px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
              <div style="background: rgba(177,133,219,0.2); color: #d8b4fe; border-radius: 10px; padding: 8px; display: flex;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
              </div>
              <h4 style="margin: 0; font-size: 16px; color: #fff;">تقييم الأطفال</h4>
            </div>
            <ul style="margin: 0; padding-right: 18px; color: #cbd5e1; font-size: 13.5px; line-height: 1.7;">
              <li>فرحة مش طبيعية من الأولاد وقالوا ده أحلى يوم في حياتهم وبكوا وإحنا بنودعهم.</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- SLIDE 2: INTERNAL FEEDBACK (التقييم الداخلي: ٤ نقاط - الشمس، المياه، تغير التحضير، الترامبولين) -->
      <div class="sp5-slide-pane" id="sp5-slide-2" style="display: none;">
        <div class="stage-badge-wrap" style="text-align: center; margin-bottom: 14px;">
          <span class="stage-badge" style="border-color: rgba(177,133,219,0.4); color: #d8b4fe;">
            التقييم الداخلي • الدروس المستفادة ميدانياً
          </span>
          <h3 class="stage-title" style="margin: 4px 0 0 0; font-size: 1.3rem;">أهم ٤ دروس وتحديات عملية واجهت فريق رهط الوتر</h3>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px;">
          <!-- 1. الشمس -->
          <div class="gm-rule-card" style="background: rgba(32, 20, 42, 0.78); border: 1px solid rgba(251,191,36,0.35); border-radius: 14px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                <div style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border-radius: 10px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 14px rgba(245,158,11,0.25);">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  </svg>
                </div>
                <span style="font-size: 11px; background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 10px; padding: 2px 8px;">حرارة الجو</span>
              </div>
              <h4 style="margin: 0 0 8px 0; font-size: 16px; color: #fff; font-weight: 700;">الشمس</h4>
              <ul style="margin: 0; padding-right: 18px; color: #cbd5e1; font-size: 12.5px; line-height: 1.65;">
                <li>التعامل الحذر مع أشعة وحرارة الشمس المرتفعة خلال ساعات الظهيرة.</li>
                <li>توفير مساحات ظل كافية وترطيب مستمر للأطفال بالسوائل لتفادي الإجهاد الحراري.</li>
              </ul>
            </div>
            <div style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed rgba(251,191,36,0.25); font-size: 11px; color: #fbbf24;">
              ✓ مظلات وترطيب دائم طوال اليوم
            </div>
          </div>

          <!-- 2. المياه -->
          <div class="gm-rule-card" style="background: rgba(32, 20, 42, 0.78); border: 1px solid rgba(56,189,248,0.35); border-radius: 14px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                <div style="background: rgba(56, 189, 248, 0.2); color: #38bdf8; border-radius: 10px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 14px rgba(56,189,248,0.25);">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                  </svg>
                </div>
                <span style="font-size: 11px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 10px; padding: 2px 8px;">حمام السباحة</span>
              </div>
              <h4 style="margin: 0 0 8px 0; font-size: 16px; color: #fff; font-weight: 700;">المياه</h4>
              <ul style="margin: 0; padding-right: 18px; color: #cbd5e1; font-size: 12.5px; line-height: 1.65;">
                <li>الالتزام الصارم باشتراطات الأمان المائي وتواجد رقابة جوالة لصيقة داخل المسبح.</li>
                <li>سرعة التنشيف وتبديل الملابس فور الخروج لتجنب التيارات الهوائية ونزلات البرد.</li>
              </ul>
            </div>
            <div style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed rgba(56,189,248,0.25); font-size: 11px; color: #38bdf8;">
              ✓ أمان مائي كامل بدون أي حوادث
            </div>
          </div>

          <!-- 3. تغير التحضير -->
          <div class="gm-rule-card" style="background: rgba(32, 20, 42, 0.78); border: 1px solid rgba(52,211,153,0.35); border-radius: 14px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                <div style="background: rgba(52, 211, 153, 0.2); color: #34d399; border-radius: 10px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 14px rgba(52,211,153,0.25);">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <polyline points="1 20 1 14 7 14"></polyline>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                  </svg>
                </div>
                <span style="font-size: 11px; background: rgba(52, 211, 153, 0.15); color: #34d399; border: 1px solid rgba(52, 211, 153, 0.3); border-radius: 10px; padding: 2px 8px;">مرونة ميدانية</span>
              </div>
              <h4 style="margin: 0 0 8px 0; font-size: 16px; color: #fff; font-weight: 700;">تغير التحضير</h4>
              <ul style="margin: 0; padding-right: 18px; color: #cbd5e1; font-size: 12.5px; line-height: 1.65;">
                <li>سرعة تكييف البرنامج الميداني وإعادة ترتيب الفقرات وفق طاقة وتفاعل الأطفال.</li>
                <li>تعديل الألعاب واستبدال الأنشطة بسلاسة وبدون أي ارتباك لمراعاة التفاوت العمري.</li>
              </ul>
            </div>
            <div style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed rgba(52,211,153,0.25); font-size: 11px; color: #34d399;">
              ✓ استجابة فورية وبدائل ذكية ناجحة
            </div>
          </div>

          <!-- 4. الترامبولين -->
          <div class="gm-rule-card" style="background: rgba(32, 20, 42, 0.78); border: 1px solid rgba(192,132,252,0.35); border-radius: 14px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                <div style="background: rgba(192, 132, 252, 0.2); color: #c084fc; border-radius: 10px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 14px rgba(192,132,252,0.25);">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                  </svg>
                </div>
                <span style="font-size: 11px; background: rgba(192, 132, 252, 0.15); color: #c084fc; border: 1px solid rgba(192, 132, 252, 0.3); border-radius: 10px; padding: 2px 8px;">الألعاب الحركية</span>
              </div>
              <h4 style="margin: 0 0 8px 0; font-size: 16px; color: #fff; font-weight: 700;">الترامبولين</h4>
              <ul style="margin: 0; padding-right: 18px; color: #cbd5e1; font-size: 12.5px; line-height: 1.65;">
                <li>تنظيم طوابير القفز وتحديد أعداد الأطفال في كل دور لمنع أي تزاحم أو تصادم.</li>
                <li>تأمين منطقة النطاطات بإشراف فردي لصيق من الجوالة لضمان صفر إصابات.</li>
              </ul>
            </div>
            <div style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed rgba(192,132,252,0.25); font-size: 11px; color: #c084fc;">
              ✓ انضباط تام وسلامة كاملة للأطفال
            </div>
          </div>
        </div>
      </div>

      <!-- SLIDE 3: FUTURE PLANS (2 Schedules Side by Side: 4 Churches vs 8 Churches) -->
      <div class="sp5-slide-pane" id="sp5-slide-3" style="display: none;">
        <div class="stage-badge-wrap" style="text-align: center; margin-bottom: 12px;">
          <span class="stage-badge" style="border-color: rgba(177,133,219,0.4); color: #d8b4fe;">
            الرؤية المستقبلية • جداول التوسع الميداني
          </span>
          <h3 class="stage-title" style="margin: 4px 0 0 0; font-size: 1.3rem;">خطة انتشار الخدمة للكنائس (هذا العام ⟵ العام القادم)</h3>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 18px; align-items: stretch;">
          <!-- Schedule 1: خطة هذا العام (٤ كنائس) -->
          <div class="gm-rule-card" style="background: rgba(30, 20, 42, 0.85); border: 1px solid rgba(177,133,219,0.4); border-radius: 14px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid rgba(177,133,219,0.25); padding-bottom: 10px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div style="background: rgba(177,133,219,0.25); color: #d8b4fe; border-radius: 8px; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  </div>
                  <div>
                    <h4 style="margin: 0; font-size: 15.5px; color: #fff; font-weight: 700;">خطة هذا العام</h4>
                    <span style="font-size: 11.5px; color: #cbd5e1;">المرحلة التنفيذية الأولى (الأساس)</span>
                  </div>
                </div>
                <span style="background: rgba(168, 85, 247, 0.2); color: #d8b4fe; border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 14px; padding: 3px 10px; font-size: 12px; font-weight: 600;">٤ كنائس</span>
              </div>

              <table class="sp5-schedule-table">
                <thead>
                  <tr style="text-align: right;">
                    <th style="width: 36px;">م</th>
                    <th>الكنيسة المستهدفة</th>
                    <th>الملاحظات</th>
                    <th style="text-align: center;">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="color: #d8b4fe; font-weight: bold; border-radius: 0 8px 8px 0;">١</td>
                    <td style="color: #fff; font-weight: 600;">كنيسة ١</td>
                    <td style="color: #94a3b8; font-size: 12px;">(سيتم تحديد الاسم لاحقاً)</td>
                    <td style="text-align: center; border-radius: 8px 0 0 8px;">
                      <span style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.35); padding: 3px 8px; border-radius: 10px; font-size: 11px;">⏳ قيد التنسيق</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="color: #d8b4fe; font-weight: bold; border-radius: 0 8px 8px 0;">٢</td>
                    <td style="color: #fff; font-weight: 600;">كنيسة ٢</td>
                    <td style="color: #94a3b8; font-size: 12px;">(سيتم تحديد الاسم لاحقاً)</td>
                    <td style="text-align: center; border-radius: 8px 0 0 8px;">
                      <span style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.35); padding: 3px 8px; border-radius: 10px; font-size: 11px;">⏳ قيد التنسيق</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="color: #d8b4fe; font-weight: bold; border-radius: 0 8px 8px 0;">٣</td>
                    <td style="color: #fff; font-weight: 600;">كنيسة ٣</td>
                    <td style="color: #94a3b8; font-size: 12px;">(سيتم تحديد الاسم لاحقاً)</td>
                    <td style="text-align: center; border-radius: 8px 0 0 8px;">
                      <span style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.35); padding: 3px 8px; border-radius: 10px; font-size: 11px;">⏳ قيد التنسيق</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="color: #d8b4fe; font-weight: bold; border-radius: 0 8px 8px 0;">٤</td>
                    <td style="color: #fff; font-weight: 600;">كنيسة ٤</td>
                    <td style="color: #94a3b8; font-size: 12px;">(سيتم تحديد الاسم لاحقاً)</td>
                    <td style="text-align: center; border-radius: 8px 0 0 8px;">
                      <span style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.35); padding: 3px 8px; border-radius: 10px; font-size: 11px;">⏳ قيد التنسيق</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style="margin-top: 14px; padding: 10px 12px; background: rgba(177, 133, 219, 0.1); border-radius: 10px; border: 1px dashed rgba(177, 133, 219, 0.3); display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 16px;">🎯</span>
              <span style="font-size: 12px; color: #e2e8f0; line-height: 1.5;">الهدف المباشر: تطبيق النموذج الكشفي وتثبيت التجربة مع ٤ كنائس مختارة هذا العام.</span>
            </div>
          </div>

          <!-- Schedule 2: خطة العام القادم (٨ كنائس) -->
          <div class="gm-rule-card" style="background: rgba(30, 20, 42, 0.85); border: 1px solid rgba(56,189,248,0.4); border-radius: 14px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid rgba(56,189,248,0.25); padding-bottom: 10px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div style="background: rgba(56, 189, 248, 0.2); color: #38bdf8; border-radius: 8px; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                  </div>
                  <div>
                    <h4 style="margin: 0; font-size: 15.5px; color: #fff; font-weight: 700;">خطة العام القادم</h4>
                    <span style="font-size: 11.5px; color: #cbd5e1;">مرحلة التوسع ومضاعفة الأثر (+١٠٠٪)</span>
                  </div>
                </div>
                <span style="background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 14px; padding: 3px 10px; font-size: 12px; font-weight: 600;">٨ كنائس</span>
              </div>

              <table class="sp5-schedule-table">
                <thead>
                  <tr style="text-align: right;">
                    <th style="width: 32px;">م</th>
                    <th>الكنيسة المستهدفة</th>
                    <th>الملاحظات</th>
                    <th style="text-align: center;">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="color: #38bdf8; font-weight: bold; border-radius: 0 6px 6px 0;">١</td>
                    <td style="color: #fff; font-weight: 600;">كنيسة ١</td>
                    <td style="color: #94a3b8; font-size: 11.5px;">(سيتم تحديد الاسم لاحقاً)</td>
                    <td style="text-align: center; border-radius: 6px 0 0 6px;"><span style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); padding: 2px 7px; border-radius: 8px; font-size: 10.5px;">🎯 خطة التوسع</span></td>
                  </tr>
                  <tr>
                    <td style="color: #38bdf8; font-weight: bold; border-radius: 0 6px 6px 0;">٢</td>
                    <td style="color: #fff; font-weight: 600;">كنيسة ٢</td>
                    <td style="color: #94a3b8; font-size: 11.5px;">(سيتم تحديد الاسم لاحقاً)</td>
                    <td style="text-align: center; border-radius: 6px 0 0 6px;"><span style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); padding: 2px 7px; border-radius: 8px; font-size: 10.5px;">🎯 خطة التوسع</span></td>
                  </tr>
                  <tr>
                    <td style="color: #38bdf8; font-weight: bold; border-radius: 0 6px 6px 0;">٣</td>
                    <td style="color: #fff; font-weight: 600;">كنيسة ٣</td>
                    <td style="color: #94a3b8; font-size: 11.5px;">(سيتم تحديد الاسم لاحقاً)</td>
                    <td style="text-align: center; border-radius: 6px 0 0 6px;"><span style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); padding: 2px 7px; border-radius: 8px; font-size: 10.5px;">🎯 خطة التوسع</span></td>
                  </tr>
                  <tr>
                    <td style="color: #38bdf8; font-weight: bold; border-radius: 0 6px 6px 0;">٤</td>
                    <td style="color: #fff; font-weight: 600;">كنيسة ٤</td>
                    <td style="color: #94a3b8; font-size: 11.5px;">(سيتم تحديد الاسم لاحقاً)</td>
                    <td style="text-align: center; border-radius: 6px 0 0 6px;"><span style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); padding: 2px 7px; border-radius: 8px; font-size: 10.5px;">🎯 خطة التوسع</span></td>
                  </tr>
                  <tr>
                    <td style="color: #38bdf8; font-weight: bold; border-radius: 0 6px 6px 0;">٥</td>
                    <td style="color: #fff; font-weight: 600;">كنيسة ٥</td>
                    <td style="color: #94a3b8; font-size: 11.5px;">(سيتم تحديد الاسم لاحقاً)</td>
                    <td style="text-align: center; border-radius: 6px 0 0 6px;"><span style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); padding: 2px 7px; border-radius: 8px; font-size: 10.5px;">🎯 خطة التوسع</span></td>
                  </tr>
                  <tr>
                    <td style="color: #38bdf8; font-weight: bold; border-radius: 0 6px 6px 0;">٦</td>
                    <td style="color: #fff; font-weight: 600;">كنيسة ٦</td>
                    <td style="color: #94a3b8; font-size: 11.5px;">(سيتم تحديد الاسم لاحقاً)</td>
                    <td style="text-align: center; border-radius: 6px 0 0 6px;"><span style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); padding: 2px 7px; border-radius: 8px; font-size: 10.5px;">🎯 خطة التوسع</span></td>
                  </tr>
                  <tr>
                    <td style="color: #38bdf8; font-weight: bold; border-radius: 0 6px 6px 0;">٧</td>
                    <td style="color: #fff; font-weight: 600;">كنيسة ٧</td>
                    <td style="color: #94a3b8; font-size: 11.5px;">(سيتم تحديد الاسم لاحقاً)</td>
                    <td style="text-align: center; border-radius: 6px 0 0 6px;"><span style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); padding: 2px 7px; border-radius: 8px; font-size: 10.5px;">🎯 خطة التوسع</span></td>
                  </tr>
                  <tr>
                    <td style="color: #38bdf8; font-weight: bold; border-radius: 0 6px 6px 0;">٨</td>
                    <td style="color: #fff; font-weight: 600;">كنيسة ٨</td>
                    <td style="color: #94a3b8; font-size: 11.5px;">(سيتم تحديد الاسم لاحقاً)</td>
                    <td style="text-align: center; border-radius: 6px 0 0 6px;"><span style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); padding: 2px 7px; border-radius: 8px; font-size: 10.5px;">🎯 خطة التوسع</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style="margin-top: 10px; padding: 8px 12px; background: rgba(56, 189, 248, 0.1); border-radius: 10px; border: 1px dashed rgba(56, 189, 248, 0.3); display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 15px;">🚀</span>
              <span style="font-size: 11.5px; color: #e2e8f0; line-height: 1.5;">الهدف المستقبلي: مضاعفة التغطية بنسبة +١٠٠٪ ونقل النشاط لـ ٨ كنائس جديدة.</span>
            </div>
          </div>
        </div>

        <!-- Next Action: Reveal Collaboration -->
        <div style="display: flex; justify-content: center; align-items: center; margin-top: 14px;">
          <button class="sp5-reveal-btn" onclick="goToSp5Slide(4)" style="background: linear-gradient(135deg, rgba(168,85,247,0.35), rgba(236,72,153,0.35)); border: 1px solid rgba(236,72,153,0.6); color: #fff; border-radius: 30px; padding: 9px 24px; font-size: 13.5px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 10px; box-shadow: 0 4px 18px rgba(168,85,247,0.3); transition: all 0.25s ease;">
            <span>الخطوة التالية: إعلان الشراكة المستقبلية (رهط الوتر ✕ قلب ابتسامة)</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      </div>

      <!-- SLIDE 4: COLLABORATION REVEAL (رهط الوتر ✕ قلب ابتسامة) -->
      <div class="sp5-slide-pane" id="sp5-slide-4" style="display: none;">
        <div class="stage-badge-wrap" style="text-align: center; margin-bottom: 12px;">
          <span class="stage-badge" style="border-color: rgba(236,72,153,0.4); color: #f472b6; background: rgba(236,72,153,0.12);">
            رؤية استراتيجية واعدة • الشراكة المستقبلية
          </span>
          <h3 class="stage-title" style="margin: 4px 0 0 0; font-size: 1.35rem;">تعاون مشترك لنشر الفرح والخدمة</h3>
        </div>

        <!-- Centerpiece Collaboration Stage -->
        <div class="gm-rule-card" style="background: radial-gradient(circle at 50% 30%, rgba(55, 20, 70, 0.85) 0%, rgba(20, 12, 30, 0.95) 100%); border: 1.5px solid rgba(236, 72, 153, 0.4); border-radius: 20px; padding: 22px 28px; box-shadow: 0 10px 35px rgba(0,0,0,0.5), 0 0 25px rgba(177,133,219,0.25); text-align: center;">

          <!-- Logos Lockup Row -->
          <div style="display: flex; align-items: center; justify-content: center; gap: 36px; flex-wrap: wrap; margin-bottom: 20px;">
            
            <!-- Watar Logo Box -->
            <div class="collab-logo-box" style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
              <div style="width: 135px; height: 135px; border-radius: 50%; background: radial-gradient(circle, rgba(177,133,219,0.25) 0%, rgba(30,15,45,0.7) 100%); border: 2px solid rgba(177,133,219,0.5); display: flex; align-items: center; justify-content: center; padding: 14px; box-shadow: 0 0 25px rgba(177,133,219,0.35);">
                <img src="assets/watar-logo.png" alt="شعار رهط الوتر" style="max-width: 100%; max-height: 100%; object-fit: contain; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));" />
              </div>
              <span style="font-size: 16px; font-weight: 700; color: #fff; margin-top: 4px;">رهط الوتر</span>
              <span style="font-size: 11.5px; color: #c084fc; background: rgba(192,132,252,0.15); padding: 2px 10px; border-radius: 10px; border: 1px solid rgba(192,132,252,0.3);">عشيرة الجوالة</span>
            </div>

            <!-- Center Glow X Multiplier -->
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; padding: 0 10px;">
              <div class="collab-x-badge" style="width: 54px; height: 54px; border-radius: 50%; background: linear-gradient(135deg, rgba(236,72,153,0.3), rgba(168,85,247,0.3)); border: 1.5px solid rgba(244,114,182,0.6); display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: 900; color: #f472b6; text-shadow: 0 0 15px rgba(244,114,182,0.8);">
                ✕
              </div>
              <span style="font-size: 12px; font-weight: 700; color: #fbbf24; text-shadow: 0 0 8px rgba(251,191,36,0.6); letter-spacing: 0.5px;">شراكة وتعاون</span>
            </div>

            <!-- Alb Ebtsama Logo Box -->
            <div class="collab-logo-box" style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
              <div style="width: 135px; height: 135px; border-radius: 50%; background: radial-gradient(circle, rgba(236,72,153,0.25) 0%, rgba(45,15,35,0.7) 100%); border: 2px solid rgba(236,72,153,0.5); display: flex; align-items: center; justify-content: center; padding: 14px; box-shadow: 0 0 25px rgba(236,72,153,0.35);">
                <img src="assets/alb ebtsama.png" alt="شعار فريق قلب ابتسامة" style="max-width: 100%; max-height: 100%; object-fit: contain; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));" />
              </div>
              <span style="font-size: 16px; font-weight: 700; color: #fff; margin-top: 4px;">فريق قلب ابتسامة</span>
              <span style="font-size: 11.5px; color: #f472b6; background: rgba(244,114,182,0.15); padding: 2px 10px; border-radius: 10px; border: 1px solid rgba(244,114,182,0.3);">فرح وخدمة الأطفال</span>
            </div>

          </div>

          <!-- Collaboration Narrative Highlights (3 Pillars) -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; text-align: right; margin-top: 14px;">
            <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(177,133,219,0.3); border-radius: 12px; padding: 12px 14px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                <span style="font-size: 16px;">🤝</span>
                <h5 style="margin: 0; font-size: 13.5px; color: #d8b4fe;">تكامل الخبرات الكشفية والترفيهية</h5>
              </div>
              <p style="margin: 0; font-size: 12px; color: #cbd5e1; line-height: 1.6;">دمج الانضباط والتنظيم الكشفي الميداني لرهط الوتر مع الخبرة الاحتفالية والروحية لفريق قلب ابتسامة.</p>
            </div>

            <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(236,72,153,0.3); border-radius: 12px; padding: 12px 14px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                <span style="font-size: 16px;">🎯</span>
                <h5 style="margin: 0; font-size: 13.5px; color: #f472b6;">توسيع مظلة الخدمة للكنائس</h5>
              </div>
              <p style="margin: 0; font-size: 12px; color: #cbd5e1; line-height: 1.6;">النزول المشترك لكنائس خطة التوسع لتقديم يوم ترفيهي واستثنائي لمئات الأطفال في المناطق الأكثر احتياجاً.</p>
            </div>

            <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(251,191,36,0.3); border-radius: 12px; padding: 12px 14px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                <span style="font-size: 16px;">✨</span>
                <h5 style="margin: 0; font-size: 13.5px; color: #fbbf24;">استدامة الفرح وبناء الأثر</h5>
              </div>
              <p style="margin: 0; font-size: 12px; color: #cbd5e1; line-height: 1.6;">شراكة مستمرة تثمر معسكرات وفعاليات كبرى تدوم وتترك أثراً حقيقياً ومحبة باقية في نفوس الأطفال والخُدام.</p>
            </div>
          </div>

          <!-- Navigation Action Row -->
          <div style="display: flex; justify-content: center; gap: 14px; margin-top: 18px;">
            <button class="sp5-reveal-btn" onclick="goToSp5Slide(3)" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); color: #cbd5e1; border-radius: 25px; padding: 8px 20px; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s ease;">
              <span style="transform: rotate(180deg); display: inline-block;">➔</span>
              <span>العودة لجداول الكنائس</span>
            </button>

            <button class="sp5-reveal-btn" onclick="celebratePresentationCompletion()" style="background: linear-gradient(135deg, #a855f7, #ec4899); border: none; color: #fff; border-radius: 25px; padding: 8px 24px; font-size: 13.5px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(236,72,153,0.4); transition: all 0.25s ease;">
              <span>🎉 ختام العرض التقديمي</span>
            </button>
          </div>

        </div>
      </div>
"""

# Replace the interior of .sp-body inside #sp-5
old_sp5_body_pattern = r'<!-- Slide Selector Pills -->.*?(?=</div>\s*</div>\s*<!-- Fullscreen Cinematic Lightbox Modal)'
match = re.search(old_sp5_body_pattern, content, re.DOTALL)
if match:
    content = content[:match.start()] + new_sp5_body + content[match.end():]
    print("Replaced sp-5 slide body successfully.")
else:
    print("ERROR: old_sp5_body_pattern not matched!")

# ── 3. UPDATE JAVASCRIPT CONTROLLERS ──

# A. In updateUniversalHud: update totalSteps for activePage === 5 from 3 to 4
content = re.sub(
    r'(} else if \(activePage === 5\) {\s*chordTitle = \'الوتر السادس: الدروس والمستقبل\';\s*curStep = currentSp5SlideIdx;\s*totalSteps = )3;',
    r'\g<1>4;',
    content
)

# B. In advanceGlobalPresentation: update currentSp5SlideIdx < 3 to < 4
content = re.sub(
    r'(} else if \(activePage === 5\) {\s*if \(direction > 0\) {\s*if \(currentSp5SlideIdx < )3(\))',
    r'\g<1>4\2',
    content
)

# C. Update goToSp5Slide function and helpers
old_js_block = """    // ── 15. Chord 5 (الدروس والمستقبل) 3-Slide Presentation Controller ──
    let currentSp5SlideIdx = 1; // 1 to 3

    function goToSp5Slide(slideNum, playSound = true) {
      if (slideNum < 1 || slideNum > 3) return;
      currentSp5SlideIdx = slideNum;

      // Switch Panes
      for (let i = 1; i <= 3; i++) {
        const pane = document.getElementById(`sp5-slide-${i}`);
        const pill = document.getElementById(`sp5-pill-${i}`);
        if (pane) {
          pane.style.display = i === slideNum ? 'block' : 'none';
          pane.classList.toggle('active', i === slideNum);
        }
        if (pill) {
          pill.classList.toggle('active', i === slideNum);
        }
      }

      // Update counter badge
      const counter = document.getElementById('ppt-counter-badge-5');
      if (counter) {
        const arabicNums = ['١', '٢', '٣'];
        counter.textContent = `${arabicNums[slideNum - 1]} / ٣`;
      }

      if (playSound) {
        const freqs = [392.00, 440.00, 523.25];
        pluckHarpString(freqs[slideNum - 1], 0.7);
      }

      updateUniversalHud();
    }

    function nextSp5Slide() {
      advanceGlobalPresentation(1);
    }

    function prevSp5Slide() {
      advanceGlobalPresentation(-1);
    }

    function goToSp5PptStep(step, playSound = true) {
      const slide = Math.min(3, Math.max(1, step + 1));
      goToSp5Slide(slide, playSound);
    }"""

new_js_block = """    // ── 15. Chord 5 (الدروس والمستقبل) 4-Slide Presentation Controller ──
    let currentSp5SlideIdx = 1; // 1 to 4

    function goToSp5Slide(slideNum, playSound = true) {
      if (slideNum < 1 || slideNum > 4) return;
      currentSp5SlideIdx = slideNum;

      // Switch Panes
      for (let i = 1; i <= 4; i++) {
        const pane = document.getElementById(`sp5-slide-${i}`);
        const pill = document.getElementById(`sp5-pill-${i}`);
        if (pane) {
          pane.style.display = i === slideNum ? 'block' : 'none';
          pane.classList.toggle('active', i === slideNum);
        }
        if (pill) {
          pill.classList.toggle('active', i === slideNum);
        }
      }

      // Update counter badge
      const counter = document.getElementById('ppt-counter-badge-5');
      if (counter) {
        const arabicNums = ['١', '٢', '٣', '٤'];
        counter.textContent = `${arabicNums[slideNum - 1]} / ٤`;
      }

      if (playSound) {
        const freqs = [392.00, 440.00, 493.88, 523.25];
        pluckHarpString(freqs[slideNum - 1], 0.7);
      }

      updateUniversalHud();
    }

    function nextSp5Slide() {
      advanceGlobalPresentation(1);
    }

    function prevSp5Slide() {
      advanceGlobalPresentation(-1);
    }

    function goToSp5PptStep(step, playSound = true) {
      const slide = Math.min(4, Math.max(1, step + 1));
      goToSp5Slide(slide, playSound);
    }"""

if old_js_block in content:
    content = content.replace(old_js_block, new_js_block)
    print("Replaced Chord 6 JS controller block successfully.")
else:
    print("Warning: old_js_block not found verbatim, checking regex...")
    content = re.sub(
        r'// ── 15\. Chord 5 \(الدروس والمستقبل\) 3-Slide Presentation Controller ──.*?function goToSp5PptStep\(step, playSound = true\) {\s*const slide = Math\.min\(3, Math\.max\(1, step \+ 1\)\);\s*goToSp5Slide\(slide, playSound\);\s*}',
        new_js_block,
        content,
        flags=re.DOTALL
    )
    print("Regex replacement for Chord 6 JS controller executed.")

with open('c:/Users/Dell/Desktop/raht/index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated index.html successfully!")
