// public/js/all_clients.js
let clients = [];
let currentClientId = null;

// Load clients on page load
document.addEventListener('DOMContentLoaded', loadClients);

async function loadClients() {
    try {
        const response = await fetch('/api/reception/clients');
        clients = await response.json();
        displayClients(clients);
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayClients(clientsToShow) {
    const grid = document.getElementById('clientsGrid');
    grid.innerHTML = '';

    clientsToShow.forEach(client => {
        const card = document.createElement('div');
        card.className = `client-card ${client.status}`;
        card.innerHTML = `
            <div class="client-header">
                <h3>${client.first_name} ${client.last_name}</h3>
                <span class="reg-number">${client.reg_number}</span>
            </div>
            <div class="client-info">
                <p><strong>Phone:</strong> ${client.phone}</p>
                <p><strong>Status:</strong> ${formatStatus(client.status)}</p>
                <p><strong>Visit Date:</strong> ${new Date(client.created_at).toLocaleDateString()}</p>
            </div>
            <div class="client-actions">
                ${client.reference_number ? 
                    `<p><strong>Ref:</strong> ${client.reference_number}</p>
                     <p><strong>Delivery:</strong> ${new Date(client.delivery_date).toLocaleDateString()}</p>` 
                    : ''}
                <button onclick="viewClientDetails(${client.id})">View Details</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function formatStatus(status) {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

async function viewClientDetails(clientId) {
    try {
        const response = await fetch(`/api/reception/client/${clientId}`);
        const client = await response.json();
        
        currentClientId = clientId;
        const modal = document.getElementById('clientModal');
        const details = document.getElementById('clientDetails');
        
        let prescriptionHtml = '';
        if (client.prescription_details) {
            const prescription = JSON.parse(client.prescription_details);
            prescriptionHtml = `
                <div class="prescription-details">
                    <h4>Prescription Details</h4>
                    <p><strong>Right Eye:</strong> ${JSON.stringify(prescription.right)}</p>
                    <p><strong>Left Eye:</strong> ${JSON.stringify(prescription.left)}</p>
                </div>
            `;
        }

        details.innerHTML = `
            <div class="detail-section">
                <h4>Personal Information</h4>
                <p><strong>Name:</strong> ${client.first_name} ${client.last_name}</p>
                <p><strong>Reg Number:</strong> ${client.reg_number}</p>
                <p><strong>Phone:</strong> ${client.phone}</p>
                <p><strong>Email:</strong> ${client.email || 'N/A'}</p>
                <p><strong>Gender:</strong> ${client.gender}</p>
                <p><strong>Residence:</strong> ${client.residence}</p>
            </div>
            ${prescriptionHtml}
        `;

        document.getElementById('statusUpdate').value = client.status;
        modal.style.display = 'block';
    } catch (error) {
        console.error('Error:', error);
    }
}

async function updateClientStatus() {
    if (!currentClientId) return;

    const newStatus = document.getElementById('statusUpdate').value;
    try {
        const response = await fetch(`/api/reception/client/${currentClientId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            alert('Status updated successfully');
            loadClients();
            document.getElementById('clientModal').style.display = 'none';
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error updating status');
    }
}

// Filter and search functionality
document.getElementById('statusFilter').addEventListener('change', filterClients);
document.getElementById('searchInput').addEventListener('input', filterClients);

function filterClients() {
    const statusFilter = document.getElementById('statusFilter').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();

    const filteredClients = clients.filter(client => {
        const matchesStatus = !statusFilter || client.status === statusFilter;
        const matchesSearch = !searchTerm || 
            client.first_name.toLowerCase().includes(searchTerm) ||
            client.last_name.toLowerCase().includes(searchTerm) ||
            client.reg_number.toLowerCase().includes(searchTerm);
        
        return matchesStatus && matchesSearch;
    });

    displayClients(filteredClients);
}

// Modal close functionality
document.querySelector('.close').onclick = () => {
    document.getElementById('clientModal').style.display = 'none';
};

window.onclick = (event) => {
    const modal = document.getElementById('clientModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};