from django import forms
from django.utils.translation import gettext_lazy as _

from .models import MeetingRecording


class MeetingRecordingUploadForm(forms.ModelForm):
    """Form for uploading meeting recordings."""

    class Meta:
        model = MeetingRecording
        fields = ["title", "description", "recording_file"]
        widgets = {
            "title": forms.TextInput(
                attrs={
                    "class": "form-control",
                    "placeholder": _("Enter meeting title"),
                },
            ),
            "description": forms.Textarea(
                attrs={
                    "class": "form-control",
                    "rows": 3,
                    "placeholder": _("Optional description of the meeting"),
                },
            ),
            "recording_file": forms.FileInput(
                attrs={
                    "class": "form-control",
                    "accept": ".mp3,.wav,.m4a,.mp4,.mov,.avi",
                },
            ),
        }
        help_texts = {
            "recording_file": _("Supported formats: MP3, WAV, M4A, MP4, MOV, AVI"),
        }

    def clean_recording_file(self):
        file = self.cleaned_data.get("recording_file")
        if file:
            # Check file size (limit to 500MB)
            max_size = 500 * 1024 * 1024  # 500MB in bytes
            if file.size > max_size:
                raise forms.ValidationError(
                    _("File size must be less than 500MB. Current size: %(size)s MB")
                    % {
                        "size": round(file.size / (1024 * 1024), 2),
                    },
                )

            # Check file extension
            allowed_extensions = [".mp3", ".wav", ".m4a", ".mp4", ".mov", ".avi"]
            file_extension = file.name.lower().split(".")[-1]
            if f".{file_extension}" not in allowed_extensions:
                raise forms.ValidationError(
                    _("Unsupported file format. Allowed formats: %(formats)s")
                    % {
                        "formats": ", ".join(allowed_extensions),
                    },
                )

        return file
