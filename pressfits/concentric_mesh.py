from abc import ABC, abstractmethod

import matplotlib.pyplot as plt

import pressfits.curves as curves
from pressfits.curves import VerticalLine

YOUNGS_MODULUS = 210000000000
POISSONS_RATIO = 0.3

_FP_ALLOWANCE = 0.0001


class ConcentricMesh(ABC):
    def __init__(self, id_0, id_1, od_0, od_1):
        self.curve_num = None
        self.inflation_layers = None
        self.id_0 = id_0
        self.id_1 = id_1
        self.od_0 = od_0
        self.od_1 = od_1

        self.p_0_curves = []
        self.p_1_curves = []
        self.p_0_elements = []
        self.p_1_elements = []

        self.element_inp_name = None

    def _build_edges(self):
        # Edge IDs
        self.l_0 = self.p_0_curves[0].get_node_ids()
        self.l_1 = self._get_curve_edge_ids(self.p_0_curves, True)  # ACW
        self.l_2 = self.p_0_curves[-1].get_node_ids()
        self.l_3 = self._get_curve_edge_ids(self.p_0_curves, False)  # CW
        self.l_4 = self.p_1_curves[0].get_node_ids()
        self.l_5 = self._get_curve_edge_ids(self.p_1_curves, True)  # ACW
        self.l_6 = self.p_1_curves[-1].get_node_ids()
        self.l_7 = self._get_curve_edge_ids(self.p_1_curves, False)  # CW

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

    def get_nodes(self):
        """Gets a list of all nodes in the mesh, ordered by ID

        Returns:
            list(Node): List of nodes in the mesh
        """
        curves = self.p_0_curves.copy()
        curves.extend(self.p_1_curves)

        nodes = []
        for curve in curves:
            nodes.extend(iter(curve.nodes))

        return nodes

    def get_elements(self):
        """Gets a list of all elements in the mesh, ordered by ID

        Returns:
            list(Node): List of nodes in the mesh
        """
        elements = self.p_0_elements.copy()
        elements.extend(self.p_1_elements)

        return elements

    def get_inner_nodes(self):
        return self.p_0_curves[0].nodes

    def get_outer_nodes(self):
        return self.p_1_curves[-1].nodes

    def plot(self):
        """Creates a matplotlib plot of the mesh"""
        self.plot_curve_nodes(self.p_0_curves)
        self.plot_curve_nodes(self.p_1_curves)

        self.plot_elements(self.p_0_elements)
        self.plot_elements(self.p_1_elements)

        self.plot_faces(self.p_0_elements, self._surface_string(True))
        self.plot_faces(self.p_1_elements, self._surface_string(False))

        plt.show()

    def get_inp_str(self, material_inner, material_outer):
        """Converts the mesh into a .inp file format for CCX as a string

        Returns:
            String: .inp representation of the mesh
        """
        arcs = self.p_0_curves.copy()
        arcs.extend(self.p_1_curves)

        string = "*NODE, NSET=nodes\n"

        # Add Nodes
        for arc_ in arcs:
            for node in arc_.nodes:
                string += str(node) + "\n"

        # Add elements
        elements = self.p_0_elements.copy()
        elements.extend(self.p_1_elements)

        string += f"*ELEMENT, TYPE={self.element_inp_name}, ELSET=EAll\n"
        for element in elements:
            string += str(element) + "\n"

        # Add node sets
        string += self._nodeset_string(self.l_1, "L1_nodes")
        string += self._nodeset_string(self.l_2, "L2_nodes")
        string += self._nodeset_string(self.l_3, "L3_nodes")
        string += self._nodeset_string(self.l_4, "L4_nodes")
        string += self._nodeset_string(self.l_5, "L5_nodes")
        string += self._nodeset_string(self.l_7, "L7_nodes")

        # Add element sets
        string += self._elset_string(self.p_0_elements, "PART0_elements")
        string += self._elset_string(self.p_1_elements, "PART1_elements")

        # Add surfaces. Must be defined as element face surfaces, not nodes.
        string += self._surface_string(True)
        string += self._surface_string(False)

        # Add parts
        string += self._nodeset_string(
            curves.node_ids_from_arcs(self.p_0_curves), "PART0_nodes"
        )
        string += self._nodeset_string(
            curves.node_ids_from_arcs(self.p_1_curves), "PART1_nodes"
        )
        string += "\n"

        string += self._get_inp_str_footer(material_inner, material_outer)

        return string

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

        if material_outer != material_inner:
            string += f"*MATERIAL,NAME={material_outer.name}\n"
            string += "*ELASTIC\n"
            string += (
                f"{material_outer.youngs_modulus},{material_outer.poissons_ratio}\n"
            )

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

        string += self.get_boundaries_inp()

        string += "*EL FILE\n"
        string += "E,S\n"
        string += "*NODE FILE\n"
        string += "RF,U\n"
        string += "*EL PRINT,ELSET=EALL\n"
        string += "S\n"
        string += "*END STEP\n"
        return string

    @abstractmethod
    def get_boundaries_inp():
        pass

    @staticmethod
    def _elset_string(elements, name, el_per_line=6):
        """Creates a .inp representation of an elset block in the format *ELSET,ELSET=PART1_elements...

        Args:
            elements (list(elements)): The elements to create the string for
            name (String): Name of the element set
            el_per_line (int, optional): Adds a linebreak to the string after this many elements. Defaults to 6.

        Returns:
            String: String representation of the elset block
        """
        string = f"*ELSET,ELSET={name}"

        for i in range(len(elements)):
            # Linebreak after number of elements
            if i % el_per_line == 0:
                string += "\n"

            # Do not add a comma if it is the last line
            string += (
                f"{elements[i].id}, " if i != len(elements) - 1 else str(elements[i].id)
            )

        string += "\n"
        return string

    @staticmethod
    def _element_surface_string(elements, radius, face):
        """Creates a string of the form {element.id},S{face} for all elements with a given radius

        Args:
            elements (list(Element)): The elements to create the string for
            radius (float): The radius to filter elements to
            face (Int): The face number to append to the string

        Returns:
            String: A multiline string
        """
        string = ""

        for element in elements:
            if abs(element.get_radius() - radius) < _FP_ALLOWANCE:
                string += f"{element.id},S{face}\n"

        return string

    @staticmethod
    def _nodeset_string(nodes, name, nodes_per_line=6):
        """Creates a .inp representation of a nodeset block in the format *NSET,NSET=PART0_nodes...

        Args:
            nodes (list(Node)): The nodes to create the string for
            name (String): Name of the nodeset
            nodes_per_line (int, optional): Adds a linebreak to the string after this many nodes. Defaults to 6.

        Returns:
            String: String representation of the nodeset block
        """
        string = ""

        if name is not None:
            string += f"*NSET,NSET={name}"

        for i in range(len(nodes)):
            # Linebreak after number of elements
            if i % nodes_per_line == 0:
                string += "\n"

            # Do not add a comma if it is the last line
            string += f"{nodes[i]}, " if i != len(nodes) - 1 else str(nodes[i])

        string += "\n"
        return string

    def _surface_string(self, is_inner):
        """Creates a string for a .inp file denoting the surface block in the form of *SURFACE,NAME=L2_faces,TYPE=ELEMENT...
           Surfaces are defined as element face surfaces, not nodal surfaces.

        Args:
            is_inner (bool): If true, the surface string for the inner part is generated. If false, the outer part is generated.

        Returns:
            String: Surface block representation as a string
        """
        name = "L2_faces" if is_inner else "L4_faces"
        elements = self.p_0_elements if is_inner else self.p_1_elements
        if is_inner:
            diameter = self.od_0
            arc_spacing = (self.od_0 - self.id_0) / (self.curve_num)
            diameter -= arc_spacing
            diameter += (
                arc_spacing / self.inflation_layers * (self.inflation_layers - 2)
            )

        else:
            diameter = self.id_1

        # See definitions of faces: https://web.mit.edu/calculix_v2.7/CalculiX/ccx_2.7/doc/ccx/node43.html#planestresssection
        face = 2 if is_inner else 4

        # Add surfaces defined as element face surfaces (not nodes).
        string = f"*SURFACE,NAME={name},TYPE=ELEMENT\n"
        string += self._element_surface_string(elements, diameter / 2, face)

        return string

    @staticmethod
    def _get_curve_edge_ids(curves, is_neg_edge):
        """Gets the ids of nodes at the ends of every curve within a list

        Args:
            curves (list(Curve)): A list of curves to get ids for
            is_neg_edge (bool): Is the edge to collect ids for the negative/anticlockwise edge?

        Returns:
            list(int): A list of node ids
        """
        id_list = []

        for curve in curves:
            if is_neg_edge:
                id_list.append(curve.get_negative_id())
            else:
                id_list.append(curve.get_positive_id())

        return id_list
