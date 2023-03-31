from django.shortcuts import render
from django.views import View
from rest_framework import serializers
from rest_framework import views as REST_Views
from rest_framework.response import Response


class PressSerializer(serializers.Serializer):

    mesh_string = serializers.CharField()
    elemental_results_string = serializers.CharField()


class PressFit(View):
    def get(self, request):
        return render(request, "pressfits/page.html")


class PressView(REST_Views.APIView):
    def get(self, request):
        sample_data = {
            "mesh_string": "Sample Mesh",
            "elemental_results_string": "Sample Elemental Results",
        }

        results = PressSerializer(sample_data).data
        return Response(results)
