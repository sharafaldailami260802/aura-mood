# Finish GitHub setup (run these in your terminal)

Everything in the **aura-mood** folder is ready. Do the following:

---

## Step 1: Create the repo on GitHub

1. Go to **https://github.com/new**
2. **Repository name:** `aura-mood` (or any name you like)
3. Leave "Add a README" **unchecked**
4. Click **Create repository**
5. Copy the repo URL GitHub shows, e.g. `https://github.com/YOUR_USERNAME/aura-mood.git`

---

## Step 2: Connect and push (in Terminal)

Open **Terminal**, then run:

```bash
cd /Users/SharafUni/aura-mood

# If you haven't run git init yet:
git init
git branch -M main
git add .
git commit -m "Initial commit: Aura mood analytics PWA"

# Add your repo (replace YOUR_USERNAME and aura-mood with your actual repo name):
git remote add origin https://github.com/YOUR_USERNAME/aura-mood.git

# Push (you may be asked to sign in to GitHub):
git push -u origin main
```

If Git asks for a password, use a **Personal Access Token**:  
GitHub → Settings → Developer settings → Personal access tokens → Generate new token (enable **repo**), then paste the token as the password.

---

## Step 3: Turn on GitHub Pages

1. On GitHub, open your repo
2. Go to **Settings** → **Pages** (left sidebar)
3. Under **Build and deployment**: Source = **Deploy from a branch**
4. Branch: **main**, Folder: **/ (root)** → **Save**

After 1–2 minutes your site will be at:

**https://YOUR_USERNAME.github.io/aura-mood/**

---

## Updating the site later

After you change any files:

```bash
cd /Users/SharafUni/aura-mood
git add .
git commit -m "Describe your changes"
git push
```

The website will update automatically.
