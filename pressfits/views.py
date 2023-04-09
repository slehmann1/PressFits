from django.http import JsonResponse
from django.shortcuts import render
from django.views import View
from rest_framework import exceptions
from rest_framework import views as REST_Views
from rest_framework.response import Response
from rest_framework.views import exception_handler

from pressfits.model import AxisymmetricPressFitModel, Material
from pressfits.serializers import PressSerializer


class PressFit(View):
    def get(self, request):
        return render(request, "pressfits/page.html")


class PressView(REST_Views.APIView):
    def post(self, request):
        print("Recieved Request:")
        print(request.data)

        # TODO: Validate inputs

        # Process post data
        p_0_material = self.get_material(request, "innerPart")
        p_1_material = self.get_material(request, "outerPart")
        length = request.data["contactLength"] / 1000
        [p_0_id, p_0_od] = self.get_part_parameters(request, "innerPart")
        [p_1_id, p_1_od] = self.get_part_parameters(request, "outerPart")

        if not self.inputs_are_valid(
            p_0_material,
            p_1_material,
            [p_0_id, p_0_od],
            [p_1_id, p_1_od],
        ):
            response = exception_handler(exceptions.APIException(), None)
            response.data["status_code"] = 400
            response.data["detail"] = "Invalid Inputs"
            return response
        model = AxisymmetricPressFitModel(
            p_0_id,
            p_1_id,
            p_0_od,
            p_1_od,
            length,
            length,
            "Press_Fit",
        )
        model.run_model(p_0_material, p_1_material)

        model.read_element_results()
        model.read_nodal_results()
        model_data = {
            "mesh_string": model.inp_str,
            "elemental_stresses": model.get_elemental_stresses_summary(),
            "nodal_displacements": model.get_nodal_displacements_summary(),
            "contact_pressure": model.max_contact_pressure(),
        }

        results = PressSerializer(model_data).data
        return Response(results)

    @staticmethod
    def inputs_are_valid(p_0_material, p_1_material, p_0_dims, p_1_dims):
        # Check materials are valid
        if not PressView.is_positive_numbers(
            (
                p_0_material.youngs_modulus,
                p_0_material.poissons_ratio,
                p_1_material.youngs_modulus,
                p_1_material.poissons_ratio,
            )
        ):
            return False

        # Check poissons ratios
        if p_0_material.poissons_ratio > 0.5 or p_1_material.poissons_ratio > 0.5:
            return False

        # Check dimensions
        if not PressView.is_positive_numbers(
            p_0_dims
        ) or not PressView.is_positive_numbers(p_1_dims):
            return False

        # Check OD bigger than IDs
        if not p_0_dims[0] < p_0_dims[1] or not p_1_dims[0] < p_1_dims[1]:
            return False

        # Check p_1 bigger than p_0
        if p_0_dims[0] > p_1_dims[0]:
            return False

        # Check intersection:
        if p_0_dims[1] < p_1_dims[0]:
            return False

        return True

    @staticmethod
    def is_positive_numbers(values):
        for value in values:
            if not PressView.is_positive_number(value):
                return False
        return True

    @staticmethod
    def is_positive_number(value):
        if not isinstance(value, float) and not isinstance(value, int):
            return False
        if value <= 0:
            return False

        return True

    @staticmethod
    def get_material(request, part_prefix):
        """Gets a material from a request post description

        Args:
            request (Request): Request containing post parameters
            part_prefix (String): Prefix used for parameters. Eg. p_0_

        Returns:
            Material: Material generated by the post paramters
        """

        return Material(
            name=f"{part_prefix}_mat",
            youngs_modulus=float(request.data[part_prefix]["youngsModulus"])
            * 1000
            * 1000
            * 1000,  # Convert from GPa to Pa
            poissons_ratio=float(request.data[part_prefix]["poissonsRatio"]),
        )

    @staticmethod
    def get_part_parameters(request, part_prefix):
        """Gets a material from a request post description

        Args:
            request (Request): Request containing post parameters
            part_prefix (String): Prefix used for parameters. Eg. p_0_

        Returns:
            tuple: Inner Diameter, Outer Diameter, Length
        """

        # Convert from mm diameter to m radius
        return (
            float(request.data[part_prefix]["innerDiameter"]) / 1000,
            float(request.data[part_prefix]["outerDiameter"]) / 1000,
        )
