import { LEGAL_DOCUMENT_VERSION } from '@/lib/constants'

export const metadata = { title: 'Legal Log — PaisaJag Admin' }

// TODO(backend): read legal_acknowledgements via service role
const PREVIEW_LOG = [
  { member: 'Asha P.', version: LEGAL_DOCUMENT_VERSION, at: '2026-06-02 09:14' },
  { member: 'Ravi B.', version: LEGAL_DOCUMENT_VERSION, at: '2026-06-03 19:47' },
  { member: 'Meena S.', version: LEGAL_DOCUMENT_VERSION, at: '2026-06-05 07:22' },
]

export default function AdminLegalPage() {
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
            {PREVIEW_LOG.map((row) => (
              <tr key={row.member}>
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
