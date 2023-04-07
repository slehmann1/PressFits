export class PartSpecification {
  innerDiameter: number;
  outerDiameter: number;
  length: number;
  xOffset: number;
  youngsModulus: number;
  poissonsRatio: number;
  CTE: number;
  temperature: number;
  static REFERENCE_TEMPERATURE = 20;

  constructor(
    innerDiameter: number,
    outerDiameter: number,
    length: number,
    xOffset: number,
    youngsModulus: number,
    poissonsRatio: number,
    CTE: number,
    temperature: number
  ) {
    this.innerDiameter = Number(innerDiameter);
    this.outerDiameter = Number(outerDiameter);
    this.length = Number(length);
    this.xOffset = Number(xOffset);
    this.youngsModulus = Number(youngsModulus);
    this.poissonsRatio = Number(poissonsRatio);
    this.CTE = Number(CTE);
    this.temperature = Number(temperature);
  }

  static correctForGrowthRate(partSpec: PartSpecification) {
    let growthRate =
      1 +
      (partSpec.temperature - PartSpecification.REFERENCE_TEMPERATURE) *
        partSpec.CTE;
    return new PartSpecification(
      partSpec.innerDiameter * growthRate,
      partSpec.outerDiameter * growthRate,
      partSpec.length * growthRate,
      partSpec.xOffset,
      partSpec.youngsModulus,
      partSpec.poissonsRatio,
      partSpec.CTE,
      partSpec.temperature
    );
  }
}
