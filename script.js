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
        if (currentProjStep === 0 && currentRejectedStep > 0) {
          curStep = currentRejectedStep;
          totalSteps = 6;
          const cardIdx = Math.floor((currentRejectedStep - 1) / 2);
          const arabicNums = ['الأولى', 'الثانية', 'الثالثة'];
          chordTitle = 'الوتر الثاني: الفكرة ' + (arabicNums[cardIdx] || (cardIdx + 1));
        } else {
          curStep = currentProjStep + 1;
          totalSteps = 3;
        }
        const b1 = document.getElementById('ppt-counter-badge-1');
        if (b1) b1.textContent = `${toArabicNum(curStep)} / ${toArabicNum(totalSteps)}`;
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
          const activePane = (typeof getActivePaneId === 'function') ? getActivePaneId(currentGmLevel, currentLoopRotation) : currentGmLevel;
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
            chordTitle = 'الوتر الثالث: تحضيرات in general';
            curStep = 1;
            totalSteps = 1;
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
            totalSteps = 7;
          } else if (activePane === 7) {
            chordTitle = 'الوتر الثالث: تحضيرات اليوم الثاني';
            curStep = 1;
            totalSteps = 1;
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
          if (currentProjStep === 0) {
            if (currentRejectedStep < 6) {
              goToRejectedStep(currentRejectedStep + 1);
            } else {
              goToRejectedStep(0);
              goToProjStep(1);
            }
          } else if (currentProjStep < 2) {
            goToProjStep(currentProjStep + 1);
          } else {
            stepToNextChord(2, 0);
          }
        } else {
          if (currentProjStep === 0) {
            if (currentRejectedStep > 0) {
              goToRejectedStep(currentRejectedStep - 1);
            } else {
              stepToNextChord(0, 7);
            }
          } else if (currentProjStep > 0) {
            goToProjStep(currentProjStep - 1);
            if (currentProjStep === 0) {
              goToRejectedStep(6);
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
            openSp2Node(currentGmLevel, true, true);
          } else {
            // In pane mode, advance through sub-steps or complete node and return to map
            const activePane = (typeof getActivePaneId === 'function') ? getActivePaneId(currentGmLevel, currentLoopRotation) : currentGmLevel;
            if (activePane === 1) {
              if (currentSp2EduStep < 6) {
                goToSp2EduStep(currentSp2EduStep + 1);
              } else {
                closeCinematicZoom();
                sp2CompletedNodes.add(1);
                playMilestoneCompletionSound();
                showSp2Map(2, true);
              }
            } else if (activePane === 2) {
              // تحضيرات in general (single step -> completes to map)
              sp2CompletedNodes.add(2);
              playMilestoneCompletionSound();
              showSp2Map(3, true);
            } else if (activePane === 3) {
              // برنامج فعاليات اليوم الأول (5 sub-steps)
              if (currentSp2Day1ProgLvl < 5) {
                selectSp2Day1ProgramLevel(currentSp2Day1ProgLvl + 1, true);
              } else {
                closeCinematicZoom();
                sp2CompletedNodes.add(3);
                playMilestoneCompletionSound();
                showSp2Map(4, true);
              }
            } else if (activePane === 4) {
              // تحضيرات اليوم الأول (3 cards, 6 sub-steps: highlight -> zoom for each)
              if (currentSp2Prep1Step < 6) {
                goToSp2Prep1Step(currentSp2Prep1Step + 1);
              } else {
                closeCinematicZoom();
                sp2CompletedNodes.add(4);
                playMilestoneCompletionSound();
                showSp2Map(5, true);
              }
            } else if (activePane === 5) {
              // ميزانية اليوم الأول (7 slices)
              const maxSlice = (gmBudgetData[1] && gmBudgetData[1].items) ? gmBudgetData[1].items.length - 1 : 6;
              if (currentGmBudgetSlice < maxSlice) {
                selectBudgetSlice(currentGmBudgetSlice + 1, true);
              } else {
                sp2CompletedNodes.add(5);
                playMilestoneCompletionSound();
                // ── ADVANCE TO NODE 6 (FEEDBACK - ROTATION 1) ──
                showSp2Map(6, true);
              }
            } else if (activePane === 9) {
              // التقييم الخارجي (اليوم الأول) -> نهاية اللفة الأولى والانتقال لليوم الثاني
              sp2CompletedNodes.add(9);
              playMilestoneCompletionSound();
              currentLoopRotation = 2;
              showSp2Map(3, true);
            } else if (activePane === 6) {
              // برنامج اليوم الثاني
              if (currentSp2Day2ProgLvl < 7) {
                selectSp2Day2ProgramLevel(currentSp2Day2ProgLvl + 1, true);
              } else {
                closeCinematicZoom();
                sp2CompletedNodes.add(6);
                playMilestoneCompletionSound();
                showSp2Map(4, true);
              }
            } else if (activePane === 7) {
              // تحضيرات اليوم الثاني
              sp2CompletedNodes.add(7);
              playMilestoneCompletionSound();
              showSp2Map(5, true);
            } else if (activePane === 8) {
              // ميزانية اليوم الثاني
              const maxSlice = (gmBudgetData[2] && gmBudgetData[2].items) ? gmBudgetData[2].items.length - 1 : 5;
              if (currentGmBudgetSlice < maxSlice) {
                selectBudgetSlice(currentGmBudgetSlice + 1, true);
              } else {
                sp2CompletedNodes.add(8);
                playMilestoneCompletionSound();
                // ── ADVANCE TO NODE 6 (FEEDBACK - ROTATION 2) ──
                showSp2Map(6, true);
              }
            } else if (activePane === 10) {
              // التقييم الداخلي (اليوم الثاني) -> نهاية خريطة العمل والانتقال للوتر الرابع
              sp2CompletedNodes.add(10);
              playMilestoneCompletionSound();
              stepToNextChord(3, 0); // Advances to Chord 4 (التحديات)
            }
          }
        } else {
          // ── PREVIOUS ──
          if (sp2ViewMode === 'map') {
            if (currentGmLevel === 1) {
              stepToNextChord(1, 2); // Back to Chord 2 (المشروع)
            } else if (currentGmLevel === 3 && currentLoopRotation === 2) {
              // Go back from rotation 2 start to rotation 1 end (Node 6)
              currentLoopRotation = 1;
              currentGmLevel = 6;
              showSp2Map(6, true);
            } else {
              currentGmLevel--;
              showSp2Map(currentGmLevel, true);
            }
          } else {
            // Inside a sub-point, go to previous sub-step or return to map
            const activePane = (typeof getActivePaneId === 'function') ? getActivePaneId(currentGmLevel, currentLoopRotation) : currentGmLevel;
            if (activePane === 1) {
              if (currentSp2EduStep > 0) {
                goToSp2EduStep(currentSp2EduStep - 1);
              } else {
                showSp2Map(1, true);
              }
            } else if (activePane === 2) {
              showSp2Map(2, true);
            } else if (activePane === 3) {
              if (currentSp2Day1ProgLvl > 1) {
                selectSp2Day1ProgramLevel(currentSp2Day1ProgLvl - 1, true);
              } else {
                showSp2Map(3, true);
              }
            } else if (activePane === 4) {
              if (currentSp2Prep1Step > 0) {
                goToSp2Prep1Step(currentSp2Prep1Step - 1);
              } else {
                showSp2Map(4, true);
              }
            } else if (activePane === 5) {
              if (currentGmBudgetSlice > 0) {
                selectBudgetSlice(currentGmBudgetSlice - 1, true);
              } else {
                showSp2Map(5, true);
              }
            } else if (activePane === 9) {
              showSp2Map(6, true);
            } else if (activePane === 6) {
              if (currentSp2Day2ProgLvl > 1) {
                selectSp2Day2ProgramLevel(currentSp2Day2ProgLvl - 1, true);
              } else {
                showSp2Map(3, true);
              }
            } else if (activePane === 7) {
              showSp2Map(4, true);
            } else if (activePane === 8) {
              if (currentGmBudgetSlice > 0) {
                selectBudgetSlice(currentGmBudgetSlice - 1, true);
              } else {
                showSp2Map(5, true);
              }
            } else if (activePane === 10) {
              showSp2Map(6, true);
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
        if (e.key === 'Escape') {
          e.preventDefault();
          if (activePage === 2 && currentGmLevel === 1 && currentSp2EduStep > 0) {
            goToSp2EduStep(currentSp2EduStep - 1);
          } else if (activePage === 2 && currentGmLevel === 4 && currentSp2Prep1Step > 0) {
            goToSp2Prep1Step(currentSp2Prep1Step - 1);
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

    // ── 10. Chord 1 (The Project) Seamless PPT Presentation (3 Steps + 3 Reason Spotlight Steps) ──
    let currentProjStep = 0; // 0: Rejected Projects, 1: Approved Idea & Goal, 2: Two Churches Showcase
    let currentRejectedStep = 0; // 0: No modal, 1: Card 1 reason modal, 2: Card 2 reason modal, 3: Card 3 reason modal

    const rejectedCardsData = [
      {
        title: 'حملة التوعية النفسية',
        reason: 'الجلسات محتاجة دكاترة ومتخصصين مش إحنا',
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
        const arabicNums = ['١', '٢', '٣'];
        counterEl.textContent = `${arabicNums[currentProjStep] || (currentProjStep + 1)} / ٣`;
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
    let currentGmLevel = 1; // 1 to 5 (visual node on map)
    let currentLoopRotation = 1; // 1: Day 1 (Lap 1), 2: Day 2 (Lap 2)
    let sp2ViewMode = 'map'; // 'map' (full-screen map) or 'pane' (full-screen sub-point)
    let sp2CompletedNodes = new Set();
    let currentGmCategory = 'villas';
    let currentGmCategoryDay = 1;
    let currentGmEventsDay = 1;
    let currentGmEventTab = 'spiritual';
    let currentGmBudgetDay = 1;
    let currentGmBudgetSlice = 0;

    // Helper: Map Node (1..6) + Rotation (1..2) -> Actual Slide Pane ID (1..10)
    function getActivePaneId(mapNode = currentGmLevel, rotation = currentLoopRotation) {
      if (mapNode === 1) return 1;
      if (mapNode === 2) return 2;
      if (mapNode === 3) return rotation === 1 ? 3 : 6;
      if (mapNode === 4) return rotation === 1 ? 4 : 7;
      if (mapNode === 5) return rotation === 1 ? 5 : 8;
      if (mapNode === 6) return rotation === 1 ? 9 : 10;
      return 1;
    }

    // Helper: Given Slide Pane ID (1..10) -> Map Node (1..6) & Rotation (1..2)
    function getMapNodeFromPane(paneIdx) {
      if (paneIdx === 1) return { node: 1, rotation: 1 };
      if (paneIdx === 2) return { node: 2, rotation: 1 };
      if (paneIdx === 3) return { node: 3, rotation: 1 };
      if (paneIdx === 4) return { node: 4, rotation: 1 };
      if (paneIdx === 5) return { node: 5, rotation: 1 };
      if (paneIdx === 6) return { node: 3, rotation: 2 };
      if (paneIdx === 7) return { node: 4, rotation: 2 };
      if (paneIdx === 8) return { node: 5, rotation: 2 };
      if (paneIdx === 9) return { node: 6, rotation: 1 };
      if (paneIdx === 10) return { node: 6, rotation: 2 };
      return { node: 1, rotation: 1 };
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
        title: 'تحضيرات اليوم الثاني • الخطوات الأولى واستكشاف الميدان',
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
          const info = getMapNodeFromPane(highlightNode);
          currentGmLevel = info.node;
          currentLoopRotation = info.rotation;
        }
      }

      updateMapNodesVisuals();
      updateLoopHubDisplay();

      const activePane = getActivePaneId(currentGmLevel, currentLoopRotation);
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
      updateLoopHubDisplay();
      try {
        pluckHarpString(rotation === 1 ? 293.66 : 440.00, 0.5);
      } catch (e) {}
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
          let isDone = false;
          if (i === 1) isDone = sp2CompletedNodes.has(1);
          else if (i === 2) isDone = sp2CompletedNodes.has(2);
          else if (i === 3) isDone = (currentLoopRotation === 1 ? sp2CompletedNodes.has(3) : sp2CompletedNodes.has(6));
          else if (i === 4) isDone = (currentLoopRotation === 1 ? sp2CompletedNodes.has(4) : sp2CompletedNodes.has(7));
          else if (i === 5) isDone = (currentLoopRotation === 1 ? sp2CompletedNodes.has(5) : sp2CompletedNodes.has(8));
          else if (i === 6) isDone = (currentLoopRotation === 1 ? sp2CompletedNodes.has(9) : sp2CompletedNodes.has(10));
          node.classList.toggle('completed', isDone);
        }
      }

      // Update lap badges on loop nodes 3, 4, 5, 6
      for (let n = 3; n <= 6; n++) {
        const badge = document.getElementById(`gm-lap-badge-${n}`);
        if (badge) {
          badge.textContent = currentLoopRotation === 1 ? 'د١' : 'د٢';
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
      const mapPane = document.getElementById('gm-map-pane');
      if (mapPane) {
        mapPane.classList.toggle('rotation-2', currentLoopRotation === 2);
      }

      const dayLabel = document.getElementById('gm-floating-day-label');
      const daySub = document.getElementById('gm-floating-day-sub');
      if (dayLabel) {
        dayLabel.textContent = currentLoopRotation === 1 ? 'اليوم الأول' : 'اليوم الثاني';
      }
      if (daySub) {
        daySub.textContent = currentLoopRotation === 1
          ? 'كنيسة العذراء مريم بالسلام (٨٠ فرداً)'
          : 'كنيسة البطحة والفيلا (اليوم الميداني)';
      }
    }

    function openSp2Node(targetLevel, resetSubStep = true, playAudio = true) {
      if (targetLevel < 1 || targetLevel > 10) return;
      sp2ViewMode = 'pane';

      let paneId = targetLevel;
      if (targetLevel <= 6) {
        paneId = getActivePaneId(targetLevel, currentLoopRotation);
        currentGmLevel = targetLevel;
      } else {
        const info = getMapNodeFromPane(targetLevel);
        currentLoopRotation = info.rotation;
        currentGmLevel = info.node;
        paneId = targetLevel;
      }

      const vp = document.getElementById('gm-viewport');
      if (vp) {
        vp.classList.add('pane-active');
        vp.classList.add('drawer-open');
      }

      // Switch Panes (only target pane visible)
      for (let i = 1; i <= 10; i++) {
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
          // تحضيرات in general (single step)
        } else if (paneId === 3) {
          selectSp2Day1ProgramLevel(1, false);
        } else if (paneId === 4) {
          if (typeof goToSp2Prep1Step === 'function') goToSp2Prep1Step(0);
        } else if (paneId === 5) {
          renderBudgetPieChart(1);
          selectBudgetSlice(0, false);
        } else if (paneId === 6) {
          selectSp2Day2ProgramLevel(1, false);
        } else if (paneId === 7) {
          // Day 2 preparations (single step)
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
      // Called when user clicks a node on the map -> opens that node full-screen
      openSp2Node(levelIdx, true, playAudio);
    }

    function navigateGameLevel(dir) {
      const curPane = getActivePaneId(currentGmLevel, currentLoopRotation);
      let targetPane = curPane + dir;
      if (targetPane >= 1 && targetPane <= 10) {
        openSp2Node(targetPane, true, true);
      }
    }

    function toggleGameMapDrawer() {
      // Toggle between map and current sub-point pane
      if (sp2ViewMode === 'pane') {
        showSp2Map(currentGmLevel, true);
      } else {
        openSp2Node(currentGmLevel, false, true);
      }
    }

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
          badge: "المرحلة ١ من ٥ • اليوم الأول",
          title: "Opening and Breakfast",
          time: "٠٩:٠٠ ص – ١٠:٠٠ ص",
          desc: "طابور الافتتاح الكشفي الصباحي وتحية العلم مع صيحات وترانيم كشفية حماسية، وتوزيع وجبة إفطار خفيفة متكاملة ومشروبات دافئة لبدء اليوم بنشاط وألفة.",
          img: "assets/opening day 1.jpg",
          caption: "طابور الافتتاح الكشفي وتحية العلم واستقبال أطفال كنيسة السلام"
        },
        2: {
          badge: "المرحلة ٢ من ٥ • اليوم الأول",
          title: "Games 1",
          time: "١٠:٠٠ ص – ١٢:٠٠ م",
          desc: "انطلاق الجولة الأولى من الألعاب الميدانية والمسابقات الحركية؛ دوري كرة القدم، مسار الموانع، وتحديات التتابع بين الفرق لإشعال روح المنافسة الشريفة.",
          img: "assets/games day 1.jpg",
          caption: "بطولات الملاعب والمسابقات الحركية والتنافس بين فرق الأولاد والبنات"
        },
        3: {
          badge: "المرحلة ٣ من ٥ • اليوم الأول",
          title: "Sessions",
          time: "١٢:٠٠ م – ٠١:٣٠ م",
          desc: "ورش عمل حرفية وفنية لغرس قيم العمل اليدوي، مع جلسات تفاعلية عن روح الفريق والتعاون الكشفي وصناعة تذكارات بأيديهم.",
          img: "assets/ethics session day 1.jpg",
          caption: "ورش العمل الحرفية وتطبيقات السلوك الإيجابي والتعاون بين الأطفال"
        },
        4: {
          badge: "المرحلة ٤ من ٥ • اليوم الأول",
          title: "Games 2",
          time: "٠١:٣٠ م – ٠٣:٣٠ م",
          desc: "الجولة الثانية من الألعاب الكبرى؛ ألعاب التيليب ماتش بالبالونات والمياه، سباقات الحبال والموانع الهوائية التي أشعلت حماس الأطفال.",
          img: "assets/games day 1.jpg",
          caption: "مهرجان الألعاب الحركية ومسابقات التيليب ماتش الحماسية بالملاعب"
        },
        5: {
          badge: "المرحلة ٥ من ٥ • اليوم الأول",
          title: "Lunch",
          time: "٠٣:٣٠ م – ٠٤:٣٠ م",
          desc: "التجمع الختامي لليوم الأول؛ تناول وجبة غداء كشفية ساخنة وشهية معاً، وتكريم الأطفال وتوزيع الهدايا والتقاط الصورة التذكارية الملحمية لرهط الوتر.",
          img: "assets/first day raht image.jpg",
          caption: "صورة اليوم التذكارية ومشاركة مائدة الغداء الكشفية وتكريم الجميع"
        }
      },
      2: {
        1: {
          title: "(Breakfast & Opening)",
          time: "١١:٤٥ ص – ١٢:٣٠ م",
          desc: "استقبال حافل للأطفال بأناشيد الكشافة وصيحات رهط الوتر لكسر الجليد، ثم توزيع وجبة إفطار خفيفة ومشروبات دافئة لبدء يوم الفيلا والمسبح بحماس.",
          img: "assets/opening day 2.jpg",
          caption: "الافتتاح الكشفي الصباحي واستقبال الأطفال وتناول وجبة الإفطار الجماعية بكنيسة البطحة"
        },
        2: {
          title: "(Ro7y, Crafts & Ethics)",
          time: "١٢:٣٠ م – ٠٢:٠٠ م",
          desc: "قصة روحية مشوقة عن الرجاء والمحبة، تلتها ورش عمل حرفية وأشغال يدوية صنع فيها الأطفال تذكارات بأيديهم، مع غرس القيم السلوكية والأخلاقية.",
          img: "assets/religous session day 2.jpg",
          caption: "الفقرة الروحية وورش العمل والأشغال اليدوية وتنمية المهارات"
        },
        3: {
          title: "(Lebs Maiohat)",
          time: "٠٢:٠٠ م – ٠٢:٣٠ م",
          desc: "تجهيز وارتداء ملابس السباحة للأطفال والاستعداد للنزول في حمام السباحة وسط إشراف كامل وتجهيز سترات النجاة.",
          img: "assets/swimwear-prep.jpg",
          caption: "الاستعداد للنزول في البيسين بكامل العتاد والجاهزية!"
        },
        4: {
          title: "(Girls Pool / Boys Games)",
          time: "٠٢:٣٠ م – ٠٤:٠٠ م",
          desc: "نظام التناوب الأول؛ استمتاع كامل للبنات بحمام السباحة والزحاليق المائية في خصوصية وأمان تام تحت إشراف المنقذات والخادمات، وتنافس حماسي للأولاد في الملاعب.",
          img: "assets/games boys day 2.jpg",
          caption: "فترة التناوب الأولى: ألعاب ومسابقات ملاعب اليوم الثاني للأولاد بالتوازي مع مسبح البنات"
        },
        5: {
          title: "(Boys Pool & Girls Games)",
          time: "٠٤:٠٠ م – ٠٥:٣٠ م",
          desc: "عكس التناوب؛ انطلاق الأولاد للمسبح والألعاب المائية والكرات المنفوخة، بينما تخوض البنات مسابقات تفاعلية مبهجة في الملاعب الخضراء المجهزة.",
          img: "assets/games girls day 2.jpg",
          caption: "فترة التناوب الثانية: ألعاب ومسابقات الملاعب للبنات بالتوازي مع مسبح الأولاد"
        },
        6: {
          title: "Showering",
          time: "٠٥:٣٠ م – ٠٦:٠٠ م",
          desc: "الانتهاء من نشاط البركة، أخذ شاور دافئ، تجفيف وتبديل الملابس والاستعداد لمائدة العشاء.",
          img: "assets/showering-care.jpg",
          caption: "الشكل بعد الخروج من البيسين والشاور الساقع!"
        },
        7: {
          title: "(Lunch & Soret El Yom)",
          time: "٠٦:٠٠ م – ٠٦:٣٠ م",
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
      if (lvl < 1 || lvl > 7) return;
      currentSp2Day2ProgLvl = lvl;

      // Update Node active states
      for (let i = 1; i <= 7; i++) {
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

      // Smooth scroll map pane: starts from bottom at Node 1 (880px) and moves up smoothly to Node 7 (70px)
      const scrollPane = document.getElementById('sp2-prog2-scroll-pane');
      if (scrollPane) {
        const nodePositions = [880, 745, 610, 475, 340, 205, 70];
        const nodeY = nodePositions[lvl - 1] !== undefined ? nodePositions[lvl - 1] : 880;
        const updateScroll = () => {
          const containerHeight = (scrollPane.parentElement && scrollPane.parentElement.clientHeight > 0)
            ? scrollPane.parentElement.clientHeight
            : 480;
          const maxScroll = Math.max(0, 980 - containerHeight);
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
        const freqs = [293.66, 329.63, 369.99, 392.00, 440.00, 493.88, 523.25];
        pluckHarpString(freqs[lvl - 1] || 392.00, 0.6);
      }

      currentSp2PptStep = 13 + lvl;
      updateUniversalHud();
    }

    function zoomSp2ProgramMedia(dayNum) {
      const lvl = dayNum === 1 ? currentSp2Day1ProgLvl : currentSp2Day2ProgLvl;
      const data = sp2ProgramData[dayNum] && sp2ProgramData[dayNum][lvl];
      if (data) {
        openCinematicZoom(data.img, data.title, data.time, data.caption || data.desc);
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
