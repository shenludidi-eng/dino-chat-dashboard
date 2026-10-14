"""Read complete fixed-sample conversations without exposing previous labels."""
import argparse
from build_sampled_conversation_analysis import ROOT, load_js, load_transcripts

p = argparse.ArgumentParser()
p.add_argument('entry')
p.add_argument('start', type=int)
p.add_argument('stop', type=int)
p.add_argument('--clarification-review', action='store_true', help='Read sessions with clarification, repair or practice labels')
a = p.parse_args()
data = load_js(ROOT / 'sampled-conversation-analysis-data.js', 'window.DINO_SAMPLED_CONVERSATION_ANALYSIS=')
transcripts = load_transcripts()
rows = data['samples'][a.entry]
if a.clarification_review:
    rows = [row for row in rows if set(row['intents']) & {'clarification', 'repair', 'practice'}]
for i, row in enumerate(rows[a.start:a.stop], a.start):
    print(f"\n### {i} / {row['sid']}")
    for n, m in enumerate(transcripts[str(row['sid'])]['messages'], 1):
        print(f"{n}{'U' if m['role'] == 'user' else 'D'} {m['text']}")
        if m.get('translation'):
            print('EN:', m['translation'])
