import unittest
from time import time

import matplotlib.pyplot as plt

from pressfits.element import Element
from pressfits.model import AxisymmetricPressFitModel, Material
from pressfits.node import Node


class TestAxisymmetricPressFitModel(unittest.TestCase):
    def test_model(self):
        """Functional test of how press fit model radial displacements over several cases
        compares to stress and deflection results from Ansys mechanical model."""
        permissible_discrepancy = (
            0.1  # Percent allowable difference allowed from theoretical model
        )

        steel = Material(name="Steel", youngs_modulus=2.1e11, poissons_ratio=0.3)
        al_6061 = Material(
            name="Aluminium", youngs_modulus=6.89e10, poissons_ratio=0.33
        )

        model = AxisymmetricPressFitModel(
            0.02, 0.03, 0.0301, 0.05, 0.015, 0.015, 0, "Press_Model"
        )

        model.run_model(steel, al_6061)
        model.read_nodal_results()
        model.read_element_results()
        # Test stress against ansys model
        theoretical_result = (244.05, 208.75)
        self.assert_values_within_percentage(
            (model.max_element_vm_stress(0), model.max_element_vm_stress(1)),
            theoretical_result,
            permissible_discrepancy,
        )
        # Test deflection against ansys model
        theoretical_result = (0.000011902, 0.000027992)
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

    @staticmethod
    def convergence_plot():
        """Creates a convergence plot of the nubmer of lines within a model vs the element von mises stresses"""
        line_counts = list(range(3, 49, 2))

        part_0 = []
        part_1 = []

        steel = Material(name="Steel", youngs_modulus=2.1e11, poissons_ratio=0.3)
        al_6061 = Material(
            name="Aluminium", youngs_modulus=6.89e10, poissons_ratio=0.33
        )

        for line_count in line_counts:
            print(f"Line Count: {line_count}")
            Node.reset_node_count()
            Element.reset_element_count()
            model = AxisymmetricPressFitModel(
                0.02,
                0.03,
                0.0301,
                0.05,
                0.015,
                0.015,
                0,
                "Press_Model",
                lines_per_part=line_count,
            )
            model.run_model(steel, al_6061)
            model.read_nodal_results()
            model.read_element_results()

            part_0.append(model.max_element_vm_stress(0))
            part_1.append(model.max_element_vm_stress(1))

        plt.plot(line_counts, part_0, label="Part 0 Stress")
        plt.plot(line_counts, part_1, label="Part 1 Stress")
        plt.ylabel("Maximum Stress (MPa)")
        plt.xlabel("Number of lines")
        plt.title("Convergence plot")
        plt.legend()
        plt.show()

    @staticmethod
    def time_plot(iterations=10):
        """Create an execution time plot for varying line quantities

        Args:
            iterations (int, optional): Number of iterations of each line count to plot. Defaults to 10.
        """
        line_counts = list(range(3, 49, 2))

        times = []

        steel = Material(name="Steel", youngs_modulus=2.1e11, poissons_ratio=0.3)
        al_6061 = Material(
            name="Aluminium", youngs_modulus=6.89e10, poissons_ratio=0.33
        )

        for line_count in line_counts:
            print(f"Line Count: {line_count}")
            timer = time()
            for _ in range(iterations):

                Node.reset_node_count()
                Element.reset_element_count()
                model = AxisymmetricPressFitModel(
                    0.02,
                    0.03,
                    0.0301,
                    0.05,
                    0.015,
                    0.015,
                    0,
                    "Press_Model",
                    lines_per_part=line_count,
                )
                model.run_model(steel, al_6061)
                model.read_nodal_results()
                model.read_element_results()

            times.append(time() - timer)

        plt.plot(line_counts, times)
        plt.ylabel("Elapsed time (s)")
        plt.xlabel("Number of lines")
        plt.title("Times for line count")
        plt.show()
