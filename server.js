require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

if (!EMAIL_USER || !EMAIL_PASS) {
  throw new Error('EMAIL_USER or EMAIL_PASS not set in .env');
}

const transporter = nodemailer.createTransport({
  host: 'smtp.ionos.fr',
  port: 465,
  secure: true,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

const app = express();
app.use(express.json());

app.post('/send', async (req, res) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.API_KEY) {
    return res.status(403).json({ error: 'Unauthorized: Invalid API key' });
  }

  const { to, subject, text, html } = req.body;
  if (!to || !subject || (!text && !html)) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    await transporter.sendMail({
      from: `"Brokex" <${EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
    res.json({ success: true, message: 'Mail sent!' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to send mail', details: e.message });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API mail listening on http://localhost:${PORT}`);
});
