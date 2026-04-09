# KenyaHMIS — Level 5 Hospital Management Information System

A full-stack HMIS covering the complete patient journey from Reception → Triage → Consultation → Cashier → Pharmacy → Wards.

---

## Project Structure

```
hmis/
├── backend/                    ← Django REST API (single core app)
│   ├── models.py               ← All models
│   ├── serializers.py          ← DRF serializers
│   ├── views.py                ← ViewSets + auth views
│   ├── urls.py                 ← API routes
│   ├── settings.py             ← Django settings
│   ├── requirements.txt
│   └── seed.py                 ← Seeds demo users, drugs, wards
│
└── frontend/                   ← React + Vite
    ├── index.html              ← Bootstrap Icons + Google Fonts
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx             ← Router + role-based redirects
        ├── index.css           ← Global styles
        ├── context/
        │   └── AuthContext.jsx
        ├── services/
        │   └── api.js          ← All API calls
        ├── components/
        │   ├── Layout.jsx
        │   ├── Navbar.jsx
        │   ├── Sidebar.jsx
        │   └── UI.jsx          ← Modal, Badge, Toast, etc.
        └── pages/
            ├── Login.jsx
            ├── Reception/      ← Register patients, create visits
            ├── Triage/         ← Vitals, priority scoring
            ├── Consultation/   ← History, examination, prescriptions
            ├── Cashier/        ← Bills, M-Pesa, insurance payments
            ├── Pharmacy/       ← Dispense medicines, stock
            ├── Wards/          ← Admissions, bed management
            └── Admin/          ← Dashboard, user management
```

---

## Backend Setup

```bash
# 1. Create project structure
mkdir -p hmis_project/core
cd hmis_project

# 2. Copy backend files:
#    - core/models.py, core/serializers.py, core/views.py, core/urls.py
#    - hmis_project/settings.py  (set AUTH_USER_MODEL = 'core.User')
#    - hmis_project/urls.py

# 3. Install dependencies
pip install -r requirements.txt

# 4. Migrations
python manage.py makemigrations core
python manage.py migrate

# 5. Seed demo data
python seed.py

# 6. Run
python manage.py runserver
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

---

## Demo Logins

| Username      | Password   | Redirects To        |
|---------------|------------|---------------------|
| admin         | admin123   | Admin Dashboard     |
| receptionist  | pass123    | Reception           |
| nurse         | pass123    | Triage              |
| doctor        | pass123    | Consultation        |
| cashier       | pass123    | Cashier             |
| pharmacist    | pass123    | Pharmacy            |
| ward_nurse    | pass123    | Wards               |

---

## Patient Journey Flow

```
Reception → creates patient record + visit
    ↓
Triage → records vitals, assigns priority (Critical/Urgent/Non-Urgent)
    ↓
Consultation → doctor writes history, examination, diagnosis, prescriptions
    ↓
Cashier → adds bill items (consultation, labs, procedures), processes payment
         (Cash / M-Pesa / NHIF / Insurance)
    ↓
Pharmacy → verifies payment, dispenses medicines, updates stock
    ↓
Wards (if admitted) → ward nurse assigns bed, monitors, discharges
```

---

## Key Features

### Reception
- Patient registration with full demographics
- Insurance/NHIF support
- Visit creation (Outpatient / Inpatient / Emergency)
- Search patients by name, phone, national ID

### Triage
- Vitals: BP, Temperature, Pulse, SpO2, Weight, Height
- Priority scoring: Critical (Red) → Urgent (Orange) → Non-Urgent (Green)
- Queue management

### Consultation
- Full clinical notes (HPI, Examination, Diagnosis, Plan)
- Multi-drug prescriptions with dosage/frequency/duration
- Admit to ward option

### Cashier
- Service catalog (consultation, lab, radiology, etc.)
- Multiple payment methods: Cash, M-Pesa, NHIF, Insurance
- Partial payments supported
- Receipt generation

### Pharmacy
- Pending prescription queue (only paid patients)
- One-click dispense all
- Drug stock management with low-stock alerts
- Automatic stock deduction

### Wards
- Visual bed grid per ward (red = occupied, green = available)
- Occupancy percentage bar
- Patient admission to specific beds
- Discharge with notes

### Admin
- System-wide dashboard stats
- User management (create staff accounts)
- Full access to all modules