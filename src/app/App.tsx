import { TaskInput } from "../features/tasks/components/TaskInput";
import { TaskBlockList } from "../features/tasks/components/TaskBlockList";

export default function App() {
  return (
    <>
      <main className="mx-auto max-w-6xl p-8">
        <h1 className="mb-6 text-2xl font-bold">Task Ranking</h1>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <TaskInput />
          </div>

          <div>
            <TaskBlockList />
          </div>
        </div>
      </main>
    </>
  );
}
