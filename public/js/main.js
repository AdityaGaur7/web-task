let stockChart = null;
let currentCompany = null;
let allCompanyData = null;
let timeRange = '6M'; // Default time range

// Fetch companies when page loads
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('http://localhost:3000/api/companies');
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to fetch companies');
        }

        const companies = result.data || [];

        if (companies.length === 0) {
            throw new Error('No companies found in the data');
        }

        setupCompanyDropdown(companies);
        setupTimeRangeControls();

        // Load the default company
        if (result.defaultCompany) {
            const companySelect = document.getElementById('companySelect');
            companySelect.value = result.defaultCompany;
            loadCompanyData(result.defaultCompany);
        }

    } catch (error) {
        console.error('Error fetching companies:', error);
        showError('companySelect', `Error loading companies: ${error.message}`);
        showError('chart-container', 'Please select a company from the dropdown');
    }
});

function setupCompanyDropdown(companies) {
    const companySelect = document.getElementById('companySelect');

    // Clear existing options except the first one
    companySelect.innerHTML = '<option value="">Select a company...</option>';

    // Add companies to dropdown
    companies.forEach(company => {
        const option = document.createElement('option');
        option.value = company;
        option.textContent = company;
        companySelect.appendChild(option);
    });

    // Add change event listener
    companySelect.addEventListener('change', (e) => {
        const selectedCompany = e.target.value;
        if (selectedCompany) {
            loadCompanyData(selectedCompany);
        } else {
            // Clear chart if no company is selected
            if (stockChart) {
                stockChart.destroy();
                stockChart = null;
            }
            document.getElementById('selectedCompany').textContent = 'Select a Company';
            document.getElementById('stockDetails').innerHTML = '';
        }
    });
}

function setupTimeRangeControls() {
    const buttons = document.querySelectorAll('.chart-controls button');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            timeRange = button.dataset.range;
            if (currentCompany) {
                updateChart(allCompanyData);
            }
        });
    });
}

async function loadCompanyData(company) {
    try {
        // Show loading state
        const titleElement = document.getElementById('selectedCompany');
        if (titleElement) {
            titleElement.textContent = `Loading ${company}...`;
        }

        currentCompany = company;

        // Encode the company name for the URL
        const encodedCompany = encodeURIComponent(company);
        const response = await fetch(`http://localhost:3000/api/company/${encodedCompany}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch company data');
        }

        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('No data available for this company');
        }

        // Store all data and update chart
        allCompanyData = data;
        updateChart(data);
        updateStockDetails(data);

    } catch (error) {
        console.error('Error loading company data:', error);
        const titleElement = document.getElementById('selectedCompany');
        if (titleElement) {
            titleElement.textContent = company;
        }
        showError('chart-container', `Error loading data: ${error.message}`);

        // Clear any existing chart
        if (stockChart) {
            stockChart.destroy();
            stockChart = null;
        }

        // Clear stock details
        updateStockDetails(null);
    }
}

function updateChart(data) {
    // Filter data based on selected time range
    const filteredData = filterDataByTimeRange(data);

    // Update selected company title
    document.getElementById('selectedCompany').textContent = currentCompany;

    // Prepare data for chart
    const dates = filteredData.map(item => item.date);
    const prices = filteredData.map(item => item.close);

    // Create or update chart
    if (stockChart) {
        stockChart.destroy();
    }

    stockChart = new Chart(document.getElementById('stockChart'), {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: `${currentCompany} Index Value`,
                data: prices,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.1)',
                tension: 0.1,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `Value: ${context.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: value => value.toFixed(2)
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

function filterDataByTimeRange(data) {
    if (timeRange === 'ALL') return data;

    const now = new Date();
    let cutoffDate = new Date();

    switch (timeRange) {
        case '1M':
            cutoffDate.setMonth(now.getMonth() - 1);
            break;
        case '3M':
            cutoffDate.setMonth(now.getMonth() - 3);
            break;
        case '6M':
            cutoffDate.setMonth(now.getMonth() - 6);
            break;
        case '1Y':
            cutoffDate.setFullYear(now.getFullYear() - 1);
            break;
    }

    return data.filter(item => new Date(item.date) >= cutoffDate);
}

function updateStockDetails(data) {
    const stockDetails = document.getElementById('stockDetails');
    if (!stockDetails) return;

    if (!data || data.length === 0) {
        stockDetails.innerHTML = `
            <div class="alert alert-warning">
                No stock details available
            </div>
        `;
        return;
    }

    try {
        const latestData = data[data.length - 1];
        if (!latestData) {
            throw new Error('No data available');
        }

        stockDetails.innerHTML = `
            <h4>Latest Index Details</h4>
            <table class="table">
                <tr>
                    <td><strong>Date:</strong></td>
                    <td>${latestData.date || 'N/A'}</td>
                    <td><strong>Change:</strong></td>
                    <td class="${latestData.change >= 0 ? 'text-success' : 'text-danger'}">
                        ${(latestData.change || 0).toFixed(2)} (${(latestData.changePercent || 0).toFixed(2)}%)
                    </td>
                </tr>
                <tr>
                    <td><strong>Open:</strong></td>
                    <td>${(latestData.open || 0).toFixed(2)}</td>
                    <td><strong>Close:</strong></td>
                    <td>${(latestData.close || 0).toFixed(2)}</td>
                </tr>
                <tr>
                    <td><strong>High:</strong></td>
                    <td>${(latestData.high || 0).toFixed(2)}</td>
                    <td><strong>Low:</strong></td>
                    <td>${(latestData.low || 0).toFixed(2)}</td>
                </tr>
                <tr>
                    <td><strong>Volume:</strong></td>
                    <td>${(latestData.volume || 0).toLocaleString()}</td>
                    <td><strong>Turnover:</strong></td>
                    <td>₹${(latestData.turnover || 0).toFixed(2)} Cr</td>
                </tr>
                <tr>
                    <td><strong>P/E Ratio:</strong></td>
                    <td>${(latestData.pe || 0).toFixed(2)}</td>
                    <td><strong>P/B Ratio:</strong></td>
                    <td>${(latestData.pb || 0).toFixed(2)}</td>
                </tr>
                <tr>
                    <td><strong>Dividend Yield:</strong></td>
                    <td colspan="3">${(latestData.yield || 0).toFixed(2)}%</td>
                </tr>
            </table>
        `;
    } catch (error) {
        console.error('Error updating stock details:', error);
        stockDetails.innerHTML = `
            <div class="alert alert-warning">
                Error displaying stock details
            </div>
        `;
    }
}

function showError(containerId, message) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container ${containerId} not found`);
        return;
    }

    if (containerId === 'companySelect') {
        // For dropdown, show error below it
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger mt-2';
        errorDiv.textContent = message;
        container.parentNode.appendChild(errorDiv);
    } else {
        container.innerHTML = `
            <div class="alert alert-danger" role="alert">
                ${message}
            </div>
        `;
    }
} 