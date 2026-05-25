import Link from "next/link";
import { HomeIcon } from "@heroicons/react/24/solid";

export default function Error404Page() {
  return (
    <main className="mb-6 mt-10 flex flex-col items-center justify-center gap-9 p-5 text-center">
      <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
        <h1 className="border-slate-400 text-9xl sm:border-r sm:pr-7">
          <strong>404</strong>
        </h1>
        <p className="text-2xl">Page Not Found</p>
      </div>
      <Link
        href="/"
        className="flex cursor-pointer justify-center gap-3 rounded-lg bg-cyan-800 p-3 text-xl font-medium text-slate-100 shadow-lg transition hover:bg-cyan-700 focus:ring-4"
      >
        <HomeIcon className="w-7" />
        Go to Home
      </Link>
    </main>
  );
}
