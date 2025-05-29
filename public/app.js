const base = '/api';

// helper to display JSON
function show(el, data) {
  document.getElementById(el).textContent = JSON.stringify(data, null, 2);
}

// Create Default Patient
document.getElementById('btnCreate').onclick = async () => {
  const res = await fetch(`${base}/patient`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
  const data = await res.json();
  document.getElementById('createResult').textContent = 'Created ID: ' + data.id;
};

// Upload Synthea Patient (from user file)
document.getElementById('btnUploadSynthea').onclick = async () => {
  const fileInput = document.getElementById('syntheaFile');
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a JSON file first.");
    return;
  }

  const reader = new FileReader();
  reader.onload = async function (event) {
    try {
      const bundle = JSON.parse(event.target.result);

      if (bundle.resourceType !== "Bundle" || !Array.isArray(bundle.entry)) {
        throw new Error("Invalid FHIR Bundle");
      }

      const patientEntry = bundle.entry.find(e => e.resource?.resourceType === "Patient");
      if (!patientEntry) {
        throw new Error("No Patient resource found in the bundle");
      }

      const patientResource = patientEntry.resource;

      const res = await fetch('/api/import-fhir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientResource)
      });

      const result = await res.json();
      if (res.ok) {
        document.getElementById('uploadResult').textContent = `✅ Imported Patient ID: ${result.id || result.message}`;
      } else {
        const errorText = result.error?.issue?.[0]?.diagnostics || JSON.stringify(result.error || result);
        document.getElementById('uploadResult').textContent = `❌ Error: ${errorText}`;
      }

    } catch (err) {
      console.error(err);
      alert("Error processing the JSON file: " + err.message);
    }
  };

  reader.readAsText(file);
};

// NEW: Generate Patient via Synthea CLI
document.getElementById('btnGeneratePatient').onclick = async () => {
  document.getElementById('uploadResult').textContent = '⏳ Generating patient...';

  const res = await fetch('/api/generate-patient', { method: 'POST' });
  const result = await res.json();

  if (res.ok) {
    document.getElementById('uploadResult').textContent = `✅ Patient created with ID: ${result.id}`;
  } else {
    document.getElementById('uploadResult').textContent = `❌ Error: ${result.error}`;
  }
};

// Get Patient
document.getElementById('btnGet').onclick = async () => {
  const id = document.getElementById('inputGetId').value;
  const res = await fetch(`${base}/patient/${id}`);
  show('getResult', await res.json());
};

// Search Patient by Name
document.getElementById('btnSearch').onclick = async () => {
  const name = document.getElementById('inputSearchName').value;
  const res = await fetch(`${base}/patient?name=${name}`);
  show('searchResult', await res.json());
};

// Update Patient Phone
document.getElementById('btnUpdate').onclick = async () => {
  const id = document.getElementById('inputUpdId').value;
  const phone = document.getElementById('inputPhone').value;
  const res = await fetch(`${base}/patient/${id}/phone`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone })
  });
  document.getElementById('updateResult').textContent = res.ok ? '✅ Updated' : '❌ Failed';
};

// Delete Patient
document.getElementById('btnDelete').onclick = async () => {
  const id = document.getElementById('inputDelId').value;
  const res = await fetch(`${base}/patient/${id}`, { method: 'DELETE' });
  document.getElementById('deleteResult').textContent = res.ok ? '🗑️ Deleted' : '❌ Failed';
};

// Create Observation for Patient
document.getElementById('btnObs').onclick = async () => {
  const pid = document.getElementById('inputObsPid').value;
  const res = await fetch(`${base}/observation/${pid}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await res.json();
  document.getElementById('obsResult').textContent = 'Obs Created: ' + data.id;
};

// Custom Patient Form Submission
document.getElementById('customPatientForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const form = e.target;

  const patientData = {
    resourceType: "Patient",
    name: [{
      use: "official",
      given: [form.firstName.value],
      family: form.lastName.value
    }],
    gender: form.gender.value,
    birthDate: form.birthDate.value,
    telecom: [
      { system: "phone", use: "mobile", value: form.phone.value },
      { system: "email", value: form.email.value }
    ],
    address: [{
      line: [form.addressLine.value],
      city: form.city.value,
      state: form.state.value,
      postalCode: form.postalCode.value
    }]
  };

  const res = await fetch('/api/patient', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patientData)
  });

  const result = await res.json();
  document.getElementById('customCreateResult').textContent =
    res.ok ? `✅ Patient created with ID: ${result.id}` : `❌ Error: ${result.error}`;
});

// Custom Observation Form Submission
document.getElementById('customObsForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const form = e.target;

  const observation = {
    resourceType: "Observation",
    status: "final",
    code: {
      coding: [{
        system: "http://loinc.org",
        code: form.obsCode.value,
        display: form.obsDisplay.value
      }]
    },
    valueQuantity: {
      value: parseFloat(form.obsValue.value),
      unit: form.obsUnit.value,
      system: "http://unitsofmeasure.org"
    }
  };

  const res = await fetch(`${base}/observation/${form.patientId.value}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(observation)
  });

  const result = await res.json();
  document.getElementById('customObsResult').textContent =
    res.ok ? `✅ Observation created with ID: ${result.id}` : `❌ Error: ${result.error || res.status}`;
});

// List Observations for a Patient
document.getElementById('btnListObs').onclick = async () => {
  const pid = document.getElementById('inputListPid').value;
  const res = await fetch(`/api/observations/${pid}`);
  const data = await res.json();
  document.getElementById('listObsResult').textContent = JSON.stringify(data, null, 2);
};
