import math
from dataclasses import dataclass


@dataclass
class Displacement:
    x: float
    y: float
    z: float

    def get_total_displacement(self):

        return (self.x**2 + self.y**2 + self.z**2) ** 0.5 * (
            -1 if self.x < 0 else 1
        )


@dataclass
class Stress:
    xx: float
    yy: float
    zz: float
    xy: float
    yz: float
    zx: float

    def get_von_mises(self):
        """Get Von Mises equivalent stress of the tensor

        Returns:
            float: Von Mises equivalent stress
        """
        return (
            (
                (self.xx - self.yy) ** 2
                + (self.yy - self.zz) ** 2
                + (self.zz - self.xx) ** 2
            )
            / 2
            + 3 * (self.xy**2 + self.yz**2 + self.zx**2)
        ) ** 0.5


@dataclass
class Strain:
    xx: float
    yy: float
    zz: float
    xy: float
    yz: float
    zx: float

    def get_von_mises(self):
        """Get Von Mises equivalent strain of the tensor

        Returns:
            float: Von Mises equivalent strain
        """
        return (
            (
                (
                    (
                        (self.xx - self.yy) ** 2
                        + (self.yy - self.zz) ** 2
                        + (self.zz - self.xx) ** 2
                    )
                    / 2
                    + 3 * (self.xy**2 + self.yz**2 + self.zx**2)
                )
                ** 0.5
            )
            * 2
            / 3
        )


@dataclass
class Force:
    x: float
    y: float
    z: float

    def get_force_magnitude(self):
        return (self.x**2 + self.y**2 + self.z**2) * 0.5


class Result:
    def __init__(self) -> None:
        self.displacement = None
        self.stress = None
        self.strain = None
        self.force = None

    def add_stress(self, stress):
        self.stress = stress

    def add_strain(self, strain):
        self.strain = strain

    def add_displacement(self, displacement):
        self.displacement = displacement

    def add_force(self, force):
        self.force = force
