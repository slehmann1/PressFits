import math
import subprocess
from collections import namedtuple

import matplotlib.pyplot as plt
import matplotlib.tri as tri

from pressfits.concentric_axisymmetric_mesh import ConcentricAxisymmetricMesh
from pressfits.concentric_plane_stress_mesh import ConcentricPlaneStressMesh
from pressfits.element import Element
from pressfits.node import Node
from pressfits.results import Displacement, Force, Result, Strain, Stress

_ENTRY_LENGTH = 12
_CMAP = "jet"

Material = namedtuple("Material", "name youngs_modulus poissons_ratio")


class PressFitModel:
    def __init__(self, mesh, name):
        Node.reset_node_count()
        Element.reset_element_count()
        self.mesh = mesh
        self.elements = mesh.get_elements()
        self.nodes = mesh.get_nodes()
        self.name = name
        self.inp_str = ""
        self.nodal_results = ""
        self.elemental_results = ""

    def run_model(self, inner_material, outer_material):
        """Creates an input file and solves the model"""
        self._create_input_file(inner_material, outer_material)

        runstr = f"ccx {self.name}"
        subprocess.check_call(runstr, shell=True)
        print("Solving done!")

    def _create_input_file(self, inner_material, outer_material):
        """Creates a .inp file representing the model"""
        self.inp_str = self.mesh.get_inp_str(inner_material, outer_material)
        with open(f"{self.name}.inp", "w") as f:
            f.write(self.inp_str)

    def get_nodal_results_str(self):
        with open(f"{self.name}.frd", "r") as file:
            data = file.read()
        return data

    def get_elemental_results_str(self):
        with open(f"{self.name}.dat", "r") as file:
            data = file.read()
        return data

    def read_nodal_results(self):
        """Read nodal results from a .frd file"""
        print("Reading Nodal Results")
        # Tracks whether the current lines being read are part of a set of nodal results
        is_results_block = False
        results_block = []

        with open(f"{self.name}.frd", "r") as f:
            for line in f:
                if is_results_block:
                    if line[:3] == " -3":  # End of results block
                        is_results_block = False
                        self._read_nodal_results_block(results_block)
                        continue

                    results_block.append(line)

                elif "1PSTEP" in line:  # Start of results block
                    is_results_block = True
                    results_block = []

    def read_element_results(self):
        """Reads results for elements from a .dat file"""
        print("Reading Element Results")

        with open(f"{self.name}.dat", "r") as f:
            for _ in range(3):
                next(f)  # Skip the header text

            for line in f:
                element_num = int(line[:10])
                line = line[10:]
                line = line.lstrip()

                # Space delimited, first entry is integration point number
                data = line.split(" ")
                data = list(filter(lambda item: item != "", data))
                data = list(map(float, data))

                self.elements[element_num - 1].results.append(Stress(*data[1:]))

    def _read_nodal_results_block(self, block):
        """Read a block of nodal results in a .inp file, as started with the header    1PSTEP                         1           1           1          ...

        Args:
            block (String): Multiline string of the nodal results block, excluding header and footer

        Raises:
            ValueError: Raised if unrecognized type of result found in block
        """

        key = int(block[0][7:_ENTRY_LENGTH])

        # Skip the first line
        block = block[1:]

        skip_lines = 6

        if "STRESS" in block[0]:

            def act_on_results(result, vals):
                return result.add_stress(Stress(*vals))

        elif "TOSTRAIN" in block[0]:

            def act_on_results(result, vals):
                return result.add_strain(Strain(*vals))

        elif "DISP" in block[0]:

            def act_on_results(result, vals):
                return result.add_displacement(Displacement(*vals))

            skip_lines = 4
        elif "FORC" in block[0]:

            def act_on_results(result, vals):
                return result.add_force(Force(*vals))

            skip_lines = 4
        else:
            raise ValueError(f"Unrecognized type_text: {block[0]}")

        block = block[skip_lines:]

        for line in block[1:]:
            node_id, vals = get_nodal_values(line)
            if key not in self.nodes[node_id - 1].results:
                self.nodes[node_id - 1].results[key] = Result()

            act_on_results(self.nodes[node_id - 1].results[key], vals)

    @staticmethod
    def nodal_plot(x, y, values, title):
        """Create a matplotlib nodal plot

        Args:
            x (list(float)): x coordinates
            y (list(float)): y coordinates
            values (list(float)): values to plot
            title (String): title of the plot
        """
        points = plt.scatter(x, y, c=values, cmap=_CMAP)
        plt.colorbar(points)
        plt.title(title)
        plt.show()

    def plot_nodal_radial_displacement(self, key=101):
        """Create a matplotlib plot of the radial displacement of nodes

        Args:
            key (int): Key corresponding to the timestep to plot radial displacement for
        """
        nodes = self.nodes.copy()
        x = [node.x for node in self.nodes]
        y = [node.y for node in self.nodes]

        values = []
        for node in self.nodes:
            try:
                values.append(
                    node.results[key].displacement.get_total_displacement()
                    * 1000
                    * 1000
                )
            except KeyError:
                print(f"Error Key: {key}, Node: {node.id}")
            except AttributeError:
                print(f"Attribute Error: {key}, Node: {node.id}")

        self.nodal_plot(x, y, values, "Radial Displacement (μm)")

    def plot_nodal_von_mises(self, key=101):
        """Create a matplotlib plot of the nodal Von Mises stress

        Args:
            key (int): Key corresponding to the timestep to plot radial displacement for
        """

        x = [node.x for node in self.nodes]
        y = [node.y for node in self.nodes]

        values = []
        for node in self.nodes:
            try:
                values.append(node.results[key].stress.get_von_mises() / 1000**2)
            except KeyError:
                print(f"Error Key: {key}, Node: {node.id}")
        self.nodal_plot(x, y, values, "Von Mises Stress (MPA)")

    def get_elemental_stresses_summary(self):
        return {element.id: self.mean_stress(element) for element in self.elements}

    def get_nodal_displacements_summary(self, key=101):
        return {
            node.id: node.results[key].displacement.get_total_displacement()
            for node in self.nodes
        }

    @staticmethod
    def mean_stress(element):
        vm_stresses = [stress.get_von_mises() for stress in element.results]

        if len(vm_stresses) == 0:
            raise IndexError(f"No stress results within element {element}")
        mean_stress = sum(vm_stresses) / len(vm_stresses) / 1000**2

        return mean_stress

    def plot_element_mean_vm_stress(self):
        """Create a matplotlib plot of the mean Von Mises stress across elements"""
        print("Showing elements")

        x = []
        y = []
        tri_ind = []
        values = []

        min_ = math.inf
        max_ = 0

        for element in self.elements:
            vm_stresses = [stress.get_von_mises() for stress in element.results]

            if len(vm_stresses) == 0:
                continue
            mean_stress = sum(vm_stresses) / len(vm_stresses) / 1000**2

            if mean_stress < min_:
                min_ = mean_stress
            if mean_stress > max_:
                max_ = mean_stress

            corner_x = [node.x for node in element.get_corner_nodes()]
            corner_y = [node.y for node in element.get_corner_nodes()]

            x.extend(
                [
                    corner_x[0],
                    corner_x[1],
                    corner_x[2],
                    corner_x[2],
                    corner_x[3],
                    corner_x[0],
                ]
            )
            y.extend(
                [
                    corner_y[0],
                    corner_y[1],
                    corner_y[2],
                    corner_y[2],
                    corner_y[3],
                    corner_y[0],
                ]
            )
            tri_ind.extend(
                [
                    [len(x) - 6, len(x) - 5, len(x) - 4],
                    [len(x) - 3, len(x) - 2, len(x) - 1],
                ]
            )
            values.extend([mean_stress for _ in range(6)])

        triangle = tri.Triangulation(x, y, triangles=tri_ind)
        tcf = plt.tricontourf(triangle, values)

        plt.colorbar(tcf)
        plt.set_cmap(_CMAP)
        plt.title("Von Mises Stress (MPA)")
        plt.show()

    def max_element_vm_stress(self, part_number=0):
        """Gets the maximum averaged elemental Von Mises stress within a part

        Args:
            part_number (int, optional): Part number of elements. Defaults to 0.

        Raises:
            RuntimeError: If elements do not contain stress results

        Returns:
            float: Maximum Von Mises stress (MPa)
        """
        max_ = 0.0

        for element in self.elements:
            if element.nodes[0].part != part_number:
                continue

            vm_stresses = [stress.get_von_mises() for stress in element.results]
            if len(vm_stresses) == 0:
                raise RuntimeError(f"Element {element} does not contain any stresses")

            mean_stress = sum(vm_stresses) / len(vm_stresses)
            if mean_stress > max_:
                max_ = mean_stress

        return max_ * 1e-6

    def get_radial_deflections(self):
        """Gets radial deflections of the outer and inner nodes

        Returns:
            (float, float): Inner deflection (m) and outer deflection (m)
        """
        return self._get_avg_radial_deflection(
            self.mesh.get_inner_nodes()
        ), self._get_avg_radial_deflection(self.mesh.get_outer_nodes())

    @staticmethod
    def _get_avg_radial_deflection(nodes, key=101):
        """Gets the average radial deflection of the given nodes

        Args:
            nodes (list(Node)): Nodes to determine average deflection for
            key (int, optional): Step of simulation. Defaults to 101.

        Returns:
            float: Average radial deflection in m
        """
        values = []
        for node in nodes:
            try:
                values.append(node.results[key].displacement.get_total_displacement())
            except KeyError:
                print(f"Error Key: {key}, Node: {node.id}")
            except AttributeError:
                print(f"Attribute Error: {key}, Node: {node.id}")

        return sum(values) / len(values)


def get_nodal_values(text):
    """Gets values in a line of an FRD file and creates a list from them

    Args:
        text (String): A line of an FRD file

    Returns:
        node_id, list(float): The id and list of results.
    """
    node_id = int(text[4 : _ENTRY_LENGTH + 1])

    return_vals = [
        float(text[i : i + _ENTRY_LENGTH])
        for i in range(_ENTRY_LENGTH + 1, len(text) - 1, _ENTRY_LENGTH)
    ]
    return node_id, return_vals


class PlaneStressPressFitModel(PressFitModel):
    def __init__(self, id_0, id_1, od_0, od_1, name):
        mesh = ConcentricPlaneStressMesh(id_0, id_1, od_0, od_1)
        super().__init__(mesh, name)


class AxisymmetricPressFitModel(PressFitModel):
    def __init__(self, id_0, id_1, od_0, od_1, len_0, len_1, offset, name, **kwargs):

        lines_per_part = kwargs.get("lines_per_part")

        mesh = ConcentricAxisymmetricMesh(
            id_0, id_1, od_0, od_1, len_0, len_1, offset, lines_per_part
        )
        super().__init__(mesh, name)
