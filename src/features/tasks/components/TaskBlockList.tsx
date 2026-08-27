import { useAtomValue } from "jotai";
import type { Task } from "../types/task";
import { tasksAtom } from "../atoms/tasksAtom";
import { TaskBlock } from "./TaskBlock";

type TaskGroup = {
  id: string;
  createdAt: string;
  tasks: Task[];
};

const formatTaskDate = (createdAt: string) => {
  const date = new Date(createdAt);

  return `${date.getMonth() + 1}/${date.getDate()}`;
};

const groupTasks = (tasks: Task[]) => {
  return tasks.reduce<TaskGroup[]>((groups, task) => {
    const groupId = task.groupId ?? task.id;
    const lastGroup = groups.at(-1);

    if (lastGroup?.id === groupId) {
      return [
        ...groups.slice(0, -1),
        { ...lastGroup, tasks: [...lastGroup.tasks, task] },
      ];
    }

    return [
      ...groups,
      {
        id: groupId,
        createdAt: task.createdAt,
        tasks: [task],
      },
    ];
  }, []);
};

export function TaskBlockList() {
  const tasks = useAtomValue(tasksAtom);
  const taskGroups = groupTasks(tasks);

  if (tasks.length === 0) {
    return (
      <p className="rounded border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
        まだタスクがありません
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {taskGroups.map((group) => (
        <section
          key={group.id}
          className="overflow-hidden rounded border border-gray-200 bg-white"
        >
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700">
            {formatTaskDate(group.createdAt)}
          </div>
          {group.tasks.map((task) => (
            <TaskBlock key={task.id} task={task} />
          ))}
        </section>
      ))}
    </div>
  );
}
