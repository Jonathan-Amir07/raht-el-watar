import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('c:/Users/Dell/Desktop/raht/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('/* The Curtains Overlay */')
print(text[idx:idx+2500])
