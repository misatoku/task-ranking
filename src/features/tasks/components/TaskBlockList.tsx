import type { CSSProperties } from "react";
import type { Task } from "../types/task";
import {
  deleteTaskGroupAtom,
  reorderTaskGroupsAtom,
  reorderTasksAtom,
  tasksAtom,
} from "../atoms/tasksAtom";
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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2 } from "lucide-react";

type TaskGroup = {
  id: string;
  createdAt: string;
  tasks: Task[];
};

type TaskBatch = {
  id: string;
  title: string;
  tasks: Task[];
};

type TaskBlockListProps = {
  view: "today" | "history";
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

const groupTasks = (tasks: Task[]) =>
  tasks.reduce<TaskGroup[]>((groups, task) => {
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
      { id: groupId, createdAt: task.createdAt, tasks: [task] },
    ];
  }, []);

const getTaskBatches = (tasks: Task[]) => {
  const batches = new Map<string, TaskBatch>();

  tasks.forEach((task) => {
    const batch = batches.get(task.groupId);
    if (batch) {
      batch.tasks.push(task);
    } else {
      batches.set(task.groupId, {
        id: task.groupId,
        title: task.title,
        tasks: [task],
      });
    }
  });

  return [...batches.values()];
};

const getTaskRanks = (tasks: Task[]) => {
  const groupRanks = new Map<string, number>(); // groupIdごとの順位を保持するMapを作成

  return new Map(
    tasks.map((task) => {
      const rank = (groupRanks.get(task.groupId) ?? 0) + 1; // 現在のgroupIdの順位を取得し、1を加算
      groupRanks.set(task.groupId, rank); // 更新した順位を保存

      return [task.id, rank];
    }),
  );
};

type SortableTaskBatchProps = {
  batch: TaskBatch;
  taskRanks: Map<string, number>;
  onDelete: (groupId: string) => void;
  onReorderTasks: (activeId: string, overId: string) => void;
};

function SortableTaskBatch({
  batch,
  taskRanks,
  onDelete,
  onReorderTasks,
}: SortableTaskBatchProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `group:${batch.id}` });
  const taskSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : 1,
    zIndex: isDragging ? 1 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative bg-white">
      <div className="flex items-center justify-between px-3 pt-2 pb-1">
        <h2
          {...attributes}
          {...listeners}
          className="min-w-0 flex-1 cursor-grab touch-none select-none rounded py-1 text-sm font-semibold text-gray-700 active:cursor-grabbing"
        >
          {batch.title}
        </h2>
        <button
          type="button"
          onClick={() => onDelete(batch.id)}
          aria-label={`${batch.title}をまとめて削除`}
          className="grid h-7 w-7 shrink-0 place-items-center rounded hover:bg-gray-50"
        >
          <Trash2 size={15} aria-hidden="true" />
        </button>
      </div>

      <DndContext
        sensors={taskSensors}
        collisionDetection={closestCenter}
        onDragEnd={({ active, over }) => {
          if (over && active.id !== over.id) {
            onReorderTasks(String(active.id), String(over.id));
          }
        }}
      >
        <SortableContext
          items={batch.tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {batch.tasks.map((task) => (
            <TaskBlock
              key={task.id}
              task={task}
              rank={taskRanks.get(task.id) ?? 0}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}

export function TaskBlockList({ view }: TaskBlockListProps) {
  const tasks = useAtomValue(tasksAtom);
  const reorderTasks = useSetAtom(reorderTasksAtom);
  const reorderTaskGroups = useSetAtom(reorderTaskGroupsAtom);
  const deleteTaskGroup = useSetAtom(deleteTaskGroupAtom);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const todayKey = getTaskDateKey(new Date().toISOString());
  const visibleTasks = tasks.filter((task) => {
    const taskDateKey = getTaskDateKey(task.createdAt);
    return view === "today" ? taskDateKey === todayKey : taskDateKey < todayKey;
  });
  const taskGroups = groupTasks(visibleTasks);
  const taskRanks = getTaskRanks(visibleTasks);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId.startsWith("group:") && overId.startsWith("group:")) {
      reorderTaskGroups({
        activeGroupId: activeId.slice("group:".length),
        overGroupId: overId.slice("group:".length),
      });
    }
  };

  if (visibleTasks.length === 0) {
    return (
      <p className="rounded border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
        {view === "today"
          ? "今日のタスクはありません"
          : "過去のタスクはありません"}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {taskGroups.map((group) => {
        const batches = getTaskBatches(group.tasks);
        return (
          <DndContext
            key={group.id}
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <section className="overflow-hidden rounded border border-gray-200 bg-white">
              <div className="border-b border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700">
                {formatTaskDate(group.createdAt)}
              </div>
              <div className="py-1">
                <SortableContext
                  items={batches.map((batch) => `group:${batch.id}`)}
                  strategy={verticalListSortingStrategy}
                >
                  {batches.map((batch) => (
                    <SortableTaskBatch
                      key={batch.id}
                      batch={batch}
                      taskRanks={taskRanks}
                      onDelete={deleteTaskGroup}
                      onReorderTasks={(activeId, overId) =>
                        reorderTasks({ activeId, overId })
                      }
                    />
                  ))}
                </SortableContext>
              </div>
            </section>
          </DndContext>
        );
      })}
    </div>
  );
}
