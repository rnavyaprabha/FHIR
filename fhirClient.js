const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Use WebChart server now
const FHIR_BASE_URL = 'https://navya.webch.art/webchart.cgi/fhir';

// ✅ Helper to load the saved token from token.txt
function getAuthHeaders() {
  const tokenPath = path.join(__dirname, 'token.txt');
  let token = '';
  try {
    token = fs.readFileSync(tokenPath, 'utf8').trim();
  } catch (err) {
    console.warn('⚠️ Access token not found. Did you login?');
  }

  return {
    'Content-Type': 'application/fhir+json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

// ✅ Helper to load a JSON fixture
function loadFixture(fileName) {
  const fullPath = path.join(__dirname, fileName);
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

// ✅ Create Patient
async function createPatient(patientData) {
  const payload = patientData && Object.keys(patientData).length > 0
    ? patientData
    : loadFixture('patient.fhir.json');

  const res = await axios.post(`${FHIR_BASE_URL}/Patient`, payload, {
    headers: getAuthHeaders()
  });

  return res.data.id;
}

// ✅ Create Observation
async function createObservation(patientId, obsData) {
  const observation = obsData && Object.keys(obsData).length > 0
    ? obsData
    : loadFixture('observation.fhir.json');

  observation.subject = { reference: `Patient/${patientId}` };

  const res = await axios.post(`${FHIR_BASE_URL}/Observation`, observation, {
    headers: getAuthHeaders()
  });

  return res.data.id;
}

// ✅ Get Patient
async function getPatient(id) {
  const res = await axios.get(`${FHIR_BASE_URL}/Patient/${id}`, {
    headers: getAuthHeaders()
  });
  return res.data;
}

// ✅ Search Patient
async function searchPatientByName(name) {
  const res = await axios.get(`${FHIR_BASE_URL}/Patient`, {
    params: { name },
    headers: getAuthHeaders()
  });
  return res.data.entry?.map(e => e.resource) || [];
}

// ✅ Update Patient Phone
async function updatePatientPhone(id, newPhone) {
  const getRes = await axios.get(`${FHIR_BASE_URL}/Patient/${id}`, {
    headers: getAuthHeaders()
  });

  const patientObj = getRes.data;
  patientObj.telecom = [{
    system: 'phone',
    use: 'mobile',
    value: newPhone
  }];

  const putRes = await axios.put(`${FHIR_BASE_URL}/Patient/${id}`, patientObj, {
    headers: getAuthHeaders()
  });

  return putRes.data;
}

// ✅ Delete Patient
async function deletePatient(id) {
  await axios.delete(`${FHIR_BASE_URL}/Patient/${id}`, {
    headers: getAuthHeaders()
  });
  return true;
}

// ✅ Search Observations
async function searchObservations(patientId) {
  const res = await axios.get(`${FHIR_BASE_URL}/Observation`, {
    params: { subject: `Patient/${patientId}` },
    headers: getAuthHeaders()
  });
  return res.data.entry?.map(e => e.resource) || [];
}

module.exports = {
  createPatient,
  createObservation,
  getPatient,
  searchObservations,
  searchPatientByName,
  updatePatientPhone,
  deletePatient
};
