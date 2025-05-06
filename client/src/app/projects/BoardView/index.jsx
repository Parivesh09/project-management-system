import {
  useGetTasksQuery,
  useUpdateTaskMutation,
} from "../../../redux/services/api";
import React from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { EllipsisVertical, MessageSquareMore, Plus } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import Loader from "../../../components/Loader";

const statusLabels = {
  TODO: 'To Do',
  IN_PROGRESS: 'Work In Progress',
  UNDER_REVIEW: 'Under Review',
  DONE: 'Completed',
};
const statusColors = {
  TODO: '#2563EB',
  IN_PROGRESS: '#059669',
  UNDER_REVIEW: '#D97706',
  COMPLETED: '#000000',
};
const BoardView = ({
  id,
  setIsModalNewTaskOpen,
  setIsModalEditTaskOpen,
  setTask,
}) => {
  console.log("id at the board view", id);

  const { data: tasks, isLoading, error } = useGetTasksQuery({ projectId: id });

  const [updateTask] = useUpdateTaskMutation();
  const moveTask = async (taskId, statusKey) => {
    try {
      await updateTask({ id: taskId, status: statusKey }).unwrap();
    } catch (err) {
      console.error("Error updating task status:", err);
    }
  };

  if (isLoading || !tasks) return <Loader />;
  if (error) return <div>An error occurred while fetching tasks</div>;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
        {Object.keys(statusLabels).map((statusKey) => (
          <TaskColumn
            key={statusKey}
            statusKey={statusKey}
            tasks={tasks}
            moveTask={moveTask}
            setIsModalNewTaskOpen={setIsModalNewTaskOpen}
            setIsModalEditTaskOpen={setIsModalEditTaskOpen}
            setTask={setTask}
          />
        ))}
      </div>
    </DndProvider>
  );
};

const TaskColumn = ({
  statusKey,
  tasks,
  moveTask,
  setIsModalNewTaskOpen,
  setIsModalEditTaskOpen,
  setTask,
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "task",
    drop: (item) => moveTask(item.id, statusKey),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const columnTasks = tasks.filter((task) => task.status === statusKey);
  const count = columnTasks.length;

  const color = statusColors[statusKey];

  return (
    <div
      ref={(instance) => {
        drop(instance);
      }}
      className={`sl:py-4 rounded-lg py-2 xl:px-2 ${isOver ? "bg-blue-100 dark:bg-neutral-950" : ""}`}
    >
      <div className="mb-3 flex w-full">
        <div
          className="w-2 rounded-s-lg"
          style={{ backgroundColor: color }}
        />
        <div className="flex w-full items-center justify-between rounded-e-lg bg-white px-5 py-4 dark:bg-dark-secondary">
          <h3 className="flex items-center text-lg font-semibold dark:text-white">
            {statusLabels[statusKey]}{' '}
            <span
              className="ml-2 inline-block rounded-full bg-gray-200 p-1 text-center text-sm leading-none dark:bg-dark-tertiary"
              style={{ width: '1.5rem', height: '1.5rem' }}
            >
              {count}
            </span>
          </h3>
          <div className="flex items-center gap-1">
            <button className="flex h-6 w-5 items-center justify-center dark:text-neutral-500">
              <EllipsisVertical size={26} />
            </button>
            <button
              className="flex h-6 w-6 items-center justify-center rounded bg-gray-200 dark:bg-dark-tertiary dark:text-white"
              onClick={() => setIsModalNewTaskOpen(true)}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      {columnTasks.map((task) => (
        <Task
          setIsModalEditTaskOpen={setIsModalEditTaskOpen}
          setTask={setTask}
          key={task.id}
          task={task}
        />
      ))}
    </div>
  );
};

const Task = ({ task, setIsModalEditTaskOpen, setTask }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "task",
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const taskTagsSplit = task.tags ? task.tags.split(",") : [];

  const formattedStartDate = task.startDate
    ? format(new Date(task.startDate), "P")
    : "";
  const formattedDueDate = task.dueDate
    ? format(new Date(task.dueDate), "P")
    : "";

  const numberOfComments = (task.comments && task.comments.length) || 0;

  const PriorityTag = ({ priority }) => (
    <div
      className={`rounded-full px-2 py-1 text-xs font-semibold ${
        priority === "URGENT"
          ? "bg-red-200 text-red-700"
          : priority === "HIGH"
            ? "bg-yellow-200 text-yellow-700"
            : priority === "MEDIUM"
              ? "bg-green-200 text-green-700"
              : priority === "LOW"
                ? "bg-blue-200 text-blue-700"
                : "bg-gray-200 text-gray-700"
      }`}
    >
      {priority}
    </div>
  );

  return (
    <div
      ref={(instance) => {
        drag(instance);
      }}
      className={`mb-4 rounded-md bg-white shadow dark:bg-dark-secondary ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      {task.attachments && task.attachments.length > 0 && (
        <Image
          src={``}
          alt={task.attachments[0].fileName || "Attachment"}
          width={400}
          height={200}
          className="h-auto w-full rounded-t-md"
        />
      )}
      <div className="p-4 md:p-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {task.priority && <PriorityTag priority={task.priority} />}
            <div className="flex gap-2">
              {taskTagsSplit.map((tag) => (
                <div
                  key={tag}
                  className="rounded-full bg-blue-100 px-2 py-1 text-xs"
                >
                  {" "}
                  {tag}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => {
              setIsModalEditTaskOpen(true);
              setTask(task);
            }}
            className="flex h-6 w-4 flex-shrink-0 items-center justify-center dark:text-neutral-500"
          >
            <EllipsisVertical size={26} />
          </button>
        </div>

        <div className="my-3 flex justify-between">
          <h4 className="text-md font-bold dark:text-white">{task.title}</h4>
          {typeof task.points === "number" && (
            <div className="text-xs font-semibold dark:text-white">
              {task.points} pts
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500 dark:text-neutral-500">
          {formattedStartDate && <span>{formattedStartDate} - </span>}
          {formattedDueDate && <span>{formattedDueDate}</span>}
        </div>
        <p className="text-sm text-gray-600 dark:text-neutral-500">
          {task.description}
        </p>
        <div className="mt-4 border-t border-gray-200 dark:border-stroke-dark" />

        {/* Users */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex -space-x-[6px] overflow-hidden">
            {task.assignee && (
              <Image
                key={task.assignee.userId}
                src={""}
                alt={task.assignee.name}
                width={30}
                height={30}
                className="h-8 w-8 rounded-full border-2 border-white object-cover dark:border-dark-secondary"
              />
            )}
            {task.author && (
              <Image
                key={task.author.userId}
                src={""}
                alt={task.author.name}
                width={30}
                height={30}
                className="h-8 w-8 rounded-full border-2 border-white object-cover dark:border-dark-secondary"
              />
            )}
          </div>
          <div className="flex items-center text-gray-500 dark:text-neutral-500">
            <MessageSquareMore size={20} />
            <span className="ml-1 text-sm dark:text-neutral-400">
              {numberOfComments}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardView;
