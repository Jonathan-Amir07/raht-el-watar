import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('c:/Users/Dell/Desktop/raht/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

js_idx = text.find('function playDramaticDrumrollReveal()')
print(text[js_idx+1200:js_idx+3600])
