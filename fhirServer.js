const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const os = require('os');
const { exec } = require('child_process');
const fs = require('fs');

const {
  createPatient,
  getPatient,
  searchPatientByName,
  updatePatientPhone,
  deletePatient,
  createObservation,
  searchObservations
} = require('./fhirClient');

const app = express();
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// === SMART-on-FHIR Auth Settings ===
const CLIENT_ID = 'MIE-localhost';
const CLIENT_SECRET = 'ABC123DEF456GHI789J0';
const REDIRECT_URI = 'http://localhost:3000/code';
const FHIR_BASE_URL = 'https://navya.webchartnow.com/';
const AUTH_URL = 'https://navya.webchartnow.com/webchart.cgi/oauth/authorize';
const TOKEN_URL = 'https://navya.webchartnow.com/webchart.cgi/oauth/token';

// SMART-on-FHIR Login Redirect
app.get('/login', (req, res) => {
  const url = `${AUTH_URL}?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=openid%20user/*.*%20patient/*.*&aud=${encodeURIComponent(FHIR_BASE_URL)}`;
  res.redirect(url);
});

// OAuth Callback
app.get('/callback', async (req, res) => {
  console.log('✅ Reached /callback route with code:', req.query.code);
  const code = req.query.code;
  if (!code) return res.status(400).send('Missing code');

  try {
    const tokenResponse = await axios.post(TOKEN_URL, new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const accessToken = tokenResponse.data.access_token;
    fs.writeFileSync(path.join(__dirname, 'token.txt'), accessToken);

    res.redirect('/');
  } catch (err) {
    console.error('OAuth error:', err.response?.data || err.message);
    res.status(500).send('❌ Login failed. Check console for details.');
  }
});

// Check Login Status
app.get('/api/status', (req, res) => {
  const tokenPath = path.join(__dirname, 'token.txt');
  let loggedIn = false;
  if (fs.existsSync(tokenPath)) {
    const token = fs.readFileSync(tokenPath, 'utf8').trim();
    loggedIn = !!token;
  }
  res.json({ loggedIn });
});

// Generate patient via Synthea
const SYNTHEA_JAR = path.join(__dirname, 'synthea-with-dependencies.jar');
app.post('/api/generate-patient', async (req, res) => {
  const outputDir = path.join(os.tmpdir(), 'synthea-output-' + Date.now());
  const command = `java -jar "${SYNTHEA_JAR}" -p 1 --exporter.fhir.export true --exporter.fhir.use_us_core_ig true --exporter.baseDirectory "${outputDir}"`;

  console.log(`Running Synthea with command: ${command}`);

  exec(command, async (error, stdout, stderr) => {
    if (error) {
      console.error('Synthea execution error:', stderr || error.message);
      return res.status(500).json({ error: 'Failed to run Synthea.' });
    }

    console.log('Synthea STDOUT:', stdout);
    console.log('Synthea STDERR:', stderr);

    try {
      const fhirPath = path.join(outputDir, 'fhir');
      if (!fs.existsSync(fhirPath)) {
        throw new Error(`FHIR output folder not found: ${fhirPath}`);
      }

      const files = fs.readdirSync(fhirPath);
      console.log('FHIR output files:', files);

      // Pick first JSON file (Synthea outputs as a Bundle)
      const bundleFile = files.find(f => f.endsWith('.json'));
      if (!bundleFile) throw new Error('No JSON file found in output');

      const fullPath = path.join(fhirPath, bundleFile);
      const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

      if (content.resourceType === 'Bundle') {
        const patientEntry = content.entry.find(e => e.resource?.resourceType === 'Patient');
        if (!patientEntry) throw new Error('No Patient resource found in the bundle');

        const patient = patientEntry.resource;

        const result = await axios.post(`${FHIR_BASE_URL}/Patient`, patient, {
          headers: { 'Content-Type': 'application/fhir+json' }
        });

        return res.json({ id: result.data.id, message: '✅ Patient generated and uploaded successfully' });
      } else {
        throw new Error(`Expected FHIR Bundle but got: ${content.resourceType}`);
      }
    } catch (err) {
      console.error('Error processing patient:', err.message);
      res.status(500).json({ error: err.message });
    }
  });
});

// Import FHIR Resource (Bundle or Single)
app.post('/api/import-fhir', async (req, res) => {
  const resource = req.body;

  if (!resource || !resource.resourceType) {
    return res.status(400).json({ error: 'Missing or invalid resourceType' });
  }

  try {
    if (resource.resourceType === 'Bundle') {
      const result = await axios.post(`${FHIR_BASE_URL}`, resource, {
        headers: { 'Content-Type': 'application/fhir+json' }
      });
      return res.json({ id: result.data.id, message: 'Bundle imported successfully' });
    }

    const result = await axios.post(`${FHIR_BASE_URL}/${resource.resourceType}`, resource, {
      headers: { 'Content-Type': 'application/fhir+json' }
    });

    res.json({ id: result.data.id, message: `${resource.resourceType} imported successfully` });
  } catch (err) {
    console.error('Import error:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || { message: err.message } });
  }
});

// Create Patient manually
app.post('/api/patient', async (req, res) => {
  try {
    const id = await createPatient(req.body);
    res.json({ id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get Patient by ID
app.get('/api/patient/:id', async (req, res) => {
  try {
    const patient = await getPatient(req.params.id);
    res.json(patient);
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
});

// Search Patient by name
app.get('/api/patient', async (req, res) => {
  try {
    const results = await searchPatientByName(req.query.name);
    res.json(results);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Update Patient phone
app.put('/api/patient/:id/phone', async (req, res) => {
  try {
    await updatePatientPhone(req.params.id, req.body.phone);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Delete Patient
app.delete('/api/patient/:id', async (req, res) => {
  try {
    await deletePatient(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Create Observation
app.post('/api/observation/:patientId', async (req, res) => {
  try {
    const obsId = await createObservation(req.params.patientId, req.body);
    res.json({ id: obsId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// List Observations
app.get('/api/observations/:patientId', async (req, res) => {
  try {
    const obsList = await searchObservations(req.params.patientId);
    res.json(obsList);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🔥 Server listening on http://localhost:${PORT}`));