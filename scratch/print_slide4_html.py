import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('c:/Users/Dell/Desktop/raht/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

s4_start = text.find('id="sp5-slide-4"')
s4_end = text.find('<!-- Fullscreen Cinematic Lightbox Modal', s4_start)
print("Length of Slide 4 snippet:", s4_end - s4_start)
print(text[s4_start:s4_end])
