from rest_framework import serializers


class PressSerializer(serializers.Serializer):

    mesh_string = serializers.CharField()
    elemental_results_string = serializers.CharField()
    nodal_results_string = serializers.CharField()
