from django.urls import path, include
from rest_framework.routers import DefaultRouter
from core.views import views

router = DefaultRouter()
router.register('patients', views.PatientViewSet)
router.register('visits', views.VisitViewSet)
router.register('triages', views.TriageViewSet)
router.register('consultations', views.ConsultationViewSet)
router.register('prescriptions', views.PrescriptionViewSet)
router.register('drugs', views.DrugViewSet)
router.register('bills', views.BillViewSet)
router.register('wards', views.WardViewSet)
router.register('beds', views.BedViewSet)
router.register('admissions', views.AdmissionViewSet)
router.register('users', views.UserViewSet)

urlpatterns = [
    path('auth/login/', views.login_view),
    path('auth/me/', views.me_view),
    path('stats/', views.dashboard_stats),
    path('', include(router.urls)),
]