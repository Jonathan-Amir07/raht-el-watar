import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

divs_open = len(re.findall(r'<div\b', html))
divs_close = len(re.findall(r'</div>', html))
print(f'Divs open: {divs_open}, close: {divs_close}')

# Check critical IDs
check_ids = [
    'gm-node-1', 'gm-node-2', 'gm-node-3', 'gm-node-4', 'gm-node-5', 'gm-node-6',
    'gm-floating-day-label', 'gm-floating-day-sub',
    'gm-pane-9', 'gm-pane-10',
    'sp5-slide-1', 'sp5-slide-2', 'sp5-slide-3', 'sp5-slide-4',
    'sp5-pill-1', 'sp5-pill-2', 'sp5-pill-3', 'sp5-pill-4',
    'ppt-counter-badge-4'
]

for node_id in check_ids:
    count = html.count(f'id="{node_id}"')
    print(f'{node_id}: {count}')
