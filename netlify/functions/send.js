// Netlify: place in netlify/functions/send.js
export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: 'Method Not Allowed' })
    };
  }

  try {
    const { name, role, email, inquiry } = JSON.parse(event.body || '{}');
    
    // Validate required fields
    if (!name || !role || !email || !inquiry) {
      return { 
        statusCode: 400, 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, error: 'All fields are required' })
      };
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

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'form@llm-stack.com',
        to: ['tim@llm-stack.com'],
        subject: `New Contact Form Submission from ${name}`,
        html: emailHtml
      })
    });

    const data = await resp.json();
    
    if (resp.ok) {
      return { 
        statusCode: 200, 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          success: true, 
          message: 'Email sent successfully',
          emailId: data.id 
        })
      };
    } else {
      console.error('Resend error:', data);
      return { 
        statusCode: 500, 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          success: false, 
          error: 'Failed to send email' 
        })
      };
    }
  } catch (error) {
    console.error('Function error:', error);
    return { 
      statusCode: 500, 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      })
    };
  }
}
