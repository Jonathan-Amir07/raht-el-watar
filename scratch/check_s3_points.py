with open('c:/Users/Dell/Desktop/raht/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

s3 = text[text.find('id="sp5-slide-3"'):text.find('id="sp5-slide-4"')]
print("4 churches in S3:", "٤ كنائس" in s3)
print("8 churches in S3:", "٨ كنائس" in s3)
print("Overnight camp in S3:", "معسكر مبيت" in s3 and "Overnight Camp" in s3)
