import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('c:/Users/Dell/Desktop/raht/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('إعلان الشراكة المستقبلية')
print(text[idx-400:idx])
