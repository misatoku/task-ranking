import { Fragment } from "react";
import type { Task } from "../types/task";
import { reorderTasksAtom, tasksAtom } from "../atoms/tasksAtom";
import { TaskBlock } from "./TaskBlock";
import { useAtomValue, useSetAtom } from "jotai";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

type TaskGroup = {
  id: string;
  createdAt: string;
  tasks: Task[];
};

const formatTaskDate = (createdAt: string) => {
  const date = new Date(createdAt);

  return `${date.getMonth() + 1}/${date.getDate()}`;
};

const getTaskDateKey = (createdAt: string) => {
  const date = new Date(createdAt);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
};

const groupTasks = (tasks: Task[]) => {
  return tasks.reduce<TaskGroup[]>((groups, task) => {
    const groupId = getTaskDateKey(task.createdAt);
    const lastGroup = groups.at(-1);

    if (lastGroup?.id === groupId) {
      return [
        ...groups.slice(0, -1),
        { ...lastGroup, tasks: [...lastGroup.tasks, task] },
      ];
    }

    return [
      ...groups,
      {
        id: groupId,
        createdAt: task.createdAt,
        tasks: [task],
      },
    ];
  }, []);
};

export function TaskBlockList() {
  const tasks = useAtomValue(tasksAtom);
  const reorderTasks = useSetAtom(reorderTasksAtom);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const taskGroups = groupTasks(tasks);
  const taskRanks = new Map(
    tasks.map((task, index) => [task.id, index + 1]),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    reorderTasks({
      activeId: String(active.id),
      overId: String(over.id),
    });
  };

  if (tasks.length === 0) {
    return (
      <p className="rounded border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
        まだタスクがありません
      </p>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col gap-3">
        {taskGroups.map((group) => (
          <section
            key={group.id}
            className="overflow-hidden rounded border border-gray-200 bg-white"
          >
            <div className="border-b border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700">
              {formatTaskDate(group.createdAt)}
            </div>
            <div className="py-1">
              <SortableContext
                items={group.tasks.map((task) => task.id)}
                strategy={verticalListSortingStrategy}
              >
                {group.tasks.map((task, index) => {
                  const previousTask = group.tasks[index - 1];
                  const isFirstTaskInBatch =
                    !previousTask || previousTask.groupId !== task.groupId;

                  return (
                    <Fragment key={task.id}>
                      {isFirstTaskInBatch && (
                        <h2 className="px-3 pt-2 pb-1 text-sm font-semibold text-gray-700">
                          {task.title}
                        </h2>
                      )}
                      <TaskBlock
                        task={task}
                        rank={taskRanks.get(task.id) ?? 0}
                      />
                    </Fragment>
                  );
                })}
              </SortableContext>
            </div>
          </section>
        ))}
      </div>
    </DndContext>
  );
}
