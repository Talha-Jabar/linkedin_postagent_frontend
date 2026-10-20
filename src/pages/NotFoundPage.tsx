import { Link } from "react-router";

export function NotFoundPage() {
  return (
    <div className="card p-8 text-center">
      <h1 className="text-xl font-semibold">Page not found</h1>
      <Link to="/" className="mt-3 inline-block text-brand-text hover:underline">
        Back to Generate
      </Link>
    </div>
  );
}
