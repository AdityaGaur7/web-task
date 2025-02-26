# Stock Market Index Visualization

A web application for visualizing Indian stock market index data with interactive charts and detailed metrics.

## Features

- Interactive line chart showing index values over time
- Time range filters (1M, 3M, 6M, 1Y, ALL)
- Detailed index information including:
  - Open, High, Low, Close values
  - Volume and Turnover
  - Points change and percentage change
  - P/E Ratio, P/B Ratio, and Dividend Yield
- Responsive design for all screen sizes
 
## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

## Setup Instructions

1. Clone the repository:

```bash
git clone <repository-url>
cd stock-market-visualization
```

2. Install dependencies:

```bash
npm install
```

3. Prepare your data:

   - Place your CSV file named `dump.csv` in the `server` directory
   - Ensure your CSV has the following columns:
     ```
     index_name,index_date,open_index_value,high_index_value,low_index_value,
     closing_index_value,points_change,change_percent,volume,turnover_rs_cr,
     pe_ratio,pb_ratio,div_yield
     ```

4. Start the server:

```bash
cd server
node server.js
```

5. Access the application:
   - Open your browser and navigate to `http://localhost:3000`
   - The application should load with available indices in the dropdown

## Project Structure

```
├── public/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── main.js
│   └── index.html
├── server/
│   ├── dump.csv
│   └── server.js
├── package.json
└── README.md
```

## Preview 
https://github.com/user-attachments/assets/fbac8610-1f90-43b2-8d0a-81b97cd14a46

## Dependencies

- Express.js - Web server framework
- csv-parse - CSV parsing library
- Chart.js - Charting library
- Bootstrap - CSS framework

## Development

1. Install development dependencies:

```bash
npm install nodemon --save-dev
```

2. Run in development mode:

```bash
npm run dev
```





## CSV Data Format

The application expects a CSV file with the following columns:

```csv
index_name,index_date,open_index_value,high_index_value,low_index_value,closing_index_value,points_change,change_percent,volume,turnover_rs_cr,pe_ratio,pb_ratio,div_yield
"Nifty 50","2024-03-22","21932.20","22180.70","21883.30","22096.75","84.80","0.39","388656439","39023.19","22.81","3.87","1.21"
```

## Troubleshooting

1. If you see "CSV file not found":

   - Make sure `dump.csv` is in the `server` directory
   - Check file permissions

2. If data doesn't load:

   - Check the CSV format matches the expected structure
   - Verify the server is running on port 3000
   - Check browser console for errors

3. If charts don't display:
   - Ensure you have an active internet connection (for CDN resources)
   - Check browser console for JavaScript errors

## License

MIT License - feel free to use this project for any purpose.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
