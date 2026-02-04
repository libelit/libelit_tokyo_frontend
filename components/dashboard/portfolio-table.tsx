import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface PortfolioProject {
  id: string;
  name: string;
  noOfTokens: number;
  tokenValue: number;
  totalValue: number;
  fulfilment: number;
}

interface PortfolioTableProps {
  projects: PortfolioProject[];
}

export function PortfolioTable({ projects }: PortfolioTableProps) {
  return (
    <div className="overflow-hidden rounded-xl ">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-200 hover:bg-transparent bg-white">
            <TableHead className="py-4 font-medium text-gray-600">Project</TableHead>
            <TableHead className="py-4 text-center font-medium text-gray-600">No. of tokens</TableHead>
            <TableHead className="py-4 text-center font-medium text-gray-600">Token value</TableHead>
            <TableHead className="py-4 text-center font-medium text-gray-600">Total value</TableHead>
            <TableHead className="py-4 text-center font-medium text-gray-600">Fulfilled</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.length === 0 ? (
            <>
              <TableRow className="border-b border-gray-200 hover:bg-transparent">
                <TableCell colSpan={5} className="py-8 text-center ">
                  <span className="text-base text-gray-800">
                    You don&apos;t have any projects yet.
                  </span>
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="h-16 "></TableCell>
              </TableRow>
            </>
          ) : (
            projects.map((project) => (
              <TableRow key={project.id} className="border-b border-gray-200 ">
                <TableCell className="py-4 font-medium">{project.name}</TableCell>
                <TableCell className="py-4 text-center">{project.noOfTokens}</TableCell>
                <TableCell className="py-4 text-center">
                  ${project.tokenValue.toLocaleString()}
                </TableCell>
                <TableCell className="py-4 text-center">
                  ${project.totalValue.toLocaleString()}
                </TableCell>
                <TableCell className="py-4 text-center">{project.fulfilment}%</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
