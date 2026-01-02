import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/anotherPage')({
  component: AnotherPage,
})

function AnotherPage() {
  return (
    <main className="p-8 flex flex-col gap-16">
      <h1 className="text-4xl font-bold text-center">Headache Tracker</h1>
      <div className="flex flex-col gap-8 max-w-lg mx-auto">
        <p>This is another page in the application.</p>
        <Link to="/" className="text-blue-600 underline hover:no-underline">
          Back to Tracker
        </Link>
      </div>
    </main>
  )
}
