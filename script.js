    // ── 1. Realistic Karplus-Strong Physical Acoustic String Synthesis ──
    let audioCtx = null;

    function getAudioContext() {
      if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          audioCtx = new AudioContextClass();
        }
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      return audioCtx;
    }

    function pluckHarpString(freq, volume = 0.75) {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const sr = ctx.sampleRate;
        const N = Math.round(sr / freq);
        const duration = 2.8;
        const len = Math.floor(sr * duration);
        const buf = new Float32Array(len);

        // Initial pluck excitation (pink-weighted noise for gut/nylon harp string warmth)
        let b0 = 0, b1 = 0;
        for (let i = 0; i < N; i++) {
          const white = (Math.random() * 2 - 1);
          b0 = 0.99 * b0 + white * 0.05;
          b1 = 0.95 * b1 + white * 0.15;
          buf[i] = (white * 0.4 + b0 + b1);
        }

        // Karplus-Strong feedback loop with acoustic loss filter (0.4982 for rich natural decay)
        const feedback = 0.4982;
        for (let i = N; i < len; i++) {
          buf[i] = feedback * (buf[i - N] + buf[i - N + 1]);
        }

        const audioBuf = ctx.createBuffer(1, len, sr);
        audioBuf.copyToChannel(buf, 0);

        const src = ctx.createBufferSource();
        src.buffer = audioBuf;

        // Body resonance filter simulating wooden soundbox
        const bodyFilter = ctx.createBiquadFilter();
        bodyFilter.type = 'peaking';
        bodyFilter.frequency.setValueAtTime(420, ctx.currentTime);
        bodyFilter.Q.setValueAtTime(1.8, ctx.currentTime);
        bodyFilter.gain.setValueAtTime(3.5, ctx.currentTime);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

        src.connect(bodyFilter);
        bodyFilter.connect(gain);
        gain.connect(ctx.destination);
        src.start();
      } catch (e) {
        // Audio context fallback
      }
    }

    // ── 2. Vector Standing-Wave Vibration Physics ──
    // Accurately oscillates any 2D string along its perpendicular normal vector
    const stringCoords = [
      { x1: 230, y1: 87,  x2: 238, y2: 500 }, // String 0 (الوتر الأول)
      { x1: 305, y1: 103, x2: 312, y2: 460 }, // String 1 (الوتر الثاني)
      { x1: 385, y1: 125, x2: 388, y2: 420 }, // String 2 (الوتر الثالث)
      { x1: 465, y1: 155, x2: 464, y2: 380 }, // String 3 (الوتر الرابع)
      { x1: 550, y1: 192, x2: 545, y2: 335 }  // String 4 (الوتر الخامس)
    ];

    const activeAnimations = {};

    function animateVectorString(idx, pathEl, glowEl, amp = 14, decay = 3.0, freq = 200) {
      if (activeAnimations[idx]) {
        cancelAnimationFrame(activeAnimations[idx]);
      }

      // Ensure coordinates strictly match the actual SVG path of the string
      let coords = stringCoords[idx];
      if (pathEl) {
        if (!pathEl.dataset.origD) {
          pathEl.dataset.origD = pathEl.getAttribute('d') || '';
        }
        const m = pathEl.dataset.origD.match(/M\s*([\d.]+)\s*,\s*([\d.]+)\s+L\s+([\d.]+)\s*,\s*([\d.]+)/i);
        if (m) {
          coords = {
            x1: parseFloat(m[1]),
            y1: parseFloat(m[2]),
            x2: parseFloat(m[3]),
            y2: parseFloat(m[4])
          };
          stringCoords[idx] = coords;
        }
      }
      if (!coords) return;

      const dx = coords.x2 - coords.x1;
      const dy = coords.y2 - coords.y1;
      const len = Math.sqrt(dx * dx + dy * dy);

      // Perpendicular normal vector for transverse oscillation
      const nx = -dy / len;
      const ny = dx / len;

      const omega = 2 * Math.PI * Math.min(28, freq / 8); // visual oscillation rate
      let t0 = null;
      const steps = 40;

      function resetStraight() {
        const origD = (pathEl && pathEl.dataset.origD) ? pathEl.dataset.origD : `M ${coords.x1},${coords.y1} L ${coords.x2},${coords.y2}`;
        pathEl.setAttribute('d', origD);
        if (glowEl) glowEl.setAttribute('d', origD);
      }

      (function step(ts) {
        if (!t0) t0 = ts;
        const t = (ts - t0) / 1000;
        const currentAmp = amp * Math.exp(-t * decay);

        if (currentAmp < 0.35) {
          resetStraight();
          delete activeAnimations[idx];
          return;
        }

        let d = `M ${coords.x1.toFixed(1)},${coords.y1.toFixed(1)}`;
        const phase = Math.cos(omega * t);

        for (let i = 1; i <= steps; i++) {
          const s = i / steps;
          // Fundamental standing wave: sin(pi * s)
          const wave = Math.sin(Math.PI * s) * currentAmp * phase;
          const x = coords.x1 + s * dx + nx * wave;
          const y = coords.y1 + s * dy + ny * wave;
          d += ` L ${x.toFixed(1)},${y.toFixed(1)}`;
        }

        pathEl.setAttribute('d', d);
        if (glowEl) glowEl.setAttribute('d', d);

        activeAnimations[idx] = requestAnimationFrame(step);
      })(performance.now());
    }

    // ── 3. Musical Sparkle / Note Particle Spawner ──
    const musicalGlyphs = ['♪', '♫', '♩', '✦', '✧'];

    function spawnHarpSparkle(e, color) {
      const stage = document.getElementById('harp-stage');
      const rect = stage.getBoundingClientRect();
      const clientX = e.clientX || (rect.left + rect.width / 2);
      const clientY = e.clientY || (rect.top + rect.height / 2);

      for (let i = 0; i < 3; i++) {
        const el = document.createElement('div');
        el.className = 'note-particle';
        el.textContent = musicalGlyphs[Math.floor(Math.random() * musicalGlyphs.length)];
        el.style.left = `${clientX - rect.left}px`;
        el.style.top = `${clientY - rect.top}px`;
        el.style.setProperty('--dx', `${(Math.random() - 0.5) * 90}px`);
        el.style.setProperty('--dy', `${-30 - Math.random() * 65}px`);
        el.style.setProperty('--rot', `${(Math.random() - 0.5) * 60}deg`);
        if (color) el.style.color = color;
        stage.appendChild(el);
        setTimeout(() => el.remove(), 950);
      }
    }

    // ── 4. Navigation & Page Handling ──
    let activePage = null;

    function toArabicNum(num) {
      const ar = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
      return String(num).replace(/[0-9]/g, d => ar[d]);
    }

    function updateUniversalHud() {
      const hud = document.getElementById('universal-ppt-hud');
      const evalBox = document.getElementById('eval-slide-counter-box');

      if (activePage === null) {
        if (hud) hud.style.display = 'none';
        if (evalBox) evalBox.style.display = 'none';
        return;
      }

      if (hud) hud.style.display = 'flex';
      const nameEl = document.getElementById('universal-ppt-chord-name');
      const badgeEl = document.getElementById('universal-ppt-step-badge');
      const prevBtn = document.getElementById('universal-ppt-prev');
      const nextBtn = document.getElementById('universal-ppt-next');

      let chordTitle = '';
      let curStep = 0;
      let totalSteps = 1;

      if (activePage === 0) {
        if (currentPptStep === 6 && isChristmasVideoExpanded) {
          chordTitle = 'الوتر الأول: فيديو لقاء الكريسماس';
        } else {
          chordTitle = 'الوتر الأول: من نحن؟';
        }
        curStep = currentPptStep + 1;
        totalSteps = 8;
        if (prevBtn) prevBtn.disabled = (currentPptStep === 0 && !isChristmasVideoExpanded);
        if (nextBtn) nextBtn.disabled = false;
      } else if (activePage === 1) {
        if (currentProjStep === 0) {
          if (currentRejectedStep > 0) {
            curStep = currentRejectedStep;
            totalSteps = 6;
            const cardIdx = Math.floor((currentRejectedStep - 1) / 2);
            const arabicNums = ['الأولى', 'الثانية', 'الثالثة'];
            chordTitle = 'الوتر الثاني: الفكرة ' + (arabicNums[cardIdx] || (cardIdx + 1));
          } else {
            curStep = 1;
            totalSteps = 4;
            chordTitle = 'الوتر الثاني: المشاريع المستبعدة';
          }
        } else if (currentProjStep === 1) {
          curStep = 2;
          totalSteps = 4;
          chordTitle = 'الوتر الثاني: الهدف الأساسي';
        } else if (currentProjStep === 2) {
          curStep = 3;
          totalSteps = 4;
          chordTitle = 'الوتر الثاني: جيتار المسؤوليات والمهام';
        } else if (currentProjStep === 3) {
          curStep = 4;
          totalSteps = 4;
          chordTitle = 'الوتر الثاني: فيديو ملخص اليومين';
        }
        const b1 = document.getElementById('ppt-counter-badge-1');
        if (b1) b1.textContent = `${toArabicNum(curStep)} / ٤`;
        if (prevBtn) prevBtn.disabled = (currentProjStep === 0 && currentRejectedStep === 0);
        if (nextBtn) nextBtn.disabled = false;
      } else if (activePage === 2) {
        if (sp2ViewMode === 'map') {
          chordTitle = 'الوتر الثالث: خريطة المراحل (مسار خطي • ٦ محطات)';
          curStep = currentGmLevel;
          totalSteps = 6;
          const b2 = document.getElementById('ppt-counter-badge-2');
          if (b2) b2.textContent = `المحطة ${toArabicNum(currentGmLevel)} / ٦ • ${currentLoopRotation === 1 ? 'اليوم الأول' : 'اليوم الثاني'}`;
          if (prevBtn) prevBtn.disabled = false;
          if (nextBtn) nextBtn.disabled = false;
        } else {
          // Sub-point Pane mode
          let activePane = currentGmLevel;
          for (let i = 1; i <= 11; i++) {
            const p = document.getElementById(`gm-pane-${i}`);
            if (p && p.classList.contains('active')) {
              activePane = i;
              break;
            }
          }
          if (activePane === 1) {
            if (typeof currentSp2EduStep !== 'undefined' && currentSp2EduStep > 0) {
              const cardIdx = Math.floor((currentSp2EduStep - 1) / 2);
              const cardTitles = ['كورس إعداد القادة', 'قعدنا مع سحابة', 'جلسة جون وميرا'];
              chordTitle = 'الوتر الثالث: ' + (cardTitles[cardIdx] || 'الجلسات التعليمية');
              curStep = currentSp2EduStep;
              totalSteps = 6;
            } else {
              chordTitle = 'الوتر الثالث: الجلسات التعليمية وإعداد القادة';
              curStep = 1;
              totalSteps = 6;
            }
          } else if (activePane === 2) {
            const cardNames = ['الكنائس المرشحة', 'الأراضي والأماكن', 'العشور والميزانية', 'تخطيط البرنامج'];
            const curCard = Math.floor(((currentSp2Step2Phase || 1) - 1) / 2);
            const isExp = ((currentSp2Step2Phase || 1) % 2 === 0);
            chordTitle = 'الوتر الثالث: ' + (cardNames[curCard] || 'استكشاف الميدان') + (isExp ? ' (عرض التفاصيل)' : ' (استكشاف)');
            curStep = currentSp2Step2Phase || 1;
            totalSteps = 8;
          } else if (activePane === 3) {
            chordTitle = 'الوتر الثالث: برنامج فعاليات اليوم الأول';
            curStep = currentSp2Day1ProgLvl || 1;
            totalSteps = 5;
          } else if (activePane === 4) {
            if (typeof currentSp2Prep1Step !== 'undefined' && currentSp2Prep1Step > 0) {
              const cardIdx = Math.floor((currentSp2Prep1Step - 1) / 2);
              const cardTitles = ['الفقرة الروحية', 'تقويم السلوك', 'الترفيه والمسابقات'];
              chordTitle = 'الوتر الثالث: ' + (cardTitles[cardIdx] || 'تحضيرات اليوم الأول');
              curStep = currentSp2Prep1Step;
              totalSteps = 6;
            } else {
              chordTitle = 'الوتر الثالث: تحضيرات اليوم الأول';
              curStep = 1;
              totalSteps = 6;
            }
          } else if (activePane === 11) {
            chordTitle = 'الوتر الثالث: اماكن الخدمة على مدار يومين';
            curStep = 1;
            totalSteps = 1;
          } else if (activePane === 5) {
            chordTitle = 'الوتر الثالث: ميزانية اليوم الأول';
            curStep = (currentGmBudgetSlice || 0) + 1;
            totalSteps = (gmBudgetData[1] && gmBudgetData[1].items) ? gmBudgetData[1].items.length : 7;
          } else if (activePane === 9) {
            chordTitle = 'الوتر الثالث: التقييم الخارجي (اليوم الأول)';
            curStep = 1;
            totalSteps = 1;
          } else if (activePane === 6) {
            chordTitle = 'الوتر الثالث: برنامج اليوم الثاني';
            curStep = currentSp2Day2ProgLvl || 1;
            totalSteps = 6;
          } else if (activePane === 7) {
            if (typeof currentSp2Prep2Step !== 'undefined' && currentSp2Prep2Step > 0) {
              const cardIdx = Math.floor((currentSp2Prep2Step - 1) / 2);
              const cardTitles = ['الفقرة الروحية', 'تقويم السلوك والجلسات', 'الترفيه والمسابقات'];
              chordTitle = 'الوتر الثالث: ' + (cardTitles[cardIdx] || 'تحضيرات اليوم الثاني');
              curStep = currentSp2Prep2Step;
              totalSteps = 6;
            } else {
              chordTitle = 'الوتر الثالث: تحضيرات اليوم الثاني';
              curStep = 1;
              totalSteps = 6;
            }
          } else if (activePane === 8) {
            chordTitle = 'الوتر الثالث: ميزانية اليوم الثاني';
            curStep = (currentGmBudgetSlice || 0) + 1;
            totalSteps = 6;
          } else if (activePane === 10) {
            chordTitle = 'الوتر الثالث: التقييم الداخلي (اليوم الثاني)';
            curStep = 1;
            totalSteps = 1;
          }
          const b2 = document.getElementById('ppt-counter-badge-2');
          if (b2) b2.textContent = `${toArabicNum(curStep)} / ${toArabicNum(totalSteps)}`;
          if (prevBtn) prevBtn.disabled = false;
          if (nextBtn) nextBtn.disabled = false;
        }
      } else if (activePage === 3) {
        chordTitle = 'الوتر الرابع: التحديات';
        curStep = currentChallengeStep + 1;
        totalSteps = 5;
        if (prevBtn) prevBtn.disabled = false;
        if (nextBtn) nextBtn.disabled = false;
      } else if (activePage === 4) {
        chordTitle = 'الوتر الخامس: الدروس والمستقبل';
        curStep = currentSp5SlideIdx;
        totalSteps = 2;
        const b4 = document.getElementById('ppt-counter-badge-4');
        if (b4) b4.textContent = `${toArabicNum(curStep)} / ٢`;
        if (prevBtn) prevBtn.disabled = false;
        if (nextBtn) nextBtn.disabled = false;
      }

      if (nameEl) nameEl.textContent = chordTitle;
      if (badgeEl) badgeEl.textContent = `${toArabicNum(curStep)} / ${toArabicNum(totalSteps)}`;

      // ── Update Evaluation Panel Slide Counter Box ──
      let globalSlideNum = 1;
      const totalGlobalSlides = 32;

      if (activePage === 0) {
        globalSlideNum = currentPptStep + 1; // 1..8
      } else if (activePage === 1) {
        globalSlideNum = 8 + currentProjStep + 1; // 9..12
      } else if (activePage === 2) {
        if (sp2ViewMode === 'map') {
          globalSlideNum = (currentLoopRotation === 1) ? 13 : 21;
        } else {
          let activePane = currentGmLevel;
          for (let i = 1; i <= 11; i++) {
            const p = document.getElementById(`gm-pane-${i}`);
            if (p && p.classList.contains('active')) {
              activePane = i;
              break;
            }
          }
          if (activePane === 1) globalSlideNum = 14;
          else if (activePane === 2) globalSlideNum = 15;
          else if (activePane === 3) globalSlideNum = 16;
          else if (activePane === 4) globalSlideNum = 17;
          else if (activePane === 11) globalSlideNum = 18;
          else if (activePane === 5) globalSlideNum = 19;
          else if (activePane === 9) globalSlideNum = 20;
          else if (activePane === 6) globalSlideNum = 22;
          else if (activePane === 7) globalSlideNum = 23;
          else if (activePane === 8) globalSlideNum = 24;
          else if (activePane === 10) globalSlideNum = 25;
          else globalSlideNum = (currentLoopRotation === 1) ? 13 : 21;
        }
      } else if (activePage === 3) {
        globalSlideNum = 25 + currentChallengeStep + 1; // 26..30
      } else if (activePage === 4) {
        globalSlideNum = 30 + currentSp5SlideIdx; // 31..32
      }

      if (evalBox) {
        evalBox.style.display = 'flex';
        const evalNum = document.getElementById('eval-slide-num');
        const evalTotal = document.getElementById('eval-slide-total');
        const evalChord = document.getElementById('eval-slide-chord-name');
        if (evalNum) evalNum.textContent = toArabicNum(globalSlideNum);
        if (evalTotal) evalTotal.textContent = `/ ${toArabicNum(totalGlobalSlides)}`;
        if (evalChord) {
          evalChord.textContent = chordTitle;
        }
      }
    }

    let isChordTransitioning = false;
    let pendingChordStartStep = null;

    function openPage(idx) {
      if (activePage !== null) return;
      activePage = idx;
      const sp = document.getElementById('sp-' + idx);
      if (!sp) return;
      sp.classList.add('open');

      const startStep = (pendingChordStartStep !== null) ? pendingChordStartStep : 0;
      pendingChordStartStep = null;

      if (idx === 0) {
        goToPptStep(startStep);
      } else if (idx === 1) {
        goToProjStep(startStep);
      } else if (idx === 2) {
        initSp2GameMap(startStep);
      } else if (idx === 3) {
        goToChallengeStep(startStep, false);
      } else if (idx === 4) {
        goToSp5PptStep(startStep, false);
      }

      updateUniversalHud();

      sp.querySelectorAll('.draft-item').forEach(el => {
        el.style.animation = 'none';
        el.offsetHeight; // force reflow
        el.style.animation = '';
      });

      document.getElementById('home').classList.add('fade-out');
    }

    function closePage() {
      if (activePage === null) return;
      forceResetBibleModal();
      closeChristmasCinema(false);
      closeTwoDaysVideo(false);
      closeTheatricalThanksOutro();
      closeGuitarDetails();
      closeCinematicZoom();
      closeDaySectionModal();
      closeRejectedReasonModal();
      if (typeof goToSp2EduStep === 'function') goToSp2EduStep(0);
      if (typeof goToSp2Prep1Step === 'function') goToSp2Prep1Step(0);
      if (typeof resetGrandCollabCurtain === 'function') resetGrandCollabCurtain();
      const finaleBanner = document.getElementById('presentation-finale-banner');
      if (finaleBanner) finaleBanner.style.display = 'none';
      const sp = document.getElementById('sp-' + activePage);
      if (sp) sp.classList.remove('open');
      document.getElementById('home').classList.remove('fade-out');
      activePage = null;
      isPluckingLocked = false;
      updateUniversalHud();
    }

    // ── Seamless Inter-Chord Transition: Return to Harp -> Pull Next String -> Open Next Chord ──
    function stepToNextChord(targetIdx, startStep = 0) {
      if (targetIdx < 0 || targetIdx > 4) {
        closePage();
        return;
      }
      if (isChordTransitioning) return;
      isChordTransitioning = true;
      pendingChordStartStep = startStep;

      // 1. Return to the harp screen
      closePage();

      // 2. Wait for the harp to be fully visible, then pull the target string
      setTimeout(() => {
        const group = document.querySelector(`.str-group[data-idx="${targetIdx}"]`);
        let fakeEvent = null;
        if (group) {
          const rect = group.getBoundingClientRect();
          fakeEvent = { clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 };
        }

        // Pull the string with realistic sound, standing wave oscillation, sparkles, and card glow
        triggerStringPluck(targetIdx, fakeEvent, true);

        // Reset transition lock once the target subpage has opened
        setTimeout(() => {
          isChordTransitioning = false;
        }, 1250);
      }, 480);
    }

    // ── Christmas Video Cinema Spotlight Mode ──
    let isChristmasVideoExpanded = false;

    function openChristmasCinema() {
      const overlay = document.getElementById('christmas-cinema-overlay');
      const player = document.getElementById('christmas-cinema-player');
      if (!overlay) return;
      isChristmasVideoExpanded = true;
      overlay.style.display = 'flex';
      requestAnimationFrame(() => {
        overlay.classList.add('open');
      });
      if (player) {
        player.currentTime = 0;
        const playPromise = player.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            console.log('Video autoplay deferred:', e);
          });
        }
      }
      updateUniversalHud();
    }

    function closeChristmasCinema(autoAdvance = false) {
      const overlay = document.getElementById('christmas-cinema-overlay');
      const player = document.getElementById('christmas-cinema-player');
      if (!overlay) return;
      isChristmasVideoExpanded = false;
      overlay.classList.remove('open');
      if (player) {
        player.pause();
      }
      setTimeout(() => {
        if (!isChristmasVideoExpanded) {
          overlay.style.display = 'none';
        }
      }, 400);

      if (autoAdvance) {
        goToPptStep(7, true);
      } else {
        updateUniversalHud();
      }
    }

    function toggleChristmasVideo() {
      if (isChristmasVideoExpanded) {
        closeChristmasCinema(false);
      } else {
        openChristmasCinema();
      }
    }

    // ── 3D Cinematic Holy Bible & Verse Controller (Stage 1 • تسمية «رهط الوتر») ──
    let isBibleOpenOnStage1 = false;
    let isBibleAnimating = false;
    let bibleAnimTimers = [];

    function clearBibleTimers() {
      bibleAnimTimers.forEach(t => clearTimeout(t));
      bibleAnimTimers = [];
    }

    function playBibleCelestialChime() {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
        freqs.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const now = ctx.currentTime + (idx * 0.08);

          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now);

          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.09, now + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 1.8);
        });
      } catch (e) { }
    }

    function playBiblePageShuffleSound() {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        for (let i = 0; i < 5; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();
          const now = ctx.currentTime + (i * 0.14);

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(140 + Math.random() * 80, now);
          osc.frequency.exponentialRampToValueAtTime(320 + Math.random() * 100, now + 0.12);

          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(1200, now);
          filter.Q.setValueAtTime(1.8, now);

          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.045, now + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.15);
        }
      } catch (e) { }
    }

    function playBibleCloseSound() {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const now = ctx.currentTime;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.28);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.32);
      } catch (e) { }
    }

    function playBibleFlyoutSound() {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const now = ctx.currentTime;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(340, now);
        osc.frequency.exponentialRampToValueAtTime(1100, now + 0.6);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.68);
      } catch (e) { }
    }

    function openBibleVerseModal() {
      if (isBibleAnimating || isBibleOpenOnStage1) return;
      clearBibleTimers();

      const overlay = document.getElementById('bible-verse-overlay');
      const bookContainer = document.getElementById('bible-book-container');
      const closedBook = document.getElementById('bible-closed-book');
      const openBook = document.getElementById('bible-open-book');
      if (!overlay || !bookContainer) return;

      isBibleAnimating = true;
      isBibleOpenOnStage1 = false;

      // 1. Setup closed book for spinning entrance
      bookContainer.className = 'bible-book-container';
      if (closedBook) closedBook.style.display = 'block';
      if (openBook) {
        openBook.classList.remove('opening');
        openBook.style.display = 'none';
      }

      overlay.style.display = 'flex';
      overlay.offsetHeight; // force repaint
      overlay.classList.add('open');

      // Phase A: Spin into center (1.0s) and reach final position
      bookContainer.classList.add('spinning-in');
      playBibleCelestialChime();

      // Phase B: At 1150ms (after book completely settles in final position), open the book smoothly in center
      const t1 = setTimeout(() => {
        if (!overlay.classList.contains('open')) return;
        bookContainer.classList.remove('spinning-in');
        if (closedBook) closedBook.style.display = 'none';
        if (openBook) {
          openBook.style.display = 'flex';
          openBook.classList.add('opening');
        }
      }, 1150);
      bibleAnimTimers.push(t1);

      // Phase C: At 1650ms (book is open and in position), start shuffling pages strictly inside the book
      const t2 = setTimeout(() => {
        if (!overlay.classList.contains('open')) return;
        if (openBook) openBook.classList.remove('opening');
        bookContainer.classList.add('shuffling');
        if (openBook) openBook.classList.add('shuffling');
        playBiblePageShuffleSound();
      }, 1650);
      bibleAnimTimers.push(t2);

      // Phase D: At 2950ms, settle on the verse and citation spread with golden radiance
      const t3 = setTimeout(() => {
        if (!overlay.classList.contains('open')) return;
        bookContainer.classList.remove('shuffling');
        if (openBook) openBook.classList.remove('shuffling');
        bookContainer.classList.add('settled-open');
        isBibleOpenOnStage1 = true;
        isBibleAnimating = false;
        playBibleCelestialChime();
      }, 2950);
      bibleAnimTimers.push(t3);
    }

    function closeAndDismissBible(advanceToNext = true) {
      if (isBibleAnimating) return;
      const overlay = document.getElementById('bible-verse-overlay');
      const bookContainer = document.getElementById('bible-book-container');
      const closedBook = document.getElementById('bible-closed-book');
      const openBook = document.getElementById('bible-open-book');
      if (!overlay || !bookContainer) return;

      clearBibleTimers();
      isBibleAnimating = true;

      // Phase 1: Fold open spread shut
      bookContainer.classList.remove('settled-open');
      bookContainer.classList.remove('shuffling');
      if (openBook) openBook.classList.remove('shuffling');
      bookContainer.classList.add('closing-book');
      playBibleCloseSound();

      // Phase 2: Switch to closed cover and fly out
      const t1 = setTimeout(() => {
        bookContainer.classList.remove('closing-book');
        if (openBook) {
          openBook.className = 'bible-open-book';
          openBook.style.display = 'none';
        }
        if (closedBook) closedBook.style.display = 'block';
        bookContainer.classList.add('flying-out');
        playBibleFlyoutSound();
      }, 420);
      bibleAnimTimers.push(t1);

      // Phase 3: Hide overlay, reset flags and advance slide if requested
      const t2 = setTimeout(() => {
        overlay.classList.remove('open');
        overlay.style.display = 'none';
        bookContainer.className = 'bible-book-container';
        if (closedBook) closedBook.style.display = 'block';
        if (openBook) {
          openBook.className = 'bible-open-book';
          openBook.style.display = 'none';
        }
        isBibleOpenOnStage1 = false;
        isBibleAnimating = false;

        if (advanceToNext) {
          goToPptStep(2, true);
        }
      }, 1200);
      bibleAnimTimers.push(t2);
    }

    function forceResetBibleModal() {
      clearBibleTimers();
      const overlay = document.getElementById('bible-verse-overlay');
      const bookContainer = document.getElementById('bible-book-container');
      const closedBook = document.getElementById('bible-closed-book');
      const openBook = document.getElementById('bible-open-book');
      if (overlay) {
        overlay.classList.remove('open');
        overlay.style.display = 'none';
      }
      if (bookContainer) {
        bookContainer.className = 'bible-book-container';
      }
      if (openBook) {
        openBook.className = 'bible-open-book';
        openBook.style.display = 'none';
      }
      if (closedBook) closedBook.style.display = 'block';
      isBibleOpenOnStage1 = false;
      isBibleAnimating = false;
    }

    function handleBibleOverlayClick(event) {
      if (isBibleOpenOnStage1 && !isBibleAnimating) {
        closeAndDismissBible(true);
      }
    }

    function advanceGlobalPresentation(direction) {
      if (isChordTransitioning) return;

      if (activePage === null) {
        if (direction > 0) {
          const group0 = document.querySelector(`.str-group[data-idx="0"]`);
          let fakeEvent = null;
          if (group0) {
            const rect = group0.getBoundingClientRect();
            fakeEvent = { clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 };
          }
          triggerStringPluck(0, fakeEvent, true);
        }
        return;
      }

      if (activePage === 0) {
        if (direction > 0) {
          // Special Bible sequence on Slide 2 (stage-1: تسمية «رهط الوتر»)
          if (currentPptStep === 1) {
            if (!isBibleOpenOnStage1 && !isBibleAnimating) {
              openBibleVerseModal();
              return;
            } else if (isBibleOpenOnStage1 && !isBibleAnimating) {
              closeAndDismissBible(true);
              return;
            } else if (isBibleAnimating) {
              return;
            }
          }

          if (currentPptStep === 6 && !isChristmasVideoExpanded) {
            openChristmasCinema();
            return;
          }
          if (isChristmasVideoExpanded) {
            closeChristmasCinema(false);
          }
          if (currentPptStep < 7) {
            goToPptStep(currentPptStep + 1, true);
          } else {
            stepToNextChord(1, 0);
          }
        } else {
          // If Bible is open or animating, dismiss back to slide 1 view
          if (currentPptStep === 1 && (isBibleOpenOnStage1 || isBibleAnimating)) {
            closeAndDismissBible(false);
            return;
          }

          if (isChristmasVideoExpanded) {
            closeChristmasCinema(false);
            return;
          }
          if (currentPptStep > 0) {
            goToPptStep(currentPptStep - 1, true);
          } else {
            closePage();
          }
        }
      } else if (activePage === 1) {
        if (direction > 0) {
          if (currentProjStep === 0) {
            if (currentRejectedStep < 6) {
              goToRejectedStep(currentRejectedStep + 1);
            } else {
              goToRejectedStep(0);
              goToProjStep(1);
            }
          } else if (currentProjStep === 1) {
            goToProjStep(2);
          } else if (currentProjStep === 2) {
            // Slide 11: Open guitar strings sequentially on Space / Next
            if (currentGuitarStringIdx < 9) {
              selectGuitarString(currentGuitarStringIdx + 1);
            } else {
              goToProjStep(3);
            }
          } else if (currentProjStep === 3) {
            // Slide 12: Start video playing on Space / Next without clicking play button
            if (!isTwoDaysVideoExpanded) {
              openTwoDaysVideo();
              return;
            } else {
              closeTwoDaysVideo(true);
            }
          }
        } else {
          if (currentProjStep === 3) {
            if (isTwoDaysVideoExpanded) {
              closeTwoDaysVideo(false);
              return;
            } else {
              goToProjStep(2);
              selectGuitarString(9);
            }
          } else if (currentProjStep === 2) {
            if (currentGuitarStringIdx > 0) {
              selectGuitarString(currentGuitarStringIdx - 1);
            } else if (currentGuitarStringIdx === 0) {
              closeGuitarDetails();
            } else {
              goToProjStep(1);
            }
          } else if (currentProjStep === 1) {
            goToProjStep(0);
            goToRejectedStep(6);
          } else if (currentProjStep === 0) {
            if (currentRejectedStep > 0) {
              goToRejectedStep(currentRejectedStep - 1);
            } else {
              stepToNextChord(0, 7);
            }
          } else {
            stepToNextChord(0, 7);
          }
        }
      } else if (activePage === 2) {
        if (direction > 0) {
          // ── NEXT ──
          if (sp2ViewMode === 'map') {
            // In map mode, pressing Next enters the currently highlighted node
            selectGameLevel(currentGmLevel, true);
          } else {
            // In pane mode, advance through sub-steps or complete node and seamlessly progress
            let activePane = currentGmLevel;
            for (let i = 1; i <= 11; i++) {
              const p = document.getElementById(`gm-pane-${i}`);
              if (p && p.classList.contains('active')) {
                activePane = i;
                break;
              }
            }

            if (activePane === 1) {
              if (currentSp2EduStep < 6) {
                goToSp2EduStep(currentSp2EduStep + 1);
              } else {
                closeCinematicZoom();
                sp2CompletedNodes.add(1);
                playMilestoneCompletionSound();
                currentGmLevel = 2;
                currentNodeDay = 1;
                openSp2Node(2, true, true);
              }
            } else if (activePane === 2) {
              // Slide 15: 4 Preparation Pillars (8 sub-steps)
              if (currentSp2Step2Phase < 8) {
                goToSp2FirstStepsPhase(currentSp2Step2Phase + 1, true);
              } else {
                sp2CompletedNodes.add(2);
                playMilestoneCompletionSound();
                currentGmLevel = 3;
                currentNodeDay = 1;
                openSp2Node(3, true, true); // Node 3: Program Day 1
              }
            } else if (activePane === 3) {
              // برنامج فعاليات اليوم الأول (5 sub-steps)
              if (currentSp2Day1ProgLvl < 5) {
                selectSp2Day1ProgramLevel(currentSp2Day1ProgLvl + 1, true);
              } else {
                closeCinematicZoom();
                // ── FINISHED DAY 1 OF PROGRAM -> AUTOMATICALLY GO TO DAY 2 ──
                switchNodeDay(2, true);
              }
            } else if (activePane === 6) {
              // برنامج فعاليات اليوم الثاني (6 sub-steps)
              if (currentSp2Day2ProgLvl < 6) {
                selectSp2Day2ProgramLevel(currentSp2Day2ProgLvl + 1, true);
              } else {
                closeCinematicZoom();
                sp2CompletedNodes.add(3);
                playMilestoneCompletionSound();
                // ── FINISHED DAY 2 OF PROGRAM -> ADVANCE TO NODE 4 (التحضيرات) DAY 1 ──
                currentGmLevel = 4;
                currentNodeDay = 1;
                openSp2Node(4, true, true);
              }
            } else if (activePane === 4) {
              // تحضيرات اليوم الأول (3 cards, 6 sub-steps: highlight -> zoom)
              if (currentSp2Prep1Step < 6) {
                goToSp2Prep1Step(currentSp2Prep1Step + 1);
              } else {
                closeCinematicZoom();
                // ── ADVANCE TO CHURCHES / LOCATIONS SLIDE (pane 11) ──
                openSp2Node(11, true, true);
              }
            } else if (activePane === 11) {
              // اماكن الخدمة على مدار يومين -> FINISHED DAY 1 OF NODE 4 -> AUTOMATICALLY GO TO DAY 2
              switchNodeDay(2, true);
            } else if (activePane === 7) {
              // تحضيرات اليوم الثاني (3 cards, 6 sub-steps: highlight -> zoom)
              if (currentSp2Prep2Step < 6) {
                goToSp2Prep2Step(currentSp2Prep2Step + 1);
              } else {
                closeCinematicZoom();
                sp2CompletedNodes.add(4);
                playMilestoneCompletionSound();
                // ── FINISHED DAY 2 OF PREPARATIONS -> ADVANCE TO NODE 5 (الميزانية) DAY 1 ──
                currentGmLevel = 5;
                currentNodeDay = 1;
                openSp2Node(5, true, true);
              }
            } else if (activePane === 5) {
              // ميزانية اليوم الأول (7 slices)
              const maxSlice = (gmBudgetData[1] && gmBudgetData[1].items) ? gmBudgetData[1].items.length - 1 : 6;
              if (currentGmBudgetSlice < maxSlice) {
                selectBudgetSlice(currentGmBudgetSlice + 1, true);
              } else {
                // ── FINISHED DAY 1 OF BUDGET -> AUTOMATICALLY GO TO DAY 2 ──
                switchNodeDay(2, true);
              }
            } else if (activePane === 8) {
              // ميزانية اليوم الثاني (6 slices)
              const maxSlice = (gmBudgetData[2] && gmBudgetData[2].items) ? gmBudgetData[2].items.length - 1 : 5;
              if (currentGmBudgetSlice < maxSlice) {
                selectBudgetSlice(currentGmBudgetSlice + 1, true);
              } else {
                sp2CompletedNodes.add(5);
                playMilestoneCompletionSound();
                // ── FINISHED DAY 2 OF BUDGET -> ADVANCE TO NODE 6 (التقييم) DAY 1 ──
                currentGmLevel = 6;
                currentNodeDay = 1;
                openSp2Node(9, true, true);
              }
            } else if (activePane === 9) {
              // التقييم الخارجي (اليوم الأول) -> FINISHED DAY 1 -> AUTOMATICALLY GO TO DAY 2
              switchNodeDay(2, true);
            } else if (activePane === 10) {
              // التقييم الداخلي (اليوم الثاني) -> FINISHED NODE 6 -> ADVANCE TO CHORD 4
              sp2CompletedNodes.add(6);
              playMilestoneCompletionSound();
              stepToNextChord(3, 0); // Advances to Chord 4 (التحديات)
            }
          }
        } else {
          // ── PREVIOUS ──
          if (sp2ViewMode === 'map') {
            if (currentGmLevel <= 1) {
              stepToNextChord(1, 3); // Back to Chord 2 (Step 3: 2-days recap video)
            } else {
              currentGmLevel--;
              showSp2Map(currentGmLevel, true);
            }
          } else {
            // Inside a sub-point, go to previous sub-step or previous section
            let activePane = currentGmLevel;
            for (let i = 1; i <= 11; i++) {
              const p = document.getElementById(`gm-pane-${i}`);
              if (p && p.classList.contains('active')) {
                activePane = i;
                break;
              }
            }

            if (activePane === 10) {
              // From Node 6 Day 2 back to Node 6 Day 1
              switchNodeDay(1, true);
            } else if (activePane === 9) {
              // From Node 6 Day 1 back to Node 5 Day 2 (last slice)
              currentGmLevel = 5;
              currentNodeDay = 2;
              openSp2Node(8, false, true);
              const maxSlice = (gmBudgetData[2] && gmBudgetData[2].items) ? gmBudgetData[2].items.length - 1 : 5;
              selectBudgetSlice(maxSlice, true);
            } else if (activePane === 8) {
              if (currentGmBudgetSlice > 0) {
                selectBudgetSlice(currentGmBudgetSlice - 1, true);
              } else {
                // From Node 5 Day 2 back to Node 5 Day 1 (last slice)
                switchNodeDay(1, true);
                const maxSlice = (gmBudgetData[1] && gmBudgetData[1].items) ? gmBudgetData[1].items.length - 1 : 6;
                selectBudgetSlice(maxSlice, true);
              }
            } else if (activePane === 5) {
              if (currentGmBudgetSlice > 0) {
                selectBudgetSlice(currentGmBudgetSlice - 1, true);
              } else {
                // From Node 5 Day 1 back to Node 4 Day 2 (step 6)
                currentGmLevel = 4;
                currentNodeDay = 2;
                openSp2Node(7, false, true);
                goToSp2Prep2Step(6);
              }
            } else if (activePane === 7) {
              if (currentSp2Prep2Step > 0) {
                goToSp2Prep2Step(currentSp2Prep2Step - 1);
              } else {
                // From Node 4 Day 2 back to Node 4 Day 1 (locations pane 11)
                switchNodeDay(1, true);
                openSp2Node(11, true, true);
              }
            } else if (activePane === 11) {
              // From Locations back to Pane 4 preps at step 6
              openSp2Node(4, false, true);
              goToSp2Prep1Step(6);
            } else if (activePane === 4) {
              if (currentSp2Prep1Step > 0) {
                goToSp2Prep1Step(currentSp2Prep1Step - 1);
              } else {
                // From Node 4 Day 1 back to Node 3 Day 2 (level 6)
                currentGmLevel = 3;
                currentNodeDay = 2;
                openSp2Node(6, false, true);
                selectSp2Day2ProgramLevel(6, true);
              }
            } else if (activePane === 6) {
              if (currentSp2Day2ProgLvl > 1) {
                selectSp2Day2ProgramLevel(currentSp2Day2ProgLvl - 1, true);
              } else {
                // From Node 3 Day 2 back to Node 3 Day 1 (level 5)
                switchNodeDay(1, true);
                selectSp2Day1ProgramLevel(5, true);
              }
            } else if (activePane === 3) {
              if (currentSp2Day1ProgLvl > 1) {
                selectSp2Day1ProgramLevel(currentSp2Day1ProgLvl - 1, true);
              } else {
                // From Node 3 Day 1 back to Node 2 (phase 8)
                currentGmLevel = 2;
                openSp2Node(2, false, true);
                goToSp2FirstStepsPhase(8, true);
              }
            } else if (activePane === 2) {
              if (currentSp2Step2Phase > 1) {
                goToSp2FirstStepsPhase(currentSp2Step2Phase - 1, true);
              } else {
                // From Node 2 back to Node 1 (step 6)
                currentGmLevel = 1;
                openSp2Node(1, false, true);
                goToSp2EduStep(6);
              }
            } else if (activePane === 1) {
              if (currentSp2EduStep > 0) {
                goToSp2EduStep(currentSp2EduStep - 1);
              } else {
                stepToNextChord(1, 3); // Back to Chord 2 (Step 3: 2-days recap video)
              }
            }
          }
        }
      } else if (activePage === 3) {
        if (direction > 0) {
          if (currentChallengeStep < 4) {
            goToChallengeStep(currentChallengeStep + 1, true);
          } else {
            stepToNextChord(4, 0); // Advances to Chord 5 (الدروس والمستقبل)
          }
        } else {
          if (currentChallengeStep > 0) {
            goToChallengeStep(currentChallengeStep - 1, true);
          } else {
            stepToNextChord(2, 27); // Back to Chord 3 (Day 2 Financials last step 27)
          }
        }
      } else if (activePage === 4) {
        if (direction > 0) {
          if (currentSp5SlideIdx < 2) {
            goToSp5Slide(currentSp5SlideIdx + 1, true);
          } else {
            celebratePresentationCompletion();
          }
        } else {
          if (currentSp5SlideIdx > 1) {
            goToSp5Slide(currentSp5SlideIdx - 1, true);
          } else {
            stepToNextChord(3, 5); // Back to Chord 4 (التحديات last step 5)
          }
        }
      }
    }
// ESC key to return & Space / Arrow keys for presentation sequence
    document.addEventListener('keydown', e => {
      // 0. Toggle Fast Content & Text Editor Modal with F2, Alt+E, Ctrl+Shift+E, or Ctrl+E
      const isContentShortcut = (e.key === 'F2') ||
                                (e.altKey && e.key.toLowerCase() === 'e') ||
                                ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'e') ||
                                ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e');

      if (isContentShortcut) {
        e.preventDefault();
        e.stopPropagation();
        toggleContentManagerModal();
        return;
      }

      // If Content Manager Modal is open, handle Escape or allow editing inside modal
      if (typeof isContentManagerOpen !== 'undefined' && isContentManagerOpen) {
        if (e.key === 'Escape') {
          e.preventDefault();
          closeContentManagerModal();
        }
        return;
      }

      // 0. Disable key interception when in live editor mode or actively editing an element
      const isEditing = isEditorModeActive || 
                        (document.activeElement && document.activeElement.isContentEditable) || 
                        (e.target && e.target.isContentEditable) ||
                        (e.target && e.target.closest && e.target.closest('[contenteditable="true"]')) ||
                        ['INPUT', 'TEXTAREA'].includes(e.target.tagName);

      if (isEditing) {
        if (e.key === 'Escape') {
          if (document.activeElement && document.activeElement.blur) {
            document.activeElement.blur();
          }
        }
        // Allow user to freely use Space, Backspace, Enter, Arrows for editing without switching slides!
        return;
      }
      if (isChordTransitioning) {
        e.preventDefault();
        return;
      }

      // 0.4 Holy Bible Verse 3D Modal check (Chord 0 • Stage 1)
      if (isBibleOpenOnStage1 || isBibleAnimating) {
        if (e.key === 'Escape') {
          e.preventDefault();
          closeAndDismissBible(false);
          return;
        } else if (e.key === 'ArrowLeft' || e.key === ' ' || e.key === 'Enter' || e.key === 'PageDown' || e.key === 'ArrowDown') {
          e.preventDefault();
          if (isBibleOpenOnStage1 && !isBibleAnimating) {
            closeAndDismissBible(true);
          }
          return;
        } else if (e.key === 'ArrowRight' || e.key === 'PageUp' || e.key === 'ArrowUp' || e.key === 'Backspace') {
          e.preventDefault();
          closeAndDismissBible(false);
          return;
        }
      }

      // 0.5 Christmas Cinema Spotlight check
      if (isChristmasVideoExpanded) {
        if (e.key === 'Escape') {
          e.preventDefault();
          closeChristmasCinema(false);
          return;
        } else if (e.key === 'ArrowLeft' || e.key === ' ' || e.key === 'Enter' || e.key === 'PageDown' || e.key === 'ArrowDown') {
          e.preventDefault();
          advanceGlobalPresentation(1);
          return;
        } else if (e.key === 'ArrowRight' || e.key === 'PageUp' || e.key === 'ArrowUp' || e.key === 'Backspace') {
          e.preventDefault();
          advanceGlobalPresentation(-1);
          return;
        }
      }

      // 0.6 Two Days Cinema Spotlight check
      if (isTwoDaysVideoExpanded) {
        if (e.key === 'Escape') {
          e.preventDefault();
          closeTwoDaysVideo(false);
          return;
        } else if (e.key === 'ArrowLeft' || e.key === ' ' || e.key === 'Enter' || e.key === 'PageDown' || e.key === 'ArrowDown') {
          e.preventDefault();
          closeTwoDaysVideo(true);
          return;
        } else if (e.key === 'ArrowRight' || e.key === 'PageUp' || e.key === 'ArrowUp' || e.key === 'Backspace') {
          e.preventDefault();
          closeTwoDaysVideo(false);
          return;
        }
      }

      // 0.7 Theatrical Outro Credits check
      const outroOverlay = document.getElementById('theatrical-outro-overlay');
      if (outroOverlay && outroOverlay.classList.contains('open')) {
        if (e.key === 'Escape') {
          e.preventDefault();
          closeTheatricalThanksOutro();
          return;
        }
      }

      // 1. Lightbox check
      const lb = document.getElementById('cinematic-lightbox');
      if (lb && lb.classList.contains('open')) {
        if (e.key === 'Escape') {
          e.preventDefault();
          if (activePage === 2 && currentGmLevel === 1 && currentSp2EduStep > 0) {
            goToSp2EduStep(currentSp2EduStep - 1);
          } else if (activePage === 2 && currentGmLevel === 4 && currentNodeDay === 1 && currentSp2Prep1Step > 0) {
            goToSp2Prep1Step(currentSp2Prep1Step - 1);
          } else if (activePage === 2 && currentGmLevel === 4 && currentNodeDay === 2 && currentSp2Prep2Step > 0) {
            goToSp2Prep2Step(currentSp2Prep2Step - 1);
          } else {
            closeCinematicZoom();
          }
          return;
        } else if (e.key === 'ArrowLeft' || e.key === ' ' || e.key === 'Enter' || e.key === 'PageDown' || e.key === 'ArrowDown') {
          e.preventDefault();
          advanceGlobalPresentation(1);
          return;
        } else if (e.key === 'ArrowRight' || e.key === 'PageUp' || e.key === 'ArrowUp' || e.key === 'Backspace') {
          e.preventDefault();
          advanceGlobalPresentation(-1);
          return;
        }
      }

      // 2. Escape key
      if (e.key === 'Escape') {
        const guitarWs = document.getElementById('guitar-workspace');
        if (guitarWs && guitarWs.classList.contains('split-active')) {
          e.preventDefault();
          closeGuitarDetails();
          return;
        }
        const finaleBanner = document.getElementById('presentation-finale-banner');
        if (finaleBanner && finaleBanner.style.display !== 'none') {
          e.preventDefault();
          returnToHarpFinale();
          return;
        }
        const rejModal = document.getElementById('rejected-modal-overlay');
        if (rejModal && rejModal.style.display !== 'none') {
          e.preventDefault();
          goToRejectedStep(0);
          return;
        }
        const dayModal = document.getElementById('day-section-modal-overlay');
        if (dayModal && dayModal.classList.contains('open')) {
          e.preventDefault();
          closeDaySectionModal();
          return;
        }
        if (activePage !== null) {
          e.preventDefault();
          closePage();
          return;
        }
      }

      // 3. Navigation keys
      const isNext = (e.key === ' ' || e.key === 'ArrowLeft' || e.key === 'Enter' || e.key === 'PageDown' || e.key === 'ArrowDown');
      const isPrev = (e.key === 'ArrowRight' || e.key === 'PageUp' || e.key === 'ArrowUp' || e.key === 'Backspace');

      if (isNext) {
        e.preventDefault();
        advanceGlobalPresentation(1);
      } else if (isPrev) {
        e.preventDefault();
        advanceGlobalPresentation(-1);
      }
    });

    // ── 7. Cinematic Zoom Lightbox Controller (Zoom In & Zoom Out) ──
    const milestoneZoomData = [
      {
        src: 'assets/formation day.jpg',
        tag: 'المحطة الأولى • البداية',
        title: 'يوم تكوين وتأسيس الرهط',
        desc: 'الملعب ليلاً • لقاء العزائم وتأسيس عشيرة رهط الوتر'
      },
      {
        src: 'assets/first meeting.jpg',
        tag: 'المحطة الثانية • التخطيط',
        title: 'أول اجتماع رسمي للفريق',
        desc: 'التنسيق والترتيب وارتداء طوق الكشافة بحماس وأخوة'
      },
      {
        src: 'assets/day of naming.jpg',
        tag: 'المحطة الثالثة • الهوية والمشروع',
        title: 'اختيار اسم «الوتر» وولادة فكرة المشروع',
        desc: 'جلسة الاستقرار على الاسم وإطلاق فكرة مشروع خدمة ورعاية الأطفال'
      },
      {
        srcs: ['assets/christmas gathering.jpg', 'assets/post padel.jpg'],
        tags: ['المحطة الرابعة • المحبة والدفء', 'المحطة الرابعة • الرياضة والنشاط'],
        titles: ['لقاء الكريسماس السنوي', 'مباراة البادل والنشاط الرياضي'],
        descs: ['تجمع العشيرة حول شجرة عيد الميلاد', 'روح المنافسة الشريفة والأخوة الحقيقية']
      },
      {
        src: 'assets/tgdeed el wa3d.jpg',
        tag: 'المحطة الخامسة • العهد المقدس',
        title: 'يوم تجديد الوعد التجوالي',
        desc: 'رفع التحية الكشفية والعهد بالزي الكشفي الكامل أمام القادة والعشيرة'
      }
    ];

    function openMilestoneZoom(idx, subIdx = 0) {
      const data = milestoneZoomData[idx];
      if (!data) return;

      let src = data.src;
      let tag = data.tag;
      let title = data.title;
      let desc = data.desc;

      if (idx === 3 && Array.isArray(data.srcs)) {
        src = data.srcs[subIdx] || data.srcs[0];
        tag = data.tags[subIdx] || data.tags[0];
        title = data.titles[subIdx] || data.titles[0];
        desc = data.descs[subIdx] || data.descs[0];
      }

      openStageZoom(src, tag, title, desc);
    }

    function openStageZoom(src, tag, title, desc = '') {
      const lightbox = document.getElementById('cinematic-lightbox');
      const img = document.getElementById('lightbox-img');
      const caption = document.getElementById('lightbox-caption');
      if (!lightbox || !img) return;

      img.src = src;
      img.alt = title;

      caption.innerHTML = `
    <span class="lightbox-tag">${tag}</span>
    <h3 class="lightbox-title">${title}</h3>
    ${desc ? `<p class="lightbox-hint">${desc}</p>` : ''}
    
  `;

      lightbox.classList.add('open');
    }

    function closeCinematicZoom() {
      const lightbox = document.getElementById('cinematic-lightbox');
      if (lightbox) {
        lightbox.classList.remove('open');
      }
    }

    function openCinematicZoom(src, title, tag = '', desc = '') {
      openStageZoom(src, tag, title, desc);
    }

    // ── Chord 3 Level 1: Educational Cards Spotlight & Zoom Controller ──
    let currentSp2EduStep = 0; // 0: none, 1: card 0 spotlight, 2: card 0 zoom, 3: card 1 spotlight, 4: card 1 zoom, 5: card 2 spotlight, 6: card 2 zoom
    let currentHighlightedEduCard = -1;

    const eduCardsData = [
      {
        img: 'assets/اعداد قادة.jpg',
        title: 'كورس إعداد القادة',
      },
      {
        img: 'assets/meeting with s7aba.jpg',
        title: 'قعدنا مع سحابة',
      },
      {
        img: 'assets/session john and mira.jpg',
        title: 'جلسة قادة أشبال وزهرات',
      }
    ];

    function highlightEduCard(cardIdx) {
      currentHighlightedEduCard = cardIdx;
      const grid = document.querySelector('.gm-edu-grid');
      if (grid) {
        grid.classList.toggle('has-spotlight', cardIdx >= 0);
      }
      for (let i = 0; i < 3; i++) {
        const card = document.getElementById(`gm-edu-card-${i}`);
        if (card) {
          card.classList.toggle('spotlight-active', i === cardIdx);
        }
      }
      if (cardIdx >= 0) {
        pluckHarpString(261.63 + cardIdx * 45, 0.55);
      }
    }

    function openEduCardZoom(cardIdx) {
      const data = eduCardsData[cardIdx];
      if (!data) return;
      openCinematicZoom(data.img, data.title, data.tag, data.desc);
      pluckHarpString(329.63 + cardIdx * 40, 0.65);
    }

    function goToSp2EduStep(step) {
      currentSp2EduStep = step;
      if (step === 0) {
        closeCinematicZoom();
        highlightEduCard(-1);
      } else if (step === 1) {
        closeCinematicZoom();
        highlightEduCard(0);
      } else if (step === 2) {
        highlightEduCard(0);
        openEduCardZoom(0);
      } else if (step === 3) {
        closeCinematicZoom();
        highlightEduCard(1);
      } else if (step === 4) {
        highlightEduCard(1);
        openEduCardZoom(1);
      } else if (step === 5) {
        closeCinematicZoom();
        highlightEduCard(2);
      } else if (step === 6) {
        highlightEduCard(2);
        openEduCardZoom(2);
      }
      updateUniversalHud();
    }

    function handleEduCardTap(cardIdx) {
      if (currentHighlightedEduCard !== cardIdx) {
        // First tap: highlight this card
        goToSp2EduStep(cardIdx * 2 + 1);
      } else {
        // Second tap on the already highlighted card: open larger popup
        goToSp2EduStep(cardIdx * 2 + 2);
      }
    }

    // ── Chord 3 Level 2 (Slide 15): First Steps & Field Exploration Controller ──
    let currentSp2Step2Phase = 1; // 1..8 (1: card 0 high, 2: card 0 exp, 3: card 1 high, 4: card 1 exp, ...)

    function goToSp2FirstStepsPhase(phase, playSound = true) {
      if (phase < 1) phase = 1;
      if (phase > 8) phase = 8;
      currentSp2Step2Phase = phase;

      const targetCardIdx = Math.floor((phase - 1) / 2);
      const isExpanded = (phase % 2 === 0);

      const strip = document.getElementById('gm-first-steps-strip');
      if (strip) {
        strip.classList.toggle('has-highlighted', !isExpanded);
        strip.classList.toggle('has-expanded', isExpanded);
      }

      // Update 4 cards
      for (let i = 0; i < 4; i++) {
        const card = document.getElementById(`gm-step-card-${i}`);
        const btnLabel = document.getElementById(`fs-btn-label-${i}`);

        if (card) {
          const isThisCard = (i === targetCardIdx);
          card.classList.toggle('is-highlighted', isThisCard && !isExpanded);
          card.classList.toggle('is-expanded', isThisCard && isExpanded);

          if (btnLabel) {
            btnLabel.textContent = (isThisCard && isExpanded) ? 'تصغير التفاصيل' : 'عرض التفاصيل';
          }
        }
      }

      if (playSound && typeof pluckHarpString === 'function') {
        if (isExpanded) {
          pluckHarpString(523.25, 0.45); // High rich chime on expansion
        } else {
          pluckHarpString(392.00, 0.35); // Gentle focus chime on highlight
        }
      }

      if (typeof updateUniversalHud === 'function') {
        updateUniversalHud();
      }
    }

    function handleFirstStepCardTap(cardIdx) {
      if (cardIdx < 0 || cardIdx > 3) return;
      const curTarget = Math.floor((currentSp2Step2Phase - 1) / 2);
      const isExp = (currentSp2Step2Phase % 2 === 0);

      if (curTarget !== cardIdx) {
        // Tap another card: highlight it
        goToSp2FirstStepsPhase(cardIdx * 2 + 1, true);
      } else if (!isExp) {
        // Tap highlighted card: expand it showing bullets
        goToSp2FirstStepsPhase(cardIdx * 2 + 2, true);
      } else {
        // Tap expanded card: collapse to highlight
        goToSp2FirstStepsPhase(cardIdx * 2 + 1, true);
      }
    }

    // ── Chord 3 Level 4: Day 1 Preparations Spotlight & Zoom Controller ──
    let currentSp2Prep1Step = 0; // 0: none, 1: card 0 spotlight, 2: card 0 zoom, 3: card 1 spotlight, 4: card 1 zoom, 5: card 2 spotlight, 6: card 2 zoom
    let currentHighlightedPrep1Card = -1;

    const prep1CardsData = [
      {
        img: 'assets/religous session day 1.jpg',
        title: 'أنت غالي ومحبوب في عين ربنا',
        tag: 'الفقرة الروحية • اليوم الأول',
        desc: 'المحاضرة الروحية وترانيم الفرح مع أطفال كنيسة العزراء بالسلام'
      },
      {
        img: 'assets/ethics session day 1.jpg',
        title: 'ورشة الأمانة والاحترام العملي',
        tag: 'تقويم السلوك • اليوم الأول',
        desc: 'ورشة الأخلاق وتعديل وبناء السلوك الإيجابي للأطفال'
      },
      {
        img: 'assets/games day 1.jpg',
        title: 'الزحليقة المائية وتيليب ماتش',
        tag: 'الترفيه والمسابقات • اليوم الأول',
        desc: 'الألعاب الكبرى والزحليقة المائية وتحديات التيليب ماتش الحماسية'
      }
    ];

    function highlightPrep1Card(cardIdx) {
      currentHighlightedPrep1Card = cardIdx;
      const grid = document.querySelector('.gm-prep1-grid');
      if (grid) {
        grid.classList.toggle('has-spotlight', cardIdx >= 0);
      }
      for (let i = 0; i < 3; i++) {
        const card = document.getElementById(`gm-prep1-card-${i}`);
        if (card) {
          card.classList.toggle('spotlight-active', i === cardIdx);
        }
      }
      if (cardIdx >= 0) {
        pluckHarpString(261.63 + cardIdx * 45, 0.55);
      }
    }

    function openPrep1CardZoom(cardIdx) {
      const data = prep1CardsData[cardIdx];
      if (!data) return;
      openCinematicZoom(data.img, data.title, data.tag, data.desc);
      pluckHarpString(329.63 + cardIdx * 40, 0.65);
    }

    function goToSp2Prep1Step(step) {
      currentSp2Prep1Step = step;
      if (step === 0) {
        closeCinematicZoom();
        highlightPrep1Card(-1);
      } else if (step === 1) {
        closeCinematicZoom();
        highlightPrep1Card(0);
      } else if (step === 2) {
        highlightPrep1Card(0);
        openPrep1CardZoom(0);
      } else if (step === 3) {
        closeCinematicZoom();
        highlightPrep1Card(1);
      } else if (step === 4) {
        highlightPrep1Card(1);
        openPrep1CardZoom(1);
      } else if (step === 5) {
        closeCinematicZoom();
        highlightPrep1Card(2);
      } else if (step === 6) {
        highlightPrep1Card(2);
        openPrep1CardZoom(2);
      }
      updateUniversalHud();
    }

    function handlePrep1CardTap(cardIdx) {
      if (currentHighlightedPrep1Card !== cardIdx) {
        // First tap: highlight this card
        goToSp2Prep1Step(cardIdx * 2 + 1);
      } else {
        // Second tap on the already highlighted card: open larger popup
        goToSp2Prep1Step(cardIdx * 2 + 2);
      }
    }

    // ── Preparations Day 2 (Node 4 Day 2 • كنيسة البطحة والفيلا) ──
    let currentSp2Prep2Step = 0; // 0: none, 1: card 0 spotlight, 2: card 0 zoom, 3: card 1 spotlight, 4: card 1 zoom, 5: card 2 spotlight, 6: card 2 zoom
    let currentHighlightedPrep2Card = -1;

    const prep2CardsData = [
      {
        img: 'assets/religous session day 2.jpg',
        title: 'المحبة والرجاء',
        tag: 'الفقرة الروحية • اليوم الثاني',
        desc: 'المحاضرة الروحية وترانيم الفرح مع أطفال كنيسة البطحة'
      },
      {
        img: 'assets/session john and mira.jpg',
        title: 'إدارة المشاعر وضبط النفس',
        tag: 'تقويم السلوك • اليوم الثاني',
        desc: 'ورشة عملية في إدارة المشاعر وبناء السلوك الإيجابي للأطفال'
      },
      {
        img: 'assets/games boys day 2.jpg',
        title: 'المسبح وتحديات الملاعب',
        tag: 'الترفيه والمسابقات • اليوم الثاني',
        desc: 'أنشطة حمام السباحة والتناوب مع ألعاب ومسابقات الملاعب الخضراء بالفيلا'
      }
    ];

    function highlightPrep2Card(cardIdx) {
      currentHighlightedPrep2Card = cardIdx;
      const grid = document.querySelector('.gm-prep2-grid');
      if (grid) {
        grid.classList.toggle('has-spotlight', cardIdx >= 0);
      }
      for (let i = 0; i < 3; i++) {
        const card = document.getElementById(`gm-prep2-card-${i}`);
        if (card) {
          card.classList.toggle('spotlight-active', i === cardIdx);
        }
      }
      if (cardIdx >= 0) {
        pluckHarpString(293.66 + cardIdx * 45, 0.55);
      }
    }

    function openPrep2CardZoom(cardIdx) {
      const data = prep2CardsData[cardIdx];
      if (!data) return;
      openCinematicZoom(data.img, data.title, data.tag, data.desc);
      pluckHarpString(349.23 + cardIdx * 40, 0.65);
    }

    function goToSp2Prep2Step(step) {
      currentSp2Prep2Step = step;
      if (step === 0) {
        closeCinematicZoom();
        highlightPrep2Card(-1);
      } else if (step === 1) {
        closeCinematicZoom();
        highlightPrep2Card(0);
      } else if (step === 2) {
        highlightPrep2Card(0);
        openPrep2CardZoom(0);
      } else if (step === 3) {
        closeCinematicZoom();
        highlightPrep2Card(1);
      } else if (step === 4) {
        highlightPrep2Card(1);
        openPrep2CardZoom(1);
      } else if (step === 5) {
        closeCinematicZoom();
        highlightPrep2Card(2);
      } else if (step === 6) {
        highlightPrep2Card(2);
        openPrep2CardZoom(2);
      }
      updateUniversalHud();
    }

    function handlePrep2CardTap(cardIdx) {
      if (currentHighlightedPrep2Card !== cardIdx) {
        // First tap: highlight this card
        goToSp2Prep2Step(cardIdx * 2 + 1);
      } else {
        // Second tap on the already highlighted card: open larger popup
        goToSp2Prep2Step(cardIdx * 2 + 2);
      }
    }

    // ── 8. Scene 4 Elaborate Audio Harmonies & Chime Synthesis ──
    function playMilestoneHarmonicAudio(milestoneIdx) {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;

        // Laser glide whoosh
        playLaserSlideAudio();

        if (milestoneIdx === 0) {
          // Station 0: Formation Day (C Major resonant acoustic arpeggio)
          const chord = [130.81, 196.00, 261.63, 329.63];
          chord.forEach((freq, i) => {
            setTimeout(() => pluckHarpString(freq, 0.72 - i * 0.08), i * 90);
          });
        } else if (milestoneIdx === 1) {
          // Station 1: First Meeting (D Major ascending cadence)
          const chord = [146.83, 220.00, 293.66, 369.99];
          chord.forEach((freq, i) => {
            setTimeout(() => pluckHarpString(freq, 0.72 - i * 0.08), i * 85);
          });
        } else if (milestoneIdx === 2) {
          // Station 2: Naming & Project Ideation (F Major melodic chord)
          const chord = [174.61, 261.63, 349.23, 440.00, 523.25];
          chord.forEach((freq, i) => {
            setTimeout(() => pluckHarpString(freq, 0.75 - i * 0.07), i * 80);
          });
        } else if (milestoneIdx === 3) {
          // Station 3: Christmas & Sports (G Major festive sequence)
          const chord = [196.00, 293.66, 392.00, 493.88, 587.33, 783.99];
          chord.forEach((freq, i) => {
            setTimeout(() => pluckHarpString(freq, 0.72 - i * 0.06), i * 75);
          });
        } else if (milestoneIdx === 4) {
          // Station 4: Renewing the Promise (Triumphant Golden Apex Fanfare + Shimmer Chime)
          const chord = [130.81, 196.00, 261.63, 329.63, 392.00, 523.25, 659.25, 1046.50];
          chord.forEach((freq, i) => {
            setTimeout(() => pluckHarpString(freq, 0.88 - i * 0.05), i * 80);
          });
          // Layered ethereal cathedral bells
          setTimeout(() => playGoldenBellChime(523.25), 200);
          setTimeout(() => playGoldenBellChime(659.25), 380);
          setTimeout(() => playGoldenBellChime(1046.50), 560);
        }
      } catch (e) {
        // Audio context graceful fallback
      }
    }

    // Ethereal Golden Bell Chime (Pure tone + shimmering overtones)
    function playGoldenBellChime(freq) {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // Minor third overtone for church/cathedral bell depth
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 2.76, ctx.currentTime);

        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.2);

        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc2.start();
        osc.stop(ctx.currentTime + 3.2);
        osc2.stop(ctx.currentTime + 3.2);
      } catch (e) { }
    }

    // Subtle laser glide whoosh when beam advances
    function playLaserSlideAudio() {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(260, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(740, ctx.currentTime + 0.16);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, ctx.currentTime);

        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } catch (e) { }
    }

    // ── 9. Chord 0 (Who We Are) Seamless PPT Presentation ──
    let currentPptStep = 0; // 0 to 7 (8 sequential presentation steps in exact speaking order)

    function updatePptPresentation(isManualNavigation = false) {
      updateUniversalHud();
      // Update slide counter badge: 1 to 8
      const counterEl = document.getElementById('ppt-counter-badge');
      if (counterEl) {
        const arabicNums = ['١', '٢', '٣', '٤', '٥', '٦', '٧', '٨'];
        counterEl.textContent = `${arabicNums[currentPptStep] || (currentPptStep + 1)} / ٨`;
      }

      // Update floating side navigation buttons state
      const prevBtn = document.getElementById('ppt-prev-btn');
      const nextBtn = document.getElementById('ppt-next-btn');
      if (prevBtn) prevBtn.disabled = (currentPptStep === 0);
      if (nextBtn) nextBtn.disabled = (currentPptStep === 7);

      // Map step to stage & milestone:
      // Step 0: Stage 0 (تعريف الرهط وأسماء الأعضاء)
      // Step 1: Stage 1 (سر التسمية «رهط الوتر»)
      // Step 2: Stage 2 (العهد التجوالي والالتزام اليومي)
      // Step 3: Stage 3, Milestone 0 (تأسيس الرهط)
      // Step 4: Stage 3, Milestone 1 (أول اجتماع رسمي)
      // Step 5: Stage 3, Milestone 2 (اختيار الاسم وفكرة المشروع)
      // Step 6: Stage 3, Milestone 3 (الكريسماس والرياضة)
      // Step 7: Stage 3, Milestone 4 (تجديد الوعد التجوالي)
      const activeStageIdx = currentPptStep < 3 ? currentPptStep : 3;
      const activeMilestoneIdx = currentPptStep >= 3 ? (currentPptStep - 3) : 0;

      // Update presentation stage slides (Stage 0, 1, 2, 3)
      document.querySelectorAll('.stage-slide').forEach((slide, idx) => {
        slide.classList.toggle('active', idx === activeStageIdx);
      });

      // If in timeline stage (Stage 3), update milestone slides, staff nodes, laser beam & play sound
      if (activeStageIdx === 3) {
        document.querySelectorAll('.milestone-slide').forEach((slide, idx) => {
          slide.classList.toggle('active', idx === activeMilestoneIdx);
        });

        document.querySelectorAll('.staff-node').forEach((node, idx) => {
          node.classList.toggle('active', idx === activeMilestoneIdx);
        });

        // Update laser beam fill width across the 5 nodes (0%, 25%, 50%, 75%, 100%)
        const beamFill = document.getElementById('staff-beam-fill');
        if (beamFill) {
          beamFill.style.width = (activeMilestoneIdx * 25) + '%';
        }

        // Play bespoke harmonic audio for this milestone in Scene 4
        if (isManualNavigation) {
          playMilestoneHarmonicAudio(activeMilestoneIdx);
        }
      }
    }

    function goToPptStep(step, isManual = false) {
      if (step < 0 || step > 7) return;
      if (step !== 1 && (isBibleOpenOnStage1 || isBibleAnimating)) {
        forceResetBibleModal();
      }
      if (step !== 6 && isChristmasVideoExpanded) {
        closeChristmasCinema(false);
      }
      currentPptStep = step;
      updatePptPresentation(isManual);
    }

    function nextPresentationStep() {
      advanceGlobalPresentation(1);
    }

    function prevPresentationStep() {
      advanceGlobalPresentation(-1);
    }

    // Staff node direct click in timeline: jumps to that milestone (steps 3 to 7)
    function setTimelineStep(milestoneIdx) {
      if (milestoneIdx < 0 || milestoneIdx > 4) return;
      goToPptStep(3 + milestoneIdx, true);
    }

    // ── 10. Chord 1 (The Project) Seamless PPT Presentation (2 Steps + 3 Reason Spotlight Steps) ──
    let currentProjStep = 0; // 0: Rejected Projects, 1: Approved Idea & Goal
    let currentRejectedStep = 0; // 0: No modal, 1: Card 1 reason modal, 2: Card 2 reason modal, 3: Card 3 reason modal

    const rejectedCardsData = [
      {
        title: 'حملة التوعية النفسية',
        reason: 'الجلسات محتاجة ومتخصصين مش إحنا',
        iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>'
      },
      {
        title: 'رحلات الهايكينج للآخرين',
        reason: 'الرحلات مكنش فيها خدمة ولا أثر حقيقي للأولاد',
        iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 22 22 22 12 2"></polygon><path d="M12 12l4 7H8z"></path></svg>'
      },
      {
        title: 'فريق الأنشطة الرياضية',
        reason: 'تنظيم الملاعب والألعاب أصلاً شغل قادة المعسكر',
        iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M9 12l2 2 4-4"></path></svg>'
      }
    ];

    function showRejectedReasonModal(cardIdx) {
      const data = rejectedCardsData[cardIdx];
      if (!data) return;

      const overlay = document.getElementById('rejected-modal-overlay');
      const badge = document.getElementById('rej-modal-badge');
      const icon = document.getElementById('rej-modal-icon-wrap');
      const title = document.getElementById('rej-modal-title');
      const reason = document.getElementById('rej-modal-reason-text');

      const arabicNums = ['الأولى', 'الثانية', 'الثالثة'];
      if (badge) badge.textContent = `سبب الاستبعاد • الفكرة ${arabicNums[cardIdx] || (cardIdx + 1)}`;
      if (icon) icon.innerHTML = data.iconSvg;
      if (title) title.textContent = data.title;
      if (reason) reason.textContent = data.reason;

      for (let i = 0; i < 3; i++) {
        const card = document.getElementById(`rej-card-${i}`);
        if (card) card.classList.toggle('spotlight-active', i === cardIdx);
      }

      if (overlay) overlay.style.display = 'flex';
      pluckHarpString(293.66 + cardIdx * 45, 0.65);
      updateUniversalHud();
    }

    function closeRejectedReasonModal() {
      const overlay = document.getElementById('rejected-modal-overlay');
      if (overlay) overlay.style.display = 'none';
      updateUniversalHud();
    }

    function highlightRejectedCard(cardIdx) {
      for (let i = 0; i < 3; i++) {
        const card = document.getElementById(`rej-card-${i}`);
        if (card) card.classList.toggle('spotlight-active', i === cardIdx);
      }
      if (cardIdx >= 0) {
        pluckHarpString(261.63 + cardIdx * 40, 0.5);
      }
    }

    function goToRejectedStep(step) {
      currentRejectedStep = step;
      if (step === 0) {
        closeRejectedReasonModal();
        highlightRejectedCard(-1);
      } else if (step === 1) {
        closeRejectedReasonModal();
        highlightRejectedCard(0);
      } else if (step === 2) {
        showRejectedReasonModal(0);
      } else if (step === 3) {
        closeRejectedReasonModal();
        highlightRejectedCard(1);
      } else if (step === 4) {
        showRejectedReasonModal(1);
      } else if (step === 5) {
        closeRejectedReasonModal();
        highlightRejectedCard(2);
      } else if (step === 6) {
        showRejectedReasonModal(2);
      }
    }

    function updateProjPresentation() {
      updateUniversalHud();
      const counterEl = document.getElementById('ppt-counter-badge-1');
      if (counterEl) {
        const arabicNums = ['١', '٢', '٣', '٤'];
        counterEl.textContent = `${arabicNums[currentProjStep] || (currentProjStep + 1)} / ٤`;
      }

      const prevBtn = document.getElementById('ppt-prev-btn-1');
      const nextBtn = document.getElementById('ppt-next-btn-1');
      if (prevBtn) prevBtn.disabled = (currentProjStep === 0 && currentRejectedStep === 0);
      if (nextBtn) nextBtn.disabled = false;

      document.querySelectorAll('#presentation-stage-1 .stage-slide').forEach((slide, idx) => {
        slide.classList.toggle('active', idx === currentProjStep);
      });
      if (currentProjStep !== 0) {
        closeRejectedReasonModal();
        highlightRejectedCard(-1);
      }
      if (currentProjStep === 2) {
        init10StringGuitar();
      } else if (currentProjStep === 3) {
        closeGuitarDetails();
      }
    }

    function goToProjStep(step) {
      if (step < 0 || step > 3) return;
      currentProjStep = step;
      updateProjPresentation();
    }

    function nextProjStep() {
      advanceGlobalPresentation(1);
    }

    function prevProjStep() {
      advanceGlobalPresentation(-1);
    }

    // ── 10.1 Ten-String Acoustic Guitar Responsibilities System ──
    const guitarStringsData = [
      {
        name: 'الروحي',
        title: 'الفقرة الروحية',
        desc: '',
        color: '#e5a93c',
        freq: 130.81,
        icon: '🕊️',
        members: [
          { name: 'جونثان امير', role: 'الفقرة الروحية' },
          { name: 'كيرلس مشيل', role: 'الفقرة الروحية' },
          { name: 'فيلوباتير عصام', role: 'الفقرة الروحية' }
        ]
      },
      {
        name: 'الأخلاقي',
        title: 'الفقرة الأخلاقية',
        desc: '',
        color: '#38bdf8',
        freq: 146.83,
        icon: '💡',
        members: [
          { name: 'مينا كريم', role: 'الفقرة الأخلاقية' },
          { name: 'أبرأم نعيم', role: 'الفقرة الأخلاقية' },
          { name: 'مايكل هاني', role: 'الفقرة الأخلاقية' },
          { name: 'كيرلس سامي', role: 'الفقرة الأخلاقية' }
        ]
      },
      {
        name: 'الميزانيه',
        title: 'الميزانية',
        desc: '',
        color: '#4ade80',
        freq: 164.81,
        icon: '💰',
        members: [
          { name: 'جون ماجد', role: 'الميزانية والحسابات' },
          { name: 'ابرام مدحت', role: 'الميزانية والحسابات' }
        ]
      },
      {
        name: 'اللوجيستيات',
        title: 'اللوجيستيات',
        desc: '',
        color: '#f472b6',
        freq: 196.00,
        icon: '📦',
        members: [
          { name: 'توماس تامر', role: 'اللوجيستيات والتجهيز' },
          { name: 'حنا رفعت', role: 'اللوجيستيات والتجهيز' }
        ]
      },
      {
        name: 'الألعاب',
        title: 'الألعاب',
        desc: '',
        color: '#fb923c',
        freq: 220.00,
        icon: '🎯',
        members: [
          { name: 'حنا رفعت', role: 'الألعاب الكبرى' },
          { name: 'ابرام مدحت', role: 'الألعاب الكبرى' },
          { name: 'فيلوباتير عصام', role: 'الألعاب الكبرى' },
          { name: 'ابرام نعيم', role: 'الألعاب الكبرى' },
          { name: 'كيرلس سامي', role: 'الألعاب الكبرى' }
        ]
      },
      {
        name: 'قائد اليوم الأول',
        title: 'قيادة اليوم الأول (العذراء بالسلام)',
        desc: '',
        color: '#a78bfa',
        freq: 246.94,
        icon: '⚜️',
        members: [
          { name: 'جون ماجد', role: 'قائد اليوم الأول' },
          { name: 'جونثان امير', role: 'قائد اليوم الأول' }
        ]
      },
      {
        name: 'قائد اليوم التاني',
        title: 'قيادة اليوم التاني (خدمة السلام)',
        desc: '',
        color: '#34d399',
        freq: 293.66,
        icon: '⚜️',
        members: [
          { name: 'حنا رفعت', role: 'قائد اليوم الثاني' },
          { name: 'توماس تامر', role: 'قائد اليوم الثاني' }
        ]
      },
      {
        name: 'كرافتس',
        title: 'ورش الكرافتس',
        desc: '',
        color: '#facc15',
        freq: 329.63,
        icon: '✂️',
        members: [
          { name: 'جون ماجد', role: 'ورش الكرافتس' },
          { name: 'ابرام مدحت', role: 'ورش الكرافتس' },
          { name: 'مينا سامح', role: 'ورش الكرافتس' },
          { name: 'كيرلس سامي', role: 'ورش الكرافتس' }
        ]
      },
      {
        name: 'الفقره الافتتاحيه',
        title: 'الفقرة الافتتاحية',
        desc: '',
        color: '#f87171',
        freq: 392.00,
        icon: '🎉',
        members: [
          { name: 'مينا سامح', role: 'الفقرة الافتتاحية' },
          { name: 'ابرام نعيم', role: 'الفقرة الافتتاحية' },
          { name: 'جوناثان امير', role: 'الفقرة الافتتاحية' }
        ]
      },
      {
        name: 'الاكل',
        title: 'تجهيز الاكل',
        desc: '',
        color: '#60a5fa',
        freq: 440.00,
        icon: '🥪',
        members: [
          { name: 'جون ماجد', role: 'مسؤول الاكل' },
          { name: 'ابرام مدحت', role: 'مسؤول الاكل' }
        ]
      }
    ];

    let currentGuitarStringIdx = -1;
    let isGuitarInitialized = false;
    const guitarActiveAnimations = {};

    const guitarStringCoordinates = [
      { x1: 241, y1: 96, x2: 234, y2: 520 }, // 0
      { x1: 247, y1: 96, x2: 242, y2: 520 }, // 1
      { x1: 253, y1: 96, x2: 250, y2: 520 }, // 2
      { x1: 260, y1: 96, x2: 258, y2: 520 }, // 3
      { x1: 267, y1: 96, x2: 266, y2: 520 }, // 4
      { x1: 273, y1: 96, x2: 274, y2: 520 }, // 5
      { x1: 280, y1: 96, x2: 282, y2: 520 }, // 6
      { x1: 286, y1: 96, x2: 290, y2: 520 }, // 7
      { x1: 293, y1: 96, x2: 298, y2: 520 }, // 8
      { x1: 299, y1: 96, x2: 306, y2: 520 }  // 9
    ];

    function animateGuitarVectorString(idx, pathEl, glowEl, amp = 14, decay = 3.0, freq = 220) {
      if (guitarActiveAnimations[idx]) {
        cancelAnimationFrame(guitarActiveAnimations[idx]);
      }

      const coords = guitarStringCoordinates[idx] || { x1: 270, y1: 96, x2: 270, y2: 520 };
      const dx = coords.x2 - coords.x1;
      const dy = coords.y2 - coords.y1;
      const len = Math.sqrt(dx * dx + dy * dy);
      const nx = -dy / len;
      const ny = dx / len;

      const omega = 2 * Math.PI * Math.min(28, freq / 8);
      let t0 = null;
      const steps = 36;
      const origD = `M ${coords.x1},${coords.y1} L ${coords.x2},${coords.y2}`;

      function resetStraight() {
        if (pathEl) pathEl.setAttribute('d', origD);
        if (glowEl) glowEl.setAttribute('d', origD);
      }

      (function step(ts) {
        if (!t0) t0 = ts;
        const t = (ts - t0) / 1000;
        const currentAmp = amp * Math.exp(-t * decay);

        if (currentAmp < 0.35) {
          resetStraight();
          delete guitarActiveAnimations[idx];
          return;
        }

        let d = `M ${coords.x1.toFixed(1)},${coords.y1.toFixed(1)}`;
        const phase = Math.cos(omega * t);

        for (let i = 1; i <= steps; i++) {
          const s = i / steps;
          const wave = Math.sin(Math.PI * s) * currentAmp * phase;
          const x = coords.x1 + s * dx + nx * wave;
          const y = coords.y1 + s * dy + ny * wave;
          d += ` L ${x.toFixed(1)},${y.toFixed(1)}`;
        }

        if (pathEl) pathEl.setAttribute('d', d);
        if (glowEl) glowEl.setAttribute('d', d);

        guitarActiveAnimations[idx] = requestAnimationFrame(step);
      })(performance.now());
    }

    function spawnGuitarSparkle(e, color) {
      const container = document.getElementById('guitar-instrument-col');
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX || (rect.left + rect.width / 2);
      const clientY = e.clientY || (rect.top + rect.height / 2);

      const glyphs = ['♪', '♫', '♩', '✦', '✧', '🎸'];
      for (let i = 0; i < 3; i++) {
        const el = document.createElement('div');
        el.className = 'note-particle';
        el.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
        el.style.left = `${clientX - rect.left}px`;
        el.style.top = `${clientY - rect.top}px`;
        el.style.setProperty('--dx', `${(Math.random() - 0.5) * 80}px`);
        el.style.setProperty('--dy', `${-25 - Math.random() * 60}px`);
        el.style.setProperty('--rot', `${(Math.random() - 0.5) * 60}deg`);
        if (color) el.style.color = color;
        container.appendChild(el);
        setTimeout(() => el.remove(), 950);
      }
    }

    function init10StringGuitar() {
      if (isGuitarInitialized) return;
      isGuitarInitialized = true;

      const groups = document.querySelectorAll('.guitar-str-group');
      groups.forEach(group => {
        const idx = parseInt(group.dataset.idx, 10);
        const data = guitarStringsData[idx];
        if (!data) return;

        const pathEl = group.querySelector('.guitar-str-line');
        const glowEl = group.querySelector('.guitar-str-glow');

        // Hover: Pluck audio + standing wave animation + sparkles
        group.addEventListener('mouseenter', e => {
          pluckHarpString(data.freq, 0.62);
          animateGuitarVectorString(idx, pathEl, glowEl, 14, 2.8, data.freq);
          spawnGuitarSparkle(e, data.color);
        });

        // Click: Select string and open details panel
        group.addEventListener('click', e => {
          selectGuitarString(idx);
          spawnGuitarSparkle(e, data.color);
        });
      });
    }

    function selectGuitarString(idx) {
      if (idx < 0 || idx >= guitarStringsData.length) return;
      currentGuitarStringIdx = idx;
      const data = guitarStringsData[idx];

      const workspace = document.getElementById('guitar-workspace');
      if (workspace) workspace.classList.add('split-active');

      // Highlight active string in SVG
      document.querySelectorAll('.guitar-str-group').forEach((g, i) => {
        g.classList.toggle('active', i === idx);
        const line = g.querySelector('.guitar-str-line');
        const glow = g.querySelector('.guitar-str-glow');
        if (i === idx) {
          animateGuitarVectorString(idx, line, glow, 16, 2.6, data.freq);
        }
      });

      // Highlight active pill
      document.querySelectorAll('.g-pill').forEach((pill, i) => {
        pill.classList.toggle('active', i === idx);
      });

      // Populate details panel
      const titleEl = document.getElementById('g-panel-title');
      const chipEl = document.getElementById('g-panel-chip');
      const descEl = document.getElementById('g-panel-desc');
      const counterEl = document.getElementById('g-footer-counter');
      const grid = document.getElementById('g-members-grid');

      if (titleEl) {
        titleEl.textContent = `${data.icon} ${data.title}`;
        titleEl.style.textShadow = `0 0 14px ${data.color}`;
      }
      if (chipEl) {
        chipEl.textContent = `الوتر ${toArabicNum(idx + 1)}`;
        chipEl.style.background = data.color;
      }
      if (descEl) descEl.textContent = data.desc;
      if (counterEl) counterEl.textContent = `${toArabicNum(idx + 1)} / ١٠`;

      if (grid) {
        grid.innerHTML = data.members.map((m, mIdx) => `
          <div class="g-member-card">
            <div class="g-member-name">${m.name}</div>
            <span class="g-member-role-chip" style="color: ${data.color}; background: rgba(255,255,255,0.08);">${m.role}</span>
          </div>
        `).join('');
      }

      // Audio chord feedback
      pluckHarpString(data.freq, 0.7);
      setTimeout(() => pluckHarpString(data.freq * 1.25, 0.45), 70);
    }

    function closeGuitarDetails() {
      currentGuitarStringIdx = -1;
      const workspace = document.getElementById('guitar-workspace');
      if (workspace) workspace.classList.remove('split-active');

      document.querySelectorAll('.guitar-str-group').forEach(g => g.classList.remove('active'));
      document.querySelectorAll('.g-pill').forEach(p => p.classList.remove('active'));
    }

    function navigateGuitarString(direction) {
      if (currentGuitarStringIdx === -1) {
        selectGuitarString(0);
        return;
      }
      if (direction > 0 && currentGuitarStringIdx === 9) {
        goToProjStep(3);
        return;
      }
      if (direction < 0 && currentGuitarStringIdx === 0) {
        closeGuitarDetails();
        return;
      }
      const newIdx = Math.max(0, Math.min(9, currentGuitarStringIdx + direction));
      selectGuitarString(newIdx);
    }

    // ── 10.2 Two Days Recap Video Modal Controller ──
    let isTwoDaysVideoExpanded = false;

    function openTwoDaysVideo() {
      const overlay = document.getElementById('two-days-cinema-overlay');
      const player = document.getElementById('two-days-video-player');
      if (!overlay) return;
      isTwoDaysVideoExpanded = true;
      overlay.style.display = 'flex';
      requestAnimationFrame(() => {
        overlay.classList.add('open');
      });
      if (player) {
        player.currentTime = 0;
        player.muted = false;
        const playPromise = player.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            console.log('Two-days video autoplay deferred:', e);
          });
        }
      }
      pluckHarpString(392.00, 0.6);
      updateUniversalHud();
    }

    function closeTwoDaysVideo(autoAdvance = false) {
      const overlay = document.getElementById('two-days-cinema-overlay');
      const player = document.getElementById('two-days-video-player');
      if (!overlay) return;
      isTwoDaysVideoExpanded = false;
      overlay.classList.remove('open');
      if (player) {
        player.pause();
      }
      setTimeout(() => {
        if (!isTwoDaysVideoExpanded) {
          overlay.style.display = 'none';
        }
      }, 400);

      if (autoAdvance) {
        stepToNextChord(2, 0); // Advance seamlessly to Chord 3
      } else {
        updateUniversalHud();
      }
    }

    // ── 10.3 Theatrical Vintage Outro Credits (Curtain Pull Down) ──
    function handleValanceCurtainClick(e) {
      const curtainsWrap = document.getElementById('collab-curtains-wrap');
      if (curtainsWrap && curtainsWrap.classList.contains('opened')) {
        if (e) e.stopPropagation();
        openTheatricalThanksOutro();
      }
    }

    function openTheatricalThanksOutro() {
      const overlay = document.getElementById('theatrical-outro-overlay');
      if (!overlay) return;
      overlay.style.display = 'flex';
      requestAnimationFrame(() => {
        overlay.classList.add('open');
        // Descend velvet curtains
        setTimeout(() => {
          overlay.classList.add('curtains-pulled');
        }, 80);
      });

      // Majestic vintage bells & fanfare
      try {
        const chord = [220.00, 277.18, 329.63, 440.00, 554.37, 659.25];
        chord.forEach((freq, i) => {
          setTimeout(() => pluckHarpString(freq, 0.75 - i * 0.04), i * 90);
        });
        if (typeof playGoldenBellChime === 'function') {
          setTimeout(() => playGoldenBellChime(554.37), 300);
          setTimeout(() => playGoldenBellChime(880.00), 550);
        }
      } catch (err) {}
    }

    function closeTheatricalThanksOutro() {
      const overlay = document.getElementById('theatrical-outro-overlay');
      if (!overlay) return;
      overlay.classList.remove('curtains-pulled');
      overlay.classList.remove('open');
      setTimeout(() => {
        if (!overlay.classList.contains('open')) {
          overlay.style.display = 'none';
        }
      }, 550);
    }

    function replayTheatricalOutro() {
      closeTheatricalThanksOutro();
      setTimeout(() => {
        openTheatricalThanksOutro();
      }, 600);
    }

    // ── 11. Chord 4 (Challenges) Sequential Presentation (Steps 0 to 4) ──
    let currentChallengeStep = 0;

    function updateChallengePresentation(playAudio = false) {
      const c1 = document.getElementById('ch-card-1');
      const c2 = document.getElementById('ch-card-2');
      const c3 = document.getElementById('ch-card-3');
      const c4 = document.getElementById('ch-card-4');
      const allCards = [c1, c2, c3, c4];
      const centerCard = document.getElementById('ch-center-card');

      const setCardState = (el, state) => {
        if (!el) return;
        el.classList.remove('state-hidden', 'state-dimmed', 'state-revealed', 'state-focus');
        if (state) el.classList.add(state);
      };

      if (currentChallengeStep === 0) {
        allCards.forEach(c => setCardState(c, 'state-hidden'));
        if (centerCard) {
          centerCard.style.transform = 'scale(1.03)';
          const imgCard = centerCard.querySelector('.centerpiece-img-card') || centerCard;
          imgCard.style.borderColor = '#ff9261';
          imgCard.style.boxShadow = '0 16px 44px rgba(0, 0, 0, 0.75), 0 0 36px rgba(240, 109, 56, 0.55)';
        }
        if (playAudio) pluckHarpString(196.00, 0.6);
      } else if (currentChallengeStep >= 1 && currentChallengeStep <= 4) {
        if (centerCard) {
          centerCard.style.transform = 'scale(1)';
          const imgCard = centerCard.querySelector('.centerpiece-img-card') || centerCard;
          imgCard.style.borderColor = 'rgba(240, 109, 56, 0.35)';
          imgCard.style.boxShadow = '0 10px 28px rgba(0, 0, 0, 0.5)';
        }
        allCards.forEach((c, idx) => {
          if (idx === currentChallengeStep - 1) {
            setCardState(c, 'state-focus');
          } else if (idx < currentChallengeStep - 1) {
            setCardState(c, 'state-revealed');
          } else {
            setCardState(c, 'state-hidden');
          }
        });
        const freqs = [261.63, 293.66, 329.63, 392.00];
        if (playAudio) pluckHarpString(freqs[currentChallengeStep - 1], 0.7);
      }

      // Update pills active state
      for (let i = 0; i <= 4; i++) {
        const pill = document.getElementById('ch-pill-' + i);
        if (pill) pill.classList.toggle('active', i === currentChallengeStep);
      }

      // Update counter badge
      const counter = document.getElementById('ppt-counter-badge-3');
      if (counter) {
        const arabicNums = ['١', '٢', '٣', '٤', '٥'];
        counter.textContent = `${arabicNums[currentChallengeStep]} / ٥`;
      }

      updateUniversalHud();
    }

    function goToChallengeStep(step, playAudio = true) {
      if (step < 0 || step > 4) return;
      currentChallengeStep = step;
      updateChallengePresentation(playAudio);
    }

    function nextChallengeStep() {
      advanceGlobalPresentation(1);
    }

    function prevChallengeStep() {
      advanceGlobalPresentation(-1);
    }

    // ── 12. Chord 4: يوم التنفيذ Controller ──
    let currentSp4Stage = 0; // 0: Tables Slide, 1: Operational Pillars
    let currentSp4Day = 1;   // 1: Church 1 (Day 1), 2: Church 2 (Day 2)
    let currentModalDay = 1;
    let currentModalSectionIdx = 0;

    const day1SectionsData = [
      {
        time: "09:00 - 09:30",
        dur: "٣٠ دقيقة",
        en: "Opening and Breakfast",
        desc: "طابور الافتتاح الكشفي الصباحي وتحية العلم مع صيحات وترانيم ترحيبية، وتوزيع وجبة إفطار صحية متكاملة لمد الأطفال بالطاقة والنشاط اللازم لليوم الحافل.",
        img: "assets/opening day 1.jpg",
        caption: "طابور الافتتاح الكشفي وتحية العلم وتناول وجبة الإفطار واستقبال أطفال كنيسة السلام"
      },
      {
        time: "10:00 - 12:00",
        dur: "ساعتان",
        en: "Games 1",
        desc: "محطات ألعاب كشفية متتابعة، منافسات تلي ماتش حركية، سباقات حواجز، ومسابقات تنافسية بين الطلائع لبث روح التحدي الإيجابي.",
        img: "assets/games day 1.jpg",
        caption: "ألعاب ومسابقات اليوم الأول الكشفية والمنافسات الحركية المبهجة"
      },
      {
        time: "12:00 - 01:30",
        dur: "ساعة ونصف",
        en: "Sessions",
        desc: "حلقات حوارية في القيم والأخلاق، التوجيه السلوكي والاحتواء، مع ورش أشغال يدوية ورسم لغرس المبادئ بأسلوب مبسط ومحبب.",
        img: "assets/ethics session day 1.jpg",
        caption: "جلسة الأخلاق والسلوك لليوم الأول وتفاعل الأطفال مع أنشطة التوجيه التربوي"
      },
      {
        time: "01:30 - 02:00",
        dur: "٣٠ دقيقة",
        title: "سناكس واستراحة خفيفة",
        en: "Snacks",
        desc: "استراحة تجديد طاقة للأطفال، توزيع وجبات خفيفة وعصائر مثلجة وفواكه طازجة لتهيئة الجميع للجولة الثانية من الأنشطة الحماسية.",
        img: "assets/snacks.jpg",
        caption: "استراحة السناكس وتوزيع المأكولات الخفيفة والعصائر وتجديد طاقة الأطفال"
      },
      {
        time: "02:00 - 04:00",
        dur: "ساعتان",
        title: "ألعاب كشفية وتحديات كبرى",
        en: "Games 2",
        desc: "ألعاب ذكاء جماعية، مناورات كشفية، سباقات سرعة ومحطات إثارة حماسية تدمج الأطفال في العمل التعاوني المشترك.",
        img: "assets/games day 1 second session.jpg",
        caption: "الجولة الثانية من الألعاب الكشفية والتحديات الحركية لليوم الأول"
      },
      {
        time: "04:00 - 05:00",
        dur: "ساعة كاملة",
        title: "وجبة الغداء والتكريم الختامي",
        en: "Lunch",
        desc: "وجبة غداء جماعية شهية، توزيع الهدايا التشجيعية على جميع الأطفال بلا استثناء، تكريم خدام الكنيسة، وتوديع حار مع صورة اليوم التذكارية.",
        img: "assets/first day raht image.jpg",
        caption: "صورة تذكارية لرهط الوتر بالكامل مع خادمي وأطفال كنيسة السلام في ختام اليوم الأول"
      }
    ];

    const day2SectionsData = [
      {
        time: "11:45 - 12:30",
        dur: "٤٥ دقيقة",
        title: "الافتتاح ووجبة الإفطار",
        en: "Breakfast & Opening",
        desc: "استقبال أطفال كنيسة البطحة بترحيب حار، صيحات كشفية افتتاحية، وتناول وجبة إفطار جماعية مشبعة لبدء اليوم بنشاط وحيوية.",
        img: "assets/opening day 2.jpg",
        caption: "الترحيب والاصطفاف الصباحي وتناول وجبة الإفطار الجماعية بكنيسة البطحة"
      },
      {
        time: "12:30 - 02:00",
        dur: "ساعة ونصف",
        title: "روحي، أشغال يدوية وسلوكيات",
        en: "Ro7y, Crafts & Ethics",
        desc: "جلسة ثلاثية الأبعاد متكاملة تجمع التأمل الروحي، ورش الأشغال اليدوية (Crafts)، وتطبيقات عملية تفاعلية على السلوكيات والأخلاق الكشفية والكنسية.",
        img: "assets/religous session day 2.jpg",
        caption: "الفقرة الروحية لليوم الثاني وورش الأشغال اليدوية وتقويم السلوك"
      },
      {
        time: "02:00 - 02:30",
        dur: "٣٠ دقيقة",
        title: "تجهيز وارتداء ملابس السباحة",
        en: "Lebs Maiohat",
        desc: "تجهيز وارتداء ملابس السباحة للأطفال والاستعداد للنزول في حمام السباحة.",
        img: "assets/swimwear-prep.jpg",
        caption: "الاستعداد للنزول في البيسين بكامل العتاد والجاهزية!"
      },
      {
        time: "02:30 - 04:00",
        dur: "ساعة ونصف",
        title: "التناوب الأول: بنات في البركة / أولاد ألعاب ومسابقات",
        en: "Girls Pool / Boys Games",
        desc: "تطبيق نظام التناوب الذكي: الفتيات في حمام السباحة وألعاب مائية بإشراف نسائي مشدد، بينما الأولاد في الملاعب الخارجية مع قادة الجوالة ومسابقات كشفية.",
        img: "assets/games boys day 2.jpg",
        caption: "فترة التناوب الأولى: ألعاب ومسابقات ملاعب اليوم الثاني للأولاد بالتوازي مع مسبح البنات"
      },
      {
        time: "04:00 - 05:30",
        dur: "ساعة ونصف",
        title: "التناوب الثاني: أولاد في البركة / بنات ألعاب ومسابقات",
        en: "Boys Pool w Girls Games",
        desc: "عكس الأدوار التام: الأولاد في حمام السباحة ومسابقات سباحة تحت رقابة القادة، بينما الفتيات في الملاعب ومحطات الأنشطة الترفيهية والتحديات الذهنية.",
        img: "assets/games girls day 2.jpg",
        caption: "فترة التناوب الثانية: ألعاب ومسابقات الملاعب للبنات بالتوازي مع مسبح الأولاد"
      },
      {
        time: "05:30 - 06:00",
        dur: "٣٠ دقيقة",
        title: "الاستحمام وتبديل الملابس",
        en: "7moom and Lebs",
        desc: "الانتهاء من نشاط البركة، أخذ شاور دافئ، تجفيف وتبديل الملابس بالكامل والاستعداد للعشاء.",
        img: "assets/showering-care.jpg",
        caption: "الشكل بعد الخروج من البيسين والشاور الساقع!"
      },
      {
        time: "06:00 - 06:30",
        dur: "٣٠ دقيقة",
        title: "وجبة العشاء وصورة اليوم التذكارية",
        en: "Dinner w Soret El Yom",
        desc: "تناول وجبة عشاء جماعية دافئة للأطفال والخدام، يليها التجمع العام لالتقاط صورة اليوم التذكارية الرسمية للرهط بالكامل والأطفال تخليداً لهذا اليوم الرائع.",
        img: "assets/second day raht image.jpeg",
        caption: "الصورة التذكارية الرسمية للرهط بالكامل مع أطفال وخادمات كنيسة البطحة في ختام اليوم الثاني"
      }
    ];

    function goToSp4Stage(stageIdx) {
      currentSp4Stage = stageIdx;
      const pill0 = document.getElementById('sp4-stage-pill-0');
      const pill1 = document.getElementById('sp4-stage-pill-1');
      if (pill0) pill0.classList.toggle('active', stageIdx === 0);
      if (pill1) pill1.classList.toggle('active', stageIdx === 1);

      const slide0 = document.getElementById('sp4-slide-0');
      const slide1 = document.getElementById('sp4-slide-1');

      if (stageIdx === 0) {
        if (slide1) {
          slide1.style.opacity = '0';
          setTimeout(() => {
            slide1.style.display = 'none';
            slide1.classList.remove('active');
            if (slide0) {
              slide0.style.display = 'block';
              slide0.offsetHeight;
              slide0.classList.add('active');
              slide0.style.opacity = '1';
            }
          }, 200);
        } else if (slide0) {
          slide0.style.display = 'block';
          slide0.classList.add('active');
          slide0.style.opacity = '1';
        }
      } else {
        if (slide0) {
          slide0.style.opacity = '0';
          setTimeout(() => {
            slide0.style.display = 'none';
            slide0.classList.remove('active');
            if (slide1) {
              slide1.style.display = 'block';
              slide1.offsetHeight;
              slide1.classList.add('active');
              slide1.style.opacity = '1';
              const execCards = document.querySelectorAll('#exec-pillars-grid .exec-card'); execCards.forEach(c => { c.style.display = 'flex'; });
            }
          }, 200);
        } else if (slide1) {
          slide1.style.display = 'block';
          slide1.classList.add('active');
          slide1.style.opacity = '1';
          const execCards = document.querySelectorAll('#exec-pillars-grid .exec-card'); execCards.forEach(c => { c.style.display = 'flex'; });
        }
      }
    }

    function switchSp4DayTable(dayNum) {
      currentSp4Day = dayNum;
      const btn1 = document.getElementById('sp4-day-btn-1');
      const btn2 = document.getElementById('sp4-day-btn-2');
      const t1 = document.getElementById('sp4-table-day-1');
      const t2 = document.getElementById('sp4-table-day-2');

      if (dayNum === 1) {
        if (btn1) btn1.classList.add('active');
        if (btn2) btn2.classList.remove('active');
        if (t2 && t2.style.display !== 'none') {
          t2.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
          t2.style.opacity = '0';
          t2.style.transform = 'translateY(10px)';
          setTimeout(() => {
            t2.style.display = 'none';
            if (t1) {
              t1.style.display = 'block';
              t1.style.opacity = '0';
              t1.style.transform = 'translateY(-10px)';
              t1.offsetHeight;
              t1.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
              t1.style.opacity = '1';
              t1.style.transform = 'translateY(0)';
            }
          }, 250);
        } else if (t1) {
          t1.style.display = 'block';
          t1.style.opacity = '1';
          t1.style.transform = 'translateY(0)';
          if (t2) t2.style.display = 'none';
        }
      } else {
        if (btn2) btn2.classList.add('active');
        if (btn1) btn1.classList.remove('active');
        if (t1 && t1.style.display !== 'none') {
          t1.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
          t1.style.opacity = '0';
          t1.style.transform = 'translateY(-10px)';
          setTimeout(() => {
            t1.style.display = 'none';
            if (t2) {
              t2.style.display = 'block';
              t2.style.opacity = '0';
              t2.style.transform = 'translateY(10px)';
              t2.offsetHeight;
              t2.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
              t2.style.opacity = '1';
              t2.style.transform = 'translateY(0)';
            }
          }, 250);
        } else if (t2) {
          t2.style.display = 'block';
          t2.style.opacity = '1';
          t2.style.transform = 'translateY(0)';
          if (t1) t1.style.display = 'none';
        }
      }
    }

    function openDaySectionModal(dayNum, sectionIdx) {
      currentSp4PptStep = (dayNum === 1 ? 1 : 9) + sectionIdx;
      highlightSp4TableRow(dayNum, sectionIdx);
      updateUniversalHud();
      currentModalDay = dayNum;
      currentModalSectionIdx = sectionIdx;
      const list = dayNum === 1 ? day1SectionsData : day2SectionsData;
      const item = list[sectionIdx];
      if (!item) return;

      const modal = document.getElementById('day-section-modal-overlay');
      const churchTag = document.getElementById('modal-church-tag');
      const timeTag = document.getElementById('modal-time-tag');
      const durTag = document.getElementById('modal-dur-tag');
      const mainTitle = document.getElementById('modal-main-title');
      const img = document.getElementById('modal-img');
      const caption = document.getElementById('modal-caption');
      const desc = document.getElementById('modal-desc');
      const prevBtn = document.getElementById('modal-prev-btn');
      const nextBtn = document.getElementById('modal-next-btn');

      if (churchTag) {
        churchTag.textContent = dayNum === 1 ? 'اليوم الأول • كنيسة السلام' : 'اليوم الثاني • كنيسة البطحة';
        churchTag.style.color = dayNum === 1 ? '#a7f3d0' : '#7dd3fc';
      }
      if (timeTag) timeTag.textContent = item.time;
      if (durTag) durTag.textContent = item.dur;
      if (mainTitle) mainTitle.textContent = item.title + (item.en ? ' (' + item.en + ')' : '');
      if (img) {
        img.src = item.img;
        img.alt = item.title;
        if (item.img && item.img.endsWith('.svg')) {
          img.style.objectFit = 'contain';
          img.style.background = '#07130e';
        } else {
          img.style.objectFit = 'cover';
          img.style.background = 'transparent';
        }
      }
      if (caption) caption.textContent = item.caption;
      if (desc) desc.textContent = item.desc;

      if (prevBtn) prevBtn.disabled = (sectionIdx === 0);
      if (nextBtn) nextBtn.disabled = (sectionIdx === list.length - 1);

      if (modal) {
        modal.classList.add('open');
      }
    }

    function closeDaySectionModal() {
      const modal = document.getElementById('day-section-modal-overlay');
      if (modal) {
        modal.classList.remove('open');
      }
    }

    function stepModalSection(delta) {
      const list = currentModalDay === 1 ? day1SectionsData : day2SectionsData;
      const newIdx = currentModalSectionIdx + delta;
      if (newIdx >= 0 && newIdx < list.length) {
        openDaySectionModal(currentModalDay, newIdx);
      }
    }

    function zoomCurrentModalImage() {
      const list = currentModalDay === 1 ? day1SectionsData : day2SectionsData;
      const item = list[currentModalSectionIdx];
      if (!item) return;
      const tag = currentModalDay === 1 ? 'اليوم الأول • كنيسة السلام' : 'اليوم الثاني • كنيسة البطحة';
      openStageZoom(item.img, tag, item.title, item.caption + ' — ' + item.desc);
    }

    function filterExecPill(category, btn) {
      const cards = document.querySelectorAll('#exec-pillars-grid .exec-card');
      cards.forEach(c => {
        c.style.display = 'flex';
      });
    }

    // ── 5. Wire Strings, Cards, Hover, Pluck & Glissando ──
    const strGroups = document.querySelectorAll('.str-group');
    const dockCards = document.querySelectorAll('.dock-card');
    let isPluckingLocked = false;
    let lastPluckTimes = {};

    function triggerStringPluck(idx, e, navigate = true) {
      const group = document.querySelector(`.str-group[data-idx="${idx}"]`);
      const card = document.querySelector(`.dock-card[data-idx="${idx}"]`);
      if (!group) return;

      const freq = parseFloat(group.dataset.freq);
      const amp = parseFloat(group.dataset.amp);
      const decay = parseFloat(group.dataset.decay);
      const pathEl = group.querySelector('.str-line');
      const glowEl = group.querySelector('.str-glow');
      const color = group.style.getPropertyValue('--str-color') || '#ffd276';

      // Sound
      pluckHarpString(freq, 0.8);

      // Sparkles
      if (e) spawnHarpSparkle(e, color);

      // Vibration
      animateVectorString(idx, pathEl, glowEl, amp, decay, freq);

      // Visual card highlight
      dockCards.forEach(c => c.classList.remove('highlight'));
      if (card) card.classList.add('highlight');
      setTimeout(() => { if (card) card.classList.remove('highlight'); }, 800);

      // Open subpage if requested and not locked
      if (navigate && !isPluckingLocked) {
        isPluckingLocked = true;
        setTimeout(() => {
          openPage(idx);
          isPluckingLocked = false;
        }, 850);
      }
    }

    // String Click & Strum Listeners
    strGroups.forEach(group => {
      const idx = parseInt(group.dataset.idx);

      // Click string
      group.addEventListener('click', (e) => {
        triggerStringPluck(idx, e, true);
      });

      // Hover / Strum / Glissando (Sweep mouse across harp)
      group.addEventListener('mouseenter', (e) => {
        const now = performance.now();
        if (!lastPluckTimes[idx] || now - lastPluckTimes[idx] > 320) {
          lastPluckTimes[idx] = now;
          // Strum sound + gentle vibration without instant navigation
          pluckHarpString(parseFloat(group.dataset.freq), 0.45);
          const pathEl = group.querySelector('.str-line');
          const glowEl = group.querySelector('.str-glow');
          animateVectorString(idx, pathEl, glowEl, 6, 4.0, parseFloat(group.dataset.freq));
          spawnHarpSparkle(e, group.style.getPropertyValue('--str-color'));
        }
        // Highlight dock card
        const card = document.querySelector(`.dock-card[data-idx="${idx}"]`);
        if (card) card.classList.add('highlight');
      });

      group.addEventListener('mouseleave', () => {
        const card = document.querySelector(`.dock-card[data-idx="${idx}"]`);
        if (card) card.classList.remove('highlight');
      });
    });

    // Dock Cards Listeners
    dockCards.forEach(card => {
      const idx = parseInt(card.dataset.idx);
      const group = document.querySelector(`.str-group[data-idx="${idx}"]`);

      card.addEventListener('mouseenter', () => {
        if (group) group.classList.add('active');
      });
      card.addEventListener('mouseleave', () => {
        if (group) group.classList.remove('active');
      });
      card.addEventListener('click', (e) => {
        triggerStringPluck(idx, e, true);
      });
    });

    // ══════════════════════════════════════════════════════════════════
    // ── SUBPAGE 2 (التحضيرات): GAME LEVELS MAP & PROCESS CONTROLLER ──
    // ══════════════════════════════════════════════════════════════════
    let currentGmLevel = 1; // 1 to 6 (visual node on map)
    let currentNodeDay = 1; // 1: Day 1, 2: Day 2 for nodes 3, 4, 5, 6
    let currentLoopRotation = 1; // Kept for backwards compatibility
    let sp2ViewMode = 'map'; // 'map' (full-screen map) or 'pane' (full-screen sub-point)
    let sp2CompletedNodes = new Set();
    let currentGmCategory = 'villas';
    let currentGmCategoryDay = 1;
    let currentGmEventsDay = 1;
    let currentGmEventTab = 'spiritual';
    let currentGmBudgetDay = 1;
    let currentGmBudgetSlice = 0;

    // Helper: Given Slide Pane ID (1..11) -> Map Node (1..6) & Day (1..2)
    function getNodeAndDayFromPane(paneIdx) {
      if (paneIdx === 1) return { node: 1, day: 1 };
      if (paneIdx === 2) return { node: 2, day: 1 };
      if (paneIdx === 3) return { node: 3, day: 1 };
      if (paneIdx === 6) return { node: 3, day: 2 };
      if (paneIdx === 4 || paneIdx === 11) return { node: 4, day: 1 };
      if (paneIdx === 7) return { node: 4, day: 2 };
      if (paneIdx === 5) return { node: 5, day: 1 };
      if (paneIdx === 8) return { node: 5, day: 2 };
      if (paneIdx === 9) return { node: 6, day: 1 };
      if (paneIdx === 10) return { node: 6, day: 2 };
      return { node: 1, day: 1 };
    }

    // Helper: Map Node (1..6) + Day (1..2) -> Actual Slide Pane ID
    function getActivePaneId(mapNode = currentGmLevel, day = currentNodeDay) {
      if (mapNode === 1) return 1;
      if (mapNode === 2) return 2;
      if (mapNode === 3) return day === 2 ? 6 : 3;
      if (mapNode === 4) return day === 2 ? 7 : 4;
      if (mapNode === 5) return day === 2 ? 8 : 5;
      if (mapNode === 6) return day === 2 ? 10 : 9;
      return 1;
    }

    function getMapNodeFromPane(paneIdx) {
      const res = getNodeAndDayFromPane(paneIdx);
      return { node: res.node, rotation: res.day };
    }

    // ── DAY 1 / DAY 2 TOGGLE CONTROLLER (NODES 3, 4, 5, 6) ──
    function updateDayToggleUI(node, day) {
      const container = document.getElementById('gm-day-toggle-container');
      if (!container) return;

      if (node >= 3 && node <= 6) {
        container.style.display = 'inline-flex';
        const btn1 = document.getElementById('gm-day-btn-1');
        const btn2 = document.getElementById('gm-day-btn-2');
        if (btn1) btn1.classList.toggle('active', day === 1);
        if (btn2) btn2.classList.toggle('active', day === 2);
      } else {
        container.style.display = 'none';
      }
    }

    function switchNodeDay(dayNum, playAudio = true) {
      if (dayNum !== 1 && dayNum !== 2) return;
      if (currentGmLevel < 3 || currentGmLevel > 6) return;

      currentNodeDay = dayNum;
      currentLoopRotation = dayNum;
      let targetPane = 1;
      if (currentGmLevel === 3) {
        targetPane = (dayNum === 1 ? 3 : 6);
      } else if (currentGmLevel === 4) {
        targetPane = (dayNum === 1 ? 4 : 7);
      } else if (currentGmLevel === 5) {
        targetPane = (dayNum === 1 ? 5 : 8);
      } else if (currentGmLevel === 6) {
        targetPane = (dayNum === 1 ? 9 : 10);
      }

      openSp2Node(targetPane, true, playAudio);
      if (playAudio && typeof pluckHarpString === 'function') {
        pluckHarpString(dayNum === 1 ? 329.63 : 440.00, 0.45);
      }
    }

    const gmLevelData = {
      1: {
        badge: 'المحطة الأولى • عام',
        title: 'الجلسات التعليمية وإعداد القادة',
        chord: [196.00, 246.94, 293.66, 392.00]
      },
      2: {
        badge: 'المحطة الثانية • عام',
        title: 'الخطوات الأولى واستكشاف الميدان',
        chord: [220.00, 261.63, 329.63, 440.00]
      },
      3: {
        badge: 'البرنامج • اليوم الأول',
        title: 'برنامج فعاليات اليوم الأول (80 فرد)',
        chord: [233.08, 277.18, 349.23, 466.16]
      },
      4: {
        badge: 'التحضيرات • اليوم الأول',
        title: 'تحضيرات اليوم الأول • كنيسة العزراء بالسلام',
        chord: [246.94, 293.66, 369.99, 493.88]
      },
      11: {
        badge: 'أماكن الخدمة • اليومين',
        title: 'اماكن الخدمة على مدار يومين',
        chord: [246.94, 293.66, 369.99, 493.88]
      },
      5: {
        badge: 'الميزانية • اليوم الأول',
        title: 'ميزانية اليوم الأول • كنيسة السلام (٣٨,٧٨٠ ج.م)',
        chord: [261.63, 329.63, 392.00, 523.25]
      },
      6: {
        badge: 'البرنامج • اليوم الثاني',
        title: 'برنامج اليوم الثاني • كنيسة البطحة والفيلا',
        chord: [293.66, 369.99, 440.00, 587.33]
      },
      7: {
        badge: 'التحضيرات • اليوم الثاني',
        title: 'تحضيرات اليوم الثاني • كنيسة البطحة والفيلا',
        chord: [329.63, 415.30, 493.88, 659.25]
      },
      8: {
        badge: 'الميزانية • اليوم الثاني',
        title: 'ميزانية اليوم الثاني • كنيسة البطحة والفيلا (٢٨,٠٠٠ ج.م)',
        chord: [349.23, 440.00, 523.25, 698.46]
      },
      9: {
        badge: 'التقييم • اليوم الأول',
        title: 'التقييم الخارجي • أصوات الشركاء والمخدومين',
        chord: [392.00, 440.00, 493.88, 523.25]
      },
      10: {
        badge: 'التقييم • اليوم الثاني',
        title: 'التقييم الداخلي • الدروس المستفادة ميدانياً',
        chord: [440.00, 493.88, 523.25, 587.33]
      }
    };

    function initSp2GameMap(startStep = 0) {
      if (startStep === 27 || startStep === 'end' || startStep === 10 || startStep === 8) {
        currentGmLevel = 6;
        currentLoopRotation = 2;
        openSp2Node(10, false, false);
        return;
      }
      currentGmLevel = 1;
      currentLoopRotation = 1;
      sp2ViewMode = 'map';
      showSp2Map(1, false);
      renderBudgetPieChart(1);
      renderBudgetPieChart(2);
    }

    function showSp2Map(highlightNode = null, playAudio = false) {
      sp2ViewMode = 'map';
      const vp = document.getElementById('gm-viewport');
      if (vp) {
        vp.classList.remove('pane-active');
        vp.classList.remove('drawer-open');
      }

      if (highlightNode !== null) {
        if (highlightNode <= 6) {
          currentGmLevel = highlightNode;
        } else {
          const info = getNodeAndDayFromPane(highlightNode);
          currentGmLevel = info.node;
          currentNodeDay = info.day;
        }
      }

      updateMapNodesVisuals();
      updateDayToggleUI(0, 1);

      const activePane = getActivePaneId(currentGmLevel, currentNodeDay);
      if (playAudio && gmLevelData[activePane]) {
        try {
          pluckHarpString(gmLevelData[activePane].chord[0] || 261.63, 0.55);
        } catch (e) {}
      }

      updateUniversalHud();
    }

    function switchLoopRotation(rotation) {
      if (rotation !== 1 && rotation !== 2) return;
      currentLoopRotation = rotation;
      updateMapNodesVisuals();
      updateUniversalHud();
    }

    function toggleLoopRotation() {
      switchLoopRotation(currentLoopRotation === 1 ? 2 : 1);
    }

    function updateMapNodesVisuals() {
      // 6 Nodes on the horizontal straight road
      for (let i = 1; i <= 6; i++) {
        const node = document.getElementById(`gm-node-${i}`);
        if (node) {
          node.classList.toggle('active', i === currentGmLevel);
          let isDone = sp2CompletedNodes.has(i);
          node.classList.toggle('completed', isDone);
        }
      }

      // Move Pin indicator to active node
      const pin = document.getElementById('gm-pin-indicator');
      const activeNode = document.getElementById(`gm-node-${currentGmLevel}`);
      if (pin && activeNode) {
        activeNode.appendChild(pin);
      }
    }

    function updateLoopHubDisplay() {
      // Retained as clean stub for backwards compatibility
    }

    function openSp2Node(paneId, resetSubStep = true, playAudio = true) {
      if (paneId < 1 || paneId > 11) return;
      sp2ViewMode = 'pane';

      const info = getNodeAndDayFromPane(paneId);
      currentGmLevel = info.node;
      currentNodeDay = info.day;
      currentLoopRotation = info.day;

      // Update the Day Toggle UI in the drawer header
      updateDayToggleUI(currentGmLevel, currentNodeDay);

      const vp = document.getElementById('gm-viewport');
      if (vp) {
        vp.classList.add('pane-active');
        vp.classList.add('drawer-open');
      }

      // Switch Panes (only target pane visible)
      for (let i = 1; i <= 11; i++) {
        const pane = document.getElementById(`gm-pane-${i}`);
        if (pane) {
          pane.classList.toggle('active', i === paneId);
        }
      }

      // Update Pane Header Title
      const title = document.getElementById('gm-header-title');
      if (title && gmLevelData[paneId]) {
        title.textContent = gmLevelData[paneId].title;
      }

      // Reset / initialize specific sub-steps if requested
      if (resetSubStep) {
        if (paneId === 1) {
          if (typeof goToSp2EduStep === 'function') goToSp2EduStep(0);
        } else if (paneId === 2) {
          if (typeof goToSp2FirstStepsPhase === 'function') goToSp2FirstStepsPhase(1, false);
        } else if (paneId === 3) {
          selectSp2Day1ProgramLevel(1, false);
        } else if (paneId === 4) {
          if (typeof goToSp2Prep1Step === 'function') goToSp2Prep1Step(0);
        } else if (paneId === 11) {
          // اماكن الخدمة على مدار يومين
        } else if (paneId === 5) {
          renderBudgetPieChart(1);
          selectBudgetSlice(0, false);
        } else if (paneId === 6) {
          selectSp2Day2ProgramLevel(1, false);
        } else if (paneId === 7) {
          if (typeof goToSp2Prep2Step === 'function') goToSp2Prep2Step(0);
        } else if (paneId === 8) {
          renderBudgetPieChart(2);
          selectBudgetSlice(0, false);
        } else if (paneId === 9) {
          replayFeedbackPaperThrow();
        }
      } else {
        if (paneId === 3) {
          selectSp2Day1ProgramLevel(currentSp2Day1ProgLvl || 1, false);
        } else if (paneId === 6) {
          selectSp2Day2ProgramLevel(currentSp2Day2ProgLvl || 1, false);
        } else if (paneId === 9) {
          replayFeedbackPaperThrow();
        }
      }

      // Update Nav Buttons
      const prevBtn = document.getElementById('gm-prev-btn');
      const nextBtn = document.getElementById('gm-next-btn');
      if (prevBtn) prevBtn.style.opacity = paneId === 1 ? '0.45' : '1';
      if (nextBtn) nextBtn.style.opacity = paneId === 10 ? '0.45' : '1';

      if (playAudio) {
        playGameLevelAudio(paneId);
      }

      updateUniversalHud();
    }

    function replayFeedbackPaperThrow(event) {
      if (event) event.stopPropagation();
      const stage = document.getElementById('feedback-paper-stage');
      if (!stage) return;
      stage.classList.remove('throw-active');
      void stage.offsetWidth; // Force CSS animation reflow
      stage.classList.add('throw-active');
      try {
        if (typeof pluckHarpString === 'function') {
          pluckHarpString(392.00, 0.35);
        }
      } catch (e) {}
    }

    function selectGameLevel(levelIdx, playAudio = true) {
      // Called when user clicks a node on the map -> opens that node full-screen at Day 1
      if (levelIdx < 1 || levelIdx > 6) return;
      currentGmLevel = levelIdx;
      currentNodeDay = 1;
      const pane = (levelIdx === 1) ? 1 :
                   (levelIdx === 2) ? 2 :
                   (levelIdx === 3) ? 3 :
                   (levelIdx === 4) ? 4 :
                   (levelIdx === 5) ? 5 : 9;
      openSp2Node(pane, true, playAudio);
    }

    function navigateGameLevel(dir) {
      let curPane = 1;
      for (let i = 1; i <= 11; i++) {
        const p = document.getElementById(`gm-pane-${i}`);
        if (p && p.classList.contains('active')) { curPane = i; break; }
      }
      const paneOrder = [1, 2, 3, 6, 4, 11, 7, 5, 8, 9, 10];
      let curIdx = paneOrder.indexOf(curPane);
      if (curIdx === -1) curIdx = 0;

      let nextIdx = curIdx + dir;
      if (nextIdx >= 0 && nextIdx < paneOrder.length) {
        const targetPane = paneOrder[nextIdx];
        openSp2Node(targetPane, true, true);
      }
    }

    function toggleGameMapDrawer() {
      // Toggle between map and current sub-point pane
      if (sp2ViewMode === 'pane') {
        showSp2Map(currentGmLevel, true);
      } else {
        const p = getActivePaneId(currentGmLevel, currentNodeDay);
        openSp2Node(p, false, true);
      }
    }

    // Expose core map & day toggle controllers to window
    window.openSp2Node = openSp2Node;
    window.switchNodeDay = switchNodeDay;
    window.selectGameLevel = selectGameLevel;
    window.showSp2Map = showSp2Map;
    window.toggleGameMapDrawer = toggleGameMapDrawer;
    window.goToSp2Prep1Step = goToSp2Prep1Step;
    window.handlePrep1CardTap = handlePrep1CardTap;
    window.goToSp2Prep2Step = goToSp2Prep2Step;
    window.handlePrep2CardTap = handlePrep2CardTap;

    function updateDrawerToggleBtn(isOpen) {
      // Backward compatibility stub
    }

    function playMilestoneCompletionSound() {
      try {
        playGoldenBellChime(587.33);
        setTimeout(() => playGoldenBellChime(880.00), 120);
      } catch (e) {}
    }

    function playGameLevelAudio(lvl) {
      try {
        const data = gmLevelData[lvl];
        if (!data || !data.chord) return;
        data.chord.forEach((freq, idx) => {
          setTimeout(() => pluckHarpString(freq, 0.65 - idx * 0.08), idx * 75);
        });
        if (lvl === 4) {
          setTimeout(() => playGoldenBellChime(587.33), 260);
        }
      } catch (e) { }
    }

    // ── LEVEL 2 (جمع البيانات) LOGIC ──
    const gmDataDetails = {
      villas: {
        1: {
          title: 'ما استقررنا عليه واعتمدناه (اليوم الأول):',
          bullets: [
            '<strong>المكان المعتمد:</strong> فيلا خاصة ذات حديقة شاسعة ومسطحات نجيل مستوية ومطبخ خدمي مجهز بالكامل.',
            '<strong>الموقع والميزانية:</strong> موقع هادئ سهل الوصول للباص، مع التفاوض على أفضل سعر يومي ناسب الميزانية (شامل مرافق الكهرباء والمياه).',
            '<strong>تأمين المكان:</strong> تم إحاطة حمام السباحة بحواجز حماية ونشر فريق إنقاذ مخصص من خادمي الرهط على مدار اليوم.',
            '<strong>أماكن الاستراحة:</strong> توفير قاعة داخلية مكيفة للفقرات الروحية والأخلاقية وأوقات تناول الوجبات.'
          ]
        },
        2: {
          title: 'ما استقررنا عليه واعتمدناه (اليوم الثاني):',
          bullets: [
            '<strong>المكان المعتمد:</strong> مقر وملاعب كنيسة البطحة الذي وفر قاعات أنشطة واسعة وملاعب آمنة قريبة من سكن الأطفال.',
            '<strong>الموقع وسهولة الوصول:</strong> موقع مركزي خفض تكلفة النقل والانتقالات وأتاح سهولة توافد الأطفال والخدام دون عناء.',
            '<strong>المرافق والخدمات:</strong> مسرح مجهز بالصوتيات للمحاضرات الروحية والأخلاقية، ومساحات حوش مفتوحة لألعاب التيليب ماتش والمسابقات.',
            '<strong>التأمين الكامل:</strong> أسوار مغلقة ومداخل محكمة تضمن رقابة مستمرة وسلامة كاملة لجميع الأطفال طوال اليوم.'
          ]
        }
      },
      food: {
        1: {
          title: 'ما استقررنا عليه واعتمدناه (اليوم الأول):',
          bullets: [
            '<strong>وجبة الإفطار:</strong> بوكسات إفطار مشبعة تتضمن سندوتشات متنوعة طازجة مع مخبوزات وعصير طبيعي ومياه مثلجة.',
            '<strong>وجبة الغداء:</strong> وجبات ساخنة لذيذة من مطعم قريب ومعتمد (قطع دجاج مقرمش / فراخ مشوية مع أرز وبطاطس وسلطات).',
            '<strong>السناكس والمشروبات:</strong> توزيع آيس كريم وعصائر مثلجة وحلويات وفواكه على مدار فترات الراحة بين الألعاب الحركية.',
            '<strong>التنظيم والتوزيع:</strong> تقسم الرهط إلى لجان استلام وتوزيع سريعة منعت أي انتظار أو فوضى أثناء تقديم الطعام.'
          ]
        },
        2: {
          title: 'ما استقررنا عليه واعتمدناه (اليوم الثاني - يوم صيام):',
          bullets: [
            '<strong>وجبة الإفطار الصيامية:</strong> سندوتشات فول وفلافل وبطاطس ساخنة مع مخبوزات صيام طازجة وعصائر باردة.',
            '<strong>وجبة الغداء الصيامية:</strong> وجبات كشري مصري فاخرة ولذيذة محبوبة جداً للأطفال مع مقرمشات وحلويات صيامية خاصة.',
            '<strong>تغذية طاقة عالية:</strong> توفير فواكه طازجة (موز وتفاح) وعصائر وفشار لتعويض الطاقة المبذولة في الألعاب الرياضية.',
            '<strong>مراعاة النظافة:</strong> تعقيم مستمر وتوزيع معلبات مغلقة لضمان سلامة وصحة الأطفال طوال اليوم.'
          ]
        }
      },
      games: {
        1: {
          title: 'ما استقررنا عليه واعتمدناه (اليوم الأول):',
          bullets: [
            '<strong>الزحليقة الهوائية العملاقة:</strong> حجز زحليقة مائية وهوائية ضخمة أضافت بهجة استثنائية وطاقة حماسية غامرة.',
            '<strong>الترامبولين المؤمن:</strong> ترامبولين كبير بشبكة حماية مزدوجة سمح بدخول الأطفال بأعداد مقننة ومحكومة.',
            '<strong>ألعاب الصابون والكرات:</strong> إضافة ملعب صابوني خفيف ومسابقات الكرات الملونة التي أضفت تفاعلاً جماعياً رائعاً.',
            '<strong>نظام الأدوار:</strong> تطبيق نظام كروت الأدوار الملونة لضمان استمتاع كل طفل باللعبة دون أي انتظار أو زحام.'
          ]
        },
        2: {
          title: 'ما استقررنا عليه واعتمدناه (اليوم الثاني):',
          bullets: [
            '<strong>ألعاب المهارات والتيليب ماتش:</strong> مسابقات محطات كشفية وتنافسية (حبال، أقماع، أطواق، ألغاز حركية) جهزها الرهط بالكامل.',
            '<strong>الترامبولين الهوائي:</strong> إعادة توفير الترامبولين بالشبكة الآمنة لتكرار فرحة القفز الحركي المحبوبة للأطفال.',
            '<strong>ألعاب مائية خفيفة:</strong> مسابقات بالونات المياه وألعاب الرشاشات المائية المنعشة في فناء الملعب.',
            '<strong>حفل التتويج والجوائز:</strong> تكريم كل الفرق بميداليات وجوائز رمزية أسعدت قلوبهم ورسخت روح الفريق.'
          ]
        }
      }
    };

    function switchDataCategory(category) {
      currentGmCategory = category;
      const categories = ['villas', 'food', 'games'];
      categories.forEach(cat => {
        const btn = document.getElementById(`gm-cat-btn-${cat}`);
        const box = document.getElementById(`gm-cat-box-${cat}`);
        if (btn) btn.classList.toggle('active', cat === category);
        if (box) box.style.display = (cat === category) ? 'flex' : 'none';
      });
      updateDataCategoryContent();
      pluckHarpString(261.63, 0.4);
      const catIdx = categories.indexOf(category);
      currentSp2PptStep = 1;
      updateUniversalHud();
    }

    function switchDataDay(dayNum) {
      currentGmCategoryDay = dayNum;
      const btn1 = document.getElementById('gm-data-day-1-btn');
      const btn2 = document.getElementById('gm-data-day-2-btn');
      if (btn1) btn1.classList.toggle('active', dayNum === 1);
      if (btn2) btn2.classList.toggle('active', dayNum === 2);
      updateDataCategoryContent();
      pluckHarpString(293.66, 0.4);
      const catIdx = ['villas', 'food', 'games'].indexOf(currentGmCategory);
      currentSp2PptStep = 1;
      updateUniversalHud();
    }

    function updateDataCategoryContent() {
      const cat = currentGmCategory;
      const day = currentGmCategoryDay;
      const data = gmDataDetails[cat] && gmDataDetails[cat][day];
      if (!data) return;

      const titleEl = document.getElementById(`gm-${cat === 'villas' ? 'villa' : cat}-chosen-title`);
      const contentEl = document.getElementById(`gm-${cat === 'villas' ? 'villa' : cat}-chosen-content`);
      if (titleEl) titleEl.textContent = data.title;
      if (contentEl) {
        contentEl.innerHTML = `
          <ul class="gm-item-list">
            ${data.bullets.map(b => `<li><span class="gm-item-bullet">✓</span><span>${b}</span></li>`).join('')}
          </ul>
        `;
      }
    }

    // ── LEVEL 3 (الفقرات) LOGIC ──
    const gmEventData = {
      spiritual: {
        title: 'فقرة المحاضرة الروحية',
        tag: 'تغذية الروح والرجاء',
        iconSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>',
        time1: '١٠:٣٠ صباحاً • اليوم الأول',
        time2: '١٠:٠٠ صباحاً • اليوم الثاني',
        desc1: 'وصلنا للأولاد إنهم غاليين ومحبوبين في عيني ربنا بقصة حلوة ومسرح عرايس مبسط شد كل الأعمار.',
        desc2: 'قعدة روحية عن المحبة والعطاء وترانيم كشفية مبهجة بالدفوف والتسقيف مع الأولاد في الكنيسة.',
        keyPoints: [
          'وصلنا الرسالة بتمثيل ومسرح عرايس يشد الأطفال بدل الوعظ المباشر.'
        ],
        media1: {
          src: 'assets/religous session day 1.jpg',
          alt: 'المحاضرة الروحية • اليوم الأول',
          tag: 'الفقرة الروحية • اليوم الأول',
          title: 'اللقاء الروحي وترانيم الفرح مع أطفال كنيسة السلام'
        },
        media2: {
          src: 'assets/first meeting.jpg',
          alt: 'المحاضرة الروحية • اليوم الثاني',
          tag: 'الفقرة الروحية • اليوم الثاني',
          title: 'اللقاء الروحي والتأمل مع أطفال كنيسة البطحة'
        }
      },
      ethics: {
        title: 'فقرة المحاضرة الأخلاقية',
        tag: 'بناء الشخصية والقيم السلوكية',
        iconSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.5a1 1 0 0 1-2 0v-5a1 1 0 0 1 2 0zm-1-7.5a1.25 1.25 0 1 1 1.25-1.25A1.25 1.25 0 0 1 12 9z"></path></svg>',
        time1: '١١:٣٠ صباحاً • اليوم الأول',
        time2: '١١:١٥ صباحاً • اليوم الثاني',
        desc1: 'مثلنا مواقف حقيقية مع الأولاد عشان يتعلموا الأمانة والاحترام ومساعدة أصحابهم بطريقة مرحة.',
        desc2: 'ورشة عملية إزاي نتحكم في مشاعرنا وغضبنا ونتصرف صح في المواقف الصعبة.',
        keyPoints: [
          'علمناهم السلوك الإيجابي بالتمثيل واللعب العملي الممتع من غير لوم أو إحراج.'
        ],
        media1: {
          src: 'assets/ethics session day 1.jpg',
          alt: 'جلسة الأخلاق والسلوك • اليوم الأول',
          tag: 'المحاضرة الأخلاقية • اليوم الأول',
          title: 'ورشة الأخلاق وبناء السلوك الإيجابي للأطفال'
        },
        media2: {
          src: 'assets/session john and mira.jpg',
          alt: 'جلسة الأخلاق والسلوك • اليوم الثاني',
          tag: 'المحاضرة الأخلاقية • اليوم الثاني',
          title: 'ورشة العمل الأخلاقية وإدارة المشاعر للأطفال'
        }
      },
      games: {
        title: 'فقرة الألعاب الكبرى والمسابقات الحركية',
        tag: 'إطلاق طاقة الفرح والمرح',
        iconSvg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 22 22 22 12 2"></polygon><line x1="12" y1="2" x2="12" y2="22"></line></svg>',
        time1: '١٢:٣٠ ظهراً - ٠٤:٣٠ عصراً • اليوم الأول',
        time2: '١٢:٠٠ ظهراً - ٠٤:٠٠ عصراً • اليوم الثاني',
        desc1: 'يوم مليان ضحك وحماس بالزحليقة المائية وتحديات التيليب ماتش والبالونات والمياه.',
        desc2: 'مسابقات كشفية وسباقات جري وشد حبل اختتمت بتوزيع الميداليات التذكارية لكل الأولاد.',
        keyPoints: [
          'أمّنا كل لعبة بحرص كشفي صارم والكل طلع كسبان ومبسوط بميداليته.'
        ],
        media1: {
          src: 'assets/games day 1.jpg',
          alt: 'ألعاب ومسابقات اليوم الأول',
          tag: 'الألعاب الكبرى • اليوم الأول',
          title: 'الألعاب الكبرى والزحليقة المائية والمسابقات الحركية'
        },
        media2: {
          src: 'assets/games day 2.jpg',
          alt: 'ألعاب ومسابقات اليوم الثاني',
          tag: 'الألعاب الكبرى • اليوم الثاني',
          title: 'مهرجان الألعاب الكشفية وتحديات التيليب ماتش'
        }
      }
    };

    function switchEventsDay(dayNum) {
      currentGmEventsDay = dayNum;
      const btn1 = document.getElementById('gm-events-day-1-btn');
      const btn2 = document.getElementById('gm-events-day-2-btn');
      if (btn1) btn1.classList.toggle('active', dayNum === 1);
      if (btn2) btn2.classList.toggle('active', dayNum === 2);
      renderEventDetailContent();
      pluckHarpString(349.23, 0.4);
      const tabIdx = ['spiritual', 'ethics', 'games'].indexOf(currentGmEventTab);
      currentSp2PptStep = 2 + Math.max(0, tabIdx);
      updateUniversalHud();
    }

    function selectEventTab(eventType) {
      currentGmEventTab = eventType;
      const tabs = ['spiritual', 'ethics', 'games'];
      tabs.forEach(tab => {
        const card = document.getElementById(`gm-event-card-${tab}`);
        if (card) card.classList.toggle('active', tab === eventType);
      });
      renderEventDetailContent();
      pluckHarpString(392.00, 0.45);
      const tabIdx = tabs.indexOf(eventType);
      currentSp2PptStep = 2 + Math.max(0, tabIdx);
      updateUniversalHud();
    }

    function renderEventDetailContent() {
      const tab = currentGmEventTab;
      const day = currentGmEventsDay;
      const data = gmEventData[tab];
      if (!data) return;

      const container = document.getElementById('gm-event-detail-box');
      if (!container) return;

      const timeText = day === 1 ? data.time1 : data.time2;
      const descText = day === 1 ? data.desc1 : data.desc2;
      const media = (day === 1 ? data.media1 : data.media2) || data.media;

      container.innerHTML = `
        <div class="gm-event-media-row">
          <div class="gm-event-photo-thumb" onclick="openCinematicZoom('${media.src}', '${media.title}', '${media.tag}', '${descText}')">
            <img src="${media.src}" alt="${media.alt}" />
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span class="gm-slice-detail-badge">${data.tag}</span>
              <span style="font-size: 11.5px; color: #ffd166; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>${timeText}</span>
            </div>
            <h4 style="font-size: 1.25rem; font-weight: 800; color: #fff; margin: 0;">${data.title}</h4>
            <p style="font-size: 0.92rem; color: rgba(255,255,255,0.85); line-height: 1.65; margin: 0;">${descText}</p>
          </div>
        </div>
        <div style="background: rgba(255,255,255,0.025); border-radius: 12px; padding: 12px 16px; border: 1px solid rgba(255,255,255,0.06);">
          <span style="font-size: 12px; font-weight: 700; color: #90e0ef; display: block; margin-bottom: 6px;">أهم نقطة في الفقرة:</span>
          <ul class="gm-item-list">
            ${data.keyPoints.map(p => `<li><span class="gm-item-bullet">★</span><span>${p}</span></li>`).join('')}
          </ul>
        </div>
      `;
    }

    // ── LEVEL 4 (الميزانية - INTERACTIVE PIE CHART) LOGIC ──
    const gmBudgetData = {
      1: {
        totalNum: '٣٨,٧٨٠',
        totalNumRaw: 38780,
        totalLabel: 'إجمالي الميزانية (ج.م)',
        totalSpent: '٣٢,٦١٥',
        totalSpentRaw: 32615,
        remainingBudget: '٦,١٦٥',
        remainingBudgetRaw: 6165,
        items: [
          {
            name: 'الوجبات والتغذية (food)',
            amount: '١٢,٥٠٠ ج.م',
            percent: '٣٢.٢٪',
            spentPercent: '٣٨.٣٪ من المنصرف',
            val: 32.233,
            color: '#00b4d8',
            desc: 'توفير وجبات فطار طازجة، ووجبات غداء متكاملة، ومشروبات وسناكس وعصائر طوال فعاليات اليوم الأول بكنيسة السلام.'
          },
          {
            name: 'المكان والمقر (location)',
            amount: '٨,١٠٠ ج.م',
            percent: '٢٠.٩٪',
            spentPercent: '٢٤.٨٪ من المنصرف',
            val: 20.887,
            color: '#3a86ff',
            desc: 'حجز وتجهيز مقر الاستضافة والملاعب والقاعات وتأمين الموقع لراحة وسلامة أطفال كنيسة العزراء بالسلام.'
          },
          {
            name: 'الترامبولين والألعاب (Trampoline)',
            amount: '٦,٥٠٠ ج.م',
            percent: '١٦.٨٪',
            spentPercent: '١٩.٩٪ من المنصرف',
            val: 16.761,
            color: '#ffd166',
            desc: 'استئجار وتجهيز الترامبولين الهوائي الضخم وألعاب التيليب ماتش الحماسية وتأمين الفنيين ومسابقات الحركة.'
          },
          {
            name: 'الأدوات والخامات (materials)',
            amount: '٢,٨١٥ ج.م',
            percent: '٧.٣٪',
            spentPercent: '٨.٦٪ من المنصرف',
            val: 7.259,
            color: '#b5179e',
            desc: 'مستلزمات التنظيم وتجهيزات الإسعافات الأولية والبطاريات وحبال ومعدات الفعاليات الميدانية والأنشطة.'
          },
          {
            name: 'الهدايا التذكارية (Souvenir)',
            amount: '١,٦٠٠ ج.م',
            percent: '٤.١٪',
            spentPercent: '٤.٩٪ من المنصرف',
            val: 4.126,
            color: '#f72585',
            desc: 'هدايا تذكارية عينية وشارات كشفية خاصة تم توزيعها على جميع أطفال كنيسة السلام لتبقى ذكرى مفرحة تدوم.'
          },
          {
            name: 'الأشغال اليدوية (Crafts)',
            amount: '١,١٠٠ ج.م',
            percent: '٢.٨٪',
            spentPercent: '٣.٤٪ من المنصرف',
            val: 2.836,
            color: '#f77f00',
            desc: 'خامات وورق مقوى وألوان وأدوات كرافت لورشة الأشغال اليدوية وتنمية الإبداع والمهارات الفنية للأطفال.'
          },
          {
            name: 'المتبقي من الميزانية (فائض)',
            amount: '٦,١٦٥ ج.م',
            percent: '١٥.٩٪',
            spentPercent: 'فائض غير منصرف',
            val: 15.897,
            color: '#06d6a0',
            desc: 'فائض مالي متبقي ومحفوظ من إجمالي الميزانية المعتمدة (٣٨,٧٨٠ ج.م) بعد سداد كافة الالتزامات بنجاح وكفاءة.'
          }
        ]
      },
      2: {
        totalNum: '٢٨,٠٠٠',
        totalNumRaw: 28000,
        totalLabel: 'إجمالي الميزانية (ج.م)',
        totalSpent: '٢٤,٨٧٥',
        totalSpentRaw: 24875,
        remainingBudget: '٣,١٢٥',
        remainingBudgetRaw: 3125,
        items: [
          {
            name: 'المكان والمقر (location)',
            amount: '١٢,٨٦٠ ج.م',
            percent: '٤٥.٩٪',
            spentPercent: '٥١.٧٪ من المنصرف',
            val: 45.929,
            color: '#3a86ff'
          },
          {
            name: 'الترامبولين والألعاب (Trampoline)',
            amount: '٤,٩٠٠ ج.م',
            percent: '١٧.٥٪',
            spentPercent: '١٩.٧٪ من المنصرف',
            val: 17.5,
            color: '#ffd166'
          },
          {
            name: 'الوجبات والتغذية (food)',
            amount: '٤,١١٥ ج.م',
            percent: '١٤.٧٪',
            spentPercent: '١٦.٥٪ من المنصرف',
            val: 14.696,
            color: '#00b4d8'
          },
          {
            name: 'الأشغال اليدوية (Crafts)',
            amount: '١,٥٠٠ ج.م',
            percent: '٥.٤٪',
            spentPercent: '٦.٠٪ من المنصرف',
            val: 5.357,
            color: '#f77f00'
          },
          {
            name: 'الهدايا التذكارية (Souvenir)',
            amount: '١,٥٠٠ ج.م',
            percent: '٥.٤٪',
            spentPercent: '٦.٠٪ من المنصرف',
            val: 5.357,
            color: '#f72585'
          },
          {
            name: 'المتبقي من الميزانية (فائض)',
            amount: '٣,١٢٥ ج.م',
            percent: '١١.٢٪',
            spentPercent: 'فائض غير منصرف',
            val: 11.161,
            color: '#06d6a0'
          }
        ]
      }
    };

    function switchBudgetDay(dayNum) {
      currentGmBudgetDay = dayNum;
      selectGameLevel(dayNum === 1 ? 5 : 8, true, true);
    }

    function renderBudgetPieChart(dayNum) {
      const data = gmBudgetData[dayNum];
      if (!data) return;

      const svgId = dayNum === 2 ? 'gm-budget-pie-svg-2' : 'gm-budget-pie-svg-1';
      const legendId = dayNum === 2 ? 'gm-budget-legend-grid-2' : 'gm-budget-legend-grid-1';

      const svg = document.getElementById(svgId) || document.getElementById('gm-budget-pie-svg');
      if (!svg) return;

      const items = data.items;
      const cx = 150;
      const cy = 150;
      const r = 115;
      const innerR = 58;

      let currentAngle = -90; // Start at top
      let pathsHtml = '';

      items.forEach((item, idx) => {
        const sliceAngle = (item.val / 100) * 360;
        const startRad = (currentAngle * Math.PI) / 180;
        const endRad = ((currentAngle + sliceAngle) * Math.PI) / 180;

        const x1 = cx + r * Math.cos(startRad);
        const y1 = cy + r * Math.sin(startRad);
        const x2 = cx + r * Math.cos(endRad);
        const y2 = cy + r * Math.sin(endRad);

        const x1Inner = cx + innerR * Math.cos(startRad);
        const y1Inner = cy + innerR * Math.sin(startRad);
        const x2Inner = cx + innerR * Math.cos(endRad);
        const y2Inner = cy + innerR * Math.sin(endRad);

        const largeArc = sliceAngle > 180 ? 1 : 0;

        const pathData = [
          `M ${x1Inner} ${y1Inner}`,
          `L ${x1} ${y1}`,
          `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
          `L ${x2Inner} ${y2Inner}`,
          `A ${innerR} ${innerR} 0 ${largeArc} 0 ${x1Inner} ${y1Inner}`,
          'Z'
        ].join(' ');

        pathsHtml += `
          <path class="gm-pie-slice ${idx === 0 ? 'active' : ''}" id="gm-pie-slice-${dayNum}-${idx}"
            d="${pathData}"
            fill="${item.color}"
            stroke="#0a120e"
            stroke-width="2.5"
            onclick="selectBudgetSlice(${idx}, true)">
          </path>
        `;
        currentAngle += sliceAngle;
      });

      svg.innerHTML = pathsHtml;

      const holeNum = document.querySelector(dayNum === 2 ? '#gm-pane-8 .gm-hole-total-num' : '#gm-pane-5 .gm-hole-total-num');
      const holeLabel = document.querySelector(dayNum === 2 ? '#gm-pane-8 .gm-hole-total-label' : '#gm-pane-5 .gm-hole-total-label');
      if (holeNum && data.totalNum) holeNum.textContent = data.totalNum;
      if (holeLabel && data.totalLabel) holeLabel.textContent = data.totalLabel;

      const legend = document.getElementById(legendId) || document.getElementById('gm-budget-legend-grid');
      if (legend) {
        legend.innerHTML = items.map((item, idx) => `
          <div class="gm-legend-chip ${idx === 0 ? 'active' : ''}" id="gm-legend-chip-${dayNum}-${idx}"
            onclick="selectBudgetSlice(${idx}, true)">
            <div class="gm-legend-name-group">
              <span class="gm-legend-color-dot" style="background: ${item.color};"></span>
              <span class="gm-legend-name">${item.name}</span>
            </div>
            <div style="text-align: left; display: flex; flex-direction: column; align-items: flex-end;">
              <span class="gm-legend-percent" style="font-weight: 800; color: #fff;">${item.percent}</span>
              <span style="font-size: 10.5px; color: ${item.color}; font-weight: 700;">${item.amount}</span>
            </div>
          </div>
        `).join('');
      }
    }

    function selectBudgetSlice(idx, playSound = true) {
      currentGmBudgetSlice = idx;
      const activePane = (typeof getActivePaneId === 'function') ? getActivePaneId(currentGmLevel, currentLoopRotation) : currentGmLevel;
      const day = (activePane === 8 || currentLoopRotation === 2) ? 2 : 1;
      currentGmBudgetDay = day;
      const data = gmBudgetData[day];
      if (!data || !data.items[idx]) return;

      const item = data.items[idx];

      // Update Pie Slices active class
      data.items.forEach((_, i) => {
        const sliceEl = document.getElementById(`gm-pie-slice-${day}-${i}`) || document.getElementById(`gm-pie-slice-${i}`);
        const chipEl = document.getElementById(`gm-legend-chip-${day}-${i}`) || document.getElementById(`gm-legend-chip-${i}`);
        if (sliceEl) sliceEl.classList.toggle('active', i === idx);
        if (chipEl) chipEl.classList.toggle('active', i === idx);
      });

      // Update Slice Detail Box for the active day
      const suffix = day === 2 ? '-2' : '-1';
      const badge = document.getElementById(`gm-slice-badge${suffix}`) || document.getElementById('gm-slice-badge');
      const title = document.getElementById(`gm-slice-title${suffix}`) || document.getElementById('gm-slice-title');
      const amount = document.getElementById(`gm-slice-amount${suffix}`) || document.getElementById('gm-slice-amount');
      const percent = document.getElementById(`gm-slice-percent${suffix}`) || document.getElementById('gm-slice-percent');
      const spentPercent = document.getElementById(`gm-slice-spent-percent${suffix}`);
      const desc = document.getElementById(`gm-slice-desc${suffix}`) || document.getElementById('gm-slice-desc');

      if (badge) {
        badge.textContent = `البند رقم ${idx + 1} من ${data.items.length}`;
        badge.style.background = `${item.color}28`;
        badge.style.color = item.color;
      }
      if (title) title.textContent = item.name;
      if (amount) {
        amount.textContent = item.amount;
        amount.style.color = item.color;
      }
      if (percent) percent.textContent = item.percent;
      if (spentPercent && item.spentPercent) {
        spentPercent.textContent = item.spentPercent;
        spentPercent.style.color = (idx === data.items.length - 1) ? '#72efb6' : '#ffd166';
      }
      const spentLabel = document.querySelector(`#gm-slice-spent-box${suffix} .gm-stat-label`);
      if (spentLabel) {
        spentLabel.textContent = (idx === data.items.length - 1) ? 'حالة البند / الفائض' : 'النسبة من المنصرف';
      }
      if (desc) desc.textContent = item.desc;

      if (playSound) {
        pluckHarpString(329.63 + idx * 40, 0.4);
      }
    }

    
    // ══════════════════════════════════════════════════════════════
    // ── 13. Chord 3 (التحضيرات والتنفيذ) 28-Step Presentation Controller ──
    // ══════════════════════════════════════════════════════════════
    const sp2ProgramData = {
      1: {
        1: {
          badge: "",
          title: "الافتتاح و الفطار",
          time: "٠٩:٠٠ ص – ١٠:٠٠ ص",
          desc: "طابور الافتتاح الكشفي الصباحي وتحية العلم مع صيحات وترانيم كشفية حماسية، وتوزيع وجبة إفطار خفيفة متكاملة ومشروبات دافئة لبدء اليوم بنشاط وألفة.",
          img: "assets/opening day 1.jpg",
          caption: "طابور الافتتاح الكشفي وتحية العلم واستقبال أطفال كنيسة السلام"
        },
        2: {
          badge: "",
          title: "Games 1",
          time: "١٠:٠٠ ص – ١٢:٠٠ م",
          desc: "انطلاق الجولة الأولى من الألعاب الميدانية والمسابقات الحركية؛ دوري كرة القدم، مسار الموانع، وتحديات التتابع بين الفرق لإشعال روح المنافسة الشريفة.",
          img: "assets/games day 1.jpg",
          caption: "بطولات الملاعب والمسابقات الحركية والتنافس بين فرق الأولاد والبنات"
        },
        3: {
          badge: "",
          title: "ال",
          time: "١٢:٠٠ م – ٠١:٣٠ م",
          desc: "ورش عمل حرفية وفنية لغرس قيم العمل اليدوي، مع جلسات تفاعلية عن روح الفريق والتعاون الكشفي وصناعة تذكارات بأيديهم.",
          img: "assets/ethics session day 1.jpg",
          caption: "ورش العمل الحرفية وتطبيقات السلوك الإيجابي والتعاون بين الأطفال"
        },
        4: {
          badge: "",
          title: "",
          time: "٠١:٣٠ م – ٠٣:٣٠ م",
          desc: "الجولة الثانية من الألعاب الكبرى؛ ألعاب التيليب ماتش بالبالونات والمياه، سباقات الحبال والموانع الهوائية التي أشعلت حماس الأطفال.",
          img: "assets/games day 1.jpg",
          caption: "مهرجان الألعاب الحركية ومسابقات التيليب ماتش الحماسية بالملاعب"
        },
        5: {
          badge: "",
          title: "",
          time: "٠٣:٣٠ م – ٠٤:٣٠ م",
          desc: "التجمع الختامي لليوم الأول؛ تناول وجبة غداء كشفية ساخنة وشهية معاً، وتكريم الأطفال وتوزيع الهدايا والتقاط الصورة التذكارية الملحمية لرهط الوتر.",
          img: "assets/first day raht image.jpg",
          caption: "صورة اليوم التذكارية ومشاركة مائدة الغداء الكشفية وتكريم الجميع"
        }
      },
      2: {
        1: {
          badge: "المرحلة ١ من ٦ • اليوم الثاني",
          title: "الافطار و الافتتاح",
          time: "١٢:٠٠ م – ٠١:٠٠ م",
          desc: "استقبال حافل للأطفال بأناشيد الكشافة وصيحات رهط الوتر لكسر الجليد، ثم توزيع وجبة إفطار خفيفة ومشروبات دافئة لبدء يوم الفيلا والمسبح بحماس.",
          img: "assets/opening day 2.jpg",
          caption: "الافتتاح الكشفي الصباحي واستقبال الأطفال وتناول وجبة الإفطار الجماعية بكنيسة البطحة"
        },
        2: {
          badge: "المرحلة ٢ من ٦ • اليوم الثاني",
          title: "الفقرة الروحية وورش العمل و الاشغال اليدوية",
          time: "٠١:٠٠ م – ٠٢:٠٠ م",
          desc: "قصة روحية مشوقة عن الرجاء والمحبة، تلتها ورش عمل حرفية وأشغال يدوية صنع فيها الأطفال تذكارات بأيديهم، مع غرس القيم السلوكية والأخلاقية.",
          img: "assets/religous session day 2.jpg",
          caption: "الفقرة الروحية وورش العمل والأشغال اليدوية وتنمية المهارات"
        },
        3: {
          badge: "المرحلة ٣ من ٦ • اليوم الثاني",
          title: "مسبح بنات / ألعاب أولاد",
          time: "٠٢:٠٠ م – ٠٣:٣٠ م",
          desc: "نظام التناوب الأول؛ استمتاع كامل للبنات بحمام السباحة والزحاليق المائية في خصوصية وأمان تام تحت إشراف المنقذات والخادمات، وتنافس حماسي للأولاد في الملاعب.",
          img: "assets/games boys day 2.jpg",
          caption: "فترة التناوب الأولى: ألعاب ومسابقات ملاعب اليوم الثاني للأولاد بالتوازي مع مسبح البنات"
        },
        4: {
          badge: "المرحلة ٤ من ٦ • اليوم الثاني",
          title: "مسبح أولاد / ألعاب بنات",
          time: "٠٣:٣٠ م – ٠٥:٠٠ م",
          desc: "عكس التناوب؛ انطلاق الأولاد للمسبح والألعاب المائية والكرات المنفوخة، بينما تخوض البنات مسابقات تفاعلية مبهجة في الملاعب الخضراء المجهزة.",
          img: "assets/games girls day 2.jpg",
          caption: "فترة التناوب الثانية: ألعاب ومسابقات الملاعب للبنات بالتوازي مع مسبح الأولاد"
        },
        5: {
          badge: "المرحلة ٥ من ٦ • اليوم الثاني",
          title: "استحمام ولبس",
          time: "٠٥:٠٠ م – ٠٥:٣٠ م",
          desc: "الانتهاء من نشاط البركة، أخذ شاور دافئ، تجفيف وتبديل الملابس والاستعداد لمائدة الغداء.",
          img: "assets/showering-care.jpg",
          caption: "الانتهاء من نشاط حمام السباحة وأخذ الشاور وتجفيف الملابس"
        },
        6: {
          badge: "المرحلة ٦ من ٦ • اليوم الثاني",
          title: "غداء وصورة اليوم",
          time: "٠٥:٣٠ م – ٠٦:٠٠ م",
          desc: "التجمع الكشفي الأخير حول مائدة غداء شهية كعائلة واحدة، ثم التقاط الصورة التذكارية الملحمية لرهط الوتر مع الأطفال والخدام، وتوزيع هدايا اليوم وتكريم الجميع.",
          img: "assets/second day raht image.jpeg",
          caption: "صورة اليوم التذكارية ومشاركة مائدة الغداء الكشفية وتكريم الجميع"
        }
      }
    };

    let currentSp2Day1ProgLvl = 1;
    let currentSp2Day2ProgLvl = 1;

    function selectSp2Day1ProgramLevel(lvl, playSound = true) {
      if (lvl < 1 || lvl > 5) return;
      currentSp2Day1ProgLvl = lvl;

      // Update Node active states
      for (let i = 1; i <= 5; i++) {
        const node = document.getElementById(`sp2-p1-node-${i}`);
        const orb = document.getElementById(`sp2-p1-orb-${i}`);
        if (node) {
          node.classList.toggle('active', i === lvl);
          if (orb) {
            orb.style.transition = 'all 0.3s cubic-bezier(0.2, 0.9, 0.3, 1)';
            if (i === lvl) {
              orb.style.background = 'linear-gradient(135deg, #48ca8b, #1b5e3d)';
              orb.style.boxShadow = '0 0 22px rgba(72,202,139,0.85), 0 0 35px rgba(72,202,139,0.4)';
              orb.style.border = '2.5px solid #fff';
              orb.style.color = '#fff';
              orb.style.transform = 'scale(1.15)';
            } else {
              orb.style.background = 'rgba(22, 45, 33, 0.9)';
              orb.style.boxShadow = 'none';
              orb.style.border = '1.5px solid rgba(72,202,139,0.4)';
              orb.style.color = '#72efb6';
              orb.style.transform = 'scale(1)';
            }
          }
        }
      }

      // Smooth scroll map pane: starts from bottom at Node 1 (620px) and moves up smoothly to Node 5 (80px)
      const scrollPane = document.getElementById('sp2-prog1-scroll-pane');
      if (scrollPane) {
        const nodePositions = [620, 485, 350, 215, 80];
        const nodeY = nodePositions[lvl - 1] !== undefined ? nodePositions[lvl - 1] : 620;
        const updateScroll = () => {
          const containerHeight = (scrollPane.parentElement && scrollPane.parentElement.clientHeight > 0)
            ? scrollPane.parentElement.clientHeight
            : 480;
          const maxScroll = Math.max(0, 720 - containerHeight);
          // Center the node in the container, clamped between 0 and maxScroll
          const offY = Math.max(0, Math.min(maxScroll, Math.round(nodeY - containerHeight * 0.5)));
          scrollPane.style.transform = `translateY(-${offY}px)`;
        };
        updateScroll();
        setTimeout(updateScroll, 50);
      }

      // Update Details
      const data = sp2ProgramData[1][lvl];
      if (data) {
        const badge = document.getElementById('sp2-p1-detail-badge');
        const time = document.getElementById('sp2-p1-detail-time');
        const title = document.getElementById('sp2-p1-detail-title');
        const img = document.getElementById('sp2-p1-detail-img');
        const desc = document.getElementById('sp2-p1-detail-desc');
        if (badge) badge.textContent = data.badge;
        if (time) time.textContent = data.time;
        if (title) title.textContent = data.title;
        if (img) {
          img.src = data.img;
          img.alt = data.title;
        }
        if (desc) desc.textContent = data.desc;
      }

      if (playSound) {
        const freqs = [261.63, 293.66, 329.63, 392.00, 440.00];
        pluckHarpString(freqs[lvl - 1] || 329.63, 0.6);
      }

      currentSp2PptStep = lvl;
      updateUniversalHud();
    }

    function selectSp2Day2ProgramLevel(lvl, playSound = true) {
      if (lvl < 1 || lvl > 6) return;
      currentSp2Day2ProgLvl = lvl;

      // Update Node active states
      for (let i = 1; i <= 6; i++) {
        const node = document.getElementById(`sp2-p2-node-${i}`);
        const orb = document.getElementById(`sp2-p2-orb-${i}`);
        if (node) {
          node.classList.toggle('active', i === lvl);
          if (orb) {
            orb.style.transition = 'all 0.3s cubic-bezier(0.2, 0.9, 0.3, 1)';
            if (i === lvl) {
              orb.style.background = 'linear-gradient(135deg, #48ca8b, #1b5e3d)';
              orb.style.boxShadow = '0 0 22px rgba(72,202,139,0.85), 0 0 35px rgba(72,202,139,0.4)';
              orb.style.border = '2.5px solid #fff';
              orb.style.color = '#fff';
              orb.style.transform = 'scale(1.15)';
            } else {
              orb.style.background = 'rgba(22, 45, 33, 0.9)';
              orb.style.boxShadow = 'none';
              orb.style.border = '1.5px solid rgba(72,202,139,0.4)';
              orb.style.color = '#72efb6';
              orb.style.transform = 'scale(1)';
            }
          }
        }
      }

      // Smooth scroll map pane: starts from bottom at Node 1 (730px) and moves up smoothly to Node 6 (80px)
      const scrollPane = document.getElementById('sp2-prog2-scroll-pane');
      if (scrollPane) {
        const nodePositions = [730, 600, 470, 340, 210, 80];
        const nodeY = nodePositions[lvl - 1] !== undefined ? nodePositions[lvl - 1] : 730;
        const updateScroll = () => {
          const containerHeight = (scrollPane.parentElement && scrollPane.parentElement.clientHeight > 0)
            ? scrollPane.parentElement.clientHeight
            : 480;
          const maxScroll = Math.max(0, 850 - containerHeight);
          const offY = Math.max(0, Math.min(maxScroll, Math.round(nodeY - containerHeight * 0.5)));
          scrollPane.style.transform = `translateY(-${offY}px)`;
        };
        updateScroll();
        setTimeout(updateScroll, 50);
      }

      // Update Details
      const data = sp2ProgramData[2][lvl];
      if (data) {
        const badge = document.getElementById('sp2-p2-detail-badge');
        const time = document.getElementById('sp2-p2-detail-time');
        const title = document.getElementById('sp2-p2-detail-title');
        const img = document.getElementById('sp2-p2-detail-img');
        const desc = document.getElementById('sp2-p2-detail-desc');
        if (badge) badge.textContent = data.badge;
        if (time) time.textContent = data.time;
        if (title) title.textContent = data.title;
        if (img) {
          img.src = data.img;
          img.alt = data.title;
        }
        if (desc) desc.textContent = data.desc;
      }

      if (playSound) {
        const freqs = [293.66, 329.63, 369.99, 415.30, 466.16, 523.25];
        pluckHarpString(freqs[lvl - 1] || 392.00, 0.6);
      }

      currentSp2PptStep = 13 + lvl;
      updateUniversalHud();
    }

    function zoomSp2ProgramMedia(dayNum) {
      const lvl = dayNum === 1 ? currentSp2Day1ProgLvl : currentSp2Day2ProgLvl;
      const data = sp2ProgramData[dayNum] && sp2ProgramData[dayNum][lvl];
      if (data) {
        openCinematicZoom(data.img, data.title, data.time, '');
      }
    }

    let currentSp2PptStep = 0; // 0 to 27 (28 steps)

    function goToSp2PptStep(step, playSound = true) {
      if (step < 0 || step > 27) return;
      currentSp2PptStep = step;

      // Step 0: Level 1 (الجلسات التعليمية وإعداد القادة)
      if (step === 0) {
        openSp2Node(1, false, false);
        if (playSound) pluckHarpString(261.63, 0.6);
      }
      // Steps 1 to 5: Level 2 (برنامج اليوم الأول: مراحل 1 إلى 5)
      else if (step >= 1 && step <= 5) {
        openSp2Node(2, false, false);
        selectSp2Day1ProgramLevel(step, playSound);
      }
      // Step 6: Level 3 (تحضيرات in general)
      else if (step === 6) {
        openSp2Node(3, false, false);
        if (playSound) pluckHarpString(311.13, 0.6);
      }
      // Step 7: Level 4 (تحضيرات اليوم الأول • كنيسة العزراء بالسلام)
      else if (step === 7) {
        openSp2Node(4, false, false);
        if (playSound) pluckHarpString(329.63, 0.6);
      }
      // Steps 8 to 13: Level 5 (ميزانية اليوم الأول: بنود 0 إلى 5)
      else if (step >= 8 && step <= 13) {
        const sliceIdx = step - 8;
        openSp2Node(5, false, false);
        selectBudgetSlice(sliceIdx, playSound);
      }
      // Steps 14 to 20: Level 6 (برنامج اليوم الثاني: مراحل 1 إلى 7)
      else if (step >= 14 && step <= 20) {
        const lvl = step - 13;
        openSp2Node(6, false, false);
        selectSp2Day2ProgramLevel(lvl, playSound);
      }
      // Step 21: Level 7 (تحضيرات اليوم الثاني • كنيسة البطحة والفيلا)
      else if (step === 21) {
        openSp2Node(7, false, false);
        if (playSound) pluckHarpString(440.00, 0.6);
      }
      // Steps 22 to 27: Level 8 (ميزانية اليوم الثاني: بنود 0 إلى 5)
      else if (step >= 22 && step <= 27) {
        const sliceIdx = step - 22;
        openSp2Node(8, false, false);
        selectBudgetSlice(sliceIdx, playSound);
      }

      updateUniversalHud();
    }

    // ── 14. Chord 4 (يوم التنفيذ) Candy Crush Multi-Day Controller (Day 1: 6 levels, Day 2: 7 levels) ──
    let currentSp4MapDay = 1; // 1 or 2
    let currentSp4DayLevelIdx = 1; // 1 to 6 (Day 1) or 1 to 7 (Day 2)

    const sp4DaysData = {
      1: {
        churchName: "اليوم الأول • الأنشطة الميدانية والورش",
        totalLevels: 5,
        levels: {
          1: {
            nodeTitle: "Opening and Breakfast",
            nodeTime: "٠٩:٠٠ ص – ١٠:٠٠ ص",
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>',
            badge: "المرحلة ١ من ٥ • اليوم الأول",
            time: "٠٩:٠٠ ص – ١٠:٠٠ ص",
            title: "Opening and Breakfast",
            desc: "طابور الافتتاح الكشفي الصباحي وتحية العلم مع صيحات وترانيم كشفية حماسية، وتوزيع وجبة إفطار خفيفة متكاملة ومشروبات دافئة لبدء اليوم بنشاط وألفة.",
            img: "assets/opening day 1.jpg",
            caption: "طابور الافتتاح الكشفي وتحية العلم واستقبال أطفال كنيسة السلام"
          },
          2: {
            nodeTitle: "Games 1",
            nodeTime: "١٠:٠٠ ص – ١٢:٠٠ م",
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="12 8 8 12 12 16 16 12 12 8"></polygon></svg>',
            badge: "المرحلة ٢ من ٥ • اليوم الأول",
            time: "١٠:٠٠ ص – ١٢:٠٠ م",
            title: "Games 1",
            desc: "انطلاق الجولة الأولى من الألعاب الميدانية والمسابقات الحركية؛ دوري كرة القدم، مسار الموانع، وتحديات التتابع بين الفرق لإشعال روح المنافسة الشريفة.",
            img: "assets/games day 1.jpg",
            caption: "بطولات الملاعب والمسابقات الحركية والتنافس بين فرق الأولاد والبنات"
          },
          3: {
            nodeTitle: "Sessions",
            nodeTime: "١٢:٠٠ م – ٠١:٣٠ م",
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M7 8h10"></path></svg>',
            badge: "المرحلة ٣ من ٥ • اليوم الأول",
            time: "١٢:٠٠ م – ٠١:٣٠ م",
            title: "Sessions",
            desc: "الجلسات الروحية وتقويم السلوك وورش العمل والأشغال اليدوية وصناعة تذكارات بأيدي الأطفال.",
            img: "assets/ethics session day 1.jpg",
            caption: "الجلسات الروحية وتقويم السلوك وورش العمل والأشغال اليدوية"
          },
          4: {
            nodeTitle: "Games 2",
            nodeTime: "٠١:٣٠ م – ٠٣:٣٠ م",
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
            badge: "المرحلة ٤ من ٥ • اليوم الأول",
            time: "٠١:٣٠ م – ٠٣:٣٠ م",
            title: "Games 2",
            desc: "قمة الفرح بالترامبولين وألعاب البالونات المائية وسباق الأكياس وتحديات التيليب ماتش الحماسية بالملاعب.",
            img: "assets/games day 1.jpg",
            caption: "مهرجان التيليب ماتش وتحديات الترامبولين ومسابقات الملاعب"
          },
          5: {
            nodeTitle: "Lunch",
            nodeTime: "٠٣:٣٠ م – ٠٤:٣٠ م",
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="13" r="4"></circle><path d="M5 7h2l2-3h6l2 3h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"></path></svg>',
            badge: "المرحلة ٥ من ٥ • اليوم الأول",
            time: "٠٣:٣٠ م – ٠٤:٣٠ م",
            title: "Lunch",
            desc: "التجمع حول مائدة غداء دافئة ولذيذة كعائلة واحدة، وتوزيع الميداليات التذكارية والتقاط الصورة الجماعية الرسمية لليوم الأول مع الأطفال والخدام.",
            img: "assets/first day raht image.jpg",
            caption: "صورة اليوم التذكارية ومشاركة مائدة الغداء الكشفية وتكريم الجميع"
          }
        }
      },
      2: {
        churchName: "اليوم الثاني • الفيلا والمسبح والألعاب المائية",
        totalLevels: 7,
        levels: {
          1: {
            nodeTitle: "١. فطار وافتتاح",
            nodeTime: "١١:٤٥ ص – ١٢:٣٠ م",
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>',
            badge: "المرحلة ١ من ٧ • اليوم الثاني",
            time: "١١:٤٥ ص – ١٢:٣٠ م",
            title: "الاستقبال والإفطار والافتتاح الكشفي (Breakfast & Opening)",
            desc: "استقبال حافل للأطفال بأناشيد الكشافة وصيحات رهط الوتر لكسر الجليد، ثم توزيع وجبة إفطار خفيفة ومشروبات دافئة لبدء يوم الفيلا والمسبح بحماس.",
            img: "assets/opening day 2.jpg",
            caption: "الافتتاح الكشفي الصباحي واستقبال الأطفال وتناول وجبة الإفطار الجماعية بكنيسة البطحة"
          },
          2: {
            nodeTitle: "٢. روحي وسلوك وأشغال",
            nodeTime: "١٢:٣٠ م – ٠٢:٠٠ م",
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M7 8h10"></path></svg>',
            badge: "المرحلة ٢ من ٧ • اليوم الثاني",
            time: "١٢:٣٠ م – ٠٢:٠٠ م",
            title: "الفقرة الروحية والأشغال اليدوية وتقويم السلوك (Ro7y, Crafts & Ethics)",
            desc: "قصة روحية مشوقة عن الرجاء والمحبة، تلتها ورش عمل حرفية وأشغال يدوية صنع فيها الأطفال تذكارات بأيديهم، مع غرس القيم السلوكية والأخلاقية.",
            img: "assets/religous session day 2.jpg",
            caption: "الفقرة الروحية وورش العمل والأشغال اليدوية وتنمية المهارات"
          },
          3: {
            nodeTitle: "٣. لبس المايوهات",
            nodeTime: "٠٢:٠٠ م – ٠٢:٣٠ م",
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"></path></svg>',
            badge: "المرحلة ٣ من ٧ • اليوم الثاني",
            time: "٠٢:٠٠ م – ٠٢:٣٠ م",
            title: "تجهيز وارتداء ملابس السباحة (Lebs Maiohat)",
            desc: "تجهيز وارتداء ملابس السباحة للأطفال والاستعداد للنزول في حمام السباحة.",
            img: "assets/swimwear-prep.jpg",
            caption: "الاستعداد للنزول في البيسين بكامل العتاد والجاهزية!"
          },
          4: {
            nodeTitle: "٤. مسبح بنات / ألعاب أولاد",
            nodeTime: "٠٢:٣٠ م – ٠٤:٠٠ م",
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12c2.5-3 5.5-3 8 0s5.5 3 8 0 4-2 4-2"></path><path d="M2 18c2.5-3 5.5-3 8 0s5.5 3 8 0 4-2 4-2"></path></svg>',
            badge: "المرحلة ٤ من ٧ • اليوم الثاني",
            time: "٠٢:٣٠ م – ٠٤:٠٠ م",
            title: "مسبح البنات وألعاب ومسابقات الأولاد (Girls Pool / Boys Games)",
            desc: "نظام التناوب الأول؛ استمتاع كامل للبنات بحمام السباحة والزحاليق المائية في خصوصية وأمان تام تحت إشراف المنقذات والخادمات، وتنافس حماسي للأولاد في الملاعب.",
            img: "assets/games boys day 2.jpg",
            caption: "فترة التناوب الأولى: ألعاب ومسابقات ملاعب اليوم الثاني للأولاد بالتوازي مع مسبح البنات"
          },
          5: {
            nodeTitle: "٥. مسبح أولاد / ألعاب بنات",
            nodeTime: "٠٤:٠٠ م – ٠٥:٣٠ م",
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="12 8 8 12 12 16 16 12 12 8"></polygon></svg>',
            badge: "المرحلة ٥ من ٧ • اليوم الثاني",
            time: "٠٤:٠٠ م – ٠٥:٣٠ م",
            title: "مسبح الأولاد وألعاب ومسابقات البنات (Boys Pool & Girls Games)",
            desc: "عكس التناوب؛ انطلاق الأولاد للمسبح والألعاب المائية والكرات المنفوخة، بينما تخوض البنات مسابقات تفاعلية مبهجة في الملاعب الخضراء المجهزة.",
            img: "assets/games girls day 2.jpg",
            caption: "فترة التناوب الثانية: ألعاب ومسابقات الملاعب للبنات بالتوازي مع مسبح الأولاد"
          },
          6: {
            nodeTitle: "٦. استحمام ولبس",
            nodeTime: "٠٥:٣٠ م – ٠٦:٠٠ م",
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path><path d="M12 12v9"></path><path d="m8 17 4 4 4-4"></path></svg>',
            badge: "المرحلة ٦ من ٧ • اليوم الثاني",
            time: "٠٥:٣٠ م – ٠٦:٠٠ م",
            title: "الاستحمام وتغيير الملابس (7moom and Lebs)",
            desc: "الانتهاء من نشاط البركة، أخذ شاور دافئ، تجفيف وتبديل الملابس والاستعداد لمائدة العشاء.",
            img: "assets/showering-care.jpg",
            caption: "الشكل بعد الخروج من البيسين والشاور الساقع!"
          },
          7: {
            nodeTitle: "٧. غداء وصورة اليوم",
            nodeTime: "٠٦:٠٠ م – ٠٦:٣٠ م",
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="13" r="4"></circle><path d="M5 7h2l2-3h6l2 3h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"></path></svg>',
            badge: "المرحلة ٧ من ٧ • اليوم الثاني",
            time: "٠٦:٠٠ م – ٠٦:٣٠ م",
            title: "مائدة الغداء، صورة اليوم، والتكريم (Lunch & Soret El Yom)",
            desc: "التجمع الكشفي الأخير حول مائدة غداء شهية كعائلة واحدة، ثم التقاط الصورة التذكارية الملحمية لرهط الوتر مع الأطفال والخدام، وتوزيع هدايا اليوم وتكريم الجميع.",
            img: "assets/second day raht image.jpeg",
            caption: "صورة اليوم التذكارية ومشاركة مائدة الغداء الكشفية وتكريم الجميع"
          }
        }
      }
    };

    function renderSp4MapNodes() {
      const dayData = sp4DaysData[currentSp4MapDay];
      if (!dayData) return;

      const d1 = "M 160,880 C 120,810 70,740 90,690 C 110,640 250,550 230,500 C 210,450 70,360 90,310 C 110,260 140,180 160,120";
      const d2 = "M 160,880 C 120,830 70,790 90,750 C 110,710 250,660 230,620 C 210,580 70,530 90,490 C 110,450 250,400 230,360 C 210,320 75,270 95,230 C 115,190 140,140 160,100";

      const targetD = (currentSp4MapDay === 1) ? d1 : d2;
      ['sp4-track-path-glow', 'sp4-track-path-base', 'sp4-track-path-dash'].forEach(id => {
        const p = document.getElementById(id);
        if (p) p.setAttribute('d', targetD);
      });

      const day1Coords = [
        { top: '880px', left: '50%' },
        { top: '690px', left: '28%' },
        { top: '500px', left: '72%' },
        { top: '310px', left: '28%' },
        { top: '120px', left: '50%' }
      ];

      const day2Coords = [
        { top: '880px', left: '50%' },
        { top: '750px', left: '28%' },
        { top: '620px', left: '72%' },
        { top: '490px', left: '28%' },
        { top: '360px', left: '72%' },
        { top: '230px', left: '30%' },
        { top: '100px', left: '50%' }
      ];

      const maxLvls = dayData.totalLevels;
      for (let i = 1; i <= 7; i++) {
        const node = document.getElementById(`sp4-node-${i}`);
        const titleEl = document.getElementById(`sp4-node-title-${i}`);
        const timeEl = document.getElementById(`sp4-node-time-${i}`);
        const iconEl = document.getElementById(`sp4-node-icon-${i}`);

        if (i <= maxLvls) {
          const lvlData = dayData.levels[i];
          if (node) {
            node.style.display = 'block';
            const coords = (currentSp4MapDay === 1) ? day1Coords[i - 1] : day2Coords[i - 1];
            node.style.top = coords.top;
            node.style.left = coords.left;
          }
          if (lvlData) {
            if (titleEl) titleEl.textContent = lvlData.nodeTitle;
            if (timeEl) timeEl.textContent = lvlData.nodeTime;
            if (iconEl) iconEl.innerHTML = lvlData.icon;
          }
        } else {
          if (node) node.style.display = 'none';
        }
      }
    }

    function switchSp4MapDay(dayNum) {
      if (dayNum !== 1 && dayNum !== 2) return;
      currentSp4MapDay = dayNum;
      const btn1 = document.getElementById('sp4-map-day1-btn');
      const btn2 = document.getElementById('sp4-map-day2-btn');
      if (btn1) btn1.classList.toggle('active', dayNum === 1);
      if (btn2) btn2.classList.toggle('active', dayNum === 2);

      renderSp4MapNodes();
      const maxLvl = dayNum === 1 ? 5 : 7;
      const targetLvl = Math.min(maxLvl, Math.max(1, currentSp4DayLevelIdx));
      selectSp4DayLevel(targetLvl, true);
      pluckHarpString(dayNum === 1 ? 440.0 : 493.88, 0.5);
    }

    function selectSp4DayLevel(lvl, playSound = true) {
      const maxLvl = (currentSp4MapDay === 1) ? 5 : 7;
      if (lvl < 1 || lvl > maxLvl) return;
      currentSp4DayLevelIdx = lvl;

      // Update Node active styles
      for (let i = 1; i <= 7; i++) {
        const node = document.getElementById(`sp4-node-${i}`);
        const orb = document.getElementById(`sp4-node-orb-${i}`);
        if (node) {
          if (i === lvl) {
            node.classList.add('active');
            if (orb) {
              orb.style.background = 'linear-gradient(135deg, #48ca8b, #1b5e3d)';
              orb.style.color = '#fff';
              orb.style.boxShadow = '0 0 18px rgba(72,202,139,0.7)';
              orb.style.border = '2px solid #fff';
            }
          } else {
            node.classList.remove('active');
            if (orb) {
              orb.style.background = 'rgba(22, 45, 33, 0.9)';
              orb.style.color = '#72efb6';
              orb.style.boxShadow = 'none';
              orb.style.border = '2px solid rgba(72,202,139,0.5)';
            }
          }
        }
      }

      // Smooth camera scroll to center the active node in the 1000px map viewport
      const scrollPane = document.getElementById('sp4-map-scroll-pane');
      const container = document.getElementById('sp4-map-container');
      if (scrollPane && container) {
        const nodeYCoords = (currentSp4MapDay === 1)
          ? [880, 690, 500, 310, 120]
          : [880, 750, 620, 490, 360, 230, 100];
        const targetNodeY = nodeYCoords[lvl - 1];
        const containerH = container.clientHeight || 480;
        const targetScrollY = Math.max(0, Math.min(1000 - containerH, targetNodeY - containerH / 2));
        scrollPane.style.transform = `translateY(${-targetScrollY}px)`;
      }

      // Update Detail Pane on the right
      const dayData = sp4DaysData[currentSp4MapDay];
      const data = dayData && dayData.levels[lvl];
      if (data) {
        const badge = document.getElementById('sp4-detail-badge');
        const time = document.getElementById('sp4-detail-time');
        const title = document.getElementById('sp4-detail-title');
        const img = document.getElementById('sp4-detail-img');
        const counter = document.getElementById('ppt-counter-badge-4');

        if (badge) badge.textContent = data.badge;
        if (time) time.textContent = data.time;
        if (title) title.textContent = data.title;
        if (img) {
          img.src = data.img;
          img.alt = data.caption;
          if (data.img && data.img.endsWith('.svg')) {
            img.style.objectFit = 'contain';
            img.style.background = '#07130e';
          } else {
            img.style.objectFit = 'cover';
            img.style.background = 'transparent';
          }
        }
        if (counter) {
          const arabicNums = ['١', '٢', '٣', '٤', '٥', '٦', '٧'];
          counter.textContent = `${arabicNums[lvl - 1]} / ${arabicNums[maxLvl - 1]}`;
        }
      }

      if (playSound) {
        const freqs = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 523.25];
        pluckHarpString(freqs[lvl - 1], 0.65);
      }

      updateUniversalHud();
    }

    function zoomSp4CurrentMedia() {
      const dayData = sp4DaysData[currentSp4MapDay];
      const data = dayData && dayData.levels[currentSp4DayLevelIdx];
      if (data) {
        openCinematicZoom(data.img, data.title, data.time, data.caption);
      }
    }

    function nextSp4PptStep() {
      advanceGlobalPresentation(1);
    }

    function prevSp4PptStep() {
      advanceGlobalPresentation(-1);
    }

    function goToSp4PptStep(step, playSound = true) {
      if (typeof renderSp4MapNodes === 'function') {
        renderSp4MapNodes();
      }
      if (step >= 5) {
        switchSp4MapDay(2);
        selectSp4DayLevel(7, playSound);
      } else {
        switchSp4MapDay(1);
        const targetLvl = Math.min(5, Math.max(1, step + 1));
        selectSp4DayLevel(targetLvl, playSound);
      }
    }

    // ── Dramatic Grand Reveal Audio Engine (Snare Roll, Timpani Rumble, Smash Impacts, Climax) ──
    function playDramaticDrumrollReveal() {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const rollDuration = 1.6;
        const totalStrikes = 65;

        // Snare roll: accelerating noise bursts
        for (let i = 0; i < totalStrikes; i++) {
          const progress = i / totalStrikes;
          const strikeTime = now + (Math.pow(progress, 1.25) * rollDuration);
          const strikeGain = 0.05 + Math.pow(progress, 1.5) * 0.6;

          const noiseLen = Math.floor(ctx.sampleRate * 0.035);
          const noiseBuf = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
          const data = noiseBuf.getChannelData(0);
          for (let s = 0; s < noiseLen; s++) {
            data[s] = (Math.random() * 2 - 1) * Math.exp(-s / (ctx.sampleRate * 0.006));
          }
          const noiseSrc = ctx.createBufferSource();
          noiseSrc.buffer = noiseBuf;

          const snareFilter = ctx.createBiquadFilter();
          snareFilter.type = 'bandpass';
          snareFilter.frequency.setValueAtTime(1100 + progress * 700, strikeTime);
          snareFilter.Q.setValueAtTime(1.4, strikeTime);

          const g = ctx.createGain();
          g.gain.setValueAtTime(strikeGain, strikeTime);
          g.gain.exponentialRampToValueAtTime(0.0001, strikeTime + 0.035);

          noiseSrc.connect(snareFilter);
          snareFilter.connect(g);
          g.connect(ctx.destination);
          noiseSrc.start(strikeTime);
        }

        // Timpani Rumble swelling underneath
        const timpOsc = ctx.createOscillator();
        const timpGain = ctx.createGain();
        timpOsc.type = 'triangle';
        timpOsc.frequency.setValueAtTime(75, now);
        timpOsc.frequency.linearRampToValueAtTime(110, now + rollDuration);
        timpGain.gain.setValueAtTime(0.05, now);
        timpGain.gain.exponentialRampToValueAtTime(0.45, now + rollDuration);
        timpGain.gain.exponentialRampToValueAtTime(0.0001, now + rollDuration + 0.08);
        timpOsc.connect(timpGain);
        timpGain.connect(ctx.destination);
        timpOsc.start(now);
        timpOsc.stop(now + rollDuration + 0.1);
      } catch (err) {
        console.warn("Drumroll audio error:", err);
      }
    }

    function playSmashImpactSound(type) {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;

        // Sub-bass thump
        const bd = ctx.createOscillator();
        const bdGain = ctx.createGain();
        bd.type = 'sine';

        const startFreq = type === 1 ? 190 : (type === 2 ? 165 : 220);
        const endFreq = 34;
        const duration = type === 3 ? 1.6 : 0.85;
        const initialGain = type === 3 ? 1.3 : 0.95;

        bd.frequency.setValueAtTime(startFreq, now);
        bd.frequency.exponentialRampToValueAtTime(endFreq, now + 0.22);
        bdGain.gain.setValueAtTime(initialGain, now);
        bdGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        bd.connect(bdGain);
        bdGain.connect(ctx.destination);
        bd.start(now);
        bd.stop(now + duration + 0.05);

        // Metallic / snappy crack transient
        const crackLen = Math.floor(ctx.sampleRate * 0.12);
        const crackBuf = ctx.createBuffer(1, crackLen, ctx.sampleRate);
        const cData = crackBuf.getChannelData(0);
        for (let i = 0; i < crackLen; i++) {
          cData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.015));
        }
        const crackSrc = ctx.createBufferSource();
        crackSrc.buffer = crackBuf;
        const crackGain = ctx.createGain();
        crackGain.gain.setValueAtTime(0.7, now);
        crackGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
        crackSrc.connect(crackGain);
        crackGain.connect(ctx.destination);
        crackSrc.start(now);

        // If type === 3 (Climax / Alb Ebtsama): Add Cymbal Crash + Harp Glissando Fanfare
        if (type === 3) {
          // Cymbal Crash
          const cymbalLen = Math.floor(ctx.sampleRate * 2.2);
          const cymbalBuf = ctx.createBuffer(1, cymbalLen, ctx.sampleRate);
          const cymData = cymbalBuf.getChannelData(0);
          let b0 = 0, b1 = 0;
          for (let s = 0; s < cymbalLen; s++) {
            const w = Math.random() * 2 - 1;
            b0 = 0.92 * b0 + w * 0.18;
            b1 = 0.88 * b1 + w * 0.25;
            cymData[s] = (w * 0.35 + b0 + b1) * Math.exp(-s / (ctx.sampleRate * 0.45));
          }
          const cymbalSrc = ctx.createBufferSource();
          cymbalSrc.buffer = cymbalBuf;
          const cymFilter = ctx.createBiquadFilter();
          cymFilter.type = 'highpass';
          cymFilter.frequency.setValueAtTime(2800, now);
          const cymGain = ctx.createGain();
          cymGain.gain.setValueAtTime(0.85, now);
          cymGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);
          cymbalSrc.connect(cymFilter);
          cymFilter.connect(cymGain);
          cymGain.connect(ctx.destination);
          cymbalSrc.start(now);

          // Triumphant glissando fanfare
          const freqs = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51];
          freqs.forEach((f, idx) => {
            setTimeout(() => {
              pluckHarpString(f, 0.8 - idx * 0.035);
            }, idx * 70);
          });
        }
      } catch (err) {
        console.warn("Smash sound error:", err);
      }
    }

    function spawnCollabSparks() {
      const container = document.getElementById('collab-notes-container');
      if (!container) return;
      container.innerHTML = '';
      const glyphs = ['✨', '✦', '★', '⭐', '💖', '🎉', '♪', '♫', '🔥'];
      const colors = ['#fbbf24', '#f472b6', '#38bdf8', '#c084fc', '#4ade80', '#ffffff', '#fde047'];

      for (let i = 0; i < 40; i++) {
        const el = document.createElement('span');
        el.className = 'collab-musical-note';
        el.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        el.style.color = color;
        el.style.textShadow = `0 0 14px ${color}`;

        const angle = Math.random() * Math.PI * 2;
        const distance = 140 + Math.random() * 380;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * (distance * 0.65) - 40;
        const rot = (Math.random() * 360 - 180) + 'deg';

        el.style.setProperty('--tx', `${tx.toFixed(1)}px`);
        el.style.setProperty('--ty', `${ty.toFixed(1)}px`);
        el.style.setProperty('--rot', rot);
        el.style.left = '50%';
        el.style.top = '50%';
        el.style.animationDelay = (Math.random() * 0.2).toFixed(2) + 's';

        container.appendChild(el);
      }

      setTimeout(() => {
        if (container) container.innerHTML = '';
      }, 3500);
    }

    let isGrandRevealActive = false;
    let grandRevealTimers = [];

    function clearGrandRevealTimers() {
      grandRevealTimers.forEach(t => clearTimeout(t));
      grandRevealTimers = [];
    }

    function resetGrandCollabCurtain() {
      clearGrandRevealTimers();
      isGrandRevealActive = false;
      const stage = document.getElementById('collab-grand-stage');
      const curtainsWrap = document.getElementById('collab-curtains-wrap');
      const godRays = document.getElementById('collab-god-rays');
      const flash = document.getElementById('collab-stage-flash');
      const lockup = document.getElementById('collab-lockup-stage');
      const xBadge = document.getElementById('collab-x-giant');
      const watarLogo = document.getElementById('collab-logo-watar');
      const ebtsamaLogo = document.getElementById('collab-logo-ebtsama');
      const spotlights = stage ? stage.querySelectorAll('.collab-spotlight') : [];

      if (curtainsWrap) curtainsWrap.classList.remove('opened');
      if (stage) stage.classList.remove('screen-shake', 'screen-shake-heavy');
      if (godRays) godRays.classList.remove('active');
      if (flash) flash.classList.remove('flash');
      if (lockup) lockup.classList.remove('all-settled');
      if (xBadge) xBadge.classList.remove('smashed');
      if (watarLogo) watarLogo.classList.remove('smashed');
      if (ebtsamaLogo) ebtsamaLogo.classList.remove('smashed');
      spotlights.forEach(sp => sp.classList.add('active'));
    }

    function triggerGrandCollabReveal() {
      if (currentSp5SlideIdx !== 2 || activePage !== 4) return;
      if (isGrandRevealActive) return;
      isGrandRevealActive = true;

      const stage = document.getElementById('collab-grand-stage');
      const curtainsWrap = document.getElementById('collab-curtains-wrap');
      const godRays = document.getElementById('collab-god-rays');
      const flash = document.getElementById('collab-stage-flash');
      const lockup = document.getElementById('collab-lockup-stage');
      const xBadge = document.getElementById('collab-x-giant');
      const watarLogo = document.getElementById('collab-logo-watar');
      const ebtsamaLogo = document.getElementById('collab-logo-ebtsama');

      // 1. Reset state
      resetGrandCollabCurtain();
      isGrandRevealActive = true;

      // 2. Play dramatic drumroll sound effect
      playDramaticDrumrollReveal();

      // 3. At 1.6s: Curtains open dramatically!
      const t1 = setTimeout(() => {
        if (currentSp5SlideIdx !== 2 || activePage !== 4) return;
        if (flash) {
          flash.classList.add('flash');
          setTimeout(() => flash.classList.remove('flash'), 650);
        }
        if (curtainsWrap) curtainsWrap.classList.add('opened');
        if (godRays) godRays.classList.add('active');

        // 4. At 1.9s: "X" SMASHES in the middle!
        const t2 = setTimeout(() => {
          if (currentSp5SlideIdx !== 2 || activePage !== 4) return;
          if (xBadge) xBadge.classList.add('smashed');
          playSmashImpactSound(1);
          if (stage) {
            stage.classList.remove('screen-shake');
            void stage.offsetWidth;
            stage.classList.add('screen-shake');
          }

          // 5. At 2.5s: Logo of El Watar SMASHES in!
          const t3 = setTimeout(() => {
            if (currentSp5SlideIdx !== 2 || activePage !== 4) return;
            if (watarLogo) watarLogo.classList.add('smashed');
            playSmashImpactSound(2);
            if (stage) {
              stage.classList.remove('screen-shake');
              void stage.offsetWidth;
              stage.classList.add('screen-shake');
            }

            // 6. At 3.1s: Logo of Alb Ebtsama SMASHES in!
            const t4 = setTimeout(() => {
              if (currentSp5SlideIdx !== 2 || activePage !== 4) return;
              if (ebtsamaLogo) ebtsamaLogo.classList.add('smashed');
              playSmashImpactSound(3);
              if (stage) {
                stage.classList.remove('screen-shake');
                void stage.offsetWidth;
                stage.classList.add('screen-shake-heavy');
              }
              spawnCollabSparks();

              // Climax complete: settle into idle floating aura
              const t5 = setTimeout(() => {
                if (currentSp5SlideIdx !== 2 || activePage !== 4) return;
                if (lockup) lockup.classList.add('all-settled');
                isGrandRevealActive = false;
              }, 600);
              grandRevealTimers.push(t5);

            }, 600); // 3.1s
            grandRevealTimers.push(t4);

          }, 600); // 2.5s
          grandRevealTimers.push(t3);

        }, 300); // 1.9s
        grandRevealTimers.push(t2);

      }, 1600); // 1.6s
      grandRevealTimers.push(t1);
    }

    // ── 15. Chord 5 (الدروس والمستقبل) 2-Slide Presentation Controller ──
    let currentSp5SlideIdx = 1; // 1 to 2

    function goToSp5Slide(slideNum, playSound = true) {
      if (slideNum < 1 || slideNum > 2) return;
      currentSp5SlideIdx = slideNum;

      // Switch Panes
      for (let i = 1; i <= 2; i++) {
        const pane = document.getElementById(`sp5-slide-${i}`);
        const pill = document.getElementById(`sp5-pill-${i}`);
        if (pane) {
          pane.style.display = i === slideNum ? 'flex' : 'none';
          pane.classList.toggle('active', i === slideNum);
        }
        if (pill) {
          pill.classList.toggle('active', i === slideNum);
        }
      }

      // Update counter badge
      const counter = document.getElementById('ppt-counter-badge-4') || document.getElementById('ppt-counter-badge-5');
      if (counter) {
        const arabicNums = ['١', '٢'];
        counter.textContent = `${arabicNums[slideNum - 1]} / ٢`;
      }

      if (playSound && slideNum === 1) {
        const freqs = [392.00, 440.00];
        pluckHarpString(freqs[slideNum - 1] || 440.00, 0.7);
      }

      // Slide 2: Trigger Grand Theatrical Curtain Reveal with Drums & Smashes!
      if (slideNum === 2) {
        const tLaunch = setTimeout(() => {
          triggerGrandCollabReveal();
        }, 150);
        grandRevealTimers.push(tLaunch);
      } else if (slideNum === 1) {
        clearGrandRevealTimers();
        resetGrandCollabCurtain();
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
      const slide = Math.min(2, Math.max(1, step + 1));
      goToSp5Slide(slide, playSound);
    }

        function celebratePresentationCompletion() {
      try {
        const freqs = [130.81, 164.81, 196.00, 261.63, 329.63, 392.00, 523.25];
        freqs.forEach((f, idx) => {
          setTimeout(() => {
            pluckHarpString(f, 0.8 - idx * 0.05);
          }, idx * 100);
        });
        setTimeout(() => {
          playGoldenBellChime(587.33);
        }, 800);
      } catch (e) { }

      const finaleBanner = document.getElementById('presentation-finale-banner');
      if (finaleBanner) {
        finaleBanner.style.display = 'flex';
      } else {
        closePage();
      }
    }

    function returnToHarpFinale() {
      const finaleBanner = document.getElementById('presentation-finale-banner');
      if (finaleBanner) finaleBanner.style.display = 'none';
      closePage();
    }

    // ── 16. Global In-Browser Live Text Editor Mode ──
    let isEditorModeActive = false;

    function toggleEditorMode() {
      isEditorModeActive = !isEditorModeActive;
      document.body.classList.toggle('editor-mode-active', isEditorModeActive);

      const editableSelectors = [
        'h1', 'h2', 'h3', 'h4', 'h5', 'p', 'li',
        '.card-title', '.card-sub', '.stage-title', '.stage-desc',
        '.ch-title', '.ch-desc', '.circle-title', '.circle-sub', '.centerpiece-caption-title', '.gm-node-label', '.gm-rule-desc',
        '.gm-hero-title', '.gm-hero-desc', '#sp4-detail-title', '#sp4-detail-desc'
      ];

      const elements = document.querySelectorAll(editableSelectors.join(', '));
      elements.forEach(el => {
        if (isEditorModeActive) {
          el.setAttribute('contenteditable', 'true');
          el.setAttribute('spellcheck', 'false');
          el.onblur = () => {
            saveEditorEdits();
          };
        } else {
          el.removeAttribute('contenteditable');
          el.onblur = null;
        }
      });

      if (isEditorModeActive) {
        pluckHarpString(523.25, 0.7);
        showEditorNotification('وضع التحرير المباشر مُفعّل');
      } else {
        saveEditorEdits();
        pluckHarpString(392.00, 0.5);
      }
    }

    function saveEditorEdits() {
      try {
        const edits = {};
        const elements = document.querySelectorAll('[contenteditable="true"]');
        elements.forEach((el, idx) => {
          const key = el.id || ('elem_' + idx);
          edits[key] = el.innerHTML;
        });
        localStorage.setItem('raht_presentation_custom_edits', JSON.stringify(edits));
        showEditorNotification('تم حفظ كافة تعديلات النصوص بنجاح في المتصفح!');
        showCmToast('💾 تم حفظ تعديلات النصوص تلقائياً في المتصفح!');
      } catch (e) {
        console.error('Error saving edits:', e);
      }
    }

    function resetEditorEdits() {
      if (confirm('هل تريد بالتأكيد استعادة النصوص الأصلية وإلغاء التعديلات؟')) {
        localStorage.removeItem('raht_presentation_custom_edits');
        location.reload();
      }
    }

    function restoreEditorEdits() {
      try {
        const saved = localStorage.getItem('raht_presentation_custom_edits');
        if (!saved) return;
        const edits = JSON.parse(saved);
        const elements = document.querySelectorAll('h1, h2, h3, h4, h5, p, li, .card-title, .card-sub, .stage-title, .stage-desc, .ch-title, .ch-desc, .gm-node-label');
        elements.forEach((el, idx) => {
          const key = el.id || ('elem_' + idx);
          if (edits[key]) {
            el.innerHTML = edits[key];
          }
        });
      } catch (e) { }
    }

    function showEditorNotification(msg) {
      const banner = document.getElementById('editor-floating-banner');
      if (banner) {
        const span = banner.querySelector('span strong');
        if (span) {
          const originalText = span.textContent;
          span.textContent = msg;
          setTimeout(() => {
            span.textContent = originalText;
          }, 2800);
        }
      }
    }

    window.addEventListener('DOMContentLoaded', () => {
      restoreEditorEdits();
      spawnMapAmbientNotes();
      renderSp4MapNodes();
    });

    // ── Ambient Floating Notes for sp-2 and sp-4 Map Panes ──
    function spawnMapAmbientNotes() {
      const noteGlyphs = ['♪', '♫', '♩', '♬', '✦', '✧', '𝄞'];

      // sp-2 (blue/mint theme - both gm-pane-3 and gm-pane-6)
      const sp2Layers = document.querySelectorAll('#sp-2 .floating-notes-layer');
      sp2Layers.forEach(sp2Layer => {
        const blueColors = [
          'rgba(114, 239, 182, 0.85)',
          'rgba(78, 168, 222, 0.9)',
          'rgba(144, 224, 239, 0.85)',
          'rgba(90, 190, 240, 0.8)',
          'rgba(160, 240, 210, 0.75)',
          'rgba(253, 224, 71, 0.8)'
        ];
        for (let i = 0; i < 20; i++) {
          const el = document.createElement('div');
          el.className = 'map-ambient-note';
          el.textContent = noteGlyphs[Math.floor(Math.random() * noteGlyphs.length)];
          const sz = Math.floor(Math.random() * 12 + 14); // 14 to 26px
          const rot = ((Math.random() - 0.5) * 45).toFixed(1);
          const op = (Math.random() * 0.45 + 0.35).toFixed(2);
          const color = blueColors[Math.floor(Math.random() * blueColors.length)];
          const dur = (6 + Math.random() * 9).toFixed(1);
          const delay = (Math.random() * -16).toFixed(1);
          const left = (Math.random() * 92 + 4).toFixed(1);
          el.style.cssText = `
            left: ${left}%;
            color: ${color};
            text-shadow: 0 0 8px ${color}, 0 0 16px rgba(78, 168, 222, 0.45);
            --note-size: ${sz}px;
            --note-rot: ${rot}deg;
            --note-opacity: ${op};
            animation-duration: ${dur}s;
            animation-delay: ${delay}s;
          `;
          sp2Layer.appendChild(el);
        }
      });

      // sp-4 (green/gold theme)
      const sp4Layers = document.querySelectorAll('#sp-4 .floating-notes-layer');
      sp4Layers.forEach(sp4Layer => {
        const greenColors = [
          'rgba(72, 202, 139, 0.85)',
          'rgba(114, 239, 182, 0.9)',
          'rgba(167, 243, 208, 0.85)',
          'rgba(52, 211, 153, 0.8)',
          'rgba(110, 231, 183, 0.75)',
          'rgba(251, 191, 36, 0.8)'
        ];
        for (let i = 0; i < 20; i++) {
          const el = document.createElement('div');
          el.className = 'map-ambient-note';
          el.textContent = noteGlyphs[Math.floor(Math.random() * noteGlyphs.length)];
          const sz = Math.floor(Math.random() * 12 + 14); // 14 to 26px
          const rot = ((Math.random() - 0.5) * 45).toFixed(1);
          const op = (Math.random() * 0.45 + 0.35).toFixed(2);
          const color = greenColors[Math.floor(Math.random() * greenColors.length)];
          const dur = (6 + Math.random() * 9).toFixed(1);
          const delay = (Math.random() * -16).toFixed(1);
          const left = (Math.random() * 92 + 4).toFixed(1);
          el.style.cssText = `
            left: ${left}%;
            color: ${color};
            text-shadow: 0 0 8px ${color}, 0 0 16px rgba(72, 202, 139, 0.45);
            --note-size: ${sz}px;
            --note-rot: ${rot}deg;
            --note-opacity: ${op};
            animation-duration: ${dur}s;
            animation-delay: ${delay}s;
          `;
          sp4Layer.appendChild(el);
        }
      });
    }

    // ── 6. Ambient Floating Musical Notes ──
    (function spawnAmbientNotes() {
      const home = document.getElementById('home');
      const noteGlyphs = ['♪', '♫', '♩', '♬', '♭', '♯'];
      const noteColors = [
        'rgba(255, 230, 150, 0.85)',
        'rgba(252, 222, 130, 0.8)',
        'rgba(245, 195, 85, 0.75)',
        'rgba(255, 242, 190, 0.9)',
        'rgba(235, 175, 70, 0.75)',
        'rgba(255, 215, 120, 0.8)'
      ];

      for (let i = 0; i < 24; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.textContent = noteGlyphs[Math.floor(Math.random() * noteGlyphs.length)];
        const sz = Math.floor(Math.random() * 12 + 14); // 14px to 26px
        const rot = ((Math.random() - 0.5) * 40).toFixed(1);
        const op = (Math.random() * 0.45 + 0.35).toFixed(2);
        const color = noteColors[Math.floor(Math.random() * noteColors.length)];
        const duration = (8 + Math.random() * 12).toFixed(1);
        const delay = (Math.random() * -20).toFixed(1);
        const left = (Math.random() * 94 + 3).toFixed(1);

        p.style.cssText = `
      left: ${left}%;
      color: ${color};
      --note-size: ${sz}px;
      --note-rot: ${rot}deg;
      --note-opacity: ${op};
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
    `;
        home.appendChild(p);
      }
    })();

    // ══════════════════════════════════════════════════════════════════
    // ⚡ FAST CONTENT & TEXT EDITOR DASHBOARD CONTROLLER (لوحة تعديل النصوص)
    // ══════════════════════════════════════════════════════════════════
    var isContentManagerOpen = false;
    var cmCurrentCategory = 'all';
    var cmSavedEdits = {};

    // 1. Comprehensive Registry of Presentation Texts
    var CM_REGISTRY = [
      // ── الرئيسية والقيثارة ──
      {
        id: 'home_team_name',
        category: 'home',
        catLabel: 'الرئيسية والقيثارة',
        slideLabel: 'الشاشة الافتتاحية',
        fieldLabel: 'اسم الفريق الرئيسي',
        selector: '#team-name',
        getDefault: () => 'رهط الوتر'
      },
      {
        id: 'home_team_motto',
        category: 'home',
        catLabel: 'الرئيسية والقيثارة',
        slideLabel: 'الشاشة الافتتاحية',
        fieldLabel: 'الشعار اللفظي للرهط',
        selector: '#team-motto',
        getDefault: () => '«مختلفين في شخصياتنا… لكن لما بنجتمع بنعمل لحن واحد»'
      },

      // ── الوتر الأول: احنا مين؟ ──
      {
        id: 'c0_s0_title',
        category: 'chord0',
        catLabel: 'الوتر الأول: احنا مين؟',
        slideLabel: 'شريحة 1: من نحن؟',
        fieldLabel: 'عنوان الشريحة',
        selector: '#stage-0 .stage-title',
        chordIdx: 0,
        stepIdx: 0,
        getDefault: () => 'من نحن؟'
      },
      {
        id: 'c0_s1_title',
        category: 'chord0',
        catLabel: 'الوتر الأول: احنا مين؟',
        slideLabel: 'شريحة 2: سر التسمية',
        fieldLabel: 'عنوان شريحة التسمية',
        selector: '#stage-1 .stage-title',
        chordIdx: 0,
        stepIdx: 1,
        getDefault: () => 'تسمية «رهط الوتر»'
      },
      {
        id: 'c0_s1_quote',
        category: 'chord0',
        catLabel: 'الوتر الأول: احنا مين؟',
        slideLabel: 'شريحة 2: سر التسمية',
        fieldLabel: 'اقتباس بطاقة التسمية (Quote Card)',
        selector: '#stage-1 .quote-text',
        chordIdx: 0,
        stepIdx: 1,
        getDefault: () => 'الوتر: تنوّعٌ في المواهب، ووحدةٌ في الروح، علشان نعمل لحناً يئثار القلوب'
      },
      {
        id: 'c0_bible_badge_verse',
        category: 'chord0',
        catLabel: 'الوتر الأول: احنا مين؟',
        slideLabel: 'الكتاب المقدس (الصفحة اليمنى)',
        fieldLabel: 'شارة ترويسة الآية',
        selector: '.bible-verse-top-badge',
        chordIdx: 0,
        stepIdx: 1,
        getDefault: () => 'آيَةُ تَسْمِيَةِ «رَهْطِ الْوَتَرِ»'
      },
      {
        id: 'c0_bible_verse',
        category: 'chord0',
        catLabel: 'الوتر الأول: احنا مين؟',
        slideLabel: 'الكتاب المقدس (الصفحة اليمنى)',
        fieldLabel: 'نص الآية الكريمة (بالتشكيل)',
        selector: '#bible-scripture-highlight',
        chordIdx: 0,
        stepIdx: 1,
        getDefault: () => 'فَإِنَّهُ كَمَا فِي جَسَدٍ وَاحِدٍ لَنَا أَعْضَاءٌ كَثِيرَةٌ وَلَكِنْ لَيْسَ جَمِيعُ الأَعْضَاءِ لَهَا عَمَلٌ وَاحِدٌ'
      },
      {
        id: 'c0_bible_citation',
        category: 'chord0',
        catLabel: 'الوتر الأول: احنا مين؟',
        slideLabel: 'الكتاب المقدس (الصفحة اليمنى)',
        fieldLabel: 'شاهد الآية الكريمة (الشاهد)',
        selector: '.bible-citation-pill .citation-text',
        chordIdx: 0,
        stepIdx: 1,
        getDefault: () => 'رومية ١٢ :٤'
      },
      {
        id: 'c0_bible_badge_refl',
        category: 'chord0',
        catLabel: 'الوتر الأول: احنا مين؟',
        slideLabel: 'الكتاب المقدس (الصفحة اليسرى)',
        fieldLabel: 'شارة ترويسة التأمل',
        selector: '.bible-reflection-top-badge',
        chordIdx: 0,
        stepIdx: 1,
        getDefault: () => 'التَّأَمُّلُ الرُّوحِي'
      },
      {
        id: 'c0_bible_refl_core',
        category: 'chord0',
        catLabel: 'الوتر الأول: احنا مين؟',
        slideLabel: 'الكتاب المقدس (الصفحة اليسرى)',
        fieldLabel: 'التأمل الروحي الجوهري',
        selector: '.bible-reflection-core-quote',
        chordIdx: 0,
        stepIdx: 1,
        getDefault: () => '«الْوَتَرُ: تَنَوُّعٌ فِي الْمَوَاهِبِ، وَوَحْدَةٌ فِي الرُّوحِ، لِنَصْنَعَ لَحْناً يَمَسُّ الْقُلُوبَ»'
      },
      {
        id: 'c0_bible_refl_body',
        category: 'chord0',
        catLabel: 'الوتر الأول: احنا مين؟',
        slideLabel: 'الكتاب المقدس (الصفحة اليسرى)',
        fieldLabel: 'نص التأمل الكنسي والتكامل',
        selector: '.bible-reflection-body-text',
        chordIdx: 0,
        stepIdx: 1,
        getDefault: () => 'أعضاءٌ كثيرة في جسدٍ واحد، تتكامل مواهبها معاً لخدمة ورعاية أولاد الله بروح المحبة والعطاء'
      },
      {
        id: 'c0_s2_title',
        category: 'chord0',
        catLabel: 'الوتر الأول: احنا مين؟',
        slideLabel: 'شريحة 3: العهد التجوالي',
        fieldLabel: 'عنوان شريحة العهد',
        selector: '#stage-2 .stage-title',
        chordIdx: 0,
        stepIdx: 2,
        getDefault: () => 'العهد التجوالي والالتزام اليومي'
      },
      {
        id: 'c0_s2_covenant',
        category: 'chord0',
        catLabel: 'الوتر الأول: احنا مين؟',
        slideLabel: 'شريحة 3: العهد التجوالي',
        fieldLabel: 'نص العهد التجوالي',
        selector: '.covenant-text',
        chordIdx: 0,
        stepIdx: 2,
        getDefault: () => 'نصلي ابانا الذي و صلاة الجوال'
      },
      {
        id: 'c0_s3_tl_title',
        category: 'chord0',
        catLabel: 'الوتر الأول: احنا مين؟',
        slideLabel: 'شرائح 4-8: رحلتنا (الخط الزمني)',
        fieldLabel: 'عنوان قسم الرحلة',
        selector: '#stage-3 .tl-title',
        chordIdx: 0,
        stepIdx: 3,
        getDefault: () => 'رحلتنا'
      },

      // ── الوتر الثاني: فكرة المشروع ──
      {
        id: 'c1_rej_card_1_title',
        category: 'chord1',
        catLabel: 'الوتر الثاني: فكرة المشروع',
        slideLabel: 'شريحة 1: الأفكار المستبعدة',
        fieldLabel: 'عنوان الفكرة المستبعدة الأولى',
        chordIdx: 1,
        stepIdx: 0,
        getter: () => (typeof rejectedCardsData !== 'undefined' && rejectedCardsData[0] ? rejectedCardsData[0].title : 'حملة التوعية النفسية'),
        setter: (v) => {
          if (typeof rejectedCardsData !== 'undefined' && rejectedCardsData[0]) rejectedCardsData[0].title = v;
          const el = document.querySelectorAll('.rej-card-title')[0];
          if (el) el.textContent = v;
        },
        getDefault: () => 'حملة التوعية النفسية'
      },
      {
        id: 'c1_rej_card_1_reason',
        category: 'chord1',
        catLabel: 'الوتر الثاني: فكرة المشروع',
        slideLabel: 'شريحة 1: الأفكار المستبعدة',
        fieldLabel: 'سبب استبعاد الفكرة الأولى',
        chordIdx: 1,
        stepIdx: 0,
        getter: () => (typeof rejectedCardsData !== 'undefined' && rejectedCardsData[0] ? rejectedCardsData[0].reason : 'الجلسات محتاجة ومتخصصين مش إحنا'),
        setter: (v) => {
          if (typeof rejectedCardsData !== 'undefined' && rejectedCardsData[0]) rejectedCardsData[0].reason = v;
          const el = document.getElementById('rej-modal-reason-text');
          if (el) el.textContent = v;
        },
        getDefault: () => 'الجلسات محتاجة ومتخصصين مش إحنا'
      },
      {
        id: 'c1_rej_card_2_title',
        category: 'chord1',
        catLabel: 'الوتر الثاني: فكرة المشروع',
        slideLabel: 'شريحة 1: الأفكار المستبعدة',
        fieldLabel: 'عنوان الفكرة المستبعدة الثانية',
        chordIdx: 1,
        stepIdx: 0,
        getter: () => (typeof rejectedCardsData !== 'undefined' && rejectedCardsData[1] ? rejectedCardsData[1].title : 'رحلات الهايكينج للآخرين'),
        setter: (v) => {
          if (typeof rejectedCardsData !== 'undefined' && rejectedCardsData[1]) rejectedCardsData[1].title = v;
          const el = document.querySelectorAll('.rej-card-title')[1];
          if (el) el.textContent = v;
        },
        getDefault: () => 'رحلات الهايكينج للآخرين'
      },
      {
        id: 'c1_rej_card_2_reason',
        category: 'chord1',
        catLabel: 'الوتر الثاني: فكرة المشروع',
        slideLabel: 'شريحة 1: الأفكار المستبعدة',
        fieldLabel: 'سبب استبعاد الفكرة الثانية',
        chordIdx: 1,
        stepIdx: 0,
        getter: () => (typeof rejectedCardsData !== 'undefined' && rejectedCardsData[1] ? rejectedCardsData[1].reason : 'الرحلات مكنش فيها خدمة ولا أثر حقيقي للأولاد'),
        setter: (v) => {
          if (typeof rejectedCardsData !== 'undefined' && rejectedCardsData[1]) rejectedCardsData[1].reason = v;
        },
        getDefault: () => 'الرحلات مكنش فيها خدمة ولا أثر حقيقي للأولاد'
      },
      {
        id: 'c1_rej_card_3_title',
        category: 'chord1',
        catLabel: 'الوتر الثاني: فكرة المشروع',
        slideLabel: 'شريحة 1: الأفكار المستبعدة',
        fieldLabel: 'عنوان الفكرة المستبعدة الثالثة',
        chordIdx: 1,
        stepIdx: 0,
        getter: () => (typeof rejectedCardsData !== 'undefined' && rejectedCardsData[2] ? rejectedCardsData[2].title : 'فريق الأنشطة الرياضية'),
        setter: (v) => {
          if (typeof rejectedCardsData !== 'undefined' && rejectedCardsData[2]) rejectedCardsData[2].title = v;
          const el = document.querySelectorAll('.rej-card-title')[2];
          if (el) el.textContent = v;
        },
        getDefault: () => 'فريق الأنشطة الرياضية'
      },
      {
        id: 'c1_rej_card_3_reason',
        category: 'chord1',
        catLabel: 'الوتر الثاني: فكرة المشروع',
        slideLabel: 'شريحة 1: الأفكار المستبعدة',
        fieldLabel: 'سبب استبعاد الفكرة الثالثة',
        chordIdx: 1,
        stepIdx: 0,
        getter: () => (typeof rejectedCardsData !== 'undefined' && rejectedCardsData[2] ? rejectedCardsData[2].reason : 'تنظيم الملاعب والألعاب أصلاً شغل قادة المعسكر'),
        setter: (v) => {
          if (typeof rejectedCardsData !== 'undefined' && rejectedCardsData[2]) rejectedCardsData[2].reason = v;
        },
        getDefault: () => 'تنظيم الملاعب والألعاب أصلاً شغل قادة المعسكر'
      },
      {
        id: 'c1_goal_label',
        category: 'chord1',
        catLabel: 'الوتر الثاني: فكرة المشروع',
        slideLabel: 'شريحة 2: الفكرة المعتمدة',
        fieldLabel: 'عنوان شارة الهدف (Goal Label)',
        selector: '.goal-label',
        chordIdx: 1,
        stepIdx: 1,
        getDefault: () => 'الهدف الأساسي'
      },
      {
        id: 'c1_goal_main_text',
        category: 'chord1',
        catLabel: 'الوتر الثاني: فكرة المشروع',
        slideLabel: 'شريحة 2: الفكرة المعتمدة',
        fieldLabel: 'نص الهدف الأساسي للمشروع',
        selector: '.goal-main-text',
        chordIdx: 1,
        stepIdx: 1,
        getDefault: () => '"نمنحهم يومًا استثنائيًّا لا يُنسى"'
      },

      // ── جيتار المسؤوليات والأدوار (الوتر الثاني) ──
      {
        id: 'c1_guitar_ro7y_members',
        category: 'chord1',
        catLabel: 'الوتر الثاني: فكرة المشروع',
        slideLabel: 'شريحة 3: جيتار المسؤوليات',
        fieldLabel: 'مسؤولو الروحي (الأسماء)',
        chordIdx: 1,
        stepIdx: 2,
        getter: () => (typeof guitarStringsData !== 'undefined' && guitarStringsData[0] ? guitarStringsData[0].members.map(m => m.name).join(' , ') : 'جونثان امير , كيرلس مشيل , فيلوباتير عصام'),
        setter: (v) => {
          if (typeof guitarStringsData !== 'undefined' && guitarStringsData[0]) {
            const names = v.split(/[,،]/).map(s => s.trim()).filter(Boolean);
            guitarStringsData[0].members = names.map(n => ({ name: n, role: 'الفقرة الروحية' }));
          }
        },
        getDefault: () => 'جونثان امير , كيرلس مشيل , فيلوباتير عصام'
      },
      {
        id: 'c1_guitar_akhlaqy_members',
        category: 'chord1',
        catLabel: 'الوتر الثاني: فكرة المشروع',
        slideLabel: 'شريحة 3: جيتار المسؤوليات',
        fieldLabel: 'مسؤولو الأخلاقي (الأسماء)',
        chordIdx: 1,
        stepIdx: 2,
        getter: () => (typeof guitarStringsData !== 'undefined' && guitarStringsData[1] ? guitarStringsData[1].members.map(m => m.name).join(', ') : 'مينا كريم, أبرأم نعيم, مايكل هاني, كيرلس سامي'),
        setter: (v) => {
          if (typeof guitarStringsData !== 'undefined' && guitarStringsData[1]) {
            const names = v.split(/[,،]/).map(s => s.trim()).filter(Boolean);
            guitarStringsData[1].members = names.map(n => ({ name: n, role: 'الفقرة الأخلاقية' }));
          }
        },
        getDefault: () => 'مينا كريم, أبرأم نعيم, مايكل هاني, كيرلس سامي'
      },
      {
        id: 'c1_guitar_budget_members',
        category: 'chord1',
        catLabel: 'الوتر الثاني: فكرة المشروع',
        slideLabel: 'شريحة 3: جيتار المسؤوليات',
        fieldLabel: 'مسؤولو الميزانية (الأسماء)',
        chordIdx: 1,
        stepIdx: 2,
        getter: () => (typeof guitarStringsData !== 'undefined' && guitarStringsData[2] ? guitarStringsData[2].members.map(m => m.name).join(', ') : 'جون ماجد, ابرام مدحت'),
        setter: (v) => {
          if (typeof guitarStringsData !== 'undefined' && guitarStringsData[2]) {
            const names = v.split(/[,،]/).map(s => s.trim()).filter(Boolean);
            guitarStringsData[2].members = names.map(n => ({ name: n, role: 'الميزانية والحسابات' }));
          }
        },
        getDefault: () => 'جون ماجد, ابرام مدحت'
      },
      {
        id: 'c1_guitar_logistics_members',
        category: 'chord1',
        catLabel: 'الوتر الثاني: فكرة المشروع',
        slideLabel: 'شريحة 3: جيتار المسؤوليات',
        fieldLabel: 'مسؤولو اللوجيستيات (الأسماء)',
        chordIdx: 1,
        stepIdx: 2,
        getter: () => (typeof guitarStringsData !== 'undefined' && guitarStringsData[3] ? guitarStringsData[3].members.map(m => m.name).join(', ') : 'توماس تامر, حنا رفعت'),
        setter: (v) => {
          if (typeof guitarStringsData !== 'undefined' && guitarStringsData[3]) {
            const names = v.split(/[,،]/).map(s => s.trim()).filter(Boolean);
            guitarStringsData[3].members = names.map(n => ({ name: n, role: 'اللوجيستيات والتجهيز' }));
          }
        },
        getDefault: () => 'توماس تامر, حنا رفعت'
      },
      {
        id: 'c1_guitar_games_members',
        category: 'chord1',
        catLabel: 'الوتر الثاني: فكرة المشروع',
        slideLabel: 'شريحة 3: جيتار المسؤوليات',
        fieldLabel: 'مسؤولو الألعاب (الأسماء)',
        chordIdx: 1,
        stepIdx: 2,
        getter: () => (typeof guitarStringsData !== 'undefined' && guitarStringsData[4] ? guitarStringsData[4].members.map(m => m.name).join(', ') : 'حنا رفعت, ابرام مدحت, فيلوباتير عصام, ابرام نعيم, كيرلس سامي'),
        setter: (v) => {
          if (typeof guitarStringsData !== 'undefined' && guitarStringsData[4]) {
            const names = v.split(/[,،]/).map(s => s.trim()).filter(Boolean);
            guitarStringsData[4].members = names.map(n => ({ name: n, role: 'الألعاب والمسابقات' }));
          }
        },
        getDefault: () => 'حنا رفعت, ابرام مدحت, فيلوباتير عصام, ابرام نعيم, كيرلس سامي'
      },
      {
        id: 'c1_guitar_day1_members',
        category: 'chord1',
        catLabel: 'الوتر الثاني: فكرة المشروع',
        slideLabel: 'شريحة 3: جيتار المسؤوليات',
        fieldLabel: 'قادة اليوم الأول (الأسماء)',
        chordIdx: 1,
        stepIdx: 2,
        getter: () => (typeof guitarStringsData !== 'undefined' && guitarStringsData[5] ? guitarStringsData[5].members.map(m => m.name).join(' , ') : 'جون ماجد , جونثان امير'),
        setter: (v) => {
          if (typeof guitarStringsData !== 'undefined' && guitarStringsData[5]) {
            const names = v.split(/[,،]/).map(s => s.trim()).filter(Boolean);
            guitarStringsData[5].members = names.map(n => ({ name: n, role: 'قائد اليوم الأول' }));
          }
        },
        getDefault: () => 'جون ماجد , جونثان امير'
      },
      {
        id: 'c1_guitar_day2_members',
        category: 'chord1',
        catLabel: 'الوتر الثاني: فكرة المشروع',
        slideLabel: 'شريحة 3: جيتار المسؤوليات',
        fieldLabel: 'قادة اليوم الثاني (الأسماء)',
        chordIdx: 1,
        stepIdx: 2,
        getter: () => (typeof guitarStringsData !== 'undefined' && guitarStringsData[6] ? guitarStringsData[6].members.map(m => m.name).join(', ') : 'حنا رفعت, توماس تامر'),
        setter: (v) => {
          if (typeof guitarStringsData !== 'undefined' && guitarStringsData[6]) {
            const names = v.split(/[,،]/).map(s => s.trim()).filter(Boolean);
            guitarStringsData[6].members = names.map(n => ({ name: n, role: 'قائد اليوم الثاني' }));
          }
        },
        getDefault: () => 'حنا رفعت, توماس تامر'
      },
      {
        id: 'c1_guitar_crafts_members',
        category: 'chord1',
        catLabel: 'الوتر الثاني: فكرة المشروع',
        slideLabel: 'شريحة 3: جيتار المسؤوليات',
        fieldLabel: 'مسؤولو الكرافتس والأشغال (الأسماء)',
        chordIdx: 1,
        stepIdx: 2,
        getter: () => (typeof guitarStringsData !== 'undefined' && guitarStringsData[7] ? guitarStringsData[7].members.map(m => m.name).join(' , ') : 'جون ماجد , ابرام مدحت, مينا سامح, كيرلس سامي'),
        setter: (v) => {
          if (typeof guitarStringsData !== 'undefined' && guitarStringsData[7]) {
            const names = v.split(/[,،]/).map(s => s.trim()).filter(Boolean);
            guitarStringsData[7].members = names.map(n => ({ name: n, role: 'الأشغال والكرافتس' }));
          }
        },
        getDefault: () => 'جون ماجد , ابرام مدحت, مينا سامح, كيرلس سامي'
      },

      // ── النوافذ المنبثقة والختام ──
      {
        id: 'modals_outro_title',
        category: 'modals',
        catLabel: 'النوافذ والختام',
        slideLabel: 'إسدال الستار وشكر وتقدير',
        fieldLabel: 'العنوان الرئيسي للختام',
        selector: '.playbill-main-title',
        getDefault: () => 'شُكْرٌ وَتَقْدِيرٌ وَاجِبْ'
      },
      {
        id: 'modals_outro_letter',
        category: 'modals',
        catLabel: 'النوافذ والختام',
        slideLabel: 'إسدال الستار وشكر وتقدير',
        fieldLabel: 'رسالة الشكر والعرفان',
        selector: '.playbill-paragraph',
        getDefault: () => 'بكل آيات المحبة والعرفان، تتقدم عشيرة جوالة رهط الوتر بخالص الشكر وعميق الامتنان لكل من وضع بصمة حب، وكان سنداً وشريكاً حقيقياً ومصدر تشجيع لا ينقطع في سبيل إنجاح أيام هذه الخدمة المباركة ورسم البسمة على وجوه أولاد كنيستي العذراء بالسلام والبطحة:'
      },
      {
        id: 'modals_outro_quote',
        category: 'modals',
        catLabel: 'النوافذ والختام',
        slideLabel: 'إسدال الستار وشكر وتقدير',
        fieldLabel: 'المقولة الختامية',
        selector: '.closing-quote',
        getDefault: () => '« كُنْتُمْ سَبَباً فِي بَسْمَةٍ لا تُنْسَى.. دُمْتُمْ دَوْماً أَهْلاً لِلْعَطَاءِ وَالْخِدْمَةِ »'
      }
    ];

    // Helper: read current value for a registry entry
    function getCmItemValue(item) {
      if (item.getter) return item.getter();
      if (item.selector) {
        const el = document.querySelector(item.selector);
        if (el) return el.textContent.trim();
      }
      return item.getDefault ? item.getDefault() : '';
    }

    // Helper: set value for a registry entry
    function setCmItemValue(item, newVal) {
      if (item.setter) {
        item.setter(newVal);
      } else if (item.selector) {
        const el = document.querySelector(item.selector);
        if (el) {
          el.textContent = newVal;
        }
      }
    }

    // Open Content Manager Modal
    function openContentManagerModal() {
      const overlay = document.getElementById('content-manager-overlay');
      if (!overlay) return;
      isContentManagerOpen = true;
      overlay.style.display = 'flex';
      renderContentManagerItems();
      const input = document.getElementById('cm-search-input');
      if (input) {
        setTimeout(() => input.focus(), 80);
      }
    }

    // Close Content Manager Modal
    function closeContentManagerModal() {
      const overlay = document.getElementById('content-manager-overlay');
      if (!overlay) return;
      isContentManagerOpen = false;
      overlay.style.display = 'none';
    }

    // Toggle Content Manager Modal
    function toggleContentManagerModal() {
      if (isContentManagerOpen) {
        closeContentManagerModal();
      } else {
        openContentManagerModal();
      }
    }

    function handleContentOverlayClick(e) {
      if (e.target.id === 'content-manager-overlay') {
        closeContentManagerModal();
      }
    }

    // Set Active Category Filter
    function setCategoryFilter(cat) {
      cmCurrentCategory = cat;
      const tabs = document.querySelectorAll('.cm-tab');
      tabs.forEach(tab => {
        if (tab.getAttribute('data-cat') === cat) {
          tab.classList.add('active');
        } else {
          tab.classList.remove('active');
        }
      });
      filterContentManagerItems();
    }

    // Clear Search Bar
    function clearContentSearch() {
      const input = document.getElementById('cm-search-input');
      if (input) {
        input.value = '';
        input.focus();
      }
      filterContentManagerItems();
    }

    // Render Items into DOM
    function renderContentManagerItems() {
      const container = document.getElementById('cm-items-container');
      const countAllBadge = document.getElementById('cm-count-all');
      if (!container) return;

      if (countAllBadge) {
        countAllBadge.textContent = CM_REGISTRY.length;
      }

      container.innerHTML = '';

      CM_REGISTRY.forEach(item => {
        const currentVal = getCmItemValue(item);
        const defaultVal = item.getDefault ? item.getDefault() : '';
        const isModified = cmSavedEdits[item.id] !== undefined || (defaultVal && currentVal !== defaultVal);

        const card = document.createElement('div');
        card.className = 'cm-item-card' + (isModified ? ' is-dirty' : '');
        card.setAttribute('data-id', item.id);
        card.setAttribute('data-cat', item.category);

        let jumpBtnHtml = '';
        if (typeof item.chordIdx !== 'undefined' && item.chordIdx !== null) {
          jumpBtnHtml = `
            <button class="cm-action-icon-btn" onclick="jumpToSlideForText(${item.chordIdx}, ${item.stepIdx || 0})" title="الانتقال الفوري لهذه الشريحة في العرض">
              <span>👁️ معاينة الشريحة</span>
            </button>
          `;
        }

        card.innerHTML = `
          <div class="cm-item-card-top">
            <div class="cm-item-badges">
              <span class="cm-pill-cat">${item.catLabel}</span>
              <span class="cm-pill-slide">${item.slideLabel}</span>
              <span class="cm-item-field-title">${item.fieldLabel}</span>
            </div>
            <div class="cm-item-actions">
              ${jumpBtnHtml}
              <button class="cm-action-icon-btn" onclick="revertContentItem('${item.id}')" title="استعادة النص الأصلي لهذا الحقل">
                <span>↩ استعادة الأصل</span>
              </button>
            </div>
          </div>
          <div class="cm-item-editor-wrap">
            <textarea class="cm-textarea" id="cm_field_${item.id}" rows="2" placeholder="اكتب النص هنا...">${escapeHtml(currentVal)}</textarea>
            ${defaultVal && defaultVal !== currentVal ? `<div class="cm-original-hint"><span>الأصل:</span> <em>${escapeHtml(defaultVal)}</em></div>` : ''}
          </div>
        `;

        const textarea = card.querySelector('textarea');
        if (textarea) {
          textarea.addEventListener('input', () => {
            card.classList.add('is-dirty');
            const newVal = textarea.value.trim();
            setCmItemValue(item, newVal);
            cmSavedEdits[item.id] = newVal;
            try {
              localStorage.setItem('raht_presentation_custom_edits_v2', JSON.stringify(cmSavedEdits));
            } catch (e) { }
          });
        }

        container.appendChild(card);
      });

      filterContentManagerItems();
    }

    // Live Search & Category Filter
    function filterContentManagerItems() {
      const searchInput = document.getElementById('cm-search-input');
      const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      const cards = document.querySelectorAll('.cm-item-card');

      let visibleCount = 0;
      cards.forEach(card => {
        const cat = card.getAttribute('data-cat');
        const textContent = card.textContent.toLowerCase();
        const textarea = card.querySelector('textarea');
        const val = textarea ? textarea.value.toLowerCase() : '';

        const matchesCat = (cmCurrentCategory === 'all' || cat === cmCurrentCategory);
        const matchesQuery = !query || textContent.includes(query) || val.includes(query);

        if (matchesCat && matchesQuery) {
          card.style.display = 'flex';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      const status = document.getElementById('cm-status-text');
      if (status) {
        status.innerHTML = `عرض <strong>${visibleCount}</strong> من أصل <strong>${cards.length}</strong> نصاً في العرض. اختصار الفتح والإغلاق: <kbd>F2</kbd> أو <kbd>Alt + E</kbd>`;
      }
    }

    // Save All Edits to DOM, JS state, and localStorage
    function saveAllContentEdits() {
      const edits = {};
      CM_REGISTRY.forEach(item => {
        const textarea = document.getElementById('cm_field_' + item.id);
        if (textarea) {
          const newVal = textarea.value.trim();
          setCmItemValue(item, newVal);
          edits[item.id] = newVal;
        }
      });

      cmSavedEdits = edits;
      try {
        localStorage.setItem('raht_presentation_custom_edits_v2', JSON.stringify(edits));
      } catch (e) {
        console.error('Error saving edits to localStorage:', e);
      }

      showCmToast('💾 تم حفظ وتطبيق كافة التعديلات بنجاح في العرض والمتصفح!');
    }

    // Revert a Single Item
    function revertContentItem(itemId) {
      const item = CM_REGISTRY.find(i => i.id === itemId);
      if (!item) return;

      const defaultVal = item.getDefault ? item.getDefault() : '';
      const textarea = document.getElementById('cm_field_' + itemId);
      if (textarea) {
        textarea.value = defaultVal;
      }
      setCmItemValue(item, defaultVal);

      delete cmSavedEdits[itemId];
      try {
        localStorage.setItem('raht_presentation_custom_edits_v2', JSON.stringify(cmSavedEdits));
      } catch (e) { }

      const card = document.querySelector(`.cm-item-card[data-id="${itemId}"]`);
      if (card) card.classList.remove('is-dirty');

      showCmToast('↩ تم استعادة النص الأصلي لهذا الحقل!');
    }

    // Reset All Content Edits
    function resetAllContentEdits() {
      if (!confirm('هل تريد بالتأكيد إلغاء كافة التعديلات واستعادة النصوص الأصلية لجميع الشرائح؟')) return;

      CM_REGISTRY.forEach(item => {
        const defaultVal = item.getDefault ? item.getDefault() : '';
        setCmItemValue(item, defaultVal);
        const textarea = document.getElementById('cm_field_' + item.id);
        if (textarea) textarea.value = defaultVal;
      });

      cmSavedEdits = {};
      try {
        localStorage.removeItem('raht_presentation_custom_edits_v2');
      } catch (e) { }

      const cards = document.querySelectorAll('.cm-item-card');
      cards.forEach(c => c.classList.remove('is-dirty'));

      showCmToast('🔄 تم استعادة كافة النصوص الأصلية للعرض بالكامل!');
    }

    // Jump to Slide behind Modal
    function jumpToSlideForText(chordIdx, stepIdx) {
      if (typeof openPage === 'function') {
        openPage(chordIdx);
      }
      if (typeof goToPptStep === 'function') {
        setTimeout(() => {
          goToPptStep(stepIdx, false);
        }, 150);
      }
      showCmToast('👁️ تم الانتقال للشريحة المطلوبة في الخلفية لمعاينتها!');
    }

    // Copy Edits as JSON to Clipboard
    function copyContentEditsJson() {
      const data = {};
      CM_REGISTRY.forEach(item => {
        const textarea = document.getElementById('cm_field_' + item.id);
        const val = textarea ? textarea.value.trim() : getCmItemValue(item);
        data[item.id] = val;
      });

      const jsonStr = JSON.stringify(data, null, 2);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(jsonStr).then(() => {
          showCmToast('📋 تم نسخ ملف التعديلات JSON إلى الحافظة! يمكنك لصقه في الشات.');
        }).catch(() => {
          prompt('انسخ نص التعديلات التالي:', jsonStr);
        });
      } else {
        prompt('انسخ نص التعديلات التالي:', jsonStr);
      }
    }

    // Download Edits as JSON File
    function downloadContentEditsJson() {
      const data = {};
      CM_REGISTRY.forEach(item => {
        const textarea = document.getElementById('cm_field_' + item.id);
        const val = textarea ? textarea.value.trim() : getCmItemValue(item);
        data[item.id] = val;
      });

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'raht_presentation_texts_edits.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showCmToast('📥 تم تنزيل ملف التعديلات (JSON) بنجاح!');
    }

    // Restore All Edits on Startup
    function restoreAllContentEdits() {
      try {
        const saved = localStorage.getItem('raht_presentation_custom_edits_v2');
        if (!saved) return;
        cmSavedEdits = JSON.parse(saved);
        CM_REGISTRY.forEach(item => {
          if (cmSavedEdits[item.id] !== undefined) {
            setCmItemValue(item, cmSavedEdits[item.id]);
          }
        });
      } catch (e) {
        console.error('Error restoring content edits:', e);
      }
    }

    // Sleek Toast Notification
    function showCmToast(msg) {
      let toast = document.getElementById('cm-toast-notification');
      if (!toast) return;
      const msgSpan = document.getElementById('cm-toast-msg');
      if (msgSpan) msgSpan.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 3200);
    }

    // Helper: Escape HTML
    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    // Initialize Content Manager on DOMContentLoaded
    window.addEventListener('DOMContentLoaded', () => {
      restoreAllContentEdits();
    });

