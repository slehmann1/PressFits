import { PartSpecification } from "./PartSpecification";
import { Result } from "./Result";
import { Mesh } from "./mesh";

export class FiniteElementResult extends Result {
  elementalStressResults: Object;
  nodalDisplacementResults: Object;
  mesh: Mesh;
  FLOATING_POINT_MARGIN = 0.001;

  innerDeflection: number;
  outerDeflection: number;

  constructor(
    innerPart: PartSpecification,
    outerPart: PartSpecification,
    frictionCoefficient: number,
    length: number,
    meshString: string,
    elementalStressResults: Object,
    nodalDisplacementResults: Object,
    contactPressure: number
  ) {
    super(innerPart, outerPart, frictionCoefficient, length);
    this.elementalStressResults = elementalStressResults;
    this.nodalDisplacementResults = nodalDisplacementResults;
    this.mesh = new Mesh(meshString);

    this.innerDeflection =
      this.getDeflectionAtRadius(innerPart.innerDiameter / 2) * 1000;
    this.outerDeflection =
      this.getDeflectionAtRadius(outerPart.outerDiameter / 2) * 1000;
    this.R =
      innerPart.outerDiameter / 2 +
      this.getDeflectionAtRadius(innerPart.outerDiameter / 2) * 1000;

    // TODO: Update R with the mesh based result, not the average value
    this.contactPressure = contactPressure;
    this.calcTorqueCapacity();
    this.calcFrictionCapacity();

    this.maxInnerVMStress = this.getStressAtRadius(innerPart.innerDiameter / 2);
    this.minInnerVMStress = this.getStressAtRadius(innerPart.outerDiameter / 2);
    this.maxOuterVMStress = this.getStressAtRadius(outerPart.innerDiameter / 2);
    this.minOuterVMStress = this.getStressAtRadius(outerPart.outerDiameter / 2);
  }

  getDeflectionAtRadius(radius: number) {
    for (let node of this.mesh.nodes) {
      if (this.almostEqual(node.x, radius)) {
        //@ts-ignore
        return this.nodalDisplacementResults[node.id];
      }
    }
  }

  getStressAtRadius(radius: number) {
    for (let element of this.mesh.elements) {
      for (let node of [element.getNodes()[0], element.getNodes()[5]]) {
        if (this.almostEqual(node.x, radius)) {
          //@ts-ignore
          return this.elementalStressResults[element.id];
        }
      }
    }
  }

  almostEqual(val_1: number, val_2: number) {
    return Math.abs(val_2 - val_1) < this.FLOATING_POINT_MARGIN;
  }
}
