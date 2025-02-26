const express = require('express');
const fs = require('fs');
const { parse } = require('csv-parse/sync');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

const DEBUG = true;

app.use(cors());
app.use(express.static('public'));

// Cache the CSV data to avoid reading file repeatedly
let cachedData = null;

// Helper function to load and parse CSV data
function loadCSVData() {
    if (cachedData) return cachedData;

    try {
        const csvFilePath = path.join(__dirname, 'dump.csv');
        const fileContent = fs.readFileSync(csvFilePath, 'utf-8');

        if (DEBUG) {
            console.log('CSV first lines:', fileContent.split('\n').slice(0, 3));
        }

        cachedData = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        });

        if (DEBUG) {
            console.log('First record:', cachedData[0]);
            console.log('Available columns:', Object.keys(cachedData[0]));
            console.log('Sample companies:', [...new Set(cachedData.slice(0, 10).map(r => r.Company))]);
        }

        return cachedData;
    } catch (error) {
        console.error('Error loading CSV:', error);
        return [];
    }
}

// Route to get data for a specific company
app.get('/api/company/:name', (req, res) => {
    try {
        const records = loadCSVData();
        const indexName = decodeURIComponent(req.params.name);

        const companyData = records
            .filter(row => row.index_name === indexName)
            .map(row => ({
                date: row.index_date,
                open: parseFloat(row.open_index_value),
                high: parseFloat(row.high_index_value),
                low: parseFloat(row.low_index_value),
                close: parseFloat(row.closing_index_value),
                volume: parseInt(row.volume),
                change: parseFloat(row.points_change),
                changePercent: parseFloat(row.change_percent),
                turnover: parseFloat(row.turnover_rs_cr),
                pe: parseFloat(row.pe_ratio),
                pb: parseFloat(row.pb_ratio),
                yield: parseFloat(row.div_yield)
            }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        if (companyData.length === 0) {
            console.log(`No data found for index: ${indexName}`);
            console.log('Available indices:', [...new Set(records.map(r => r.index_name))]);
            return res.status(404).json({
                error: `No data found for index: ${indexName}`,
                data: []
            });
        }

        res.json(companyData);

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'Error reading index data',
            data: []
        });
    }
});

// Route to get all companies (indices)
app.get('/api/companies', (req, res) => {
    try {
        const records = loadCSVData();

        // Get unique index names
        const indices = [...new Set(
            records
                .map(record => record.index_name)
                .filter(name => name && name.trim() !== '')
        )].sort();

        if (indices.length === 0) {
            return res.status(404).json({
                error: 'No indices found in the data',
                data: [],
                defaultCompany: null
            });
        }

        // Log found indices
        console.log('Found indices:', indices);

        res.json({
            success: true,
            data: indices,
            defaultCompany: indices[0]
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'Error reading index data',
            data: [],
            defaultCompany: null
        });
    }
});

app.listen(PORT, () => {
    // Load data on startup to verify it works
    const data = loadCSVData();
    if (data.length > 0) {
        console.log('CSV data loaded successfully');
        console.log(`Found ${[...new Set(data.map(record => record.Company))].length} companies`);
    } else {
        console.error('WARNING: No data loaded from CSV');
    }
    console.log(`Server running on port ${PORT}`);
}); 