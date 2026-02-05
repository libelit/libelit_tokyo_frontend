import { DeveloperHeader } from "@/components/developer/developer-header";

export default function DeveloperDashboardPage() {
  return (
    <div className="space-y-6">
      <DeveloperHeader title="Developer Dashboard" />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Stats Cards */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Active Projects</h3>
          <p className="mt-2 text-3xl font-bold">0</p>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Total Funding</h3>
          <p className="mt-2 text-3xl font-bold">$0</p>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Pending Requests</h3>
          <p className="mt-2 text-3xl font-bold text-[#E86A33]">0</p>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <p className="text-gray-500 text-center py-8">No recent activity</p>
      </div>
    </div>
  );
}
