// public/js/receipt.js
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const saleId = urlParams.get('sale');
    
    if (!saleId) {
        alert('No sale ID specified');
        return;
    }

    try {
        const response = await fetch(`/api/reception/receipt/${saleId}`);
        const data = await response.json();
        populateReceipt(data);
    } catch (error) {
        console.error('Error loading receipt:', error);
        alert('Error loading receipt');
    }
});

function populateReceipt(data) {
    const { receipt } = data;
    const prescription = JSON.parse(receipt.prescription_details);

    // Basic Info
    document.getElementById('referenceNumber').textContent = receipt.reference_number;
    document.getElementById('receiptDate').textContent = new Date().toLocaleDateString();
    document.getElementById('customerName').textContent = `${receipt.first_name} ${receipt.last_name}`;
    document.getElementById('regNumber').textContent = receipt.reg_number;
    
    // Calculate age from DOB
    const age = Math.floor((new Date() - new Date(receipt.dob)) / (365.25 * 24 * 60 * 60 * 1000));
    document.getElementById('customerAge').textContent = `${age} years`;
    
    document.getElementById('visitDate').textContent = new Date(receipt.created_at).toLocaleDateString();

    // Prescription Details
    const rightEye = prescription.right;
    const leftEye = prescription.left;
    
    const rightRow = document.getElementById('rightEye');
    const leftRow = document.getElementById('leftEye');
    
    ['sph', 'cyl', 'axis', 'add', 'va', 'ipd'].forEach(field => {
        const rightCell = document.createElement('td');
        rightCell.textContent = rightEye[field] || '-';
        rightRow.appendChild(rightCell);
        
        const leftCell = document.createElement('td');
        leftCell.textContent = leftEye[field] || '-';
        leftRow.appendChild(leftCell);
    });

    // Product Details
    document.getElementById('brand').textContent = receipt.brand;
    document.getElementById('model').textContent = receipt.model;
    document.getElementById('color').textContent = receipt.color;
    document.getElementById('quantity').textContent = receipt.quantity;

    // Payment Details
    document.getElementById('totalAmount').textContent = `KES ${receipt.total.toLocaleString()}`;
    document.getElementById('advanceAmount').textContent = `KES ${receipt.advance.toLocaleString()}`;
    document.getElementById('balanceAmount').textContent = `KES ${receipt.balance.toLocaleString()}`;
    document.getElementById('paymentMode').textContent = receipt.payment_mode;

    // Footer
    document.getElementById('deliveryDate').textContent = new Date(receipt.delivery_date).toLocaleDateString();
    document.getElementById('servedBy').textContent = receipt.booked_by;
}