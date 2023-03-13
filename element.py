class Element:
    """An 8 Node Element"""

    _element_count = 1

    def __init__(self, nodes=None):
        self.nodes = [] if nodes is None else nodes
        self.id = Element._element_count
        self.results = []
        Element._element_count += 1

    @staticmethod
    def reset_element_count():
        Element._element_count = 1

    @staticmethod
    def get_element_count():
        return Element._element_count

    def add_node(self, node):
        """Add a node to the element. Must be added in the order outlined by
        https://web.mit.edu/calculix_v2.7/CalculiX/ccx_2.7/doc/ccx/node43.html#planestresssection

        Args:
            node (Node): The node to add
        """
        self.nodes.append(node)

    def get_ids(self):
        """Get ids of all nodes within the element

        Returns:
            list(int): IDs
        """
        return [node.id for node in self.nodes]

    def get_part(self):
        return self.nodes[0].part

    def __str__(self):
        string = f"{self.id}, "
        string += ", ".join(str(node.id) for node in self.nodes)
        return string

    def get_corner_nodes(self):
        return self.nodes[:4]

    def get_face_nodes(self, face_number):
        """Returns corner nodes for a specified face. Does not return middle node.

        Args:
            face_number (int): 1: Bottom, 2: Right, 3: Top, 4: Left, as per https://web.mit.edu/calculix_v2.7/CalculiX/ccx_2.7/doc/ccx/node43.html#planestresssection

        Returns:
            list(nodes): 2 nodes representing each corner
        """
        if face_number == 1:
            return [self.nodes[0], self.nodes[1]]

        elif face_number == 2:
            return [self.nodes[1], self.nodes[2]]

        elif face_number == 3:
            return [self.nodes[2], self.nodes[3]]

        elif face_number == 4:
            return [self.nodes[3], self.nodes[0]]

    def get_radius(self):
        """Returns x value of the bottom left node

        Returns:
            float: radius
        """
        return self.nodes[0].x


class PSElement(Element):
    """An eight node plane stress element"""

    def __init__(self, nodes=None):
        super().__init__(nodes)

    def get_radius(self):
        """Returns distance from the bottom left node to point (x,y) = (0,0)

        Returns:
            float: Euclidean distance
        """
        f = (self.nodes[0].x ** 2 + self.nodes[0].y ** 2) ** 0.5
        return (self.nodes[0].x ** 2 + self.nodes[0].y ** 2) ** 0.5
