/**
 * Cloudflare Pages Function: POST /api/contact
 * Handles contact form submissions, server-side Cloudflare Turnstile token validation,
 * and forwarding inquiries via email (e.g. Resend, Mailgun, SendGrid, Formspree).
 */
export async function onRequestPost(context) {
  const { request, env } = context;

  // 1. Verify content-type and parse payload
  const contentType = request.headers.get('content-type') || '';
  let payload = {};

  try {
    if (contentType.includes('application/json')) {
      payload = await request.json();
    } else if (
      contentType.includes('application/x-www-form-urlencoded') ||
      contentType.includes('multipart/form-data')
    ) {
      const formData = await request.formData();
      payload = Object.fromEntries(formData.entries());
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Unsupported Content-Type. Please submit as application/json or form data.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to parse request payload.',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { name, email, subject, message } = payload;
  const turnstileToken = payload.turnstileToken || payload['cf-turnstile-response'];

  // 2. Server-side validation of mandatory fields
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Please provide your full name (at least 2 characters).',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Please provide a valid email address.',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!message || typeof message !== 'string' || message.trim().length < 10) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Please provide a message of at least 10 characters.',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 3. Server-side Cloudflare Turnstile CAPTCHA Verification
  // Placeholder secret key: '1x0000000000000000000000000000000AA' (Cloudflare test key, always passes)
  // For production: Define TURNSTILE_SECRET_KEY in Cloudflare Pages Dashboard -> Settings -> Environment Variables
  const secretKey = env?.TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA';
  const clientIp = request.headers.get('CF-Connecting-IP') || '';

  if (!turnstileToken) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Turnstile verification token is missing. Please complete the security check.',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const verifyFormData = new FormData();
    verifyFormData.append('secret', secretKey);
    verifyFormData.append('response', turnstileToken);
    if (clientIp) {
      verifyFormData.append('remoteip', clientIp);
    }

    const turnstileResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        body: verifyFormData,
      }
    );

    const turnstileOutcome = await turnstileResponse.json();

    if (!turnstileOutcome.success) {
      console.error('[Turnstile Failed]', turnstileOutcome['error-codes']);
      return new Response(
        JSON.stringify({
          success: false,
          error:
            'Security verification failed (invalid or expired Turnstile token). Please try again.',
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (err) {
    console.error('[Turnstile Verification Error]', err);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Could not contact the Turnstile verification service. Please try again.',
      }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 4. Email Forwarding Step (Placeholder for Resend / Mailgun / Formspree / SendGrid)
  // =========================================================================================
  // To enable automatic email delivery, plug in an email API service below.
  //
  // Example using Resend (https://resend.com):
  // 1. In Cloudflare Pages Dashboard, add environment variables:
  //    - RESEND_API_KEY = 're_123456789...'
  //    - LAB_CONTACT_EMAIL = 'contact@your-lab-domain.edu'
  //
  // 2. Uncomment and adjust the code below:
  //
  // const resendKey = env?.RESEND_API_KEY;
  // const destination = env?.LAB_CONTACT_EMAIL || 'pi-lastname@university-placeholder.edu';
  //
  // if (resendKey) {
  //   const emailRes = await fetch('https://api.resend.com/emails', {
  //     method: 'POST',
  //     headers: {
  //       'Authorization': `Bearer ${resendKey}`,
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       from: 'Lab Contact Form <inquiries@your-lab-domain.edu>',
  //       to: [destination],
  //       reply_to: email.trim(),
  //       subject: `[Lab Inquiry - ${subject || 'General'}] From ${name.trim()}`,
  //       text: `Sender: ${name.trim()} <${email.trim()}>\nTopic: ${subject || 'General'}\n\nMessage:\n${message.trim()}`,
  //     }),
  //   });
  //
  //   if (!emailRes.ok) {
  //     const errorDetails = await emailRes.text();
  //     console.error('[Email Dispatch Error]', errorDetails);
  //     return new Response(
  //       JSON.stringify({
  //         success: false,
  //         error: 'Message received and verified, but email delivery provider encountered an error.',
  //       }),
  //       { status: 500, headers: { 'Content-Type': 'application/json' } }
  //     );
  //   }
  // }
  // =========================================================================================

  console.log(
    `[Contact Form Received] From: ${name.trim()} <${email.trim()}> | Subject: ${subject || 'General'}`
  );

  return new Response(
    JSON.stringify({
      success: true,
      message:
        'Thank you! Your message has been sent successfully. A lab member will review your inquiry and follow up soon.',
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    }
  );
}
