import math

import matplotlib.pyplot as plt
import numpy as np

import pressfits.curves as curves
from pressfits.concentric_mesh import ConcentricMesh
from pressfits.curves import Arc
from pressfits.element import PSElement

_ARCS_PER_PART = 47
_ANGULAR_SPACING = math.pi / 16
_INFLATION_LAYERS = 3


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
        self.curve_num = _ARCS_PER_PART
        self.inflation_layers = _INFLATION_LAYERS
        self.element_inp_name = "CPE8"
        self.p_0_curves = self._build_arcs_for_part(
            id_0 / 2, od_0 / 2, _ANGULAR_SPACING, 0
        )
        self.p_1_curves = self._build_arcs_for_part(
            id_1 / 2, od_1 / 2, _ANGULAR_SPACING, 1
        )

        self.p_0_elements = self._gen_elements(self.p_0_curves)
        self.p_1_elements = self._gen_elements(self.p_1_curves)
        self._build_edges()

    def _build_arcs_for_part(
        self, inner_radius, outer_radius, angular_spacing, part_num
    ):
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
        arc_spacing = (outer_radius - inner_radius) / (self.curve_num)

        arcs = []

        if self.inflation_layers != 0:
            if part_num == 0:
                # Inner part, inflate outside
                ConcentricPlaneStressMesh._add_arcs_for_part(
                    arcs,
                    inner_radius,
                    arc_spacing,
                    self.curve_num - 1,
                    angular_spacing,
                    part_num,
                )
                ConcentricPlaneStressMesh._add_arcs_for_part(
                    arcs,
                    outer_radius - arc_spacing + (arc_spacing / self.inflation_layers),
                    arc_spacing / (self.inflation_layers),
                    self.inflation_layers,
                    angular_spacing,
                    part_num,
                )
            else:
                # Outer part, inflate inside
                ConcentricPlaneStressMesh._add_arcs_for_part(
                    arcs,
                    inner_radius,
                    arc_spacing / (self.inflation_layers),
                    self.inflation_layers,
                    angular_spacing,
                    part_num,
                )
                ConcentricPlaneStressMesh._add_arcs_for_part(
                    arcs,
                    inner_radius + arc_spacing + (arc_spacing / self.inflation_layers),
                    arc_spacing,
                    self.curve_num - 1,
                    angular_spacing,
                    part_num,
                    edge_nodes=False,
                )
        else:
            ConcentricPlaneStressMesh._add_arcs_for_part(
                arcs,
                inner_radius,
                arc_spacing,
                self.curve_num,
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
        """Creates Arcs and adds them to the arcs list

        Args:
            arcs (List): List of Arc to add to
            inner_radius (float): Inner radius to start at
            arc_spacing (float): Radial spacing between arcs
            arc_count (int): Number of arcs to add
            angular_spacing (float): Angular spacing between nodes in an arc, measured in radians
            part_num (int): Part number
            edge_nodes (bool, optional): Should edge nodes be included? Defaults to True.
        """
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
    def _gen_elements(arcs, node_spacing=_ANGULAR_SPACING):
        """Creates elements for the provided arcs

        Args:
            arcs (list(Arc)): The arcs to create elements for
            angular_spacing (float, optional): The angle spacing in radians between element nodes. Defaults to ANGULAR_SPACING.

        Returns:
            list(Element): Elements formed within the arcs
        """
        elements = []
        elements_per_arc = (int(round((math.pi / 2) / node_spacing, 0))) // 2

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
                    arcs[row + 2].node_by_angle(angle + node_spacing * 2)
                )
                elements[-1].add_node(arcs[row].node_by_angle(angle + node_spacing * 2))

                # Non-corner nodes
                elements[-1].add_node(arcs[row + 1].node_by_angle(angle))
                elements[-1].add_node(arcs[row + 2].node_by_angle(angle + node_spacing))
                elements[-1].add_node(
                    arcs[row + 1].node_by_angle(angle + node_spacing * 2)
                )
                elements[-1].add_node(arcs[row].node_by_angle(angle + node_spacing))
        return elements

    @staticmethod
    def get_boundaries_inp():
        """Gets the boundary conditions block of a calculix .inp file

        Returns:
            string: String representation of the boundary conditions block
        """
        string = "*BOUNDARY\n"
        string += "L1_nodes,1\n"
        string += "*BOUNDARY\n"
        string += "L3_nodes,2\n"
        string += "*BOUNDARY\n"
        string += "L5_nodes,1\n"
        string += "*BOUNDARY\n"
        string += "L7_nodes,2\n"
        return string
