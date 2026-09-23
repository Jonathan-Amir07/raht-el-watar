import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('c:/Users/Dell/Desktop/raht/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# ── 1. THEATRICAL GRAND CURTAIN & MUSICAL REVEAL CSS ──
grand_reveal_css = """
    /* ── Theatrical Grand Curtain & Crazy Musical Effects ── */
    .collab-grand-stage {
      position: relative;
      overflow: hidden;
      border-radius: 24px;
      min-height: 520px;
      background: radial-gradient(circle at 50% 30%, #150522 0%, #08020d 100%);
      box-shadow: 0 15px 45px rgba(0,0,0,0.7), 0 0 35px rgba(177,133,219,0.3);
    }
    
    /* Rotating God Rays */
    .collab-god-rays {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 1200px;
      height: 1200px;
      transform: translate(-50%, -50%);
      background: conic-gradient(from 0deg at 50% 50%,
        rgba(251,191,36,0.3) 0deg, transparent 20deg,
        rgba(59,130,246,0.35) 40deg, transparent 60deg,
        rgba(236,72,153,0.35) 80deg, transparent 100deg,
        rgba(168,85,247,0.3) 120deg, transparent 140deg,
        rgba(251,191,36,0.3) 160deg, transparent 180deg,
        rgba(59,130,246,0.35) 200deg, transparent 220deg,
        rgba(236,72,153,0.35) 240deg, transparent 260deg,
        rgba(168,85,247,0.3) 280deg, transparent 300deg,
        rgba(251,191,36,0.3) 320deg, transparent 340deg,
        rgba(236,72,153,0.3) 360deg);
      pointer-events: none;
      z-index: 1;
      opacity: 0;
      transition: opacity 1.2s ease;
      animation: rotateRays 22s linear infinite;
    }
    .collab-god-rays.active {
      opacity: 0.85;
    }
    @keyframes rotateRays {
      0% { transform: translate(-50%, -50%) rotate(0deg); }
      100% { transform: translate(-50%, -50%) rotate(360deg); }
    }

    /* Dual Theatrical Sweeping Spotlights */
    .collab-spotlight {
      position: absolute;
      top: -150px;
      width: 320px;
      height: 700px;
      pointer-events: none;
      z-index: 3;
      background: radial-gradient(ellipse at 50% 10%, rgba(255,255,255,0.45) 0%, rgba(251,191,36,0.18) 40%, transparent 75%);
      transform-origin: top center;
      opacity: 0;
      transition: opacity 0.8s ease;
    }
    .collab-spotlight-left {
      left: 15%;
      animation: sweepSpotLeft 4s ease-in-out infinite alternate;
    }
    .collab-spotlight-right {
      right: 15%;
      animation: sweepSpotRight 4s ease-in-out infinite alternate;
    }
    .collab-spotlight.active {
      opacity: 0.9;
    }
    @keyframes sweepSpotLeft {
      0% { transform: rotate(-25deg); }
      100% { transform: rotate(10deg); }
    }
    @keyframes sweepSpotRight {
      0% { transform: rotate(25deg); }
      100% { transform: rotate(-10deg); }
    }

    /* Explosive Flash at Climax */
    .collab-stage-flash {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(251,191,36,0.6) 50%, transparent 85%);
      z-index: 35;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.6s ease-out;
    }
    .collab-stage-flash.flash {
      opacity: 1;
      transition: none;
    }

    /* Floating Musical Confetti Particle */
    .collab-notes-container {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 25;
      overflow: hidden;
    }
    .collab-musical-note {
      position: absolute;
      pointer-events: none;
      font-size: 28px;
      font-weight: bold;
      user-select: none;
      animation: floatNote 2.4s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
    }
    @keyframes floatNote {
      0% {
        opacity: 1;
        transform: translate(0, 0) scale(0.3) rotate(0deg);
      }
      80% {
        opacity: 0.9;
      }
      100% {
        opacity: 0;
        transform: translate(var(--tx), var(--ty)) scale(1.6) rotate(var(--rot));
      }
    }

    /* Centerpiece Card Entrance Animation */
    .collab-main-card {
      transition: transform 1.2s cubic-bezier(0.16, 1, 0.3, 1), filter 1s ease, opacity 0.8s ease;
    }
    .collab-main-card.stage-hidden {
      transform: scale(0.68) translateY(20px);
      filter: blur(8px);
      opacity: 0;
    }
    .collab-main-card.stage-revealed {
      transform: scale(1) translateY(0);
      filter: blur(0);
      opacity: 1;
    }

    /* The Curtains Overlay */
    .collab-curtains-wrap {
      position: absolute;
      inset: 0;
      z-index: 30;
      overflow: hidden;
      border-radius: 24px;
      pointer-events: none;
    }
    .theater-valance {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 48px;
      z-index: 35;
      background: linear-gradient(180deg, #4a020a 0%, #7d0817 60%, #300106 100%);
      box-shadow: 0 5px 20px rgba(0,0,0,0.85);
      border-bottom: 3px solid #fbbf24;
    }
    .valance-gold-trim {
      position: absolute;
      bottom: -7px;
      left: 0;
      right: 0;
      height: 7px;
      background: repeating-linear-gradient(90deg, #b45309 0px, #fbbf24 4px, #78350f 8px, #f59e0b 12px);
    }
    .theater-curtain {
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
    }
    .theater-curtain-left {
      left: 0;
      transform-origin: left center;
    }
    .theater-curtain-right {
      right: 0;
      transform-origin: right center;
    }
    .curtain-gold-bottom {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 12px;
      background: repeating-linear-gradient(90deg, #b45309 0px, #fbbf24 4px, #78350f 8px, #f59e0b 12px);
      box-shadow: 0 -2px 8px rgba(0,0,0,0.6);
    }
    .curtain-crest-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      color: #fbbf24;
      text-shadow: 0 0 15px rgba(251,191,36,0.6);
      opacity: 0.9;
    }
    .curtain-crest-icon {
      font-size: 64px;
      line-height: 1;
      filter: drop-shadow(0 4px 10px rgba(0,0,0,0.8));
    }
    .curtain-crest-text {
      font-size: 15px;
      font-weight: 800;
      background: rgba(0,0,0,0.4);
      padding: 3px 12px;
      border-radius: 12px;
      border: 1px solid rgba(251,191,36,0.4);
    }
    
    /* Opened Curtains State */
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
    }

    /* Golden Center Cord */
    .curtain-center-cord {
      position: absolute;
      top: 48px;
      bottom: 20px;
      left: 50%;
      width: 4px;
      transform: translateX(-50%);
      background: linear-gradient(180deg, #fbbf24 0%, #b45309 50%, #f59e0b 100%);
      box-shadow: 0 0 12px rgba(251,191,36,0.7);
      z-index: 34;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.5s ease;
    }
    .cord-knot {
      color: #fbbf24;
      font-size: 20px;
      background: #4a020a;
      border: 2px solid #fbbf24;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 15px rgba(251,191,36,0.8);
    }

    /* Interactive Start Prompt */
    .curtain-start-prompt {
      position: absolute;
      top: 55%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 36;
      background: rgba(15, 7, 24, 0.88);
      border: 2px solid #fbbf24;
      color: #fff;
      border-radius: 30px;
      padding: 12px 28px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.8), 0 0 25px rgba(251,191,36,0.5);
      animation: promptPulse 2s infinite ease-in-out;
      pointer-events: auto;
      transition: all 0.4s ease;
    }
    .curtain-start-prompt:hover {
      transform: translate(-50%, -50%) scale(1.06);
      background: rgba(35, 12, 50, 0.95);
      border-color: #fde047;
    }
    .drum-pulse-icon {
      font-size: 32px;
      animation: drumBounce 0.8s infinite alternate ease-in-out;
    }
    @keyframes promptPulse {
      0%, 100% { box-shadow: 0 0 20px rgba(251,191,36,0.4); }
      50% { box-shadow: 0 0 35px rgba(251,191,36,0.8); }
    }
    @keyframes drumBounce {
      0% { transform: translateY(0) scale(1); }
      100% { transform: translateY(-4px) scale(1.12); }
    }
"""

# Insert CSS before </style>
if "collab-grand-stage" not in content:
    style_end = content.find('</style>')
    if style_end != -1:
        content = content[:style_end] + grand_reveal_css + "\n" + content[style_end:]
        print("Appended Grand Reveal CSS styles.")

# ── 2. NEW SLIDE 4 THEATER STAGE HTML ──
new_slide_4 = """<!-- SLIDE 4: COLLABORATION REVEAL (Grand Reveal from Behind Grand Curtains with Drums Sound & Crazy Musical Effects) -->
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
          <div id="collab-main-card" class="collab-main-card gm-rule-card" style="background: radial-gradient(circle at 50% 30%, rgba(55, 20, 70, 0.88) 0%, rgba(20, 12, 30, 0.96) 100%); border: 1.5px solid rgba(236, 72, 153, 0.4); border-radius: 20px; padding: 22px 28px; text-align: center; position: relative; z-index: 10;">

            <!-- Logos Lockup Row -->
            <div style="display: flex; align-items: center; justify-content: center; gap: 36px; flex-wrap: wrap; margin-bottom: 20px;">
              
              <!-- Watar Logo Box -->
              <div class="collab-logo-box" style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                <div style="width: 135px; height: 135px; border-radius: 50%; background: radial-gradient(circle, #1e3a8a 0%, #0f224a 65%, #071329 100%); border: 2.5px solid rgba(59, 130, 246, 0.7); display: flex; align-items: center; justify-content: center; padding: 14px; box-shadow: 0 0 30px rgba(37, 99, 235, 0.5), inset 0 0 15px rgba(30, 58, 138, 0.4);">
                  <img src="assets/watar-logo.png" alt="شعار رهط الوتر" style="max-width: 100%; max-height: 100%; object-fit: contain; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));" />
                </div>
                <span style="font-size: 16px; font-weight: 700; color: #fff; margin-top: 4px;">رهط الوتر</span>
                <span style="font-size: 11.5px; color: #60a5fa; background: rgba(37, 99, 235, 0.2); padding: 2px 10px; border-radius: 10px; border: 1px solid rgba(59, 130, 246, 0.4);">عشيرة الجوالة</span>
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

            <!-- Navigation & Replay Action Row -->
            <div style="display: flex; justify-content: center; gap: 14px; margin-top: 18px; flex-wrap: wrap;">
              <button class="sp5-reveal-btn" onclick="goToSp5Slide(3)" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); color: #cbd5e1; border-radius: 25px; padding: 8px 20px; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s ease;">
                <span style="transform: rotate(180deg); display: inline-block;">➔</span>
                <span>العودة للخطط المستقبلية</span>
              </button>

              <button class="sp5-reveal-btn" onclick="triggerGrandCollabReveal()" style="background: linear-gradient(135deg, rgba(251,191,36,0.25), rgba(236,72,153,0.3)); border: 1.5px solid #fbbf24; color: #fde047; border-radius: 25px; padding: 8px 22px; font-size: 13.5px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 0 16px rgba(251,191,36,0.35); transition: all 0.25s ease;">
                <span>🥁 إعادة المشهد السينمائي (Grand Reveal)</span>
                <span style="font-size: 15px;">🎬</span>
              </button>

              <button class="sp5-reveal-btn" onclick="celebratePresentationCompletion()" style="background: linear-gradient(135deg, #a855f7, #ec4899); border: none; color: #fff; border-radius: 25px; padding: 8px 24px; font-size: 13.5px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(236,72,153,0.4); transition: all 0.25s ease;">
                <span>🎉 ختام العرض التقديمي</span>
              </button>
            </div>

          </div>

          <!-- THE GRAND THEATER CURTAINS OVERLAY -->
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

          </div>

        </div>
      </div>"""

# Replace Slide 4 block
slide_4_pattern = r'<!-- SLIDE 4: COLLABORATION REVEAL.*?</div>\s*</div>\s*(?=<!-- Fullscreen Cinematic Lightbox Modal)'
match_s4 = re.search(slide_4_pattern, content, re.DOTALL)
if match_s4:
    content = content[:match_s4.start()] + new_slide_4 + "\n\n" + content[match_s4.end():]
    print("Replaced Slide 4 with Grand Theater Curtain Stage.")
else:
    print("ERROR: Could not match Slide 4 pattern!")

# ── 3. JAVASCRIPT: DRAMATIC DRUMROLL AUDIO & GRAND REVEAL LOGIC ──
js_reveal_logic = """
    // ── 15.1 Dramatic Drums Sound Effect & Grand Reveal Theater Engine ──
    let isGrandRevealActive = false;

    function playDramaticDrumrollReveal() {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const rollDuration = 1.7; // Snare build-up duration
        
        // A. Accelerating Snare Drum Roll (Individual crisp noise impulses crescendoing)
        const numStrikes = 36;
        for (let i = 0; i < numStrikes; i++) {
          // Exponential strike acceleration
          const progress = i / numStrikes;
          const strikeTime = now + (Math.pow(progress, 1.25) * rollDuration);
          const strikeGain = 0.08 + Math.pow(progress, 1.6) * 0.55;
          
          const noiseLen = Math.floor(ctx.sampleRate * 0.04);
          const noiseBuf = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
          const data = noiseBuf.getChannelData(0);
          for (let s = 0; s < noiseLen; s++) {
            data[s] = (Math.random() * 2 - 1) * Math.exp(-s / (ctx.sampleRate * 0.007));
          }
          const noiseSrc = ctx.createBufferSource();
          noiseSrc.buffer = noiseBuf;
          
          const snareFilter = ctx.createBiquadFilter();
          snareFilter.type = 'bandpass';
          snareFilter.frequency.setValueAtTime(1200 + progress * 600, strikeTime);
          snareFilter.Q.setValueAtTime(1.5, strikeTime);
          
          const g = ctx.createGain();
          g.gain.setValueAtTime(strikeGain, strikeTime);
          g.gain.exponentialRampToValueAtTime(0.0001, strikeTime + 0.038);
          
          noiseSrc.connect(snareFilter);
          snareFilter.connect(g);
          g.connect(ctx.destination);
          noiseSrc.start(strikeTime);
        }
        
        // B. Timpani Rumble underneath the snare roll
        const timpOsc = ctx.createOscillator();
        const timpGain = ctx.createGain();
        timpOsc.type = 'triangle';
        timpOsc.frequency.setValueAtTime(80, now);
        timpOsc.frequency.linearRampToValueAtTime(115, now + rollDuration);
        timpGain.gain.setValueAtTime(0.04, now);
        timpGain.gain.exponentialRampToValueAtTime(0.38, now + rollDuration);
        timpGain.gain.exponentialRampToValueAtTime(0.0001, now + rollDuration + 0.1);
        timpOsc.connect(timpGain);
        timpGain.connect(ctx.destination);
        timpOsc.start(now);
        timpOsc.stop(now + rollDuration + 0.12);
        
        // C. THE GRAND CLIMAX (at t = now + rollDuration): BASS DRUM BOOM + CYMBAL CRASH + HARP FANFARE
        const climax = now + rollDuration;
        
        // 1. Massive Sub-Bass Drum Boom (Punchy kick thud)
        const bdOsc = ctx.createOscillator();
        const bdGain = ctx.createGain();
        bdOsc.type = 'sine';
        bdOsc.frequency.setValueAtTime(150, climax);
        bdOsc.frequency.exponentialRampToValueAtTime(36, climax + 0.22);
        bdGain.gain.setValueAtTime(1.1, climax);
        bdGain.gain.exponentialRampToValueAtTime(0.0001, climax + 1.4);
        bdOsc.connect(bdGain);
        bdGain.connect(ctx.destination);
        bdOsc.start(climax);
        bdOsc.stop(climax + 1.5);
        
        // 2. Orchestral Cymbal Crash
        const cymbalLen = Math.floor(ctx.sampleRate * 2.4);
        const cymbalBuf = ctx.createBuffer(1, cymbalLen, ctx.sampleRate);
        const cData = cymbalBuf.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let s = 0; s < cymbalLen; s++) {
          const w = Math.random() * 2 - 1;
          b0 = 0.95 * b0 + w * 0.16;
          b1 = 0.90 * b1 + w * 0.24;
          b2 = 0.85 * b2 + w * 0.32;
          cData[s] = (w * 0.35 + b0 + b1 - b2) * Math.exp(-s / (ctx.sampleRate * 0.42));
        }
        const cymbalSrc = ctx.createBufferSource();
        cymbalSrc.buffer = cymbalBuf;
        const cymbalFilter = ctx.createBiquadFilter();
        cymbalFilter.type = 'highpass';
        cymbalFilter.frequency.setValueAtTime(2600, climax);
        const cymbalGain = ctx.createGain();
        cymbalGain.gain.setValueAtTime(0.85, climax);
        cymbalGain.gain.exponentialRampToValueAtTime(0.0001, climax + 2.4);
        cymbalSrc.connect(cymbalFilter);
        cymbalFilter.connect(cymbalGain);
        cymbalGain.connect(ctx.destination);
        cymbalSrc.start(climax);
        
        // 3. Triumphant Ascending Harp Fanfare (Ascending glissando over 8 notes)
        const fanfareFreqs = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51];
        fanfareFreqs.forEach((f, idx) => {
          setTimeout(() => {
            pluckHarpString(f, 0.8 - idx * 0.035);
          }, (rollDuration * 1000) + idx * 75);
        });
      } catch (err) {
        console.warn("Drumroll audio synthesis error:", err);
      }
    }

    function spawnMusicalConfetti() {
      const container = document.getElementById('collab-notes-container');
      if (!container) return;
      container.innerHTML = '';
      const glyphs = ['♪', '♫', '♬', '𝄞', '✦', '★', '✨', '⭐', '💖', '🎉'];
      const colors = ['#fbbf24', '#f472b6', '#38bdf8', '#c084fc', '#4ade80', '#ffffff', '#fde047'];

      for (let i = 0; i < 38; i++) {
        const el = document.createElement('span');
        el.className = 'collab-musical-note';
        el.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        el.style.color = color;
        el.style.textShadow = `0 0 12px ${color}`;

        const angle = Math.random() * Math.PI * 2;
        const distance = 120 + Math.random() * 340;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * (distance * 0.65) - 60;
        const rot = (Math.random() * 360 - 180) + 'deg';

        el.style.setProperty('--tx', `${tx.toFixed(1)}px`);
        el.style.setProperty('--ty', `${ty.toFixed(1)}px`);
        el.style.setProperty('--rot', rot);
        el.style.left = '50%';
        el.style.top = '48%';
        el.style.animationDelay = (Math.random() * 0.22).toFixed(2) + 's';

        container.appendChild(el);
      }

      setTimeout(() => {
        if (container) container.innerHTML = '';
      }, 3200);
    }

    function triggerGrandCollabReveal() {
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
    }
"""

# Insert JS logic right before goToSp5Slide
old_controller_target = "function goToSp5Slide(slideNum, playSound = true) {"
if old_controller_target in content:
    # Update goToSp5Slide to auto-trigger grand reveal on slide 4
    new_controller_code = """function goToSp5Slide(slideNum, playSound = true) {
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

      if (playSound && slideNum !== 4) {
        const freqs = [392.00, 440.00, 493.88, 523.25];
        pluckHarpString(freqs[slideNum - 1], 0.7);
      }

      // Auto-trigger Grand Reveal when arriving at Slide 4!
      if (slideNum === 4) {
        setTimeout(() => {
          triggerGrandCollabReveal();
        }, 150);
      }

      updateUniversalHud();
    }"""
    
    # Replace old goToSp5Slide
    old_func_pattern = r'function goToSp5Slide\(slideNum, playSound = true\) {.*?updateUniversalHud\(\);\s*}'
    content = re.sub(old_func_pattern, js_reveal_logic + "\n    " + new_controller_code, content, flags=re.DOTALL)
    print("Injected Grand Reveal Audio and Theater JS controllers.")
else:
    print("ERROR: old_controller_target not found!")

with open('c:/Users/Dell/Desktop/raht/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Saved updated index.html successfully.")
