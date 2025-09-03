const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');

const app = express();
const resend = new Resend('re_9sR8rq8U_AkiLsqvhYuDbk1wkaLRXkNx1');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('.'));

// Email endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { name, role, email, inquiry } = req.body;

    // Validate required fields
    if (!name || !role || !email || !inquiry) {
      return res.status(400).json({ 
        success: false, 
        error: 'All fields are required' 
      });
    }

    // Email template
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background: linear-gradient(135deg, #5b8cff, #7b5bff, #34d2ff); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; text-align: center;">New Contact Form Submission</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Contact Details</h2>
          
          <div style="margin-bottom: 20px;">
            <strong style="color: #5b8cff;">Name:</strong>
            <p style="margin: 5px 0; padding: 10px; background: #f5f5f5; border-radius: 5px;">${name}</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <strong style="color: #5b8cff;">Role:</strong>
            <p style="margin: 5px 0; padding: 10px; background: #f5f5f5; border-radius: 5px;">${role}</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <strong style="color: #5b8cff;">Email:</strong>
            <p style="margin: 5px 0; padding: 10px; background: #f5f5f5; border-radius: 5px;">${email}</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <strong style="color: #5b8cff;">Inquiry:</strong>
            <p style="margin: 5px 0; padding: 10px; background: #f5f5f5; border-radius: 5px; white-space: pre-wrap;">${inquiry}</p>
          </div>
          
          <div style="margin-top: 30px; padding: 15px; background: #e8f4fd; border-radius: 5px; border-left: 4px solid #5b8cff;">
            <p style="margin: 0; color: #333;">
              <strong>Next Steps:</strong> Please respond to this inquiry within 24 hours as per our service commitment.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
          <p>This email was sent from the LLM-Stack contact form</p>
        </div>
      </div>
    `;

    // Send email
    const { data, error } = await resend.emails.send({
      from: 'form@llm-stack.com',
      to: 'tim@llm-stack.com',
      subject: `New Contact Form Submission from ${name}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to send email' 
      });
    }

    console.log('Email sent successfully:', data);
    res.json({ 
      success: true, 
      message: 'Email sent successfully',
      emailId: data.id 
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to view the site`);
});
