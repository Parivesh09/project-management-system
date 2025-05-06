"use client";

import React from 'react';
import { useGetCurrentUserQuery, useUpdateTaskMutation } from '../../redux/services/api';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Loader from '../../components/Loader';
import { format } from 'date-fns';
import { EllipsisVertical, Plus, MessageSquareMore } from 'lucide-react';
import Image from 'next/image';

const statusLabels = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};

const statusColors = {
  TODO: '#2563EB',
  IN_PROGRESS: '#059669',
  DONE: '#000000',
};

const TasksBoard = ({ tasks, setTask, setIsModalEditTaskOpen }) => {
  const { data: currentUser } = useGetCurrentUserQuery();
  const [updateTask] = useUpdateTaskMutation();

  const moveTask = async (taskId, newStatus) => {
    try {
      await updateTask({ id: taskId, status: newStatus }).unwrap();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  if (!tasks) {
    return <Loader fullScreen />;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
        {Object.keys(statusLabels).map((key) => (
          <TaskColumn
            key={key}
            statusKey={key}
            tasks={tasks}
            moveTask={moveTask}
            setIsModalNewTaskOpen={setIsModalEditTaskOpen}
            setIsModalEditTaskOpen={setIsModalEditTaskOpen}
            setTask={setTask}
          />
        ))}
      </div>
    </DndProvider>
  );
};

const TaskColumn = ({ statusKey, tasks, moveTask, setIsModalNewTaskOpen, setIsModalEditTaskOpen, setTask }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'task',
    drop: (item) => moveTask(item.id, statusKey),
    collect: (monitor) => ({ isOver: !!monitor.isOver() }),
  });

  const filteredTasks = tasks.filter((t) => t.status === statusKey);
  const count = filteredTasks.length;
  const title = statusLabels[statusKey];
  const color = statusColors[statusKey];

  return (
    <div
      ref={drop}
      className={`sl:py-4 rounded-lg py-2 xl:px-2 ${isOver ? 'bg-blue-100 dark:bg-neutral-950' : ''}`}
    >
      <div className="mb-3 flex w-full">
        <div className="w-2 rounded-s-lg" style={{ backgroundColor: color }} />
        <div className="flex w-full items-center justify-between rounded-e-lg bg-white px-5 py-4 dark:bg-dark-secondary">
          <h3 className="flex items-center text-lg font-semibold dark:text-white">
            {title}{' '}
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

      {filteredTasks.length === 0 && (
        <div className="text-center text-gray-500 dark:text-neutral-400 py-8 border-2 border-dashed rounded-lg">
          No tasks
        </div>
      )}

      {filteredTasks.map((task) => (
        <TaskItem key={task.id} task={task} setTask={setTask} setIsModalEditTaskOpen={setIsModalEditTaskOpen} />
      ))}
    </div>
  );
};

const TaskItem = ({ task, setTask, setIsModalEditTaskOpen }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'task',
    item: { id: task.id },
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
  });

  const formattedDue = task.dueDate ? format(new Date(task.dueDate), 'P') : '';
  const numberOfComments = (task.comments && task.comments.length) || 0;

  return (
    <div
      ref={drag}
      className={`mb-4 rounded-md bg-white shadow dark:bg-dark-secondary ${isDragging ? 'opacity-50' : 'opacity-100'}`}
      onClick={() => {
        setTask(task);
        setIsModalEditTaskOpen(true);
      }}
    >
      <div className="p-4 md:p-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {task.priority && (
              <div
                className={`rounded-full px-2 py-1 text-xs font-semibold ${
                  task.priority === 'HIGH'
                    ? 'bg-red-200 text-red-700'
                    : task.priority === 'MEDIUM'
                      ? 'bg-yellow-200 text-yellow-700'
                      : task.priority === 'LOW'
                        ? 'bg-blue-200 text-blue-700'
                        : 'bg-gray-200 text-gray-700'
                }`}
              >
                {task.priority}
              </div>
            )}
            {task.tags && task.tags.split(',').map((tag) => (
              <div key={tag} className="rounded-full bg-blue-100 px-2 py-1 text-xs">
                {tag}
              </div>
            ))}
          </div>
          <button className="flex h-6 w-4 flex-shrink-0 items-center justify-center dark:text-neutral-500">
            <EllipsisVertical size={26} />
          </button>
        </div>

        <div className="my-3 flex justify-between">
          <h4 className="text-md font-bold dark:text-white">{task.title}</h4>
          {typeof task.points === 'number' && (
            <div className="text-xs font-semibold dark:text-white">
              {task.points} pts
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500 dark:text-neutral-500">
          {formattedDue && <span>Due {formattedDue}</span>}
        </div>
        <p className="text-sm text-gray-600 dark:text-neutral-500">{task.description}</p>

        <div className="mt-3 flex items-center justify-between">
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

export default TasksBoard; 