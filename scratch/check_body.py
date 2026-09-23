import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('c:/Users/Dell/Desktop/raht/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = [m.start() for m in re.finditer(r'class="sp-body', text)]
for idx in matches[:5]:
    print(text[max(0, idx-20):min(len(text), idx+100)])
    print('---')
