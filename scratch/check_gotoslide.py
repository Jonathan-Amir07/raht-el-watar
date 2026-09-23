import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('c:/Users/Dell/Desktop/raht/index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'function goToSp5Slide' in line:
        start_idx = i
        break

for i in range(start_idx, min(len(lines), start_idx + 45)):
    print(f"{i+1}: {repr(lines[i])}")
