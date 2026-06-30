import { atom } from "jotai";
import type { Task } from "../types/task";
import { loadTasks } from "../../../storage/taskStorage";

export const tasksAtom = atom<Task[]>(loadTasks());
