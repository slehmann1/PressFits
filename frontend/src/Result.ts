import { PartSpecification } from "./PartSpecification";

export class Result {
  maxInnerVMStress: number | undefined;
  maxOuterVMStress: number | undefined;
  minInnerVMStress: number | undefined;
  minOuterVMStress: number | undefined;
  axialForceCapacity: number | undefined;
  torqueCapacity: number | undefined;
  radialInterference: number;
  innerPart: PartSpecification;
  outerPart: PartSpecification;

  R: number;
  contactLength: number;

  frictionCoefficient: number;
  contactPressure: number | undefined;

  constructor(
    innerPart: PartSpecification,
    outerPart: PartSpecification,
    frictionCoefficient: number,
    length: number
  ) {
    this.innerPart = innerPart;
    this.outerPart = outerPart;

    this.radialInterference =
      (innerPart.outerDiameter - outerPart.innerDiameter) / 2;
    this.R = (innerPart.outerDiameter + outerPart.innerDiameter) / 4; // Nominal radius
    this.contactLength = length;
    this.frictionCoefficient = frictionCoefficient;
  }
  /**
   * Gets friction capacity of a press fit joint given a certain contact pressure. This is the axial force that can be taken.
   */
  calcFrictionCapacity() {
    this.axialForceCapacity =
      this.frictionCoefficient *
      //@ts-ignore
      this.contactPressure *
      2 *
      Math.PI *
      this.R *
      this.contactLength;
  }
  /**
   *
   * @returns Temperature differential required for assembly if cooling the inner part
   */
  getInnerTempDifferential() {
    return (
      (2 * this.radialInterference) / (2 * this.R * this.innerPart.CTE * 1e-6)
    );
  }
  /**
   *
   * @returns Temperature differential required for assembly if heating the outer part
   */
  getOuterTempDifferential() {
    return (
      (2 * this.radialInterference) / (2 * this.R * this.outerPart.CTE * 1e-6)
    );
  }
  /**
   * Gets torque capacity of a press fit joint given a certain contact pressure
   */
  calcTorqueCapacity() {
    this.torqueCapacity =
      this.frictionCoefficient *
      //@ts-ignore
      this.contactPressure *
      2 *
      Math.PI *
      this.R *
      this.contactLength *
      this.R;
  }
  /**
   * Computes von mises equivalent stress for plane stress, where all shear stresses are 0
   * @param principalStress1 Principal stress (MPa)
   * @param principalStress2 Principal stress (MPa)
   * @returns Von Mises equivalent stress (MPa)
   */
  getVonMisesStress(principalStress1: number, principalStress2: number) {
    return Math.pow(
      Math.pow(principalStress1, 2) +
        Math.pow(principalStress2, 2) -
        principalStress1 * principalStress2,
      0.5
    );
  }
}
