"use client";

import React, { useState, useEffect } from "react";
import { Users, Search, Plus, UserPlus, X } from "lucide-react";
import { api } from "@/trpc/react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

interface Member {
  id: string;
  firstName: string | null;
  imageUrl: string | null;
  role?: string;
}

const GroupMembersPage = () => {
  const params = useParams();
  const groupId = params.groupId as string;

  const { data: UserRole } = api.group.getUserGroupRole.useQuery({
    groupId: Array.isArray(groupId) ? groupId[0] : groupId || "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  // Fetch current group data
  const {
    data: group,
    isLoading: groupLoading,
    refetch: refetchGroup,
  } = api.group.getByGroupId.useQuery({ id: groupId });

  // Fetch group members
  const {
    data: groupMembers,
    isLoading: membersLoading,
    refetch: refetchMembers,
  } = api.group.getGroupMembers.useQuery({ groupId });

  // Fetch all users for adding members
  // const { data: allUsers, isLoading: usersLoading } =
  //   api.user.getAll.useQuery();
  const { data: allUsers, isLoading: usersLoading } =
    api.user.getStudent.useQuery();

  // Mutation for adding members
  const { mutate: addMembersMutation, isPending } =
    api.group.addMembers.useMutation({
      onSuccess: () => {
        refetchMembers();
        refetchGroup();
        setIsAddMemberOpen(false);
        setSelectedMembers([]);
      },
    });

  // Filter users that are not already members
  const filteredUsers = allUsers?.filter(
    (user) =>
      !groupMembers?.some((member) => member.id === user.id) &&
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAddMembers = () => {
    if (selectedMembers.length > 0) {
      addMembersMutation({
        groupId,
        memberIds: selectedMembers,
      });
    }
  };

  const toggleSelectMember = (userId: string) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers((prev) => prev.filter((id) => id !== userId));
    } else {
      setSelectedMembers((prev) => [...prev, userId]);
    }
  };

  return (
    <div className="flex h-screen w-full flex-col pt-6">
      {/* Header */}
      <div className="flex h-12 items-center justify-between border-b border-[#e3e5e8] bg-white px-4 shadow-xs">
        <div className="flex items-center">
          <Users className="mr-2 h-5 w-5 text-gray-500" />
          <h3 className="font-semibold">Group Members</h3>
        </div>

        <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center gap-1">
              <UserPlus className="h-4 w-4" />
              <span>Add Members</span>
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Members to Group</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-4">
              <div className="relative">
                <Search className="absolute top-2.5 left-2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search for users..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {selectedMembers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedMembers.map((id) => {
                    const user = allUsers?.find((user) => user.id === id);
                    return (
                      <Badge
                        key={id}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {user?.firstName}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => toggleSelectMember(id)}
                        />
                      </Badge>
                    );
                  })}
                </div>
              )}

              <ScrollArea className="h-64">
                {usersLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <p>Loading users...</p>
                  </div>
                ) : filteredUsers && filteredUsers.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className={`flex cursor-pointer items-center justify-between rounded-md p-2 hover:bg-gray-100 ${
                          selectedMembers.includes(user.id) ? "bg-gray-100" : ""
                        }`}
                        onClick={() => toggleSelectMember(user.id)}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.imageUrl || ""} />
                            <AvatarFallback>
                              {user.firstName?.[0] || "U"} {user.lastName || ""}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {user.firstName || "User"} {user.lastName || ""}
                            </p>
                          </div>
                        </div>

                        {selectedMembers.includes(user.id) && (
                          <div className="rounded-full bg-blue-600 p-1">
                            <Plus className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p>No users found</p>
                  </div>
                )}
              </ScrollArea>

              <Button
                onClick={handleAddMembers}
                disabled={selectedMembers.length === 0 || isPending}
              >
                Add {selectedMembers.length}{" "}
                {selectedMembers.length === 1 ? "Member" : "Members"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {membersLoading ? (
          <div className="flex h-full items-center justify-center">
            <p>Loading members...</p>
          </div>
        ) : groupMembers && groupMembers.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {groupMembers.map((member) => (
              <div
                key={member.id}
                className="flex flex-col items-center rounded-lg border p-4 shadow-xs"
              >
                <Avatar className="h-16 w-16">
                  <AvatarImage src={member.imageUrl || ""} />
                  <AvatarFallback className="text-lg">
                    {member.firstName?.[0] || "U"} {member.lastName || ""}
                  </AvatarFallback>
                </Avatar>
                <h4 className="mt-2 text-lg font-medium">
                  {member.firstName || "User"} {member.lastName || ""}
                </h4>
                {member.role && (
                  <Badge variant="outline" className="mt-1">
                    {member.role}
                  </Badge>
                )}
                {UserRole === "ADMIN" && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <button>...</button>
                    </DialogTrigger>
                    <UpdateGroupMember
                      member={member}
                      userRole={UserRole}
                      groupId={groupId}
                    />
                  </Dialog>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center">
            <Users className="h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-xl font-semibold">No members yet</h3>
            <p className="text-gray-500">Add members to start collaborating</p>
          </div>
        )}
      </div>
    </div>
  );
};

type member = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  role: string;
};

function UpdateGroupMember({
  member,
  userRole,
  groupId,
}: {
  member: member;
  userRole: string;
  groupId: string;
}) {
  const { mutate: DeleteGroupMember, isPending: isPendingDelete } =
    api.group.removeGroupMember.useMutation();

  const { mutate: UpdateGroupRole, isPending: isPendingUpdate } =
    api.group.UpdateGroupMemberRole.useMutation();

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Manage Member</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-4 py-4">
        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10">
            <AvatarImage src={member.imageUrl || ""} />
            <AvatarFallback>
              {member.firstName?.[0] || "U"} {member.lastName || ""}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">
              {member.firstName || "User"} {member.lastName || ""}
            </p>
            {member.role && (
              <p className="text-sm text-gray-500">{member.role}</p>
            )}
          </div>
        </div>

        <Button
          variant="destructive"
          onClick={() => {
            DeleteGroupMember({ groupId: groupId, memberId: member.id });
          }}
          disabled={isPendingDelete || isPendingUpdate}
        >
          {isPendingDelete ? "Removing..." : "Remove Member"}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            let role = member.role === "ADMIN" ? "MEMBER" : "ADMIN";
          }}
          disabled={isPendingUpdate || isPendingDelete}
        >
          {isPendingUpdate
            ? "Updating..."
            : member.role === "ADMIN"
              ? "Remove Admin Role"
              : "Make Admin"}
        </Button>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button
            variant="outline"
            disabled={isPendingDelete || isPendingUpdate}
          >
            Cancel
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}

export default GroupMembersPage;
