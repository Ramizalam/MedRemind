import axios from 'axios';

// Twilio credentials
const ACCOUNT_SID = 'AC6c81ee12442ee0756a8418184feafeb6';
const AUTH_TOKEN = '9e7bffb2b02c9612904c55877bca9f5d'; // Replace with your actual Auth Token

// Twilio WhatsApp sandbox number
const TWILIO_WHATSAPP_NUMBER = 'whatsapp:+14155238886'; // Replace with your Twilio WhatsApp number

/**
 * Sends an SMS using Twilio.
 */
export const sendWhatsAppMessage = async (to: string, templateVariables: Record<string, string>) => {
    try {
      const response = await fetch('/api/send-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, templateVariables }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      if (data.success) {
        console.log('WhatsApp message sent:', data.sid);
      } else {
        console.error('Failed to send WhatsApp message:', data.error);
      }
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error.message);
    }
  };