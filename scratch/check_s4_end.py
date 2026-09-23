import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('c:/Users/Dell/Desktop/raht/index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'id="sp5-slide-4"' in line:
        start_idx = i
        break

print(f"sp5-slide-4 found at line {start_idx + 1}")
for i in range(start_idx + 130, min(len(lines), start_idx + 160)):
    print(f"{i+1}: {repr(lines[i])}")
