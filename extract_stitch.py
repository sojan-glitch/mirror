import json

path = r'C:\Users\acer\.gemini\antigravity\brain\6ec28550-38d9-4641-8a95-f84c2aed6767\.system_generated\steps\310\output.txt'
with open(path, 'r', encoding='utf-8') as f:
    raw = f.read()

start = raw.find('{')
data = json.loads(raw[start:])
s = data['result']['structuredContent']['outputComponents'][1]['design']['screens'][0]
print('htmlCode keys:', s.get('htmlCode', {}).keys())
print('htmlCode downloadUrl:', s.get('htmlCode', {}).get('downloadUrl'))
print('screenshot downloadUrl:', s.get('screenshot', {}).get('downloadUrl'))
