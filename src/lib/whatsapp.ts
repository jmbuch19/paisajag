// WhatsApp Cloud API helper (Meta Graph API).
//
// Proactive nudges — the morning brief and evening alert — are sent OUTSIDE the
// 24-hour customer-service window, so by Meta's rules they MUST go through a
// pre-approved message template (SPEC.md "WhatsApp Templates"), not free-form
// text. The generated brief is passed as the template body's variables.
//
// TODO(backend): Jaydeep finalises template registration + language code with
// Meta (env: META_ACCESS_TOKEN / META_PHONE_NUMBER_ID — see .env.example).
// Until those are set whatsappConfigured() is false and the cron logs nudges
// with delivered=false, so preview/staging never break and no message is sent.

const GRAPH_VERSION = 'v21.0'

// Pre-approved Meta template names (SPEC.md). Single body variable {{1}} holds
// the generated message text.
export const MORNING_BRIEF_TEMPLATE = 'paisajaag_morning_brief'

export function whatsappConfigured(): boolean {
  return Boolean(
    process.env.META_ACCESS_TOKEN && process.env.META_PHONE_NUMBER_ID,
  )
}

export interface WhatsAppResult {
  sent: boolean
  messageId?: string
  error?: string
}

// Send a pre-approved WhatsApp template. `bodyParams` fill the template body's
// {{1}}, {{2}}… positional variables, in order.
export async function sendWhatsAppTemplate(
  phone: string,
  templateName: string,
  bodyParams: string[],
  languageCode = 'en',
): Promise<WhatsAppResult> {
  const token = process.env.META_ACCESS_TOKEN
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID
  if (!token || !phoneNumberId) {
    return { sent: false, error: 'whatsapp_not_configured' }
  }

  // Meta expects msisdn digits only (country code + number, no +/spaces).
  const to = phone.replace(/\D/g, '')

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to,
          type: 'template',
          template: {
            name: templateName,
            language: { code: languageCode },
            components: [
              {
                type: 'body',
                parameters: bodyParams.map((text) => ({ type: 'text', text })),
              },
            ],
          },
        }),
      },
    )

    const data = await res.json().catch(() => null)
    if (!res.ok) {
      return { sent: false, error: data?.error?.message ?? `http_${res.status}` }
    }
    return { sent: true, messageId: data?.messages?.[0]?.id }
  } catch (err) {
    return { sent: false, error: err instanceof Error ? err.message : 'fetch_failed' }
  }
}
