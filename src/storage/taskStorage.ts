import type { task } from "src\features\tasks\types\task.ts";

const STRAGE_KEY = "task-ranking-tasks";

export function loadTasks(): Task[] {
  const data = localStorage.getItem(STRAGE_KEY);
  if (!data) return [];

  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]) {
  localStorage.setItem(STRAGE_KEY, JSON.stringify(tasks));
}
