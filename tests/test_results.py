import unittest
from results import Stress


class TestResults(unittest.TestCase):
    def test_von_mises_stress(self):
        self.assertAlmostEqual(Stress(1,2,3,4,5,6).get_von_mises(), 15.3, delta = 0.1)
        self.assertAlmostEqual(Stress(8,9,3,7,5,4).get_von_mises(), 17.35, delta = 0.1)
        self.assertAlmostEqual(Stress(1,28.7,3,18.6,52.5,0).get_von_mises(), 100.1, delta = 0.1)
