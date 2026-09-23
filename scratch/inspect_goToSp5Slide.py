import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('c:/Users/Dell/Desktop/raht/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

js_idx = text.find('function goToSp5Slide')
print(text[js_idx:js_idx+1500])
