"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Building2, Calendar, User, MapPin, FileText, CheckCircle2, Circle, Play, ChevronLeft, ChevronRight, ArrowRight, X, XCircle, Loader2, ExternalLink, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoanProposalModal, LoanProposalFormData } from "@/components/dashboard/loan-proposal-modal";
import { loanProposalsService, LoanProposal, SecurityPackageType } from "@/lib/api/loan-proposals";
import {
  lenderProjectsService,
  lenderProjectDocumentsService,
  lenderMilestonesService,
} from "@/lib/api";
import type {
  Document,
  ProjectMilestone,
  MilestoneStatistics,
} from "@/lib/types/developer";
import type { LenderProject } from "@/lib/types/lender";
import { toast } from "sonner";

// Hardcoded data for fields not available in API
const hardcodedData = {
  ltv: "60%",
  loanType: "Construction",
  loanMaturity: "30 Oct 2024", // Fallback if not calculated
  team: {
    name: "Project Developer",
    role: "Contractor",
    bio: "Experienced developer with a track record of successful real estate projects.",
  },
  locationDescription: "This development is strategically located with easy access to public transportation, schools, shopping centers, and recreational facilities. The neighborhood is known for its family-friendly atmosphere and growing community.",
};

// Helper function to format date
function formatDate(dateStr: string | null): string {
  if (!dateStr) return "TBD";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = Number(params.id);

  // Project state
  const [project, setProject] = useState<LenderProject | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [milestoneStats, setMilestoneStats] = useState<MilestoneStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs for each section
  const aboutRef = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const documentsRef = useRef<HTMLDivElement>(null);

  // Active tab state
  const [activeTab, setActiveTab] = useState("about");

  // Gallery state
  const [aboutImageIndex, setAboutImageIndex] = useState(0);
  const [showVRTour, setShowVRTour] = useState(false);
  const [showLiveCamera, setShowLiveCamera] = useState(false);
  const [showLoanProposalModal, setShowLoanProposalModal] = useState(false);
  const [proposalSubmitted, setProposalSubmitted] = useState(false);

  // Progress Gallery state (uses same photos as about section)
  const [progressImageIndex, setProgressImageIndex] = useState(0);

  // Proposal state
  const [proposal, setProposal] = useState<LoanProposal | null>(null);
  const [isLoadingProposal, setIsLoadingProposal] = useState(true);

  // Mock lender ID - in real app this would come from auth context
  const MOCK_LENDER_ID = "lender-1";

  // Fetch project data
  const fetchProject = useCallback(async () => {
    try {
      const response = await lenderProjectsService.get(projectId);
      if (response.data?.success) {
        setProject(response.data.data);
      } else {
        setError("Project not found");
      }
    } catch (err) {
      console.error("Error fetching project:", err);
      setError("Failed to load project");
    }
  }, [projectId]);

  // Fetch documents
  const fetchDocuments = useCallback(async () => {
    try {
      const response = await lenderProjectDocumentsService.list(projectId);
      if (response.data?.success) {
        setDocuments(response.data.data.documents || []);
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
    }
  }, [projectId]);

  // Fetch milestones
  const fetchMilestones = useCallback(async () => {
    try {
      const response = await lenderMilestonesService.list(projectId);
      if (response.data?.success) {
        setMilestones(response.data.data.milestones || []);
        setMilestoneStats(response.data.data.statistics || null);
      }
    } catch (err) {
      console.error("Error fetching milestones:", err);
    }
  }, [projectId]);

  // Load all data on mount
  // Note: Photos are now included inline with project data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchProject(), fetchDocuments(), fetchMilestones()]);
      setIsLoading(false);
    };
    if (projectId) {
      loadData();
    }
  }, [projectId, fetchProject, fetchDocuments, fetchMilestones]);

  // Fetch existing proposal on page load
  const fetchProposal = useCallback(async () => {
    if (!projectId) return;
    setIsLoadingProposal(true);
    try {
      const result = await loanProposalsService.getByProjectAndLender(projectId.toString(), MOCK_LENDER_ID);
      if (result?.success && result.data) {
        setProposal(result.data);
        setProposalSubmitted(true);
      }
    } catch (error) {
      console.error("Error fetching proposal:", error);
    } finally {
      setIsLoadingProposal(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProposal();
  }, [fetchProposal]);

  // Gallery images from project's inline photos or fallback
  const projectPhotos = project?.photos || [];
  const aboutGalleryImages = projectPhotos.length > 0
    ? projectPhotos.map((photo) => ({
        id: photo.id,
        title: photo.title || "Project image",
        src: photo.file_url,
      }))
    : [
        { id: 1, title: "Front view", src: "/images/house.png" },
        { id: 2, title: "Side view", src: "/images/house.png" },
        { id: 3, title: "Interior", src: "/images/house.png" },
      ];

  const nextAboutImage = () => {
    setAboutImageIndex((prev) => (prev + 1) % aboutGalleryImages.length);
  };

  const prevAboutImage = () => {
    setAboutImageIndex((prev) => (prev - 1 + aboutGalleryImages.length) % aboutGalleryImages.length);
  };

  const nextProgressImage = () => {
    setProgressImageIndex((prev) => (prev + 1) % aboutGalleryImages.length);
  };

  const prevProgressImage = () => {
    setProgressImageIndex((prev) => (prev - 1 + aboutGalleryImages.length) % aboutGalleryImages.length);
  };

  const handleLoanProposalSubmit = async (data: LoanProposalFormData) => {
    if (!project) return;
    try {
      const response = await loanProposalsService.create(
        {
          projectId: project.id.toString(),
          amountOffered: parseFloat(data.amountOffered),
          currency: data.currency,
          interestRate: parseFloat(data.interestRate),
          maturityDate: data.maturityDate,
          securityPackage: data.securityPackage as SecurityPackageType[],
          maxLTV: parseFloat(data.maxLTV),
          bidExpiry: data.bidExpiry,
          conditions: data.conditions || undefined,
        },
        MOCK_LENDER_ID,
        "First National Bank",
        data.documents
      );

      if (response.success) {
        setProposal(response.data);
        setProposalSubmitted(true);
        toast.success("Loan proposal submitted successfully");
      } else {
        toast.error(response.message || "Failed to submit proposal");
      }
    } catch (error) {
      console.error("Error submitting proposal:", error);
      toast.error("Failed to submit proposal");
    }
  };

  const tabs = [
    { id: "about", label: "About project", ref: aboutRef },
    { id: "team", label: "Project team", ref: teamRef },
    { id: "gallery", label: "Project gallery", ref: galleryRef },
    { id: "location", label: "Location", ref: locationRef },
    { id: "documents", label: "Documentation", ref: documentsRef },
  ];

  const scrollToSection = (tabId: string, ref: React.RefObject<HTMLDivElement | null>) => {
    setActiveTab(tabId);
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#E86A33]" />
      </div>
    );
  }

  // Error state
  if (error || !project) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/marketplace"
            className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-gray-600" />
          </Link>
          <h1 className="text-xl font-semibold">Project Details</h1>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <Building2 className="h-12 w-12 text-red-300 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error || "Project not found"}</p>
          <Button onClick={() => router.push("/dashboard/marketplace")} variant="outline">
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  // Derived values from project
  const location = [project.city, project.country].filter(Boolean).join(", ") || "Location not set";
  const fullAddress = [project.address, project.city, project.country].filter(Boolean).join(", ") || location;
  const developmentValue = Math.round(project.loan_amount * 1.25); // Estimate
  const heroImage = project.cover_photo_url || (project.photos?.[0]?.file_url) || "/images/house.png";

  return (
    <div className="w-full">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/marketplace"
            className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-gray-600" />
          </Link>
          <h1 className="text-xl font-semibold">Project Details</h1>
        </div>

        {/* Hero Image with Overlay Title */}
        <div className="rounded-xl border-none bg-white">
          <div className="relative overflow-hidden">
            {/* Main Image */}
            <div className="relative aspect-[16/9] w-full bg-gray-100">
              <Image
                src={heroImage}
                alt={project.title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            {/* Overlay Title at Bottom */}
            <div className="absolute bottom-0 left-0 right-0 bg-gray-200 p-2">
              <h2 className="text-base font-bold">
                {project.title} | {project.uuid?.slice(0, 8).toUpperCase() || `PRJ-${project.id}`} | {location}
              </h2>
            </div>
          </div>

          {/* Project Stats Row */}
          <div className="grid grid-cols-3 gap-4 p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
                <Play className="h-4 w-4 text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Construction Start</p>
                <p className="text-sm font-medium">{formatDate(project.construction_start_date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
                <Calendar className="h-4 w-4 text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Construction Finish</p>
                <p className="text-sm font-medium">{formatDate(project.construction_end_date)}</p>
              </div>
            </div>
          </div>

          {/* Investment Stats Card */}
          <div className="p-5">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {/*<div>*/}
                {/*  <p className="text-xs text-gray-500 mb-1">Development Value</p>*/}
                {/*  <p className="text-lg font-bold">${developmentValue.toLocaleString()}</p>*/}
                {/*</div>*/}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Loan Amount</p>
                  <p className="text-lg font-bold text-[#E86A33]">${project.loan_amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Project Type</p>
                  <p className="text-lg font-bold">{project.project_type_label}</p>
                </div>
              </div>

              {/* CTA Button or Status */}
              {isLoadingProposal ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  <span className="text-sm text-gray-500">Loading...</span>
                </div>
              ) : proposal?.status === "accepted" ? (
                <Link href="/dashboard/proposals" className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full hover:bg-green-100 transition-colors">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Proposal Accepted</span>
                  <ExternalLink className="h-3.5 w-3.5 text-green-600" />
                </Link>
              ) : proposal?.status === "rejected" ? (
                <Link href="/dashboard/proposals" className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-full hover:bg-red-100 transition-colors">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-700">Proposal Rejected</span>
                  <ExternalLink className="h-3.5 w-3.5 text-red-600" />
                </Link>
              ) : proposalSubmitted ? (
                <Link href="/dashboard/proposals" className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full hover:bg-amber-100 transition-colors">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-amber-700">Submitted for Review</span>
                  <ExternalLink className="h-3.5 w-3.5 text-amber-600" />
                </Link>
              ) : (
                <Button
                  onClick={() => setShowLoanProposalModal(true)}
                  className="bg-[#E86A33] hover:bg-[#d55a25] text-white px-6 h-10 text-sm font-medium whitespace-nowrap rounded-full cursor-pointer"
                >
                  Submit Loan Offer
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation - Sticky */}
        <div className="flex justify-center sticky top-0 z-10">
          <nav className="flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => scrollToSection(tab.id, tab.ref)}
                className={`py-4 cursor-pointer text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "text-[#E86A33] border-[#E86A33]"
                    : "text-gray-500 border-transparent hover:text-[#E86A33] hover:border-[#E86A33]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* All Sections */}
      <div className="space-y-12 max-w-5xl mx-auto p-4">
        {/* About Project Section */}
        <div ref={aboutRef} className="scroll-mt-20">
          <h3 className="text-lg font-semibold mb-6">About project</h3>
          <div className="rounded-xl bg-white grid grid-cols-1 lg:grid-cols-2">
            {/* Left - Image Carousel */}
            <div className="space-y-3">
              {/* Main Image with Navigation */}
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src={aboutGalleryImages[aboutImageIndex]?.src || "/images/house.png"}
                  alt={aboutGalleryImages[aboutImageIndex]?.title || "Project image"}
                  fill
                  className="object-cover"
                  unoptimized
                />

                {aboutGalleryImages.length > 1 && (
                  <>
                    {/* Navigation Arrows */}
                    <button
                      onClick={prevAboutImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-md cursor-pointer"
                    >
                      <ChevronLeft className="h-5 w-5 text-gray-700" />
                    </button>
                    <button
                      onClick={nextAboutImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-md cursor-pointer"
                    >
                      <ChevronRight className="h-5 w-5 text-gray-700" />
                    </button>
                  </>
                )}
              </div>

              {/* Picture Title & Pagination */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 p-2">{aboutGalleryImages[aboutImageIndex]?.title}</p>
                <div className="flex items-center gap-2">
                  {/* Pagination dots */}
                  {aboutGalleryImages.length > 1 && (
                    <div className="flex items-center gap-1">
                      {aboutGalleryImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setAboutImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === aboutImageIndex ? "bg-gray-800" : "bg-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                  {/* Fullscreen button */}
                  {/*<button className="ml-2 p-1 hover:bg-gray-200 rounded transition-colors">*/}
                  {/*  <Maximize2 className="h-4 w-4 text-gray-500" />*/}
                  {/*</button>*/}
                </div>
              </div>
            </div>

            {/* Right - Content */}
            <div className="space-y-4 p-4">
              <h4 className="text-lg font-semibold">About project</h4>
              <div className="text-sm text-gray-600 leading-relaxed">
                {project.description ? (
                  <p className="whitespace-pre-wrap">{project.description}</p>
                ) : (
                  <p>No description available for this project.</p>
                )}
              </div>

              {/* Project Details */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-xs text-gray-500">Project Type</p>
                  <p className="text-sm font-medium capitalize">{project.project_type_label || project.project_type.replace("_", " ")}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Min Investment</p>
                  <p className="text-sm font-medium">${Number(project.min_investment).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Currency</p>
                  <p className="text-sm font-medium">{project.currency}</p>
                </div>
                {project.amount_raised !== undefined && (
                  <div>
                    <p className="text-xs text-gray-500">Amount Raised</p>
                    <p className="text-sm font-medium text-green-600">${project.amount_raised.toLocaleString()}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="rounded-full px-5 cursor-pointer"
                  onClick={() => setShowVRTour(true)}
                >
                  VR tour
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full px-5 cursor-pointer"
                  onClick={() => setShowLiveCamera(true)}
                >
                  Live camera
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Project Team Section */}
        <div ref={teamRef} className="scroll-mt-20">
          <h3 className="text-lg font-semibold mb-4">Project team</h3>
          <div className="rounded-xl bg-white p-6">
            <div className="flex items-start gap-4">
              {/* Team Member Avatar */}
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                <User className="h-8 w-8 text-gray-400" />
              </div>

              {/* Team Member Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">{hardcodedData.team.name}</h4>
                  <span className="text-sm text-gray-500">| {hardcodedData.team.role}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {hardcodedData.team.bio}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Gallery Section */}
        <div ref={galleryRef} className="scroll-mt-20">
          <h3 className="text-lg font-semibold mb-4">Project gallery</h3>

          {/* Gallery Container */}
          <div className="rounded-xl bg-white overflow-hidden">
            {/* Main Image with Navigation */}
            <div className="relative aspect-[16/9] w-full bg-gray-100">
              <Image
                src={aboutGalleryImages[progressImageIndex]?.src || "/images/house.png"}
                alt={aboutGalleryImages[progressImageIndex]?.title || "Project image"}
                fill
                className="object-cover"
                unoptimized
              />

              {aboutGalleryImages.length > 1 && (
                <>
                  {/* Navigation Arrows */}
                  <button
                    onClick={prevProgressImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-md cursor-pointer"
                  >
                    <ChevronLeft className="h-6 w-6 text-gray-700" />
                  </button>
                  <button
                    onClick={nextProgressImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-md cursor-pointer"
                  >
                    <ChevronRight className="h-6 w-6 text-gray-700" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom Bar - Title & Pagination */}
            <div className="flex items-center justify-between p-3 border-t border-gray-100">
              {/* Picture Title */}
              <p className="text-sm text-gray-600">
                {aboutGalleryImages[progressImageIndex]?.title}
              </p>

              {/* Pagination */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">
                  {progressImageIndex + 1}/{aboutGalleryImages.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div ref={locationRef} className="scroll-mt-20">
          <h3 className="text-lg font-semibold mb-4">Location</h3>
          <div className="rounded-xl bg-white p-6 space-y-4">
            {/* Address */}
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#E86A33]" />
              <p className="text-sm font-medium">{fullAddress}</p>
            </div>

            {/* Two Maps Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Map - Google Maps (Detailed View) */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">
                <iframe
                  className="absolute inset-0 w-full h-full border-none"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(fullAddress)}&zoom=16`}
                />
              </div>

              {/* Right Map - OpenStreetMap (Overview) */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">
                <iframe
                  className="absolute inset-0 w-full h-full border-none"
                  loading="lazy"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=16.99%2C51.09%2C17.05%2C51.12&layer=mapnik&marker=51.107%2C17.019"
                />
              </div>
            </div>

            {/* Description and Button Row */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              {/* Description */}
              <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
                {hardcodedData.locationDescription}
              </p>

              {/* About location button */}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0"
              >
                <Button variant="outline" className="rounded-full px-5 cursor-pointer">
                  About location
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Documentation Section */}
        <div ref={documentsRef} className="scroll-mt-20">
          <h3 className="text-lg font-semibold mb-4">Documentation</h3>
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h4 className="text-sm font-medium text-gray-700 mb-4">Project documents</h4>
            {documents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {documents.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    {doc.verification_status === "approved" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-300 flex-shrink-0" />
                    )}
                    <div className="flex items-center gap-2 flex-1">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{doc.title}</span>
                    </div>
                    <Download className="h-4 w-4 text-gray-400" />
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm">No documents available for this project yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Milestones Section (if available) */}
        {milestones.length > 0 && (
          <div className="scroll-mt-20">
            <h3 className="text-lg font-semibold mb-4">Project Milestones</h3>
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              {/* Milestone Stats */}
              {milestoneStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500">Total Milestones</p>
                    <p className="text-lg font-semibold">{milestoneStats.total_milestones}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Completed</p>
                    <p className="text-lg font-semibold text-green-600">{milestoneStats.completed_milestones}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Progress</p>
                    <p className="text-lg font-semibold">{milestoneStats.progress_percentage}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Paid Amount</p>
                    <p className="text-lg font-semibold text-green-600">${milestoneStats.paid_amount.toLocaleString()}</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {milestones.map((milestone, index) => (
                  <div
                    key={milestone.id}
                    className="flex items-start gap-4 p-4 rounded-lg border border-gray-100"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#E86A33]/10 flex items-center justify-center text-[#E86A33] font-semibold text-sm">
                      {milestone.sequence || index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">{milestone.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          milestone.status === "paid" ? "bg-green-100 text-green-700" :
                          milestone.status === "approved" ? "bg-blue-100 text-blue-700" :
                          milestone.status === "proof_submitted" ? "bg-amber-100 text-amber-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {milestone.status_label}
                        </span>
                      </div>
                      {milestone.description && (
                        <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>${milestone.amount.toLocaleString()} ({milestone.percentage}%)</span>
                        {milestone.due_date && (
                          <span>Due: {formatDate(milestone.due_date)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* VR Tour Modal */}
      {showVRTour && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="relative bg-white rounded-xl overflow-hidden max-w-4xl w-full mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">VR Tour - 3D Walkthrough</h3>
              <button
                onClick={() => setShowVRTour(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            {/* Iframe Content */}
            <div className="aspect-[4/3]">
              <iframe
                className="w-full h-full border-none"
                scrolling="no"
                allowFullScreen
                allow="gyroscope; accelerometer; xr-spatial-tracking; vr;"
                src="https://naniby.shapespark.com/libelit_osadnicza_preview_05/#help"
              />
            </div>
          </div>
        </div>
      )}

      {/* Live Camera Modal */}
      {showLiveCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="relative bg-white rounded-xl overflow-hidden max-w-4xl w-full mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Live Camera</h3>
              <button
                onClick={() => setShowLiveCamera(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            {/* Iframe Content */}
            <div className="aspect-video">
              <iframe
                className="w-full h-full border-none"
                allowFullScreen
                src="https://streaming.airmax.pl/osadniczaspolka/embed.html"
              />
            </div>
          </div>
        </div>
      )}

      {/* Loan Proposal Modal */}
      <LoanProposalModal
        open={showLoanProposalModal}
        onOpenChange={setShowLoanProposalModal}
        projectId={project.id.toString()}
        projectName={project.title}
        projectImage={heroImage}
        loanValue={project.loan_amount}
        onSubmit={handleLoanProposalSubmit}
      />
    </div>
  );
}
