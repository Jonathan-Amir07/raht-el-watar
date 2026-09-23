import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('c:/Users/Dell/Desktop/raht/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = [m.start() for m in re.finditer(r'<script\b', text)]
print("Number of script tags:", len(matches))
for m in matches:
    line_num = text[:m].count('\n') + 1
    print(f"Line {line_num}: {text[m:m+100]}")
