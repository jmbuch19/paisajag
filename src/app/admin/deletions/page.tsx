export const metadata = { title: 'Deletions — PaisaJag Admin' }

// TODO(backend): GET /api/admin/deletions
export default function AdminDeletionsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-medium text-gray-900">Deletion requests</h1>
      <div className="card py-10 text-center text-sm text-gray-400">
        No pending deletion requests. Completed deletions are not listed —
        deleted means deleted.
      </div>
    </div>
  )
}
