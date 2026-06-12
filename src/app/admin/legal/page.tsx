import { LEGAL_DOCUMENT_VERSION } from '@/lib/constants'
import { getSupabaseAdmin } from '@/lib/supabase/server'

export const metadata = { title: 'Legal Log — PaisaJag Admin' }
export const dynamic = 'force-dynamic'

const PREVIEW_LOG = [
  { member: 'Asha P.', version: LEGAL_DOCUMENT_VERSION, at: '2026-06-02 09:14' },
  { member: 'Ravi B.', version: LEGAL_DOCUMENT_VERSION, at: '2026-06-03 19:47' },
  { member: 'Meena S.', version: LEGAL_DOCUMENT_VERSION, at: '2026-06-05 07:22' },
]

async function loadLog() {
  const admin = getSupabaseAdmin()
  if (!admin) return { rows: PREVIEW_LOG, live: false }

  const [ackRes, profileRes] = await Promise.all([
    admin
      .from('legal_acknowledgements')
      .select('user_id, document_version, acknowledged_at')
      .order('acknowledged_at', { ascending: false })
      .limit(200),
    admin.from('profiles').select('user_id, full_name'),
  ])

  const names = new Map(
    (profileRes.data ?? []).map((p) => [p.user_id, p.full_name]),
  )

  return {
    live: true,
    rows: (ackRes.data ?? []).map((a) => ({
      member: names.get(a.user_id) ?? '(profile pending)',
      version: a.document_version,
      at: new Date(a.acknowledged_at).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Kolkata',
      }),
    })),
  }
}

export default async function AdminLegalPage() {
  const { rows, live } = await loadLog()
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-medium text-gray-900">
        Disclaimer acknowledgements
      </h1>
      <p className="text-sm text-gray-600">
        Current document version:{' '}
        <span className="font-medium text-gray-900">
          {LEGAL_DOCUMENT_VERSION}
        </span>
      </p>
      {!live && (
        <p className="text-xs text-amber-800">
          Preview data — Supabase not configured.
        </p>
      )}
      <div className="card p-0">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b-[0.5px] border-gray-200 text-xs text-gray-400">
              <th className="px-5 py-3 font-medium">Member</th>
              <th className="px-5 py-3 font-medium">Version</th>
              <th className="px-5 py-3 font-medium">Acknowledged</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row, i) => (
              <tr key={`${row.member}-${i}`}>
                <td className="px-5 py-3 font-medium text-gray-900">
                  {row.member}
                </td>
                <td className="px-5 py-3">{row.version}</td>
                <td className="px-5 py-3 tabular-nums">{row.at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
