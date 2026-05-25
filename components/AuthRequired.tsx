import { memo } from "react";
import Link from "next/link";
import { CommandLineIcon, UserPlusIcon, HomeIcon } from "@heroicons/react/24/solid";
import { ExclamationCircleIcon, ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline";

import useUser from "@/lib/useUser";

import { useModal } from "@/components/Context";
import Spinner from "@/components/Spinner";

import type { ReactNode } from "react";

const NotLoggedIn = memo(function NotLoggedIn() {
  const modal = useModal();

  return (
    <main className="mx-4 mt-7 grid justify-center gap-7 text-center">
      <h1 className="text-2xl font-medium text-slate-900 sm:text-3xl">You must be logged in to access this page</h1>
      <section className="grid gap-4 divide-y divide-slate-400">
        <div className="grid gap-2">
          {[
            {
              onClick() {
                modal({ type: "LogIn" });
              },
              jsx: (
                <>
                  <ArrowLeftOnRectangleIcon className="w-6" />
                  Log In
                </>
              )
            },
            {
              onClick() {
                modal({ type: "SignUp" });
              },
              jsx: (
                <>
                  <UserPlusIcon className="w-6" />
                  Sign Up
                </>
              )
            }
          ].map(({ onClick, jsx }, i) => (
            <button
              key={i}
              onClick={onClick}
              className="float-right flex items-center justify-center gap-1.5 rounded border bg-white p-1.5 font-semibold transition focus:ring-4 enabled:border-teal-600 enabled:text-teal-600 enabled:hover:bg-teal-600 enabled:hover:text-white disabled:cursor-not-allowed"
            >
              {jsx}
            </button>
          ))}
        </div>
        <div className="pt-4">
          <Link
            href="/"
            className="flex items-center justify-center gap-1.5 rounded border border-cyan-700 bg-white p-1 font-semibold text-cyan-700 transition hover:bg-cyan-700 hover:text-white focus:ring-4"
          >
            <HomeIcon className="w-6" />
            Go to Home
          </Link>
        </div>
      </section>
    </main>
  );
});

export default function AuthRequired({ children }: { children: ReactNode }) {
  const { user, isLoading, isError } = useUser();

  if (isLoading) return <Spinner className="mx-auto my-8 w-12 text-gray-300" />;

  if (isError) {
    console.error(isError);
    return (
      <main className="mx-4 mt-7 text-center text-slate-800">
        <h1 className="flex items-center justify-center gap-2 text-3xl font-medium italic">
          ERROR
          <ExclamationCircleIcon className="w-8 text-red-700" />
        </h1>
        <h2 className="mt-2">
          Open the <CommandLineIcon className="mr-1 inline w-5 align-text-bottom text-slate-700" />
          Console for more details
        </h2>
      </main>
    );
  }

  return user.id ? <>{children}</> : <NotLoggedIn />;
}
