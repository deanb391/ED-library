"use client";

export default function AboutSection() {
  return (
    <section className="min-h-screen bg-[#F8F9FB] px-4 py-14">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <header className="mb-5 space-y-4" >
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900" style={{paddingTop: 15}}>
            About
          </h1>
          <div className="h-1 w-12 rounded-full bg-gray-900" />
          <p className="max-w-2xl text-gray-600 leading-relaxed">
            A focused platform for accessing and sharing academic resources,
            without noise, friction, or pointless extras.
          </p>
        </header>

        {/* Main content */}
        <div className="relative mb-16 rounded-2xl bg-white p-8 shadow-sm space-y-6">
          <p className="text-gray-800 leading-relaxed" style={{color: "blue"}}>
            This platform exists for one reason:
            <span className="font-medium text-gray-900">
              {" "}to make academic content easier to find and easier to use.
            </span>
            No cluttered dashboards. No distractions pretending to be features.
          </p>

          <p className="text-gray-700 leading-relaxed">
            Students can browse courses, materials, and departments quickly
            and predictably. Contributors can publish resources knowing they
            reach the right audience instead of disappearing into a feed.
          </p>

          <p className="text-gray-700 leading-relaxed">
            Every design and technical decision is measured against one
            question: does this improve learning?
            If the answer is no, it doesn’t ship.
          </p>
        </div>

        {/* Principles */}
        <section>
          <h2 className="mb-2 text-lg font-medium text-gray-900" style={{marginTop: 20}}>
            Principles
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <ValueCard
              title="Built for students"
              description="Designed around how students actually search, read, and study."
            />
            <ValueCard
              title="Simple by default"
              description="Clear layouts, fewer decisions, and predictable behavior."
            />
            <ValueCard
              title="Fast and dependable"
              description="Pages load quickly, actions respond immediately, failures are obvious."
            />
            <ValueCard
              title="Purpose-driven"
              description="If a feature doesn’t add academic value, it doesn’t belong."
            />
          </div>
        </section>
      </div>
    </section>
  );
}

function ValueCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-xl bg-white p-6 shadow-sm transition hover:shadow-md m-10" style={{margin: 4}}>
      <h3 className="text-sm font-semibold text-gray-900">
        {title}
      </h3>
      <p className="mt-2 text-sm text-gray-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
