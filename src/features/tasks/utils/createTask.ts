import type { Task } from "../types/task";

type CreateTaskOptions = {
  groupId: string;
  createdAt?: string;
};

export function createTask(
  title: string,
  contents: string,
  options: CreateTaskOptions,
): Task {
  return {
    id: crypto.randomUUID(),
    groupId: options.groupId,
    title,
    content: contents,
    isCompleted: false,
    createdAt: options.createdAt ?? new Date().toISOString(),
  };
}
