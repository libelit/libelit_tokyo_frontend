"use client";

import { useEffect, useState, useCallback, Fragment } from "react";
import { developerDrawdownService } from "@/lib/api/developer";
import {
  DrawdownMilestone,
  DrawdownStatistics,
  Project,
} from "@/lib/types/developer";
import { MilestoneStatusBadge } from "@/components/developer/milestone-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function DeveloperDrawdownPage() {
  const [loading, setLoading] = useState(true);
  const [milestones, setMilestones] = useState<DrawdownMilestone[]>([]);
  const [statistics, setStatistics] = useState<DrawdownStatistics | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [viewProofsDialog, setViewProofsDialog] = useState<DrawdownMilestone | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await developerDrawdownService.getDrawdownData();
      setMilestones(data.milestones);
      setStatistics(data.statistics);
      setProjects(data.projects);
    } catch (error) {
      console.error("Failed to fetch drawdown data:", error);
      toast.error("Failed to load drawdown data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleRow = (id: number) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Filter milestones based on selected project and status
  const filteredMilestones = milestones.filter((milestone) => {
    const projectMatch =
      selectedProject === "all" ||
      milestone.project.id.toString() === selectedProject;
    const statusMatch =
      selectedStatus === "all" || milestone.status === selectedStatus;
    return projectMatch && statusMatch;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#E86A33]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Progress Payments</h1>
        <p className="text-gray-600 mt-1">
          Track your submitted invoices and payment status
        </p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Pending Review
                  </p>
                  <p className="text-2xl font-bold text-amber-600">
                    {statistics.pending_review}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {formatCurrency(statistics.pending_amount)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Approved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {statistics.approved_milestones}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {formatCurrency(statistics.approved_amount)} awaiting payment
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Paid</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {statistics.paid_milestones}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {formatCurrency(statistics.paid_amount)} received
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">
                    {statistics.rejected_milestones}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Needs resubmission</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Project
              </label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Status
              </label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="proof_submitted">Pending Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Milestones Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Drawdowns ({filteredMilestones.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMilestones.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No invoices found
              </h3>
              <p className="text-gray-500">
                {milestones.length === 0
                  ? "Submit milestone proofs in your project to raise an invoice."
                  : "No invoices match your current filters."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Milestone</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMilestones.map((milestone) => (
                    <Fragment key={milestone.id}>
                      <TableRow
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleRow(milestone.id)}
                      >
                        <TableCell>
                          {expandedRows.has(milestone.id) ? (
                            <ChevronUp className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {milestone.project.title}
                        </TableCell>
                        <TableCell>
                          <div>
                            <span className="text-gray-500 text-sm">
                              #{milestone.sequence}
                            </span>{" "}
                            {milestone.title}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(Number(milestone.amount))}
                        </TableCell>
                        <TableCell>
                          <MilestoneStatusBadge status={milestone.status} />
                        </TableCell>
                        <TableCell className="text-gray-500">
                          {formatDate(milestone.proof_submitted_at)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewProofsDialog(milestone);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Row */}
                      {expandedRows.has(milestone.id) && (
                        <TableRow>
                          <TableCell colSpan={7} className="bg-gray-50 p-4">
                            <div className="space-y-4">
                              {/* Description */}
                              {milestone.description && (
                                <div>
                                  <h4 className="text-sm font-medium text-gray-700">
                                    Description
                                  </h4>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {milestone.description}
                                  </p>
                                </div>
                              )}

                              {/* Rejection Reason */}
                              {milestone.status === "rejected" &&
                                milestone.rejection_reason && (
                                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <div className="flex items-start gap-2">
                                      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                                      <div>
                                        <h4 className="text-sm font-medium text-red-800">
                                          Rejection Reason
                                        </h4>
                                        <p className="text-sm text-red-700 mt-1">
                                          {milestone.rejection_reason}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                              {/* Payment Info */}
                              {milestone.status === "paid" && (
                                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                                  <div className="flex items-start gap-2">
                                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5" />
                                    <div>
                                      <h4 className="text-sm font-medium text-emerald-800">
                                        Payment Received
                                      </h4>
                                      <p className="text-sm text-emerald-700 mt-1">
                                        Paid on {formatDate(milestone.paid_at)}
                                        {milestone.payment_reference && (
                                          <> • Ref: {milestone.payment_reference}</>
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Dates */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500">Due Date:</span>
                                  <span className="ml-2 font-medium">
                                    {formatDate(milestone.due_date)}
                                  </span>
                                </div>
                                {milestone.approved_at && (
                                  <div>
                                    <span className="text-gray-500">
                                      Approved:
                                    </span>
                                    <span className="ml-2 font-medium">
                                      {formatDate(milestone.approved_at)}
                                    </span>
                                  </div>
                                )}
                                {milestone.paid_at && (
                                  <div>
                                    <span className="text-gray-500">Paid:</span>
                                    <span className="ml-2 font-medium">
                                      {formatDate(milestone.paid_at)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Proofs Dialog */}
      <Dialog
        open={!!viewProofsDialog}
        onOpenChange={() => setViewProofsDialog(null)}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle>
              {viewProofsDialog?.title} - Proofs & Payment
            </DialogTitle>
          </DialogHeader>

          {viewProofsDialog && (
            <div className="space-y-6">
              {/* Milestone Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">
                    {viewProofsDialog.project.title}
                  </span>
                  <MilestoneStatusBadge status={viewProofsDialog.status} />
                </div>
                <div className="text-2xl font-bold text-[#E86A33]">
                  {formatCurrency(Number(viewProofsDialog.amount))}
                </div>
              </div>

              {/* Submitted Proofs */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">
                  Submitted Proofs
                </h3>
                {viewProofsDialog.milestone_proofs &&
                viewProofsDialog.milestone_proofs.length > 0 ? (
                  <div className="space-y-2">
                    {viewProofsDialog.milestone_proofs.map((proof) => (
                      <div
                        key={proof.id}
                        className="flex items-center justify-between p-3 bg-white border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-sm">{proof.title}</p>
                            <p className="text-xs text-gray-500">
                              {proof.proof_type_label} •{" "}
                              {formatFileSize(proof.file_size)}
                            </p>
                          </div>
                        </div>
                        <a
                          href={proof.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#E86A33] hover:underline text-sm flex items-center gap-1"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                ) : viewProofsDialog.proofs &&
                  viewProofsDialog.proofs.length > 0 ? (
                  <div className="space-y-2">
                    {viewProofsDialog.proofs
                      .filter((p) => !p.is_payment_proof)
                      .map((proof) => (
                        <div
                          key={proof.id}
                          className="flex items-center justify-between p-3 bg-white border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-sm">{proof.title}</p>
                              <p className="text-xs text-gray-500">
                                {proof.proof_type_label} •{" "}
                                {formatFileSize(proof.file_size)}
                              </p>
                            </div>
                          </div>
                          <a
                            href={proof.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#E86A33] hover:underline text-sm flex items-center gap-1"
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </a>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No proofs submitted</p>
                )}
              </div>

              {/* Payment Proofs (if paid) */}
              {viewProofsDialog.status === "paid" && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">
                    Payment Confirmation
                  </h3>
                  {viewProofsDialog.payment_proofs &&
                  viewProofsDialog.payment_proofs.length > 0 ? (
                    <div className="space-y-2">
                      {viewProofsDialog.payment_proofs.map((proof) => (
                        <div
                          key={proof.id}
                          className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <DollarSign className="h-5 w-5 text-emerald-600" />
                            <div>
                              <p className="font-medium text-sm">{proof.title}</p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(proof.file_size)}
                              </p>
                            </div>
                          </div>
                          <a
                            href={proof.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:underline text-sm flex items-center gap-1"
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : viewProofsDialog.proofs &&
                    viewProofsDialog.proofs.filter((p) => p.is_payment_proof)
                      .length > 0 ? (
                    <div className="space-y-2">
                      {viewProofsDialog.proofs
                        .filter((p) => p.is_payment_proof)
                        .map((proof) => (
                          <div
                            key={proof.id}
                            className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <DollarSign className="h-5 w-5 text-emerald-600" />
                              <div>
                                <p className="font-medium text-sm">
                                  {proof.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatFileSize(proof.file_size)}
                                </p>
                              </div>
                            </div>
                            <a
                              href={proof.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 hover:underline text-sm flex items-center gap-1"
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </a>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      Payment proof not available
                    </p>
                  )}

                  {viewProofsDialog.payment_reference && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-500">
                        Payment Reference:
                      </span>
                      <span className="ml-2 font-mono text-sm">
                        {viewProofsDialog.payment_reference}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Rejection Reason */}
              {viewProofsDialog.status === "rejected" &&
                viewProofsDialog.rejection_reason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="font-medium text-red-800 mb-2">
                      Rejection Reason
                    </h3>
                    <p className="text-red-700">
                      {viewProofsDialog.rejection_reason}
                    </p>
                  </div>
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
