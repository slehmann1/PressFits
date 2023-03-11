from abc import ABC, abstractmethod

import matplotlib.pyplot as plt

import curves as curves
from curves import HorizontalLine

YOUNGS_MODULUS = 210000000000
POISSONS_RATIO = 0.3
DENSITY = 7800

_INFLATION_LAYERS = 3


class ConcentricMesh(ABC):
    def __init__(self, id_0, id_1, od_0, od_1):
        self.id_0 = id_0
        self.id_1 = id_1
        self.od_0 = od_0
        self.od_1 = od_1

    def plot_elements(self, elements):
        """Creates a matplotlib plot of the provided elements. Does not run plt.show()

        Args:
            elements (list(Element)): Elements to plot
        """
        color = None

        for element in elements:
            # Plot Lines
            x = [node.x for node in element.get_corner_nodes()]
            y = [node.y for node in element.get_corner_nodes()]
            x.append(x[0])
            y.append(y[0])

            if color is None:
                color = plt.plot(x, y)[0].get_color()
            else:
                plt.plot(x, y, color=color)

            # Plot points
            plt.scatter(x, y, marker="x", color=color)

    def plot_faces(self, elements, surface_string):
        """Plots faces of the given elements for a string in the form used in a CCX input file.

        Args:
            elements (list(Element)): The list of elements to plot faces for
            surface_string (String): A string in the format of a CCX input file that specifies surfaces in the format of *SURFACE,NAME=L2_faces,TYPE=ELEMENT...
        """
        lines = surface_string.split("\n")
        color = None

        for line in lines:
            if "*" in line or line == "":
                continue  # It is a header or blank line

            str_id, str_face = line.split(",")
            face = int(str_face[1:])  # Remove the S character
            element_id = int(str_id)

            # Don't assume that the elements are ordered/and sequential by ID
            for element in elements:
                if element.id == element_id:
                    nodes = element.get_face_nodes(face)
                    x = [nodes[0].x, nodes[1].x]
                    y = [nodes[0].y, nodes[1].y]

                    if color is None:
                        color = plt.plot(x, y, linestyle="--")[0].get_color()

                    plt.plot(x, y, color=color, linestyle="--")
                    break

    def plot_curve_nodes(self, curves):
        """Plots nodes of a collection of curves

        Args:
            curves (List(Curve)): The curves to be plotted
        """
        x = []
        y = []

        for curve in curves:
            for node in curve.nodes:
                x.append(node.x)
                y.append(node.y)

        plt.scatter(x, y, marker=".")

    @abstractmethod
    def get_nodes(self):
        pass

    @abstractmethod
    def get_elements(self):
        pass

    @abstractmethod
    def get_inner_nodes(self):
        """Gets a list of nodes of the inside edge of the mesh"""
        pass

    @abstractmethod
    def get_outer_nodes(self):
        """Gets a list of nodes of the outside edge of the mesh"""
        pass

    @abstractmethod
    def plot(self):
        """Creates a matplotlib plot of the mesh"""
        pass

    @abstractmethod
    def get_inp_str(self, material_inner, material_outer):
        """Converts the mesh into a .inp file format for CCX as a string

        Returns:
            String: .inp representation of the mesh
        """
        pass

    def _get_inp_str_footer(self, material_inner, material_outer):
        """Creates a string for a .inp file from the material information block onwards

        Args:
            material_inner (Material): Material of inner part
            material_outer (Material): Material of outer part

        Returns:
            String: .inp representation of the mesh from the material information block onwards
        """
        # TODO: Allow multiple materials
        # Add material properties
        string = f"*MATERIAL,NAME={material_inner.name}\n"
        string += "*ELASTIC\n"
        string += f"{material_inner.youngs_modulus},{material_inner.poissons_ratio}\n"
        string += "*DENSITY\n"
        string += f"{material_inner.density}\n"

        if material_outer != material_inner:
            string += f"*MATERIAL,NAME={material_outer.name}\n"
            string += "*ELASTIC\n"
            string += (
                f"{material_outer.youngs_modulus},{material_outer.poissons_ratio}\n"
            )
            string += "*DENSITY\n"
            string += f"{material_outer.density}\n"

        string += (
            f"*SOLID SECTION,ELSET=PART0_elements,MATERIAL={material_inner.name}\n"
        )
        string += (
            f"*SOLID SECTION,ELSET=PART1_elements,MATERIAL={material_outer.name}\n"
        )

        string += "*NODAL THICKNESS\n"
        string += "PART0_nodes, 1.000000\n"
        string += "*NODAL THICKNESS\n"
        string += "PART1_nodes, 1.000000\n"

        # Boundary conditions
        string += "*SURFACE INTERACTION,NAME=SI0\n"
        string += "*SURFACE BEHAVIOR,PRESSURE-OVERCLOSURE=LINEAR\n"
        string += "1.050000e+16\n"
        string += "*CONTACT PAIR,INTERACTION=SI0,TYPE=SURFACE TO SURFACE\n"
        string += "L2_faces,L4_faces\n"
        string += "*STEP\n"
        string += "*STATIC\n"
        string += "*BOUNDARY\n"
        string += "L1_nodes,1\n"
        string += "*BOUNDARY\n"
        string += "L3_nodes,2\n"
        string += "*BOUNDARY\n"
        string += "L5_nodes,1\n"
        string += "*BOUNDARY\n"
        string += "L7_nodes,2\n"

        string += "*EL FILE\n"
        string += "E,S\n"
        string += "*NODE FILE\n"
        string += "RF,U\n"
        string += "*EL PRINT,ELSET=EALL\n"
        string += "S\n"
        string += "*END STEP\n"
        return string

    @abstractmethod
    def _surface_string(self, is_inner):
        """Creates a string for a .inp file denoting the surface block in the form of *SURFACE,NAME=L2_faces,TYPE=ELEMENT...
           Surfaces are defined as element face surfaces, not nodal surfaces.

        Args:
            is_inner (bool): If true, the surface string for the inner part is generated. If false, the outer part is generated.

        Returns:
            String: Surface block representation as a string
        """
        pass


class ConcentricAxisymmetricMesh(ConcentricMesh):
    _AXIAL_NODES = 10
    _LINES_PER_PART = 3

    def __init__(self, id_0, id_1, od_0, od_1, len_0, len_1, offset_1):
        """Create a mesh for two tubes pressed over each other using an axisymmetric assumption

        Args:
            id_0 (float): Internal diameter of inner tube
            id_1 (float): Internal diameter of outer tube
            od_0 (float): Outer diameter of inner tube
            od_1 (float): Outer diameter of outer tube
            len_0 (float): Length of inner tube
            len_1 (float): Length of outer tube
            offset_1 (float): Offset of the centerline of the outer tube relative to the inner tube in the +x direction
        """
        super().__init__(id_0, id_1, od_0, od_1)

        node_spacing = max(len_0, len_1) / self._AXIAL_NODES

        self.p_0_lines = self._build_lines_for_part(
            id_0 / 2, od_0 / 2, 0, len_0, node_spacing, 0
        )
        self.p_1_lines = self._build_lines_for_part(
            id_1 / 2, od_1 / 2, 0, len_1 + offset_1, node_spacing, 1
        )

    @staticmethod
    def _build_lines_for_part(
        inner_radius, outer_radius, start_x, end_x, node_spacing, part_num
    ):
        """Builds a list of lines between an inner and outer radius

        Args:
            inner_radius (float): Inner radius of the part
            outer_radius (float): Outer radius of the part
            node_spacing (float): Node spacing that should be used between nodes in a line
            part_num (int): The part number to apply to each node

        Returns:
            list(Arc): A list of Arcs
        """
        line_spacing = (
            outer_radius - inner_radius
        ) / ConcentricAxisymmetricMesh._LINES_PER_PART

        lines = []

        if _INFLATION_LAYERS != 0:
            if part_num == 0:
                # Inner part, inflate outside
                ConcentricAxisymmetricMesh._add_lines_for_part(
                    lines,
                    inner_radius,
                    start_x,
                    end_x,
                    line_spacing,
                    ConcentricAxisymmetricMesh._LINES_PER_PART - 1,
                    node_spacing,
                    part_num,
                )
                ConcentricAxisymmetricMesh._add_lines_for_part(
                    lines,
                    outer_radius - line_spacing + (line_spacing / _INFLATION_LAYERS),
                    start_x,
                    end_x,
                    line_spacing / (_INFLATION_LAYERS),
                    _INFLATION_LAYERS,
                    node_spacing,
                    part_num,
                )
            else:
                # Outer part, inflate inside
                ConcentricAxisymmetricMesh._add_lines_for_part(
                    lines,
                    inner_radius,
                    start_x,
                    end_x,
                    line_spacing / (_INFLATION_LAYERS),
                    _INFLATION_LAYERS,
                    node_spacing,
                    part_num,
                )
                ConcentricAxisymmetricMesh._add_lines_for_part(
                    lines,
                    inner_radius + line_spacing + (line_spacing / _INFLATION_LAYERS),
                    start_x,
                    end_x,
                    line_spacing,
                    ConcentricAxisymmetricMesh._LINES_PER_PART - 1,
                    node_spacing,
                    part_num,
                    edge_nodes=False,
                )
        else:
            ConcentricAxisymmetricMesh._add_lines_for_part(
                lines,
                inner_radius,
                start_x,
                end_x,
                line_spacing,
                ConcentricAxisymmetricMesh._LINES_PER_PART,
                node_spacing,
                part_num,
            )

        return lines

    def _surface_string(self, is_inner):
        raise NotImplementedError()

    def get_elements(self):
        raise NotImplementedError()

    def get_inp_str(self, material_inner, material_outer):
        raise NotImplementedError()

    def get_nodes(self):
        lines = self.p_0_lines.copy()
        lines.extend(self.p_1_lines)

        nodes = []
        for line in lines:
            nodes.extend(iter(line.nodes))

        return nodes

    def get_outer_nodes(self):
        return self.p_1_lines[-1].nodes

    def get_inner_nodes(self):
        return self.p_0_lines[0].nodes

    def plot(self):
        raise NotImplementedError()

    @staticmethod
    def _add_lines_for_part(
        lines,
        inner_radius,
        start_x,
        end_x,
        line_spacing,
        line_count,
        node_spacing,
        part_num,
        edge_nodes=True,
    ):
        mod = 0 if edge_nodes else 1

        for i in range(line_count):
            # Skip nodes that will not make part of an element
            if i % 2 == mod:
                lines.append(
                    HorizontalLine(
                        node_spacing,
                        start_x,
                        end_x,
                        inner_radius + i * line_spacing,
                        part=part_num,
                    )
                )
            else:
                lines.append(
                    HorizontalLine(
                        node_spacing * 2,
                        start_x,
                        end_x,
                        inner_radius + i * line_spacing,
                        part=part_num,
                    )
                )
