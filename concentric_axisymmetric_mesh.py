from concentric_mesh import ConcentricMesh
from curves import HorizontalLine

_INFLATION_LAYERS = 3


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
