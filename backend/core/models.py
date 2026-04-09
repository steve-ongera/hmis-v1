from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
import uuid


class User(AbstractUser):
    ROLES = [
        ('admin', 'Admin'),
        ('receptionist', 'Receptionist'),
        ('triage_nurse', 'Triage Nurse'),
        ('doctor', 'Doctor / Consultant'),
        ('cashier', 'Cashier'),
        ('pharmacist', 'Pharmacist'),
        ('ward_nurse', 'Ward Nurse'),
    ]
    role = models.CharField(max_length=30, choices=ROLES, default='receptionist')
    phone = models.CharField(max_length=15, blank=True)
    department = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.get_full_name()} ({self.role})"


class Patient(models.Model):
    GENDER_CHOICES = [('M', 'Male'), ('F', 'Female'), ('O', 'Other')]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient_number = models.CharField(max_length=20, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    phone = models.CharField(max_length=15)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    next_of_kin = models.CharField(max_length=200, blank=True)
    next_of_kin_phone = models.CharField(max_length=15, blank=True)
    national_id = models.CharField(max_length=20, blank=True)
    insurance_provider = models.CharField(max_length=100, blank=True)
    insurance_number = models.CharField(max_length=50, blank=True)
    blood_group = models.CharField(max_length=5, blank=True)
    allergies = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.patient_number} - {self.first_name} {self.last_name}"

    def save(self, *args, **kwargs):
        if not self.patient_number:
            last = Patient.objects.order_by('-created_at').first()
            num = 1 if not last else int(last.patient_number.replace('P', '')) + 1
            self.patient_number = f"P{num:05d}"
        super().save(*args, **kwargs)


class Visit(models.Model):
    STATUS_CHOICES = [
        ('registered', 'Registered'),
        ('waiting_triage', 'Waiting Triage'),
        ('triaged', 'Triaged'),
        ('waiting_consultation', 'Waiting Consultation'),
        ('in_consultation', 'In Consultation'),
        ('waiting_payment', 'Waiting Payment'),
        ('paid', 'Paid'),
        ('at_pharmacy', 'At Pharmacy'),
        ('admitted', 'Admitted'),
        ('discharged', 'Discharged'),
    ]
    VISIT_TYPES = [
        ('outpatient', 'Outpatient'),
        ('inpatient', 'Inpatient'),
        ('emergency', 'Emergency'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    visit_number = models.CharField(max_length=20, unique=True)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='visits')
    visit_type = models.CharField(max_length=20, choices=VISIT_TYPES, default='outpatient')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='registered')
    chief_complaint = models.TextField(blank=True)
    registered_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='registered_visits')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.visit_number} - {self.patient}"

    def save(self, *args, **kwargs):
        if not self.visit_number:
            last = Visit.objects.order_by('-created_at').first()
            num = 1 if not last else int(last.visit_number.replace('V', '')) + 1
            self.visit_number = f"V{num:06d}"
        super().save(*args, **kwargs)


class Triage(models.Model):
    PRIORITY = [
        ('1', 'Critical (Red)'),
        ('2', 'Urgent (Orange)'),
        ('3', 'Semi-Urgent (Yellow)'),
        ('4', 'Non-Urgent (Green)'),
        ('5', 'Deceased (Black)'),
    ]
    visit = models.OneToOneField(Visit, on_delete=models.CASCADE, related_name='triage')
    nurse = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    temperature = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    blood_pressure_systolic = models.IntegerField(null=True, blank=True)
    blood_pressure_diastolic = models.IntegerField(null=True, blank=True)
    pulse_rate = models.IntegerField(null=True, blank=True)
    respiratory_rate = models.IntegerField(null=True, blank=True)
    oxygen_saturation = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    weight = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    height = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    priority = models.CharField(max_length=1, choices=PRIORITY, default='4')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Triage for {self.visit.visit_number}"


class Consultation(models.Model):
    visit = models.OneToOneField(Visit, on_delete=models.CASCADE, related_name='consultation')
    doctor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    history_of_presenting_illness = models.TextField(blank=True)
    examination_findings = models.TextField(blank=True)
    diagnosis = models.TextField(blank=True)
    plan = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    admit_patient = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Consultation for {self.visit.visit_number}"


class Drug(models.Model):
    UNIT_CHOICES = [
        ('tablet', 'Tablet'), ('capsule', 'Capsule'), ('ml', 'ml'),
        ('vial', 'Vial'), ('sachet', 'Sachet'), ('tube', 'Tube'),
    ]
    name = models.CharField(max_length=200)
    generic_name = models.CharField(max_length=200, blank=True)
    strength = models.CharField(max_length=50, blank=True)
    unit = models.CharField(max_length=20, choices=UNIT_CHOICES, default='tablet')
    stock_quantity = models.IntegerField(default=0)
    reorder_level = models.IntegerField(default=50)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} {self.strength}"


class Prescription(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('dispensed', 'Dispensed'),
        ('partial', 'Partially Dispensed'),
        ('cancelled', 'Cancelled'),
    ]
    consultation = models.ForeignKey(Consultation, on_delete=models.CASCADE, related_name='prescriptions')
    drug = models.ForeignKey(Drug, on_delete=models.CASCADE)
    dosage = models.CharField(max_length=100)
    frequency = models.CharField(max_length=100)
    duration = models.CharField(max_length=100)
    quantity = models.IntegerField()
    instructions = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    dispensed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='dispensed')
    dispensed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.drug.name} for {self.consultation.visit.visit_number}"


class Service(models.Model):
    CATEGORY_CHOICES = [
        ('consultation', 'Consultation'), ('lab', 'Laboratory'),
        ('radiology', 'Radiology'), ('procedure', 'Procedure'),
        ('ward', 'Ward'), ('other', 'Other'),
    ]
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} - KES {self.price}"


class Bill(models.Model):
    STATUS_CHOICES = [
        ('unpaid', 'Unpaid'), ('partial', 'Partially Paid'),
        ('paid', 'Paid'), ('waived', 'Waived'),
    ]
    PAYMENT_METHODS = [
        ('cash', 'Cash'), ('mpesa', 'M-Pesa'),
        ('insurance', 'Insurance'), ('nhif', 'NHIF'),
        ('card', 'Card'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    bill_number = models.CharField(max_length=20, unique=True)
    visit = models.OneToOneField(Visit, on_delete=models.CASCADE, related_name='bill')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='unpaid')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, blank=True)
    mpesa_code = models.CharField(max_length=20, blank=True)
    cashier = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Bill {self.bill_number} - {self.visit.patient}"

    def save(self, *args, **kwargs):
        if not self.bill_number:
            last = Bill.objects.order_by('-created_at').first()
            num = 1 if not last else int(last.bill_number.replace('B', '')) + 1
            self.bill_number = f"B{num:06d}"
        super().save(*args, **kwargs)


class BillItem(models.Model):
    bill = models.ForeignKey(Bill, on_delete=models.CASCADE, related_name='items')
    description = models.CharField(max_length=200)
    quantity = models.IntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)

    def save(self, *args, **kwargs):
        self.total = self.quantity * self.unit_price
        super().save(*args, **kwargs)


class Ward(models.Model):
    WARD_TYPES = [
        ('general', 'General'), ('private', 'Private'),
        ('icu', 'ICU'), ('maternity', 'Maternity'),
        ('pediatric', 'Pediatric'), ('surgical', 'Surgical'),
    ]
    name = models.CharField(max_length=100)
    ward_type = models.CharField(max_length=20, choices=WARD_TYPES)
    total_beds = models.IntegerField()
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

    @property
    def available_beds(self):
        occupied = self.beds.filter(is_occupied=True).count()
        return self.total_beds - occupied


class Bed(models.Model):
    ward = models.ForeignKey(Ward, on_delete=models.CASCADE, related_name='beds')
    bed_number = models.CharField(max_length=10)
    is_occupied = models.BooleanField(default=False)

    class Meta:
        unique_together = ['ward', 'bed_number']

    def __str__(self):
        return f"{self.ward.name} - Bed {self.bed_number}"


class Admission(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'), ('discharged', 'Discharged'), ('transferred', 'Transferred'),
    ]
    visit = models.OneToOneField(Visit, on_delete=models.CASCADE, related_name='admission')
    ward = models.ForeignKey(Ward, on_delete=models.CASCADE)
    bed = models.ForeignKey(Bed, on_delete=models.CASCADE)
    admitted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    admitted_at = models.DateTimeField(auto_now_add=True)
    discharged_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    discharge_notes = models.TextField(blank=True)

    def __str__(self):
        return f"Admission: {self.visit.patient} in {self.ward.name}"