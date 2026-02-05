"use client";

import Link from "next/link";
import { Building2, DollarSign, Clock, Plus, ArrowRight } from "lucide-react";
import { DeveloperHeader } from "@/components/developer/developer-header";
import { KybStatusBanner, KybStatus } from "@/components/developer/kyb-status-banner";
import { Button } from "@/components/ui/button";

// Mock data - will be replaced with API data
const mockKybStatus: KybStatus = "not_started";
const mockStats = {
  activeProjects: 0,
  totalFunding: 0,
  pendingRequests: 0,
};
const mockRecentProjects: Array<{
  id: string;
  title: string;
  status: string;
  fundingGoal: number;
  createdAt: string;
}> = [];

export default function DeveloperDashboardPage() {
  const kybStatus = mockKybStatus;
  const isKybApproved = kybStatus === "approved";

  return (
    <div className="space-y-6">
      <DeveloperHeader title="Developer Dashboard" />

      {/* KYB Status Banner */}
      <KybStatusBanner status={kybStatus} />

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Active Projects</p>
              <p className="text-2xl font-bold">{mockStats.activeProjects}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Funding</p>
              <p className="text-2xl font-bold">${mockStats.totalFunding.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
              <Clock className="h-6 w-6 text-[#E86A33]" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Requests</p>
              <p className="text-2xl font-bold text-[#E86A33]">{mockStats.pendingRequests}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {isKybApproved && (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link href="/developer/dashboard/projects/new">
              <Button className="bg-[#E86A33] hover:bg-[#d55a25]">
                <Plus className="mr-2 h-4 w-4" />
                Create New Project
              </Button>
            </Link>
            <Link href="/developer/dashboard/projects">
              <Button variant="outline">
                View All Projects
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Recent Projects */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Projects</h2>
          {mockRecentProjects.length > 0 && (
            <Link href="/developer/dashboard/projects" className="text-sm text-[#E86A33] hover:underline">
              View all
            </Link>
          )}
        </div>
        {mockRecentProjects.length > 0 ? (
          <div className="space-y-4">
            {mockRecentProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div>
                  <h3 className="font-medium">{project.title}</h3>
                  <p className="text-sm text-gray-500">
                    ${project.fundingGoal.toLocaleString()} goal
                  </p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                  {project.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {isKybApproved
                ? "No projects yet. Create your first project to get started."
                : "Complete your KYB verification to start creating projects."}
            </p>
            {isKybApproved ? (
              <Link href="/developer/dashboard/projects/new">
                <Button className="bg-[#E86A33] hover:bg-[#d55a25]">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Project
                </Button>
              </Link>
            ) : (
              <Link href="/developer/dashboard/kyb">
                <Button className="bg-[#E86A33] hover:bg-[#d55a25]">
                  Start KYB Verification
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
