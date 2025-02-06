// reception.js
let ws;
let currentClients = new Map();

document.addEventListener('DOMContentLoaded', () => {
    initializeWebSocket();
});

function initializeWebSocket() {
    ws = new WebSocket(`ws://${window.location.hostname}:3000?department=reception`);
    
    ws.onopen = () => console.log('Connected to server');
    
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'prescription_ready') {
            showPrescriptionCard(data);
            updateExaminationStatus(data.clientId, 'Prescription Ready');
        }
    };

    ws.onclose = () => {
        console.log('Connection lost. Reconnecting...');
        setTimeout(initializeWebSocket, 5000);
    };
}

function addClientToExamList(client) {
    const examList = document.getElementById('examinationsList');
    const item = document.createElement('div');
    item.id = `exam-${client.id}`;
    item.className = 'exam-item';
    item.innerHTML = `
        <p><strong>${client.first_name} ${client.last_name}</strong></p>
        <p>Status: Waiting for Doctor</p>
        <p>Time: ${new Date().toLocaleTimeString()}</p>
    `;
    examList.appendChild(item);
    currentClients.set(client.id, client);
}

function updateExaminationStatus(clientId, status) {
    const examItem = document.getElementById(`exam-${clientId}`);
    if (examItem) {
        examItem.querySelector('p:nth-child(2)').textContent = `Status: ${status}`;
    }
}

function showPrescriptionCard(data) {
    const card = document.createElement('div');
    card.className = 'prescription-card';
    card.innerHTML = `
        <h4>${data.clientName}</h4>
        <p>Prescription Ready</p>
        <p>Time: ${new Date().toLocaleTimeString()}</p>
        <button onclick="window.location.href='/sales.html?client=${data.clientId}'">
            Process Sales
        </button>
    `;
    document.getElementById('prescriptionCards').appendChild(card);
}

document.getElementById('registrationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const clientData = Object.fromEntries(formData.entries());
    
    try {
        const response = await fetch('/api/reception/new_client', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(clientData)
        });

        const data = await response.json();
        if (data.id) {
            const client = { ...clientData, id: data.id, reg_number: data.reg_number };
            addClientToExamList(client);
            
            ws.send(JSON.stringify({
                type: 'new_client',
                clientId: data.id,
                clientName: `${clientData.first_name} ${clientData.last_name}`,
                clientData: client
            }));

            e.target.reset();
            alert(`Client registered successfully!\nReg Number: ${data.reg_number}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error registering client');
    }
});