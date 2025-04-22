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
// Update patient's phone number
async function updatePatientPhone(id, newPhone) {
  try {
    // Fetch existing patient
    const res = await axios.get(`${FHIR_BASE_URL}/Patient/${id}`);
    const patientData = res.data;

    // Update telecom field with new phone
    patientData.telecom = [{
      system: 'phone',
      use: 'mobile',
      value: newPhone
    }];

    // Send updated patient data
    const updateRes = await axios.put(`${FHIR_BASE_URL}/Patient/${id}`, patientData);
    console.log(`📞 Updated Patient ${id} phone to ${newPhone}`);
  } catch (err) {
    console.error("❌ Update Error:", err.response?.data || err.message);
  }
}


// Main function to run the client
(async () => {
  try {
    const patientId = await createPatient();
    await createObservation(patientId);
    await getPatient(patientId);

    // ✅ Update patient's phone number here
    await updatePatientPhone(patientId, '+1 (999) 123-4567');

    await getPatient(patientId); // Check update
    await searchPatientByName('Sarah');

    // await deletePatient(patientId); // Uncomment to clean up
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
})();

