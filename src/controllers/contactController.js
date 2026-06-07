const Message = require('../models/Message');
const nodemailer = require('nodemailer');
const { getSecret } = require('../utils/getSecret');

/**
 * Helper to validate email formats
 */
function isValidEmail(email) {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
}

/**
 * @desc    Submit a contact form message
 * @route   POST /api/contact
 * @access  Public
 */
async function submitContactForm(req, res, next) {
  try {
    const { name, email, message } = req.body;

    // 1. Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    if (name.length > 100) {
      return res.status(400).json({ success: false, message: 'Name cannot exceed 100 characters' });
    }
    if (message.length > 2000) {
      return res.status(400).json({ success: false, message: 'Message cannot exceed 2000 characters' });
    }

    // 2. Save to database
    const newMessage = await Message.create({
      name: name.trim(),
      email: email.trim(),
      message: message.trim()
    });

    // 3. Send email notification (Optional - fails silently to avoid blocking response)
    const emailUser = getSecret('EMAIL_USER');
    const emailPass = getSecret('EMAIL_PASS');

    if (emailUser && emailPass) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail', // or custom SMTP settings based on user credentials
          auth: {
            user: emailUser,
            pass: emailPass
          }
        });

        const mailOptions = {
          from: emailUser,
          to: emailUser, // Send message notification to yourself
          subject: `Portfolio Contact from ${newMessage.name}`,
          text: `You have a new portfolio contact message.\n\nName: ${newMessage.name}\nEmail: ${newMessage.email}\nDate: ${newMessage.createdAt}\n\nMessage:\n${newMessage.message}`
        };

        await transporter.sendMail(mailOptions);
        console.log('Notification email sent successfully');
      } catch (emailError) {
        console.warn('Notification email could not be sent:', emailError.message);
        // Do not fail the API call since the database entry was successfully created
      }
    } else {
      console.log('Skipping email notification: EMAIL_USER or EMAIL_PASS environment variables are missing');
    }

    res.status(201).json({
      success: true,
      message: 'Message saved successfully! Thank you for reaching out.'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { submitContactForm };
