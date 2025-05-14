from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy
from django.views.generic import CreateView
from django.views.generic import DeleteView
from django.views.generic import DetailView
from django.views.generic import ListView
from django.views.generic import UpdateView

from .models import Journal

# Create your views here.


class JournalListView(LoginRequiredMixin, ListView):
    model = Journal
    template_name = "journal/journal_list.html"
    context_object_name = "journals"

    def get_queryset(self):
        return Journal.objects.filter(user=self.request.user)


class JournalDetailView(LoginRequiredMixin, DetailView):
    model = Journal
    template_name = "journal/journal_detail.html"
    context_object_name = "journal"

    def get_queryset(self):
        return Journal.objects.filter(user=self.request.user)


class JournalCreateView(LoginRequiredMixin, CreateView):
    model = Journal
    template_name = "journal/journal_form.html"
    fields = ["title", "content", "mood", "tags"]
    success_url = reverse_lazy("journal:list")

    def form_valid(self, form):
        form.instance.user = self.request.user
        messages.success(self.request, "Journal entry created successfully!")
        return super().form_valid(form)


class JournalUpdateView(LoginRequiredMixin, UpdateView):
    model = Journal
    template_name = "journal/journal_form.html"
    fields = ["title", "content", "mood", "tags"]
    success_url = reverse_lazy("journal:list")

    def get_queryset(self):
        return Journal.objects.filter(user=self.request.user)

    def form_valid(self, form):
        messages.success(self.request, "Journal entry updated successfully!")
        return super().form_valid(form)


class JournalDeleteView(LoginRequiredMixin, DeleteView):
    model = Journal
    template_name = "journal/journal_confirm_delete.html"
    success_url = reverse_lazy("journal:list")

    def get_queryset(self):
        return Journal.objects.filter(user=self.request.user)

    def delete(self, request, *args, **kwargs):
        messages.success(self.request, "Journal entry deleted successfully!")
        return super().delete(request, *args, **kwargs)
