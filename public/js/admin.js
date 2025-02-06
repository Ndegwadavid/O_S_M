// public/js/admin.js
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
    loadStatistics();
    setupEventListeners();
});

// Initialize dashboard
function initializeDashboard() {
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString();
    showSection('overview');
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.sidebar li').forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            showSection(section);
        });
    });

    // Search functionality
    document.getElementById('globalSearch').addEventListener('input', handleGlobalSearch);

    // Filters
    document.getElementById('statusFilter').addEventListener('change', handleFilters);
    document.getElementById('dateFilter').addEventListener('change', handleFilters);
    document.getElementById('monthFilter').addEventListener('change', handleFilters);
    document.getElementById('paymentFilter').addEventListener('change', handleFilters);
}

// Load dashboard statistics
async function loadStatistics() {
    try {
        const response = await fetch('/api/admin/statistics');
        const data = await response.json();
        updateDashboardStats(data);
        initializeCharts(data);
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

// Update dashboard statistics
function updateDashboardStats(data) {
    document.getElementById('totalClients').textContent = data.totalClients;
    document.getElementById('newClientsToday').textContent = data.newClientsToday;
    document.getElementById('pendingCollections').textContent = data.pendingCollections;
    document.getElementById('monthlyRevenue').textContent = `KES ${data.monthlyRevenue.toLocaleString()}`;
    document.getElementById('pendingJobs').textContent = data.pendingJobs;
}

// Initialize charts
function initializeCharts(data) {
    // Registration trend chart
    new Chart(document.getElementById('registrationChart'), {
        type: 'line',
        data: {
            labels: data.registrationTrend.labels,
            datasets: [{
                label: 'New Registrations',
                data: data.registrationTrend.data,
                borderColor: '#3498db',
                tension: 0.1
            }]
        }
    });

    // Revenue chart
    new Chart(document.getElementById('revenueChart'), {
        type: 'bar',
        data: {
            labels: data.revenueTrend.labels,
            datasets: [{
                label: 'Revenue',
                data: data.revenueTrend.data,
                backgroundColor: '#2ecc71'
            }]
        }
    });

    // Age distribution chart
    new Chart(document.getElementById('ageChart'), {
        type: 'pie',
        data: {
            labels: data.ageDistribution.labels,
            datasets: [{
                data: data.ageDistribution.data,
                backgroundColor: ['#3498db', '#e74c3c', '#f1c40f', '#2ecc71']
            }]
        }
    });

    // Brands chart
    new Chart(document.getElementById('brandsChart'), {
        type: 'doughnut',
        data: {
            labels: data.popularBrands.labels,
            datasets: [{
                data: data.popularBrands.data,
                backgroundColor: ['#3498db', '#e74c3c', '#f1c40f', '#2ecc71', '#9b59b6']
            }]
        }
    });
}

// Handle section display
function showSection(sectionId) {
    document.querySelectorAll('section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');

    document.querySelectorAll('.sidebar li').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');

    loadSectionData(sectionId);
}

// Load section specific data
async function loadSectionData(section) {
    switch(section) {
        case 'clients':
            await loadClientsData();
            break;
        case 'sales':
            await loadSalesData();
            break;
        case 'analytics':
            await loadAnalyticsData();
            break;
    }
}

// Load clients data
async function loadClientsData() {
    try {
        const response = await fetch('/api/admin/clients');
        const data = await response.json();
        displayClientsTable(data);
    } catch (error) {
        console.error('Error loading clients:', error);
    }
}

// Display clients table
function displayClientsTable(data) {
    const table = document.getElementById('clientsTable');
    table.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Reg Number</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Registration Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(client => `
                    <tr>
                        <td>${client.reg_number}</td>
                        <td>${client.first_name} ${client.last_name}</td>
                        <td>${client.phone}</td>
                        <td>${formatStatus(client.status)}</td>
                        <td>${new Date(client.created_at).toLocaleDateString()}</td>
                        <td>
                            <button onclick="viewClient(${client.id})">View</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Generate reports
async function generateReport(type) {
    try {
        const response = await fetch(`/api/admin/reports/${type}`);
        const data = await response.json();
        // Handle report generation (e.g., download PDF)
        console.log(`Generated ${type} report:`, data);
    } catch (error) {
        console.error('Error generating report:', error);
    }
}

// Handle global search
function handleGlobalSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    // Implement global search logic
}

// Handle filters
function handleFilters() {
    const filters = {
        status: document.getElementById('statusFilter').value,
        date: document.getElementById('dateFilter').value,
        month: document.getElementById('monthFilter').value,
        payment: document.getElementById('paymentFilter').value
    };
    // Implement filter logic
}

// Utility functions
function formatStatus(status) {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}