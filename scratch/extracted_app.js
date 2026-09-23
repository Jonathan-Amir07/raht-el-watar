
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
      { x1: 230, y1: 87, x2: 238, y2: 500 }, // String 0
      { x1: 295, y1: 101, x2: 304, y2: 466 }, // String 1
      { x1: 362, y1: 118, x2: 368, y2: 432 }, // String 2
      { x1: 430, y1: 141, x2: 432, y2: 397 }, // String 3
      { x1: 496, y1: 167, x2: 494, y2: 362 }, // String 4
      { x1: 560, y1: 197, x2: 555, y2: 326 }  // String 5
    ];

    const activeAnimations = {};

    function animateVectorString(idx, pathEl, glowEl, amp = 14, decay = 3.0, freq = 200) {
      if (activeAnimations[idx]) {
        cancelAnimationFrame(activeAnimations[idx]);
      }

      const coords = stringCoords[idx];
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
        const d = `M ${coords.x1},${coords.y1} L ${coords.x2},${coords.y2}`;
        pathEl.setAttribute('d', d);
        if (glowEl) glowEl.setAttribute('d', d);
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
      if (!hud) return;

      if (activePage === null) {
        hud.style.display = 'none';
        return;
      }

      hud.style.display = 'flex';
      const nameEl = document.getElementById('universal-ppt-chord-name');
      const badgeEl = document.getElementById('universal-ppt-step-badge');
      const prevBtn = document.getElementById('universal-ppt-prev');
      const nextBtn = document.getElementById('universal-ppt-next');

      let chordTitle = '';
      let curStep = 0;
      let totalSteps = 1;

      if (activePage === 0) {
        chordTitle = 'الوتر الأول: من نحن؟';
        curStep = currentPptStep + 1;
        totalSteps = 8;
        if (prevBtn) prevBtn.disabled = (currentPptStep === 0);
        if (nextBtn) nextBtn.disabled = false;
      } else if (activePage === 1) {
        chordTitle = 'الوتر الثاني: المشروع';
        curStep = currentProjStep + 1;
        totalSteps = 2;
        if (prevBtn) prevBtn.disabled = false;
        if (nextBtn) nextBtn.disabled = false;
      } else if (activePage === 2) {
        let chordTitle = 'الوتر الثالث: التحضيرات';
        if (currentSp2PptStep >= 5 && currentSp2PptStep <= 10) {
          chordTitle = 'الوتر الثالث: ميزانية اليوم الأول';
        } else if (currentSp2PptStep >= 11 && currentSp2PptStep <= 16) {
          chordTitle = 'الوتر الثالث: ميزانية اليوم الثاني';
        }
        curStep = currentSp2PptStep + 1;
        totalSteps = 17;
        const b2 = document.getElementById('ppt-counter-badge-2');
        if (b2) b2.textContent = `${toArabicNum(curStep)} / ١٧`;
        if (prevBtn) prevBtn.disabled = false;
        if (nextBtn) nextBtn.disabled = false;
      } else if (activePage === 3) {
        chordTitle = 'الوتر الرابع: التحديات';
        curStep = currentChallengeStep + 1;
        totalSteps = 6;
        if (prevBtn) prevBtn.disabled = false;
        if (nextBtn) nextBtn.disabled = false;
      } else if (activePage === 4) {
        const totalDayLevels = (typeof currentSp4MapDay !== 'undefined' && currentSp4MapDay === 2) ? 7 : 6;
        chordTitle = (typeof currentSp4MapDay !== 'undefined' && currentSp4MapDay === 2)
          ? 'الوتر الخامس: يوم التنفيذ (اليوم الثاني)'
          : 'الوتر الخامس: يوم التنفيذ (اليوم الأول)';
        curStep = currentSp4DayLevelIdx;
        totalSteps = totalDayLevels;
        if (prevBtn) prevBtn.disabled = false;
        if (nextBtn) nextBtn.disabled = false;
      } else if (activePage === 5) {
        chordTitle = 'الوتر السادس: الدروس والمستقبل';
        curStep = currentSp5SlideIdx;
        totalSteps = 4;
        if (prevBtn) prevBtn.disabled = false;
        if (nextBtn) nextBtn.disabled = false;
      }

      if (nameEl) nameEl.textContent = chordTitle;
      if (badgeEl) badgeEl.textContent = `${toArabicNum(curStep)} / ${toArabicNum(totalSteps)}`;
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
        initSp2GameMap();
        goToSp2PptStep(startStep, false);
      } else if (idx === 3) {
        goToChallengeStep(startStep, false);
      } else if (idx === 4) {
        goToSp4PptStep(startStep, false);
      } else if (idx === 5) {
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
      closeCinematicZoom();
      closeDaySectionModal();
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
      if (targetIdx < 0 || targetIdx > 5) {
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
          if (currentPptStep < 7) {
            goToPptStep(currentPptStep + 1, true);
          } else {
            stepToNextChord(1, 0);
          }
        } else {
          if (currentPptStep > 0) {
            goToPptStep(currentPptStep - 1, true);
          } else {
            closePage();
          }
        }
      } else if (activePage === 1) {
        if (direction > 0) {
          if (currentProjStep < 1) {
            goToProjStep(currentProjStep + 1);
          } else {
            stepToNextChord(2, 0);
          }
        } else {
          if (currentProjStep > 0) {
            goToProjStep(currentProjStep - 1);
          } else {
            stepToNextChord(0, 7);
          }
        }
      } else if (activePage === 2) {
        if (direction > 0) {
          if (currentSp2PptStep < 16) {
            goToSp2PptStep(currentSp2PptStep + 1, true);
          } else {
            stepToNextChord(3, 0);
          }
        } else {
          if (currentSp2PptStep > 0) {
            goToSp2PptStep(currentSp2PptStep - 1, true);
          } else {
            stepToNextChord(1, 1);
          }
        }
      } else if (activePage === 3) {
        if (direction > 0) {
          if (currentChallengeStep < 5) {
            goToChallengeStep(currentChallengeStep + 1, true);
          } else {
            stepToNextChord(4, 0);
          }
        } else {
          if (currentChallengeStep > 0) {
            goToChallengeStep(currentChallengeStep - 1, true);
          } else {
            stepToNextChord(2, 16);
          }
        }
      } else if (activePage === 4) {
        const maxLvl = (currentSp4MapDay === 1) ? 6 : 7;
        if (direction > 0) {
          if (currentSp4DayLevelIdx < maxLvl) {
            selectSp4DayLevel(currentSp4DayLevelIdx + 1, true);
          } else if (currentSp4MapDay === 1) {
            switchSp4MapDay(2);
            selectSp4DayLevel(1, true);
          } else {
            stepToNextChord(5, 0);
          }
        } else {
          if (currentSp4DayLevelIdx > 1) {
            selectSp4DayLevel(currentSp4DayLevelIdx - 1, true);
          } else if (currentSp4MapDay === 2) {
            switchSp4MapDay(1);
            selectSp4DayLevel(6, true);
          } else {
            stepToNextChord(3, 5);
          }
        }
      } else if (activePage === 5) {
        if (direction > 0) {
          if (currentSp5SlideIdx < 4) {
            goToSp5Slide(currentSp5SlideIdx + 1, true);
          } else {
            celebratePresentationCompletion();
          }
        } else {
          if (currentSp5SlideIdx > 1) {
            goToSp5Slide(currentSp5SlideIdx - 1, true);
          } else {
            stepToNextChord(4, 7);
          }
        }
      }
    }

    // ESC key to return & Space / Arrow keys for presentation sequence
    document.addEventListener('keydown', e => {
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

      // 1. Lightbox check
      const lb = document.getElementById('cinematic-lightbox');
      if (lb && lb.classList.contains('open')) {
        if (e.key === 'Escape' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === ' ') {
          e.preventDefault();
          closeCinematicZoom();
          return;
        }
      }

      // 2. Escape key
      if (e.key === 'Escape') {
        const finaleBanner = document.getElementById('presentation-finale-banner');
        if (finaleBanner && finaleBanner.style.display !== 'none') {
          e.preventDefault();
          returnToHarpFinale();
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
    <span class="lightbox-hint">اضغط في أي مكان أو زر Esc للعودة للعرض</span>
  `;

      lightbox.classList.add('open');
    }

    function closeCinematicZoom() {
      const lightbox = document.getElementById('cinematic-lightbox');
      if (lightbox) {
        lightbox.classList.remove('open');
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

    // ── 10. Chord 1 (The Project) Seamless PPT Presentation (3 Steps) ──
    let currentProjStep = 0; // 0: Rejected Projects, 1: Approved Idea & Goal, 2: Two Churches Showcase (Day 1: كنيسة السلام & Day 2: كنيسة البطحة)

    function updateProjPresentation() {
      updateUniversalHud();
      const counterEl = document.getElementById('ppt-counter-badge-1');
      if (counterEl) {
        const arabicNums = ['١', '٢', '٣'];
        counterEl.textContent = `${arabicNums[currentProjStep] || (currentProjStep + 1)} / ٣`;
      }

      const prevBtn = document.getElementById('ppt-prev-btn-1');
      const nextBtn = document.getElementById('ppt-next-btn-1');
      if (prevBtn) prevBtn.disabled = (currentProjStep === 0);
      if (nextBtn) nextBtn.disabled = false; // Always enabled (on step 2 it steps into next chord)

      // Update slides in Chord 2
      document.querySelectorAll('#presentation-stage-1 .stage-slide').forEach((slide, idx) => {
        slide.classList.toggle('active', idx === currentProjStep);
      });
    }

    function goToProjStep(step) {
      if (step < 0 || step > 2) return;
      currentProjStep = step;
      updateProjPresentation();
    }

    function nextProjStep() {
      if (currentProjStep < 2) {
        goToProjStep(currentProjStep + 1);
      } else {
        // End of chord 2 (scene 3): seamlessly transition into chord 3 (التحديات - index 2)
        stepToNextChord(2);
      }
    }

    function prevProjStep() {
      if (currentProjStep > 0) {
        goToProjStep(currentProjStep - 1);
      }
    }



    // ── 11. Chord 3 (Challenges) Sequential Presentation (Steps 0 to 5) ──
    let currentChallengeStep = 0;

    function updateChallengePresentation(playAudio = false) {
      const c1 = document.getElementById('ch-card-1');
      const c2 = document.getElementById('ch-card-2');
      const c3 = document.getElementById('ch-card-3');
      const c4 = document.getElementById('ch-card-4');
      const c5 = document.getElementById('ch-card-5');
      const allCards = [c1, c2, c3, c4, c5];
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
      } else if (currentChallengeStep >= 1 && currentChallengeStep <= 5) {
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
        const freqs = [261.63, 293.66, 329.63, 392.00, 440.00];
        if (playAudio) pluckHarpString(freqs[currentChallengeStep - 1], 0.7);
      }

      // Update pills active state
      for (let i = 0; i <= 5; i++) {
        const pill = document.getElementById('ch-pill-' + i);
        if (pill) pill.classList.toggle('active', i === currentChallengeStep);
      }

      // Update counter badge
      const counter = document.getElementById('ppt-counter-badge-3');
      if (counter) {
        const arabicNums = ['١', '٢', '٣', '٤', '٥', '٦'];
        counter.textContent = `${arabicNums[currentChallengeStep]} / ٦`;
      }

      updateUniversalHud();
    }

    function goToChallengeStep(step, playAudio = true) {
      if (step < 0 || step > 5) return;
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
        title: "الافتتاح الصباحي ووجبة الإفطار",
        en: "Opening and Breakfast",
        desc: "طابور الافتتاح الكشفي الصباحي وتحية العلم مع صيحات وترانيم ترحيبية، وتوزيع وجبة إفطار صحية متكاملة لمد الأطفال بالطاقة والنشاط اللازم لليوم الحافل.",
        img: "assets/opening day 1.jpg",
        caption: "طابور الافتتاح الكشفي وتحية العلم وتناول وجبة الإفطار واستقبال أطفال كنيسة السلام"
      },
      {
        time: "10:00 - 12:00",
        dur: "ساعتان",
        title: "ألعاب ومسابقات صباحية",
        en: "Games 1",
        desc: "محطات ألعاب كشفية متتابعة، منافسات تلي ماتش حركية، سباقات حواجز، ومسابقات تنافسية بين الطلائع لبث روح التحدي الإيجابي.",
        img: "assets/games day 1.jpg",
        caption: "ألعاب ومسابقات اليوم الأول الكشفية والمنافسات الحركية المبهجة"
      },
      {
        time: "12:00 - 01:30",
        dur: "ساعة ونصف",
        title: "الجلسات التربوية والروحية",
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
    let currentGmLevel = 1;
    let currentGmCategory = 'villas';
    let currentGmCategoryDay = 1;
    let currentGmEventsDay = 1;
    let currentGmEventTab = 'spiritual';
    let currentGmBudgetDay = 1;
    let currentGmBudgetSlice = 0;

    const gmLevelData = {
      1: {
        badge: 'المستوى ١ من ٤',
        title: 'الجلسات التعليمية وإعداد القادة',
        chord: [196.00, 246.94, 293.66, 392.00]
      },
      2: {
        badge: 'المستوى ٢ من ٤',
        title: 'جمع البيانات والتخطيط الميداني',
        chord: [220.00, 261.63, 329.63, 440.00]
      },
      3: {
        badge: 'المستوى ٣ من ٤',
        title: 'تصميم فقرات وبرنامج اليوم',
        chord: [261.63, 329.63, 392.00, 523.25]
      },
      4: {
        badge: 'المستوى ٤ من ٤',
        title: 'تحليل الميزانية وتوزيع النفقات',
        chord: [196.00, 293.66, 392.00, 493.88, 587.33]
      }
    };

    function initSp2GameMap() {
      // By default open on FULL MAP view (drawer closed)
      const vp = document.getElementById('gm-viewport');
      if (vp) {
        vp.classList.remove('drawer-open');
        updateDrawerToggleBtn(false);
      }
      selectGameLevel(currentGmLevel, false, false);
      renderBudgetPieChart(currentGmBudgetDay);
      renderEventDetailContent();
    }

    function selectGameLevel(levelIdx, playAudio = true, openDrawer = true) {
      if (levelIdx < 1 || levelIdx > 4) return;
      currentGmLevel = levelIdx;
      if (levelIdx === 1) currentSp2PptStep = 0;
      else if (levelIdx === 2) currentSp2PptStep = 1;
      else if (levelIdx === 3) currentSp2PptStep = 2;
      else if (levelIdx === 4) currentSp2PptStep = 5;
      updateUniversalHud();

      // Update Node active classes
      for (let i = 1; i <= 4; i++) {
        const node = document.getElementById(`gm-node-${i}`);
        if (node) {
          node.classList.toggle('active', i === levelIdx);
        }
      }

      // Move Pin indicator to active node
      const pin = document.getElementById('gm-pin-indicator');
      const activeNode = document.getElementById(`gm-node-${levelIdx}`);
      if (pin && activeNode) {
        activeNode.appendChild(pin);
      }

      // Update Drawer Header
      const badge = document.getElementById('gm-header-level-badge');
      const title = document.getElementById('gm-header-title');
      if (badge && gmLevelData[levelIdx]) badge.textContent = gmLevelData[levelIdx].badge;
      if (title && gmLevelData[levelIdx]) title.textContent = gmLevelData[levelIdx].title;

      // Switch Panes
      for (let i = 1; i <= 4; i++) {
        const pane = document.getElementById(`gm-pane-${i}`);
        if (pane) {
          pane.classList.toggle('active', i === levelIdx);
        }
      }

      // Open drawer only if requested
      const vp = document.getElementById('gm-viewport');
      if (openDrawer && vp && !vp.classList.contains('drawer-open')) {
        vp.classList.add('drawer-open');
        updateDrawerToggleBtn(true);
      }

      // Update Nav Buttons
      const prevBtn = document.getElementById('gm-prev-btn');
      const nextBtn = document.getElementById('gm-next-btn');
      if (prevBtn) prevBtn.style.opacity = levelIdx === 1 ? '0.45' : '1';
      if (nextBtn) nextBtn.style.opacity = levelIdx === 4 ? '0.45' : '1';

      // Specific initializers for level 3 & 4
      if (levelIdx === 3) {
        renderEventDetailContent();
      } else if (levelIdx === 4) {
        renderBudgetPieChart(currentGmBudgetDay);
      }

      // Play Sound
      if (playAudio && gmLevelData[levelIdx]) {
        playGameLevelAudio(levelIdx);
      }
    }

    function navigateGameLevel(dir) {
      let target = currentGmLevel + dir;
      if (target >= 1 && target <= 4) {
        selectGameLevel(target, true);
      }
    }

    function toggleGameMapDrawer() {
      const vp = document.getElementById('gm-viewport');
      if (!vp) return;
      const isOpen = vp.classList.toggle('drawer-open');
      updateDrawerToggleBtn(isOpen);
      pluckHarpString(329.63, 0.35);
    }

    function updateDrawerToggleBtn(isOpen) {
      const toggleText = document.getElementById('gm-toggle-text');
      const toggleIcon = document.getElementById('gm-toggle-icon');
      if (toggleText) {
        toggleText.textContent = isOpen ? 'عرض الخريطة كاملة' : 'عرض تفاصيل المرحلة';
      }
      if (toggleIcon) {
        toggleIcon.innerHTML = isOpen ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>' : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>';
      }
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
          <div class="gm-event-photo-thumb" onclick="openCinematicZoom('${media.src}', '${media.title}', '${media.tag}', '${descText}')" title="انقر للتكبير">
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
        totalNum: '٢٠,٠٠٠',
        totalNumRaw: 20000,
        items: [
          {
            name: 'إيجار الفيلا والمكان',
            amount: '٧,٠٠٠ ج.م',
            percent: '٣٥%',
            val: 35,
            color: '#3a86ff',
            desc: 'إيجار الفيلا بالكامل بكل مرافقها وملاعبها ومسبحها لليوم كله.'
          },
          {
            name: 'الوجبات والتغذية (فطار وغداء)',
            amount: '٥,٦٠٠ ج.م',
            percent: '٢٨%',
            val: 28,
            color: '#00b4d8',
            desc: 'وجبات فطار وغداء فراخ ورز وسناكس ومياه مثلجة وعصائر طول اليوم.'
          },
          {
            name: 'الألعاب الكبرى والزحاليق الهوائية',
            amount: '٣,٦٠٠ ج.م',
            percent: '١٨%',
            val: 18,
            color: '#ffd166',
            desc: 'إيجار الزحليقة المائية والترامبولين مع التركيب وتأمين الفني.'
          },
          {
            name: 'الجوائز وتذكارات الأطفال',
            amount: '٢,٠٠٠ ج.م',
            percent: '١٠%',
            val: 10,
            color: '#06d6a0',
            desc: 'هدايا وميداليات تشجيعية وألوان عشان كل طفل يخرج فرحان.'
          },
          {
            name: 'النقل وباصات التحرك',
            amount: '١,٠٠٠ ج.م',
            percent: '٥%',
            val: 5,
            color: '#f72585',
            desc: 'باصات مكيفة نقلت الأولاد والخدام للمكان ورجعتهم بأمان.'
          },
          {
            name: 'الطوارئ والخامات الفنية',
            amount: '٨٠٠ ج.م',
            percent: '٤%',
            val: 4,
            color: '#b5179e',
            desc: 'إسعافات أولية وخامات ورق للمسابقات وبطاريات وأجهزة صوت.'
          }
        ]
      },
      2: {
        totalNum: '٢٠,٠٠٠',
        totalNumRaw: 20000,
        items: [
          {
            name: 'إيجار المقر والملاعب',
            amount: '٦,٤٠٠ ج.م',
            percent: '٣٢%',
            val: 32,
            color: '#3a86ff',
            desc: 'تجهيز ملاعب وقاعات الكنيسة وأجهزة الصوت والإضاءة.'
          },
          {
            name: 'الوجبات والأغذية الصيامية',
            amount: '٥,٢٠٠ ج.م',
            percent: '٢٦%',
            val: 26,
            color: '#00b4d8',
            desc: 'فطار صيام ووجبات كشري وسناكس وفاكهة وعصائر فريش للأولاد.'
          },
          {
            name: 'الألعاب الكبرى والترامبولين',
            amount: '٤,٠٠٠ ج.م',
            percent: '٢٠%',
            val: 20,
            color: '#ffd166',
            desc: 'ترامبولين وألعاب تيليب ماتش ومسابقات مائية وبالونات في الملعب.'
          },
          {
            name: 'الهدايا والجوائز التشجيعية',
            amount: '٢,٢٠٠ ج.م',
            percent: '١١%',
            val: 11,
            color: '#06d6a0',
            desc: 'ميداليات وهدايا وأدوات كشفية وتلوين لكل طفل مشارك.'
          },
          {
            name: 'النقل والمواصلات',
            amount: '١,٢٠٠ ج.م',
            percent: '٦%',
            val: 6,
            color: '#f72585',
            desc: 'باصات توصيل داخلي لنقل الأولاد بين بيوتهم والكنيسة بأمان.'
          },
          {
            name: 'الخامات والأنشطة الروحية',
            amount: '١,٠٠٠ ج.م',
            percent: '٥%',
            val: 5,
            color: '#b5179e',
            desc: 'خامات ورق ومجسمات مسرح العرائس ومستلزمات الطوارئ والإسعافات.'
          }
        ]
      }
    };

    function switchBudgetDay(dayNum) {
      currentGmBudgetDay = dayNum;
      const btn1 = document.getElementById('gm-budget-day-1-btn');
      const btn2 = document.getElementById('gm-budget-day-2-btn');
      if (btn1) btn1.classList.toggle('active', dayNum === 1);
      if (btn2) btn2.classList.toggle('active', dayNum === 2);
      renderBudgetPieChart(dayNum);
      pluckHarpString(440.00, 0.45);
      currentSp2PptStep = (dayNum === 1 ? 5 : 11) + Math.max(0, currentGmBudgetSlice);
      updateUniversalHud();
    }

    function renderBudgetPieChart(dayNum) {
      const data = gmBudgetData[dayNum];
      if (!data) return;

      const totalHoleEl = document.getElementById('gm-hole-total-num');
      if (totalHoleEl) totalHoleEl.textContent = data.totalNum;

      const svg = document.getElementById('gm-budget-pie-svg');
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

        const pathD = `
          M ${x1Inner.toFixed(1)},${y1Inner.toFixed(1)}
          L ${x1.toFixed(1)},${y1.toFixed(1)}
          A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(1)},${y2.toFixed(1)}
          L ${x2Inner.toFixed(1)},${y2Inner.toFixed(1)}
          A ${innerR} ${innerR} 0 ${largeArc} 0 ${x1Inner.toFixed(1)},${y1Inner.toFixed(1)}
          Z
        `;

        pathsHtml += `
          <path class="gm-pie-slice ${idx === currentGmBudgetSlice ? 'active' : ''}" 
                id="gm-pie-slice-${idx}"
                d="${pathD}" 
                fill="${item.color}" 
                stroke="#080e22" 
                stroke-width="1.8"
                onclick="selectBudgetSlice(${idx})"
                title="${item.name}: ${item.percent} (${item.amount})">
          </path>
        `;

        currentAngle += sliceAngle;
      });

      svg.innerHTML = pathsHtml;

      renderBudgetLegend(items);
      selectBudgetSlice(currentGmBudgetSlice, false);
    }

    function renderBudgetLegend(items) {
      const grid = document.getElementById('gm-budget-legend-grid');
      if (!grid) return;

      grid.innerHTML = items.map((item, idx) => `
        <div class="gm-legend-chip ${idx === currentGmBudgetSlice ? 'active' : ''}" 
             id="gm-legend-chip-${idx}" 
             onclick="selectBudgetSlice(${idx})"
             title="${item.desc}">
          <div class="gm-legend-name-group">
            <span class="gm-legend-color-dot" style="background: ${item.color};"></span>
            <span class="gm-legend-name">${item.name}</span>
          </div>
          <span class="gm-legend-percent">${item.percent}</span>
        </div>
      `).join('');
    }

    function selectBudgetSlice(idx, playSound = true) {
      currentGmBudgetSlice = idx;
      currentSp2PptStep = (currentGmBudgetDay === 1 ? 5 : 11) + Math.max(0, idx);
      updateUniversalHud();
      const day = currentGmBudgetDay;
      const data = gmBudgetData[day];
      if (!data || !data.items[idx]) return;

      currentGmBudgetSlice = idx;
      const item = data.items[idx];

      // Update Pie Slices active class
      data.items.forEach((_, i) => {
        const sliceEl = document.getElementById(`gm-pie-slice-${i}`);
        const chipEl = document.getElementById(`gm-legend-chip-${i}`);
        if (sliceEl) sliceEl.classList.toggle('active', i === idx);
        if (chipEl) chipEl.classList.toggle('active', i === idx);
      });

      // Update Slice Detail Box
      const badge = document.getElementById('gm-slice-badge');
      const title = document.getElementById('gm-slice-title');
      const amount = document.getElementById('gm-slice-amount');
      const percent = document.getElementById('gm-slice-percent');
      const desc = document.getElementById('gm-slice-desc');

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
      if (desc) desc.textContent = item.desc;

      if (playSound) {
        pluckHarpString(329.63 + idx * 40, 0.4);
      }
    }

    
    // ══════════════════════════════════════════════════════════════
    // ── 13. Chord 2 (التحضيرات) 25-Step Presentation Controller ──
    // ══════════════════════════════════════════════════════════════
    let currentSp2PptStep = 0; // 0 to 16 (Comprehensive Chord 3 presentation sequence)

    function goToSp2PptStep(step, playSound = true) {
      if (step < 0 || step > 16) return;
      currentSp2PptStep = step;

      // Step 0: Level 1 (الجلسات التعليمية وإعداد القادة)
      if (step === 0) {
        selectGameLevel(1, false, true);
        if (playSound) pluckHarpString(261.63, 0.6);
      }
      // Step 1: Level 2 (الخطوات الأولى واستكشاف الميدان)
      else if (step === 1) {
        selectGameLevel(2, false, true);
        if (playSound) pluckHarpString(293.66, 0.6);
      }
      // Step 2: Level 3 (التحضيرات - الروحي)
      else if (step === 2) {
        selectGameLevel(3, false, true);
        selectEventTab('spiritual');
        if (playSound) pluckHarpString(329.63, 0.6);
      }
      // Step 3: Level 3 (التحضيرات - تقويم السلوك)
      else if (step === 3) {
        selectGameLevel(3, false, true);
        selectEventTab('ethics');
        if (playSound) pluckHarpString(349.23, 0.6);
      }
      // Step 4: Level 3 (التحضيرات - الترفيه)
      else if (step === 4) {
        selectGameLevel(3, false, true);
        selectEventTab('games');
        if (playSound) pluckHarpString(392.00, 0.6);
      }
      // Steps 5 to 10: Level 4 (الميزانية الكشفية - اليوم الأول: Slices 0 to 5)
      else if (step >= 5 && step <= 10) {
        const sliceIdx = step - 5;
        selectGameLevel(4, false, true);
        if (currentGmBudgetDay !== 1) {
          switchBudgetDay(1);
        }
        selectBudgetSlice(sliceIdx, playSound);
      }
      // Steps 11 to 16: Level 4 (الميزانية الكشفية - اليوم الثاني: Slices 0 to 5)
      else if (step >= 11 && step <= 16) {
        const sliceIdx = step - 11;
        selectGameLevel(4, false, true);
        if (currentGmBudgetDay !== 2) {
          switchBudgetDay(2);
        }
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
        totalLevels: 6,
        levels: {
          1: {
            nodeTitle: "١. افتتاح وفطار",
            nodeTime: "٠٩:٠٠ ص – ٠٩:٣٠ ص",
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>',
            badge: "المرحلة ١ من ٦ • اليوم الأول",
            time: "٠٩:٠٠ ص – ٠٩:٣٠ ص",
            title: "الافتتاح الكشفي الصباحي والإفطار (Opening and Breakfast)",
            desc: "طابور الافتتاح الكشفي الصباحي وتحية العلم مع صيحات وترانيم كشفية حماسية، وتوزيع وجبة إفطار خفيفة متكاملة ومشروبات دافئة لبدء اليوم بنشاط وألفة.",
            img: "assets/opening day 1.jpg",
            caption: "طابور الافتتاح الكشفي وتحية العلم واستقبال أطفال كنيسة السلام"
          },
          2: {
            nodeTitle: "٢. ألعاب ومسابقات ١",
            nodeTime: "١٠:٠٠ ص – ١٢:٠٠ م",
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="12 8 8 12 12 16 16 12 12 8"></polygon></svg>',
            badge: "المرحلة ٢ من ٦ • اليوم الأول",
            time: "١٠:٠٠ ص – ١٢:٠٠ م",
            title: "مسابقات وبطولات الملاعب الأولى (Games 1)",
            desc: "انطلاق الجولة الأولى من الألعاب الميدانية والمسابقات الحركية؛ دوري كرة القدم، مسار الموانع، وتحديات التتابع بين الفرق لإشعال روح المنافسة الشريفة.",
            img: "assets/games day 1.jpg",
            caption: "بطولات الملاعب والمسابقات الحركية والتنافس بين فرق الأولاد والبنات"
          },
          3: {
            nodeTitle: "٣. ورش عمل وجلسات",
            nodeTime: "١٢:٠٠ م – ٠١:٣٠ م",
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M7 8h10"></path></svg>',
            badge: "المرحلة ٣ من ٦ • اليوم الأول",
            time: "١٢:٠٠ م – ٠١:٣٠ م",
            title: "الجلسات الروحية وبناء السلوك والأخلاق (Sessions)",
            desc: "لقاء روحي شيق تفاعلي ومسرح عرائس عن المحبة والعطاء وإدارة السلوك، مع ورش أشغال يدوية شارك فيها الأطفال بحماس لصنع تذكارات قيمة بأيديهم.",
            img: "assets/ethics session day 1.jpg",
            caption: "الجلسات الروحية وتقويم السلوك وورش العمل والأشغال اليدوية"
          },
          4: {
            nodeTitle: "٤. سناكس واستراحة",
            nodeTime: "٠١:٣٠ م – ٠٢:٠٠ م",
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.5a1 1 0 0 1-2 0v-5a1 1 0 0 1 2 0zm-1-7.5a1.25 1.25 0 1 1 1.25-1.25A1.25 1.25 0 0 1 12 9z"></path></svg>',
            badge: "المرحلة ٤ من ٦ • اليوم الأول",
            time: "٠١:٣٠ م – ٠٢:٠٠ م",
            title: "استراحة السناكس والفواكه والمشروبات (Snacks)",
            desc: "توزيع فاكهة طازجة وعصائر وسناكس ومياه مثلجة في أجواء مرحة لتجديد طاقة الأطفال وترطيبهم قبل انطلاق جولة المسابقات الكبرى.",
            img: "assets/snacks.jpg",
            caption: "استراحة لطيفة وتناول السناكس والفواكه لتجديد النشاط"
          },
          5: {
            nodeTitle: "٥. ألعاب ومسابقات ٢",
            nodeTime: "٠٢:٠٠ م – ٠٤:٠٠ م",
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
            badge: "المرحلة ٥ من ٦ • اليوم الأول",
            time: "٠٢:٠٠ م – ٠٤:٠٠ م",
            title: "مهرجان الألعاب والتحديات الكبرى والترامبولين (Games 2)",
            desc: "قمة الفرح بالترامبولين وألعاب البالونات المائية وسباق الأكياس وتحديات التيليب ماتش الحماسية وسط تشجيع وضحكات غمرت المكان.",
            img: "assets/games day 1 second session.jpg",
            caption: "مهرجان التيليب ماتش وتحديات الترامبولين ومسابقات الملاعب"
          },
          6: {
            nodeTitle: "٦. غداء وصورة اليوم",
            nodeTime: "٠٤:٠٠ م – ٠٥:٠٠ م",
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="13" r="4"></circle><path d="M5 7h2l2-3h6l2 3h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"></path></svg>',
            badge: "المرحلة ٦ من ٦ • اليوم الأول",
            time: "٠٤:٠٠ م – ٠٥:٠٠ م",
            title: "وجبة الغداء وصورة اليوم والتكريم (Lunch)",
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

      const d1 = "M 160,880 C 120,830 70,780 90,730 C 110,680 250,630 230,580 C 210,530 70,480 90,430 C 110,380 250,330 230,280 C 210,230 140,170 160,130";
      const d2 = "M 160,880 C 120,830 70,790 90,750 C 110,710 250,660 230,620 C 210,580 70,530 90,490 C 110,450 250,400 230,360 C 210,320 75,270 95,230 C 115,190 140,140 160,100";

      const targetD = (currentSp4MapDay === 1) ? d1 : d2;
      ['sp4-track-path-glow', 'sp4-track-path-base', 'sp4-track-path-dash'].forEach(id => {
        const p = document.getElementById(id);
        if (p) p.setAttribute('d', targetD);
      });

      const day1Coords = [
        { top: '880px', left: '50%' },
        { top: '730px', left: '28%' },
        { top: '580px', left: '72%' },
        { top: '430px', left: '28%' },
        { top: '280px', left: '72%' },
        { top: '130px', left: '50%' }
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
      const maxLvl = dayNum === 1 ? 6 : 7;
      const targetLvl = Math.min(maxLvl, Math.max(1, currentSp4DayLevelIdx));
      selectSp4DayLevel(targetLvl, true);
      pluckHarpString(dayNum === 1 ? 440.0 : 493.88, 0.5);
    }

    function selectSp4DayLevel(lvl, playSound = true) {
      const maxLvl = (currentSp4MapDay === 1) ? 6 : 7;
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
          ? [880, 730, 580, 430, 280, 130]
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
      if (step >= 6) {
        switchSp4MapDay(2);
        selectSp4DayLevel(7, playSound);
      } else {
        switchSp4MapDay(1);
        const targetLvl = Math.min(6, Math.max(1, step + 1));
        selectSp4DayLevel(targetLvl, playSound);
      }
    }

    // ── 15. Chord 5 (الدروس والمستقبل) 4-Slide Presentation Controller ──
    let currentSp5SlideIdx = 1; // 1 to 4

    
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

    function resetGrandCollabCurtain() {
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

    function triggerGrandCollabReveal(e) {
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
    }

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

      if (playSound && slideNum !== 4) {
        const freqs = [392.00, 440.00, 493.88, 523.25];
        pluckHarpString(freqs[slideNum - 1], 0.7);
      }

      // Slide 4: Keep curtains closed until user taps (Manual Reveal)
      if (slideNum === 4) {
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
      const slide = Math.min(4, Math.max(1, step + 1));
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
        } else {
          el.removeAttribute('contenteditable');
        }
      });

      if (isEditorModeActive) {
        pluckHarpString(523.25, 0.7);
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
      const noteGlyphs = ['♪', '♫', '♩', '♬', '✦', '✧'];

      // sp-2 (blue theme)
      const sp2Layer = document.querySelector('#sp-2 .floating-notes-layer');
      if (sp2Layer) {
        sp2Layer.innerHTML = '';
        const blueColors = [
          'rgba(114, 239, 182, 0.85)',
          'rgba(78, 168, 222, 0.9)',
          'rgba(144, 224, 239, 0.85)',
          'rgba(90, 190, 240, 0.8)',
          'rgba(160, 240, 210, 0.75)'
        ];
        for (let i = 0; i < 14; i++) {
          const el = document.createElement('div');
          el.className = 'map-ambient-note';
          el.textContent = noteGlyphs[Math.floor(Math.random() * noteGlyphs.length)];
          const sz = Math.floor(Math.random() * 10 + 14); // 14 to 24px
          const rot = ((Math.random() - 0.5) * 45).toFixed(1);
          const op = (Math.random() * 0.4 + 0.35).toFixed(2);
          const color = blueColors[Math.floor(Math.random() * blueColors.length)];
          const dur = (7 + Math.random() * 8).toFixed(1);
          const delay = (Math.random() * -15).toFixed(1);
          const left = (Math.random() * 90 + 5).toFixed(1);
          el.style.cssText = `
            left: ${left}%;
            color: ${color};
            text-shadow: 0 0 8px ${color}, 0 0 16px rgba(78, 168, 222, 0.4);
            --note-size: ${sz}px;
            --note-rot: ${rot}deg;
            --note-opacity: ${op};
            animation-duration: ${dur}s;
            animation-delay: ${delay}s;
          `;
          sp2Layer.appendChild(el);
        }
      }

      // sp-4 (green theme)
      const sp4Layer = document.querySelector('#sp-4 .floating-notes-layer');
      if (sp4Layer) {
        sp4Layer.innerHTML = '';
        const greenColors = [
          'rgba(72, 202, 139, 0.85)',
          'rgba(114, 239, 182, 0.9)',
          'rgba(167, 243, 208, 0.85)',
          'rgba(52, 211, 153, 0.8)',
          'rgba(110, 231, 183, 0.75)'
        ];
        for (let i = 0; i < 14; i++) {
          const el = document.createElement('div');
          el.className = 'map-ambient-note';
          el.textContent = noteGlyphs[Math.floor(Math.random() * noteGlyphs.length)];
          const sz = Math.floor(Math.random() * 10 + 14); // 14 to 24px
          const rot = ((Math.random() - 0.5) * 45).toFixed(1);
          const op = (Math.random() * 0.4 + 0.35).toFixed(2);
          const color = greenColors[Math.floor(Math.random() * greenColors.length)];
          const dur = (7 + Math.random() * 8).toFixed(1);
          const delay = (Math.random() * -15).toFixed(1);
          const left = (Math.random() * 90 + 5).toFixed(1);
          el.style.cssText = `
            left: ${left}%;
            color: ${color};
            text-shadow: 0 0 8px ${color}, 0 0 16px rgba(72, 202, 139, 0.4);
            --note-size: ${sz}px;
            --note-rot: ${rot}deg;
            --note-opacity: ${op};
            animation-duration: ${dur}s;
            animation-delay: ${delay}s;
          `;
          sp4Layer.appendChild(el);
        }
      }
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
  