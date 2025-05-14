from django.urls import path

from . import views

app_name = "journal"

urlpatterns = [
    path("", views.JournalListView.as_view(), name="list"),
    path("new/", views.JournalCreateView.as_view(), name="create"),
    path("<int:pk>/", views.JournalDetailView.as_view(), name="detail"),
    path("<int:pk>/edit/", views.JournalUpdateView.as_view(), name="update"),
    path("<int:pk>/delete/", views.JournalDeleteView.as_view(), name="delete"),
]
