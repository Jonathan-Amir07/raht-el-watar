import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('c:/Users/Dell/Desktop/raht/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

print(f"Total HTML file length: {len(text)} characters, {text.count(chr(10))} lines")

# 1. Check sp-5 div nesting
sp5_start = text.find('<div class="subpage" id="sp-5"')
lightbox_start = text.find('<!-- Fullscreen Cinematic Lightbox Modal', sp5_start)
sp5_block = text[sp5_start:lightbox_start]

open_divs = len(re.findall(r'<div\b', sp5_block, re.IGNORECASE))
close_divs = len(re.findall(r'</div>', sp5_block, re.IGNORECASE))
print(f"sp-5 div balance: open={open_divs}, close={close_divs}, diff={open_divs - close_divs}")

# 2. Check total document div balance
total_open = len(re.findall(r'<div\b', text, re.IGNORECASE))
total_close = len(re.findall(r'</div>', text, re.IGNORECASE))
print(f"Total document div balance: open={total_open}, close={total_close}, diff={total_open - total_close}")

# 3. Check Slide 2 requirements
points = ['الشمس', 'المياه', 'تغير التحضير', 'الترامبولين']
print("\nSlide 2 4-Points Check:")
for p in points:
    found = p in text[sp5_start:lightbox_start]
    print(f" - Point '{p}': {'FOUND' if found else 'MISSING'}")

# 4. Check Slide 3 schedules
print("\nSlide 3 Schedules Check:")
s1_found = "خطة هذا العام" in text[sp5_start:lightbox_start] and "٤ كنائس" in text[sp5_start:lightbox_start]
s2_found = "خطة العام القادم" in text[sp5_start:lightbox_start] and "٨ كنائس" in text[sp5_start:lightbox_start]
print(f" - Schedule 1 (4 churches): {'FOUND' if s1_found else 'MISSING'}")
print(f" - Schedule 2 (8 churches): {'FOUND' if s2_found else 'MISSING'}")

# 5. Check Slide 4 collaboration
print("\nSlide 4 Collaboration Check:")
watar_logo = 'assets/watar-logo.png' in text[sp5_start:lightbox_start]
alb_logo = 'assets/alb ebtsama.png' in text[sp5_start:lightbox_start]
collab_found = 'رهط الوتر' in text[sp5_start:lightbox_start] and 'قلب ابتسامة' in text[sp5_start:lightbox_start]
print(f" - Watar Logo: {'FOUND' if watar_logo else 'MISSING'}")
print(f" - Alb Ebtsama Logo: {'FOUND' if alb_logo else 'MISSING'}")
print(f" - Collaboration Text: {'FOUND' if collab_found else 'MISSING'}")

# 6. Check JS Controllers
print("\nJS Controller Check:")
checks = [
    ('totalSteps = 4 for activePage 5', "totalSteps = 4;"),
    ('currentSp5SlideIdx < 4 in advanceGlobalPresentation', "currentSp5SlideIdx < 4"),
    ('goToSp5Slide handles 4 slides', "slideNum < 1 || slideNum > 4"),
    ('goToSp5Slide loop 4 slides', "for (let i = 1; i <= 4; i++)"),
    ('goToSp5Slide counter 4', "['١', '٢', '٣', '٤']"),
    ('goToSp5PptStep max 4', "Math.min(4, Math.max(1, step + 1))")
]
for desc, snippet in checks:
    found = snippet in text
    print(f" - {desc}: {'FOUND' if found else 'MISSING'}")
