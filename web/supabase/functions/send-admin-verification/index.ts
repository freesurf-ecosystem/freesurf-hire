const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { email, code } = await req.json();
    
    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: 'Email and code are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get Resend API key from environment
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ 
          error: 'Email service not configured',
          details: 'Please add RESEND_API_KEY to Supabase secrets'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('📧 Sending admin verification email to:', email);
    
    // Create email content
    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Admin Verification Code</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background-color: #dc2626; padding: 24px; text-align: center;">
          <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white" style="margin-right: 8px;">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">FreeSurf Admin</h1>
          </div>
          <h2 style="color: white; margin: 0; font-size: 18px; font-weight: 400;">Two-Factor Authentication</h2>
        </div>
        
        <!-- Content -->
        <div style="padding: 32px; text-align: center;">
          <div style="background-color: #f8fafc; border: 2px solid #e2e8f0; padding: 24px; margin-bottom: 24px; border-radius: 8px;">
            <h3 style="margin: 0 0 8px 0; color: #111827; font-size: 18px; font-weight: 600;">Your Verification Code</h3>
            <div style="font-size: 36px; font-weight: bold; color: #dc2626; font-family: monospace; letter-spacing: 8px; margin: 16px 0;">
              ${code}
            </div>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">This code expires in 10 minutes</p>
          </div>
          
          <div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 16px; border-radius: 6px; margin-bottom: 24px;">
            <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 500;">
              🔒 Security Notice: If you didn't request this code, please ignore this email and check your admin account security.
            </p>
          </div>
          
          <div style="text-align: left; color: #6b7280; font-size: 14px;">
            <p style="margin: 0 0 8px 0;"><strong>Request Details:</strong></p>
            <p style="margin: 0 0 4px 0;">• Time: ${new Date().toLocaleString()}</p>
            <p style="margin: 0 0 4px 0;">• IP: Admin Panel Access</p>
            <p style="margin: 0;">• Action: Admin Login Verification</p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; color: #6b7280; font-size: 12px;">
            This is an automated security email from FreeSurf Admin System
          </p>
        </div>
      </div>
    </body>
    </html>
    `;
    
    // Send email via Resend API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'support@freesurf.tools',
        to: [email],
        subject: `FreeSurf Admin Verification Code: ${code}`,
        html: emailHtml,
        tags: [
          { name: 'type', value: 'admin_verification' },
          { name: 'security', value: 'two_factor_auth' }
        ]
      }),
    });
    
    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('❌ Resend API error:', errorText);
      throw new Error(`Failed to send email: ${emailResponse.status} ${errorText}`);
    }
    
    const emailResult = await emailResponse.json();
    console.log('✅ Admin verification email sent:', {
      emailId: emailResult.id,
      to: email,
      code: code
    });
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Verification code sent successfully',
        emailId: emailResult.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
    
  } catch (error: any) {
    console.error('❌ Error in send-admin-verification function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send verification email',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
