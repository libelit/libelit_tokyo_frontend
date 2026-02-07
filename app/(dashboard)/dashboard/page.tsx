import { DashboardHeader } from "@/components/layout/dashboard-header";
import { ConnectWallet } from "@/components/dashboard/connect-wallet";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { LoansChart } from "@/components/dashboard/loans-chart";
import { PortfolioTable } from "@/components/dashboard/portfolio-table";
import { ProjectCard } from "@/components/dashboard/project-card";
import {Separator} from "@/components/ui/separator";

// Mock data - replace with real data from API later
const chartData = [
  { date: "Jan", value: 0 },
  { date: "Feb", value: 0 },
  { date: "Mar", value: 0 },
  { date: "Apr", value: 0 },
  { date: "Mai", value: 0 },
  { date: "Jun", value: 0 },
];

const mockProject = {
  id: "1",
  name: "Project Name",
  location: "City, Country",
  description:
    "Our investment features four semi-detached houses. Our investment features four semi-detached houses.",
  price: 312500,
  downPayment: "12.5%",
  projectValue: 2500000,
  loanValue: 1000000,
  loanDuration: 216,
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader title="Lender Dashboard" subtitle="Superfund" />

      <ConnectWallet />

      <Separator className="my-4 bg-[#B9C2CA]" />

      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
        <div className="space-y-5">
          {/*Stats Card*/}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Loans value</h2>
            <StatsCards totalBalance={0} submittedBids={0} approvedLoans={0} />
          </div>
          {/*Loan Chart*/}
          <div className="">
            <LoansChart data={chartData} />
          </div>
          {/*Portfolio Table*/}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Portfolio summary</h2>
            <PortfolioTable projects={[]} />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">New Project</h2>
          <ProjectCard project={mockProject} />
        </div>
      </div>
    </div>
  );
}
