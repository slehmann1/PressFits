import unittest

import model
from element import PSElement
from model import Material, PlaneStressPressFitModel
from node import Node


class TestModel(unittest.TestCase):
    def test_get_nodal_values(self):
        self.assertEqual(
            model.get_nodal_values(
                " -1         2 1.35482E-19-6.20349E-19 0.00000E+00 2.54990E-19 4.75510E-20-2.09578E-21"
            ),
            (
                2,
                [
                    1.35482e-19,
                    -6.20349e-19,
                    0.00000e00,
                    2.54990e-19,
                    4.75510e-20,
                    -2.09578e-21,
                ],
            ),
        )

        self.assertEqual(
            model.get_nodal_values(
                " -1       198-2.51429E-07-1.86198E-07-1.31288E-07 9.91760E-07 7.78733E-09 9.83727E-08"
            ),
            (
                198,
                [
                    -2.51429e-07,
                    -1.86198e-07,
                    -1.31288e-07,
                    9.91760e-07,
                    7.78733e-09,
                    9.83727e-08,
                ],
            ),
        )

        self.assertEqual(
            model.get_nodal_values(" -1        42 6.62991E-08 8.29837E-08 1.78870E-09"),
            (42, [6.62991e-08, 8.29837e-08, 1.78870e-09]),
        )

        self.assertEqual(
            model.get_nodal_values(" -1         3-3.93642E-04 9.50334E-04 0.00000E+00"),
            (3, [-3.93642e-04, 9.50334e-04, float(0.0)]),
        )
