# Questionnaire CEVITAL - Backup GitHub/Vercel

This version replaces FormSubmit with a small Node.js email endpoint using Nodemailer.

## Important

Do **not** put your Gmail App Password inside `index.html`, inside GitHub, or anywhere public.
Use Vercel Environment Variables instead.

## Files

- `index.html`: questionnaire page with a top progress bar and AJAX form submission.
- `success.html`: confirmation page after successful submission.
- `api/submit.js`: Vercel serverless function that sends the response table by email using Nodemailer.
- `.env.example`: names of the required environment variables.

## Recommended deployment

GitHub Pages alone is static, so it cannot run `api/submit.js`. Use GitHub as the code repository, then import the repository into Vercel.

### Vercel setup

1. Create a GitHub repository and upload all files from this folder.
2. Go to Vercel and import the GitHub repository.
3. Add these Environment Variables in Vercel:
   - `GMAIL_USER`: the Gmail address used to send notifications.
   - `GMAIL_APP_PASSWORD`: the 16-character Gmail App Password.
   - `RECEIVER_EMAIL`: the email that receives questionnaire responses.
4. Deploy.
5. Open the Vercel URL and submit a test response.

## Local test

Install Node.js, then run:

```bash
npm install
npx vercel dev
```

For local testing, create a `.env` file based on `.env.example`. Never upload `.env` to GitHub.
