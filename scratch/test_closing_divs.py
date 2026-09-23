import sys
import re
sys.stdout.reconfigure(encoding='utf-8')

with open('c:/Users/Dell/Desktop/raht/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

sp5_start = text.find('<div class="subpage" id="sp-5"')
lightbox_start = text.find('<!-- Fullscreen Cinematic Lightbox Modal', sp5_start)

# Test appending </div>\n  </div> before lightbox_start
fixed_text = text[:lightbox_start] + "    </div>\n  </div>\n\n  " + text[lightbox_start:]

sp5_block = fixed_text[sp5_start:fixed_text.find('<!-- Fullscreen Cinematic Lightbox Modal', sp5_start)]

open_divs = len(re.findall(r'<div\b', sp5_block, re.IGNORECASE))
close_divs = len(re.findall(r'</div>', sp5_block, re.IGNORECASE))
print(f"sp-5 div balance with 2 closing divs: open={open_divs}, close={close_divs}, diff={open_divs - close_divs}")

total_open = len(re.findall(r'<div\b', fixed_text, re.IGNORECASE))
total_close = len(re.findall(r'</div>', fixed_text, re.IGNORECASE))
print(f"Total document div balance: open={total_open}, close={total_close}, diff={total_open - total_close}")
