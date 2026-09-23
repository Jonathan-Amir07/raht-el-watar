import sys
import re

with open('c:/Users/Dell/Desktop/raht/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Slide 4 HTML
slide4_old = '''<!-- SLIDE 4: COLLABORATION REVEAL (Grand Reveal from Behind Grand Curtains with Drums Sound & Crazy Musical Effects) -->
      <div class="sp5-slide-pane" id="sp5-slide-4" style="display: none;">
        <div class="stage-badge-wrap" style="text-align: center; margin-bottom: 12px;">
          <span class="stage-badge" style="border-color: rgba(236,72,153,0.4); color: #f472b6; background: rgba(236,72,153,0.12);">
            رؤية استراتيجية واعدة • الشراكة المستقبلية
          </span>
          <h3 class="stage-title" style="margin: 4px 0 0 0; font-size: 1.35rem;">تعاون مشترك لنشر الفرح والخدمة</h3>
        </div>

        <!-- Grand Theater Reveal Container -->
        <div id="collab-grand-stage" class="collab-grand-stage">

          <!-- Rotating God Rays Background -->
          <div id="collab-god-rays" class="collab-god-rays"></div>

          <!-- Dual Sweeping Spotlights -->
          <div class="collab-spotlight collab-spotlight-left"></div>
          <div class="collab-spotlight collab-spotlight-right"></div>

          <!-- White / Gold Climax Flash -->
          <div id="collab-stage-flash" class="collab-stage-flash"></div>

          <!-- Musical Particles Container -->
          <div id="collab-notes-container" class="collab-notes-container"></div>

          <!-- Centerpiece Collaboration Stage Content -->
          <div id="collab-main-card" class="collab-main-card gm-rule-card" style="background: radial-gradient(circle at 50% 30%, rgba(55, 20, 70, 0.88) 0%, rgba(20, 12, 30, 0.96) 100%); border: 1.5px solid rgba(236, 72, 153, 0.4); border-radius: 20px; padding: 22px 28px; text-align: center; position: relative; z-index: 10;">'''

slide4_new = '''<!-- SLIDE 4: COLLABORATION REVEAL (Grand Reveal from Behind Grand Curtains with Drums Sound & Crazy Musical Effects) -->
      <div class="sp5-slide-pane" id="sp5-slide-4" style="display: none; padding-top: 0; margin-top: -6px;">

        <!-- Grand Theater Reveal Container -->
        <div id="collab-grand-stage" class="collab-grand-stage">

          <!-- Rotating God Rays Background -->
          <div id="collab-god-rays" class="collab-god-rays"></div>

          <!-- Dual Sweeping Spotlights -->
          <div class="collab-spotlight collab-spotlight-left"></div>
          <div class="collab-spotlight collab-spotlight-right"></div>

          <!-- White / Gold Climax Flash -->
          <div id="collab-stage-flash" class="collab-stage-flash"></div>

          <!-- Musical Particles Container -->
          <div id="collab-notes-container" class="collab-notes-container"></div>

          <!-- Centerpiece Collaboration Stage Content -->
          <div id="collab-main-card" class="collab-main-card gm-rule-card stage-hidden" style="background: radial-gradient(circle at 50% 30%, rgba(55, 20, 70, 0.88) 0%, rgba(20, 12, 30, 0.96) 100%); border: 1.5px solid rgba(236, 72, 153, 0.4); border-radius: 20px; padding: 26px 30px; text-align: center; position: relative; z-index: 10; min-height: 540px; display: flex; flex-direction: column; justify-content: space-around;">'''

if slide4_old not in content:
    print("ERROR: slide4_old block not found!")
    sys.exit(1)

content = content.replace(slide4_old, slide4_new, 1)

# 2. Update Curtains HTML (remove drawings / crests, make entire curtains clickable)
curtains_old = '''          <!-- THE GRAND THEATER CURTAINS OVERLAY -->
          <div id="collab-curtains-wrap" class="collab-curtains-wrap">
            
            <!-- Top Theater Pelmet / Valance with Gold Bullion Fringe -->
            <div class="theater-valance">
              <div class="valance-gold-trim"></div>
            </div>

            <!-- Left Heavy Velvet Curtain -->
            <div id="collab-curtain-left" class="theater-curtain theater-curtain-left">
              <div class="curtain-gold-bottom"></div>
              <div class="curtain-crest-wrap">
                <div class="curtain-crest-icon">𝄞</div>
                <div class="curtain-crest-text">رهط الوتر</div>
              </div>
            </div>

            <!-- Right Heavy Velvet Curtain -->
            <div id="collab-curtain-right" class="theater-curtain theater-curtain-right">
              <div class="curtain-gold-bottom"></div>
              <div class="curtain-crest-wrap">
                <div class="curtain-crest-icon">𝄢</div>
                <div class="curtain-crest-text">قلب ابتسامة</div>
              </div>
            </div>

            <!-- Golden Center Tie / Cord -->
            <div id="curtain-center-cord" class="curtain-center-cord">
              <div class="cord-knot">✦</div>
            </div>

            <!-- Interactive Reveal Prompt -->
            <div id="curtain-start-prompt" class="curtain-start-prompt" onclick="triggerGrandCollabReveal()">
              <div class="drum-pulse-icon">🥁</div>
              <span style="font-size: 15px; font-weight: 700;">انقر لافتتاح الستار والحدث الكبير</span>
              <small style="color: #fbbf24; font-size: 11px;">Grand Orchestral Reveal</small>
            </div>

          </div>'''

curtains_new = '''          <!-- THE GRAND THEATER CURTAINS OVERLAY -->
          <div id="collab-curtains-wrap" class="collab-curtains-wrap" onclick="triggerGrandCollabReveal()" title="انقر لافتتاح الستار والحدث الكبير">
            
            <!-- Top Theater Pelmet / Valance with Gold Bullion Fringe -->
            <div class="theater-valance">
              <div class="valance-gold-trim"></div>
            </div>

            <!-- Left Heavy Velvet Curtain -->
            <div id="collab-curtain-left" class="theater-curtain theater-curtain-left">
              <div class="curtain-gold-bottom"></div>
            </div>

            <!-- Right Heavy Velvet Curtain -->
            <div id="collab-curtain-right" class="theater-curtain theater-curtain-right">
              <div class="curtain-gold-bottom"></div>
            </div>

            <!-- Golden Center Tie / Cord -->
            <div id="curtain-center-cord" class="curtain-center-cord">
              <div class="cord-knot">✦</div>
            </div>

            <!-- Interactive Reveal Prompt -->
            <div id="curtain-start-prompt" class="curtain-start-prompt" onclick="triggerGrandCollabReveal()">
              <div class="drum-pulse-icon" style="font-size: 32px; animation: drumBounce 1s infinite alternate;">🥁</div>
              <span style="font-size: 16px; font-weight: 700; color: #fff;">انقر هنا أو على الستار لافتتاح الحدث الكبير</span>
              <small style="color: #fbbf24; font-size: 11.5px; font-weight: 600;">Grand Orchestral Drumroll Reveal 🎬</small>
            </div>

          </div>'''

if curtains_old not in content:
    print("ERROR: curtains_old block not found!")
    sys.exit(1)

content = content.replace(curtains_old, curtains_new, 1)

# 3. Update CSS
css_old = '''.collab-grand-stage {
      position: relative;
      overflow: hidden;
      border-radius: 24px;
      min-height: 520px;
      background: radial-gradient(circle at 50% 30%, #150522 0%, #08020d 100%);
      box-shadow: 0 15px 45px rgba(0,0,0,0.7), 0 0 35px rgba(177,133,219,0.3);
    }'''

css_new = '''.collab-grand-stage {
      position: relative;
      overflow: hidden;
      border-radius: 24px;
      min-height: 560px;
      background: radial-gradient(circle at 50% 30%, #150522 0%, #08020d 100%);
      box-shadow: 0 15px 45px rgba(0,0,0,0.7), 0 0 35px rgba(177,133,219,0.3);
    }'''

if css_old in content:
    content = content.replace(css_old, css_new, 1)
else:
    print("WARNING: css_old not found verbatim!")

css_curtains_old = '''    /* The Curtains Overlay */
    .collab-curtains-wrap {
      position: absolute;
      inset: 0;
      z-index: 30;
      overflow: hidden;
      border-radius: 24px;
      pointer-events: none;
    }'''

css_curtains_new = '''    /* The Curtains Overlay */
    .collab-curtains-wrap {
      position: absolute;
      inset: 0;
      z-index: 30;
      overflow: hidden;
      border-radius: 24px;
      pointer-events: auto;
      cursor: pointer;
    }
    .collab-curtains-wrap:not(.opened):hover .theater-curtain {
      filter: brightness(1.08);
    }
    .collab-curtains-wrap:not(.opened):hover .curtain-start-prompt {
      transform: translate(-50%, -50%) scale(1.05);
      box-shadow: 0 12px 35px rgba(0,0,0,0.9), 0 0 35px rgba(251,191,36,0.7);
    }
    @keyframes drumBounce {
      0% { transform: scale(1); }
      100% { transform: scale(1.18); }
    }'''

if css_curtains_old in content:
    content = content.replace(css_curtains_old, css_curtains_new, 1)
else:
    print("WARNING: css_curtains_old not found verbatim!")

# 4. Update JS: reset function and prevent auto-open
js_old = '''      // Auto-trigger Grand Reveal when arriving at Slide 4!
      if (slideNum === 4) {
        setTimeout(() => {
          triggerGrandCollabReveal();
        }, 150);
      }'''

js_new = '''      // Slide 4: Keep curtains closed until user taps (Manual Reveal)
      if (slideNum === 4) {
        resetGrandCollabCurtain();
      }'''

if js_old not in content:
    print("ERROR: js_old block not found!")
    sys.exit(1)

content = content.replace(js_old, js_new, 1)

# Add resetGrandCollabCurtain right before triggerGrandCollabReveal
js_trigger_old = 'function triggerGrandCollabReveal() {'
js_trigger_new = '''function resetGrandCollabCurtain() {
      isGrandRevealActive = false;
      const curtainsWrap = document.getElementById('collab-curtains-wrap');
      const mainCard = document.getElementById('collab-main-card');
      const godRays = document.getElementById('collab-god-rays');
      const flash = document.getElementById('collab-stage-flash');
      const spotlights = document.querySelectorAll('#collab-grand-stage .collab-spotlight');

      if (curtainsWrap) {
        curtainsWrap.classList.remove('opened');
      }
      if (mainCard) {
        mainCard.classList.remove('stage-revealed');
        mainCard.classList.add('stage-hidden');
      }
      if (godRays) {
        godRays.classList.remove('active');
      }
      if (flash) {
        flash.classList.remove('flash');
      }
      spotlights.forEach(sp => sp.classList.add('active'));
    }

    function triggerGrandCollabReveal() {'''

if js_trigger_old not in content:
    print("ERROR: js_trigger_old not found!")
    sys.exit(1)

content = content.replace(js_trigger_old, js_trigger_new, 1)

with open('c:/Users/Dell/Desktop/raht/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully applied updates to index.html!")
