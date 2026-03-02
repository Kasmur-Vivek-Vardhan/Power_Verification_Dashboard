# GitHub Pages Setup Guide

This guide will help you deploy your Power Verification Dashboard to GitHub Pages as a public website.

## 🚀 Quick Setup (5 minutes)

### Step 1: Create GitHub Repository
1. Go to [GitHub](https://github.com) and sign in
2. Click "New Repository" (green button)
3. Repository name: `power-verification-dashboard`
4. Description: `Power Verification Dashboard for Intel Team`
5. Make it **Public** (required for free GitHub Pages)
6. ✅ Check "Add a README file"
7. Click "Create repository"

### Step 2: Upload Your Files
You have two options:

#### Option A: Using GitHub Web Interface (Easier)
1. In your new repository, click "uploading an existing file"
2. Drag and drop ALL files from your local project folder
3. Commit message: `Initial dashboard setup`
4. Click "Commit changes"

#### Option B: Using Git Commands (For developers)
```bash
# Navigate to your project folder
cd "C:\Users\vkasmur\OneDrive - Intel Corporation\Documents\power-verification-dashboard"

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit files
git commit -m "Initial dashboard setup"

# Add GitHub repository as origin
git remote add origin https://github.com/YOURUSERNAME/power-verification-dashboard.git

# Push to GitHub
git push -u origin main
```

### Step 3: Enable GitHub Pages
1. In your repository, go to **Settings** tab
2. Scroll down to **Pages** section (left sidebar)
3. Source: Select "Deploy from a branch"
4. Branch: Select "main"
5. Folder: Select "/ (root)"
6. Click **Save**

### Step 4: Access Your Website
- Your dashboard will be available at: `https://YOURUSERNAME.github.io/power-verification-dashboard`
- It may take 5-10 minutes for the first deployment
- You'll get an email when it's ready

## 🔧 Advanced Configuration

### Custom Domain (Optional)
If you want to use your own domain:
1. Create a file named `CNAME` in your repository
2. Add your domain name (e.g., `power-dashboard.yourdomain.com`)
3. Configure your DNS to point to GitHub Pages

### HTTPS (Automatic)
- GitHub Pages automatically provides HTTPS
- Your site will be accessible via both HTTP and HTTPS
- Redirect to HTTPS is enabled by default

### Password Protection
⚠️ **Important**: GitHub Pages sites are public by default. The dashboard includes:
- Admin password protection for data updates
- All data is stored locally in users' browsers
- No sensitive data is exposed in the repository

## 📱 Updating Your Dashboard

### Adding New Weekly Data
1. Open your dashboard website
2. Switch to "Admin Mode"
3. Authenticate with password
4. Upload new week data
5. Data is saved locally in each user's browser

### Updating Dashboard Code
When you need to update the dashboard functionality:

#### Method 1: GitHub Web Interface
1. Navigate to the file you want to edit
2. Click the pencil icon (Edit)
3. Make your changes
4. Commit changes with a descriptive message

#### Method 2: Git Commands
```bash
# Pull latest changes
git pull origin main

# Make your changes to files
# ...

# Add and commit changes
git add .
git commit -m "Update dashboard functionality"

# Push to GitHub
git push origin main
```

## 🔄 Workflow for Weekly Updates

### For Power Verification Team
1. **Generate weekly report** (your existing process)
2. **Open dashboard website**
3. **Admin Mode → Authenticate → Upload data**
4. **Share website link** with team via email

### For Team Members
1. **Bookmark the dashboard URL**
2. **Visit website** to view latest data
3. **Use built-in comparison tools** for analysis
4. **No software installation required**

## 📊 Repository Structure

Your GitHub repository will contain:
```
power-verification-dashboard/
├── index.html              # Main dashboard page
├── css/
│   └── styles.css          # Styling
├── js/
│   ├── config.js          # Configuration
│   ├── dataManager.js     # Data management
│   ├── tableManager.js    # Table display
│   ├── chartManager.js    # Charts and trends
│   ├── adminManager.js    # Admin functions
│   └── app.js             # Main application
├── data/
│   └── sampleData.json    # Sample data
├── README.md              # Documentation
├── .gitignore            # Git ignore file
└── GITHUB_SETUP.md       # This guide
```

## 🔐 Security Best Practices

### Repository Security
- ✅ Keep repository public for GitHub Pages
- ✅ Don't commit sensitive passwords or data
- ✅ Use environment-specific configurations
- ✅ Regular dependency updates

### Dashboard Security
- ✅ Admin password protection implemented
- ✅ Client-side data validation
- ✅ No server-side data storage
- ✅ Local browser storage only

### Access Control
```javascript
// In js/config.js - Update admin password
const CONFIG = {
    ADMIN_PASSWORD: 'YourSecurePassword2026!',
    // ... other config
};
```

## 📈 Monitoring and Analytics (Optional)

### GitHub Pages Analytics
- Repository insights show page views
- Traffic tab shows visitor statistics
- No setup required

### Google Analytics (Advanced)
Add to `index.html` before `</head>`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>
```

## 🚨 Troubleshooting

### Common Issues

#### Website Not Loading
- Check repository is public
- Verify GitHub Pages is enabled
- Wait 10 minutes for deployment
- Check for typos in URL

#### Updates Not Showing
- Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
- Clear browser cache
- Wait 5-10 minutes for GitHub Pages update

#### Admin Password Not Working
- Check `js/config.js` for correct password
- Verify file uploaded correctly to GitHub
- Check browser console for errors

### Getting Help
1. **GitHub Pages Status**: [githubstatus.com](https://githubstatus.com)
2. **GitHub Docs**: [docs.github.com/pages](https://docs.github.com/pages)
3. **Repository Issues**: Create issue in your repository

## 📞 Support

If you need help with the setup:
1. Check this guide thoroughly
2. Search GitHub documentation
3. Contact your IT support team
4. Create an issue in your repository

---

**Next Steps**: After setup, share your dashboard URL with the team and begin uploading weekly data!

**Your Website**: `https://YOURUSERNAME.github.io/power-verification-dashboard`