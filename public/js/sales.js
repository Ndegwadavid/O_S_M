// sales.js
let currentClientId = null;

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    currentClientId = params.get('client');
    if (currentClientId) {
        loadPrescriptionInfo(currentClientId);
    }

    // Set minimum delivery date to today
    document.querySelector('input[name="delivery_date"]').min = new Date().toISOString().split('T')[0];
});

async function loadPrescriptionInfo(clientId) {
    try {
        const response = await fetch(`/api/reception/client/${clientId}`);
        const client = await response.json();
        displayPrescriptionInfo(client);
    } catch (error) {
        console.error('Error:', error);
        alert('Error loading client information');
    }
}

function displayPrescriptionInfo(client) {
    const prescription = JSON.parse(client.prescription_details);
    document.getElementById('prescriptionInfo').innerHTML = `
        <h3>Patient Information</h3>
        <p><strong>Name:</strong> ${client.first_name} ${client.last_name}</p>
        <p><strong>Reg Number:</strong> ${client.reg_number}</p>
        <hr>
        <h4>Prescription Details</h4>
        <p><strong>Right Eye:</strong> SPH: ${prescription.r_sph || '-'}, CYL: ${prescription.r_cyl || '-'}, 
           AXIS: ${prescription.r_axis || '-'}, ADD: ${prescription.r_add || '-'}, VA: ${prescription.r_va || '-'}</p>
        <p><strong>Left Eye:</strong> SPH: ${prescription.l_sph || '-'}, CYL: ${prescription.l_cyl || '-'}, 
           AXIS: ${prescription.l_axis || '-'}, ADD: ${prescription.l_add || '-'}, VA: ${prescription.l_va || '-'}</p>
        <p><strong>Clinical Notes:</strong> ${prescription.clinical_history || 'None'}</p>
    `;
}

function calculateTotal() {
    const quantity = document.querySelector('input[name="quantity"]').value;
    const amount = document.querySelector('input[name="amount"]').value;
    const total = quantity * amount;
    document.querySelector('input[name="total"]').value = total;
    calculateBalance();
}

function calculateBalance() {
    const total = parseFloat(document.querySelector('input[name="total"]').value) || 0;
    const advance = parseFloat(document.querySelector('input[name="advance"]').value) || 0;
    document.querySelector('input[name="balance"]').value = total - advance;
}

document.getElementById('salesForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentClientId) return;

    const formData = new FormData(e.target);
    const salesData = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(`/api/reception/sales/${currentClientId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(salesData)
        });

        const result = await response.json();
        if (result.success) {
            alert('Sale recorded successfully!\nReference Number: ' + result.reference_number);
            window.location.href = `/receipt.html?sale=${result.sales_id}`;
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error recording sale');
    }
});