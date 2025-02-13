import express from 'express';
import twilio from 'twilio';
import cors from 'cors';

const app = express();
const port = 3000;

// Twilio credentials
const ACCOUNT_SID = 'AC6c81ee12442ee0756a8418184feafeb6';
const AUTH_TOKEN = '9e7bffb2b02c9612904c55877bca9f5d';
const TWILIO_WHATSAPP_NUMBER = 'whatsapp:+14155238886';

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON request bodies

// Root route
app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

// POST endpoint to send WhatsApp messages
app.post('/send-whatsapp', async (req, res) => {
  const { to, templateVariables } = req.body;

  try {
    const client = twilio(ACCOUNT_SID, AUTH_TOKEN);

    const message = await client.messages.create({
      from: TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${to}`,
      contentSid: 'HXb5b62575e6e4ff6129ad7c8efe1f983e',
      contentVariables: JSON.stringify(templateVariables),
    });

    res.status(200).json({ success: true, sid: message.sid });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});