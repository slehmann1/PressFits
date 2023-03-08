import math

import numpy as np

from node import Node

FP_ALLOWANCE = 0.01


class Arc:
    def __init__(
        self, angular_spacing, radius, start_angle=0.0, end_angle=math.pi / 2, part=0
    ):
        """Creates a series of nodes in a circular arc centred at 0,0

        Args:
            angular_spacing (float): Spacing between each node in degrees
            radius (float): Arc radius
            start_angle (float, optional): Angle to start the arc at, measured from +X axis. Defaults to 0.
            end_angle (float, optional): Angle to end the arc at, measured from +X axis. Defaults to pi/2.
            part (int): The number of the part. Defaults to 0.

        Returns:
            list(node): A list of nodes
        """
        if radius == 0:
            raise ValueError("Non-zero radius must be provided")

        num_vals = int(round((end_angle - start_angle) / angular_spacing, 0)) + 1

        nodes = []
        for angle in np.linspace(start_angle, end_angle, num_vals):
            x, y = self._polar_to_cartesian(angle, radius)
            nodes.append(Node(x, y, part=part))

        self.nodes = nodes
        self.angular_spacing = angular_spacing
        self.start_angle = start_angle

    def get_node_ids(self):
        """Gets a list of every node id in the arc

        Returns:
            list(Int): List of node IDs
        """
        return [node.id for node in self.nodes]

    def get_anticlockwise_id(self):
        """Gets the id of the most anticlockwise node

        Returns:
            int: Id of the node
        """
        return self.nodes[-1].id

    def get_clockwise_id(self):
        """Gets the id of the most clockwise node

        Returns:
            int: Id of the node
        """
        return self.nodes[0].id

    @staticmethod
    def _polar_to_cartesian(angle, radius):
        """Converts a 2D polar coordinate to a cartesian coordinate

        Args:
            angle (float): The angle measured from the +X axis in radians
            radius (float): Polar radius

        Returns:
            (x, y): In 2D coordinates
        """
        return math.cos(angle) * radius, math.sin(angle) * radius

    def node_by_id(self, id):
        """Gets a node within the arc based on the node ID

        Args:
            id (int): ID of the node

        Returns:
            Node: Node with the given id
        """
        return self.nodes[id - self.nodes[0].id]

    def node_by_angle(self, angle):
        """Gets the node with the given ID

        Args:
            angle (float): Angle from the +X axis in radians

        Raises:
            ValueError: If node is not found

        Returns:
            Node: Node at the given angle
        """
        if angle == 0:
            return self.nodes[0]

        node = self.nodes[round((angle - self.start_angle) / self.angular_spacing)]

        if abs(node.get_angle() - angle) > FP_ALLOWANCE:
            raise ValueError(f"Node not found with angle: {angle}")

        return node


def node_ids_from_arcs(arcs):
    """Gets node ids for a sequence of arcs

    Args:
        arcs (list(Arc)): The arcs to ge tnode ids for

    Returns:
        list(int): Node ids contained within the arcs
    """
    node_ids = []

    for arc in arcs:
        node_ids.extend(arc.get_node_ids())

    return node_ids
