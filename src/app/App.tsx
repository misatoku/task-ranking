import { TaskInput } from "../features/tasks/components/TaskInput";
import { TaskBlockList } from "../features/tasks/components/TaskBlockList";

export default function App() {
  return (
    <main className="mx-auto flex h-screen max-w-6xl flex-col overflow-hidden p-8">
      <h1 className="mb-6 shrink-0 text-2xl font-bold">Task Ranking</h1>

      <div className="grid min-h-0  gap-6 lg:grid-cols-2">
        <div className="min-h-0">
          <TaskInput />
        </div>

        <div className="min-h-0 overflow-y-auto pr-2">
          <TaskBlockList />
        </div>
      </div>
    </main>
  );
}
