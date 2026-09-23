import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('c:/Users/Dell/Desktop/raht/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx1 = text.find('/* The Curtains Overlay */')
idx2 = text.find('/* Golden Center Cord */')
print(text[idx1:idx2+600])
