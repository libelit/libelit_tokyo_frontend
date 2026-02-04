import { Card, CardContent } from "@/components/ui/card";
import { Clock, FileText, Gavel, CircleDollarSign } from "lucide-react";
import Image from "next/image";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  valueColor?: string;
}

function StatCard({ title, value, icon, valueColor = "text-black" }: StatCardProps) {
  return (
    <Card className=" bg-white shadow-none border-none">
      <CardContent className="p-3 space-y-4">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-base">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <CircleDollarSign className={`h-5 w-5 ${valueColor === "text-[#E86A33]" ? "text-[#E86A33]" : "text-gray-400"}`} />
          <span className={`text-2xl font-bold ${valueColor}`}>{value}</span>
        </div>
      </CardContent>
    </Card>
  );
}

interface StatsCardsProps {
  totalBalance: number;
  submittedBids: number;
  approvedLoans: number;
}

export function StatsCards({
  totalBalance,
  submittedBids,
  approvedLoans,
}: StatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        title="Total balance"
        value={totalBalance}
        icon={<Image src="/images/pie-chart.png" alt="Libelit" width={23} height={23} />}
      />
      <StatCard
        title="Submitted Bids"
        value={submittedBids}
        icon={<Image src="/images/bid-logo.png" alt="Libelit" width={25} height={25} />}
      />
      <StatCard
        title="Approved Loans"
        value={approvedLoans}
        icon={<Image src="/images/auction.png" alt="Libelit" width={23} height={23} />}
        valueColor="text-[#E86A33]"
      />
    </div>
  );
}
