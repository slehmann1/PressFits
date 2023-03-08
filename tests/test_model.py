import unittest

import model
from model import Material, PressFitModel
from node import Node
from plane_stress_element import PSElement


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

    def test_model_stresses(self):
        """Functional test of how press fit model VM stresses over several cases
        compares to theoretical results from lame equations."""
        permissible_discrepancy = (
            0.2  # Percent allowable difference allowed from theoretical model
        )

        steel = Material(
            name="Steel", youngs_modulus=2.1e11, poissons_ratio=0.3, density=7800
        )
        al_6061 = Material(
            name="Aluminium",
            youngs_modulus=6.89e10,
            poissons_ratio=0.33,
            density=2700,
        )

        model = PressFitModel(0.4, 0.5, 0.5001, 0.6, "Press_Model")
        model.run_model(steel, al_6061)
        model.read_nodal_results()
        model.read_element_results()
        theoretical_result = (10.53, 11.57)
        self.assert_values_within_percentage(
            (model.max_element_vm_stress(0), model.max_element_vm_stress(1)),
            theoretical_result,
            permissible_discrepancy,
        )

        # Swapped materials
        model.run_model(al_6061, steel)
        model.read_nodal_results()
        model.read_element_results()
        theoretical_result = (12.46, 13.7)
        self.assert_values_within_percentage(
            (model.max_element_vm_stress(0), model.max_element_vm_stress(1)),
            theoretical_result,
            permissible_discrepancy,
        )

        Node.reset_node_count()
        PSElement.reset_element_count()
        # Significantly larger size
        model = PressFitModel(3, 5, 5.002, 7, "Press_Model")
        model.run_model(steel, al_6061)
        model.read_nodal_results()
        model.read_element_results()
        theoretical_result = (21.47, 25.32)
        self.assert_values_within_percentage(
            (model.max_element_vm_stress(0), model.max_element_vm_stress(1)),
            theoretical_result,
            permissible_discrepancy,
        )

        # Swapped materials
        model.run_model(al_6061, steel)
        model.read_nodal_results()
        model.read_element_results()
        theoretical_result = (29.65, 34.97)
        self.assert_values_within_percentage(
            (model.max_element_vm_stress(0), model.max_element_vm_stress(1)),
            theoretical_result,
            permissible_discrepancy,
        )

    def test_model(self):
        """Functional test of how press fit model radial displacements over several cases
        compares to stress and deflection results from Ansys mechanical model."""
        permissible_discrepancy = (
            0.2  # Percent allowable difference allowed from theoretical model
        )

        steel = Material(
            name="Steel", youngs_modulus=2.1e11, poissons_ratio=0.3, density=7800
        )
        al_6061 = Material(
            name="Aluminium",
            youngs_modulus=6.89e10,
            poissons_ratio=0.33,
            density=2700,
        )

        model = PressFitModel(0.02, 0.03, 0.0301, 0.05, "Press_Model")
        model.run_model(steel, al_6061)
        model.read_nodal_results()
        model.read_element_results()
        # Test stress against ansys model
        theoretical_result = (257.6, 197.79)
        self.assert_values_within_percentage(
            (model.max_element_vm_stress(0), model.max_element_vm_stress(1)),
            theoretical_result,
            permissible_discrepancy,
        )
        # Test deflection against ansys model
        theoretical_result = (0.000012017, 0.000028864)
        self.assert_values_within_percentage(
            (model.get_radial_deflections()),
            theoretical_result,
            permissible_discrepancy,
        )

    def assert_values_within_percentage(self, values_1, values_2, percentage=0.1):
        """Asserts that a collection of values are within a percentage range of another set of values

        Args:
            values_1 (list()): Collection of values. Used to define percentage range.
            values_2 (list()): Collection of values
            percentage (float, optional): Bilateral percent tolerance on values within values_1. Defaults to 0.1.
        """
        for i in range(len(values_1)):
            self.assertAlmostEqual(
                values_1[i], values_2[i], delta=values_1[i] * percentage
            )
