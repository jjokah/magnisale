from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.messages.views import SuccessMessageMixin
from django.db.models import QuerySet
from django.shortcuts import get_object_or_404
from django.urls import reverse_lazy
from django.utils.translation import gettext_lazy as _
from django.views.generic import CreateView
from django.views.generic import DetailView
from django.views.generic import ListView

from .forms import MeetingRecordingUploadForm
from .models import MeetingRecording


class MeetingRecordingListView(LoginRequiredMixin, ListView):
    """List view for user's meeting recordings."""

    model = MeetingRecording
    template_name = "meetings/meeting_list.html"
    context_object_name = "recordings"
    paginate_by = 10

    def get_queryset(self) -> QuerySet[MeetingRecording]:
        return (
            MeetingRecording.objects.filter(
                uploaded_by=self.request.user,
            )
            .select_related("uploaded_by")
            .prefetch_related("summary")
        )


class MeetingRecordingDetailView(LoginRequiredMixin, DetailView):
    """Detail view for a meeting recording and its summary."""

    model = MeetingRecording
    template_name = "meetings/meeting_detail.html"
    context_object_name = "recording"

    def get_object(self, queryset: QuerySet | None = None) -> MeetingRecording:
        return get_object_or_404(
            MeetingRecording,
            pk=self.kwargs["pk"],
            uploaded_by=self.request.user,
        )

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Add summary to context if it exists
        try:
            context["summary"] = self.object.summary
        except AttributeError:
            context["summary"] = None
        return context


class MeetingRecordingUploadView(LoginRequiredMixin, SuccessMessageMixin, CreateView):
    """View for uploading new meeting recordings."""

    model = MeetingRecording
    form_class = MeetingRecordingUploadForm
    template_name = "meetings/meeting_upload.html"
    success_message = _(
        "Meeting recording uploaded successfully! AI processing will begin shortly.",
    )

    def form_valid(self, form):
        form.instance.uploaded_by = self.request.user

        # Set file size if available
        if form.instance.recording_file:
            form.instance.file_size = form.instance.recording_file.size

        response = super().form_valid(form)

        # Here you would typically trigger AI processing
        # For now, we'll just add a message
        messages.info(
            self.request,
            _(
                "Your meeting recording is being processed. "
                "You'll receive a notification when the summary is ready.",
            ),
        )

        return response

    def get_success_url(self):
        return reverse_lazy("meetings:detail", kwargs={"pk": self.object.pk})


# Function-based view instances for URL patterns
meeting_list_view = MeetingRecordingListView.as_view()
meeting_detail_view = MeetingRecordingDetailView.as_view()
meeting_upload_view = MeetingRecordingUploadView.as_view()
