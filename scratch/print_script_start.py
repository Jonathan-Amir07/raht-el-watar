import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('c:/Users/Dell/Desktop/raht/index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(8620, 8660):
    print(f"{i+1}: {repr(lines[i])}")
