import math


class Node:
    _node_count = 1

    def __init__(self, x, y, z=0, part=0):
        self.x = x
        self.y = y
        self.z = z
        self.part = part
        self.id = Node._node_count
        self.results = {}
        Node._node_count += 1

    def __str__(self):
        return f"{self.id}, {self._format_val(self.x)}, {self._format_val(self.y)}, {self._format_val(self.z)}"

    @staticmethod
    def _format_val(val):
        return "{:.6f}".format(val)

    def get_angle(self):
        """Angle in radians of the node from the +x axis

        Returns:
            float: Angle in radians of the node from the +x axis
        """
        return math.atan(self.y / self.x)
    
    @staticmethod
    def reset_node_count():
        Node._node_count = 1
