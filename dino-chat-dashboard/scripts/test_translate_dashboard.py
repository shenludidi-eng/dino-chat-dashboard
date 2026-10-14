import unittest
from translate_dashboard import validated_rows


class ResponseValidation(unittest.TestCase):
    def test_mixed_batch(self):
        batch=[{'text':'Hello.'},{'text':'Chào bạn.'}]
        rows=validated_rows({'english_ids':['0'],'translations':[{'id':'1','english':'Hello.','language':'vi'}]},batch)
        self.assertEqual({r['text']:r['english'] for r in rows},{'Hello.':None,'Chào bạn.':'Hello.'})

    def test_all_english(self):
        rows=validated_rows({'all_english':True},[{'text':'Hello.'}])
        self.assertEqual(rows[0]['status'],'english')

    def test_redundant_english_marker(self):
        rows=validated_rows({'english_ids':[0],'translations':[{'id':0,'english':'Hello.'}]},[{'text':'Chào.'}])
        self.assertEqual(len(rows),1)
        self.assertEqual(rows[0]['english'],'Hello.')

    def test_missing_or_duplicate_or_invalid_ids(self):
        for ids in ([],[0,0],[1],[-1],[True]):
            with self.assertRaises(AssertionError):
                validated_rows({'english_ids':ids},[{'text':'Hello.'}])

    def test_empty_translation(self):
        with self.assertRaises(AssertionError):
            validated_rows({'translations':[{'id':0,'english':''}]},[{'text':'Chào.'}])

    def test_uncertainty_and_masking(self):
        batch=[{'text':'Xin chào ** ***.'}]
        row={'id':0,'english':'Hello ** ***. [Unclear fragment.]','uncertain':True}
        self.assertEqual(validated_rows({'translations':[row]},batch)[0]['status'],'unclear')
        row['english']='Hello [masked].'
        with self.assertRaises(AssertionError):
            validated_rows({'translations':[row]},batch)

    def test_contradictory_classification(self):
        with self.assertRaises(AssertionError):
            validated_rows({'all_english':True,'translations':[{'id':0,'english':'Hi.'}]},[{'text':'Chào.'}])


if __name__=='__main__':
    unittest.main()
