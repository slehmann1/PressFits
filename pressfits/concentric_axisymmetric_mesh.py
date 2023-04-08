import math

import numpy as np

from pressfits.concentric_mesh import ConcentricMesh
from pressfits.curves import VerticalLine
from pressfits.element import Element

_INFLATION_LAYERS = 5
_LINES_PER_PART = 13
FP_ALLOWANCE = 0.0001


class ConcentricAxisymmetricMesh(ConcentricMesh):
    def __init__(
        self,
        id_0,
        id_1,
        od_0,
        od_1,
        len_0,
        len_1,
        offset_1,
        lines_per_part=_LINES_PER_PART,
    ):
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
        self.inflation_layers = _INFLATION_LAYERS

        lines_per_part = (
            lines_per_part if lines_per_part is not None else _LINES_PER_PART
        )
        self.curve_num = lines_per_part
        self.element_inp_name = "CAX8"

        p_0_axial_spacing = self._calc_axial_spacing(
            len_0, lines_per_part, (od_0 - id_0) / 2
        )
        p_1_axial_spacing = self._calc_axial_spacing(
            len_1, lines_per_part, (od_1 - id_1) / 2
        )

        self.p_0_curves = self._build_lines_for_part(
            id_0 / 2, od_0 / 2, 0, len_0, p_0_axial_spacing, 0
        )
        self.p_1_curves = self._build_lines_for_part(
            id_1 / 2, od_1 / 2, offset_1, len_1 + offset_1, p_1_axial_spacing, 1
        )

        self.p_0_elements = self._gen_elements(self.p_0_curves, p_0_axial_spacing)
        self.p_1_elements = self._gen_elements(self.p_1_curves, p_1_axial_spacing)
        self._build_edges()

    @staticmethod
    def _calc_axial_spacing(length, radial_layers, thickness):
        """Calculates axial spacing between nodes of a part

        Args:
            length (flaot): Axial length of the part
            radial_layers (int): The number of node layers in the radial direction
            thickness (float): The radial thickness of the part

        Returns:
            float: Axial node spacing
        """
        count = math.ceil(length / (thickness / radial_layers))
        # Required for the correct number of layers
        count = count if count % 2 == 0 else count + 1
        return length / count

    def _build_lines_for_part(
        self, inner_radius, outer_radius, start_y, end_y, node_spacing, part_num
    ):
        """Builds a list of lines between an inner and outer radius

        Args:
            inner_radius (float): Inner radius of the part
            outer_radius (float): Outer radius of the part
            start_y (float): Starting y value of the part
            end_y (float): Ending y value of the part
            node_spacing (float): Node spacing that should be used between nodes in a line
            part_num (int): The part number to apply to each node

        Returns:
            list(Arc): A list of Arcs
        """
        line_spacing = (outer_radius - inner_radius) / self.curve_num

        lines = []
        if self.inflation_layers != 0:
            # Inflate both outside and inside layers
            ConcentricAxisymmetricMesh._add_lines_for_part(
                lines,
                inner_radius,
                start_y,
                end_y,
                line_spacing / (self.inflation_layers),
                self.inflation_layers,
                node_spacing,
                part_num,
            )
            ConcentricAxisymmetricMesh._add_lines_for_part(
                lines,
                inner_radius
                + line_spacing
                + (line_spacing / (self.inflation_layers * 2)),
                start_y,
                end_y,
                line_spacing,
                self.curve_num - 2,
                node_spacing,
                part_num,
                edge_nodes=False,
            )
            ConcentricAxisymmetricMesh._add_lines_for_part(
                lines,
                outer_radius - line_spacing + (line_spacing / self.inflation_layers),
                start_y,
                end_y,
                line_spacing / (self.inflation_layers),
                self.inflation_layers,
                node_spacing,
                part_num,
            )

        else:
            ConcentricAxisymmetricMesh._add_lines_for_part(
                lines,
                inner_radius,
                start_y,
                end_y,
                line_spacing,
                self.curve_num,
                node_spacing,
                part_num,
            )

        return lines

    def get_outer_nodes(self):
        return self.p_1_curves[-1].nodes

    def get_inner_nodes(self):
        return self.p_0_curves[0].nodes

    @staticmethod
    def _add_lines_for_part(
        lines,
        inner_radius,
        start_y,
        end_y,
        line_spacing,
        line_count,
        node_spacing,
        part_num,
        edge_nodes=True,
    ):
        """Creates vertical lines of nodes and adds them to the lines list

        Args:
            lines (List): List of VerticalLine to add to
            inner_radius (float): Inner radius to start at
            start_y (float): Lowest y value
            end_y (float): Highest y value
            line_spacing (float): Radial spacing between lines
            line_count (int): Number of lines to add
            node_spacing (float): Axial spacing between nodes in a line
            part_num (int): Part number
            edge_nodes (bool, optional): Should edge nodes be included? Defaults to True.
        """
        mod = 0 if edge_nodes else 1

        for i in range(line_count):
            # Skip nodes that will not make part of an element
            if i % 2 == mod:
                lines.append(
                    VerticalLine(
                        node_spacing,
                        start_y,
                        end_y,
                        inner_radius + i * line_spacing,
                        part=part_num,
                    )
                )
            else:
                lines.append(
                    VerticalLine(
                        node_spacing * 2,
                        start_y,
                        end_y,
                        inner_radius + i * line_spacing,
                        part=part_num,
                    )
                )

    @staticmethod
    def get_boundaries_inp():
        """Gets the boundary conditions block of a calculix .inp file

        Returns:
            string: String representation of the boundary conditions block
        """
        string = "*BOUNDARY\n"
        string += "L1_nodes,2\n"
        string += "*BOUNDARY\n"
        string += "L3_nodes,2\n"
        string += "*BOUNDARY\n"
        string += "L5_nodes,2\n"
        string += "*BOUNDARY\n"
        string += "L7_nodes,2\n"
        return string

    @staticmethod
    def _gen_elements(lines, node_spacing):
        """Creates elements for the provided lines

        Args:
            lines (list(VerticalLine)): The lines to create elements for
            node_spacing (float): The vertical spacing between element nodes.

        Returns:
            list(Element): Elements formed within the curves
        """
        elements = []
        element_spacing = node_spacing * 2

        for row in range(0, len(lines) - 1, 2):
            for y in np.arange(
                lines[0].start_y,
                lines[0].end_y - element_spacing + FP_ALLOWANCE,
                element_spacing,
            ):
                # Build an 8 node element in the anticlockwise direction, starting at the bottom left corner
                # Definitions of node orders: https://web.mit.edu/calculix_v2.7/CalculiX/ccx_2.7/doc/ccx/node43.html#planestresssection
                # Note Order of nodes is important to create positive jacobian determinants

                elements.append(Element())

                # Corner Nodes
                elements[-1].add_node(lines[row].node_by_y_val(y))
                elements[-1].add_node(lines[row + 2].node_by_y_val(y))
                elements[-1].add_node(
                    lines[row + 2].node_by_y_val(y + node_spacing * 2)
                )
                elements[-1].add_node(lines[row].node_by_y_val(y + node_spacing * 2))

                # Non-corner nodes
                elements[-1].add_node(lines[row + 1].node_by_y_val(y))
                elements[-1].add_node(lines[row + 2].node_by_y_val(y + node_spacing))
                elements[-1].add_node(
                    lines[row + 1].node_by_y_val(y + node_spacing * 2)
                )
                elements[-1].add_node(lines[row].node_by_y_val(y + node_spacing))

        return elements
