import math

import matplotlib.pyplot as plt
import numpy as np

import curves as curves
from concentric_mesh import ConcentricMesh
from curves import Arc
from element import PSElement

_ARCS_PER_PART = 47
_ANGULAR_SPACING = math.pi / 16
_INFLATION_LAYERS = 3
_FP_ALLOWANCE = 0.0001


class ConcentricPlaneStressMesh(ConcentricMesh):
    def __init__(self, id_0, id_1, od_0, od_1):
        """Create a mesh for two quarter tubes pressed over each other using a plane stress assumption

        Args:
            id_0 (float): Internal diameter of inner tube
            id_1 (float): Internal diameter of outer tube
            od_0 (float): Outer diameter of inner tube
            od_1 (float): Outer diameter of outer tube
        """
        super().__init__(id_0, id_1, od_0, od_1)
        self.p_0_arcs = self._build_arcs_for_part(
            id_0 / 2, od_0 / 2, _ANGULAR_SPACING, 0
        )
        self.p_1_arcs = self._build_arcs_for_part(
            id_1 / 2, od_1 / 2, _ANGULAR_SPACING, 1
        )

        self.p_0_elements = self._gen_elements(self.p_0_arcs)
        self.p_1_elements = self._gen_elements(self.p_1_arcs)

        # Edge IDs
        self.l_0 = self.p_0_arcs[0].get_node_ids()
        self.l_1 = self._get_arc_edge_ids(self.p_0_arcs, True)  # ACW
        self.l_2 = self.p_0_arcs[-1].get_node_ids()
        self.l_3 = self._get_arc_edge_ids(self.p_0_arcs, False)  # CW
        self.l_4 = self.p_1_arcs[0].get_node_ids()
        self.l_5 = self._get_arc_edge_ids(self.p_1_arcs, True)  # ACW
        self.l_6 = self.p_1_arcs[-1].get_node_ids()
        self.l_7 = self._get_arc_edge_ids(self.p_1_arcs, False)  # CW

    @staticmethod
    def _build_arcs_for_part(inner_radius, outer_radius, angular_spacing, part_num):
        """Builds a list of arcs between an inner and outer radius

        Args:
            inner_radius (float): Inner radius of the part
            outer_radius (float): Outer radius of the part
            angular_spacing (float): Angular spacing that should be used between nodes in an arc
            part_num (int): The part number to apply to each node

        Returns:
            list(Arc): A list of Arcs
        """
        # TODO: Support parts that start at 0,0
        arc_spacing = (outer_radius - inner_radius) / (_ARCS_PER_PART)

        arcs = []

        if _INFLATION_LAYERS != 0:
            if part_num == 0:
                # Inner part, inflate outside
                ConcentricPlaneStressMesh._add_arcs_for_part(
                    arcs,
                    inner_radius,
                    arc_spacing,
                    _ARCS_PER_PART - 1,
                    angular_spacing,
                    part_num,
                )
                ConcentricPlaneStressMesh._add_arcs_for_part(
                    arcs,
                    outer_radius - arc_spacing + (arc_spacing / _INFLATION_LAYERS),
                    arc_spacing / (_INFLATION_LAYERS),
                    _INFLATION_LAYERS,
                    angular_spacing,
                    part_num,
                )
            else:
                # Outer part, inflate inside
                ConcentricPlaneStressMesh._add_arcs_for_part(
                    arcs,
                    inner_radius,
                    arc_spacing / (_INFLATION_LAYERS),
                    _INFLATION_LAYERS,
                    angular_spacing,
                    part_num,
                )
                ConcentricPlaneStressMesh._add_arcs_for_part(
                    arcs,
                    inner_radius + arc_spacing + (arc_spacing / _INFLATION_LAYERS),
                    arc_spacing,
                    _ARCS_PER_PART - 1,
                    angular_spacing,
                    part_num,
                    edge_nodes=False,
                )
        else:
            ConcentricPlaneStressMesh._add_arcs_for_part(
                arcs,
                inner_radius,
                arc_spacing,
                _ARCS_PER_PART,
                angular_spacing,
                part_num,
            )

        return arcs

    @staticmethod
    def _add_arcs_for_part(
        arcs,
        inner_radius,
        arc_spacing,
        arc_count,
        angular_spacing,
        part_num,
        edge_nodes=True,
    ):
        mod = 0 if edge_nodes else 1

        for i in range(arc_count):
            # Skip nodes that will not make part of an element
            if i % 2 == mod:
                arcs.append(
                    Arc(angular_spacing, inner_radius + i * arc_spacing, part=part_num)
                )
            else:
                arcs.append(
                    Arc(
                        angular_spacing * 2,
                        inner_radius + i * arc_spacing,
                        part=part_num,
                    )
                )

    @staticmethod
    def _gen_elements(arcs, angular_spacing=_ANGULAR_SPACING):
        """Creates elements for the provided arcs

        Args:
            arcs (list(Arc)): The arcs to create elements for
            angular_spacing (float, optional): The angle spacing in radians between element nodes. Defaults to ANGULAR_SPACING.

        Returns:
            list(Element): Elements formed within the arcs
        """
        elements = []
        elements_per_arc = (int(round((math.pi / 2) / angular_spacing, 0))) // 2

        for row in range(0, len(arcs) - 1, 2):
            for angle in np.linspace(0, math.pi / 2, elements_per_arc, endpoint=False):
                # Build an 8 node element in the anticlockwise direction, starting at the bottom left corner
                # Definitions of node orders: https://web.mit.edu/calculix_v2.7/CalculiX/ccx_2.7/doc/ccx/node43.html#planestresssection
                # Note Order of nodes is important to create positive jacobian determinants

                elements.append(PSElement())

                # Corner Nodes
                elements[-1].add_node(arcs[row].node_by_angle(angle))
                elements[-1].add_node(arcs[row + 2].node_by_angle(angle))
                elements[-1].add_node(
                    arcs[row + 2].node_by_angle(angle + angular_spacing * 2)
                )
                elements[-1].add_node(
                    arcs[row].node_by_angle(angle + angular_spacing * 2)
                )

                # Non-corner nodes
                elements[-1].add_node(arcs[row + 1].node_by_angle(angle))
                elements[-1].add_node(
                    arcs[row + 2].node_by_angle(angle + angular_spacing)
                )
                elements[-1].add_node(
                    arcs[row + 1].node_by_angle(angle + angular_spacing * 2)
                )
                elements[-1].add_node(arcs[row].node_by_angle(angle + angular_spacing))

        print(f"ELEMENT COUNT: {len(elements)}")
        return elements

    def get_nodes(self):
        """Gets a list of all nodes in the mesh, ordered by ID

        Returns:
            list(Node): List of nodes in the mesh
        """
        arcs = self.p_0_arcs.copy()
        arcs.extend(self.p_1_arcs)

        nodes = []
        for arc in arcs:
            nodes.extend(iter(arc.nodes))

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
        return self.p_0_arcs[0].nodes

    def get_outer_nodes(self):
        return self.p_1_arcs[-1].nodes

    def get_inp_str(self, material_inner, material_outer):
        """Converts the mesh into a .inp file format for CCX as a string

        Returns:
            String: .inp representation of the mesh
        """
        arcs = self.p_0_arcs.copy()
        arcs.extend(self.p_1_arcs)

        string = "*NODE, NSET=nodes\n"

        # Add Nodes
        for arc_ in arcs:
            for node in arc_.nodes:
                string += str(node) + "\n"
        string += "\n"

        # Add elements
        elements = self.p_0_elements.copy()
        elements.extend(self.p_1_elements)

        string += "*ELEMENT, TYPE=CPE8, ELSET=EAll\n"
        for element in elements:
            string += str(element) + "\n"
        string += "\n"

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
            curves.node_ids_from_arcs(self.p_0_arcs), "PART0_nodes"
        )
        string += self._nodeset_string(
            curves.node_ids_from_arcs(self.p_1_arcs), "PART1_nodes"
        )
        string += "\n"

        string += self._get_inp_str_footer(material_inner, material_outer)

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
            arc_spacing = (self.od_0 - self.id_0) / (_ARCS_PER_PART)
            diameter -= arc_spacing
            diameter += arc_spacing / _INFLATION_LAYERS * (_INFLATION_LAYERS - 2)

        else:
            diameter = self.id_1

        # See definitions of faces: https://web.mit.edu/calculix_v2.7/CalculiX/ccx_2.7/doc/ccx/node43.html#planestresssection
        face = 2 if is_inner else 4

        # Add surfaces defined as element face surfaces (not nodes).
        string = f"*SURFACE,NAME={name},TYPE=ELEMENT\n"
        string += self._element_surface_string(elements, diameter / 2, face)

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
    def _get_arc_edge_ids(arcs, is_acw_edge):
        """Gets the ids of nodes at the ends of every arc within a list

        Args:
            arcs (list(Arc)): A list of arcs to get ids for
            is_acw_edge (bool): Is the edge to collect ids for the anticlockwise edge?

        Returns:
            list(int): A list of node ids
        """
        id_list = []

        for arc in arcs:
            if is_acw_edge:
                id_list.append(arc.get_anticlockwise_id())
            else:
                id_list.append(arc.get_clockwise_id())

        return id_list

    def plot(self):
        """Creates a matplotlib plot of the mesh"""
        self.plot_curve_nodes(self.p_0_arcs)
        self.plot_curve_nodes(self.p_1_arcs)

        self.plot_elements(self.p_0_elements)
        self.plot_elements(self.p_1_elements)

        self.plot_faces(self.p_0_elements, self._surface_string(True))
        self.plot_faces(self.p_1_elements, self._surface_string(False))

        plt.show()
