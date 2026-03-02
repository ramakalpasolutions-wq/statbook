const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding STAT BOOK database...')

  // ─── CLEANUP ──────────────────────────────────────────────
  await prisma.settlement.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.revenue.deleteMany()
  await prisma.consultation.deleteMany()
  await prisma.emergency.deleteMany()
  await prisma.doctorLeave.deleteMany()
  await prisma.oTP.deleteMany()
  await prisma.bankDetails.deleteMany()
  await prisma.familyMember.deleteMany()
  await prisma.doctor.deleteMany()
  await prisma.hospital.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.user.deleteMany()

  console.log('🗑️  Cleared existing data')

  const pass = await bcrypt.hash('Password@123', 12)

  // ─── SUPER ADMIN ──────────────────────────────────────────
  const superAdmin = await prisma.user.create({
    data: {
      name: 'Krishna Teja',
      email: 'superadmin@statbook.com',
      phone: '9000000001',
      password: pass,
      role: 'SUPER_ADMIN',
      emailVerified: true,
      phoneVerified: true,
    },
  })

  // ─── HOSPITAL ADMINS ──────────────────────────────────────
  const hadmin1 = await prisma.user.create({
    data: { name: 'Ravi Kumar', email: 'admin@citycare.com', phone: '9000000002', password: pass, role: 'HOSPITAL_ADMIN', emailVerified: true, phoneVerified: true },
  })
  const hadmin2 = await prisma.user.create({
    data: { name: 'Priya Sharma', email: 'admin@apollohealth.com', phone: '9000000003', password: pass, role: 'HOSPITAL_ADMIN', emailVerified: true, phoneVerified: true },
  })
  const hadmin3 = await prisma.user.create({
    data: { name: 'Suresh Reddy', email: 'admin@nimsgov.com', phone: '9000000004', password: pass, role: 'HOSPITAL_ADMIN', emailVerified: true, phoneVerified: true },
  })
  const hadmin4 = await prisma.user.create({
    data: { name: 'Anita Joshi', email: 'admin@sunshine.com', phone: '9000000005', password: pass, role: 'HOSPITAL_ADMIN', emailVerified: true, phoneVerified: true },
  })

  console.log('✅ Admins created')

  // ─── HOSPITALS ────────────────────────────────────────────
  const hospital1 = await prisma.hospital.create({
    data: {
      hospitalId: 'HOSP-001',
      name: 'City Care Hospital',
      locationLink: 'https://maps.google.com/?q=City+Care+Hospital+Hyderabad',
      address: '45, Banjara Hills Road No. 10, Hyderabad',
      state: 'Telangana',
      district: 'Hyderabad',
      city: 'Hyderabad',
      timings: '8:00 AM - 10:00 PM',
      phone: '9100000001',
      type: 'MULTI_SPECIALITY',
      email: 'info@citycare.com',
      website: 'https://citycare.com',
      password: pass,
      status: 'ACTIVE',
      description: 'City Care Hospital is a leading multi-speciality hospital in Hyderabad offering world-class medical care.',
      facilities: ['ICU', 'Emergency', 'Pharmacy', 'Lab', 'Radiology', 'Cafeteria', 'Parking', 'Online Consultation'],
      isEmergency: true,
      isOnline: true,
      adminId: hadmin1.id,
    },
  })

  const hospital2 = await prisma.hospital.create({
    data: {
      hospitalId: 'HOSP-002',
      name: 'Apollo Health Centre',
      locationLink: 'https://maps.google.com/?q=Apollo+Health+Centre+Hyderabad',
      address: '12, Jubilee Hills, Hyderabad',
      state: 'Telangana',
      district: 'Hyderabad',
      city: 'Hyderabad',
      timings: '24 Hours',
      phone: '9100000002',
      type: 'MULTI_SPECIALITY',
      email: 'info@apollohealth.com',
      website: 'https://apollohealth.com',
      password: pass,
      status: 'ACTIVE',
      description: 'Apollo Health Centre provides 24/7 healthcare services with state-of-the-art facilities.',
      facilities: ['ICU', 'Emergency', 'Trauma Center', 'Pharmacy', 'Lab', 'Blood Bank', 'Online Consultation'],
      isEmergency: true,
      isOnline: true,
      adminId: hadmin2.id,
    },
  })

  const hospital3 = await prisma.hospital.create({
    data: {
      hospitalId: 'HOSP-003',
      name: 'NIMS Government Hospital',
      locationLink: 'https://maps.google.com/?q=NIMS+Hospital+Hyderabad',
      address: 'Punjagutta, Hyderabad',
      state: 'Telangana',
      district: 'Hyderabad',
      city: 'Hyderabad',
      timings: '9:00 AM - 5:00 PM',
      phone: '9100000003',
      type: 'NORMAL',
      email: 'info@nimsgov.com',
      website: 'https://nims.gov.in',
      password: pass,
      status: 'ACTIVE',
      description: 'NIMS is one of the premier government hospitals in Telangana providing affordable healthcare.',
      facilities: ['Emergency', 'Pharmacy', 'Lab', 'Radiology'],
      isEmergency: false,
      isOnline: false,
      adminId: hadmin3.id,
    },
  })

  const hospital4 = await prisma.hospital.create({
    data: {
      hospitalId: 'HOSP-004',
      name: 'Sunshine Clinic',
      locationLink: 'https://maps.google.com/?q=Sunshine+Clinic+Secunderabad',
      address: '88, MG Road, Secunderabad',
      state: 'Telangana',
      district: 'Hyderabad',
      city: 'Secunderabad',
      timings: '9:00 AM - 8:00 PM',
      phone: '9100000004',
      type: 'CLINIC',
      email: 'info@sunshineclinic.com',
      website: 'https://sunshineclinic.com',
      password: pass,
      status: 'PENDING',
      description: 'Sunshine Clinic offers general healthcare services in Secunderabad.',
      facilities: ['Pharmacy', 'Lab'],
      isEmergency: false,
      isOnline: true,
      adminId: hadmin4.id,
    },
  })

  const hospital5 = await prisma.hospital.create({
    data: {
      hospitalId: 'HOSP-005',
      name: 'MediPlus Hospital',
      locationLink: 'https://maps.google.com/?q=MediPlus+Hyderabad',
      address: '22, Kukatpally, Hyderabad',
      state: 'Telangana',
      district: 'Hyderabad',
      city: 'Kukatpally',
      timings: '8:00 AM - 9:00 PM',
      phone: '9100000005',
      type: 'MULTI_SPECIALITY',
      email: 'info@mediplus.com',
      website: 'https://mediplus.com',
      password: pass,
      status: 'INACTIVE',
      description: 'MediPlus Hospital - Currently Inactive.',
      facilities: ['ICU', 'Pharmacy', 'Lab'],
      isEmergency: false,
      isOnline: false,
      inactiveSince: new Date(Date.now() - 1000 * 60 * 60 * 24 * 400),
      adminId: null,
    },
  })

  console.log('✅ Hospitals created')

  // ─── BANK DETAILS ─────────────────────────────────────────
  await prisma.bankDetails.create({
    data: {
      hospitalId: hospital1.id,
      accountHolderName: 'City Care Hospital Pvt Ltd',
      bankName: 'HDFC Bank',
      accountNumber: '50100123456789',
      ifscCode: 'HDFC0001234',
      branchName: 'Banjara Hills Branch',
      upiId: 'citycare@hdfcbank',
    },
  })
  await prisma.bankDetails.create({
    data: {
      hospitalId: hospital2.id,
      accountHolderName: 'Apollo Health Centre Pvt Ltd',
      bankName: 'ICICI Bank',
      accountNumber: '00201234567890',
      ifscCode: 'ICIC0000456',
      branchName: 'Jubilee Hills Branch',
      upiId: 'apollo@icicibank',
    },
  })

  console.log('✅ Bank details created')

  // ─── DOCTORS ──────────────────────────────────────────────
  const doctorsData = [
    {
      doctorId: 'DOC-001', name: 'Dr. Anil Mehta',
      specializations: ['Cardiologist', 'Internal Medicine'],
      experience: 15, phone: '9200000001', email: 'anil.mehta@citycare.com',
      address: 'Banjara Hills, Hyderabad', bloodGroup: 'O+', qualification: 'MBBS, MD Cardiology',
      consultationFee: 800, availabilityType: 'FULL_DAY', startTime: '09:00', endTime: '17:00',
      isOnlineConsultation: true, onlineConsultationFee: 600, hospitalId: hospital1.id,
    },
    {
      doctorId: 'DOC-002', name: 'Dr. Sneha Rao',
      specializations: ['Neurologist'],
      experience: 12, phone: '9200000002', email: 'sneha.rao@citycare.com',
      address: 'Madhapur, Hyderabad', bloodGroup: 'A+', qualification: 'MBBS, DM Neurology',
      consultationFee: 1000,
      availabilityType: 'TIME_INTERVALS',
      timeSlots: [{ startTime: '10:00', endTime: '13:00' }, { startTime: '16:00', endTime: '19:00' }],
      isOnlineConsultation: true, onlineConsultationFee: 800, hospitalId: hospital1.id,
    },
    {
      doctorId: 'DOC-003', name: 'Dr. Rajesh Gupta',
      specializations: ['Orthopedic', 'Sports Medicine'],
      experience: 20, phone: '9200000003', email: 'rajesh.gupta@apollohealth.com',
      address: 'Jubilee Hills, Hyderabad', bloodGroup: 'B+', qualification: 'MBBS, MS Ortho',
      consultationFee: 1200, availabilityType: 'FULL_DAY', startTime: '08:00', endTime: '18:00',
      isOnlineConsultation: false, hospitalId: hospital2.id,
    },
    {
      doctorId: 'DOC-004', name: 'Dr. Kavita Nair',
      specializations: ['Gynecologist', 'Obstetrician'],
      experience: 10, phone: '9200000004', email: 'kavita.nair@apollohealth.com',
      address: 'Kondapur, Hyderabad', bloodGroup: 'AB+', qualification: 'MBBS, MS Gynecology',
      consultationFee: 900, availabilityType: 'FULL_DAY', startTime: '10:00', endTime: '20:00',
      isOnlineConsultation: true, onlineConsultationFee: 700, hospitalId: hospital2.id,
    },
    {
      doctorId: 'DOC-005', name: 'Dr. Venkat Prasad',
      specializations: ['General Physician'],
      experience: 8, phone: '9200000005', email: 'venkat.prasad@nimsgov.com',
      address: 'Punjagutta, Hyderabad', bloodGroup: 'O-', qualification: 'MBBS',
      consultationFee: 300, availabilityType: 'FULL_DAY', startTime: '09:00', endTime: '17:00',
      isOnlineConsultation: false, hospitalId: hospital3.id,
    },
    {
      doctorId: 'DOC-006', name: 'Dr. Meena Krishnan',
      specializations: ['Dermatologist', 'Cosmetologist'],
      experience: 6, phone: '9200000006', email: 'meena.k@citycare.com',
      address: 'Gachibowli, Hyderabad', bloodGroup: 'B-', qualification: 'MBBS, DVD',
      consultationFee: 700,
      availabilityType: 'TIME_INTERVALS',
      timeSlots: [{ startTime: '09:00', endTime: '12:00' }, { startTime: '15:00', endTime: '18:00' }],
      isOnlineConsultation: true, onlineConsultationFee: 500, hospitalId: hospital1.id,
    },
    {
      doctorId: 'DOC-007', name: 'Dr. Arjun Shetty',
      specializations: ['Pediatrician'],
      experience: 14, phone: '9200000007', email: 'arjun.shetty@apollohealth.com',
      address: 'Hitec City, Hyderabad', bloodGroup: 'A-', qualification: 'MBBS, MD Pediatrics',
      consultationFee: 600, availabilityType: 'FULL_DAY', startTime: '09:00', endTime: '18:00',
      isOnlineConsultation: true, onlineConsultationFee: 500, hospitalId: hospital2.id,
    },
    {
      doctorId: 'DOC-008', name: 'Dr. Divya Menon',
      specializations: ['Psychiatrist', 'Psychotherapist'],
      experience: 9, phone: '9200000008', email: 'divya.menon@nimsgov.com',
      address: 'Ameerpet, Hyderabad', bloodGroup: 'AB-', qualification: 'MBBS, MD Psychiatry',
      consultationFee: 1100,
      availabilityType: 'TIME_INTERVALS',
      timeSlots: [{ startTime: '11:00', endTime: '14:00' }, { startTime: '17:00', endTime: '20:00' }],
      isOnlineConsultation: true, onlineConsultationFee: 900, hospitalId: hospital3.id,
    },
    {
      doctorId: 'DOC-009', name: 'Dr. Srinivas Rao',
      specializations: ['Ophthalmologist'],
      experience: 11, phone: '9200000009', email: 'srinivas.rao@apollohealth.com',
      address: 'Jubilee Hills, Hyderabad', bloodGroup: 'O+', qualification: 'MBBS, MS Ophthalmology',
      consultationFee: 750, availabilityType: 'FULL_DAY', startTime: '10:00', endTime: '18:00',
      isOnlineConsultation: false, hospitalId: hospital2.id,
    },
    {
      doctorId: 'DOC-010', name: 'Dr. Fatima Sheikh',
      specializations: ['ENT Specialist'],
      experience: 7, phone: '9200000010', email: 'fatima.s@citycare.com',
      address: 'Banjara Hills, Hyderabad', bloodGroup: 'B+', qualification: 'MBBS, MS ENT',
      consultationFee: 650, availabilityType: 'FULL_DAY', startTime: '09:00', endTime: '17:00',
      isOnlineConsultation: true, onlineConsultationFee: 500, hospitalId: hospital1.id,
    },
  ]

  const doctors = []
  for (const d of doctorsData) {
    const doc = await prisma.doctor.create({ data: { ...d, password: pass } })
    doctors.push(doc)
  }
  console.log('✅ Doctors created')

  // ─── DOCTOR LEAVES ────────────────────────────────────────
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const d = (n) => { const x = new Date(today); x.setDate(x.getDate() + n); return x }

  await prisma.doctorLeave.createMany({
    data: [
      { doctorId: doctors[2].id, startDate: d(5), endDate: d(7), reason: 'Personal leave' },
      { doctorId: doctors[0].id, startDate: d(10), endDate: d(12), reason: 'Conference' },
    ],
  })
  console.log('✅ Doctor leaves created')

  // ─── USERS ────────────────────────────────────────────────
  const usersRaw = [
    { name: 'Kiran Reddy', email: 'kiran.reddy@gmail.com', phone: '0000000001', address: 'Ameerpet, Hyderabad', location: 'Hyderabad' },
    { name: 'Lakshmi Devi', email: 'lakshmi.d@gmail.com', phone: '0000000002', address: 'Dilsukhnagar, Hyderabad', location: 'Hyderabad' },
    { name: 'Manoj Kumar', email: 'manoj.k@gmail.com', phone: '0000000003', address: 'LB Nagar, Hyderabad', location: 'Hyderabad' },
    { name: 'Pooja Singh', email: 'pooja.s@gmail.com', phone: '0000000004', address: 'Kukatpally, Hyderabad', location: 'Hyderabad' },
    { name: 'Aakash Joshi', email: 'aakash.j@gmail.com', phone: '0000000005', address: 'Begumpet, Hyderabad', location: 'Hyderabad' },
    { name: 'Rohini Patil', email: 'rohini.p@gmail.com', phone: '0000000006', address: 'Secunderabad', location: 'Secunderabad' },
    { name: 'Sunil Verma', email: 'sunil.v@gmail.com', phone: '0000000007', address: 'Gachibowli, Hyderabad', location: 'Hyderabad' },
    { name: 'Anjali Das', email: 'anjali.d@gmail.com', phone: '0000000008', address: 'Madhapur, Hyderabad', location: 'Hyderabad' },
    { name: 'Vivek Nair', email: 'vivek.n@gmail.com', phone: '0000000009', address: 'Kondapur, Hyderabad', location: 'Hyderabad' },
    { name: 'Shalini Iyer', email: 'shalini.i@gmail.com', phone: '0000000010', address: 'Banjara Hills, Hyderabad', location: 'Hyderabad' },
  ]

  const users = []
  for (const u of usersRaw) {
    const user = await prisma.user.create({
      data: { ...u, password: pass, role: 'USER', emailVerified: true, phoneVerified: true },
    })
    users.push(user)
  }

  // Family members
  await prisma.familyMember.createMany({
    data: [
      { userId: users[0].id, name: 'Ravi Reddy', relation: 'Father', phone: '9300001001', age: 58, bloodGroup: 'B+' },
      { userId: users[0].id, name: 'Suma Reddy', relation: 'Mother', phone: '9300001002', age: 55, bloodGroup: 'O+' },
      { userId: users[1].id, name: 'Arjun Devi', relation: 'Husband', phone: '9300001003', age: 35, bloodGroup: 'A+' },
    ],
  })
  console.log('✅ Users + family members created')

  // ─── CONSULTATIONS ────────────────────────────────────────
  const consultationsData = [
    // TODAY
    { user: users[0], doctor: doctors[0], hospital: hospital1, date: d(0), time: '10:00 AM', status: 'PENDING', fee: 800, type: 'OFFLINE' },
    { user: users[1], doctor: doctors[1], hospital: hospital1, date: d(0), time: '11:00 AM', status: 'ACCEPTED', fee: 600, type: 'ONLINE', meetLink: 'https://meet.google.com/abc-defg-hij' },
    { user: users[2], doctor: doctors[2], hospital: hospital2, date: d(0), time: '09:00 AM', status: 'COMPLETED', fee: 1200, type: 'OFFLINE' },
    { user: users[3], doctor: doctors[3], hospital: hospital2, date: d(0), time: '02:00 PM', status: 'PENDING', fee: 700, type: 'ONLINE', meetLink: 'https://meet.google.com/klm-nopq-rst' },
    { user: users[4], doctor: doctors[4], hospital: hospital3, date: d(0), time: '10:30 AM', status: 'CANCELLED', fee: 300, type: 'OFFLINE', cancelledBy: 'PATIENT', cancelledByName: users[4].name },

    // YESTERDAY
    { user: users[5], doctor: doctors[0], hospital: hospital1, date: d(-1), time: '09:00 AM', status: 'COMPLETED', fee: 800, type: 'OFFLINE' },
    { user: users[6], doctor: doctors[5], hospital: hospital1, date: d(-1), time: '11:30 AM', status: 'COMPLETED', fee: 500, type: 'ONLINE', meetLink: 'https://meet.google.com/uvw-xyz1-234' },
    { user: users[7], doctor: doctors[2], hospital: hospital2, date: d(-1), time: '03:00 PM', status: 'CANCELLED', fee: 1200, type: 'OFFLINE', cancelledBy: 'DOCTOR', cancelledByName: doctors[2].name },

    // 2 DAYS AGO
    { user: users[8], doctor: doctors[6], hospital: hospital2, date: d(-2), time: '10:00 AM', status: 'COMPLETED', fee: 600, type: 'OFFLINE' },
    { user: users[9], doctor: doctors[7], hospital: hospital3, date: d(-2), time: '01:00 PM', status: 'COMPLETED', fee: 900, type: 'ONLINE', meetLink: 'https://meet.google.com/567-890a-bcd' },
    { user: users[0], doctor: doctors[1], hospital: hospital1, date: d(-2), time: '04:00 PM', status: 'RESCHEDULED', fee: 800, type: 'OFFLINE', rescheduledBy: doctors[1].name },

    // 5 DAYS AGO
    { user: users[1], doctor: doctors[3], hospital: hospital2, date: d(-5), time: '09:30 AM', status: 'COMPLETED', fee: 700, type: 'ONLINE' },
    { user: users[2], doctor: doctors[4], hospital: hospital3, date: d(-5), time: '11:00 AM', status: 'COMPLETED', fee: 300, type: 'OFFLINE' },
    { user: users[3], doctor: doctors[0], hospital: hospital1, date: d(-5), time: '02:30 PM', status: 'COMPLETED', fee: 600, type: 'ONLINE' },

    // 10 DAYS AGO
    { user: users[4], doctor: doctors[2], hospital: hospital2, date: d(-10), time: '10:00 AM', status: 'COMPLETED', fee: 1200, type: 'OFFLINE' },
    { user: users[5], doctor: doctors[6], hospital: hospital2, date: d(-10), time: '12:00 PM', status: 'COMPLETED', fee: 500, type: 'ONLINE' },
    { user: users[6], doctor: doctors[7], hospital: hospital3, date: d(-10), time: '03:00 PM', status: 'COMPLETED', fee: 900, type: 'OFFLINE' },

    // 20 DAYS AGO
    { user: users[7], doctor: doctors[1], hospital: hospital1, date: d(-20), time: '09:00 AM', status: 'COMPLETED', fee: 800, type: 'ONLINE' },
    { user: users[8], doctor: doctors[5], hospital: hospital1, date: d(-20), time: '11:00 AM', status: 'COMPLETED', fee: 500, type: 'OFFLINE' },
    { user: users[9], doctor: doctors[3], hospital: hospital2, date: d(-20), time: '02:00 PM', status: 'COMPLETED', fee: 700, type: 'ONLINE' },

    // TOMORROW
    { user: users[0], doctor: doctors[6], hospital: hospital2, date: d(1), time: '10:00 AM', status: 'ACCEPTED', fee: 600, type: 'OFFLINE' },
    { user: users[1], doctor: doctors[0], hospital: hospital1, date: d(1), time: '11:30 AM', status: 'PENDING', fee: 600, type: 'ONLINE', meetLink: 'https://meet.google.com/efg-hijk-lmn' },
    { user: users[2], doctor: doctors[3], hospital: hospital2, date: d(1), time: '03:00 PM', status: 'PENDING', fee: 700, type: 'ONLINE' },

    // 3 DAYS LATER
    { user: users[3], doctor: doctors[1], hospital: hospital1, date: d(3), time: '09:00 AM', status: 'PENDING', fee: 800, type: 'OFFLINE' },
    { user: users[4], doctor: doctors[4], hospital: hospital3, date: d(3), time: '01:00 PM', status: 'ACCEPTED', fee: 300, type: 'OFFLINE' },

    // 7 DAYS LATER
    { user: users[5], doctor: doctors[2], hospital: hospital2, date: d(7), time: '10:00 AM', status: 'PENDING', fee: 1200, type: 'OFFLINE' },
    { user: users[6], doctor: doctors[9], hospital: hospital1, date: d(7), time: '02:00 PM', status: 'PENDING', fee: 500, type: 'ONLINE', meetLink: 'https://meet.google.com/opq-rstu-vwx' },
  ]

  const consultations = []
  let ci = 1
  for (const c of consultationsData) {
    const cons = await prisma.consultation.create({
      data: {
        consultationId: `CONS-${String(ci).padStart(4, '0')}`,
        userId: c.user.id,
        doctorId: c.doctor.id,
        hospitalId: c.hospital.id,
        type: c.type,
        date: c.date,
        time: c.time,
        status: c.status,
        fee: c.fee,
        cancelledBy: c.cancelledBy || null,
        cancelledByName: c.cancelledByName || null,
        rescheduledBy: c.rescheduledBy || null,
        meetLink: c.meetLink || null,
        description: c.description || null,
      },
    })
    consultations.push({ ...cons, _data: c })
    ci++
  }
  console.log('✅ Consultations created')

  // ─── REVENUE ──────────────────────────────────────────────
  // Get current week start (Sunday)
  const getWeekStart = (date) => {
    const d2 = new Date(date)
    d2.setDate(d2.getDate() - d2.getDay())
    d2.setHours(0, 0, 0, 0)
    return d2
  }
  const getWeekEnd = (weekStart) => {
    const d2 = new Date(weekStart)
    d2.setDate(d2.getDate() + 6)
    d2.setHours(23, 59, 59, 999)
    return d2
  }

  for (const c of consultations) {
    if (c._data.status === 'COMPLETED') {
      const totalRevenue = c._data.fee
      const commission = Math.round(totalRevenue * 0.2)
      const payable = totalRevenue - commission
      const ws = getWeekStart(c._data.date)
      const we = getWeekEnd(ws)

      await prisma.revenue.create({
        data: {
          consultationId: c.id,
          doctorId: c.doctorId,
          hospitalId: c.hospitalId,
          totalRevenue,
          commission,
          payable,
          status: 'ACTIVE',
          weekStart: ws,
          weekEnd: we,
        },
      })
    }
  }
  console.log('✅ Revenue created')

  // ─── SETTLEMENTS ──────────────────────────────────────────
  // Create past settled weeks for hospital1 and hospital2
  const lastWeekStart = getWeekStart(d(-7))
  const lastWeekEnd = getWeekEnd(lastWeekStart)

  await prisma.settlement.create({
    data: {
      hospitalId: hospital1.id,
      weekStart: lastWeekStart,
      weekEnd: lastWeekEnd,
      totalRevenue: 3200,
      commission: 640,
      payable: 2560,
      status: 'SETTLED',
      settledAt: d(-1),
    },
  })

  await prisma.settlement.create({
    data: {
      hospitalId: hospital2.id,
      weekStart: lastWeekStart,
      weekEnd: lastWeekEnd,
      totalRevenue: 4500,
      commission: 900,
      payable: 3600,
      status: 'SETTLED',
      settledAt: d(-1),
    },
  })

  // Current unsettled week
  const thisWeekStart = getWeekStart(today)
  const thisWeekEnd = getWeekEnd(thisWeekStart)

  await prisma.settlement.create({
    data: {
      hospitalId: hospital1.id,
      weekStart: thisWeekStart,
      weekEnd: thisWeekEnd,
      totalRevenue: 1600,
      commission: 320,
      payable: 1280,
      status: 'UNSETTLED',
    },
  })

  await prisma.settlement.create({
    data: {
      hospitalId: hospital2.id,
      weekStart: thisWeekStart,
      weekEnd: thisWeekEnd,
      totalRevenue: 2200,
      commission: 440,
      payable: 1760,
      status: 'UNSETTLED',
    },
  })
  console.log('✅ Settlements created')

  // ─── EMERGENCY ────────────────────────────────────────────
  await prisma.emergency.createMany({
    data: [
      { userId: users[0].id, patientName: 'Kiran Reddy', phone: '0000000001', latitude: 17.4239, longitude: 78.4738, locationText: 'Ameerpet, Hyderabad', hospitalId: hospital1.id, status: 'PENDING' },
      { userId: users[1].id, patientName: 'Lakshmi Devi', phone: '0000000002', latitude: 17.3850, longitude: 78.5267, locationText: 'Dilsukhnagar, Hyderabad', hospitalId: hospital1.id, status: 'ASSIGNED', assignedTo: doctors[0].id, attendedAt: new Date() },
      { userId: users[2].id, patientName: 'Manoj Kumar', phone: '0000000003', latitude: 17.4475, longitude: 78.5150, locationText: 'Kukatpally, Hyderabad', hospitalId: hospital2.id, status: 'PENDING' },
    ],
  })
  console.log('✅ Emergency records created')

  // ─── FINAL SUMMARY ────────────────────────────────────────
  console.log('\n🎉 Seeding complete!\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📋  LOGIN CREDENTIALS  |  Password for all: Password@123')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('👑  Super Admin      →  superadmin@statbook.com')
  console.log('🏥  Hospital Admin 1 →  admin@citycare.com       (City Care)')
  console.log('🏥  Hospital Admin 2 →  admin@apollohealth.com   (Apollo)')
  console.log('🏥  Hospital Admin 3 →  admin@nimsgov.com        (NIMS)')
  console.log('🏥  Hospital Admin 4 →  admin@sunshine.com       (Sunshine Clinic)')
  console.log('👤  User 1           →  kiran.reddy@gmail.com')
  console.log('👤  User 2           →  lakshmi.d@gmail.com')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🏥  Hospitals    : 5  (3 Active, 1 Pending, 1 Inactive)')
  console.log('👨‍⚕️  Doctors      : 10 (mix of online + offline)')
  console.log('👤  Users        : 10 (with family members)')
  console.log('📋  Consultations: 27 (today/past/future, online+offline)')
  console.log('💰  Revenue      : auto-calculated (20% commission)')
  console.log('🏦  Settlements  : 4  (2 settled last week, 2 unsettled this week)')
  console.log('🚨  Emergency    : 3  (2 pending, 1 attended)')
  console.log('📅  Doctor Leaves: 2')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
