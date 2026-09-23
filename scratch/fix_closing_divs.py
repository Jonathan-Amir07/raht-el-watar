import sys
import re

with open('c:/Users/Dell/Desktop/raht/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

target = '''          </div>

        </div>
      </div>

<!-- Fullscreen Cinematic Lightbox Modal (Zoom In / Zoom Out) -->'''

replacement = '''          </div>

        </div>
      </div>
    </div>
  </div>

<!-- Fullscreen Cinematic Lightbox Modal (Zoom In / Zoom Out) -->'''

if target not in content:
    print("ERROR: target block not found!")
    sys.exit(1)

new_content = content.replace(target, replacement, 1)

with open('c:/Users/Dell/Desktop/raht/index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Successfully added closing divs to index.html")
