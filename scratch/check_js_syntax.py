import sys
import subprocess

sys.stdout.reconfigure(encoding='utf-8')

with open('c:/Users/Dell/Desktop/raht/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

script_start = text.find('<script>')
script_end = text.rfind('</script>')

if script_start != -1 and script_end != -1:
    js_code = text[script_start + 8:script_end]
    with open('c:/Users/Dell/Desktop/raht/scratch/extracted_app.js', 'w', encoding='utf-8') as f:
        f.write(js_code)
    
    res = subprocess.run(['node', '-c', 'c:/Users/Dell/Desktop/raht/scratch/extracted_app.js'], capture_output=True, text=True)
    if res.returncode == 0:
        print("JavaScript syntax check PASSED! 0 errors.")
    else:
        print("JavaScript syntax check FAILED:")
        print(res.stderr)
else:
    print("Could not locate <script> tag.")
