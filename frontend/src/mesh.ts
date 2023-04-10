class Node {
  //Internal class units are mm, constructor units are m (To match the FEA model)
  id: number;
  x: number;
  y: number;
  z: number;
  visX: number;
  visY: number;
  partNumber?: number;
  /**
   *
   * @param id Node ID
   * @param x In m
   * @param y In m
   * @param z In m
   */
  constructor(id: number, x: number, y: number, z: number) {
    this.id = id;
    this.x = x * 1000;
    this.y = y * 1000;
    this.z = z * 1000;
    this.visX = x * 1000;
    this.visY = y * 1000;
  }
  setScalingFactor(
    scalingFactors: {
      xScale: number;
      yScale: number;
      margin: number;
      xRange: number[];
    },
    elementalYScale: number
  ) {
    this.visX =
      (this.x + scalingFactors.xRange[1]) * scalingFactors.xScale +
      scalingFactors.margin;
    this.visY =
      this.y * scalingFactors.yScale * elementalYScale + scalingFactors.margin;
  }
}

class Element {
  id: number;
  nodeIDs: number[];
  mesh: Mesh;
  /**
   * Eight node axisymmetric Element
   * @param id Element ID
   * @param nodeIDs Ids of elements within the Node
   */
  constructor(id: number, nodeIDs: number[], mesh: Mesh) {
    this.id = id;
    this.nodeIDs = nodeIDs;
    this.mesh = mesh;
  }

  getNodes() {
    let nodes = [];
    for (let nodeIndex = 0; nodeIndex < this.nodeIDs.length; nodeIndex++) {
      nodes.push(this.mesh.nodes[this.nodeIDs[nodeIndex] - 1]);
    }
    return nodes;
  }

  partNumber?: number;
}

class Part {
  nodes: Node[];
  elements: Element[];
  constructor(nodes: Node[], elements: Element[]) {
    this.nodes = nodes;
    this.elements = elements;
  }
}

class Mesh {
  nodes: Node[];
  elements: Element[];

  /**
   *
   * @param meshString .inp file used by calculix in a string format
   */
  constructor(meshString = "") {
    if (meshString === "") {
      this.nodes = [];
      this.elements = [];
      return;
    }
    console.log("Start Mesh Build");
    let splitString = meshString.split("*ELEMENT, TYPE=CAX8, ELSET=EAll");
    this.nodes = this.buildNodes(splitString[0]);
    splitString = splitString[1].split("*NSET,NSET=L1_nodes");
    this.elements = this.buildElements(splitString[0]);

    // Assign Element Part Numbers
    splitString = splitString[1].split("*ELSET,ELSET=PART0_elements");
    splitString = splitString[1].split("*ELSET,ELSET=PART1_elements");
    this.assignPartToElements(splitString[0], 0);
    splitString = splitString[1].split("*SURFACE,NAME=L2_faces,TYPE=ELEMENT");
    this.assignPartToElements(splitString[0], 1);

    // Assign Node Part Numbers
    splitString = splitString[1].split("*NSET,NSET=PART0_nodes");
    splitString = splitString[1].split("*NSET,NSET=PART1_nodes");
    this.assignPartToNodes(splitString[0], 0);
    splitString = splitString[1].split("*MATERIAL,NAME");
    this.assignPartToNodes(splitString[0], 1);
    // TODO: Add part elements and nodes to the part - > Think about if this is needed to display the results
  }

  /**
   *
   * @param nodeString Node block in a string format from a .inp file as denoted by *NODE, NSET=nodes
   * @returns Node[] of nodes built from the node string
   */
  buildNodes(nodeString: string) {
    console.log("Build Nodes");
    const nodeArray = nodeString.split(/\r?\n/);
    let nodes = [];

    for (let i = 1; i < nodeArray.length - 1; i++) {
      nodes.push(
        new Node(
          ...(nodeArray[i].split(", ").map(Number) as [
            number,
            number,
            number,
            number
          ])
        )
      );
    }
    return nodes;
  }

  assignPartToNodes(nodeString: string, partNumber: number) {
    const nodeIDs = nodeString.split(", ");
    for (let nodeID of nodeIDs) {
      this.nodes[Number(nodeID) - 1].partNumber = partNumber;
    }
  }

  assignPartToElements(elementString: string, partNumber: number) {
    const elementIDs = elementString.split(", ");
    for (let elementID of elementIDs) {
      this.elements[Number(elementID) - 1].partNumber = partNumber;
    }
  }

  /**
   *
   * @param elementString Element block in a string format from a .inp file as denoted by *ELEMENT, TYPE=CAX8, ELSET=EAll
   * @returns Element[] of elements built from the element string
   */
  buildElements(elementString: string) {
    console.log("Build Elements");
    const elementArray = elementString.split(/\r?\n/);
    let elements = [];

    for (let i = 1; i < elementArray.length - 1; i++) {
      const elementSplit = elementArray[i].split(", ");
      const elementID = Number(elementSplit[0]);

      let nodeIDs = [];
      for (let ii = 1; ii < elementSplit.length; ii++) {
        nodeIDs.push(Number(elementSplit[ii]));
      }
      elements.push(new Element(elementID, nodeIDs, this));
    }
    return elements;
  }
}

export { Mesh, Node, Element };
