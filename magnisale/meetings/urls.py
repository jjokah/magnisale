from django.urls import path

from .views import meeting_detail_view
from .views import meeting_list_view
from .views import meeting_upload_view

app_name = "meetings"
urlpatterns = [
    path("", view=meeting_list_view, name="list"),
    path("upload/", view=meeting_upload_view, name="upload"),
    path("<int:pk>/", view=meeting_detail_view, name="detail"),
]
