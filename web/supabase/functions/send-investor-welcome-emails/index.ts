const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Email notification function
async function sendEmail(to: string, subject: string, html: string, tags: any[]) {
  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY not found in environment variables')
      return
    }
    
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'noreply@freesurf.tools',
        to: [to],
        subject: subject,
        html: html,
        tags: tags
      }),
    })
    
    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      console.error('❌ Resend API error:', errorText)
      return
    }
    
    const emailResult = await emailResponse.json()
    console.log('✅ Email sent successfully:', {
      emailId: emailResult.id,
      to: to,
      subject: subject
    })
    
  } catch (error) {
    console.error('❌ Error sending email notification:', error)
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    const newInvestor = payload.record // The 'new' record from the trigger

    console.log('🚀 Edge Function received new investor:', newInvestor.email)

    // --- 1. Send Welcome Email to Investor ---
    const investorWelcomeSubject = `Welcome to FreeSurf, ${newInvestor.name}!`
    const investorWelcomeHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to FreeSurf</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="background-color: #2563eb; padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">Welcome to FreeSurf!</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 32px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
              Hi ${newInvestor.name},
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
              Thank you for joining our network of qualified real estate investors. We're excited to help you connect with motivated property owners.
            </p>
            
            <h3 style="color: #111827; font-size: 18px; font-weight: 600; margin-bottom: 16px;">How Leads Work:</h3>
            <ul style="list-style: none; padding: 0; margin-bottom: 24px;">
              <li style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                <span style="background-color: #e0f2fe; color: #2563eb; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; flex-shrink: 0; margin-right: 12px;">1</span>
                <p style="color: #374151; font-size: 16px; line-height: 1.5; margin: 0;">
                  Property owners submit their details through our platform, specifying their property type, location, and motivation.
                </p>
              </li>
              <li style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                <span style="background-color: #e0f2fe; color: #2563eb; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; flex-shrink: 0; margin-right: 12px;">2</span>
                <p style="color: #374151; font-size: 16px; line-height: 1.5; margin: 0;">
                  If their property matches your preferences, you'll receive an instant notification with their contact information and property details.
                </p>
              </li>
              <li style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                <span style="background-color: #e0f2fe; color: #2563eb; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; flex-shrink: 0; margin-right: 12px;">3</span>
                <p style="color: #374151; font-size: 16px; line-height: 1.5; margin: 0;">
                  You only pay a small fee ($5) when a property owner contacts you. No monthly subscriptions or hidden costs!
                </p>
              </li>
            </ul>

            <h3 style="color: #111827; font-size: 18px; font-weight: 600; margin-bottom: 16px;">Adjust Your Preferences:</h3>
            <p style="color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
              You can easily manage your profile, update your property type specialties, and set your target states in your investor dashboard.
            </p>
            
            <div style="text-align: center; margin-bottom: 32px;">
              <a href="https://freesurf.tools/investor-dashboard" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Go to Your Dashboard</a>
            </div>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 16px;">
              If you have any questions, please don't hesitate to contact our support team at support@freesurf.tools.
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.5; margin: 0;">
              Happy investing!
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.5; margin-top: 8px;">
              The FreeSurf Team
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; color: #6b7280; font-size: 12px;">
              © 2026 FreeSurf. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
    await sendEmail(
      newInvestor.email,
      investorWelcomeSubject,
      investorWelcomeHtml,
      [
        { name: 'type', value: 'investor_welcome' },
        { name: 'investor_id', value: newInvestor.id }
      ]
    )

    // --- 2. Send Notification Email to Support ---
    const supportNotificationSubject = `New Investor Signup: ${newInvestor.name} (${newInvestor.company})`
    const supportNotificationHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Investor Signup</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="background-color: #10b981; padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">New Investor Signup!</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 32px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
              A new investor has just completed the signup process:
            </p>
            
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
              <p style="margin: 0 0 12px 0; color: #111827; font-size: 18px; font-weight: 600;">${newInvestor.name}</p>
              <p style="margin: 0 0 8px 0; color: #374151; font-size: 16px;">${newInvestor.company}</p>
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">Email: ${newInvestor.email}</p>
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">Phone: ${newInvestor.phone}</p>
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">Experience: ${newInvestor.years_experience} years</p>
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">Base ZIP: ${newInvestor.base_zip_code || 'N/A'}</p>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">Specialties: ${newInvestor.specialties ? newInvestor.specialties.join(', ') : 'N/A'}</p>
            </div>

            <p style="color: #374151; font-size: 14px; line-height: 1.5; margin: 0; text-align: center; color: #9ca3af;">
              Check the investor dashboard for full details.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; color: #6b7280; font-size: 12px;">
              Automated notification from FreeSurf
            </p>
          </div>
        </div>
      </body>
      </html>
    `
    await sendEmail(
      'support@freesurf.tools',
      supportNotificationSubject,
      supportNotificationHtml,
      [
        { name: 'type', value: 'new_investor_notification' },
        { name: 'investor_id', value: newInvestor.id }
      ]
    )

    return new Response(
      JSON.stringify({ message: 'Emails sent successfully!' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in send-investor-welcome-emails function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
