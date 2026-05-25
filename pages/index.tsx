import { useModal } from "@/components/Context";
import Spinner from "@/components/Spinner";

import useUser from "@/lib/useUser";

export default function HomePage() {
  const actionClassName = "transition font-medium text-sky-900 hover:underline focus:text-sky-700 focus:underline",
    { user, isLoading: isUserLoading } = useUser(),
    modal = useModal();

  return (
    <main className="mb-8 mt-6 grid items-center justify-center gap-4 sm:gap-6">
      <h1 className="mx-3 break-all text-center text-4xl font-semibold italic text-slate-900 underline decoration-slate-700 drop-shadow sm:text-5xl">
        Voting App
      </h1>
      <section className="mx-3.5 divide-y divide-slate-400 rounded-md border-slate-400 shadow-slate-400 sm:mx-2 sm:border sm:bg-slate-100/75 sm:px-3 sm:shadow md:text-lg">
        {[
          {
            header: "What is this?",
            content: (
              <p>
                This is a Next.js demo where users can create polls and everyone can vote in them.
              </p>
            )
          },
          {
            header: "How can I create a poll?",
            content: (
              <>
                <p>Authenticated users can create polls and share them with anyone:</p>
                <ol
                  role="list"
                  className="mt-2 list-decimal space-y-2 pl-6 leading-tight marker:font-semibold marker:italic marker:text-teal-700 sm:pl-10"
                >
                  {isUserLoading ? (
                    <li>
                      <Spinner />
                    </li>
                  ) : (
                    !user.id && (
                      <li>
                        <button className={actionClassName} onClick={() => modal({ type: "LogIn" })}>
                          Log in
                        </button>{" "}
                        to your account, or{" "}
                        <button className={actionClassName} onClick={() => modal({ type: "SignUp" })}>
                          create one
                        </button>
                        .
                      </li>
                    )
                  )}
                  <li>
                    Open the{" "}
                    <button className={actionClassName} onClick={() => modal({ type: "NewPoll" })}>
                      poll modal
                    </button>{" "}
                    to create a new poll.
                  </li>
                  <li>Once the poll is created, you can share it with anyone.</li>
                  <li>Other authenticated users can create new answers to your poll.</li>
                  <li>You can close your poll whenever you want.</li>
                </ol>
              </>
            )
          },
          {
            header: "Is this project Open Source?",
            content: (
              <>
                <p>
                  Yes! It&apos;s a <em>free</em> and <em>open-source</em> project released under the{" "}
                  <a href="https://www.gnu.org/licenses/agpl-3.0.en.html" target="_blank" rel="noreferrer" className={actionClassName}>
                    GNU AGPL License
                  </a>
                  .
                </p>
                <p className="mt-1.5">
                  <a href="https://github.com/SSbit01/voting-app" target="_blank" rel="noreferrer" className={actionClassName}>
                    <svg viewBox="0 0 16 16" className="mr-1.5 inline-block w-5 align-sub" fill="currentColor" aria-hidden="true">
                      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                    </svg>
                    Repository
                  </a>
                </p>
              </>
            )
          },
          {
            header: "Privacy",
            content: (
              <>
                <p>This website is hosted on Vercel and utilizes MongoDB Atlas deployed in the AWS eu-west-1 region.</p>
                <p>No personal data is collected or sold.</p>
              </>
            )
          },
          {
            header: "Note",
            content: (
              <>
                <p>
                  This project has many <strong className="text-red-600">vulnerabilities</strong> and{" "}
                  <strong className="text-red-600">issues</strong>. Please use it for simple tasks.
                </p>
                <p>
                  <a
                    href="https://github.com/SSbit01/voting-app?tab=readme-ov-file#vulnerabilities"
                    target="_blank"
                    rel="noreferrer"
                    className={actionClassName}
                  >
                    Read more about this
                  </a>
                </p>
              </>
            )
          }
        ].map(({ header, content }, i) => (
          <article key={i} className="py-3">
            <h2 className="mb-1 text-2xl font-semibold italic">{header}</h2>
            {content}
          </article>
        ))}
      </section>
    </main>
  );
}
