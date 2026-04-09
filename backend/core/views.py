from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils import timezone
from django.db.models import Q, Sum
from .models import *
from .serializers import *


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
            'redirect': get_redirect_for_role(user.role),
        })
    return Response({'error': 'Invalid credentials'}, status=400)


def get_redirect_for_role(role):
    routes = {
        'admin': '/admin-dashboard',
        'receptionist': '/reception',
        'triage_nurse': '/triage',
        'doctor': '/consultation',
        'cashier': '/cashier',
        'pharmacist': '/pharmacy',
        'ward_nurse': '/wards',
    }
    return routes.get(role, '/dashboard')


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    return Response(UserSerializer(request.user).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    today = timezone.now().date()
    visits_today = Visit.objects.filter(created_at__date=today)
    return Response({
        'visits_today': visits_today.count(),
        'waiting_triage': Visit.objects.filter(status='waiting_triage').count(),
        'in_consultation': Visit.objects.filter(status='in_consultation').count(),
        'waiting_payment': Visit.objects.filter(status='waiting_payment').count(),
        'at_pharmacy': Visit.objects.filter(status='at_pharmacy').count(),
        'admitted_patients': Admission.objects.filter(status='active').count(),
        'revenue_today': Bill.objects.filter(
            paid_at__date=today, status='paid'
        ).aggregate(total=Sum('paid_amount'))['total'] or 0,
        'total_patients': Patient.objects.count(),
    })


class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all().order_by('-created_at')
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(patient_number__icontains=search) |
                Q(phone__icontains=search) |
                Q(national_id__icontains=search)
            )
        return qs


class VisitViewSet(viewsets.ModelViewSet):
    queryset = Visit.objects.select_related('patient', 'triage', 'consultation').order_by('-created_at')
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'list':
            return VisitListSerializer
        return VisitSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        status_filter = self.request.query_params.get('status')
        date_filter = self.request.query_params.get('date')
        if status_filter:
            qs = qs.filter(status=status_filter)
        if date_filter:
            qs = qs.filter(created_at__date=date_filter)
        return qs

    def perform_create(self, serializer):
        visit = serializer.save(registered_by=self.request.user, status='waiting_triage')
        return visit

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        visit = self.get_object()
        new_status = request.data.get('status')
        if new_status:
            visit.status = new_status
            visit.save()
            return Response(VisitSerializer(visit).data)
        return Response({'error': 'status required'}, status=400)


class TriageViewSet(viewsets.ModelViewSet):
    queryset = Triage.objects.all()
    serializer_class = TriageSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        triage = serializer.save(nurse=self.request.user)
        # Update visit status
        visit = triage.visit
        visit.status = 'waiting_consultation'
        visit.save()


class ConsultationViewSet(viewsets.ModelViewSet):
    queryset = Consultation.objects.prefetch_related('prescriptions').all()
    serializer_class = ConsultationSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        consultation = serializer.save(doctor=self.request.user)
        visit = consultation.visit
        if consultation.admit_patient:
            visit.status = 'waiting_payment'
        else:
            visit.status = 'waiting_payment'
        visit.save()
        # Create Bill
        Bill.objects.get_or_create(visit=visit)


class PrescriptionViewSet(viewsets.ModelViewSet):
    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs


class DrugViewSet(viewsets.ModelViewSet):
    queryset = Drug.objects.filter(is_active=True)
    serializer_class = DrugSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(generic_name__icontains=search))
        return qs


class BillViewSet(viewsets.ModelViewSet):
    queryset = Bill.objects.prefetch_related('items').all()
    serializer_class = BillSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    @action(detail=True, methods=['post'])
    def add_item(self, request, pk=None):
        bill = self.get_object()
        serializer = BillItemSerializer(data=request.data)
        if serializer.is_valid():
            item = serializer.save(bill=bill)
            bill.total_amount = bill.items.aggregate(total=Sum('total'))['total'] or 0
            bill.save()
            return Response(BillSerializer(bill).data)
        return Response(serializer.errors, status=400)

    @action(detail=True, methods=['post'])
    def process_payment(self, request, pk=None):
        bill = self.get_object()
        amount = request.data.get('amount', 0)
        method = request.data.get('payment_method', 'cash')
        mpesa_code = request.data.get('mpesa_code', '')
        bill.paid_amount = float(bill.paid_amount) + float(amount)
        bill.payment_method = method
        bill.mpesa_code = mpesa_code
        bill.cashier = request.user
        if bill.paid_amount >= bill.total_amount:
            bill.status = 'paid'
            bill.paid_at = timezone.now()
            bill.visit.status = 'at_pharmacy'
            bill.visit.save()
        else:
            bill.status = 'partial'
        bill.save()
        return Response(BillSerializer(bill).data)

    @action(detail=True, methods=['post'])
    def dispense(self, request, pk=None):
        bill = self.get_object()
        prescriptions = bill.visit.consultation.prescriptions.filter(status='pending')
        for rx in prescriptions:
            if rx.drug.stock_quantity >= rx.quantity:
                rx.drug.stock_quantity -= rx.quantity
                rx.drug.save()
                rx.status = 'dispensed'
                rx.dispensed_by = request.user
                rx.dispensed_at = timezone.now()
                rx.save()
        bill.visit.status = 'discharged'
        bill.visit.save()
        return Response({'message': 'Medicines dispensed successfully'})


class WardViewSet(viewsets.ModelViewSet):
    queryset = Ward.objects.prefetch_related('beds').all()
    serializer_class = WardSerializer
    permission_classes = [IsAuthenticated]


class BedViewSet(viewsets.ModelViewSet):
    queryset = Bed.objects.all()
    serializer_class = BedSerializer
    permission_classes = [IsAuthenticated]


class AdmissionViewSet(viewsets.ModelViewSet):
    queryset = Admission.objects.select_related('visit__patient', 'ward', 'bed').all()
    serializer_class = AdmissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        status_filter = self.request.query_params.get('status', 'active')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    def perform_create(self, serializer):
        admission = serializer.save(admitted_by=self.request.user)
        admission.bed.is_occupied = True
        admission.bed.save()

    @action(detail=True, methods=['post'])
    def discharge(self, request, pk=None):
        admission = self.get_object()
        admission.status = 'discharged'
        admission.discharged_at = timezone.now()
        admission.discharge_notes = request.data.get('discharge_notes', '')
        admission.bed.is_occupied = False
        admission.bed.save()
        admission.save()
        admission.visit.status = 'discharged'
        admission.visit.save()
        return Response(AdmissionSerializer(admission).data)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]