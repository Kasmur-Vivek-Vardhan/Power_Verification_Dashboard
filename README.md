# Power Verification Dashboard

A comprehensive web-based dashboard for tracking and visualizing Intel power verification data across multiple weeks. This tool allows the power verification team to upload weekly reports, visualize trends, and compare performance metrics over time.

## 🚀 Features

### 📊 Data Visualization
- **Interactive Tables**: Display three key tables from weekly reports
  - ADJUSTED CDYN TABLE
  - PNC DMR Cdyn changes w.r.t previous Rollup
  - PNC DMR Cdyn changes w.r.t OLD PDK Rollup
- **Dynamic Charts**: Interactive charts using Chart.js for visual analysis
- **Trend Analysis**: Week-to-week performance trending
- **Comparison Tools**: Side-by-side week comparison functionality

### 🔐 Admin Interface
- **Secure Authentication**: Password-protected admin access
- **Data Upload**: Easy paste-and-parse interface for weekly data
- **Data Preview**: Preview parsed data before saving
- **Data Management**: Export, import, and delete functionality

### 📱 User Experience
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional interface with gradient design
- **Real-time Updates**: Instant feedback and notifications
- **Keyboard Shortcuts**: Quick navigation (Ctrl+Alt+A for admin mode)

## 🛠️ Installation

### Option 1: GitHub Pages (Recommended)
1. Fork this repository
2. Enable GitHub Pages in repository settings
3. Access your dashboard at `https://yourusername.github.io/power-verification-dashboard`

### Option 2: Local Development
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/power-verification-dashboard.git
   cd power-verification-dashboard
   ```

2. Start a local server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

3. Open `http://localhost:8000` in your browser

## 📋 Usage

### For Viewers (Team Members)
1. **View Mode**: Default mode for viewing data and reports
2. **Week Selection**: Choose specific weeks from dropdown
3. **Show All Weeks**: Compare all weeks in a summary table
4. **Show Trends**: View trend analysis across all weeks
5. **Chart Toggles**: Click "📊 Show Chart" buttons to visualize table data

### For Admins (Power Verification Team)
1. **Switch to Admin Mode**: Click "Admin Mode" button
2. **Authenticate**: Enter password: `PowerVerification2026!`
3. **Upload Data**:
   - Enter week number (format: 26ww07)
   - Paste the three tables from your report
   - Click "Parse & Preview Data"
   - Review the preview
   - Click "Save Week Data"

### Data Format
The dashboard expects data in this tab-separated format:

```
ADJUSTED CDYN TABLE:
Test Name	Cdyn	PNC Adjusted Cdyn	PNC DMR IPC	LNC IPC	PNC POR IPC	External Cdyn Target	LNC Cdyn
alloc_stall_atom_idle	169.95	169.95	0.01	0.01	0.01	170.01	269.03
...

PNC DMR Cdyn changes w.r.t previous Rollup:
Partition Name	Sum of rlp_cdyn_pf	Sum of Diff	Sum of prev_rlp_cdyn	%diff
par_ooo_vec	968.83	0.00	968.82	0.00%
...

PNC DMR Cdyn changes w.r.t OLD PDK Rollup (25ww16):
Partition Name	Sum of rlp_cdyn_pf	Sum of Diff	Sum of prev_rlp_cdyn	%Diff_Cdyn
par_ooo_int	2022.97	68.86	1954.11	3.52%
...
```

## 🏗️ Project Structure

```
power-verification-dashboard/
├── index.html              # Main dashboard page
├── css/
│   └── styles.css          # Styling and responsive design
├── js/
│   ├── config.js          # Configuration and utilities
│   ├── dataManager.js     # Data storage and parsing
│   ├── tableManager.js    # Table display and interactions
│   ├── chartManager.js    # Chart visualizations and trends
│   ├── adminManager.js    # Admin authentication and uploads
│   └── app.js             # Main application coordinator
├── data/
│   └── sampleData.json    # Sample data for demonstration
└── README.md              # This documentation
```

## 🔧 Technical Details

### Technologies Used
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Charts**: Chart.js for interactive visualizations
- **Storage**: localStorage for client-side data persistence
- **Design**: CSS Grid, Flexbox, CSS Variables
- **Icons**: Unicode icons and CSS animations

### Browser Support
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Data Storage
- All data is stored locally in browser's localStorage
- Data persists between sessions
- No server required for basic functionality
- Export/import functionality for data backup

## 📈 Key Metrics Tracked

### CDYN Table Metrics
- Test performance across different benchmarks
- IPC (Instructions Per Clock) values
- Target vs actual CDYN comparisons
- Geomean calculations for overall performance

### Partition Analysis
- Individual partition power consumption
- Week-over-week changes
- Percentage changes from baseline (OLD PDK)
- Trend analysis for optimization opportunities

## 🔒 Security Features

### Authentication
- Password-protected admin access
- Input validation and sanitization
- Secure data parsing with error handling

### Data Integrity
- Client-side validation of data format
- Preview functionality before saving
- Backup and restore capabilities
- Confirmation dialogs for destructive actions

## 📊 Chart Types

1. **Bar Charts**: Individual test case and partition comparisons
2. **Line Charts**: Trend analysis over multiple weeks
3. **Comparison Charts**: Side-by-side week comparisons
4. **Percentage Charts**: Change indicators with color coding

## 🎨 Customization

### Color Scheme
The dashboard uses a professional color palette defined in `CONFIG.CHART_COLORS`:
- Primary: #667eea (Blue gradient)
- Secondary: #764ba2 (Purple gradient)
- Success: #48bb78 (Green)
- Warning: #ed8936 (Orange)
- Danger: #f56565 (Red)

### Adding New Metrics
To add new metrics or modify table structure:
1. Update `CONFIG.TABLE_HEADERS` in `js/config.js`
2. Modify parsing logic in `dataManager.js`
3. Update display logic in `tableManager.js`

## 🚨 Troubleshooting

### Common Issues

1. **Data Not Loading**
   - Check browser console for errors
   - Ensure localStorage is enabled
   - Try clearing browser cache

2. **Charts Not Displaying**
   - Verify Chart.js is loading from CDN
   - Check for JavaScript errors
   - Ensure data format is correct

3. **Admin Access Issues**
   - Verify password: `PowerVerification2026!`
   - Check browser console for authentication errors
   - Try refreshing the page

### Debug Commands
Open browser console and use these commands:
```javascript
// Check application status
debugApp();

// View stored data
console.log(localStorage.getItem('powerVerificationData'));

// Clear all data (admin only)
powerVerificationApp.clearAllData();
```

## 🔄 Data Migration

### Exporting Data
1. Switch to Admin Mode
2. Authenticate
3. Use browser console: `adminManager.exportData()`
4. Save the JSON output

### Importing Data
1. Switch to Admin Mode  
2. Authenticate
3. Use browser console: `adminManager.importData(jsonString)`

## 📝 Contributing

### Development Guidelines
1. Follow existing code structure and naming conventions
2. Test thoroughly across different browsers
3. Update documentation for new features
4. Use semantic versioning for releases

### Feature Requests
To request new features:
1. Create an issue in the repository
2. Describe the use case and expected behavior
3. Include mockups or examples if applicable

## 📞 Support

For technical support or questions:
- Create an issue in the GitHub repository
- Contact the Intel Power Verification Team
- Check the browser console for detailed error messages

## 📄 License

This project is proprietary to Intel Corporation. Use is restricted to authorized Intel employees and contractors for power verification purposes only.

---

**Version**: 1.0.0  
**Last Updated**: February 19, 2026  
**Maintained by**: Intel Power Verification Team