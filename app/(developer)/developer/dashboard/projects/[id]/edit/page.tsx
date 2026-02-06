"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  MapPin,
  DollarSign,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { DeveloperHeader } from "@/components/developer/developer-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { projectsService } from "@/lib/api/developer";
import { Project, ProjectType, UpdateProjectRequest } from "@/lib/types/developer";
import { toast } from "sonner";

const projectTypes: { value: ProjectType; label: string }[] = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "mixed_use", label: "Mixed-Use" },
  { value: "industrial", label: "Industrial" },
  { value: "land", label: "Land" },
];

interface ProjectFormData {
  title: string;
  projectType: ProjectType | "";
  description: string;
  address: string;
  city: string;
  country: string;
  fundingGoal: string;
  minInvestment: string;
  expectedReturn: string;
  loanTermMonths: string;
  ltvRatio: string;
}

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = Number(params.id);

  const [project, setProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>({
    title: "",
    projectType: "",
    description: "",
    address: "",
    city: "",
    country: "",
    fundingGoal: "",
    minInvestment: "",
    expectedReturn: "",
    loanTermMonths: "",
    ltvRatio: "",
  });
  const [errors, setErrors] = useState<Partial<ProjectFormData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      setIsLoading(true);
      try {
        const response = await projectsService.get(projectId);
        if (response.data?.success) {
          const p = response.data.data;
          setProject(p);

          // Check if project can be edited
          if (p.status !== "draft" && p.status !== "rejected") {
            toast.error("This project cannot be edited");
            router.push(`/developer/dashboard/projects/${projectId}`);
            return;
          }

          // Populate form data
          setFormData({
            title: p.title,
            projectType: p.project_type,
            description: p.description || "",
            address: p.address || "",
            city: p.city || "",
            country: p.country || "",
            fundingGoal: p.funding_goal.toString(),
            minInvestment: p.min_investment.toString(),
            expectedReturn: p.expected_return.toString(),
            loanTermMonths: p.loan_term_months.toString(),
            ltvRatio: p.ltv_ratio?.toString() || "",
          });
        } else {
          toast.error("Failed to load project");
          router.push("/developer/dashboard/projects");
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        toast.error("Failed to load project");
        router.push("/developer/dashboard/projects");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId, router]);

  const updateFormData = (field: keyof ProjectFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ProjectFormData> = {};

    if (!formData.title.trim()) newErrors.title = "Project title is required";
    if (!formData.projectType) newErrors.projectType = "Project type is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.country.trim()) newErrors.country = "Country is required";
    if (!formData.fundingGoal) newErrors.fundingGoal = "Funding goal is required";
    if (!formData.minInvestment) newErrors.minInvestment = "Minimum investment is required";
    if (!formData.expectedReturn) newErrors.expectedReturn = "Expected return is required";
    if (!formData.loanTermMonths) newErrors.loanTermMonths = "Loan term is required";
    if (!formData.ltvRatio) newErrors.ltvRatio = "LTV ratio is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const updateData: UpdateProjectRequest = {
        title: formData.title,
        description: formData.description,
        project_type: formData.projectType as ProjectType,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        funding_goal: parseFloat(formData.fundingGoal),
        min_investment: parseFloat(formData.minInvestment),
        expected_return: parseFloat(formData.expectedReturn),
        loan_term_months: parseInt(formData.loanTermMonths),
        ltv_ratio: parseFloat(formData.ltvRatio),
      };

      const response = await projectsService.update(projectId, updateData);
      if (response.data?.success) {
        toast.success("Project updated successfully");
        router.push(`/developer/dashboard/projects/${projectId}`);
      } else {
        toast.error(response.data?.message || "Failed to update project");
      }
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Failed to update project");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <DeveloperHeader title="Edit Project" />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#E86A33]" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <DeveloperHeader title="Edit Project" />
        <div className="rounded-xl border bg-white p-12 text-center">
          <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Project not found</h2>
          <Link href="/developer/dashboard/projects">
            <Button variant="outline">Back to Projects</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DeveloperHeader title="Edit Project" />

      {/* Back Link */}
      <Link
        href={`/developer/dashboard/projects/${projectId}`}
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Project Details
      </Link>

      {/* Rejection Notice */}
      {project.status === "rejected" && project.rejection_reason && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800">Project Rejected</h3>
              <p className="text-sm text-red-700 mt-1">{project.rejection_reason}</p>
              <p className="text-sm text-red-600 mt-2">
                Please address the issues and resubmit your project.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form Sections */}
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#E86A33]" />
            Basic Information
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Update the basic details about your project.
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Sunset Heights Residential Complex"
                value={formData.title}
                onChange={(e) => updateFormData("title", e.target.value)}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <Label htmlFor="projectType">Project Type *</Label>
              <select
                id="projectType"
                value={formData.projectType}
                onChange={(e) => updateFormData("projectType", e.target.value)}
                className={cn(
                  "w-full px-3 py-2 border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#E86A33]",
                  errors.projectType ? "border-red-500" : "border-input"
                )}
              >
                <option value="">Select project type</option>
                {projectTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.projectType && (
                <p className="text-sm text-red-500 mt-1">{errors.projectType}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Provide a detailed description of your project..."
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                className={cn(
                  "min-h-[120px]",
                  errors.description ? "border-red-500" : ""
                )}
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">{errors.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#E86A33]" />
            Project Location
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Where is your project located?
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="address">Street Address *</Label>
              <Input
                id="address"
                placeholder="e.g., 123 Main Street"
                value={formData.address}
                onChange={(e) => updateFormData("address", e.target.value)}
                className={errors.address ? "border-red-500" : ""}
              />
              {errors.address && (
                <p className="text-sm text-red-500 mt-1">{errors.address}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="e.g., Sydney"
                  value={formData.city}
                  onChange={(e) => updateFormData("city", e.target.value)}
                  className={errors.city ? "border-red-500" : ""}
                />
                {errors.city && (
                  <p className="text-sm text-red-500 mt-1">{errors.city}</p>
                )}
              </div>

              <div>
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  placeholder="e.g., Australia"
                  value={formData.country}
                  onChange={(e) => updateFormData("country", e.target.value)}
                  className={errors.country ? "border-red-500" : ""}
                />
                {errors.country && (
                  <p className="text-sm text-red-500 mt-1">{errors.country}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Financial Details */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-[#E86A33]" />
            Financial Details
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Update the financial information for your project.
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fundingGoal">Funding Goal ($) *</Label>
                <Input
                  id="fundingGoal"
                  type="number"
                  placeholder="e.g., 2500000"
                  value={formData.fundingGoal}
                  onChange={(e) => updateFormData("fundingGoal", e.target.value)}
                  className={errors.fundingGoal ? "border-red-500" : ""}
                />
                {errors.fundingGoal && (
                  <p className="text-sm text-red-500 mt-1">{errors.fundingGoal}</p>
                )}
              </div>

              <div>
                <Label htmlFor="minInvestment">Minimum Investment ($) *</Label>
                <Input
                  id="minInvestment"
                  type="number"
                  placeholder="e.g., 1000"
                  value={formData.minInvestment}
                  onChange={(e) => updateFormData("minInvestment", e.target.value)}
                  className={errors.minInvestment ? "border-red-500" : ""}
                />
                {errors.minInvestment && (
                  <p className="text-sm text-red-500 mt-1">{errors.minInvestment}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="expectedReturn">Expected Return (%) *</Label>
                <Input
                  id="expectedReturn"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 12"
                  value={formData.expectedReturn}
                  onChange={(e) => updateFormData("expectedReturn", e.target.value)}
                  className={errors.expectedReturn ? "border-red-500" : ""}
                />
                {errors.expectedReturn && (
                  <p className="text-sm text-red-500 mt-1">{errors.expectedReturn}</p>
                )}
              </div>

              <div>
                <Label htmlFor="loanTermMonths">Loan Term (months) *</Label>
                <Input
                  id="loanTermMonths"
                  type="number"
                  placeholder="e.g., 24"
                  value={formData.loanTermMonths}
                  onChange={(e) => updateFormData("loanTermMonths", e.target.value)}
                  className={errors.loanTermMonths ? "border-red-500" : ""}
                />
                {errors.loanTermMonths && (
                  <p className="text-sm text-red-500 mt-1">{errors.loanTermMonths}</p>
                )}
              </div>

              <div>
                <Label htmlFor="ltvRatio">LTV Ratio (%) *</Label>
                <Input
                  id="ltvRatio"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 70"
                  value={formData.ltvRatio}
                  onChange={(e) => updateFormData("ltvRatio", e.target.value)}
                  className={errors.ltvRatio ? "border-red-500" : ""}
                />
                {errors.ltvRatio && (
                  <p className="text-sm text-red-500 mt-1">{errors.ltvRatio}</p>
                )}
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>LTV Ratio (Loan-to-Value):</strong> The loan amount as a percentage of the property&apos;s value.
                Lower LTV means lower risk for investors. Industry standard is typically 65-80%.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-4 border-t">
        <Link href={`/developer/dashboard/projects/${projectId}`}>
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button
          className="bg-[#E86A33] hover:bg-[#d55a25]"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
}
