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
    <div className="flex items-center justify-between gap-2 px-3 py-1">
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
