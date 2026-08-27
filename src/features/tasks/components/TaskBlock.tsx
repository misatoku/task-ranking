import { useSetAtom } from "jotai";
import { CheckCircle2, Circle, Trash2 } from "lucide-react";
import type { Task } from "../types/task";
import { deletedTaskAtom, toggleTaskAtom } from "../atoms/tasksAtom";

type TaskBlockProps = {
  task: Task;
};

export function TaskBlock({ task }: TaskBlockProps) {
  const toggleTask = useSetAtom(toggleTaskAtom);
  const deleteTask = useSetAtom(deletedTaskAtom);

  return (
    <div className="flex items-start justify-between gap-3 border-b border-gray-200 p-4">
      <button
        type="button"
        onClick={() => toggleTask(task.id)}
        aria-label={task.isCompleted ? "未完了に戻す" : "完了にする"}
        className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded hover:bg-gray-50"
      >
        {task.isCompleted ? (
          <CheckCircle2 size={20} aria-hidden="true" />
        ) : (
          <Circle size={20} aria-hidden="true" />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-gray-500">{task.title}</p>
        <p
          className={
            task.isCompleted
              ? "break-words text-gray-500 line-through"
              : "break-words text-gray-900"
          }
        >
          {task.content}
        </p>
      </div>

      <button
        type="button"
        onClick={() => deleteTask(task.id)}
        aria-label="タスクを削除"
        className="grid h-8 w-8 shrink-0 place-items-center rounded hover:bg-gray-50"
      >
        <Trash2 size={18} aria-hidden="true" />
      </button>
    </div>
  );
}
