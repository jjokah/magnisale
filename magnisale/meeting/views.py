from pathlib import Path

from django.conf import settings
from django.shortcuts import render
from google import genai
from typing_extensions import TypedDict

MEDIA_ROOT = settings.MEDIA_ROOT


client = genai.Client()

prompt = """Task:
You will receive an audio file.

1 Transcribe the audio accurately into clear, readable text.
2 Summarize the transcription in a concise paragraph,
capturing the key points, topics discussed, and any actionable insights.

If there are speakers, indicate speaker changes clearly (e.g., Speaker 1:, Speaker 2:).

Do not skip any part of the audio in the transcription.

If the audio is unclear, note [inaudible] at the corresponding points.

Wait for the audio file upload before proceeding."""


class SummaryInfo(TypedDict):
    transcribed_text: str
    summary: str


# Create your views here.
def meeting_view(request):
    context = {"errors": "", "summary": "", "transcribe_text": ""}
    if request.method == "POST":
        meeting_audio = request.FILES.get("meeting-file")
        if meeting_audio:
            save_path = Path(MEDIA_ROOT) / meeting_audio.name
            with Path.open(save_path, "wb+") as destination:
                for chunk in meeting_audio.chunks():
                    destination.write(chunk)

            uploaded_file = client.files.upload(file=save_path)
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=[prompt, uploaded_file],
                config={
                    "response_mime_type": "application/json",
                    "response_schema": SummaryInfo,
                },
            )

            context["transcribe_text"] = response.parsed["transcribed_text"]
            context["summary"] = response.parsed["summary"]
            context["errors"] = (
                "something went wrong!"
                if len(response.parsed["transcribed_text"]) == 0
                else ""
            )
        return render(request, "meeting/home.html", context)
    return render(request, "meeting/home.html", context)
