# Class Attendance Management System

A front-end academic project built with **HTML, CSS and JavaScript**.

## 1. Project structure

```text
class-attendance-management-system/
│
├── index.html       # Page structure
├── css/
│   └── styles.css   # Design, colors and responsive layout
├── js/
│   └── app.js       # Login demo, attendance logic and reports
└── README.md        # This guide
```

## 2. Run on your computer

1. Download and extract the ZIP file.
2. Open the extracted folder.
3. Double-click `index.html`, or open it with Google Chrome.
4. Use the demo credentials below.

**Demo login**
- Teacher ID: `teacher`
- Password: `1234`

No package installation or build command is required.

## 3. Where to make changes

| What you want to change | File |
|---|---|
| Page content, labels and sections | `index.html` |
| Colors, fonts, spacing and layout | `css/styles.css` |
| Students and sample courses | `js/app.js` → `DEFAULT_DATA` |
| Attendance rules and calculations | `js/app.js` |
| Login demo credentials | `js/app.js` → `handleLogin()` |

The CSS colors are grouped near the top in `:root`, so you can change the theme in one place.

## 4. Deploy online

This is a static website, so it can be hosted using GitHub Pages or Netlify.

### Option A — GitHub Pages

1. Sign in to GitHub and create a new repository.
2. Upload the contents of this project folder. Make sure `index.html` is in the repository root.
3. Open the repository's **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Select the `main` branch and `/ (root)` folder, then save.
6. Wait for GitHub Pages to publish the website. The Pages section will show your website URL.

### Option B — Netlify

1. Sign in to Netlify.
2. Choose **Add new site → Deploy manually** (wording may vary).
3. Drag and drop the extracted project folder, or connect the GitHub repository.
4. Netlify will publish the static site and provide a website URL.

## 5. Important project limitations

- Login is a demonstration only. The credentials are visible in the JavaScript and are **not secure authentication**.
- Records are saved in the current browser using `localStorage`.
- Browser LocalStorage is not a shared database. Data entered on one device/browser will not automatically appear on another.
- Clearing browser site data may remove saved records.
- For a real college deployment with separate teacher accounts, shared student data, backups and access control, add a backend (for example, Node.js/Express) and a database (for example, MySQL or PostgreSQL). Never store real passwords in front-end JavaScript.

## 6. Main features

- Teacher demo login
- Dashboard with student, course and attendance statistics
- Student add, search and remove
- Course add and remove
- Daily attendance: Present, Absent and Late
- Edit and save attendance by course and date
- Semester attendance report and low-attendance filter
- Print report
- Browser LocalStorage persistence
- Responsive desktop and mobile layout
