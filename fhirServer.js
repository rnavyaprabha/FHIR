const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

// import your existing fhirClient functions
const {
  createPatient,
  getPatient,
  searchPatientByName,
  updatePatientPhone,
  deletePatient,
  createObservation
} = require('./fhirClient');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// CREATE Patient
app.post('/api/patient', async (req, res) => {
  try {
    const id = await createPatient(req.body);   // pass overrides if you like
    res.json({ id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// READ Patient by ID
app.get('/api/patient/:id', async (req, res) => {
  try {
    const patient = await getPatient(req.params.id);
    res.json(patient);
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
});

// SEARCH Patient by name
app.get('/api/patient', async (req, res) => {
  try {
    const results = await searchPatientByName(req.query.name);
    res.json(results);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// UPDATE Patient phone
app.put('/api/patient/:id/phone', async (req, res) => {
  try {
    await updatePatientPhone(req.params.id, req.body.phone);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const { searchObservations } = require('./fhirClient');
// list all Observations for a patient
app.get('/api/observations/:patientId', async (req, res) => {
  try {
    const obsList = await searchObservations(req.params.patientId);
    res.json(obsList);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE Patient
app.delete('/api/patient/:id', async (req, res) => {
  try {
    await deletePatient(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// CREATE Observation
app.post('/api/observation/:patientId', async (req, res) => {
  try {
    const obsId = await createObservation(req.params.patientId, req.body);
    res.json({ id: obsId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// serve UI
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🔥 Server listening on http://localhost:${PORT}`));
