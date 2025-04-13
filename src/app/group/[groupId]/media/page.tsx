"use client";
import React, { useState } from "react";
import { Hash, Upload, Download, Share, Trash2 } from "lucide-react";
import { api } from "@/trpc/react";
import { useParams } from "next/navigation";
import Image from "next/image";
import UploadMediaModal from "@/components/UploadMedia";
import { ConfirmationDialog } from "@/components/ConfirmationDialogs";
import { useToast } from "@/hooks/use-toast";

const MediaPage = () => {
  const { toast } = useToast();
  const params = useParams();
  const groupId = params.groupId as string;
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);

  // Fetch group details
  const { data: group } = api.group.getByGroupId.useQuery({
    id: groupId,
  });

  // Fetch all media for this group
  const {
    data: mediaFiles,
    isLoading,
    refetch,
  } = api.group.getGroupMedia.useQuery(
    {
      groupId,
    },
    {
      enabled: !!groupId,
    },
  );

  // Get user role in this group
  const { data: userRole } = api.group.getUserGroupRole.useQuery({
    groupId,
  });

  const isAdmin = userRole === "ADMIN";

  // Handle file deletion
  const deleteMediaMutation = api.group.deleteMedia.useMutation({
    onSuccess: () => {
      refetch();
      toast({
        title: "File deleted",
        description: "The file has been deleted successfully.",
        variant: "default",
      });
      setIsDeleteDialogOpen(false);
      setSelectedMediaId(null);
    },
  });

  const handleDeleteMedia = (mediaId: string) => {
    setSelectedMediaId(mediaId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedMediaId) {
      deleteMediaMutation.mutate({ mediaId: selectedMediaId });
    }
  };

  return (
    <div className="flex h-full flex-col pt-6">
      {/* Header with action buttons */}
      <div className="flex h-12 items-center justify-between border-b border-[#e3e5e8] bg-white px-4 shadow-sm">
        <div className="flex items-center">
          <Hash className="mr-2 h-5 w-5 text-gray-500" />
          <h3 className="font-semibold">Media</h3>
        </div>

        <div className="flex space-x-2">
          <button
            className="flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-medium hover:bg-gray-200"
            onClick={() => setIsUploadModalOpen(true)}
          >
            <Upload className="mr-1 h-4 w-4" />
            Upload
          </button>
          <button className="flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-medium hover:bg-gray-200">
            <Download className="mr-1 h-4 w-4" />
            Download
          </button>
          <button className="flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-medium hover:bg-gray-200">
            <Share className="mr-1 h-4 w-4" />
            Share
          </button>
        </div>
      </div>

      {/* Documents Header */}
      {/* <div className="px-6 py-4">
        <h2 className="text-lg font-semibold">Documents</h2>
      </div> */}

      {/* Documents Table */}
      <div className="mt-3 px-6 py-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b text-left">
              <th className="w-8 pb-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300"
                />
              </th>
              <th className="pb-2 pl-2 font-medium text-gray-600">Name</th>
              <th className="pb-2 font-medium text-gray-600">Modified</th>
              <th className="pb-2 font-medium text-gray-600">Modified By</th>
              <th className="pb-2 text-right font-medium text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-4 text-center text-gray-500">
                  Loading media files...
                </td>
              </tr>
            ) : !mediaFiles || mediaFiles.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4 text-center text-gray-500">
                  No documents found
                </td>
              </tr>
            ) : (
              mediaFiles
                .filter((file) => file.mediaType !== "image")
                .map((file) => (
                  <tr key={file.id} className="border-b hover:bg-gray-50">
                    <td className="py-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </td>
                    <td className="py-3 pl-2">
                      <div className="flex items-center">
                        <div className="mr-2 text-gray-500">
                          {file.mediaType === "file" && (
                            <i className="fa fa-file" />
                          )}
                          {file.mediaType === "pdf" && (
                            <i className="fa fa-file-pdf" />
                          )}
                          {file.mediaType === "doc" && (
                            <i className="fa fa-file-word" />
                          )}
                        </div>
                        <span>{file.fileName || "File"}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      {new Date(file.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3">{file.createdByName || "Unknown"}</td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end space-x-2">
                        <button className="text-gray-500 hover:text-gray-700">
                          <Download className="h-4 w-4" />
                        </button>
                        {(isAdmin || file.createdById === params.userId) && (
                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteMedia(file.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {/* Media Gallery */}
      {/* <div className="px-6 py-4">
        <h2 className="text-lg font-semibold">Media Gallery</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 px-6 pb-6 md:grid-cols-3 lg:grid-cols-4">
        {isLoading ? (
          <div className="col-span-full py-8 text-center text-gray-500">
            Loading media files...
          </div>
        ) : !mediaFiles || mediaFiles.length === 0 ? (
          <div className="col-span-full py-8 text-center text-gray-500">
            No media files found
          </div>
        ) : (
          mediaFiles
            .filter((file) => file.mediaType === "image")
            .map((file) => (
              <div
                key={file.id}
                className="group relative aspect-square overflow-hidden rounded-md border border-gray-200"
              >
                <Image
                  src={file.mediaUrl || "/api/placeholder/400/400"}
                  alt="Media thumbnail"
                  fill
                  className="object-cover"
                />
                <div className="bg-opacity-0 group-hover:bg-opacity-40 absolute inset-0 flex items-center justify-center bg-black opacity-0 transition-all duration-200 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    <button className="rounded-full bg-white p-2">
                      <Download className="h-4 w-4" />
                    </button>
                    {(isAdmin || file.createdById === params.userId) && (
                      <button
                        className="rounded-full bg-white p-2"
                        onClick={() => handleDeleteMedia(file.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
        )}
      </div> */}

      {/* Upload Modal */}
      <UploadMediaModal
        groupId={groupId}
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => refetch()}
      />

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete File"
        description="Are you sure you want to delete this file? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
      />
    </div>
  );
};

export default MediaPage;
