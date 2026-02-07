"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Building2,
  MapPin,
  DollarSign,
  FileCheck,
  Loader2,
} from "lucide-react";
import { DeveloperHeader } from "@/components/developer/developer-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { projectsService } from "@/lib/api/developer";
import { ProjectType, CreateProjectRequest } from "@/lib/types/developer";
import { toast } from "sonner";

const projectTypes: { value: ProjectType; label: string }[] = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "mixed_use", label: "Mixed-Use" },
  { value: "industrial", label: "Industrial" },
  { value: "land", label: "Land" },
];

const steps = [
  { id: 1, title: "Basic Info", icon: Building2 },
  { id: 2, title: "Location", icon: MapPin },
  { id: 3, title: "Financials", icon: DollarSign },
  { id: 4, title: "Review", icon: FileCheck },
];

interface ProjectFormData {
  // Step 1: Basic Info
  title: string;
  projectType: ProjectType | "";
  description: string;
  // Step 2: Location
  address: string;
  city: string;
  country: string;
  // Step 3: Financials
  fundingGoal: string;
  minInvestment: string;
  expectedReturn: string;
  loanTermMonths: string;
  ltvRatio: string;
}

type ProjectFormErrors = {
  [K in keyof ProjectFormData]?: string;
};

const initialFormData: ProjectFormData = {
  title: "",
  projectType: "",
  description: "",
  address: "",
  city: "",
  country: "Australia",
  fundingGoal: "",
  minInvestment: "",
  expectedReturn: "",
  loanTermMonths: "",
  ltvRatio: "",
};

export default function CreateProjectPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProjectFormData>(initialFormData);
  const [errors, setErrors] = useState<ProjectFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFormData = (field: keyof ProjectFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: ProjectFormErrors = {};

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = "Project title is required";
      if (!formData.projectType) newErrors.projectType = "Project type is required";
      if (!formData.description.trim()) newErrors.description = "Description is required";
    } else if (step === 2) {
      if (!formData.address.trim()) newErrors.address = "Address is required";
      if (!formData.city.trim()) newErrors.city = "City is required";
      if (!formData.country.trim()) newErrors.country = "Country is required";
    } else if (step === 3) {
      if (!formData.fundingGoal) newErrors.fundingGoal = "Funding goal is required";
      if (!formData.minInvestment) newErrors.minInvestment = "Minimum investment is required";
      if (!formData.expectedReturn) newErrors.expectedReturn = "Expected return is required";
      if (!formData.loanTermMonths) newErrors.loanTermMonths = "Loan term is required";
      if (!formData.ltvRatio) newErrors.ltvRatio = "LTV ratio is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const buildProjectRequest = (): CreateProjectRequest => {
    return {
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
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    try {
      const response = await projectsService.create(buildProjectRequest());
      if (response.data?.success) {
        toast.success("Project saved as draft");
        router.push("/developer/dashboard/projects");
      } else {
        toast.error(response.data?.message || "Failed to save project");
      }
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error("Failed to save project");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await projectsService.create(buildProjectRequest());
      if (response.data?.success) {
        toast.success("Project created successfully");
        // Navigate to project details page to upload documents
        router.push(`/developer/dashboard/projects/${response.data.data.id}`);
      } else {
        toast.error(response.data?.message || "Failed to create project");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <DeveloperHeader title="Create New Project" />

      {/* Back Link */}
      <Link
        href="/developer/dashboard/projects"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Projects
      </Link>

      {/* Progress Steps */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            const StepIcon = step.icon;

            return (
              <div
                key={step.id}
                className={cn(
                  "flex flex-col items-center flex-1",
                  index < steps.length - 1 && "relative"
                )}
              >
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "absolute top-5 left-1/2 w-full h-0.5",
                      isCompleted ? "bg-[#E86A33]" : "bg-gray-200"
                    )}
                  />
                )}

                {/* Step Circle */}
                <div
                  className={cn(
                    "relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                    isCompleted
                      ? "bg-[#E86A33] text-white"
                      : isCurrent
                      ? "bg-[#E86A33] text-white"
                      : "bg-gray-200 text-gray-500"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <StepIcon className="h-5 w-5" />
                  )}
                </div>

                {/* Step Label */}
                <span
                  className={cn(
                    "text-xs mt-2 text-center",
                    isCurrent ? "text-[#E86A33] font-medium" : "text-gray-500"
                  )}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-1">Basic Information</h2>
              <p className="text-sm text-gray-500">
                Provide the basic details about your project.
              </p>
            </div>

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
        )}

        {/* Step 2: Location */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-1">Project Location</h2>
              <p className="text-sm text-gray-500">
                Where is your project located?
              </p>
            </div>

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
        )}

        {/* Step 3: Financials */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-1">Financial Details</h2>
              <p className="text-sm text-gray-500">
                Provide the financial information for your project.
              </p>
            </div>

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
                  Lower LTV means lower risk for lenders. Industry standard is typically 65-80%.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-1">Review Your Project</h2>
              <p className="text-sm text-gray-500">
                Please review all the information before saving.
              </p>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-[#E86A33]" />
                    Basic Information
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(1)}
                  >
                    Edit
                  </Button>
                </div>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-gray-500">Title</dt>
                    <dd className="font-medium">{formData.title}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Type</dt>
                    <dd className="font-medium capitalize">{formData.projectType.replace("_", " ")}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-gray-500">Description</dt>
                    <dd className="font-medium">{formData.description}</dd>
                  </div>
                </dl>
              </div>

              {/* Location */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#E86A33]" />
                    Location
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(2)}
                  >
                    Edit
                  </Button>
                </div>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div className="col-span-2">
                    <dt className="text-gray-500">Address</dt>
                    <dd className="font-medium">{formData.address}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">City</dt>
                    <dd className="font-medium">{formData.city}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Country</dt>
                    <dd className="font-medium">{formData.country}</dd>
                  </div>
                </dl>
              </div>

              {/* Financials */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-[#E86A33]" />
                    Financial Details
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(3)}
                  >
                    Edit
                  </Button>
                </div>
                <dl className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <dt className="text-gray-500">Funding Goal</dt>
                    <dd className="font-medium">${Number(formData.fundingGoal).toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Min Investment</dt>
                    <dd className="font-medium">${Number(formData.minInvestment).toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Expected Return</dt>
                    <dd className="font-medium">{formData.expectedReturn}%</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Loan Term</dt>
                    <dd className="font-medium">{formData.loanTermMonths} months</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">LTV Ratio</dt>
                    <dd className="font-medium">{formData.ltvRatio}%</dd>
                  </div>
                </dl>
              </div>

              {/* Next Steps Info */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h3 className="font-medium text-amber-800 mb-2">What happens next?</h3>
                <ol className="text-sm text-amber-700 list-decimal list-inside space-y-1">
                  <li>Your project will be saved as a draft</li>
                  <li>Upload the required loan application documents</li>
                  <li>Submit your project for review</li>
                  <li>Our team will review and approve your project</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <div>
          {currentStep > 1 && (
            <Button variant="outline" onClick={handlePrevious} disabled={isSubmitting}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
          )}
        </div>
        <div className="flex gap-4">
          {currentStep === steps.length ? (
            <>
              <Button variant="outline" onClick={handleSaveDraft} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save as Draft"
                )}
              </Button>
              <Button
                className="bg-[#E86A33] hover:bg-[#d55a25]"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Save & Continue to Documents"
                )}
              </Button>
            </>
          ) : (
            <Button
              className="bg-[#E86A33] hover:bg-[#d55a25]"
              onClick={handleNext}
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
