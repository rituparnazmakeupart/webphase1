from pathlib import Path
from html.parser import HTMLParser
import re, json, sys
ROOT=Path(__file__).resolve().parents[1]
class P(HTMLParser):
    def __init__(self): super().__init__(); self.title=''; self.h1=0; self.ids=set(); self.dupe=[]; self.meta=set(); self.lang=None; self.links=[]; self.srcs=[]; self.styles=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='html' and 'lang' in a:self.lang=a['lang']
        if tag=='h1':self.h1+=1
        if 'id' in a:
            if a['id'] in self.ids:self.dupe.append(a['id'])
            self.ids.add(a['id'])
        if tag=='meta' and a.get('name') in ('description','robots'): self.meta.add(a['name'])
        if tag=='link' and a.get('rel')=='canonical': self.meta.add('canonical')
        if tag=='link' and a.get('href','').endswith('.css'): self.styles.append(a['href'])
        if tag=='script' and a.get('src'): self.srcs.append(a['src'])
        if tag=='a' and a.get('href'): self.links.append(a['href'])
        if tag=='img' and a.get('src'): self.srcs.append(a['src'])
    def handle_startendtag(self,tag,attrs): self.handle_starttag(tag,attrs)

errors=[]; pages=list(ROOT.rglob('*.html'))
for p in pages:
    parser=P(); parser.feed(p.read_text(errors='ignore'))
    rel=p.relative_to(ROOT)
    s=p.read_text(errors='ignore')
    if '<title>' not in s or '</title>' not in s: errors.append(f'{rel}: missing title')
    if 'name="description"' not in s: errors.append(f'{rel}: missing description')
    if 'rel="canonical"' not in s: errors.append(f'{rel}: missing canonical')
    if parser.h1>1: errors.append(f'{rel}: multiple h1 ({parser.h1})')
    if parser.h1<1 and rel.name not in ('privacy-policy.html','terms.html'): errors.append(f'{rel}: missing h1')
    if not parser.lang: errors.append(f'{rel}: missing lang')
    if parser.dupe: errors.append(f'{rel}: duplicate ids {parser.dupe}')
    base=p.parent
    for href in parser.links+parser.srcs+parser.styles:
        if not href or href.startswith(('http:','https:','mailto:','tel:','#','javascript:','data:')): continue
        target=(base/href.split('#',1)[0].split('?',1)[0]).resolve()
        # directories may intentionally point at index.html
        if target.is_dir(): target=target/'index.html'
        if not target.exists(): errors.append(f'{rel}: broken local reference {href}')

# Check JSON-LD blocks parse.
for p in pages:
    s=p.read_text(errors='ignore')
    for block in re.findall(r'<script type="application/ld\+json">(.*?)</script>',s,re.S):
        try: json.loads(block)
        except Exception as e: errors.append(f'{p.relative_to(ROOT)}: invalid JSON-LD {e}')

# Check robots / sitemap exist
for name in ('robots.txt','sitemap.xml','site.webmanifest','favicon.svg','CONFIG.md','README.md'):
    if not (ROOT/name).exists(): errors.append(f'missing {name}')

print(f'HTML pages: {len(pages)}')
print('ERRORS:', len(errors))
for e in errors[:200]: print(e)
sys.exit(1 if errors else 0)
