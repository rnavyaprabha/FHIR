const fs = require('fs');
const axios = require('axios');

//const FHIR_BASE_URL = 'http://hapi.fhir.org/baseR4'; // HAPI public test server
const FHIR_BASE_URL = 'https://r4.smarthealthit.org';
// Load patient and observation JSON files
const patient = JSON.parse(fs.readFileSync('patient.fhir.json', 'utf8'));
const observation = JSON.parse(fs.readFileSync('observation.fhir.json', 'utf8'));

// Create a new patient
async function createPatient() {
  const res = await axios.post(`${FHIR_BASE_URL}/Patient`, patient);
  console.log('✅ Patient Created:', res.data.id);
  return res.data.id;
}

// Create observation for that patient
async function createObservation(patientId) {
  observation.subject.reference = `Patient/${patientId}`;
  const res = await axios.post(`${FHIR_BASE_URL}/Observation`, observation);
  console.log('✅ Observation Created:', res.data.id);
}

// Get patient by ID
async function getPatient(id) {
  const res = await axios.get(`${FHIR_BASE_URL}/Patient/${id}`);
  console.log('👀 Patient Data:', res.data);
}

// Search for patient by name
async function searchPatientByName(name) {
  const res = await axios.get(`${FHIR_BASE_URL}/Patient?name=${name}`);
  console.log(`🔍 Found ${res.data.entry?.length || 0} patient(s) with name "${name}"`);
}

// Delete patient by ID
async function deletePatient(id) {
  await axios.delete(`${FHIR_BASE_URL}/Patient/${id}`);
  console.log(`🗑️ Patient ${id} deleted.`);
}

// Main function to run the client
(async () => {
  try {
    const patientId = await createPatient();
    await createObservation(patientId);
    await getPatient(patientId);
    await searchPatientByName('Sarah');
    // await deletePatient(patientId); // Uncomment to clean up
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
})();
