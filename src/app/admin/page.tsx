// page.tsx
"use client";
import React from "react";
import { api } from "@/trpc/react";
import { useLocalStorage } from "usehooks-ts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import TextEditor from "@/components/TextEditor";
import { motion } from "framer-motion";
import { Users, Megaphone, MessageSquare, Users2 } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"; // For notifications (since you have sonner in your dependencies)
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminDashboard() {
  const { data, isLoading } = api.user.getUserInfo.useQuery();
  const {
    data: userStats,
    isLoading: userStatsLoading,
    refetch: refetchUserStats,
  } = api.admin.getUserStats.useQuery();
  const { data: announcementStats, isLoading: announcementStatsLoading } =
    api.admin.getAnnouncementStats.useQuery();
  const { data: forumStats, isLoading: forumStatsLoading } =
    api.admin.getForumStats.useQuery();
  const { data: groupStats, isLoading: groupStatsLoading } =
    api.admin.getGroupStats.useQuery();

  const [userId, setUserId] = useLocalStorage("userId", data?.id || "");
  React.useEffect(() => {
    if (data) setUserId(data.id);
  }, [data, setUserId]);

  // Mutation to update user role
  const { mutate: updateUserRole } = api.admin.updateUserRole.useMutation({
    onSuccess: () => {
      toast.success("User role updated successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to update user role: ${error.message}`);
    },
  });

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    hover: { scale: 1.02, transition: { duration: 0.3 } },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  // Prepare user data for the table
  const userData = React.useMemo(() => {
    const users: Array<{
      id: string;
      name: string;
      role: string;
      email: string;
    }> = [];
    (["student", "lecturer", "admin"] as Array<keyof typeof userStats>).forEach(
      (role) => {
        const roleUsers = (
          userStats?.[role] as
            | Array<{
                id: string;
                firstName: string;
                lastName: string;
                email: string;
              }>
            | undefined
        )?.map((user) => ({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          role,
          email: user.email,
        }));
        if (roleUsers) users.push(...roleUsers);
      },
    );
    return users;
  }, [userStats]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-8 lg:p-10">
      {/* Greeting Section */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h3 className="text-3xl font-bold text-gray-800 md:text-4xl">
          Hello {data?.firstName}, hope you have a great day! 👋
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Here’s a quick overview of your platform’s activity.
        </p>
      </motion.div>

      {/* Statistics Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          title="Total Users"
          icon={<Users className="h-6 w-6 text-blue-500" />}
          isLoading={userStatsLoading}
          variants={cardVariants}
        >
          <p className="text-lg font-semibold text-gray-700">
            Students: {userStats?.student.length ?? 0}
          </p>
          <p className="text-lg font-semibold text-gray-700">
            Lecturers: {userStats?.lecturer.length ?? 0}
          </p>
          <p className="text-lg font-semibold text-gray-700">
            Admins: {userStats?.admin.length ?? 0}
          </p>
        </StatCard>

        <StatCard
          title="Announcements"
          icon={<Megaphone className="h-6 w-6 text-green-500" />}
          isLoading={announcementStatsLoading}
          variants={cardVariants}
        >
          <p className="text-lg font-semibold text-gray-700">
            Total: {announcementStats?.announcement.length ?? 0}
          </p>
        </StatCard>

        <StatCard
          title="Forum Activity"
          icon={<MessageSquare className="h-6 w-6 text-purple-500" />}
          isLoading={forumStatsLoading}
          variants={cardVariants}
        >
          <p className="text-lg font-semibold text-gray-700">
            Topics: {forumStats?.forum.length ?? 0}
          </p>
          <p className="text-lg font-semibold text-gray-700">
            Comments:{" "}
            {forumStats?.forum.reduce(
              (sum, f) => sum + (f.Comments?.length ?? 0),
              0,
            )}
          </p>
        </StatCard>

        <StatCard
          title="Groups"
          icon={<Users2 className="h-6 w-6 text-orange-500" />}
          isLoading={groupStatsLoading}
          variants={cardVariants}
        >
          <p className="text-lg font-semibold text-gray-700">
            Total: {groupStats?.group.length ?? 0}
          </p>
        </StatCard>
      </motion.div>

      {/* Users Section with DataTable */}
      <Section
        title="All Users"
        icon={<Users className="h-6 w-6 text-blue-500" />}
      >
        <UserTable
          data={userData}
          isLoading={userStatsLoading}
          updateUserRole={(input) =>
            updateUserRole({
              userId: input.userId,
              role: input.role as "admin" | "student" | "lecturer",
            })
          }
        />
      </Section>

      {/* Groups Section */}
      <Section
        title="All Groups"
        icon={<Users2 className="h-6 w-6 text-orange-500" />}
      >
        {groupStats?.group.map((group) => (
          <motion.div
            key={group.id}
            className="mb-4 rounded-lg border bg-white p-4 shadow-sm hover:shadow-md"
            variants={cardVariants}
            whileHover="hover"
          >
            <div className="flex items-center justify-between">
              <div>
                <strong className="text-gray-800">{group.name}</strong>
                <div className="mt-1 text-sm text-gray-600">
                  {group.description}
                </div>
              </div>
              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-800">
                {group.Members.length} Members
              </span>
            </div>
          </motion.div>
        ))}
      </Section>

      {/* Announcements Section */}
      <Section
        title="All Announcements"
        icon={<Megaphone className="h-6 w-6 text-green-500" />}
      >
        {announcementStats?.announcement.map((a) => (
          <motion.div
            key={a.id}
            className="mb-4 rounded-lg border bg-white p-4 shadow-sm hover:shadow-md"
            variants={cardVariants}
            whileHover="hover"
          >
            <div className="flex items-center justify-between">
              <strong className="text-gray-800">{a.title}</strong>
              <span className="text-xs text-gray-500">
                {new Date(a.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="mt-2 line-clamp-2 text-sm text-gray-600">
              <TextEditor
                value={a.content}
                onChange={() => {}}
                readOnly={true}
                className="font-light"
              />
            </div>
          </motion.div>
        ))}
      </Section>

      {/* Forums Section */}
      <Section
        title="All Forums"
        icon={<MessageSquare className="h-6 w-6 text-purple-500" />}
      >
        {forumStats?.forum.map((f) => (
          <motion.div
            key={f.id}
            className="mb-4 rounded-lg border bg-white p-4 shadow-sm hover:shadow-md"
            variants={cardVariants}
            whileHover="hover"
          >
            <div className="flex items-center justify-between">
              <strong className="text-gray-800">{f.title}</strong>
              <span className="text-xs text-gray-500">
                Created: {new Date(f.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="mt-2 line-clamp-2 text-sm text-gray-600">
              <TextEditor
                value={f.description}
                onChange={() => {}}
                readOnly={true}
                className="font-light"
              />
            </div>
            <div className="mt-3 text-xs font-semibold text-gray-700">
              💬 Comments:
            </div>
            <ul className="mt-2 ml-4 list-disc text-sm text-gray-600">
              {f.Comments.map((c) => (
                <li key={c.id} className="line-clamp-1">
                  <TextEditor
                    value={c.content}
                    onChange={() => {}}
                    readOnly={true}
                    className="font-light"
                  />
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </Section>
    </div>
  );
}

// Reusable StatCard Component
function StatCard({
  title,
  icon,
  isLoading,
  children,
  variants,
}: {
  title: string;
  icon: React.ReactNode;
  isLoading: boolean;
  children: React.ReactNode;
  variants: any;
}) {
  return (
    <motion.div variants={variants} whileHover="hover">
      <Card className="h-48 bg-white shadow-lg transition-shadow hover:shadow-xl">
        {" "}
        {/* Added h-48 for consistent height */}
        <CardHeader className="flex flex-row items-center space-x-3">
          {icon}
          <CardTitle className="text-lg font-semibold text-gray-800">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
            </div>
          ) : (
            <div className="space-y-2">{children}</div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Reusable Section Component
function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mb-12"
    >
      <div className="mb-6 flex items-center space-x-3">
        {icon}
        <h3 className="text-2xl font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="space-y-4">{children}</div>
    </motion.div>
  );
}

// User Table Component
function UserTable({
  data,
  isLoading,
  updateUserRole,
}: {
  data: Array<{ id: string; name: string; role: string; email: string }>;
  isLoading: boolean;
  updateUserRole: (input: { userId: string; role: string }) => void;
}) {
  // Define columns for the table
  const columns: ColumnDef<{
    id: string;
    name: string;
    role: string;
    email: string;
  }>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="font-medium text-gray-800">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            row.getValue("role") === "admin"
              ? "bg-blue-600 text-white"
              : row.getValue("role") === "lecturer"
                ? "bg-green-600 text-white"
                : "bg-purple-600 text-white"
          }`}
        >
          {row.getValue("role")}
        </span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="text-gray-800">{row.getValue("email")}</div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Select
          onValueChange={(value) => {
            const userId = row.original.id;
            updateUserRole({ userId, role: value });
          }}
          defaultValue={row.getValue("role")}
        >
          <SelectTrigger className="bg-gray-800 text-white">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 text-white">
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="lecturer">Lecturer</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={data}
      filterPlaceholder="Filter emails..."
      filterColumn="email"
    />
  );
}
