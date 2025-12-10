# 🚀 Deployment Guide - Fun Circle

## Environment Setup

### Production Environment
- **Domain**: https://funcircle.net
- **Purpose**: Live production site for users
- **Deploy Command**: `npm run deploy:prod` or `vercel --prod`

### Testing Environment  
- **Domain**: Auto-generated Vercel preview URL (e.g., `fun-circle-abc123.vercel.app`)
- **Purpose**: Test new features before production
- **Deploy Command**: `npm run deploy:test` or `vercel`

---

## 📦 Deployment Commands

### Quick Deploy (Interactive)
```bash
npm run deploy
```
This will show a menu to choose production or testing.

### Deploy to Production (funcircle.net)
```bash
npm run deploy:prod
```

### Deploy to Testing Environment
```bash
npm run deploy:test
```

---

## 🔄 Recommended Workflow

1. **Develop locally**: 
   ```bash
   npm run dev
   ```

2. **Test changes on preview**:
   ```bash
   npm run deploy:test
   ```
   - Review the preview URL Vercel provides
   - Test all features thoroughly

3. **Deploy to production**:
   ```bash
   npm run deploy:prod
   ```
   - Only after testing is successful
   - Changes go live on funcircle.net

---

## 🌐 Vercel Dashboard

View your deployments:
- **Project Dashboard**: https://vercel.com/dashboard
- **Production deployments**: Linked to funcircle.net
- **Preview deployments**: Unique URLs for each test deploy

---

## 🔧 Environment Variables

Environment-specific settings are in:
- `.env.production` - Production settings
- `.env.preview` - Testing settings
- `.env` - Local development (not committed to git)

To add new environment variables in Vercel:
1. Go to your project in Vercel Dashboard
2. Settings → Environment Variables
3. Add variables for Production/Preview/Development

---

## 📝 Git Workflow

```bash
# Make changes
git add .
git commit -m "Your message"

# Test first
npm run deploy:test

# If tests pass, deploy to production
npm run deploy:prod

# Push to GitHub
git push origin main
```

---

## 🛑 Rollback

If something goes wrong in production:
1. Go to Vercel Dashboard
2. Find the last working deployment
3. Click "..." → "Promote to Production"

Or redeploy the previous commit:
```bash
git checkout <previous-commit-hash>
npm run deploy:prod
git checkout main
```

---

## 🔍 Monitoring

- **Production**: https://funcircle.net
- **Vercel Analytics**: Available in your Vercel dashboard
- **Google Search Console**: For SEO monitoring

---

## ⚠️ Important Notes

- **Never deploy directly to production** without testing first
- **Always test on preview** before production deployment
- **Keep .env files secure** - they're in .gitignore
- **Monitor Vercel dashboard** for deployment status

---

## 🆘 Troubleshooting

**Deployment failed?**
- Check build logs in Vercel dashboard
- Run `npm run build` locally to test
- Check for TypeScript errors

**Wrong environment deployed?**
- Check which command you used
- Verify in Vercel dashboard which environment was updated

**Need to cancel a deployment?**
- Go to Vercel dashboard
- Click on the deployment → Cancel

---

## 📞 Quick Reference

| Action | Command |
|--------|---------|
| Local development | `npm run dev` |
| Build locally | `npm run build` |
| Deploy to test | `npm run deploy:test` |
| Deploy to production | `npm run deploy:prod` |
| Interactive deploy | `npm run deploy` |

