"use client";

import Link from "next/link";
import { Building2, MapPin, Calendar, DollarSign, MoreVertical, Eye, Edit, Trash2 } from "lucide-react";
import { ProjectStatusBadge, ProjectStatus } from "./project-status-badge";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";

interface ProjectCardProps {
  id: number;
  title: string;
  type: string;
  location: string;
  fundingGoal: number;
  status: ProjectStatus;
  createdAt: string;
  imageUrl?: string;
  onDelete?: (id: number) => void;
}

export function ProjectCard({
  id,
  title,
  type,
  location,
  fundingGoal,
  status,
  createdAt,
  imageUrl,
  onDelete,
}: ProjectCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const canEdit = status === "draft" || status === "rejected";
  const canDelete = status === "draft";

  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative h-40 bg-gray-100">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="h-12 w-12 text-gray-300" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <ProjectStatusBadge status={status} />
        </div>
        <div className="absolute top-3 right-3" ref={menuRef}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-white/80 hover:bg-white"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
          {showMenu && (
            <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border py-1 z-10">
              <Link
                href={`/developer/dashboard/projects/${id}`}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Eye className="h-4 w-4" />
                View Details
              </Link>
              {canEdit && (
                <Link
                  href={`/developer/dashboard/projects/${id}/edit`}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Link>
              )}
              {canDelete && onDelete && (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(id);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-2">
          <span className="text-xs text-gray-500 uppercase tracking-wider">{type}</span>
        </div>
        <Link href={`/developer/dashboard/projects/${id}`}>
          <h3 className="font-semibold text-gray-900 hover:text-[#E86A33] transition-colors line-clamp-1">
            {title}
          </h3>
        </Link>

        <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">
          <MapPin className="h-3.5 w-3.5" />
          <span className="line-clamp-1">{location}</span>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4 text-gray-400" />
            <span className="font-semibold">${fundingGoal.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Calendar className="h-3.5 w-3.5" />
            <span>{new Date(createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
