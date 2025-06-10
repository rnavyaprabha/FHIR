 SynthChart Hub – Synthea + WebChart (SMART-on-FHIR)
This project explores HL7 FHIR standards by building a full-stack SMART-on-FHIR web application that:

Generates synthetic patients using Synthea

Performs CRUD operations on FHIR resources

Authenticates with WebChart via SMART-on-FHIR

Posts to a live FHIR server using OAuth2 bearer tokens

✨ Features
Feature	Description
✅ SMART-on-FHIR Login	Uses WebChart OAuth2 to authenticate
✅ Generate Patients	CLI integration with Synthea to create synthetic data
✅ Upload Patients	Upload and POST a .json Synthea bundle
✅ Create/Read/Update/Delete	Full CRUD for Patient and Observation
✅ Custom Forms	Create patients and observations manually
✅ Live Fetch	View and search patients or list observations
✅ Auth Token Handling	Uses session token from WebChart and stores in token.txt

🧠 Architecture
Frontend:

Vanilla JS (app.js)

HTML UI (index.html)

Sends requests to Express backend

Backend:

Node.js with Express

Handles Synthea execution, FHIR API proxying

Uses axios for API calls with Authorization header

Reads token.txt for bearer token access

🔐 SMART-on-FHIR Setup
FHIR Endpoint: https://navya.webch.art/webchart.cgi/fhir/

Client ID: ONC-Inferno

Client Secret: provided via admin panel

Redirect URI: http://localhost:3000/callback

OAuth token is saved automatically to token.txt after login.

🛠️ Tools Used
Tool	Purpose
Node.js + Express	Backend server
Axios	API requests
Synthea JAR	Generates fake patient FHIR bundles
Visual Studio Code	JSON validation and dev
Docker (Optional)	For local FHIR servers (e.g., HAPI-FHIR)
WebChart	FHIR-compliant EHR platform
Inferno	SMART-on-FHIR test harness for certification

🧪 How to Use
Install Dependencies

bash
Copy
Edit
npm install
Run the Server

bash
Copy
Edit
node fhirServer.js
Login to WebChart

Click "Login via WebChart" on the web page

You’ll be redirected to WebChart's login screen

After successful login, token.txt is saved

Generate a Patient

Click "Generate Patient" to run Synthea

Automatically extracts Patient resource and POSTs it

Perform CRUD

Use various forms/buttons to create/update/delete/search Patient and Observation

🚧 Roadmap
 Add support for additional FHIR resource types (Condition, AllergyIntolerance, etc.)

 Better error messages + UI styling

 Store tokens securely (not in plain token.txt)

 Add test cases and deployable versio