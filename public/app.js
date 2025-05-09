const base = '/api';

// helper to display JSON
function show(el, data) {
  document.getElementById(el).textContent = JSON.stringify(data, null, 2);
}

// Default Create
document.getElementById('btnCreate').onclick = async () => {
  const res = await fetch(`${base}/patient`, { method: 'POST', headers:{'Content-Type':'application/json'} });
  const data = await res.json();
  document.getElementById('createResult').textContent = 'Created ID: ' + data.id;
};

// Get Patient
document.getElementById('btnGet').onclick = async () => {
  const id = document.getElementById('inputGetId').value;
  const res = await fetch(`${base}/patient/${id}`);
  show('getResult', await res.json());
};

// Search Patient
document.getElementById('btnSearch').onclick = async () => {
  const name = document.getElementById('inputSearchName').value;
  const res = await fetch(`${base}/patient?name=${name}`);
  show('searchResult', await res.json());
};

// Update Phone
document.getElementById('btnUpdate').onclick = async () => {
  const id = document.getElementById('inputUpdId').value;
  const phone = document.getElementById('inputPhone').value;
  const res = await fetch(`${base}/patient/${id}/phone`, {
    method: 'PUT',
    headers: {'Content-Type':'application/json'},
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

  const res = await fetch(`${base}/patient`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patientData)
  });

  const result = await res.json();
  document.getElementById('customCreateResult').textContent =
    res.ok ? `✅ Patient created with ID: ${result.id}` : `❌ Error: ${result.error}`;
});

// Custom Observation Form Submission
document.getElementById('obsForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const form = e.target;

  const observationData = {
    resourceType: "Observation",
    status: "final",
    code: {
      coding: [{
        system: "http://loinc.org",
        code: form.code.value,
        display: form.display.value
      }],
      text: form.display.value
    },
    valueQuantity: {
      value: parseFloat(form.value.value),
      unit: form.unit.value,
      system: "http://unitsofmeasure.org",
      code: form.unit.value
    }
  };

  const res = await fetch(`${base}/observation/${form.patientId.value}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(observationData)
  });

  const result = await res.json();
  document.getElementById('obsResult').textContent =
    res.ok ? `✅ Observation created with ID: ${result.id}` : `❌ Error: ${result.error || 'Unknown error'}`;
});

// List Observations
document.getElementById('btnListObs').onclick = async () => {
  const pid = document.getElementById('inputListPid').value;
  const res = await fetch(`${base}/observations/${pid}`);
  const data = await res.json();
  document.getElementById('listObsResult').textContent = JSON.stringify(data, null, 2);
};
