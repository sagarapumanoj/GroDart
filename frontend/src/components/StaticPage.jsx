export default function StaticPage({ title, intro, children }) {
  return (
    <article className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold">{title}</h1>
      {intro && <p className="mt-3 text-lg text-muted">{intro}</p>}
      <div className="mt-6 space-y-4 leading-relaxed [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_a]:text-leaf-800 [&_a]:underline [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
        {children}
      </div>
    </article>
  );
}
