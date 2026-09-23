import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('c:/Users/Dell/Desktop/raht/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = [m.start() for m in re.finditer(r'collab-curtain', text)]
print(f"Matches for collab-curtain: {len(matches)}")
for idx in matches:
    print("--- MATCH AT", idx, "---")
    print(text[max(0, idx-50):min(len(text), idx+300)])
