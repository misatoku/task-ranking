import { useSetAtom } from "jotai";
import { CheckCircle2, Circle, GripVertical, Trash2 } from "lucide-react";
import type { Task } from "../types/task";
import { deletedTaskAtom, toggleTaskAtom } from "../atoms/tasksAtom";
import type { CSSProperties } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type TaskBlockProps = {
  task: Task;
  rank: number;
};

export function TaskBlock({ task, rank }: TaskBlockProps) {
  const toggleTask = useSetAtom(toggleTaskAtom);
  const deleteTask = useSetAtom(deletedTaskAtom);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      className="flex items-center justify-between gap-2 px-3 py-1"
      ref={setNodeRef}
      style={style}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="タスクを並べ替える"
        className="grid h-7 w-7 shrink-0 cursor-grab place-items-center rounded hover:bg-gray-50 active:cursor-grabbing"
      >
        <GripVertical size={15} aria-hidden="true" />
      </button>

      <span
        aria-label={`順位 ${rank}`}
        className="w-6 shrink-0 text-center text-sm font-semibold tabular-nums text-gray-600"
      >
        {rank}
      </span>

      <button
        type="button"
        onClick={() => toggleTask(task.id)}
        aria-label={task.isCompleted ? "未完了に戻す" : "完了にする"}
        className="grid h-7 w-7 shrink-0 place-items-center rounded hover:bg-gray-50"
      >
        {task.isCompleted ? (
          <CheckCircle2 size={15} aria-hidden="true" />
        ) : (
          <Circle size={15} aria-hidden="true" />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={
            task.isCompleted
              ? "break-words text-sm leading-tight text-gray-500 line-through"
              : "break-words text-sm leading-tight text-gray-900"
          }
        >
          {task.content}
        </p>
      </div>

      <button
        type="button"
        onClick={() => deleteTask(task.id)}
        aria-label="タスクを削除"
        className="grid h-7 w-7 shrink-0 place-items-center rounded hover:bg-gray-50"
      >
        <Trash2 size={15} aria-hidden="true" />
      </button>
    </div>
  );
}
