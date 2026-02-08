"use client";

import { useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Building2, Calendar, User, MapPin, FileText, CheckCircle2, Circle, Play, CalendarCheck, ChevronLeft, ChevronRight, Maximize2, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoanProposalModal, LoanProposalFormData } from "@/components/dashboard/loan-proposal-modal";

// Hardcoded project data - in real app this would come from API
const projectData = {
  id: "1",
  projectId: "Project ID",
  name: "Project Name",
  location: "City, Country",
  description: `Living in Wrocław, you don't need imagination to sense that housing is one of the major challenges. As the city rapidly grows, attracting both residents and businesses, the demand for quality housing continues to rise. On one hand, this presents tremendous development opportunities, while on the other, it creates a pressing need for thoughtful, sustainable housing solutions.

Our investment features four semi-detached houses, each designed with modern living in mind. The properties combine contemporary architecture with practical layouts, offering comfortable living spaces for families. Each unit includes private outdoor areas, parking spaces, and access to shared green spaces.

The development is strategically located with easy access to public transportation, schools, shopping centers, and recreational facilities. The neighborhood is known for its family-friendly atmosphere and growing community.`,
  constructionStart: "21 Jun 2023",
  constructionFinish: "21 Jun 2024",
  loanMaturity: "30 Oct 2024",
  developmentValue: 1000000,
  loanValue: 1800000,
  ltv: "60%",
  loanType: "Construction",
  team: {
    name: "Kamil Paczkowski",
    role: "Contractor",
    bio: "Carlops of Carlops Ltd. with almost twenty years of experience in building high-quality houses and buildings. As a Carlops General Contractor, he directs construction teams during execution of residential and public utility buildings.",
    imageUrl: "/team-member.jpg",
  },
  progressGallery: [
    { id: 1, title: "Building phase", imageUrl: "/progress-1.jpg" },
    { id: 2, title: "Finishing details", imageUrl: "/progress-2.jpg" },
  ],
  locationDetails: {
    address: "Grunwaldzka 129, Wrocław, Poland",
    mapUrl: "https://maps.google.com",
  },
  documents: [
    { id: 1, name: "KRS", checked: true },
    { id: 2, name: "NIP", checked: true },
    { id: 3, name: "Finansowe", checked: true },
    { id: 4, name: "Nieruchomości", checked: false },
    { id: 5, name: "Zgody i decyzje", checked: false },
    { id: 6, name: "Polisy", checked: false },
  ],
  images: {
    main: "/project-main.jpg",
    gallery: [
      "/project-1.jpg",
      "/project-2.jpg",
      "/project-3.jpg",
      "/project-4.jpg",
    ],
    about: "/project-about.jpg",
  },
};

export default function ProjectDetailsPage() {
  const params = useParams();
  const projectId = params.id;

  // Refs for each section
  const aboutRef = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const documentsRef = useRef<HTMLDivElement>(null);

  // Active tab state
  const [activeTab, setActiveTab] = useState("about");

  // About section gallery state
  const aboutGalleryImages = [
    { id: 1, title: "Front view", src: "/images/house.png" },
    { id: 2, title: "Side view", src: "/images/house.png" },
    { id: 3, title: "Interior", src: "/images/house.png" },
    { id: 4, title: "Kitchen", src: "/images/house.png" },
    { id: 5, title: "Living room", src: "/images/house.png" },
    { id: 6, title: "Bedroom", src: "/images/house.png" },
    { id: 7, title: "Bathroom", src: "/images/house.png" },
    { id: 8, title: "Garden", src: "/images/house.png" },
    { id: 9, title: "Parking", src: "/images/house.png" },
    { id: 10, title: "Aerial view", src: "/images/house.png" },
  ];
  const [aboutImageIndex, setAboutImageIndex] = useState(0);
  const [showVRTour, setShowVRTour] = useState(false);
  const [showLiveCamera, setShowLiveCamera] = useState(false);
  const [showLoanProposalModal, setShowLoanProposalModal] = useState(false);
  const [proposalSubmitted, setProposalSubmitted] = useState(false);

  const nextAboutImage = () => {
    setAboutImageIndex((prev) => (prev + 1) % aboutGalleryImages.length);
  };

  const prevAboutImage = () => {
    setAboutImageIndex((prev) => (prev - 1 + aboutGalleryImages.length) % aboutGalleryImages.length);
  };

  // Progress Gallery state
  const progressGalleryImages = [
    { id: 1, title: "Foundation work", src: "/images/house.png", phase: "Building phase", month: "January" },
    { id: 2, title: "Frame construction", src: "/images/house.png", phase: "Building phase", month: "February" },
    { id: 3, title: "Roof installation", src: "/images/house.png", phase: "Building phase", month: "March" },
    { id: 4, title: "Window fitting", src: "/images/house.png", phase: "Building phase", month: "April" },
    { id: 5, title: "Interior walls", src: "/images/house.png", phase: "Finishing phase", month: "May" },
    { id: 6, title: "Electrical work", src: "/images/house.png", phase: "Finishing phase", month: "June" },
    { id: 7, title: "Plumbing", src: "/images/house.png", phase: "Finishing phase", month: "July" },
    { id: 8, title: "Painting", src: "/images/house.png", phase: "Finishing phase", month: "August" },
  ];
  const [progressImageIndex, setProgressImageIndex] = useState(0);
  const [selectedPhase, setSelectedPhase] = useState("Building phase");
  const [selectedMonth, setSelectedMonth] = useState("January");

  const phases = ["Building phase", "Finishing phase"];
  const months = ["January", "February", "March", "April", "May", "June", "July", "August"];

  const nextProgressImage = () => {
    setProgressImageIndex((prev) => (prev + 1) % progressGalleryImages.length);
  };

  const prevProgressImage = () => {
    setProgressImageIndex((prev) => (prev - 1 + progressGalleryImages.length) % progressGalleryImages.length);
  };

  const handleLoanProposalSubmit = (data: LoanProposalFormData) => {
    // TODO: Integrate with API to submit loan proposal
    console.log("Loan proposal submitted:", data);
    setProposalSubmitted(true);
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
                  src="/images/house.png"
                  alt="Project main image"
                  fill
                  className="object-cover"
              />
            </div>

            {/* Overlay Title at Bottom */}
            <div className="absolute bottom-0 left-0 right-0 bg-gray-200 p-2">
              <h2 className="text-base font-bold ">
                {projectData.name} | {projectData.projectId} | {projectData.location}
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
                <p className="text-sm font-medium">{projectData.constructionStart}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
                <Calendar className="h-4 w-4 text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Construction Finish</p>
                <p className="text-sm font-medium">{projectData.constructionFinish}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
                <CalendarCheck className="h-4 w-4 text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Loan Maturity</p>
                <p className="text-sm font-medium">{projectData.loanMaturity}</p>
              </div>
            </div>
          </div>

          {/* Investment Stats Card */}
          <div className="p-5">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Development Value</p>
                  <p className="text-lg font-bold">${projectData.developmentValue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Loan Value</p>
                  <p className="text-lg font-bold text-[#E86A33]">${projectData.loanValue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">LTV</p>
                  <p className="text-lg font-bold">{projectData.ltv}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Loan Type</p>
                  <p className="text-lg font-bold">{projectData.loanType}</p>
                </div>
              </div>

              {/* CTA Button or Status */}
              {proposalSubmitted ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-amber-700">Submitted for Review</span>
                </div>
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
        <div className="flex justify-center sticky top-0  z-10">
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
        <div ref={aboutRef} className="scroll-mt-20 ">
          <h3 className="text-lg font-semibold mb-6">About project</h3>
          <div className="rounded-xl  bg-white grid grid-cols-1 lg:grid-cols-2 ">
            {/* Left - Image Carousel */}
            <div className="space-y-3 ">
              {/* Main Image with Navigation */}
              <div className="relative aspect-[4/3] w-full overflow-hidden ">
                <Image
                  src={aboutGalleryImages[aboutImageIndex].src}
                  alt={aboutGalleryImages[aboutImageIndex].title}
                  fill
                  className="object-cover"
                />

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
              </div>

              {/* Picture Title & Pagination */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 p-2">{aboutGalleryImages[aboutImageIndex].title}</p>
                <div className="flex items-center gap-2">
                  {/* Pagination dots */}
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
                  {/* Fullscreen button */}
                  <button className="ml-2 p-1 hover:bg-gray-200 rounded transition-colors">
                    <Maximize2 className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right - Content */}
            <div className="space-y-4 p-4">
              <h4 className="text-lg font-semibold">About project</h4>
              <div className="text-sm text-gray-600 leading-relaxed">
                <p className="mb-4">
                  Our investment features four semi-detached houses. Each house offers a modern and functional living space that seamlessly blends style and comfort. With high-quality materials and attention to detail, these homes are not only beautiful but also built to last.
                </p>
                <p>
                  The investment is located in a prime location, with easy access to amenities and transportation, making it an ideal choice for families.
                </p>
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
                  <h4 className="font-semibold">{projectData.team.name}</h4>
                  <span className="text-sm text-gray-500">| {projectData.team.role}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {projectData.team.bio}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Gallery Section */}
        <div ref={galleryRef} className="scroll-mt-20">
          {/* Header with filters */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Progress gallery</h3>
            <div className="flex gap-3">
              {/* Phase Dropdown */}
              <select
                value={selectedPhase}
                onChange={(e) => setSelectedPhase(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#E86A33] cursor-pointer"
              >
                {phases.map((phase) => (
                  <option key={phase} value={phase}>{phase}</option>
                ))}
              </select>
              {/* Month Dropdown */}
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#E86A33] cursor-pointer"
              >
                {months.map((month) => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Gallery Container */}
          <div className="rounded-xl bg-white overflow-hidden">
            {/* Main Image with Navigation */}
            <div className="relative aspect-[16/9] w-full bg-gray-100">
              <Image
                src={progressGalleryImages[progressImageIndex].src}
                alt={progressGalleryImages[progressImageIndex].title}
                fill
                className="object-cover"
              />

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
            </div>

            {/* Bottom Bar - Title & Pagination */}
            <div className="flex items-center justify-between p-3 border-t border-gray-100">
              {/* Picture Title */}
              <p className="text-sm text-gray-600">
                {progressGalleryImages[progressImageIndex].title}
              </p>

              {/* Pagination & Fullscreen */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">
                  {progressImageIndex + 1}/{progressGalleryImages.length}
                </span>
                <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                  <Maximize2 className="h-4 w-4 text-gray-500" />
                </button>
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
              <p className="text-sm font-medium">{projectData.locationDetails.address}</p>
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
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(projectData.locationDetails.address)}&zoom=16`}
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
                Wrocław, the enchanting city of a hundred bridges, captivates visitors with its breathtaking architecture, vibrant culture, and picturesque waterways. With its friendly and welcoming atmosphere, this Polish gem promises a memorable and inspiring experience for all who come to explore its charming streets and rich history.
              </p>

              {/* About location button */}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(projectData.locationDetails.address)}`}
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
            <h4 className="text-sm font-medium text-gray-700 mb-4">Required documents</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {projectData.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  {doc.checked ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-300 flex-shrink-0" />
                  )}
                  <div className="flex items-center gap-2 flex-1">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{doc.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
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
        projectId={projectData.id}
        projectName={projectData.name}
        projectImage="/images/house.png"
        loanValue={projectData.loanValue}
        onSubmit={handleLoanProposalSubmit}
      />
    </div>
  );
}
