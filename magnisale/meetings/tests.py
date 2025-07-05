from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse

from .models import MeetingRecording
from .models import MeetingSummary

User = get_user_model()


class MeetingRecordingModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpass123",  # noqa: S106
        )

    def test_meeting_recording_creation(self):
        """Test creating a meeting recording."""
        recording = MeetingRecording.objects.create(
            title="Test Meeting",
            description="A test meeting recording",
            uploaded_by=self.user,
            processing_status="pending",
        )
        assert recording.title == "Test Meeting"
        assert recording.uploaded_by == self.user
        assert recording.processing_status == "pending"
        assert str(recording) == "Test Meeting"

    def test_meeting_summary_creation(self):
        """Test creating a meeting summary."""
        recording = MeetingRecording.objects.create(
            title="Test Meeting",
            uploaded_by=self.user,
        )
        summary = MeetingSummary.objects.create(
            meeting_recording=recording,
            summary_text="This is a test summary",
            key_points=["Point 1", "Point 2"],
            action_items=["Action 1", "Action 2"],
            participants=["John", "Jane"],
        )
        assert summary.meeting_recording == recording
        assert summary.summary_text == "This is a test summary"
        assert len(summary.key_points) == 2  # noqa: PLR2004
        assert str(summary) == "Summary for Test Meeting"


class MeetingViewsTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpass123",  # noqa: S106
        )
        self.client.login(username="testuser", password="testpass123")  # noqa: S106

    def test_meeting_list_view(self):
        """Test accessing the meeting list view."""
        response = self.client.get(reverse("meetings:list"))
        assert response.status_code == 200  # noqa: PLR2004
        self.assertContains(response, "My Meeting Recordings")

    def test_meeting_upload_view(self):
        """Test accessing the meeting upload view."""
        response = self.client.get(reverse("meetings:upload"))
        assert response.status_code == 200  # noqa: PLR2004
        self.assertContains(response, "Upload Meeting Recording")

    def test_meeting_detail_view(self):
        """Test accessing the meeting detail view."""
        recording = MeetingRecording.objects.create(
            title="Test Meeting",
            uploaded_by=self.user,
        )
        response = self.client.get(
            reverse("meetings:detail", kwargs={"pk": recording.pk}),
        )
        assert response.status_code == 200  # noqa: PLR2004
        self.assertContains(response, "Test Meeting")

    def test_meeting_list_view_requires_login(self):
        """Test that meeting list view requires authentication."""
        self.client.logout()
        response = self.client.get(reverse("meetings:list"))
        assert response.status_code == 302  # noqa: PLR2004
