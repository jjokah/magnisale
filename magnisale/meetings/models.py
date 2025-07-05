from django.conf import settings
from django.db import models
from django.urls import reverse
from django.utils.translation import gettext_lazy as _


class MeetingRecording(models.Model):
    """Model for storing meeting recordings."""

    PROCESSING_STATUS_CHOICES = [
        ("pending", _("Pending")),
        ("processing", _("Processing")),
        ("completed", _("Completed")),
        ("failed", _("Failed")),
    ]

    title = models.CharField(_("Title"), max_length=255)
    description = models.TextField(_("Description"), blank=True)
    recording_file = models.FileField(
        _("Recording File"),
        upload_to="meetings/recordings/",
    )
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="meeting_recordings",
        verbose_name=_("Uploaded By"),
    )
    uploaded_at = models.DateTimeField(_("Uploaded At"), auto_now_add=True)
    processing_status = models.CharField(
        _("Processing Status"),
        max_length=20,
        choices=PROCESSING_STATUS_CHOICES,
        default="pending",
    )
    duration = models.DurationField(_("Duration"), null=True, blank=True)
    file_size = models.PositiveBigIntegerField(_("File Size"), null=True, blank=True)

    class Meta:
        verbose_name = _("Meeting Recording")
        verbose_name_plural = _("Meeting Recordings")
        ordering = ["-uploaded_at"]

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse("meetings:detail", kwargs={"pk": self.pk})


class MeetingSummary(models.Model):
    """Model for storing AI-generated meeting summaries."""

    meeting_recording = models.OneToOneField(
        MeetingRecording,
        on_delete=models.CASCADE,
        related_name="summary",
        verbose_name=_("Meeting Recording"),
    )
    summary_text = models.TextField(_("Summary"))
    key_points = models.JSONField(_("Key Points"), default=list)
    action_items = models.JSONField(_("Action Items"), default=list)
    participants = models.JSONField(_("Participants"), default=list)
    generated_at = models.DateTimeField(_("Generated At"), auto_now_add=True)
    ai_model_used = models.CharField(_("AI Model Used"), max_length=100, blank=True)
    confidence_score = models.FloatField(_("Confidence Score"), null=True, blank=True)

    class Meta:
        verbose_name = _("Meeting Summary")
        verbose_name_plural = _("Meeting Summaries")
        ordering = ["-generated_at"]

    def __str__(self):
        return f"Summary for {self.meeting_recording.title}"
