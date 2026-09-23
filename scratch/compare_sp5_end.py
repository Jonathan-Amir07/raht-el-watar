import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('c:/Users/Dell/Desktop/raht/index.html.bak_chord6', 'r', encoding='utf-8') as f:
    text_bak = f.read()

s_bak = text_bak.find('id="sp-5"')
e_bak = text_bak.find('<!-- Fullscreen Cinematic Lightbox Modal', s_bak)
print("=== BAK CHORD 6 ===")
lines_bak = text_bak[s_bak:e_bak].splitlines()
for line in lines_bak[-20:]:
    print(line)

with open('c:/Users/Dell/Desktop/raht/index.html', 'r', encoding='utf-8') as f:
    text_cur = f.read()

s_cur = text_cur.find('id="sp-5"')
e_cur = text_cur.find('<!-- Fullscreen Cinematic Lightbox Modal', s_cur)
print("=== CURRENT INDEX.HTML ===")
lines_cur = text_cur[s_cur:e_cur].splitlines()
for line in lines_cur[-20:]:
    print(line)
