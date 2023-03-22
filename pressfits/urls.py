from django.urls import path

from . import views

urlpatterns = [path("", views.PressFit.as_view())]
