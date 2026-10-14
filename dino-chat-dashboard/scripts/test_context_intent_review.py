import copy
import json
import unittest
from build_sampled_conversation_analysis import ROOT, build, load_transcripts, reviewed_intents


class ContextReviewTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = build()
        cls.review = json.loads((ROOT / 'analysis/intent-context-review.json').read_text())
        cls.transcripts = load_transcripts()

    def test_all_sessions_reviewed_and_anchors_match_original(self):
        for entry, rows in self.data['samples'].items():
            self.assertEqual(len(rows), 160)
            self.assertEqual(len({r['sid'] for r in rows}), 160)
            for row in rows:
                messages = self.transcripts[str(row['sid'])]['messages']
                self.assertEqual(row['intentReview']['messageCount'], len(messages))
                self.assertEqual(bool(row['intents']), row['intentReview']['status'] == 'coded')
                for key in row['intents']:
                    evidence = row['quotes']['intents'][key]
                    source = messages[evidence['messageIndex']]
                    self.assertEqual(source['role'], 'user')
                    self.assertEqual(evidence['original'], source['text'])
                    self.assertEqual(evidence['timestamp'], source['timestamp'])
                    self.assertTrue(evidence['context'])
                    self.assertTrue(row['intentReview']['rationale'])
                    for context in evidence['context']:
                        self.assertEqual(context['original'], messages[context['messageIndex']]['text'])

    def test_transcript_change_requires_re_review(self):
        changed = copy.deepcopy(self.transcripts['11965'])
        changed['messages'][0]['text'] = 'Changed source'
        with self.assertRaisesRegex(ValueError, 'changed since contextual review'):
            reviewed_intents(self.review, 'POST_CLASS', 11965, changed)
        with self.assertRaises(KeyError):
            reviewed_intents(self.review, 'POST_CLASS', -1, changed)

    def test_contextual_counterexamples_and_multilabel(self):
        post = {r['sid']: r for r in self.data['samples']['POST_CLASS']}
        for sid in (11602, 13081, 13152, 12720, 12187):
            self.assertEqual(post[sid]['intents'], ['lesson'])
        self.assertFalse(post[11530]['intents'], 'read in an incoherent fragment is not a practice goal')
        self.assertFalse(post[13107]['intents'], 'opening OK is not automatic lesson intent')
        self.assertEqual(set(post[11965]['intents']), {'identity_curiosity', 'self_expression', 'lesson'})
        self.assertIn('calculation', post[12079]['intents'])
        self.assertNotIn('lesson', post[12079]['intents'])
        self.assertIn('clarification', post[11912]['intents'], 'a word-meaning request belongs to clarification')
        self.assertNotIn('practice', post[11912]['intents'], 'word meaning alone is no longer English practice')
        home = {r['sid']: r for r in self.data['samples']['HOME']}
        self.assertFalse(home[9826]['intents'], 'a long prompted conversation need not imply companionship')
        self.assertNotIn('practice', home[9347]['intents'], 'language switching is not English learning')
        explore = {r['sid']: r for r in self.data['samples']['EXPLORE']}
        self.assertIn('self_expression', explore[406]['intents'])
        self.assertNotIn('games', explore[406]['intents'], 'sharing a Minecraft creation is not asking Dino to play')

    def test_clarification_merge_preserves_distinct_intents(self):
        expected = {
            'HOME': {'clarification': 15, 'repair': 8, 'practice': 0},
            'EXPLORE': {'clarification': 17, 'repair': 16, 'practice': 8},
            'POST_CLASS': {'clarification': 9, 'repair': 8, 'practice': 3},
        }
        for entry, counts in expected.items():
            rows = self.data['samples'][entry]
            for key, count in counts.items():
                self.assertEqual(sum(key in row['intents'] for row in rows), count, (entry, key))
            for row in rows:
                self.assertEqual(len(row['intents']), len(set(row['intents'])))
                if 'clarification' not in row['intents']:
                    continue
                anchor = row['quotes']['intents']['clarification']['messageIndex']
                for other in ('repair', 'practice'):
                    if other in row['intents']:
                        self.assertNotEqual(anchor, row['quotes']['intents'][other]['messageIndex'],
                                            'coexisting labels require independent contextual evidence')
        for entry, sid in [('HOME', 8794), ('POST_CLASS', 12680), ('POST_CLASS', 12799), ('POST_CLASS', 11912)]:
            row = next(row for row in self.data['samples'][entry] if row['sid'] == sid)
            self.assertIn('clarification', row['intents'])
            self.assertNotIn('repair', row['intents'])
            self.assertNotIn('practice', row['intents'])
        home = {row['sid']: row for row in self.data['samples']['HOME']}
        self.assertEqual(home[9732]['intents'], ['clarification'], 'HOME-only human correction')
        self.assertEqual(home[9732]['quotes']['intents']['clarification']['messageIndex'], 0)
        self.assertEqual(home[9732]['quotes']['intents']['clarification']['original'], 'Call. How did you say hello?')
        self.assertNotIn('practice', home[9732]['quotes']['intents'])
        for sid in (9552, 9553):
            self.assertIn('repair', home[sid]['intents'])
            self.assertNotIn('clarification', home[sid]['intents'], 'Dino volunteering definitions is not a student request')
        post = {row['sid']: row for row in self.data['samples']['POST_CLASS']}
        self.assertIn('practice', post[11805]['intents'], 'chair spelling request remains practice')
        self.assertIn('director', post[13070]['intents'], 'quiet speech requested for sleep, not understanding')
        self.assertNotIn('clarification', post[13070]['intents'])
        self.assertNotIn('repair', post[13070]['intents'])

    def test_fixed_denominator_includes_uncertainty(self):
        for entry, rows in self.data['samples'].items():
            for level in ('1', '2', '3', '4'):
                selected = [r for r in rows if r['level'] == level]
                self.assertEqual(len(selected), 40)
                for key in self.data['codebooks']['intents']:
                    numerator = len({r['sid'] for r in selected if key in r['intents']})
                    self.assertLessEqual(numerator, len(selected))
            self.assertGreater(len([r for r in rows if not r['intents']]), 0)
        self.assertTrue(all('pattern' not in d for d in self.data['codebooks']['intents'].values()))

    def test_support_merged_into_expression_without_double_counting(self):
        self.assertNotIn('support', self.data['codebooks']['intents'])
        for entry, expected in {'HOME': 14, 'EXPLORE': 21, 'POST_CLASS': 12}.items():
            rows = self.data['samples'][entry]
            self.assertEqual(sum('self_expression' in row['intents'] for row in rows), expected)
            self.assertEqual(len(rows), 160)
            for row in rows:
                self.assertNotIn('support', row['intents'])
                self.assertNotIn('support', row['quotes']['intents'])
                self.assertEqual(len(row['intents']), len(set(row['intents'])))
        for entry, sid, indices in [('HOME', 6888, [0, 2]), ('EXPLORE', 1706, [2, 4]),
                                    ('EXPLORE', 601, [42]), ('POST_CLASS', 13070, [2, 6])]:
            row = next(r for r in self.data['samples'][entry] if r['sid'] == sid)
            quote = row['quotes']['intents']['self_expression']
            self.assertEqual(quote['messageIndices'], indices)
            context = {m['messageIndex']: m for m in quote['context']}
            self.assertEqual(len(context), len(quote['context']))
            for index in indices:
                self.assertEqual(context[index]['original'], self.transcripts[str(sid)]['messages'][index]['text'])

    def test_tool_use_merge_is_union_and_keeps_both_evidence_anchors(self):
        expected = {
            'HOME': {6888, 4500, 5060, 3528, 8051, 7784, 2601},
            'EXPLORE': {1185, 1202, 729, 22, 829, 18, 1731},
            'POST_CLASS': {13070},
        }
        self.assertEqual(self.data['codebooks']['intents']['tool_use']['label'], '把Dino当成工具使用')
        self.assertNotIn('task', self.data['codebooks']['intents'])
        self.assertNotIn('information', self.data['codebooks']['intents'])
        for entry, ids in expected.items():
            rows = self.data['samples'][entry]
            self.assertEqual({r['sid'] for r in rows if 'tool_use' in r['intents']}, ids)
            for row in rows:
                self.assertEqual(len(row['intents']), len(set(row['intents'])))
                for old_key in ('task', 'information'):
                    self.assertNotIn(old_key, row['intents'])
                    self.assertNotIn(old_key, row['quotes']['intents'])
        explore = {r['sid']: r for r in self.data['samples']['EXPLORE']}
        for sid, indices in {22: [0, 2], 18: [2, 34], 1731: [4, 8]}.items():
            quote = explore[sid]['quotes']['intents']['tool_use']
            self.assertEqual(quote['messageIndices'], indices)
            contexts = {m['messageIndex']: m for m in quote['context']}
            self.assertEqual(len(contexts), len(quote['context']))
            for index in indices:
                self.assertEqual(contexts[index]['role'], 'user')
                self.assertEqual(contexts[index]['original'], self.transcripts[str(sid)]['messages'][index]['text'])
        calculation = next(r for r in self.data['samples']['POST_CLASS'] if r['sid'] == 12079)
        self.assertIn('calculation', calculation['intents'], 'only the two requested categories are merged')
        self.assertNotIn('tool_use', calculation['intents'])

    def test_home_director_merged_into_tool_use_only(self):
        home = self.data['samples']['HOME']
        self.assertTrue(all('director' not in row['intents'] for row in home))
        self.assertTrue(all('director' not in row['quotes']['intents'] for row in home))
        row = next(r for r in home if r['sid'] == 8051)
        self.assertEqual(row['intents'], ['tool_use'])
        quote = row['quotes']['intents']['tool_use']
        self.assertEqual(quote['messageIndices'], [2, 18])
        context = {m['messageIndex']: m for m in quote['context']}
        for index in (2, 18):
            self.assertEqual(context[index]['original'], self.transcripts['8051']['messages'][index]['text'])
        for entry in ('EXPLORE', 'POST_CLASS'):
            self.assertEqual(sum('director' in r['intents'] for r in self.data['samples'][entry]), 2)


if __name__ == '__main__':
    unittest.main()
