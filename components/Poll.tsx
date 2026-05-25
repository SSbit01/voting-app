//  TODO: SIMPLIFY STRUCTURE: USE MULTIPLE CONTEXTS

import { memo, useState, useEffect, useMemo, useCallback, Fragment } from "react";
import Link from "next/link";
import clsx from "clsx";
import { useForm, FormProvider } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { Dialog, Menu, Transition } from "@headlessui/react";
import {
  UserPlusIcon,
  CursorArrowRaysIcon,
  ChartBarIcon,
  TrashIcon,
  LockClosedIcon,
  ArrowLeftOnRectangleIcon
} from "@heroicons/react/24/solid";
import { ShareIcon } from "@heroicons/react/24/outline";
import { EllipsisVerticalIcon, CheckBadgeIcon, ExclamationTriangleIcon, PaperAirplaneIcon } from "@heroicons/react/20/solid";

import useUser from "@/lib/useUser";
import useVotes from "@/lib/useVotes";
import fetchJson from "@/lib/fetchJson";
import { answerField } from "@/lib/attributes";

import Spinner from "@/components/Spinner";
import { cookieDisabledState, useModal } from "@/components/Context";
import { SubmitForm } from "@/components/FormFields";

import type { Dispatch, SetStateAction, CSSProperties } from "react";

type UseState<T> = [T, Dispatch<SetStateAction<T>>];

type DisabledState = UseState<boolean>;

type AnswersState = UseState<Answer[]>;

export interface Answer {
  value: string;
  votes: number;
  author?: string;
}

export interface PollProps {
  _id: string;
  question: string;
  author: {
    _id: string;
    name: string;
  };
  closed?: Date;
  answers: Answer[];
  createdAt: Date;
  afterDelete?: (id: string) => any;
}

export interface PollJson extends Omit<PollProps, "closed" | "createdAt" | "afterDelete"> {
  closed?: string;
  createdAt: string;
}

interface ResultCSS extends CSSProperties {
  "--percentage": string;
}

const AnswerResult = memo(function AnswerResult({
  value,
  votes,
  totalVotes,
  isMyVote
}: Answer & {
  totalVotes: number;
  isMyVote?: boolean;
}) {
  const percentage = 100 * (votes / totalVotes) || 0;

  // USE OF ::before TO REPRESENT THE PERCENTAGE
  return (
    <div
      className={`relative flex flex-wrap-reverse items-center gap-x-2.5 p-1.5 before:absolute before:bottom-0 before:left-0 before:top-0 before:z-[-1] before:w-[var(--percentage)] before:animate-bar before:rounded before:shadow ${isMyVote ? "before:bg-cyan-300" : "before:bg-cyan-500"}`}
      title={`${votes} ${votes == 1 ? "vote" : "votes"}`}
      style={
        {
          "--percentage": percentage + "%",
          overflowWrap: "anywhere" // WORD BREAK
        } as ResultCSS
      }
    >
      <span className="leading-5">{value}</span>
      <div className="ml-auto flex items-center gap-1">
        {isMyVote && <CheckBadgeIcon title="My Vote" className="w-5 text-slate-600" />}
        <strong>{Math.round(percentage)}%</strong>
      </div>
    </div>
  );
});

const Results = memo(function Results({
  answers,
  answerVoted,
  closedDate
}: {
  answers: Answer[];
  answerVoted?: Answer["value"];
  closedDate?: PollProps["closed"];
}) {
  const originalAnswers = useMemo(() => answers.filter(({ author }) => !author), [answers]),
    extraAnswers = useMemo(() => answers.filter(({ author }) => author), [answers]),
    //
    totalVotes = useMemo(() => Object.values(answers).reduce((total, { votes }) => total + votes, 0), [answers]),
    //
    [closedDateString, setClosedDateString] = useState(""); // To prevent client-server warning: `Text content did not match`

  useEffect(() => {
    if (!closedDateString && closedDate) {
      setClosedDateString(closedDate.toLocaleString());
    }
  }, [closedDate, closedDateString]);

  function renderAnswerResult({ value, votes }: Answer, i: number) {
    return <AnswerResult key={i} value={value} votes={votes} totalVotes={totalVotes} isMyVote={answerVoted == value} />;
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-2">
        <p>
          <strong>{totalVotes}</strong> vote{totalVotes != 1 && "s"}
        </p>
        {closedDate && (
          <p className="flex flex-wrap items-center gap-1 border-l border-slate-500 pl-1.5 text-sm font-light">
            <LockClosedIcon className="w-3 text-slate-600" />
            Final results<i>({closedDateString})</i>
          </p>
        )}
      </div>
      {Boolean(originalAnswers.length) && (
        <fieldset className="grid gap-1.5 rounded border border-cyan-600 px-1.5 pb-1.5 pt-2">
          <legend className="-mb-1 flex gap-1 px-1 italic">
            <CursorArrowRaysIcon className="w-5 text-cyan-900" />
            Original Answers
          </legend>
          {originalAnswers.map(renderAnswerResult)}
        </fieldset>
      )}
      {Boolean(extraAnswers.length) && (
        <fieldset className="grid gap-1.5 rounded border border-cyan-600 px-1.5 pb-1.5 pt-2">
          <legend className="-mb-1 flex cursor-help gap-1 px-1 italic" title="These answers were added by other users">
            <CursorArrowRaysIcon className="w-5 text-cyan-900" />
            Extra Answers
          </legend>
          {extraAnswers.map(renderAnswerResult)}
        </fieldset>
      )}
    </div>
  );
});

const Options = memo(function Options({
  _id,
  afterDelete,
  disabled,
  answers,
  closedState: [closedDate, setClosedDate]
}: {
  _id: PollProps["_id"];
  closedState: UseState<PollProps["closed"]>;
  disabled: boolean;
  answers?: Answer[];
  afterDelete?: PollProps["afterDelete"];
}) {
  const API = `/api/poll/${_id}`,
    modal = useModal(),
    //
    { myVotes, isLoading: areVotesLoading } = useVotes(),
    //
    areThereAnswers = !!answers?.length; // To prevent 0

  return (
    <Menu as="div" className="absolute right-2 top-2 z-40 -mb-1.5 ml-auto">
      {({ open }) => (
        <>
          <Menu.Button disabled={disabled} className={clsx("rounded transition", open && "ring")}>
            <EllipsisVerticalIcon className="w-6" />
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition duration-200"
            enterFrom="scale-95 opacity-0"
            enterTo="scale-100 opacity-100"
            leave="transition"
            leaveFrom="scale-100 opacity-100"
            leaveTo="scale-95 opacity-0"
          >
            <Menu.Items className="absolute right-0 w-full min-w-max origin-top-right divide-y divide-slate-500 rounded bg-slate-900/75 text-slate-200 shadow backdrop-blur-sm">
              {areThereAnswers && !closedDate && !areVotesLoading && !(_id in myVotes) && (
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => {
                        modal({
                          type: "Alert",
                          children: (
                            <>
                              <p className="-mx-3 -mt-3 mb-3.5 rounded-t-lg bg-slate-900 px-4 py-1 text-center text-teal-100 shadow">
                                {_id}
                              </p>
                              <Results answers={answers} />
                            </>
                          )
                        });
                      }}
                      className={clsx(
                        "flex w-full items-center gap-1.5 py-1 pl-1.5 pr-3 transition duration-150 first:rounded-t last:rounded-b",
                        active && "bg-sky-900"
                      )}
                    >
                      <ChartBarIcon className="w-5" />
                      Results
                    </button>
                  )}
                </Menu.Item>
              )}
              {!closedDate && (
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => {
                        modal({
                          type: "Alert",
                          children: (
                            <>
                              <p className="-mx-3 -mt-3 mb-2.5 rounded-t-lg bg-slate-900 px-4 py-1 text-center text-teal-100 shadow">
                                {_id}
                              </p>
                              <Dialog.Title className="text-center text-xl leading-tight sm:text-2xl">
                                Are you sure you want to <strong className="text-red-700">close</strong> this poll?
                              </Dialog.Title>
                              <Dialog.Description as="ul" className="mt-2 text-left font-thin">
                                <li className="flex gap-1">
                                  <ExclamationTriangleIcon className="w-5 text-red-700" />
                                  This cannot be undone
                                </li>
                                {!areThereAnswers && (
                                  <li className="flex gap-1">
                                    <ExclamationTriangleIcon className="w-5 text-red-700" />
                                    There are no answers!
                                  </li>
                                )}
                              </Dialog.Description>
                            </>
                          ),
                          async confirm() {
                            const {
                              err,
                              closed: newClosedDate
                            }: {
                              err?: string;
                              closed?: string;
                            } = await fetchJson(API, { method: "PATCH" });
                            if (err) {
                              return () =>
                                modal({ type: "Alert", children: <Dialog.Title className="text-center text-2xl">{err}</Dialog.Title> });
                            } else if (newClosedDate) {
                              setClosedDate(new Date(newClosedDate));
                            }
                          }
                        });
                      }}
                      className={clsx(
                        "flex w-full items-center gap-1.5 py-1 pl-1.5 pr-3 transition duration-150 first:rounded-t last:rounded-b",
                        active && "bg-slate-900"
                      )}
                    >
                      <LockClosedIcon className="w-5" />
                      Close Poll
                    </button>
                  )}
                </Menu.Item>
              )}
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => {
                      modal({
                        type: "Alert",
                        children: (
                          <>
                            <p className="-mx-3 -mt-3 mb-2.5 rounded-t-lg bg-slate-900 px-4 py-1 text-center text-teal-100 shadow">{_id}</p>
                            <Dialog.Title className="text-center text-xl sm:text-2xl">
                              Are you sure you want to <strong className="text-red-700">delete this poll</strong>?
                            </Dialog.Title>
                          </>
                        ),
                        async confirm() {
                          const { err }: { err?: string } = await fetchJson(API, { method: "DELETE" });
                          if (err) {
                            return () =>
                              modal({
                                type: "Alert",
                                children: (
                                  <>
                                    <p className="-mx-3 -mt-3 mb-2.5 rounded-t-lg bg-slate-900 px-4 py-1 text-center text-teal-100 shadow">
                                      {_id}
                                    </p>
                                    <Dialog.Title className="text-center text-2xl">{err}</Dialog.Title>
                                  </>
                                )
                              });
                          }
                          afterDelete?.(_id);
                          return () =>
                            modal({
                              type: "Alert",
                              children: (
                                <>
                                  <p className="-mx-3 -mt-3 mb-2.5 rounded-t-lg bg-slate-900 px-4 py-1 text-center text-teal-100 shadow">
                                    {_id}
                                  </p>
                                  <Dialog.Title className="text-center text-2xl">
                                    The poll has been <strong className="text-red-700">deleted</strong>
                                  </Dialog.Title>
                                </>
                              )
                            });
                        }
                      });
                    }}
                    className={clsx(
                      "flex w-full items-center gap-1.5 py-1 pl-1.5 pr-3 transition duration-150 first:rounded-t last:rounded-b",
                      active && "bg-rose-700"
                    )}
                  >
                    <TrashIcon className="w-5" />
                    Delete
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
});

const NewAnswerForm = memo(function NewAnswerForm({
  _id,
  disabledState: [disabled, setDisabled],
  answersState: [answers, setAnswers]
}: Required<Pick<PollProps, "_id">> & {
  disabledState: DisabledState;
  answersState: AnswersState;
}) {
  const { user } = useUser(),
    { mutateVotes, isLoading: areVotesLoading } = useVotes(),
    //
    modal = useModal(),
    //
    methods = useForm({
      mode: "onChange",
      defaultValues: {
        answer: ""
      }
    }),
    {
      handleSubmit,
      register,
      formState: { errors }
    } = methods;

  const onSubmit = handleSubmit(async ({ answer }) => {
    setDisabled(true);

    answer = answer.trim();

    const { err }: { err?: string } = await fetchJson(`/api/poll/${_id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer })
    });

    if (err) {
      modal({ type: "Alert", children: <Dialog.Title className="text-center text-2xl">{err}</Dialog.Title> });
      setDisabled(false);
      throw err;
    }

    setAnswers(prevAnswers => [
      ...prevAnswers,
      {
        value: answer,
        votes: 1,
        author: user.id
      }
    ]);

    mutateVotes(prevVotes => ({ ...prevVotes, [_id]: answer }));

    setDisabled(false);
  });

  return (
    <FormProvider {...methods}>
      <form className="relative grid gap-1.5" onSubmit={onSubmit}>
        <input
          type="text"
          maxLength={answerField.maxLength}
          disabled={disabled}
          className="rounded transition"
          {...register("answer", {
            maxLength: answerField.maxLength,
            validate(value) {
              if (answers.some(({ value: answerValue }) => answerValue == value)) {
                return "Already exists";
              }
            }
          })}
        />
        <ErrorMessage
          errors={errors}
          name="answer"
          render={({ message }) => (
            <p className="absolute -top-2.5 right-2 rounded bg-slate-900/90 px-2 text-sm font-bold text-red-600 shadow backdrop-blur-sm">
              {message}
            </p>
          )}
        />
        <SubmitForm disabled={disabled || areVotesLoading}>
          <span className="flex items-center justify-center gap-1.5">
            Submit New Answer
            <PaperAirplaneIcon className="w-5" />
          </span>
        </SubmitForm>
      </form>
    </FormProvider>
  );
});

const AnswerButton = memo(function AnswerButton({
  value,
  onClick
}: {
  value: string;
  onClick(event: { currentTarget: HTMLButtonElement }): any;
}) {
  return (
    <button
      value={value}
      onClick={onClick}
      className="rounded border bg-white px-2.5 py-1.5 text-left font-semibold leading-5 shadow transition focus:ring enabled:border-cyan-500 enabled:text-cyan-700 enabled:hover:bg-cyan-600 enabled:hover:text-white disabled:cursor-not-allowed"
    >
      {value}
    </button>
  );
});

const NotLoggedIn = memo(function NotLoggedIn() {
  const modal = useModal();

  return (
    <div>
      <p className="text-center font-light sm:text-lg">You must be logged in to create a new answer</p>
      <div className="mt-2 grid gap-1.5">
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
    </div>
  );
});

const SelectAnswer = memo(function SelectAnswer(
  props: Required<Pick<PollProps, "_id">> & {
    disabledState: DisabledState;
    answersState: AnswersState;
    authorId?: NonNullable<PollProps["author"]>["_id"];
  }
) {
  const { authorId, ...restProps } = props,
    {
      _id,
      answersState: [answers, setAnswers],
      disabledState: [disabled, setDisabled]
    } = restProps,
    //
    { mutateVotes, isLoading: areVotesLoading } = useVotes(),
    //
    { user, isLoading: isUserLoading } = useUser(),
    modal = useModal(),
    //
    originalAnswers = useMemo(() => answers.filter(({ author }) => !author), [answers]),
    extraAnswers = useMemo(() => answers.filter(({ author }) => author), [answers]);

  const onClick = useCallback(
    async function ({ currentTarget: { value } }: { currentTarget: HTMLButtonElement }) {
      if (!disabled) {
        if (navigator.cookieEnabled) {
          setDisabled(true);

          const { err }: { err?: string } = await fetchJson(`/api/vote/${_id}?answer=${value}`);

          if (err) {
            modal({ type: "Alert", children: <Dialog.Title className="text-center text-2xl">{err}</Dialog.Title> });
          } else {
            setAnswers(prevAnswers => {
              prevAnswers.find(({ value: v }) => v === value)!.votes++;
              return [...prevAnswers];
            });
            mutateVotes(prevVotes => ({ ...prevVotes, [_id]: value }));
          }

          setDisabled(false);
        } else {
          modal(cookieDisabledState);
        }
      }
    },
    [_id, modal, mutateVotes, setAnswers, disabled, setDisabled]
  );

  function renderAnswerButton({ value }: Answer, i: number) {
    return <AnswerButton key={i} value={value} onClick={onClick} />;
  }

  return (
    <div className="grid gap-3">
      {Boolean(originalAnswers.length) && (
        <fieldset disabled={disabled || areVotesLoading} className="rounded border border-cyan-600 px-1.5 pb-1.5 pt-2">
          <legend className="-mb-1 flex gap-1 px-1 italic">
            <CursorArrowRaysIcon className="w-5 text-cyan-900" />
            Original Answers
          </legend>
          <div className="grid gap-1.5">{originalAnswers.map(renderAnswerButton)}</div>
        </fieldset>
      )}
      <fieldset disabled={disabled || areVotesLoading} className="rounded border border-cyan-600 px-1.5 pb-1.5 pt-2 empty:hidden">
        <legend className="-mb-1 flex cursor-help gap-1 px-1 italic" title="These answers were added by other users">
          <CursorArrowRaysIcon className="w-5 text-cyan-900" />
          Extra Answers
        </legend>
        <div className="mb-3 grid gap-1.5 empty:hidden">{extraAnswers.map(renderAnswerButton)}</div>
        {isUserLoading ? (
          <Spinner className="m-auto w-6 text-slate-300" />
        ) : user.id ? (
          authorId === user.id ? (
            <p className="text-center font-light">Authors cannot create new answers</p>
          ) : (
            <NewAnswerForm {...restProps} />
          )
        ) : (
          <NotLoggedIn />
        )}
      </fieldset>
    </div>
  );
});

const CreatedAt = memo(function CreatedAt({ date }: { date: PollProps["createdAt"] }) {
  const [dateString, setDateString] = useState(""); // To prevent client-server warning: `Text content did not match`

  useEffect(() => {
    if (!dateString) {
      setDateString(date.toLocaleString());
    }
  }, [date, dateString]);

  return <p className="text-sm italic">{dateString}</p>;
});

const ShareButton = memo(function ShareButton({ _id }: Pick<PollProps, "_id">) {
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    if (!showShare && navigator?.["canShare"]) {
      setShowShare(true);
    }
  }, [showShare]);

  return showShare ? (
    <button
      title="Share Poll"
      className="rounded-sm align-bottom text-slate-600 transition hover:text-slate-700 focus:ring"
      onClick={() => {
        navigator.share({
          url: window.location.origin + `/poll/${_id}`
        });
      }}
    >
      <ShareIcon className="w-6" />
    </button>
  ) : null;
});

export default memo(function MyPoll({
  _id,
  question,
  author,
  createdAt,
  closed: closedProp,
  answers: answersProp,
  afterDelete
}: PollProps) {
  const disabledState = useState(false),
    closedState = useState(closedProp),
    answersState = useState(answersProp),
    //
    { user, isLoading: isUserLoading } = useUser(),
    { myVotes } = useVotes(),
    //
    answerCreatedByUser = useMemo(
      () => user?.id && answersState[0].find(({ author: authorId }) => authorId == user.id)?.value,
      [user, answersState]
    ),
    answerVoted = useMemo(() => answerCreatedByUser || myVotes[_id], [_id, myVotes, answerCreatedByUser]);

  return (
    <article
      title={closedState[0] ? "Closed" : undefined}
      className="relative z-0 w-full max-w-2xl rounded-lg border border-slate-400 bg-slate-50/80 p-3 shadow-md"
      style={{
        overflowWrap: "anywhere" // WORD BREAK
      }}
    >
      <Link
        href={`/user/${author._id}`}
        className="font-medium italic leading-4 text-slate-600 transition hover:underline focus:text-slate-800"
      >
        @{author.name}
      </Link>

      {isUserLoading ? (
        <Spinner className="absolute right-3 top-2 mx-auto w-5 text-slate-400" />
      ) : (
        author?._id &&
        user.id === author._id && (
          <Options _id={_id} afterDelete={afterDelete} closedState={closedState} disabled={disabledState[0]} answers={answersState[0]} />
        )
      )}

      <h1 className="mb-3 mt-1 text-xl font-semibold text-cyan-800">{question}</h1>

      {answerVoted || closedState[0] ? (
        <Results answers={answersState[0]} answerVoted={answerVoted} closedDate={closedState[0]} />
      ) : (
        <SelectAnswer _id={_id} authorId={author?._id} answersState={answersState} disabledState={disabledState} />
      )}

      <div className="mb-4 mt-5 flex items-end justify-between">
        <CreatedAt date={createdAt} />
        <ShareButton _id={_id} />
      </div>

      <Link
        href={`/poll/${_id}`}
        className="-mx-3 -mb-3 -mt-1 block rounded-b-lg bg-slate-800 p-1 text-center font-medium text-cyan-600 hover:underline"
      >
        {_id}
      </Link>

      {closedState[0] && <LockClosedIcon className="absolute right-0 top-0 z-[-2] max-h-[85%] text-slate-300 drop-shadow-md" />}
    </article>
  );
});
