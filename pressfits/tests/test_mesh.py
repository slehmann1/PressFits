import math
import unittest

from pressfits.concentric_plane_stress_mesh import ConcentricPlaneStressMesh, PSElement
from pressfits.curves import Arc
from pressfits.node import Node


class TestMesh(unittest.TestCase):
    def assert_tuples_almost_equal(self, a, b, delta=0.01):
        for i in range(0, len(a)):
            self.assertAlmostEqual(a[i], b[i], delta=delta)

    def test_get_arc_edge_ids(self):
        arcs = [Arc(math.pi / 8, radius, 0) for radius in range(1, 5)]
        vertical_ids = ConcentricPlaneStressMesh._get_curve_edge_ids(
            arcs, is_neg_edge=True
        )
        horizontal_ids = ConcentricPlaneStressMesh._get_curve_edge_ids(
            arcs, is_neg_edge=False
        )

        self.assertEqual(len(vertical_ids), len(arcs))
        self.assertEqual(len(horizontal_ids), len(arcs))

        for i, id in enumerate(vertical_ids):
            self.assertAlmostEqual(arcs[i].node_by_id(id).x, 0, delta=0.01)

        for i, id in enumerate(horizontal_ids):
            self.assertAlmostEqual(arcs[i].node_by_id(id).y, 0, delta=0.01)

    def test_get_elements(self):

        angular_spacing = math.pi / 16

        elements = [
            PSElement(
                [
                    Node(1, 0),
                    Node(3, 0),
                    Node(2.772, 1.149),
                    Node(0.924, 0.383),
                    Node(2, 0),
                    Node(2.942, 0.585),
                    Node(1.848, 0.765),
                    Node(0.981, 0.196),
                ]
            )
        ]

        self.assert_arc_elements(angular_spacing, 1, 5, elements, 8)

        angular_spacing = math.pi / 32

        elements = [
            PSElement(
                [
                    Node(1, 0),
                    Node(3, 0),
                    Node(2.942, 0.585),
                    Node(0.981, 0.196),
                    Node(2, 0),
                    Node(2.986, 0.294),
                    Node(1.962, 0.390),
                    Node(0.995, 0.098),
                ]
            ),
            PSElement(
                [
                    Node(0.981, 0.196),
                    Node(2.942, 0.585),
                    Node(2.772, 1.148),
                    Node(0.924, 0.383),
                    Node(1.962, 0.390),
                    Node(2.871, 0.871),
                    Node(1.848, 0.765),
                    Node(0.957, 0.290),
                ]
            ),
        ]

        self.assert_arc_elements(angular_spacing, 1, 5, elements, 16)

    def assert_arc_elements(self, angular_spacing, id, od, elements, desired_count):
        """Asserts that the elements created by mesh.get_elements() and the elements passed as a parameter match. Spaces arcs by 1 int value.

        Args:
            angular_spacing (float): Angle to space nodes at
            id (int): Internal diameter of part
            od (int): External diameter of part
            elements (list[Element]): A list of elements to compare the mesh.get_elements values against
        """
        arcs = [Arc(angular_spacing, radius, 0) for radius in range(id, od + 1)]
        test_elements = ConcentricPlaneStressMesh._gen_elements(
            arcs, node_spacing=angular_spacing
        )
        self.assertEqual(len(test_elements[0].nodes), len(elements[0].nodes))

        for i in range(len(elements)):
            self.assertTrue(self.compare_elements(test_elements[i], elements[i]))
            self.assertTrue(self.compare_elements(test_elements[i], elements[i]))

        self.assertEqual(len(test_elements), desired_count)

    def compare_elements(self, a, b, delta=0.001):
        return all(
            self.compare_nodes(a.nodes[i], b.nodes[i], delta=0.001) != False
            for i in range(len(a.nodes))
        )

    def compare_nodes(self, a, b, delta=0.001):
        self.assertAlmostEqual(a.x, b.x, delta=delta)
        self.assertAlmostEqual(a.y, b.y, delta=delta)
