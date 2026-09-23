import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('c:/Users/Dell/Desktop/raht/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Print CSS block
css_idx = text.find('/* The Curtains Overlay */')
print("=== CSS BLOCK (around 152920) ===")
print(text[css_idx-400:css_idx+1500])

# Print JS block
js_idx = text.find('function playDramaticDrumrollReveal()')
print("\n=== JS BLOCK ===")
print(text[js_idx-100:js_idx+2000])
