from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import json,re,urllib.request,urllib.error
r=Path(__file__).resolve().parents[1];manifest=json.loads((r/'route-manifest.json').read_text());cfg=json.loads((r/'vercel.json').read_text());rows=[]
def inspect(route):
 url=route['canonical'];res=urllib.request.urlopen(url,timeout=20);h=res.headers;b=res.read().decode();assert res.status==200;assert 'noindex' not in h.get('x-robots-tag','').lower();assert 'content="index,follow"' in b;assert f'rel="canonical" href="{url}"' in b;assert f'property="og:url" content="{url}"' in b;json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>',b).group(1));return {'url':url,'status':res.status,'indexable':True,'schemaParsed':True}
with ThreadPoolExecutor(max_workers=5) as pool:rows=list(pool.map(inspect,[x for x in manifest['routes'] if x['path']!='/404/']))
sitemap=urllib.request.urlopen('https://hireyardu.com/sitemap.xml').read().decode();assert len(re.findall('<loc>',sitemap))==30
robots=urllib.request.urlopen('https://hireyardu.com/robots.txt').read().decode();assert 'Disallow: /' not in robots and 'Sitemap: https://hireyardu.com/sitemap.xml' in robots
for x in cfg['redirects']:
 res=urllib.request.urlopen('https://hireyardu.com'+x['source'],timeout=20);assert res.url=='https://hireyardu.com'+x['destination'],(x,res.url)
try:urllib.request.urlopen('https://hireyardu.com/not-a-real-yardu-page/',timeout=20);raise AssertionError('soft404')
except urllib.error.HTTPError as e:assert e.code==404
result={'status':'passed','pages':rows,'sitemapURLs':30,'robots':robots,'redirectsVerified':len(cfg['redirects']),'missingPageStatus':404,'providerIndexing':'not yet verified'}
(r/'qa/release/live-results.json').write_text(json.dumps(result,indent=2));print(json.dumps({k:v for k,v in result.items() if k!='pages'}))
