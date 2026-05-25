import { memo, useState, useCallback, Fragment, useEffect } from "react";
import Link from "next/link";
import { useForm, FormProvider } from "react-hook-form";
import { Transition, Dialog } from "@headlessui/react";
import { UserPlusIcon } from "@heroicons/react/24/solid";
import { ArrowLeftOnRectangleIcon, LinkIcon } from "@heroicons/react/24/outline";
import { XCircleIcon, PlusIcon, CheckIcon } from "@heroicons/react/20/solid";

import fetchJson from "@/lib/fetchJson";
import useUser from "@/lib/useUser";

import { useModal } from "@/components/Context";
import { NameField, PasswordField, QuestionField, AnswersField, SubmitForm, ResetButton } from "@/components/FormFields";
import Spinner from "@/components/Spinner";

import type { ReactNode } from "react";

const CloseModalButton = memo(function CloseModalButton({ onClick, disabled }: { onClick(): void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Close Modal"
      className="absolute right-1.5 top-1.5 transition-colors enabled:cursor-pointer enabled:text-rose-700 enabled:hover:text-rose-600 disabled:cursor-not-allowed disabled:text-red-900"
      disabled={disabled}
    >
      <XCircleIcon className="w-7" />
    </button>
  );
});

export interface ModalProps {
  show: boolean;
  onClose: () => void;
}

export type ReturnConfirmFunction = void | (() => any);
export type ConfirmFunction = () => Promise<ReturnConfirmFunction> | ReturnConfirmFunction;

function Modal({
  show,
  onClose,
  afterLeave,
  className = "relative bg-slate-200/80 p-3 rounded-lg border border-slate-500 shadow m-auto",
  children
}: ModalProps & {
  afterLeave?: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Transition
      show={show}
      as={Fragment}
      enter="transition-opacity duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-300"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <Dialog
        onClose={onClose}
        className="fixed inset-0 z-50 flex overflow-auto bg-black/40 px-1.5 pb-4 pt-2 backdrop-blur-sm"
        aria-hidden="true"
      >
        <Transition.Child
          as={Fragment}
          enter="transition-transform duration-300"
          enterFrom="scale-95"
          enterTo="scale-100"
          leave="transition-transform duration-300"
          leaveFrom="scale-100"
          leaveTo="scale-95"
          afterLeave={afterLeave}
        >
          <Dialog.Panel className={className}>{children}</Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
}

export const Alert = memo(function Alert({
  show,
  onClose,
  children,
  confirm
}: ModalProps & {
  children: ReactNode;
  confirm?: ConfirmFunction;
}) {
  const [disabled, setDisabled] = useState(false),
    [functionAfterLeave, setFunctionAfterLeave] = useState<Function>();

  function closeModal() {
    if (!disabled) {
      onClose();
    }
  }

  function afterLeave() {
    setDisabled(false);

    if (functionAfterLeave) {
      functionAfterLeave();
      setFunctionAfterLeave(undefined); // Prevents to run `functionAfterLeave()` in future instances
    }
  }

  return (
    <Modal show={show} onClose={closeModal} afterLeave={afterLeave}>
      {children}
      {disabled ? (
        <p className="-mx-3 -mb-3 mt-4 rounded-b-md bg-slate-700 p-2 text-center font-medium text-white">
          <Spinner />
          Processing...
        </p>
      ) : (
        <div className="mt-4 flex">
          {confirm && (
            <button
              type="button"
              onClick={async () => {
                setDisabled(true);
                const functionReturned = await confirm?.();
                if (functionReturned) {
                  setFunctionAfterLeave(() => functionReturned);
                }
                onClose();
              }}
              className="flex-1 bg-sky-800 p-2 text-center font-bold text-white shadow-lg transition first:-mb-3 first:-ml-3 first:rounded-bl last:-mb-3 last:-mr-3 last:rounded-br enabled:cursor-pointer enabled:hover:bg-sky-700 enabled:focus:bg-sky-600 enabled:focus:shadow-cyan-500/50 disabled:cursor-not-allowed disabled:bg-slate-900 disabled:text-slate-500"
            >
              Yes
            </button>
          )}
          <button
            type="button"
            onClick={() => onClose()}
            className="flex-1 bg-slate-800 p-2 text-center font-bold text-white shadow-lg transition first:-mb-3 first:-ml-3 first:rounded-bl last:-mb-3 last:-mr-3 last:rounded-br enabled:cursor-pointer enabled:hover:bg-slate-700 enabled:focus:bg-slate-600 enabled:focus:shadow-cyan-900/50 disabled:cursor-not-allowed disabled:bg-slate-900 disabled:text-slate-500"
          >
            {confirm ? "Cancel" : "OK"}
          </button>
        </div>
      )}
    </Modal>
  );
});

function NotLoggedInModal({ show, onClose, children }: ModalProps & { children: ReactNode }) {
  const modal = useModal(),
    [afterLeave, setAfterLeave] = useState<() => void>(); // Headless UI v1.7.4: There is a bug in the overflow style in documentElement when a modal is closing and another shows at the same time, that is the reason why I can't simply use `modal({ type "..." })`. This is a quick solution

  function closeModal() {
    onClose();
    setAfterLeave(undefined); // Prevents to run `afterLeave()` in future instances
  }

  return (
    <Modal show={show} onClose={closeModal} afterLeave={afterLeave}>
      {children}

      <div className="mt-4 grid gap-2 border-t border-slate-400 pt-4">
        {[
          {
            async onClick() {
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
            onClick={() => {
              setAfterLeave(() => onClick);
              onClose();
            }}
            className="float-right flex items-center justify-center gap-1.5 rounded border bg-white p-1.5 font-semibold transition focus:ring-4 enabled:border-teal-600 enabled:text-teal-600 enabled:hover:bg-teal-600 enabled:hover:text-white disabled:cursor-not-allowed"
          >
            {jsx}
          </button>
        ))}
      </div>

      <button
        onClick={closeModal}
        className="mt-5 w-full rounded bg-slate-700 px-5 py-1.5 text-lg text-slate-50 shadow-md transition hover:bg-slate-600 focus:ring-4"
      >
        OK
      </button>
    </Modal>
  );
}

export const SignUp = memo(function SignUp({ show, onClose }: ModalProps) {
  const methods = useForm({
      mode: "onChange",
      defaultValues: {
        name: "",
        password: ""
      }
    }),
    {
      handleSubmit,
      setError,
      reset,
      formState: { isSubmitting }
    } = methods,
    //
    { mutateUser } = useUser();

  const closeModal = useCallback(() => {
    if (!isSubmitting) {
      onClose();
    }
  }, [isSubmitting, onClose]);

  const onSubmit = handleSubmit(async function onSubmit(data) {
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      switch (res.status) {
        case 200:
          res.json().then(({ id }) => {
            mutateUser({
              id,
              name: data.name
            });
            closeModal();
          });
          break;
        case 409:
          setError(
            "name",
            {
              message: "Choose Another"
            },
            {
              shouldFocus: true
            }
          );
      }
    } catch (err) {
      alert(err);
      throw err;
    }
  });

  return (
    <Modal
      show={show}
      onClose={closeModal}
      afterLeave={reset}
      className="relative mx-auto mb-auto mt-2 w-full max-w-sm rounded-lg border border-slate-500 bg-slate-200/80 p-3 shadow sm:p-4 md:mt-auto"
    >
      <Dialog.Title className="mb-2.5 text-center text-3xl font-bold italic text-slate-700">Sign Up</Dialog.Title>

      <FormProvider {...methods}>
        <form onSubmit={onSubmit} className="grid gap-4">
          <NameField />
          <PasswordField required="Required" repeat />
          <SubmitForm>
            <span className="flex justify-center gap-2">
              <UserPlusIcon className="w-6" />
              Create Account
            </span>
          </SubmitForm>
        </form>
      </FormProvider>

      <CloseModalButton onClick={closeModal} disabled={isSubmitting} />
    </Modal>
  );
});

export const LogIn = memo(function LogInModal({ show, onClose }: ModalProps) {
  const methods = useForm({
      mode: "onChange",
      defaultValues: {
        name: "",
        password: ""
      }
    }),
    {
      handleSubmit,
      setError,
      reset,
      formState: { isSubmitting }
    } = methods,
    { mutateUser } = useUser();

  const closeModal = useCallback(() => {
    if (!isSubmitting) {
      onClose();
    }
  }, [isSubmitting, onClose]);

  const onSubmit = handleSubmit(async data => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      switch (res.status) {
        case 200:
          res.json().then(({ id }) => {
            mutateUser({
              id,
              name: data.name
            });
            closeModal();
          });
          break;

        case 401:
          setError(
            "password",
            {
              message: "Incorrect"
            },
            {
              shouldFocus: true
            }
          );
          break;

        case 404:
          setError(
            "name",
            {
              message: "Not Found"
            },
            {
              shouldFocus: true
            }
          );
      }
    } catch (err) {
      alert(err);
      throw err;
    }
  });

  return (
    <Modal
      show={show}
      onClose={closeModal}
      afterLeave={reset}
      className="relative mx-auto mb-auto mt-2 w-full max-w-sm rounded-lg border border-slate-500 bg-slate-200/80 p-3 shadow sm:p-4 md:mt-auto"
    >
      <Dialog.Title className="mb-2.5 text-center text-3xl font-bold italic text-slate-700">Log In</Dialog.Title>

      <FormProvider {...methods}>
        <form onSubmit={onSubmit} className="grid gap-4">
          <NameField />
          <PasswordField required="Required" />
          <SubmitForm>
            <span className="flex justify-center gap-2">
              <ArrowLeftOnRectangleIcon className="w-6" />
              Sign In
            </span>
          </SubmitForm>
        </form>
      </FormProvider>

      <CloseModalButton onClick={closeModal} disabled={isSubmitting} />
    </Modal>
  );
});

export function LogOut({ show, onClose }: ModalProps) {
  const { user, mutateUser } = useUser(),
    [username, setUsername] = useState(""); // Don't change when user logs out, if we use user.name when the modal fades out the username no longer appears

  useEffect(() => {
    if (user.name) {
      setUsername(user.name);
    }
  }, [user]);

  const logOut = useCallback(async () => {
    mutateUser(await fetchJson("/api/logout"), false);
    onClose();
  }, [mutateUser, onClose]);

  return (
    <Alert show={show} onClose={onClose} confirm={logOut}>
      <p className="-mx-3 -mt-3 mb-2.5 rounded-t-lg bg-slate-900 px-4 py-1 text-center text-teal-100 shadow">@{username}</p>
      <Dialog.Title className="text-center text-xl sm:text-2xl">
        Are you sure you want to <strong className="text-red-700">Log Out</strong>?
      </Dialog.Title>
    </Alert>
  );
}

const NewPollModal = memo(function NewPollModal({ show, onClose }: ModalProps) {
  const modal = useModal(),
    //
    methods = useForm<{
      question: string;
      answers: Array<{
        value: string;
      }>;
    }>({
      mode: "onChange",
      defaultValues: {
        question: "",
        answers: new Array(2).fill({ value: "" })
      }
    }),
    {
      handleSubmit,
      reset,
      formState: { isSubmitting, isSubmitSuccessful }
    } = methods,
    //
    [pollId, setPollId] = useState(""); // Headless UI v1.7.4: There is a bug in the overflow style in documentElement when a modal is closing and another shows at the same time, that is the reason why I can't simply use `modal({ type "..." })`. This is a quick solution

  const closeModal = useCallback(() => {
    if (!isSubmitting) {
      onClose();
    }
  }, [isSubmitting, onClose]);

  const onSubmit = handleSubmit(async ({ question, answers }) => {
    const {
      id,
      err
    }: {
      id?: string;
      err?: string;
    } = await fetchJson("/api/poll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        answers: Array.from(new Set(answers.flatMap(({ value }) => value.trim() || [])))
      })
    });

    if (err) {
      alert(err);
      throw err;
    }

    if (id) {
      setPollId(id);
      onClose(); // Close modal to run `afterLeave`
    }
  });

  function afterLeave() {
    if (isSubmitSuccessful) {
      reset();

      if (pollId) {
        modal({
          type: "Alert",
          children: (
            <Dialog.Title className="flex flex-wrap items-center justify-center gap-2 text-center text-2xl">
              <span className="inline-flex flex-wrap items-center justify-center gap-x-1">
                <CheckIcon className="w-7 text-green-700" />
                Poll successfully created.
              </span>
              <Link
                href={`/poll/${pollId}`}
                onClick={() => onClose()}
                className="inline-flex items-end gap-1 font-bold text-cyan-800 transition hover:text-cyan-700 hover:underline"
              >
                View
                <LinkIcon className="w-6" />
              </Link>
            </Dialog.Title>
          )
        });
      }
    }
  }

  return (
    <Modal
      show={show}
      onClose={closeModal}
      afterLeave={afterLeave}
      className="relative mx-auto mb-auto mt-2 w-full max-w-xl rounded-lg border border-slate-500 bg-slate-200/80 px-2 pb-3 pt-4 shadow sm:p-4"
    >
      <Dialog.Title className="mb-2.5 text-center text-3xl font-bold italic text-slate-700">New Poll</Dialog.Title>

      <FormProvider {...methods}>
        <form onSubmit={onSubmit} className="grid gap-4">
          <QuestionField required />
          <AnswersField />
          <SubmitForm>
            <span className="flex items-center justify-center gap-1.5">
              <PlusIcon className="w-6 text-slate-400" />
              Create Poll
            </span>
          </SubmitForm>
          <ResetButton />
        </form>
      </FormProvider>

      <CloseModalButton onClick={closeModal} disabled={isSubmitting} />
    </Modal>
  );
});

export function NewPoll({ show, onClose }: ModalProps) {
  const { user, isLoading: isUserLoading } = useUser();

  return !isUserLoading ? (
    user.id ? (
      <NewPollModal show={show} onClose={onClose} />
    ) : (
      <NotLoggedInModal show={show} onClose={onClose}>
        <Dialog.Title className="text-center text-2xl">
          You must be <strong className="text-teal-900">logged in</strong> to create a new poll
        </Dialog.Title>
      </NotLoggedInModal>
    )
  ) : null;
}
