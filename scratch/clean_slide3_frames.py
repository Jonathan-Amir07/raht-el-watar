import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('c:/Users/Dell/Desktop/raht/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Build New Slide 3: 3 sleek compact points matching Slide 2 aesthetic
new_slide_3 = """      <!-- SLIDE 3: FUTURE PLANS (3 Points: This year 4 churches, Next year 8 churches, Overnight Camp - Compact Frames) -->
      <div class="sp5-slide-pane" id="sp5-slide-3" style="display: none;">
        <div class="stage-badge-wrap" style="text-align: center; margin-bottom: 18px;">
          <span class="stage-badge" style="border-color: rgba(177,133,219,0.4); color: #d8b4fe;">
            الرؤية المستقبلية • مسارات التوسع والتطوير
          </span>
          <h3 class="stage-title" style="margin: 4px 0 0 0; font-size: 1.3rem;">الخطط المستقبلية لانتشار وتطوير خدمة رهط الوتر</h3>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; max-width: 960px; margin: 30px auto;">
          
          <!-- Point 1: هذا العام ٤ كنائس -->
          <div class="gm-rule-card" style="background: rgba(32, 20, 42, 0.82); border: 1px solid rgba(168,85,247,0.4); border-radius: 16px; padding: 26px 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; text-align: center; box-shadow: 0 6px 20px rgba(0,0,0,0.35); transition: all 0.3s ease;">
            <div style="background: rgba(168, 85, 247, 0.2); color: #c084fc; border-radius: 14px; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 18px rgba(168,85,247,0.3);">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <h4 style="margin: 0; font-size: 20px; color: #fff; font-weight: 700; letter-spacing: 0.3px;">خطة هذا العام (٤ كنائس)</h4>
          </div>

          <!-- Point 2: العام القادم ٨ كنائس -->
          <div class="gm-rule-card" style="background: rgba(32, 20, 42, 0.82); border: 1px solid rgba(56,189,248,0.4); border-radius: 16px; padding: 26px 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; text-align: center; box-shadow: 0 6px 20px rgba(0,0,0,0.35); transition: all 0.3s ease;">
            <div style="background: rgba(56, 189, 248, 0.2); color: #38bdf8; border-radius: 14px; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 18px rgba(56,189,248,0.3);">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
              </svg>
            </div>
            <h4 style="margin: 0; font-size: 20px; color: #fff; font-weight: 700; letter-spacing: 0.3px;">خطة العام القادم (٨ كنائس)</h4>
          </div>

          <!-- Point 3: معسكر مبيت (Overnight Camp) -->
          <div class="gm-rule-card" style="background: rgba(32, 20, 42, 0.82); border: 1px solid rgba(251,191,36,0.4); border-radius: 16px; padding: 26px 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; text-align: center; box-shadow: 0 6px 20px rgba(0,0,0,0.35); transition: all 0.3s ease;">
            <div style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border-radius: 14px; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 18px rgba(245,158,11,0.3);">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 20L12 4 5 20h14z"></path>
                <path d="M12 4v16"></path>
                <path d="M9 20l3-5 3 5"></path>
              </svg>
            </div>
            <h4 style="margin: 0; font-size: 20px; color: #fff; font-weight: 700; letter-spacing: 0.3px;">معسكر مبيت (Overnight Camp)</h4>
          </div>

        </div>

        <!-- Next Action: Reveal Collaboration -->
        <div style="display: flex; justify-content: center; align-items: center; margin-top: 20px;">
          <button class="sp5-reveal-btn" onclick="goToSp5Slide(4)" style="background: linear-gradient(135deg, rgba(168,85,247,0.35), rgba(236,72,153,0.35)); border: 1px solid rgba(236,72,153,0.6); color: #fff; border-radius: 30px; padding: 9px 26px; font-size: 13.5px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 10px; box-shadow: 0 4px 18px rgba(168,85,247,0.3); transition: all 0.25s ease;">
            <span>الخطوة التالية: إعلان الشراكة المستقبلية (رهط الوتر ✕ قلب ابتسامة)</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      </div>"""

# Replace Slide 3
slide_3_pattern = r'<!-- SLIDE 3: FUTURE PLANS.*?</div>\s*</div>\s*(?=<!-- SLIDE 4: COLLABORATION REVEAL)'
match_s3 = re.search(slide_3_pattern, content, re.DOTALL)
if match_s3:
    content = content[:match_s3.start()] + new_slide_3 + "\n\n" + content[match_s3.end():]
    print("Slide 3 updated: removed small text and adjusted frame sizes.")
else:
    print("ERROR: Could not match Slide 3 pattern!")

with open('c:/Users/Dell/Desktop/raht/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Saved updated index.html.")
