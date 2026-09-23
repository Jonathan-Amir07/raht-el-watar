import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('c:/Users/Dell/Desktop/raht/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

s4_start = text.find('id="sp5-slide-4"')
s4_end = text.find('<!-- Fullscreen Cinematic Lightbox Modal', s4_start)
s4_text = text[s4_start:s4_end]

print("Slide 4 open divs:", len(re.findall(r'<div\b', s4_text, re.IGNORECASE)))
print("Slide 4 close divs:", len(re.findall(r'</div>', s4_text, re.IGNORECASE)))

# Trace tag by tag
lines = s4_text.splitlines()
balance = 0
for i, line in enumerate(lines):
    opens = len(re.findall(r'<div\b', line, re.IGNORECASE))
    closes = len(re.findall(r'</div>', line, re.IGNORECASE))
    balance += (opens - closes)
    if opens or closes:
        print(f"Line {i+1} (bal={balance}): {line.strip()[:60]}")
