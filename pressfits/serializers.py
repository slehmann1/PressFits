from rest_framework import serializers


class PressSerializer(serializers.Serializer):

    mesh_string = serializers.CharField()
    elemental_stresses = serializers.DictField()
    nodal_displacements = serializers.DictField()
