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

const getTaskDateKey = (createdAt: string): string => {
  const date = new Date(createdAt);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
};

export const reorderTaskGroupsAtom = atom(
  null,
  (
    get,
    set,
    {
      activeGroupId,
      overGroupId,
    }: { activeGroupId: string; overGroupId: string },
  ) => {
    if (activeGroupId === overGroupId) return;

    const tasks = get(tasksAtom);
    const activeTask = tasks.find((task) => task.groupId === activeGroupId);
    const overTask = tasks.find((task) => task.groupId === overGroupId);

    if (
      !activeTask ||
      !overTask ||
      getTaskDateKey(activeTask.createdAt) !==
        getTaskDateKey(overTask.createdAt)
    ) {
      return;
    }

    const dateKey = getTaskDateKey(activeTask.createdAt);
    const dateTasks = tasks.filter(
      (task) => getTaskDateKey(task.createdAt) === dateKey,
    );
    const groupIds = [...new Set(dateTasks.map((task) => task.groupId))];
    const oldIndex = groupIds.indexOf(activeGroupId);
    const newIndex = groupIds.indexOf(overGroupId);

    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedGroupIds = arrayMove(groupIds, oldIndex, newIndex);
    const reorderedDateTasks = reorderedGroupIds.flatMap((groupId) =>
      dateTasks.filter((task) => task.groupId === groupId),
    );
    let dateTaskIndex = 0;
    const nextTasks = tasks.map((task) =>
      getTaskDateKey(task.createdAt) === dateKey
        ? reorderedDateTasks[dateTaskIndex++]
        : task,
    );

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
