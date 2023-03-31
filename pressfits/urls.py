from django.contrib.auth.models import User
from django.urls import include, path
from rest_framework import routers

from . import views

router = routers.DefaultRouter()
router.register(r"PressFitData", views.PressView, basename="PressFitData")

urlpatterns = [
    path("", views.PressFit.as_view()),
    path("press", views.PressView.as_view()),
]
