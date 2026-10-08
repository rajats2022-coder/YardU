from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
import urllib.request,json,difflib
root=Path(__file__).resolve().parents[1];out=root/'qa/live-baseline';out.mkdir(parents=True,exist_ok=True)
manifest=json.loads((root/'route-manifest.json').read_text())
new={'/services/'+s+'/' for s in ['plant-installs','aeration-overseeding','drainage','christmas-light-installs','snow-removal']}
class Text(HTMLParser):
 def __init__(self):super().__init__();self.depth=0;self.skip=0;self.parts=[]
 def handle_starttag(self,t,a):
  if t=='main':self.depth+=1
  if t in ['script','style']:self.skip+=1
 def handle_endtag(self,t):
  if t=='main':self.depth-=1
  if t in ['script','style']:self.skip=max(0,self.skip-1)
 def handle_data(self,s):
  if self.depth and not self.skip and s.strip():self.parts.append(' '.join(s.split()))
def fetch(r):
 path=r['path'];url='https://hireyardu.com'+path
 try:
  with urllib.request.urlopen(url,timeout=15) as response:b=response.read().decode();code=response.status
 except Exception as e:return {'path':path,'error':str(e)}
 (out/(path.strip('/').replace('/','-') or 'home')).with_suffix('.html').write_text(b)
 p=Text();p.feed(b);q=Text();q.feed((root/'dist'/('index.html' if path=='/' else path.strip('/')+'/index.html')).read_text())
 changes=[]
 for tag,i,j,k,l in difflib.SequenceMatcher(a=p.parts,b=q.parts,autojunk=False).get_opcodes():
  if tag!='equal':changes.append({'operation':tag,'live':p.parts[i:j],'candidate':q.parts[k:l]})
 return {'path':path,'status':code,'changes':changes}
with ThreadPoolExecutor(max_workers=5) as pool:results=list(pool.map(fetch,[r for r in manifest['routes'] if r['path'] not in new and r['path']!='/404/']))
(out/'comparison.json').write_text(json.dumps(results,indent=2))
for r in results:print(json.dumps(r))
