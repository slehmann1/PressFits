export class PartSpecification {
  innerDiameter: number;
  outerDiameter: number;
  youngsModulus: number;
  poissonsRatio: number;
  CTE: number;
  temperature: number;
  static REFERENCE_TEMPERATURE = 20;

  constructor(
    innerDiameter: number,
    outerDiameter: number,
    youngsModulus: number,
    poissonsRatio: number,
    CTE: number,
    temperature: number
  ) {
    this.innerDiameter = Number(innerDiameter);
    this.outerDiameter = Number(outerDiameter);
    this.youngsModulus = Number(youngsModulus);
    this.poissonsRatio = Number(poissonsRatio);
    this.CTE = Number(CTE);
    this.temperature = Number(temperature);
  }

  static correctForGrowthRate(partSpec: PartSpecification) {
    let growthRate =
      1 +
      (partSpec.temperature - PartSpecification.REFERENCE_TEMPERATURE) *
        partSpec.CTE *
        1e-6;
    return new PartSpecification(
      partSpec.innerDiameter * growthRate,
      partSpec.outerDiameter * growthRate,
      partSpec.youngsModulus,
      partSpec.poissonsRatio,
      partSpec.CTE,
      partSpec.temperature
    );
  }

  static equals(spec1: PartSpecification, spec2: PartSpecification) {
    if (
      spec1.innerDiameter === spec2.innerDiameter &&
      spec1.outerDiameter === spec2.outerDiameter &&
      spec1.youngsModulus === spec2.youngsModulus &&
      spec1.poissonsRatio === spec2.youngsModulus &&
      spec1.CTE === spec2.CTE &&
      spec1.temperature === spec2.temperature
    ) {
      return true;
    }
    return false;
  }
}
