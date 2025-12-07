# Deployment Guide - Project NALAR

## ✅ Pre-Deployment Checklist Completed

### Security Check
- ✅ No API keys, secrets, or tokens found in codebase
- ✅ No sensitive personal information in files
- ✅ Environment variables properly configured in `.gitignore`

### Git Configuration
- ✅ `.gitignore` properly configured to exclude:
  - `node_modules/` - Dependencies (not needed in repo)
  - `dist/` - Build output (generated on deployment)
  - `.env*` - Environment variables (sensitive data)
  - `.kiro/` - AI assistant files (optional, currently excluded)
  - `coverage/` - Test coverage reports
  - Editor and OS files

### Repository Status
- ✅ Git initialized
- ✅ All source files committed
- ✅ Working tree clean
- ✅ Ready to push to GitHub

## 📤 Next Steps: Push to GitHub

### Option 1: Create New Repository on GitHub (Recommended)

1. Go to [GitHub](https://github.com) and log in
2. Click the "+" icon in the top right → "New repository"
3. Fill in the details:
   - **Repository name**: `nalar` or `project-nalar`
   - **Description**: "A modern, gamified quiz interface for Academic Potential Tests (TPA/CPNS)"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. Click "Create repository"

5. Copy the commands GitHub shows you, or use these:

```bash
# Add GitHub as remote origin
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Option 2: Use GitHub CLI (if installed)

```bash
# Create repo and push in one command
gh repo create nalar --public --source=. --remote=origin --push
```

## 🚀 Deploy to Vercel

### Method 1: Vercel Dashboard (Easiest)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Vercel will auto-detect the settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Click "Deploy"
6. Wait 1-2 minutes for deployment to complete
7. Your app will be live at `https://your-project.vercel.app`

### Method 2: Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? nalar
# - Directory? ./
# - Override settings? No

# For production deployment
vercel --prod
```

## 🔧 Environment Variables (if needed later)

If you need to add environment variables:

1. In Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add variables like:
   - `VITE_API_URL`
   - `VITE_API_KEY`
3. Redeploy for changes to take effect

## 📊 Post-Deployment

After deployment, verify:
- ✅ App loads correctly
- ✅ All questions display properly
- ✅ Timer works
- ✅ Score and streak tracking works
- ✅ Summary card appears after completing all questions
- ✅ "Try Again" button resets the session

## 🔄 Future Updates

To deploy updates:

```bash
# Make your changes
git add .
git commit -m "Description of changes"
git push

# Vercel will automatically deploy the changes
```

## 📝 Notes

- **Build Time**: ~1-2 minutes
- **Automatic Deployments**: Every push to `main` branch triggers a new deployment
- **Preview Deployments**: Pull requests get their own preview URLs
- **Custom Domain**: Can be added in Vercel dashboard (Settings → Domains)

## 🆘 Troubleshooting

### Build Fails on Vercel
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Test build locally: `npm run build`

### App Doesn't Load
- Check browser console for errors
- Verify all assets are loading correctly
- Check Vercel function logs

### Need Help?
- Vercel Docs: https://vercel.com/docs
- Vite Docs: https://vitejs.dev/guide/

---

**Ready to deploy!** Follow the steps above to push to GitHub and deploy to Vercel.
