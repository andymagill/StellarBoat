/**
 * Cloudflare Worker: Form Submission Handler with Resend Email
 *
 * This is a reference implementation showing how to use the 'api' backend in StellarBoat forms.
 * Deploy this as a Cloudflare Worker and configure forms to POST to its URL.
 *
 * @see https://developers.cloudflare.com/workers/
 * @see https://resend.com/
 *
 * Setup:
 * 1. Create a new Cloudflare Worker project: `npm create cloudflare@latest`
 * 2. Copy this file to `src/index.ts`
 * 3. Install Resend SDK: `npm install resend`
 * 4. Set env var `RESEND_API_KEY` in wrangler.toml:
 *    ```toml
 *    [[env.production]]
 *    vars = { RESEND_API_KEY = "re_..." }
 *    ```
 * 5. Deploy: `npm run deploy`
 * 6. In your StellarBoat site, configure forms to use this Worker:
 *    ```typescript
 *    // src/config/forms.ts
 *    export const forms = {
 *      defaultBackend: 'api',
 *      apiUrl: 'https://your-worker.yourdomain.workers.dev/submit',
 *    };
 *    ```
 */

// Example using Resend API (via Node-compatible SDK in Worker)
export default {
  async fetch(request: Request, env: CloudflareEnv): Promise<Response> {
    // Only accept POST requests
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      // Parse incoming JSON
      const body = await request.json();
      const { name, email, message, company, phone } = body as Record<
        string,
        unknown
      >;

      // Validate required fields
      if (!name || !email) {
        return new Response(
          JSON.stringify({ ok: false, error: 'Name and email are required' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Validate email format
      if (typeof email !== 'string' || !email.includes('@')) {
        return new Response(
          JSON.stringify({ ok: false, error: 'Invalid email address' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Build email content
      const emailContent = `
Name: ${name}
Email: ${email}
${company ? `Company: ${company}\n` : ''}${phone ? `Phone: ${phone}\n` : ''}

Message:
${message || '(no message)'}
      `.trim();

      // Send via Resend (pseudo-code; exact SDK usage depends on your setup)
      // In a real Worker, you'd use the Resend SDK or call Resend API directly
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'noreply@yoursite.com',
          to: env.CONTACT_EMAIL || 'hello@example.com',
          subject: `New contact form submission from ${name}`,
          html: `<p>${emailContent.replace(/\n/g, '<br>')}</p>`,
          reply_to: email,
        }),
      });

      // Check Resend response
      if (!resendResponse.ok) {
        const resendError = await resendResponse.json();
        console.error('[Resend Error]', resendError);
        return new Response(
          JSON.stringify({ ok: false, error: 'Failed to send email' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Success
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('[Worker Error]', error);
      return new Response(
        JSON.stringify({ ok: false, error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  },
};

/**
 * Env types for TypeScript
 * Define in wrangler.toml:
 * ```toml
 * vars = { RESEND_API_KEY = "re_...", CONTACT_EMAIL = "hello@example.com" }
 * ```
 */
interface CloudflareEnv {
  RESEND_API_KEY: string;
  CONTACT_EMAIL?: string;
}

/**
 * Alternative: Using Mailgun or SendGrid
 *
 * The same pattern works with other email services:
 *
 * Mailgun:
 * ```typescript
 * const mailgunResponse = await fetch(
 *   `https://api.mailgun.net/v3/${env.MAILGUN_DOMAIN}/messages`,
 *   {
 *     method: 'POST',
 *     headers: {
 *       'Authorization': `Basic ${btoa(`api:${env.MAILGUN_API_KEY}`)}`,
 *      },
 *      body: new FormData() // Mailgun requires FormData
 *    }
 * );
 * ```
 *
 * SendGrid:
 * ```typescript
 * const sendgridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
 *   method: 'POST',
 *   headers: {
 *     'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
 *     'Content-Type': 'application/json',
 *   },
 *   body: JSON.stringify({
 *     personalizations: [{ to: [{ email: 'to@example.com' }] }],
 *     from: { email: 'from@example.com' },
 *     subject: 'Contact form submission',
 *     content: [{ type: 'text/plain', value: emailContent }],
 *   }),
 * });
 * ```
 */
