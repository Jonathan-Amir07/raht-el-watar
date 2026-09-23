import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('c:/Users/Dell/Desktop/raht/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('function playDramaticDrumrollReveal()')
idx2 = text.find('function resetGrandCollabCurtain()')
print(text[idx:idx2])
