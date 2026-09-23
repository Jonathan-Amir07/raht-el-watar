import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('c:/Users/Dell/Desktop/raht/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# ── 1. NEW SLIDE 2: Clean 4 points without small text, adjusted compact frames ──
new_slide_2 = """      <!-- SLIDE 2: INTERNAL FEEDBACK (التقييم الداخلي: ٤ نقاط رئيسية بأحجام متناسقة) -->
      <div class="sp5-slide-pane" id="sp5-slide-2" style="display: none;">
        <div class="stage-badge-wrap" style="text-align: center; margin-bottom: 18px;">
          <span class="stage-badge" style="border-color: rgba(177,133,219,0.4); color: #d8b4fe;">
            التقييم الداخلي • الدروس المستفادة ميدانياً
          </span>
          <h3 class="stage-title" style="margin: 4px 0 0 0; font-size: 1.3rem;">أهم ٤ دروس وتحديات عملية واجهت فريق رهط الوتر</h3>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; max-width: 980px; margin: 30px auto;">
          
          <!-- 1. الشمس -->
          <div class="gm-rule-card" style="background: rgba(32, 20, 42, 0.82); border: 1px solid rgba(251,191,36,0.4); border-radius: 16px; padding: 26px 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; text-align: center; box-shadow: 0 6px 20px rgba(0,0,0,0.35); transition: all 0.3s ease;">
            <div style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border-radius: 14px; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 18px rgba(245,158,11,0.3);">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
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
            <h4 style="margin: 0; font-size: 21px; color: #fff; font-weight: 700; letter-spacing: 0.3px;">الشمس</h4>
          </div>

          <!-- 2. المياه -->
          <div class="gm-rule-card" style="background: rgba(32, 20, 42, 0.82); border: 1px solid rgba(56,189,248,0.4); border-radius: 16px; padding: 26px 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; text-align: center; box-shadow: 0 6px 20px rgba(0,0,0,0.35); transition: all 0.3s ease;">
            <div style="background: rgba(56, 189, 248, 0.2); color: #38bdf8; border-radius: 14px; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 18px rgba(56,189,248,0.3);">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
              </svg>
            </div>
            <h4 style="margin: 0; font-size: 21px; color: #fff; font-weight: 700; letter-spacing: 0.3px;">المياه</h4>
          </div>

          <!-- 3. تغير التحضير -->
          <div class="gm-rule-card" style="background: rgba(32, 20, 42, 0.82); border: 1px solid rgba(52,211,153,0.4); border-radius: 16px; padding: 26px 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; text-align: center; box-shadow: 0 6px 20px rgba(0,0,0,0.35); transition: all 0.3s ease;">
            <div style="background: rgba(52, 211, 153, 0.2); color: #34d399; border-radius: 14px; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 18px rgba(52,211,153,0.3);">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
            </div>
            <h4 style="margin: 0; font-size: 21px; color: #fff; font-weight: 700; letter-spacing: 0.3px;">تغير التحضير</h4>
          </div>

          <!-- 4. الترامبولين -->
          <div class="gm-rule-card" style="background: rgba(32, 20, 42, 0.82); border: 1px solid rgba(192,132,252,0.4); border-radius: 16px; padding: 26px 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; text-align: center; box-shadow: 0 6px 20px rgba(0,0,0,0.35); transition: all 0.3s ease;">
            <div style="background: rgba(192, 132, 252, 0.2); color: #c084fc; border-radius: 14px; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 18px rgba(192,132,252,0.3);">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
            </div>
            <h4 style="margin: 0; font-size: 21px; color: #fff; font-weight: 700; letter-spacing: 0.3px;">الترامبولين</h4>
          </div>
        </div>
      </div>"""

# Replace Slide 2
slide_2_pattern = r'<!-- SLIDE 2: INTERNAL FEEDBACK.*?</div>\s*</div>\s*(?=<!-- SLIDE 3: FUTURE PLANS)'
match_s2 = re.search(slide_2_pattern, content, re.DOTALL)
if match_s2:
    content = content[:match_s2.start()] + new_slide_2 + "\n\n" + content[match_s2.end():]
    print("Slide 2 updated: removed small text and adjusted frame sizes.")
else:
    print("ERROR: Could not match Slide 2 pattern!")

# ── 2. LAST PAGE (SLIDE 4): DARK BLUE BACKGROUND FOR CIRCLE AROUND OUR LOGO ──
old_watar_circle = r'<div style="width: 135px; height: 135px; border-radius: 50%; background: radial-gradient\(circle, rgba\(177,133,219,0\.25\) 0%, rgba\(30,15,45,0\.7\) 100%\); border: 2px solid rgba\(177,133,219,0\.5\); display: flex; align-items: center; justify-content: center; padding: 14px; box-shadow: 0 0 25px rgba\(177,133,219,0\.35\);">'
new_watar_circle = '<div style="width: 135px; height: 135px; border-radius: 50%; background: radial-gradient(circle, #1e3a8a 0%, #0f224a 65%, #071329 100%); border: 2.5px solid rgba(59, 130, 246, 0.7); display: flex; align-items: center; justify-content: center; padding: 14px; box-shadow: 0 0 30px rgba(37, 99, 235, 0.5), inset 0 0 15px rgba(30, 58, 138, 0.4);">'

match_circle = re.search(old_watar_circle, content)
if match_circle:
    content = content[:match_circle.start()] + new_watar_circle + content[match_circle.end():]
    print("Updated Watar logo circle background to dark blue.")
else:
    print("Warning: old_watar_circle not matched by exact regex, attempting flexible search...")
    # fallback flexible regex
    flex_pattern = r'(<div class="collab-logo-box"[^>]*>\s*<div style="[^"]*border-radius:\s*50%;)[^"]*(">\s*<img src="assets/watar-logo\.png")'
    content = re.sub(flex_pattern, r'\g<1>width: 135px; height: 135px; background: radial-gradient(circle, #1e3a8a 0%, #0f224a 65%, #071329 100%); border: 2.5px solid rgba(59, 130, 246, 0.7); display: flex; align-items: center; justify-content: center; padding: 14px; box-shadow: 0 0 30px rgba(37, 99, 235, 0.5), inset 0 0 15px rgba(30, 58, 138, 0.4);\2', content)
    print("Flexible replacement executed.")

# Update the badge under watar logo to match dark blue
content = re.sub(
    r'(<span style="font-size: 11\.5px; color: )#c084fc; background: rgba\(192,132,252,0\.15\); padding: 2px 10px; border-radius: 10px; border: 1px solid rgba\(192,132,252,0\.3\);(">عشيرة الجوالة</span>)',
    r'\g<1>#60a5fa; background: rgba(37, 99, 235, 0.2); padding: 2px 10px; border-radius: 10px; border: 1px solid rgba(59, 130, 246, 0.4);\2',
    content
)

# Update return button in Slide 4
content = content.replace(
    '<span>العودة لجداول الكنائس</span>',
    '<span>العودة للخطط المستقبلية</span>'
)

with open('c:/Users/Dell/Desktop/raht/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Saved updated index.html.")
