"""Compile the existing course into a buildless learning site."""
from pathlib import Path
import json
import re
import shutil
import markdown

ROOT = Path(__file__).resolve().parent
COURSE = ROOT.parent / 'course'
DIST = ROOT / 'public'
DIST.mkdir(exist_ok=True)

def render(text):
    # Sources are authored local course files, not user-supplied HTML.
    return markdown.markdown(text, extensions=['fenced_code', 'tables', 'sane_lists'])

lectures = (COURSE / 'LECTURES.md').read_text(encoding='utf-8')
parts = re.split(r'^## (\d{2}) — (.+)$', lectures, flags=re.M)
labs_text = (COURSE / 'LABS.md').read_text(encoding='utf-8')
lab_parts = re.split(r'^## (.+)$', labs_text, flags=re.M)
labs = {lab_parts[i].split(' — ')[0]: render(lab_parts[i+1]) for i in range(1, len(lab_parts), 2)}
assignment_keys = ['Foundation exercises', 'Lab A', 'Lab A', 'Lab B', 'Lab C', 'Lab C', 'Lab D', 'Lab D', 'Lab E', 'Lab E', 'Lab F', None]
assignments = ['Latency summary', 'Borrowed text + telemetry', 'Token budgets + telemetry', 'Retrieval core', 'JSONL ingestion', 'Bounded worker pool', 'Async tool executor', 'Deadlines + cancellation', 'Inference gateway', 'Streaming + shutdown', 'Python extension', 'Capstone integration']
phases = ['Foundations']*4 + ['Data & concurrency']*4 + ['Serving & integration']*4
sessions=[]
core_checkpoints=json.loads((COURSE/'CHECKPOINTS.json').read_text(encoding='utf-8'))
for i in range(1, len(parts), 3):
    n=int(parts[i]); body=parts[i+2].strip()
    outcome=re.search(r'\*\*Outcome:\*\* (.+)', body)
    key=assignment_keys[n-1]
    if key == 'Foundation exercises':
        key=next(k for k in labs if k.startswith(key))
    lab_html=labs.get(key, '')
    if n in (2,3):
        foundation_key=next(k for k in labs if k.startswith('Foundation exercises'))
        lab_html=labs[foundation_key]+'<h2>Applied lab: telemetry analyzer</h2>'+lab_html
    sessions.append({'id':n,'title':parts[i+1], 'outcome':outcome.group(1) if outcome else '', 'html':render(body), 'lab':lab_html, 'assignment':assignments[n-1], 'phase':phases[n-1], 'track':'Core', 'hours':8, 'checkpoints':core_checkpoints[n-1], 'prerequisites':[]})
documents={name:render((COURSE/file).read_text(encoding='utf-8')) for name,file in [('syllabus','SYLLABUS.md'),('setup','SETUP.md'),('research','RESEARCH.md'),('assessment','ASSESSMENT.md'),('capstone','CAPSTONE.md'),('workbook','LABS.md')]}
sessions[-1]['lab']=documents['capstone']
advanced=(COURSE/'ADVANCED.md').read_text(encoding='utf-8')
advanced_parts=re.split(r'^## (\d{2}) — (.+)$',advanced,flags=re.M)
advanced_assignments=['Performance investigation','Allocation-aware normalizer','Candidate scoring layouts','Parallel exact scoring','Vectorized similarity kernel','Retrieval selection shootout','Gateway latency budget','Batched numerical scoring','Optimization change review','Optimizer throughput capstone']
prerequisites=[[5,12],[2,5,13],[4,13],[6,15],[13,15],[4,13],[8,10,13],[11,15],[13,17],[13,16,20]]
for i in range(1,len(advanced_parts),3):
    n=int(advanced_parts[i]);body=advanced_parts[i+2].strip()
    lecture,lab=body.split('### Lab contract — ',1)
    lab,suffix=lab.split('### Checkpoint',1)
    questions,sources=suffix.split('### Sources',1)
    checks=re.findall(r'^\d\. (.+)$',questions,flags=re.M)
    assert len(checks)==3, f'Session {n} requires three checkpoints'
    outcome=re.search(r'\*\*Outcome:\*\* (.+)',lecture).group(1)
    lab_text='### '+lab.strip()+'\n\n### Sources\n'+sources
    sessions.append({'id':n,'title':advanced_parts[i+1],'outcome':outcome,'html':render(lecture+'\n### Sources\n'+sources),'lab':render(lab_text),'assignment':advanced_assignments[n-13],'phase':'Advanced optimization','track':'Advanced','hours':10,'checkpoints':checks,'prerequisites':prerequisites[n-13]})
    documents['workbook']+=render(f'\n## Session {n}: {advanced_parts[i+1]}\n'+lab_text)
assert [s['id'] for s in sessions]==list(range(1,len(sessions)+1))
workshops=(COURSE/'WORKSHOPS.md').read_text(encoding='utf-8')
workshop_parts=re.split(r'^## (\d{2}) — (.+)$',workshops,flags=re.M)
assert [int(workshop_parts[i]) for i in range(1,len(workshop_parts),3)]==[s['id'] for s in sessions]
for i in range(1,len(workshop_parts),3):
    n=int(workshop_parts[i]);body=workshop_parts[i+2].strip()
    explanation,practice=body.split('### Practice studio',1)
    session=sessions[n-1]
    prediction,reasoning=explanation.split('### Worked reasoning',1)
    session['html']+=render('\n## Workshop: '+workshop_parts[i+1]+'\n'+prediction)+'<details><summary>Worked reasoning — open after your prediction</summary>'+render(reasoning)+'</details>'
    session['lab']=render('## Guided practice\n'+practice)+'<hr>'+session['lab']
    session['workshopTitle']=workshop_parts[i+1]
documents['workshops']=render(workshops)
mastery=(COURSE/'MASTERY.md').read_text(encoding='utf-8')
mastery_parts=re.split(r'^## (\d{2}) — (.+)$',mastery,flags=re.M)
assert [int(mastery_parts[i]) for i in range(1,len(mastery_parts),3)]==[s['id'] for s in sessions]
for i in range(1,len(mastery_parts),3):
    n=int(mastery_parts[i])
    sessions[n-1]['mastery']=render('## '+mastery_parts[i+1]+'\n'+mastery_parts[i+2])
documents['mastery']=render(mastery_parts[0])
learning_paths=(COURSE/'LEARNING_PATHS.md').read_text(encoding='utf-8')
learning_parts=re.split(r'^## (\d{2}) — (.+)$',learning_paths,flags=re.M)
assert [int(learning_parts[i]) for i in range(1,len(learning_parts),3)]==[s['id'] for s in sessions]
for i in range(1,len(learning_parts),3):
    n=int(learning_parts[i]);session=sessions[n-1]
    route=render('## Your learning route\n'+learning_parts[i+2])
    session['learningRoute']=route
    session['mastery']=route+'<hr>'+session['mastery']
    session['lab']=route+'<hr>'+session['lab']
documents['learning']=render(learning_paths)
phase_meta=[{'name':name,'ids':[s['id'] for s in sessions if s['phase']==name]} for name in dict.fromkeys(s['phase'] for s in sessions)]
meta={'sessionCount':len(sessions),'coreCount':12,'coreHours':96,'advancedHours':sum(s['hours'] for s in sessions if s['track']=='Advanced'),'totalHours':sum(s['hours'] for s in sessions),'labCount':16,'capstoneCount':2,'phases':phase_meta}
documents['advanced']=render(advanced)
(DIST/'course-config.js').write_text('window.RUST_COURSE_CONFIG = '+json.dumps(meta)+';\n',encoding='utf-8')
(ROOT/'lib/course-config.mjs').write_text(f'// Generated by build.py from the course catalog.\nexport const SESSION_COUNT = {len(sessions)};\nexport const MAX_CHANGES = 1 + 5 * SESSION_COUNT;\n',encoding='utf-8')
for name in ['lib.rs','solutions.rs']:
    dest=DIST/'downloads'/name; dest.parent.mkdir(exist_ok=True)
    shutil.copy2(ROOT.parent/'practice'/'src'/name,dest)
shutil.copy2(ROOT.parent/'practice'/'Cargo.toml',DIST/'downloads'/'Cargo.toml')
for p in COURSE.glob('*.md'):
    shutil.copy2(p,DIST/'downloads'/p.name)
(DIST/'course.json').write_text(json.dumps({'sessions':sessions,'documents':documents,'meta':meta}, ensure_ascii=False),encoding='utf-8')
for file in ['styles.css','mobile.css','sync.css','sync.js','app.js']:
    shutil.copy2(ROOT/file,DIST/file)
print(f'Built {len(sessions)} sessions, {len(documents)} reference sections, and downloads in {DIST}')
