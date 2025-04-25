const base = '/api';

// helper to display JSON
function show(el, data) {
  document.getElementById(el).textContent = JSON.stringify(data, null, 2);
}

// Create
document.getElementById('btnCreate').onclick = async () => {
  const res = await fetch(`${base}/patient`, { method: 'POST', headers:{'Content-Type':'application/json'} });
  const data = await res.json();
  document.getElementById('createResult').textContent = 'Created ID: ' + data.id;
};

// Get
document.getElementById('btnGet').onclick = async () => {
  const id = document.getElementById('inputGetId').value;
  const res = await fetch(`${base}/patient/${id}`);
  show('getResult', await res.json());
};

// Search
document.getElementById('btnSearch').onclick = async () => {
  const name = document.getElementById('inputSearchName').value;
  const res = await fetch(`${base}/patient?name=${name}`);
  show('searchResult', await res.json());
};

// Update
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

// Delete
document.getElementById('btnDelete').onclick = async () => {
  const id = document.getElementById('inputDelId').value;
  const res = await fetch(`${base}/patient/${id}`, { method: 'DELETE' });
  document.getElementById('deleteResult').textContent = res.ok ? '🗑️ Deleted' : '❌ Failed';
};

// Create Observation
document.getElementById('btnObs').onclick = async () => {
  const pid = document.getElementById('inputObsPid').value;
  const res = await fetch(`${base}/observation/${pid}`, { method: 'POST', headers:{'Content-Type':'application/json'} });
  const data = await res.json();
  document.getElementById('obsResult').textContent = 'Obs Created: ' + data.id;
};

// List Observations
document.getElementById('btnListObs').onclick = async () => {
  const pid = document.getElementById('inputListPid').value;
  const res = await fetch(`/api/observations/${pid}`);
  const data = await res.json();
  document.getElementById('listObsResult').textContent = JSON.stringify(data, null, 2);
};
