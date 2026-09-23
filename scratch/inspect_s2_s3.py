import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('c:/Users/Dell/Desktop/raht/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

s2_idx = text.find('id="sp5-slide-2"')
s3_idx = text.find('id="sp5-slide-3"')
print("=== SLIDE 2 ===")
print(text[s2_idx:s2_idx+400])
print("=== SLIDE 3 ===")
print(text[s3_idx:s3_idx+400])
