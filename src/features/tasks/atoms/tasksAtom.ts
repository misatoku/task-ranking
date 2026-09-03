import { atom } from "jotai";
import type { Task } from "../types/task";
import { loadTasks, saveTasks } from "../../../storage/taskStorage";
import { createTask } from "../utils/createTask";
import { arrayMove } from "@dnd-kit/sortable";

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
    const nextTasks = [...newTasks, ...get(tasksAtom)];

    set(tasksAtom, nextTasks);
    saveTasks(nextTasks);
  },
);

export const reorderTasksAtom = atom(
  null,
  (get, set, { activeId, overId }: { activeId: string; overId: string }) => {
    const tasks = get(tasksAtom);
    const oldIndex = tasks.findIndex((task) => task.id === activeId);
    const newIndex = tasks.findIndex((task) => task.id === overId);

    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
      return;
    }

    const nextTasks = arrayMove(tasks, oldIndex, newIndex);

    set(tasksAtom, nextTasks);
    saveTasks(nextTasks);
  },
);

export const toggleTaskAtom = atom(null, (get, set, taskId: string) => {
  const nextTasks = get(tasksAtom).map((task) =>
    task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task,
  );

  set(tasksAtom, nextTasks);
  saveTasks(nextTasks);
});

export const deletedTaskAtom = atom(null, (get, set, taskId: string) => {
  const nextTasks = get(tasksAtom).filter((task) => task.id !== taskId);

  set(tasksAtom, nextTasks);
  saveTasks(nextTasks);
});

export const deleteTaskGroupAtom = atom(null, (get, set, groupId: string) => {
  const nextTasks = get(tasksAtom).filter((task) => task.groupId !== groupId);

  set(tasksAtom, nextTasks);
  saveTasks(nextTasks);
});
