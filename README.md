SynthChart Hub - Synthea + WebChart (FHIR Project)
This project is a web application that helps you work with FHIR (Fast Healthcare Interoperability Resources) data. It connects to a real EHR system (WebChart) using SMART-on-FHIR login and allows you to create and manage patient data. It also uses Synthea to generate realistic synthetic patient data.

What This App Can Do
Login securely to WebChart using SMART-on-FHIR

Generate fake patients using the Synthea CLI tool

Upload a Synthea-generated patient JSON file

Create, view, update, and delete FHIR Patient resources

Create and list Observation resources for a patient

Search for a patient by name

View patient information by ID

Use forms to create custom patients and observations

How It Works
The app uses Node.js and Express for the backend

The frontend is written in plain HTML and JavaScript

Axios is used to send HTTP requests to the WebChart FHIR server

OAuth2 login is handled through WebChart, and the access token is stored in a local file called token.txt

After logging in, all data is sent to the WebChart FHIR server using that token

Synthea runs in the background when you click "Generate Patient" and gives you fake FHIR patient data

Technologies Used
Node.js for backend server

Express for handling API routes

Axios for HTTP requests

Synthea for generating fake patient data

WebChart (EHR system) as the FHIR server

HTML, CSS, and JavaScript for the frontend

How to Run the Project
Install Node.js if not already installed

Run npm install to install all dependencies

Run the app using node fhirServer.js

Open your browser and go to http://localhost:3000

Click the "Login via WebChart" button to log in

Use the buttons and forms to generate or upload patients and perform other actions

Requirements
WebChart credentials (username and password)

Access permission to use the FHIR Login Trust in WebChart

A registered Client ID and Redirect URI for SMART-on-FHIR login (already set to ONC-Inferno for testing)

Synthea JAR file placed in the same directory as your server file

Important Notes
After login, your token is saved to token.txt and used for all future FHIR requests

If the login button doesn’t work or the app doesn’t post data, you might not have permission in WebChart

You can only post data after successful login

What You Can Improve or Add Next
Add support for more FHIR resource types like Condition, Allergy, or Medication

Store tokens more securely

Add better error messages for the user

Add styles to make the UI more user-friendly

Run SMART-on-FHIR certification tests using Inferno

Conclusion
This project is useful for developers who want to learn how to integrate synthetic FHIR data with a real EHR system using secure login methods. It is also a good way to practice using APIs and working with healthcare data standards.