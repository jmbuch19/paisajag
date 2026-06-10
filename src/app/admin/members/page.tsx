export const metadata = { title: 'Members — PaisaJag Admin' }

// TODO(backend): GET /api/admin/members (names, status, onboarding % —
// no financial data, ever)
const PREVIEW_MEMBERS = [
  { name: 'Asha P.', status: 'active', onboarding: 100 },
  { name: 'Ravi B.', status: 'active', onboarding: 100 },
  { name: 'Meena S.', status: 'active', onboarding: 80 },
  { name: 'Kiran J.', status: 'invited', onboarding: 0 },
]

export default function AdminMembersPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-medium text-gray-900">Members</h1>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b-[0.5px] border-gray-200 text-xs text-gray-400">
              <th className="px-5 py-3 font-medium">Member</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Onboarding</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {PREVIEW_MEMBERS.map((member) => (
              <tr key={member.name}>
                <td className="px-5 py-3 font-medium text-gray-900">
                  {member.name}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`tag ${
                      member.status === 'active' ? 'tag-healthy' : 'tag-neutral'
                    }`}
                  >
                    {member.status}
                  </span>
                </td>
                <td className="px-5 py-3 tabular-nums">
                  {member.onboarding}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
