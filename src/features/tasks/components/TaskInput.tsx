import { useRef, useState } from "react";
import { useSetAtom } from "jotai";
import { Check, Trash2 } from "lucide-react";
import { addTasksAtom } from "../atoms/tasksAtom";

type DraftTask = {
  id: string;
  content: string;
};

const createDraftTask = (): DraftTask => ({
  id: crypto.randomUUID(),
  content: "",
});

export function TaskInput() {
  const [title, setTitle] = useState(""); // 変更したらその都度表示も変更する
  const [draftTasks, setDraftTasks] = useState<DraftTask[]>([
    createDraftTask(),
  ]);
  const taskInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const addTasks = useSetAtom(addTasksAtom);

  const hasTaskContent = draftTasks.some((task) => task.content.trim() !== "");
  const canComplete = title.trim() !== "" && hasTaskContent;

  const focusTaskInput = (id: string) => {
    requestAnimationFrame(() => {
      taskInputRefs.current[id]?.focus();
    });
  };

  const addDraftTaskAfter = (id?: string) => {
    const newTask = createDraftTask();

    setDraftTasks((currentTasks) => {
      if (!id) return [...currentTasks, newTask];

      const targetIndex = currentTasks.findIndex((task) => task.id === id);
      if (targetIndex === -1) return [...currentTasks, newTask];

      return [
        ...currentTasks.slice(0, targetIndex + 1),
        newTask,
        ...currentTasks.slice(targetIndex + 1),
      ];
    });
    focusTaskInput(newTask.id);
  };

  const updateDraftTask = (id: string, content: string) => {
    setDraftTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id ? { ...task, content } : task,
      ),
    );
  };

  const deleteDraftTask = (id: string) => {
    setDraftTasks((currentTasks) => {
      if (currentTasks.length === 1) {
        return [{ ...currentTasks[0], content: "" }];
      }

      return currentTasks.filter((task) => task.id !== id);
    });
  };

  const handleComplete = () => {
    if (!canComplete) return;

    addTasks(
      title,
      draftTasks.map((task) => task.content),
    );
    setTitle("");
    setDraftTasks([createDraftTask()]);
  };

  return (
    <section className="flex flex-col gap-4 rounded border border-gray-200 bg-white p-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-700" htmlFor="title">
          タスクの題名
        </label>
        <input
          id="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="例: 今日やること"
          className="w-full rounded border border-gray-300 px-3 py-2 outline-none focus:border-black"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <label className="text-sm font-semibold text-gray-700">タスク</label>
        </div>

        <div className="flex flex-col gap-2">
          {draftTasks.map((task, index) => (
            <div key={task.id} className="flex items-center gap-2">
              <span className="w-6 shrink-0 text-right text-sm text-gray-500">
                {index + 1}
              </span>
              <input
                ref={(element) => {
                  taskInputRefs.current[task.id] = element;
                }}
                value={task.content}
                onChange={(event) =>
                  updateDraftTask(task.id, event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addDraftTaskAfter(task.id);
                  }
                }}
                placeholder="タスクを入力"
                className="min-w-0 flex-1 rounded border border-gray-300 px-3 py-2 outline-none focus:border-black"
              />
              <button
                type="button"
                onClick={() => deleteDraftTask(task.id)}
                aria-label={`${index + 1}番目のタスクを削除`}
                className="grid h-10 w-10 shrink-0 place-items-center rounded border border-gray-300 hover:bg-gray-50"
              >
                <Trash2 size={18} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleComplete}
        disabled={!canComplete}
        className="inline-flex h-11 items-center justify-center gap-2 rounded bg-black px-4 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        <Check size={18} aria-hidden="true" />
        完了
      </button>
    </section>
  );
}
