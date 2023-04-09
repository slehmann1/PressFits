import { PartSpecification } from "./PartSpecification";
import { Result } from "./Result";

export class AnalyticalResult extends Result {
  constructor(
    innerPart: PartSpecification,
    outerPart: PartSpecification,
    frictionCoefficient: number,
    length: number
  ) {
    super(innerPart, outerPart, frictionCoefficient, length);
    this.calculateStressesDisplacements(innerPart, outerPart);
    this.updateCapacities();
  }
  /**
   * Calculates stresses and displacements using lames equations for thick walled cylinders
   * @param innerPart Part specification for the inner part of the press-fit
   * @param outerPart Part specification for the outer part of the press-fit
   */
  calculateStressesDisplacements(
    innerPart: PartSpecification,
    outerPart: PartSpecification
  ) {
    let R2 = Math.pow(this.R, 2);

    this.contactPressure = Math.abs(
      this.radialInterference /
        this.R /
        ((1 / outerPart.youngsModulus / 1000) *
          ((Math.pow(outerPart.outerDiameter / 2, 2) + R2) /
            (Math.pow(outerPart.outerDiameter / 2, 2) - R2) +
            outerPart.poissonsRatio) +
          (1 / innerPart.youngsModulus / 1000) *
            ((R2 + Math.pow(innerPart.innerDiameter / 2, 2)) /
              (R2 - Math.pow(innerPart.innerDiameter / 2, 2)) -
              innerPart.poissonsRatio))
    ); // EQ 3-56, Shigley's

    // Peak stresses occur on inner radii
    let peakInnerTangentialStress = this.getTangentialStress(
      0,
      this.contactPressure,
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
    let minInnerTangentialStress = this.getTangentialStress(
      0,
      this.contactPressure,
      innerPart.innerDiameter / 2,
      innerPart.outerDiameter / 2,
      innerPart.outerDiameter / 2
    );
    let minOuterTangentialStress = this.getTangentialStress(
      this.contactPressure,
      0,
      outerPart.innerDiameter / 2,
      outerPart.outerDiameter / 2,
      outerPart.outerDiameter / 2
    );

    let peakInnerRadialStress = this.getRadialStress(
      0,
      this.contactPressure,
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
    let minInnerRadialStress = this.getRadialStress(
      0,
      this.contactPressure,
      innerPart.innerDiameter / 2,
      innerPart.outerDiameter / 2,
      innerPart.outerDiameter / 2
    );
    let minOuterRadialStress = this.getRadialStress(
      this.contactPressure,
      0,
      outerPart.innerDiameter / 2,
      outerPart.outerDiameter / 2,
      outerPart.outerDiameter / 2
    );

    this.maxInnerVMStress = this.getVonMisesStress(
      peakInnerTangentialStress,
      peakInnerRadialStress
    );
    this.maxOuterVMStress = this.getVonMisesStress(
      peakOuterTangentialStress,
      peakOuterRadialStress
    );
    this.minInnerVMStress = this.getVonMisesStress(
      minInnerTangentialStress,
      minInnerRadialStress
    );
    this.minOuterVMStress = this.getVonMisesStress(
      minOuterTangentialStress,
      minOuterRadialStress
    );
  }

  update(
    innerPart: PartSpecification,
    outerPart: PartSpecification,
    frictionCoefficient: number,
    length: number
  ) {
    console.log(innerPart);
    console.log(outerPart);
    this.frictionCoefficient = frictionCoefficient;
    this.contactLength = length;
    if (
      !(
        PartSpecification.equals(innerPart, this.innerPart) &&
        PartSpecification.equals(outerPart, this.outerPart)
      )
    ) {
      // A full update must be completed
      this.innerPart = innerPart;
      this.outerPart = outerPart;
      this.calculateStressesDisplacements(innerPart, outerPart);
    }
    this.updateCapacities();
    return this;
  }

  updateCapacities() {
    this.calcTorqueCapacity();
    this.calcFrictionCapacity();
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
}
