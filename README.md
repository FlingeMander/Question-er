# Questionnaire CEVITAL - Netlify Backup

## Files included

- `index.html`: questionnaire page
- `success.html`: thank-you page after submission
- `netlify/functions/submit.js`: Netlify Function that sends responses by email using Nodemailer
- `package.json`: installs Nodemailer
- `netlify.toml`: tells Netlify where the function folder is

## Required Netlify environment variables

Add these in Netlify, not in GitHub:

GMAIL_USER=your Gmail address  
GMAIL_APP_PASSWORD=your 16-character Gmail App Password without spaces  
RECEIVER_EMAIL=email address that receives the responses  

After adding or changing environment variables, redeploy the site.

## Important

Do not upload your `.env` file or Gmail App Password to GitHub.
