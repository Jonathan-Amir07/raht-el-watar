with open('c:/Users/Dell/Desktop/raht/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = [m.start() for m in re.finditer(r'sp5|goToSp5', text)]
print('Total matches:', len(matches))
for idx in matches:
    line_no = text[:idx].count('\n') + 1
    snippet = text[idx:idx+50].replace('\n', ' ')
    print(f'Line {line_no}: {snippet}')
