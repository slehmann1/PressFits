import { PartSpecification } from "./PartSpecification";

export class AnalyticalResult {
  constructor(
    innerPart: PartSpecification,
    outerPart: PartSpecification,
    frictionCoefficient: number
  ) {
    innerPart = PartSpecification.correctForGrowthRate(innerPart);
    outerPart = PartSpecification.correctForGrowthRate(outerPart);

    let radialInterference =
      (innerPart.outerDiameter - outerPart.innerDiameter) / 2;
    let R = (innerPart.outerDiameter + outerPart.innerDiameter) / 4; // Nominal radius

    let contactPressure =
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
    console.log(
      (1 / outerPart.youngsModulus / 1000) *
        ((Math.pow(outerPart.outerDiameter / 2, 2) + Math.pow(R, 2)) /
          (Math.pow(outerPart.outerDiameter / 2, 2) - Math.pow(R, 2)) +
          outerPart.poissonsRatio)
    );
    console.log(
      (1 / innerPart.youngsModulus / 1000) *
        ((Math.pow(R, 2) + Math.pow(innerPart.innerDiameter / 2, 2)) /
          (Math.pow(R, 2) - Math.pow(innerPart.innerDiameter / 2, 2)) -
          innerPart.poissonsRatio)
    );
    console.log(innerPart);
    console.log(outerPart);
    console.log(contactPressure);
  }
}
