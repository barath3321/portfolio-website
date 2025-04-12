// Save this file as 'contact.js' in a 'netlify/functions' folder in your project root
const nodemailer = require('nodemailer');

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ error: 'Method Not Allowed' }) 
    };
  }
  
  try {
    // Parse the incoming request body
    const { name, email, subject, message } = JSON.parse(event.body);
    
    // Validate required fields
    if (!name || !email || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Please fill in all required fields' })
      };
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Please provide a valid email address' })
      };
    }
    
    // Set up email transporter
    // Note: You'll need to set these environment variables in your Netlify dashboard
    const transporter = nodemailer.createTransport({
      service: 'gmail', // You can use other services too
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // Use an app password for Gmail
      }
    });
    
    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'barthjai@gmail.com', // Your email address
      subject: `Portfolio Contact: ${subject || 'New message from portfolio'}`,
      text: `
Name: ${name}
Email: ${email}

Message:
${message}
      `,
      html: `
<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
  <h2 style="color: #ff6b00;">New Portfolio Contact Message</h2>
  <p><strong>From:</strong> ${name}</p>
  <p><strong>Email:</strong> ${email}</p>
  <p><strong>Subject:</strong> ${subject || 'No subject'}</p>
  <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-left: 4px solid #ff6b00;">
    <p><strong>Message:</strong></p>
    <p>${message.replace(/\n/g, '<br>')}</p>
  </div>
</div>
      `
    };
    
    // Send the email
    await transporter.sendMail(mailOptions);
    
    // Return success response
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Email sent successfully' })
    };
    
  } catch (error) {
    console.error('Function error:', error);
    
    // Return error response
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to send message. Please try again later.' })
    };
  }
};
