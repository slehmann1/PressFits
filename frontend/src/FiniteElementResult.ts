import { PartSpecification } from "./PartSpecification";
import { Result } from "./Result";
import { Mesh } from "./mesh";

export class FiniteElementResult extends Result {
  elementalStressResults: Object;
  nodalDisplacementResults: Object;
  mesh: Mesh;
  FLOATING_POINT_MARGIN = 0.001;

  constructor(
    innerPart: PartSpecification,
    outerPart: PartSpecification,
    frictionCoefficient: number,
    meshString: string,
    elementalStressResults: Object,
    nodalDisplacementResults: Object,
    contactPressure: number
  ) {
    super(innerPart, outerPart, frictionCoefficient);
    this.elementalStressResults = elementalStressResults;
    this.nodalDisplacementResults = nodalDisplacementResults;
    this.mesh = new Mesh(meshString);

    // TODO: Update R with the mesh based result, not the average value
    this.contactPressure = contactPressure;
    this.calcTorqueCapacity();
    this.calcFrictionCapacity();
  }
}
