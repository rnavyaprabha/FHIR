const fs = require('fs');
const path = require('path');
const axios = require('axios');

const FHIR_BASE_URL = 'https://nrajappa.dev.webchart.app/webchart.cgi/fhir';

// Helper to load the saved token from token.txt
function getAuthHeaders() {
  const tokenPath = path.join(__dirname, 'token.txt');
  let token = '';
  try {
    token = fs.readFileSync(tokenPath, 'utf8').trim();
  } catch {}
  return {
    'Content-Type': 'application/fhir+json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

// Create Patient
async function createPatient(patientData) {
  const headers = getAuthHeaders();
  const res = await axios.post(`${FHIR_BASE_URL}/Patient`, patientData, { headers });
  return res.data.id;
}

// Get Patient by ID
async function getPatient(id) {
  const headers = getAuthHeaders();
  const res = await axios.get(`${FHIR_BASE_URL}/Patient/${id}`, { headers });
  return res.data;
}

// Search Patient by Name
async function searchPatientByName(name) {
  const headers = getAuthHeaders();
  const res = await axios.get(`${FHIR_BASE_URL}/Patient?name=${encodeURIComponent(name)}`, { headers });
  return res.data.entry ? res.data.entry.map(e => e.resource) : [];
}

// Update Patient Phone
async function updatePatientPhone(id, newPhone) {
  const headers = getAuthHeaders();
  // Get the patient first
  const patientRes = await axios.get(`${FHIR_BASE_URL}/Patient/${id}`, { headers });
  const patient = patientRes.data;
  // Update phone
  patient.telecom = patient.telecom || [];
  const phoneEntry = patient.telecom.find(t => t.system === 'phone');
  if (phoneEntry) {
    phoneEntry.value = newPhone;
  } else {
    patient.telecom.push({ system: 'phone', value: newPhone });
  }
  // Update patient
  const res = await axios.put(`${FHIR_BASE_URL}/Patient/${id}`, patient, { headers });
  return res.data;
}

// Delete Patient
async function deletePatient(id) {
  const headers = getAuthHeaders();
  await axios.delete(`${FHIR_BASE_URL}/Patient/${id}`, { headers });
}

// Create Observation
async function createObservation(patientId, obsData) {
  const headers = getAuthHeaders();
  obsData.subject = { reference: `Patient/${patientId}` };
  const res = await axios.post(`${FHIR_BASE_URL}/Observation`, obsData, { headers });
  return res.data.id;
}

// List Observations for a Patient
async function searchObservations(patientId) {
  const headers = getAuthHeaders();
  const res = await axios.get(`${FHIR_BASE_URL}/Observation?subject=Patient/${patientId}`, { headers });
  return res.data.entry ? res.data.entry.map(e => e.resource) : [];
}

module.exports = {
  createPatient,
  getPatient,
  searchPatientByName,
  updatePatientPhone,
  deletePatient,
  createObservation,
  searchObservations
};