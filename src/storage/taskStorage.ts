import type { Task } from "../features/tasks/types/task";

const STORAGE_KEY = "task-ranking-tasks";

export function loadTasks(): Task[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];

  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
