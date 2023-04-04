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
    this.innerDiameter = innerDiameter;
    this.outerDiameter = outerDiameter;
    this.length = length;
    this.xOffset = xOffset;
    this.youngsModulus = youngsModulus;
    this.poissonsRatio = poissonsRatio;
    this.CTE = CTE;
    this.temperature = temperature;
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
