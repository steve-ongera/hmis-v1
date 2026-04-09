from rest_framework import serializers
from .models import *


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'role', 'phone', 'department']


class PatientSerializer(serializers.ModelSerializer):
    age = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Patient
        fields = '__all__'

    def get_age(self, obj):
        from datetime import date
        today = date.today()
        return today.year - obj.date_of_birth.year - (
            (today.month, today.day) < (obj.date_of_birth.month, obj.date_of_birth.day)
        )

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"


class TriageSerializer(serializers.ModelSerializer):
    nurse_name = serializers.CharField(source='nurse.get_full_name', read_only=True)

    class Meta:
        model = Triage
        fields = '__all__'


class DrugSerializer(serializers.ModelSerializer):
    class Meta:
        model = Drug
        fields = '__all__'


class PrescriptionSerializer(serializers.ModelSerializer):
    drug_name = serializers.CharField(source='drug.name', read_only=True)
    drug_strength = serializers.CharField(source='drug.strength', read_only=True)

    class Meta:
        model = Prescription
        fields = '__all__'


class ConsultationSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source='doctor.get_full_name', read_only=True)
    prescriptions = PrescriptionSerializer(many=True, read_only=True)

    class Meta:
        model = Consultation
        fields = '__all__'


class BillItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = BillItem
        fields = '__all__'


class BillSerializer(serializers.ModelSerializer):
    items = BillItemSerializer(many=True, read_only=True)
    balance = serializers.SerializerMethodField()

    class Meta:
        model = Bill
        fields = '__all__'

    def get_balance(self, obj):
        return float(obj.total_amount) - float(obj.paid_amount)


class WardSerializer(serializers.ModelSerializer):
    available_beds = serializers.IntegerField(read_only=True)
    occupied_beds = serializers.SerializerMethodField()

    class Meta:
        model = Ward
        fields = '__all__'

    def get_occupied_beds(self, obj):
        return obj.beds.filter(is_occupied=True).count()


class BedSerializer(serializers.ModelSerializer):
    ward_name = serializers.CharField(source='ward.name', read_only=True)

    class Meta:
        model = Bed
        fields = '__all__'


class AdmissionSerializer(serializers.ModelSerializer):
    ward_name = serializers.CharField(source='ward.name', read_only=True)
    bed_number = serializers.CharField(source='bed.bed_number', read_only=True)

    class Meta:
        model = Admission
        fields = '__all__'


class VisitSerializer(serializers.ModelSerializer):
    patient = PatientSerializer(read_only=True)
    patient_id = serializers.UUIDField(write_only=True)
    triage = TriageSerializer(read_only=True)
    consultation = ConsultationSerializer(read_only=True)
    bill = BillSerializer(read_only=True)
    admission = AdmissionSerializer(read_only=True)

    class Meta:
        model = Visit
        fields = '__all__'

    def create(self, validated_data):
        patient_id = validated_data.pop('patient_id')
        patient = Patient.objects.get(id=patient_id)
        return Visit.objects.create(patient=patient, **validated_data)


class VisitListSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.__str__', read_only=True)
    patient_number = serializers.CharField(source='patient.patient_number', read_only=True)
    has_triage = serializers.SerializerMethodField()

    class Meta:
        model = Visit
        fields = ['id', 'visit_number', 'patient_name', 'patient_number', 'visit_type',
                  'status', 'chief_complaint', 'created_at', 'has_triage']

    def get_has_triage(self, obj):
        return hasattr(obj, 'triage')