// doctor.js
let ws;
let currentPatient = null;

document.addEventListener('DOMContentLoaded', initializeWebSocket);

function initializeWebSocket() {
    ws = new WebSocket(`ws://${window.location.hostname}:3000?department=doctor`);
    
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'new_client') {
            showPatientNotification(data);
        }
    };

    ws.onclose = () => setTimeout(initializeWebSocket, 5000);
}

function showPatientNotification(data) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <h3>New Patient: ${data.clientName}</h3>
        <p><strong>Reg Number:</strong> ${data.clientData.reg_number}</p>
        <p><strong>Phone:</strong> ${data.clientData.phone}</p>
        <p><strong>Gender:</strong> ${data.clientData.gender}</p>
        <p><strong>DOB:</strong> ${data.clientData.dob}</p>
        <p><strong>Previous RX:</strong> ${data.clientData.previous_rx || 'None'}</p>
        <button onclick="startExamination(${data.clientId}, ${JSON.stringify(data.clientData)})">
            Begin Examination
        </button>
    `;
    document.getElementById('notifications').appendChild(notification);
}

function startExamination(clientId, clientData) {
    currentPatient = { id: clientId, ...clientData };
    document.querySelector(`#notifications [onclick*="${clientId}"]`).closest('.notification').remove();
    
    document.getElementById('patientInfo').innerHTML = `
        <div class="patient-info">
            <h3>Current Patient</h3>
            <p><strong>Name:</strong> ${clientData.first_name} ${clientData.last_name}</p>
            <p><strong>Reg Number:</strong> ${clientData.reg_number}</p>
            <p><strong>Age:</strong> ${calculateAge(clientData.dob)} years</p>
            <p><strong>Previous RX:</strong> ${clientData.previous_rx || 'None'}</p>
        </div>
    `;
    document.getElementById('prescriptionForm').style.display = 'block';
}

function calculateAge(dob) {
    return Math.floor((new Date() - new Date(dob)) / (365.25 * 24 * 60 * 60 * 1000));
}

document.getElementById('prescriptionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentPatient) return;

    const formData = new FormData(e.target);
    const prescriptionData = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(`/api/doctor/prescription/${currentPatient.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prescriptionData)
        });

        if (response.ok) {
            ws.send(JSON.stringify({
                type: 'prescription_ready',
                clientId: currentPatient.id,
                clientName: `${currentPatient.first_name} ${currentPatient.last_name}`
            }));
            
            e.target.reset();
            document.getElementById('patientInfo').innerHTML = '';
            document.getElementById('prescriptionForm').style.display = 'none';
            currentPatient = null;
            
            alert('Prescription sent to reception');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error saving prescription');
    }
});