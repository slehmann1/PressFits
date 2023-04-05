import { PartSpecification } from "./PartSpecification";

export class AnalyticalResult {
  contactPressure: number;
  maxInnerVMStress: number;
  maxOuterVMStress: number;
  axialForceCapacity: number;
  torqueCapacity: number;

  constructor(
    innerPart: PartSpecification,
    outerPart: PartSpecification,
    frictionCoefficient: number
  ) {
    // TODO: Eliminate, pass growth corrected parts
    innerPart = PartSpecification.correctForGrowthRate(innerPart);
    outerPart = PartSpecification.correctForGrowthRate(outerPart);

    let radialInterference =
      (innerPart.outerDiameter - outerPart.innerDiameter) / 2;
    let R = (innerPart.outerDiameter + outerPart.innerDiameter) / 4; // Nominal radius
    let contactLength =
      Math.min(innerPart.length, outerPart.length) - outerPart.xOffset;

    this.contactPressure =
      radialInterference /
      R /
      ((1 / outerPart.youngsModulus / 1000) *
        ((Math.pow(outerPart.outerDiameter / 2, 2) + Math.pow(R, 2)) /
          (Math.pow(outerPart.outerDiameter / 2, 2) - Math.pow(R, 2)) +
          outerPart.poissonsRatio) +
        (1 / innerPart.youngsModulus / 1000) *
          ((Math.pow(R, 2) + Math.pow(innerPart.innerDiameter / 2, 2)) /
            (Math.pow(R, 2) - Math.pow(innerPart.innerDiameter / 2, 2)) -
            innerPart.poissonsRatio)); // EQ 3-56, Shigley's

    // Peak stresses occur on inner radii
    let peakInnerTangentialStress = this.getTangentialStress(
      this.contactPressure,
      0,
      innerPart.innerDiameter / 2,
      innerPart.outerDiameter / 2,
      innerPart.innerDiameter / 2
    );
    let peakOuterTangentialStress = this.getTangentialStress(
      this.contactPressure,
      0,
      outerPart.innerDiameter / 2,
      outerPart.outerDiameter / 2,
      outerPart.innerDiameter / 2
    );

    let peakInnerRadialStress = this.getRadialStress(
      this.contactPressure,
      0,
      innerPart.innerDiameter / 2,
      innerPart.outerDiameter / 2,
      innerPart.innerDiameter / 2
    );
    let peakOuterRadialStress = this.getRadialStress(
      this.contactPressure,
      0,
      outerPart.innerDiameter / 2,
      outerPart.outerDiameter / 2,
      outerPart.innerDiameter / 2
    );

    this.maxInnerVMStress = this.getVonMisesStress(
      peakInnerTangentialStress,
      peakInnerRadialStress
    );
    this.maxOuterVMStress = this.getVonMisesStress(
      peakOuterTangentialStress,
      peakOuterRadialStress
    );

    this.torqueCapacity = this.getTorqueCapacity(
      frictionCoefficient,
      this.contactPressure,
      R,
      contactLength
    );
    this.axialForceCapacity =
      frictionCoefficient *
      this.contactPressure *
      2 *
      Math.PI *
      R *
      contactLength;
  }
  /**
   * Gets friction capacity of a press fit joint given a certain contact pressure. This is the axial force that can be taken.
   */
  getFrictionCapacity(
    frictionCoefficient: number,
    contactPressure: number,
    radius: number,
    contactLength: number
  ) {
    return (
      frictionCoefficient *
      contactPressure *
      2 *
      Math.PI *
      radius *
      contactLength
    );
  }
  /**
   * Gets torque capacity of a press fit joint given a certain contact pressure
   */
  getTorqueCapacity(
    frictionCoefficient: number,
    contactPressure: number,
    radius: number,
    contactLength: number
  ) {
    return (
      frictionCoefficient *
      contactPressure *
      2 *
      Math.PI *
      radius *
      contactLength *
      radius
    );
  }
  /**
   *
   * @param pInner Pressure on inner surface (MPa)
   * @param pOuter Pressure on outer surface (MPa)
   * @param rInner Radius of inner surface (mm)
   * @param rOuter Radius of outer surface (mm)
   * @param r Radius at which tangential stress should be determined (mm)
   * @returns Tangential stress (MPa)
   */
  getTangentialStress(
    pInner: number,
    pOuter: number,
    rInner: number,
    rOuter: number,

    r: number
  ) {
    return (
      (pInner * Math.pow(rInner, 2) -
        pOuter * Math.pow(rOuter, 2) -
        (Math.pow(rInner, 2) * Math.pow(rOuter, 2) * (pOuter - pInner)) /
          Math.pow(r, 2)) /
      (Math.pow(rOuter, 2) - Math.pow(rInner, 2)) //Eq 3-49
    );
  }

  /**
   *
   * @param pInner Pressure on inner surface (MPa)
   * @param pOuter Pressure on outer surface (MPa)
   * @param rInner Radius of inner surface (mm)
   * @param rOuter Radius of outer surface (mm)
   * @param r Radius at which tangential stress should be determined (mm)
   * @returns Tangential stress (MPa)
   */
  getRadialStress(
    pInner: number,
    pOuter: number,
    rInner: number,
    rOuter: number,
    r: number
  ) {
    return (
      (pInner * Math.pow(rInner, 2) -
        pOuter * Math.pow(rOuter, 2) +
        (Math.pow(rInner, 2) * Math.pow(rOuter, 2) * (pOuter - pInner)) /
          Math.pow(r, 2)) /
      (Math.pow(rOuter, 2) - Math.pow(rInner, 2)) //Eq 3-49
    );
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
