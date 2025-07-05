from django.contrib import admin
from django.utils.translation import gettext_lazy as _

from .models import MeetingRecording
from .models import MeetingSummary


@admin.register(MeetingRecording)
class MeetingRecordingAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "uploaded_by",
        "uploaded_at",
        "processing_status",
        "duration",
        "file_size",
    ]
    list_filter = ["processing_status", "uploaded_at"]
    search_fields = ["title", "description", "uploaded_by__username"]
    readonly_fields = ["uploaded_at", "file_size"]

    fieldsets = (
        (
            None,
            {
                "fields": ("title", "description", "recording_file", "uploaded_by"),
            },
        ),
        (
            _("Processing"),
            {
                "fields": ("processing_status", "duration", "file_size"),
            },
        ),
        (
            _("Timestamps"),
            {
                "fields": ("uploaded_at",),
                "classes": ("collapse",),
            },
        ),
    )


@admin.register(MeetingSummary)
class MeetingSummaryAdmin(admin.ModelAdmin):
    list_display = [
        "meeting_recording",
        "generated_at",
        "ai_model_used",
        "confidence_score",
    ]
    list_filter = ["generated_at", "ai_model_used"]
    search_fields = ["meeting_recording__title", "summary_text"]
    readonly_fields = ["generated_at"]

    fieldsets = (
        (
            None,
            {
                "fields": ("meeting_recording", "summary_text"),
            },
        ),
        (
            _("Structured Data"),
            {
                "fields": ("key_points", "action_items", "participants"),
            },
        ),
        (
            _("AI Details"),
            {
                "fields": ("ai_model_used", "confidence_score", "generated_at"),
                "classes": ("collapse",),
            },
        ),
    )
