import sys
import re

with open('c:/Users/Dell/Desktop/raht/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Curtains Opened CSS
old_curtain_opened_css = '''    /* Opened Curtains State */
    .collab-curtains-wrap.opened .theater-curtain-left {
      transform: translateX(-104%) scaleX(0.28) skewY(2deg);
      opacity: 0.75;
    }
    .collab-curtains-wrap.opened .theater-curtain-right {
      transform: translateX(104%) scaleX(0.28) skewY(-2deg);
      opacity: 0.75;
    }
    .collab-curtains-wrap.opened .curtain-center-cord {
      opacity: 0;
      transform: scale(0.5);
    }
    .collab-curtains-wrap.opened .curtain-start-prompt {
      opacity: 0;
      pointer-events: none;
    }'''

new_curtain_opened_css = '''    /* Opened Curtains State */
    .collab-curtains-wrap.opened {
      pointer-events: none !important;
    }
    .collab-curtains-wrap.opened .theater-curtain-left {
      transform: translateX(-110%) scaleX(0.12) !important;
      opacity: 0 !important;
      transition: transform 1.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 1.3s ease !important;
    }
    .collab-curtains-wrap.opened .theater-curtain-right {
      transform: translateX(110%) scaleX(0.12) !important;
      opacity: 0 !important;
      transition: transform 1.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 1.3s ease !important;
    }
    .collab-curtains-wrap.opened .theater-valance {
      transform: translateY(-105%) !important;
      opacity: 0 !important;
      transition: transform 1.2s ease 0.2s, opacity 1s ease 0.2s !important;
    }
    .collab-curtains-wrap.opened .curtain-center-cord {
      opacity: 0 !important;
      transform: scale(0) !important;
      transition: all 0.35s ease !important;
    }
    .collab-curtains-wrap.opened .curtain-start-prompt {
      opacity: 0 !important;
      pointer-events: none !important;
      transform: translate(-50%, -50%) scale(0.5) !important;
      transition: all 0.35s ease !important;
    }'''

if old_curtain_opened_css not in content:
    print("ERROR: old_curtain_opened_css not found!")
    sys.exit(1)

content = content.replace(old_curtain_opened_css, new_curtain_opened_css, 1)

# 2. Update theater-curtain transition for super smooth feel
old_curtain_rule = '''    .theater-curtain {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 50.5%;
      background: repeating-linear-gradient(90deg, #3d0208 0px, #700714 18px, #260105 36px, #8c0c1b 54px, #200104 72px);
      box-shadow: inset -15px 0 35px rgba(0,0,0,0.85), 6px 0 25px rgba(0,0,0,0.7);
      transition: transform 1.4s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.8s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 31;
    }'''

new_curtain_rule = '''    .theater-curtain {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 50.5%;
      background: repeating-linear-gradient(90deg, #3d0208 0px, #700714 18px, #260105 36px, #8c0c1b 54px, #200104 72px);
      box-shadow: inset -15px 0 35px rgba(0,0,0,0.85), 6px 0 25px rgba(0,0,0,0.7);
      transition: transform 1.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 1.3s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 31;
      cursor: pointer;
    }'''

if old_curtain_rule not in content:
    print("ERROR: old_curtain_rule not found!")
    sys.exit(1)

content = content.replace(old_curtain_rule, new_curtain_rule, 1)

# 3. Update HTML curtain elements to ensure all have onclick
old_curtains_html = '''          <!-- THE GRAND THEATER CURTAINS OVERLAY -->
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

new_curtains_html = '''          <!-- THE GRAND THEATER CURTAINS OVERLAY -->
          <div id="collab-curtains-wrap" class="collab-curtains-wrap" onclick="triggerGrandCollabReveal(event)" title="انقر لافتتاح الستار والحدث الكبير">
            
            <!-- Top Theater Pelmet / Valance with Gold Bullion Fringe -->
            <div class="theater-valance" onclick="triggerGrandCollabReveal(event)">
              <div class="valance-gold-trim"></div>
            </div>

            <!-- Left Heavy Velvet Curtain -->
            <div id="collab-curtain-left" class="theater-curtain theater-curtain-left" onclick="triggerGrandCollabReveal(event)">
              <div class="curtain-gold-bottom"></div>
            </div>

            <!-- Right Heavy Velvet Curtain -->
            <div id="collab-curtain-right" class="theater-curtain theater-curtain-right" onclick="triggerGrandCollabReveal(event)">
              <div class="curtain-gold-bottom"></div>
            </div>

            <!-- Golden Center Tie / Cord -->
            <div id="curtain-center-cord" class="curtain-center-cord" onclick="triggerGrandCollabReveal(event)">
              <div class="cord-knot">✦</div>
            </div>

            <!-- Interactive Reveal Prompt -->
            <div id="curtain-start-prompt" class="curtain-start-prompt" onclick="triggerGrandCollabReveal(event)">
              <div class="drum-pulse-icon" style="font-size: 32px; animation: drumBounce 1s infinite alternate;">🥁</div>
              <span style="font-size: 16px; font-weight: 700; color: #fff;">انقر هنا أو على الستار لافتتاح الحدث الكبير</span>
              <small style="color: #fbbf24; font-size: 11.5px; font-weight: 600;">Grand Orchestral Drumroll Reveal 🎬</small>
            </div>

          </div>'''

if old_curtains_html not in content:
    print("ERROR: old_curtains_html not found!")
    sys.exit(1)

content = content.replace(old_curtains_html, new_curtains_html, 1)

# 4. Update triggerGrandCollabReveal to open immediately upon tap, building into the climax
old_trigger_fn = '''    function triggerGrandCollabReveal() {
      if (isGrandRevealActive) return;
      isGrandRevealActive = true;

      const stage = document.getElementById('collab-grand-stage');
      const curtainsWrap = document.getElementById('collab-curtains-wrap');
      const mainCard = document.getElementById('collab-main-card');
      const godRays = document.getElementById('collab-god-rays');
      const flash = document.getElementById('collab-stage-flash');
      const spotlights = stage ? stage.querySelectorAll('.collab-spotlight') : [];

      if (!curtainsWrap || !mainCard) {
        isGrandRevealActive = false;
        return;
      }

      // 1. Reset stage to CLOSED dramatic anticipation state
      curtainsWrap.classList.remove('opened');
      mainCard.classList.remove('stage-revealed');
      mainCard.classList.add('stage-hidden');
      if (godRays) godRays.classList.remove('active');
      if (flash) flash.classList.remove('flash');
      spotlights.forEach(sp => sp.classList.add('active'));

      // 2. Play dramatic drums sound effect
      playDramaticDrumrollReveal();

      // 3. Climax at 1.7s: Open curtains with velocity, flash, fanfare, and musical burst
      setTimeout(() => {
        // Flash of light
        if (flash) {
          flash.classList.add('flash');
          setTimeout(() => flash.classList.remove('flash'), 650);
        }

        // Part curtains
        curtainsWrap.classList.add('opened');

        // Turn on God rays
        if (godRays) godRays.classList.add('active');

        // Zoom in centerpiece
        mainCard.classList.remove('stage-hidden');
        mainCard.classList.add('stage-revealed');

        // Burst musical notes
        spawnMusicalConfetti();

        // Release lock
        setTimeout(() => {
          isGrandRevealActive = false;
        }, 2200);
      }, 1700);
    }'''

new_trigger_fn = '''    function triggerGrandCollabReveal(e) {
      if (e && e.stopPropagation) e.stopPropagation();
      if (isGrandRevealActive) return;
      isGrandRevealActive = true;

      const stage = document.getElementById('collab-grand-stage');
      const curtainsWrap = document.getElementById('collab-curtains-wrap');
      const mainCard = document.getElementById('collab-main-card');
      const godRays = document.getElementById('collab-god-rays');
      const flash = document.getElementById('collab-stage-flash');
      const spotlights = stage ? stage.querySelectorAll('.collab-spotlight') : [];

      if (!curtainsWrap || !mainCard) {
        isGrandRevealActive = false;
        return;
      }

      // 1. Instantly begin parting curtains & spotlights on tap!
      curtainsWrap.classList.add('opened');
      spotlights.forEach(sp => sp.classList.add('active'));

      // Reveal centerpiece smoothly as curtains part
      mainCard.classList.remove('stage-hidden');
      mainCard.classList.add('stage-revealed');

      // 2. Play the dramatic drums sound effect (accelerating snare crescendo roll + timpani)
      playDramaticDrumrollReveal();

      // 3. Climax at 1.3s: Flash of light, rotating God rays, and explosive musical confetti burst!
      setTimeout(() => {
        if (flash) {
          flash.classList.add('flash');
          setTimeout(() => flash.classList.remove('flash'), 700);
        }

        if (godRays) {
          godRays.classList.add('active');
        }

        spawnMusicalConfetti();

        // Release lock after reveal finishes
        setTimeout(() => {
          isGrandRevealActive = false;
        }, 1800);
      }, 1300);
    }'''

if old_trigger_fn not in content:
    print("ERROR: old_trigger_fn not found!")
    sys.exit(1)

content = content.replace(old_trigger_fn, new_trigger_fn, 1)

with open('c:/Users/Dell/Desktop/raht/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully applied immediate-open curtain updates!")
