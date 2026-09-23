import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('c:/Users/Dell/Desktop/raht/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Check original sp5 block
sp5_start = content.find('<div class="subpage" id="sp-5"')
sp5_end = content.find('<!-- Fullscreen Cinematic Lightbox Modal', sp5_start)

if sp5_start != -1 and sp5_end != -1:
    print(f"sp-5 found from {sp5_start} to {sp5_end}")
else:
    print("Could not locate sp-5 properly!")
