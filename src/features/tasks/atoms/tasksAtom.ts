import { atom } from "jotai";
import type { Task } from "../types/task";
import { loadTasks, saveTasks } from "../../../storage/taskStorage";
import { createTask } from "../utils/createTask";

export const tasksAtom = atom<Task[]>(loadTasks());

export const addTasksAtom = atom(
  null,
  (get, set, title: string, contents: string[]) => {
    const normalizedTitle = title.trim();
    const normalizedContents = contents
      .map((content) => content.trim())
      .filter(Boolean);

    if (!normalizedTitle || normalizedContents.length === 0) return;

    const groupId = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const newTasks = normalizedContents.map((content) =>
      createTask(normalizedTitle, content, { groupId, createdAt }),
    );
    const nextTasks = [...get(tasksAtom), ...newTasks];

    set(tasksAtom, nextTasks);
    saveTasks(nextTasks);
  },
);

export const toggleTaskAtom = atom(null, (get, set, taskId: string) => {
  const nextTasks = get(tasksAtom).map((task) =>
    task.id === taskId
      ? { ...task, isCompleted: !task.isCompleted }
      : task,
  );

  set(tasksAtom, nextTasks);
  saveTasks(nextTasks);
});

export const deletedTaskAtom = atom(null, (get, set, taskId: string) => {
  const nextTasks = get(tasksAtom).filter((task) => task.id !== taskId);

  set(tasksAtom, nextTasks);
  saveTasks(nextTasks);
});
