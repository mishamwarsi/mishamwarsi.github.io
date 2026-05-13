# Misham Warsi — Blog Setup Guide

## File Structure
```
yourusername.github.io/
├── index.html          ← Homepage
├── blog.html           ← All posts listing
├── about.html          ← About page
├── style.css           ← All styles
├── admin/
│   └── index.html      ← Admin panel (access at yourdomain.com/admin)
├── posts/
│   ├── posts.json      ← Your blog posts database (edit this via admin panel)
│   └── post.html       ← Single post reader
└── js/
    └── app.js          ← Blog engine (loads posts from JSON)
```

---

## Step 1: Upload to GitHub

1. Create account at github.com
2. Create new repository named: `yourusername.github.io`
3. Upload ALL these files maintaining the folder structure
4. Go to: Repository → Settings → Pages → Deploy from branch → main → / (root) → Save

Your site is live at: `https://yourusername.github.io`

---

## Step 2: Get GitHub Personal Access Token (for Admin Panel)

1. GitHub → click your avatar → Settings
2. Scroll down → Developer settings (bottom left)
3. Personal access tokens → Tokens (classic)
4. Generate new token (classic)
5. Give it a name, set expiry (or no expiry)
6. Check the **repo** checkbox
7. Generate and copy the token (starts with `ghp_`)

---

## Step 3: Use the Admin Panel

1. Go to: `https://yourusername.github.io/admin`
2. Enter your GitHub username, repo name, and token
3. Write posts using Markdown
4. Click Publish — your post appears on the site within ~30 seconds

---

## Step 4: Custom Domain

### Buy domain from:
- Namecheap.com (recommended, ~₹800-1200/year)
- GoDaddy.com
- BigRock.in

### DNS Setup (at your registrar):
Add these 4 A records:
```
Type: A    Name: @    Value: 185.199.108.153
Type: A    Name: @    Value: 185.199.109.153
Type: A    Name: @    Value: 185.199.110.153
Type: A    Name: @    Value: 185.199.111.153
```

Add this CNAME record:
```
Type: CNAME    Name: www    Value: yourusername.github.io
```

### In GitHub:
Repository → Settings → Pages → Custom domain → Enter your domain → Save
Check "Enforce HTTPS"

DNS takes 10-30 minutes to propagate. After that your site is live on your custom domain with free SSL.

---

## Writing Posts in Markdown

The admin panel supports:
- `# Heading 1`, `## Heading 2`, `### Heading 3`
- `**bold**`, `*italic*`
- `` `inline code` ``
- ` ```code blocks``` `
- `- bullet list items`
- `> blockquotes`
- Tables

---

## Customizing the Site

- **Your name/bio**: Edit `about.html`
- **Site name**: Change "M." in the logo in all HTML files  
- **Colors**: Edit CSS variables at the top of `style.css`
- **Add new pages**: Copy `about.html`, edit content, add link in all nav bars

---

## Cost Summary

| Item | Cost |
|------|------|
| GitHub Pages hosting | FREE |
| SSL certificate | FREE |
| Domain name | ~₹800-1200/year |
| **Total** | **~₹800-1200/year** |
