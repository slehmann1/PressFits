import math
import unittest

from arc import Arc


class TestMesh(unittest.TestCase):
    def assert_tuples_almost_equal(self, a, b, delta=0.01):
        for i in range(len(a)):
            self.assertAlmostEqual(a[i], b[i], delta=delta)

    def test_polar_to_cartesian(self):
        self.assert_tuples_almost_equal(Arc._polar_to_cartesian(0, 1), (1, 0))
        self.assert_tuples_almost_equal(Arc._polar_to_cartesian(math.pi / 2, 1), (0, 1))
        self.assert_tuples_almost_equal(
            Arc._polar_to_cartesian(math.pi / 4, 1), (0.707, 0.707)
        )

    def test_nodes_for_arc(self):
        nodes = Arc(math.pi / 8, 5, 0).nodes
        self.assertAlmostEqual(len(nodes), 5)
        self.assertAlmostEqual(nodes[0].x, 5, delta=0.01)
        self.assertAlmostEqual(nodes[0].y, 0, delta=0.01)
        self.assertAlmostEqual(nodes[1].x, 4.619, delta=0.01)
        self.assertAlmostEqual(nodes[1].y, 1.914, delta=0.01)
        self.assertAlmostEqual(nodes[2].x, 3.535, delta=0.01)
        self.assertAlmostEqual(nodes[2].y, 3.535, delta=0.01)
        self.assertAlmostEqual(nodes[3].x, 1.913, delta=0.01)
        self.assertAlmostEqual(nodes[3].y, 4.619, delta=0.01)
        self.assertAlmostEqual(nodes[4].x, 0.0, delta=0.01)
        self.assertAlmostEqual(nodes[4].y, 5, delta=0.01)
