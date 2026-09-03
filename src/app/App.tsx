import { TaskInput } from "../features/tasks/components/TaskInput";
import { TaskBlockList } from "../features/tasks/components/TaskBlockList";
import { Link, Route, Routes, useLocation } from "react-router-dom";

type TaskListPanelProps = {
  view: "today" | "history";
};

function TaskListPanel({ view }: TaskListPanelProps) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto pr-2">
      <TaskBlockList view={view} />
    </div>
  );
}

export default function App() {
  const isHistory = useLocation().pathname === "/history";

  return (
    <main className="mx-auto flex h-screen max-w-6xl flex-col overflow-hidden p-8">
      <div className="mb-6 flex shrink-0 items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Task Ranking</h1>
        <div className="flex items-center gap-4">
          <h2 className="font-semibold">
            {isHistory ? "過去の履歴" : "今日のタスク"}
          </h2>
          <Link
            to={isHistory ? "/" : "/history"}
            className="rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
          >
            {isHistory ? "今日に戻る" : "過去の履歴を見る"}
          </Link>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-2">
        <div className="min-h-0">
          <TaskInput />
        </div>

        <div className="flex min-h-0 flex-col">
          <Routes>
            <Route index element={<TaskListPanel view="today" />} />
            <Route path="history" element={<TaskListPanel view="history" />} />
          </Routes>
        </div>
      </div>
    </main>
  );
}
