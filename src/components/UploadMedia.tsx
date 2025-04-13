import React, { use, useState } from "react";
import { Upload, X } from "lucide-react";
import { api } from "@/trpc/react";
import { getSignedURL } from "@/actions/s3Actions";
import { useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface UploadMediaModalProps {
  groupId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const UploadMediaModal: React.FC<UploadMediaModalProps> = ({
  groupId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const createMessageMutation = api.group.createMessage.useMutation({
    onSuccess: () => {
      setFiles([]);
      setUploading(false);
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (error) => {
      console.error("Upload error:", error);
      setUploading(false);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);

    // Process each file
    for (const file of files) {
      try {
        // Determine message type based on file type
        const isImage = file.type.startsWith("image/");
        const messageType = isImage ? "image" : "file";

        // You would typically get a signed URL from your backend here
        // For now, we'll simulate this process

        // 1. Get signed URL from S3 or your preferred storage (implement this)
        // const signedUrlResponse = await getSignedURL(file.name, file.type);
        const signedURLResult = await getSignedURL(
          file.name,
          file.type,
          `groups/${groupId}/media`,
        );

        if (signedURLResult.failure) {
          toast({
            title: "File upload failed",
            description: signedURLResult.failure,
            variant: "destructive",
          });
          return;
        }

        const { url } = signedURLResult.success!;

        // 2. Upload the file to the signed URL
        const uploadResponse = await fetch(url, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });

        // 3. Create a message with the file URL
        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload: ${uploadResponse.statusText}`);
        }

        const mediaUrl = url.split("?")[0];

        // For this example, we'll use a placeholder
        // const fileUrl = "/api/placeholder/400/400"; // Replace with actual upload logic

        // Create group message with media
        await createMessageMutation.mutateAsync({
          groupId,
          messageType,
          mediaUrl,
          fileName: file.name,
          contentType: file.type,
          content: `Uploaded ${file.name}`,
        });
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Upload Media</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-4 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
          <input
            type="file"
            id="file-upload"
            multiple
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
          <label
            htmlFor="file-upload"
            className="flex cursor-pointer flex-col items-center justify-center"
          >
            <Upload className="mb-2 h-12 w-12 text-gray-400" />
            <p className="mb-1 text-sm text-gray-600">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, PDF, DOCX up to 10MB
            </p>
          </label>
        </div>

        {files.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-sm font-medium">Selected files:</p>
            <ul className="text-sm text-gray-600">
              {files.map((file, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between py-1"
                >
                  <span>{file.name}</span>
                  <span className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(0)} KB
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400"
            disabled={files.length === 0 || uploading}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadMediaModal;
