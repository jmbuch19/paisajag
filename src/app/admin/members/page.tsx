import { getSupabaseAdmin } from '@/lib/supabase/server'

export const metadata = { title: 'Members — PaisaJag Admin' }
export const dynamic = 'force-dynamic'

// Names, status and onboarding completion only — no financial data, ever
// (MEMORY.md privacy architecture).
const PREVIEW_MEMBERS = [
  { name: 'Asha P.', status: 'active', onboarding: 100 },
  { name: 'Ravi B.', status: 'active', onboarding: 100 },
  { name: 'Meena S.', status: 'active', onboarding: 80 },
  { name: 'Kiran J.', status: 'invited', onboarding: 0 },
]

function shortName(fullName: string): string {
  const [first, ...rest] = fullName.split(' ')
  const lastInitial = rest.length > 0 ? ` ${rest[rest.length - 1][0]}.` : ''
  return `${first}${lastInitial}`
}

async function loadMembers() {
  const admin = getSupabaseAdmin()
  if (!admin) return { members: PREVIEW_MEMBERS, live: false }

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data } = await admin
    .from('profiles')
    .select('full_name, dna_complete, last_login_at, created_at')
    .order('created_at', { ascending: false })

  return {
    live: true,
    members: (data ?? []).map((p) => ({
      name: shortName(p.full_name),
      status:
        p.last_login_at && p.last_login_at >= weekAgo ? 'active' : 'quiet',
      onboarding: p.dna_complete ? 100 : 50,
    })),
  }
}

export default async function AdminMembersPage() {
  const { members, live } = await loadMembers()
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-medium text-gray-900">Members</h1>
      {!live && (
        <p className="text-xs text-amber-800">
          Preview data — Supabase not configured.
        </p>
      )}
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
            {members.map((member, i) => (
              <tr key={`${member.name}-${i}`}>
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
