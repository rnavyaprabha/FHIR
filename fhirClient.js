// fhirClient.js

const fs    = require('fs');
const path  = require('path');
const axios = require('axios');

const FHIR_BASE_URL = 'https://r4.smarthealthit.org';

// helper to load a JSON fixture from disk
function loadFixture(fileName) {
  const fullPath = path.join(__dirname, fileName);
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

/**
 * Create a new Patient.
 * @param {object} [patientData]  optional override
 * @returns {Promise<string>}     the new Patient.id
 */
async function createPatient(patientData) {
  const hasCustom = patientData && Object.keys(patientData).length > 0;
  const payload   = hasCustom
    ? patientData
    : loadFixture('patient.fhir.json');

  const res = await axios.post(
    `${FHIR_BASE_URL}/Patient`,
    payload,
    { headers: { 'Content-Type': 'application/fhir+json' } }
  );
  return res.data.id;
}

/**
 * Create an Observation for a given patient.
 * @param {string} patientId
 * @param {object} [obsData]     optional override
 * @returns {Promise<string>}    the new Observation.id
 */
async function createObservation(patientId, obsData) {
  const hasCustom = obsData && Object.keys(obsData).length > 0;
  const observation = hasCustom
    ? obsData
    : loadFixture('observation.fhir.json');

  // attach to the correct patient
  observation.subject = { reference: `Patient/${patientId}` };

  const res = await axios.post(
    `${FHIR_BASE_URL}/Observation`,
    observation,
    { headers: { 'Content-Type': 'application/fhir+json' } }
  );
  return res.data.id;
}

/**
 * Fetch a Patient resource.
 * @param {string} id
 * @returns {Promise<object>} the Patient resource JSON
 */
async function getPatient(id) {
  const res = await axios.get(`${FHIR_BASE_URL}/Patient/${id}`);
  return res.data;
}

/**
 * Search for Patients by name.
 * @param {string} name
 * @returns {Promise<object[]>} array of Patient resources
 */
async function searchPatientByName(name) {
  const res = await axios.get(`${FHIR_BASE_URL}/Patient`, {
    params: { name }
  });
  return res.data.entry?.map(e => e.resource) || [];
}

/**
 * Replace the Patient’s telecom array with a new mobile phone.
 * @param {string} id
 * @param {string} newPhone
 * @returns {Promise<object>} the updated Patient resource
 */
async function updatePatientPhone(id, newPhone) {
  const getRes     = await axios.get(`${FHIR_BASE_URL}/Patient/${id}`);
  const patientObj = getRes.data;

  patientObj.telecom = [{
    system: 'phone',
    use:    'mobile',
    value:  newPhone
  }];

  const putRes = await axios.put(
    `${FHIR_BASE_URL}/Patient/${id}`,
    patientObj,
    { headers: { 'Content-Type': 'application/fhir+json' } }
  );
  return putRes.data;
}

/**
 * Delete a Patient by ID.
 * @param {string} id
 * @returns {Promise<boolean>}  true on success
 */
async function deletePatient(id) {
  await axios.delete(`${FHIR_BASE_URL}/Patient/${id}`);
  return true;
}
/**
 * Search for Observations by Patient ID.
 * @param {string} patientId
 * @returns {Promise<object[]>} array of Observation resources
 */
async function searchObservations(patientId) {
  const res = await axios.get(`${FHIR_BASE_URL}/Observation`, {
    params: { subject: `Patient/${patientId}` }
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
