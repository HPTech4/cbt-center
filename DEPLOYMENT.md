# 🚀 Production Deployment Guide

Complete guide for deploying your CBT Practice System to production.

## Deployment Options

### Option 1: Vercel (Recommended) ⭐
**Best for**: Fast deployment, automatic SSL, global CDN

### Option 2: Netlify
**Best for**: Simple deployment, continuous deployment

### Option 3: Traditional Hosting (DigitalOcean, AWS, etc.)
**Best for**: Full control, custom configurations

---

## 🎯 Pre-Deployment Checklist

- [ ] Supabase project created (production instance)
- [ ] All environment variables ready
- [ ] Database schema executed
- [ ] Admin user created
- [ ] Test data verified
- [ ] All features tested locally
- [ ] Security review completed
- [ ] Backup strategy planned

---

## 📦 Option 1: Deploy to Vercel

### Step 1: Prepare Your Repository

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit: CBT Practice System"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/cbt-practice-system.git
git push -u origin main
```

### Step 2: Set Up Vercel

1. Go to https://vercel.com
2. Sign up/Sign in with GitHub
3. Click "Add New Project"
4. Import your repository
5. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: dist

### Step 3: Add Environment Variables

In Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add these variables:

```
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
```

### Step 4: Deploy

1. Click "Deploy"
2. Wait 2-3 minutes
3. Your site is live! 🎉

**Your URL**: `https://your-project.vercel.app`

### Step 5: Custom Domain (Optional)

1. Buy domain from Namecheap, GoDaddy, etc.
2. In Vercel: Settings → Domains
3. Add your domain
4. Update DNS records as shown
5. Wait for SSL certificate (automatic)

---

## 📦 Option 2: Deploy to Netlify

### Step 1: Build Configuration

Create `netlify.toml` in project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Step 2: Deploy via Netlify

1. Go to https://netlify.com
2. Sign up/Sign in
3. Click "Add new site" → "Import from Git"
4. Connect GitHub and select repository
5. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: dist

### Step 3: Environment Variables

1. Site settings → Build & deploy → Environment
2. Add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Step 4: Deploy

1. Click "Deploy site"
2. Wait for build to complete
3. Site is live! 🎉

---

## 📦 Option 3: Traditional Server (Ubuntu/Nginx)

### Server Requirements
- Ubuntu 20.04+ or similar
- Node.js 18+
- Nginx
- SSL certificate (Let's Encrypt)

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

### Step 2: Upload Project

```bash
# On your local machine
npm run build

# Upload to server (replace with your details)
scp -r dist/* user@your-server:/var/www/cbt-practice-system/
```

Or use Git:
```bash
# On server
cd /var/www
git clone https://github.com/yourusername/cbt-practice-system.git
cd cbt-practice-system
npm install
npm run build
```

### Step 3: Configure Nginx

Create `/etc/nginx/sites-available/cbt-practice-system`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    root /var/www/cbt-practice-system/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/cbt-practice-system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 4: SSL Certificate

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### Step 5: Environment Variables

Create `/var/www/cbt-practice-system/.env.production`:

```bash
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
```

Rebuild with production env:
```bash
cd /var/www/cbt-practice-system
npm run build
```

---

## 🔐 Production Security Checklist

### Supabase Security

- [ ] Enable email confirmations
- [ ] Set up rate limiting
- [ ] Review RLS policies
- [ ] Enable database backups
- [ ] Set up monitoring

### Application Security

- [ ] Change all default passwords
- [ ] Use strong admin credentials
- [ ] Enable HTTPS only
- [ ] Set up CORS properly
- [ ] Remove development console.logs
- [ ] Enable security headers

### Nginx Security Headers (if using traditional hosting)

Add to nginx config:
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
```

---

## 📊 Post-Deployment Setup

### 1. Create Production Admin User

```javascript
// In Supabase SQL Editor
-- Get user ID from Authentication → Users
INSERT INTO public.users (id, full_name, role)
VALUES (
  'production-admin-user-id',
  'Production Admin',
  'admin'
);
```

### 2. Create Test Student

Follow same process with `role = 'student'`

### 3. Upload Production Questions

1. Login as admin
2. Create subjects
3. Upload questions (100+ per subject recommended)

### 4. Test All Flows

- [ ] Student can login
- [ ] Student can take exam
- [ ] Timer works correctly
- [ ] Submission works
- [ ] Results display
- [ ] Review works
- [ ] Admin can login
- [ ] Admin can create content
- [ ] Admin can view results

---

## 🔄 Continuous Deployment

### GitHub Actions (for Vercel/Netlify)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
```

Vercel/Netlify will auto-deploy on push to main.

---

## 📈 Performance Optimization

### 1. Enable Caching

In Vercel/Netlify, caching is automatic.

For Nginx, already configured in the example above.

### 2. CDN Configuration

- Vercel/Netlify include global CDN
- For traditional hosting, consider Cloudflare

### 3. Database Optimization

```sql
-- In Supabase SQL Editor
-- Add indexes for better performance (already in schema)
CREATE INDEX IF NOT EXISTS idx_attempts_user_id ON attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_subject_id ON questions(subject_id);
```

### 4. Build Optimization

Already configured in vite.config.js for optimal builds.

---

## 📊 Monitoring & Maintenance

### Supabase Monitoring

1. Dashboard → Database → Performance
2. Set up alerts for:
   - High database usage
   - API rate limits
   - Storage limits

### Application Monitoring

Recommended tools:
- **Vercel Analytics** (if using Vercel)
- **Google Analytics** (user behavior)
- **Sentry** (error tracking)

### Backup Strategy

1. **Database**: Supabase auto-backups (daily)
2. **Manual backups**:
   ```bash
   # From Supabase dashboard
   # Database → Backups → Download
   ```

---

## 🚨 Troubleshooting Production Issues

### Issue: Site not loading
- Check environment variables
- Verify build succeeded
- Check browser console for errors

### Issue: "Failed to fetch"
- Verify Supabase URL is correct
- Check API key is valid
- Confirm RLS policies are set

### Issue: Timer not working
- Check browser localStorage is enabled
- Verify Supabase connection
- Check browser console

### Issue: Questions not randomizing
- Verify enough questions uploaded (40+)
- Check attempt_questions table has data

---

## 📞 Production Support Checklist

- [ ] Domain configured and working
- [ ] SSL certificate active
- [ ] All features tested in production
- [ ] Admin credentials secured
- [ ] Backups configured
- [ ] Monitoring set up
- [ ] Documentation updated
- [ ] Support email configured

---

## 🎉 Launch Checklist

### Pre-Launch
- [ ] All features working
- [ ] All users can login
- [ ] Questions uploaded
- [ ] Performance tested
- [ ] Security reviewed
- [ ] Backups configured

### Launch Day
- [ ] Deploy to production
- [ ] Test all flows
- [ ] Create admin accounts
- [ ] Create student accounts
- [ ] Upload production questions
- [ ] Announce to users

### Post-Launch
- [ ] Monitor performance
- [ ] Check error logs
- [ ] Gather user feedback
- [ ] Plan improvements

---

## 🔄 Update Strategy

### How to Deploy Updates

1. Make changes locally
2. Test thoroughly
3. Commit to git
4. Push to GitHub
5. Automatic deployment (Vercel/Netlify)
6. Verify changes in production

### Database Schema Updates

```sql
-- Always test in development first
-- Use migrations for schema changes
-- Backup before running
```

---

## 📝 Production URLs

After deployment, your URLs will be:

**Vercel**: `https://your-project.vercel.app`
**Netlify**: `https://your-site.netlify.app`
**Custom**: `https://your-domain.com`

**Key Routes**:
- Login: `/login` (or `/`)
- Student: `/exams`
- Admin: `/admin`

---

## ✅ Success!

Your CBT Practice System is now live in production! 🎉

**Remember**:
- Keep credentials secure
- Monitor performance regularly
- Backup database frequently
- Update dependencies periodically
- Respond to user feedback

**Need help?** Review the documentation or check Supabase logs.

---

**Happy deployment! Your students can now practice their exams online!** 🎓
