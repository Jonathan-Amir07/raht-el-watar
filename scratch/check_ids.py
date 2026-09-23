import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('c:/Users/Dell/Desktop/raht/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

ids = ['collab-grand-stage', 'collab-curtains-wrap', 'collab-main-card', 'collab-god-rays', 'collab-stage-flash', 'curtain-start-prompt']
for id_name in ids:
    found = f'id="{id_name}"' in text
    print(f"id='{id_name}': {found}")
