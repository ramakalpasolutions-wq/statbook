export function generateHospitalId() {
  return 'HOSP-' + Date.now().toString(36).toUpperCase()
}

export function generateDoctorId() {
  return 'DOC-' + Date.now().toString(36).toUpperCase()
}

export function generateConsultationId() {
  return 'CONS-' + Date.now().toString(36).toUpperCase()
}
