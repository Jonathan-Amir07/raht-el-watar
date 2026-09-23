import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('c:/Users/Dell/Desktop/raht/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Pill 3 title
content = content.replace(
    'الشريحة ٣ • جداول انتشار الكنائس (٤ ⟷ ٨)',
    'الشريحة ٣ • الخطط المستقبلية (٤ كنائس • ٨ كنائس • معسكر مبيت)'
)

# 2. Build New Slide 3 HTML
new_slide_3 = """      <!-- SLIDE 3: FUTURE PLANS (3 Points: This year 4 churches, Next year 8 churches, Overnight Camp) -->
      <div class="sp5-slide-pane" id="sp5-slide-3" style="display: none;">
        <div class="stage-badge-wrap" style="text-align: center; margin-bottom: 14px;">
          <span class="stage-badge" style="border-color: rgba(177,133,219,0.4); color: #d8b4fe;">
            الرؤية المستقبلية • مسارات التوسع والتطوير
          </span>
          <h3 class="stage-title" style="margin: 4px 0 0 0; font-size: 1.3rem;">الخطط المستقبلية لانتشار وتطوير خدمة رهط الوتر</h3>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; align-items: stretch;">
          
          <!-- Point 1: هذا العام ٤ كنائس -->
          <div class="gm-rule-card" style="background: rgba(32, 20, 42, 0.8); border: 1px solid rgba(177,133,219,0.38); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                <div style="background: rgba(168, 85, 247, 0.2); color: #c084fc; border-radius: 10px; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 16px rgba(168,85,247,0.25);">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <span style="font-size: 12px; font-weight: 600; background: rgba(168, 85, 247, 0.18); color: #d8b4fe; border: 1px solid rgba(168, 85, 247, 0.35); border-radius: 12px; padding: 3px 10px;">هذا العام</span>
              </div>
              <h4 style="margin: 0 0 4px 0; font-size: 17px; color: #fff; font-weight: 700;">خطة هذا العام (٤ كنائس)</h4>
              <div style="font-size: 12px; color: #a78bfa; margin-bottom: 10px;">المرحلة التنفيذية التأسيسية</div>
              <ul style="margin: 0; padding-right: 18px; color: #cbd5e1; font-size: 13px; line-height: 1.7;">
                <li>النزول الميداني وتطبيق يوم النشاط الكشفي الترفيهي المتكامل في <strong>٤ كنائس</strong> مختارة.</li>
                <li>تثبيت نموذج اليوم الميداني وبناء شبكة علاقات وتنسيق قوية مع خُدام الكنائس الشريكة.</li>
              </ul>
            </div>
            <div style="margin-top: 14px; padding-top: 10px; border-top: 1px dashed rgba(168,85,247,0.3); font-size: 12px; color: #d8b4fe; font-weight: 600;">
              ✓ مستهدف ٤ كنائس للتنفيذ هذا العام
            </div>
          </div>

          <!-- Point 2: العام القادم ٨ كنائس -->
          <div class="gm-rule-card" style="background: rgba(32, 20, 42, 0.8); border: 1px solid rgba(56,189,248,0.38); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                <div style="background: rgba(56, 189, 248, 0.2); color: #38bdf8; border-radius: 10px; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 16px rgba(56,189,248,0.25);">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                    <polyline points="17 6 23 6 23 12"></polyline>
                  </svg>
                </div>
                <span style="font-size: 12px; font-weight: 600; background: rgba(56, 189, 248, 0.18); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.35); border-radius: 12px; padding: 3px 10px;">العام القادم</span>
              </div>
              <h4 style="margin: 0 0 4px 0; font-size: 17px; color: #fff; font-weight: 700;">خطة العام القادم (٨ كنائس)</h4>
              <div style="font-size: 12px; color: #38bdf8; margin-bottom: 10px;">مرحلة مضاعفة الانتشار والتوسع (+١٠٠٪)</div>
              <ul style="margin: 0; padding-right: 18px; color: #cbd5e1; font-size: 13px; line-height: 1.7;">
                <li>مضاعفة نطاق الخدمة والتأثير بزيادة <strong>+١٠٠٪</strong> لنقل التجربة والأنشطة إلى <strong>٨ كنائس</strong> جديدة.</li>
                <li>التوسع في مناطق جغرافية أوسع والوصول لعدد أكبر من الأطفال لرسم البسمة على وجوههم.</li>
              </ul>
            </div>
            <div style="margin-top: 14px; padding-top: 10px; border-top: 1px dashed rgba(56,189,248,0.3); font-size: 12px; color: #38bdf8; font-weight: 600;">
              ✓ مضاعفة الأثر والوصول لـ ٨ كنائس
            </div>
          </div>

          <!-- Point 3: معسكر مبيت (Overnight Camp) -->
          <div class="gm-rule-card" style="background: rgba(32, 20, 42, 0.8); border: 1px solid rgba(251,191,36,0.38); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                <div style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border-radius: 10px; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 16px rgba(245,158,11,0.25);">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 20L12 4 5 20h14z"></path>
                    <path d="M12 4v16"></path>
                    <path d="M9 20l3-5 3 5"></path>
                  </svg>
                </div>
                <span style="font-size: 12px; font-weight: 600; background: rgba(245, 158, 11, 0.18); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.35); border-radius: 12px; padding: 3px 10px;">تطوير استراتيجي</span>
              </div>
              <h4 style="margin: 0 0 4px 0; font-size: 17px; color: #fff; font-weight: 700;">معسكر مبيت (Overnight Camp)</h4>
              <div style="font-size: 12px; color: #fbbf24; margin-bottom: 10px;">تعايش كشفي وبناء روحي وتربوي عميق</div>
              <ul style="margin: 0; padding-right: 18px; color: #cbd5e1; font-size: 13px; line-height: 1.7;">
                <li>الارتقاء بالخدمة من مجرد يوم ترفيهي محدود إلى <strong>معسكر مبيت متكامل (Overnight Camp)</strong>.</li>
                <li>إتاحة وقت حقيقي للتعايش، سهرات السمر الروحية، وبناء روابط وصداقات كشفية تدوم للأطفال.</li>
              </ul>
            </div>
            <div style="margin-top: 14px; padding-top: 10px; border-top: 1px dashed rgba(251,191,36,0.3); font-size: 12px; color: #fbbf24; font-weight: 600;">
              ✓ معسكر مبيت وتجربة تعايش متكاملة
            </div>
          </div>

        </div>

        <!-- Next Action: Reveal Collaboration -->
        <div style="display: flex; justify-content: center; align-items: center; margin-top: 16px;">
          <button class="sp5-reveal-btn" onclick="goToSp5Slide(4)" style="background: linear-gradient(135deg, rgba(168,85,247,0.35), rgba(236,72,153,0.35)); border: 1px solid rgba(236,72,153,0.6); color: #fff; border-radius: 30px; padding: 9px 24px; font-size: 13.5px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 10px; box-shadow: 0 4px 18px rgba(168,85,247,0.3); transition: all 0.25s ease;">
            <span>الخطوة التالية: إعلان الشراكة المستقبلية (رهط الوتر ✕ قلب ابتسامة)</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      </div>"""

# Replace Slide 3
slide_3_pattern = r'<!-- SLIDE 3: FUTURE PLANS.*?</div>\s*</div>\s*(?=<!-- SLIDE 4: COLLABORATION REVEAL)'
match = re.search(slide_3_pattern, content, re.DOTALL)
if match:
    content = content[:match.start()] + new_slide_3 + "\n\n" + content[match.end():]
    print("Slide 3 replaced successfully!")
else:
    print("ERROR: Could not match Slide 3 pattern!")

with open('c:/Users/Dell/Desktop/raht/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Saved index.html.")
