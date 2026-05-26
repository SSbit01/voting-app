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
            content: <p>This is a Next.js demo where users can create polls and everyone can vote in them.</p>
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
                <p>No personal data is collected or sold by the platform itself.</p>
                <p>But the underlying services may collect data as outlined in their privacy policies.</p>
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
