import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('c:/Users/Dell/Desktop/raht/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = [m.start() for m in re.finditer(r'getAudioContext', text)]
print("Occurrences of getAudioContext:", len(matches))
for m in matches:
    line_num = text[:m].count('\n') + 1
    print(f"Line {line_num}: {text[max(0, m-30):min(len(text), m+70)].strip()}")
