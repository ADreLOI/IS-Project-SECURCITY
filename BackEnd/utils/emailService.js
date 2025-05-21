require('dotenv').config();        // ← load .env into process.env
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendConfirmationEmail(userEmail, userName, confirmationToken) 
{
    const confirmUrl = `${process.env.BASE_CONFIRMATION_URL}/${confirmationToken}`;
  
   console.log("Confirmation URL: ", confirmUrl);
    const msg = 
    {
      to: userEmail,
      from: 'andrea.pezzo-1@studenti.unitn.it', // must be a verified sender in SendGrid
      subject: 'Confirm your account on SecurCity',
      html: `
        <h2>Hello ${userName},</h2>
        <p>Thanks for registering! Please confirm your account by clicking the link below:</p>
        <a href="${confirmUrl}">Confirm your account</a>
        <p>If you didn't sign up, you can ignore this email.</p>
      `,
    };
  
    await sgMail.send(msg);
  }

  async function sendEmailChange(userEmail, userName, confirmationToken) 
{
    const confirmUrl = `${process.env.BASE_CONFIRMATION_URL}/${confirmationToken}`;
  
   console.log("Confirmation URL: ", confirmUrl);
    const msg = 
    {
      to: userEmail,
      from: 'andrea.pezzo-1@studenti.unitn.it', // must be a verified sender in SendGrid
      subject: 'Email changed on SecurCity',
      html: `
        <h2>Hello ${userName},</h2>
        <p>To continue accessing SecurCity's services, please verify your new email address by clicking the link below (the link expires in one hour):</p>
        <a href="${confirmUrl}">Confirm your account</a>
        <p>If you didn't sign up, you can ignore this email.</p>
      `,
    };
  
    await sgMail.send(msg);
  }

  module.exports =
  {
    sendConfirmationEmail,
    sendEmailChange
  }