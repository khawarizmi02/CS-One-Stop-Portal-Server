"use client";
import React from "react";
import { useParams } from "next/navigation";
import { Plus, Hash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { useToast } from "@/hooks/use-toast";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Loading from "@/components/Loading";
import { Checkbox } from "@/components/ui/checkbox";
import { DefaultImage } from "@/constant";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import DatePickerWithPresets from "@/components/DatePickerWithPreset";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { Router } from "next/router";

// TODO: Improve the loading state and refetching logic on task update and creation
const TaskPage = () => {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = React.useState(false);

  return (
    <div className="container mx-auto h-full py-6">
      <div className="flex h-12 items-center border-b border-[#e3e5e8] bg-white px-4 shadow-xs">
        <Hash className="mr-2 h-5 w-5 text-gray-500" />
        <h3 className="font-semibold">tasks-list</h3>
      </div>

      <div className="my-4 flex items-start justify-start gap-2 border-b border-[#e3e5e8] bg-white pb-4 shadow-xs">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="mr-1" /> Add task
            </Button>
          </DialogTrigger>
          <CreateTask onSuccess={() => setDialogOpen(false)} />
        </Dialog>
      </div>
      <TaskList />
    </div>
  );
};

export default TaskPage;

interface TaskListProps {
  router?: Router;
}
const TaskList = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { groupId } = useParams();
  const id = Array.isArray(groupId) ? groupId[0] : groupId;

  if (!id) throw new Error("Id is not exist!");
  const {
    data: taskList,
    isLoading,
    refetch,
  } = api.task.getByGroupId.useQuery({
    id: id,
  });

  const { mutate: updateTask } = api.task.update.useMutation({
    onSuccess: () => {
      toast({
        title: "Task updated successfully",
      });
      // Invalidate the query to refetch the task list
      // api.task.getByGroupId.invalidate({ id });
      // router.reload();
      refetch();
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Uh oh! Failed to update task",
      });
    },
  });

  const handleCheckboxChange = (taskId: string, completed: boolean) => {
    updateTask({ taskId: taskId, taskStatus: !completed });
    // router.refresh();
  };

  if (isLoading)
    return (
      <section className="my-auto flex h-full w-full flex-col items-center justify-center text-slate-500">
        <Loading size="md" />
      </section>
    );

  if (!taskList || taskList.length === 0) {
    return (
      <section className="my-auto flex h-auto w-full flex-col items-center justify-center text-slate-500">
        <p>No task found</p>
      </section>
    );
  }

  // Separate tasks into "To do" and "Completed"
  const toDoTasks = taskList.filter((task) => !task.completed);
  const completedTasks = taskList.filter((task) => task.completed);

  return (
    <div className="space-y-6">
      {/* To do Section */}
      {toDoTasks.length > 0 && (
        <div>
          <h4 className="mb-2 text-lg font-semibold">To do</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Task name</TableHead>
                <TableHead>Assignee</TableHead>
                {/* <TableHead>Modified by</TableHead> */}
                <TableHead>Release Date</TableHead>
                <TableHead>Due Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {toDoTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() =>
                        handleCheckboxChange(task.id, task.completed)
                      }
                    />
                  </TableCell>
                  <TableCell>{task.title}</TableCell>
                  <TableCell className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={task.createdBy?.imageUrl ?? DefaultImage.src}
                      />
                      <AvatarFallback>
                        {task.createdBy?.firstName?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="line-clamp-1">
                      {task.createdBy?.firstName || "Unknown"}{" "}
                      {task.createdBy?.lastName}
                    </span>
                  </TableCell>
                  {/* <TableCell className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={task.modifiedBy?.avatar} />
                      <AvatarFallback>
                        {task.modifiedBy?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span>{task.modifiedBy?.name || "Unknown"}</span>
                  </TableCell> */}
                  <TableCell>
                    {new Date(task.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(task.dueDate).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Completed Section */}
      {completedTasks.length > 0 && (
        <div>
          <h4 className="mb-2 text-lg font-semibold">Completed</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Task name</TableHead>
                <TableHead>Assignee</TableHead>
                {/* <TableHead>Modified by</TableHead> */}
                <TableHead>Release Date</TableHead>
                <TableHead>Due Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {completedTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() =>
                        handleCheckboxChange(task.id, task.completed)
                      }
                    />
                  </TableCell>
                  <TableCell>{task.title}</TableCell>
                  <TableCell className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={task.createdBy?.imageUrl ?? DefaultImage.src}
                      />
                      <AvatarFallback>
                        {task.createdBy?.firstName?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="line-clamp-1">
                      {task.createdBy?.firstName || "Unknown"}{" "}
                      {task.createdBy?.lastName}
                    </span>
                  </TableCell>
                  {/* <TableCell className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={task.modifiedBy?.avatar} />
                      <AvatarFallback>
                        {task.modifiedBy?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span>{task.modifiedBy?.name || "Unknown"}</span>
                  </TableCell> */}
                  <TableCell>
                    {new Date(task.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(task.dueDate).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

interface CreateTaskProps {
  onSuccess: () => void;
}

const CreateTask = ({ onSuccess }: CreateTaskProps) => {
  const { groupId } = useParams();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    undefined,
  );

  const { mutate } = api.task.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Task created successfully",
      });
      form.reset();
      setSelectedDate(undefined);
      onSuccess(); // Call the onSuccess prop to close the dialog
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Uh oh! Failed to create task",
      });
    },
  });

  if (!groupId)
    return (
      <DialogContent>
        <Loading size="sm" />
      </DialogContent>
    );

  const formSchema = z.object({
    title: z.string().nonempty("Please fill in the task's title"),
    description: z.string().optional(),
    dueDate: z.string().datetime().nonempty("Please set the due date"),
    groupId: z.string().nonempty(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      groupId: Array.isArray(groupId) ? groupId[0] : groupId,
    },
  });

  // Update form value when date changes
  React.useEffect(() => {
    if (selectedDate) {
      form.setValue("dueDate", selectedDate.toISOString(), {
        shouldValidate: true,
      });
    }
  }, [selectedDate, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
    mutate(values);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create Task</DialogTitle>
        <DialogDescription>
          Fill in the details below to create a new task.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Task title" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Task description" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date</FormLabel>
                <FormControl>
                  <DatePickerWithPresets
                    date={selectedDate}
                    setDate={setSelectedDate}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="submit">Create Task</Button>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};
