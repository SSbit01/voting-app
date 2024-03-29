import { memo, Fragment, useState, useEffect } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import { Menu, Transition } from "@headlessui/react"
import { HomeIcon, StarIcon, UserPlusIcon, CogIcon, UserCircleIcon, ArrowLeftIcon } from "@heroicons/react/24/solid"
import { ArrowRightOnRectangleIcon, ArrowLeftOnRectangleIcon, PlusIcon, ChevronDownIcon } from "@heroicons/react/24/outline"
import clsx from "clsx"

import useUser from "@/lib/useUser"

import { useModal } from "@/components/Context"
import MyLink from "@/components/MyLink"



export default memo(function Navbar() {
  const router = useRouter(),
        { user, isLoading: isUserLoading } = useUser(),
        modal = useModal(),
        //
        [isRouteLoading, setIsRouteLoading] = useState(false),
        //
        userPath = `/user/${user.id}`,
        isUserPath = router.asPath == userPath
  
  
  useEffect(() => {
    function handleRouteChangeStart() {
      setIsRouteLoading(true) 
    }

    function handleRouteChangeComplete() {
      setIsRouteLoading(false) 
    }

    router.events.on("routeChangeStart", handleRouteChangeStart)
    router.events.on("routeChangeComplete", handleRouteChangeComplete)
    router.events.on("routeChangeError", handleRouteChangeComplete)

    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart)
      router.events.off("routeChangeComplete", handleRouteChangeComplete)
      router.events.off("routeChangeError", handleRouteChangeComplete)
    }
  }, [router.events])
  

  return (
    <header className={clsx("sticky top-0 z-50 bg-slate-900/90 text-slate-200 backdrop-blur-sm md:px-8 sm:py-2 shadow-sm shadow-cyan-900 after:absolute after:-bottom-1 after:left-0 after:h-1 after:bg-blue-500 after:shadow after:z-[-1] after:transition-[width]", {
      "after:w-1/3": isRouteLoading,
      "after:w-2/3": !isRouteLoading && isUserLoading,
      "after:w-full after:hidden": !isRouteLoading && !isUserLoading
    })}>
      <div className="flex items-center justify-center max-w-screen-2xl mx-auto">
        <p className="hidden lg:block text-xl italic mr-auto">Welcome{user.id && (
          <>
            , <Link href={userPath} className={`font-semibold transition ${isUserPath ? "text-sky-400" : "hover:text-sky-200 focus:text-sky-300"}`}>
                {user.name}
              </Link>
          </>
        )}</p>
        <nav className="contents sm:flex sm:gap-1.5 pr-2 border-r border-slate-500 mr-2">
          {[
            {
              href: "/",
              jsx: (
                <>
                  <HomeIcon className="w-7" />Home
                </>
              )
            },
            {
              href: "/voted",
              jsx: (
                <>
                  <StarIcon className="w-7" />Voted
                </>
              )
            }
          ].map(({ href, jsx }, i) => (
            <Link key={i} href={href} className={`flex-1 sm:flex-auto flex flex-col sm:flex-row items-center sm:gap-1.5 text-xs sm:text-lg py-2 sm:px-2 sm:rounded-lg transition ${router.asPath == href ? "text-sky-300 bg-slate-900/50 shadow sm:shadow-sky-800" : "hover:text-sky-200 focus:text-sky-300"}`}>
              {jsx}
            </Link>
          ))}
        </nav>
        <div className="contents sm:flex sm:gap-1.5">
          {(user.id ? [
            {
              onClick() {
                modal({ type: "NewPoll" })
              },
              jsx: (
                <>
                  <PlusIcon className="w-7" />New Poll
                </>
              )
            }
          ] : [
            {
              onClick() {
                modal({ type: "LogIn" })
              },
              jsx: (
                <>
                  <ArrowLeftOnRectangleIcon className="w-7" />Log In
                </>
              )
            },
            {
              onClick() {
                modal({ type: "SignUp" })
              },
              jsx: (
                <>
                  <UserPlusIcon className="w-7" />Sign Up
                </>
              )
            }
          ]).map(({ onClick, jsx }, i) => (
            <button key={i} type="button" onClick={onClick} className="flex-1 sm:flex-auto flex flex-col sm:flex-row items-center sm:gap-1.5 text-xs sm:text-lg py-2 sm:px-2 transition enabled:hover:text-sky-200 focus:text-sky-300 disabled:text-slate-500 disabled:cursor-not-allowed" disabled={isUserLoading}>
              {jsx}
            </button>
          ))}
          {user.id && (
            <Menu as="div" className="flex-1 relative" title={`@${user.name}`}>
              {({ open }) => (
                <>
                  <Menu.Button className={`flex-1 flex flex-col sm:flex-row items-center sm:gap-1.5 text-xs sm:text-lg w-full p-2 sm:rounded-lg transition disabled:text-slate-500 disabled:cursor-not-allowed ${open ? "text-indigo-300 bg-slate-900/50 shadow-sm sm:shadow-violet-800" : "enabled:hover:text-indigo-200 focus:text-indigo-300"}`} disabled={isUserLoading}>
                    <UserCircleIcon className="w-7" />Profile<ChevronDownIcon className={clsx("hidden sm:inline-block w-5 transition-transform", open && "rotate-180")} />
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
                    <Menu.Items className="absolute right-1 origin-top-right divide-y divide-slate-500 bg-slate-900/80 backdrop-blur-sm min-w-max w-full rounded shadow mt-0.5 sm:mt-1">
                      <Menu.Item>
                        {({ active }) => (
                          <MyLink href={userPath} className={clsx("flex items-center gap-1.5 pr-3 pl-1.5 py-1 transition duration-150 rounded-t", {
                            "bg-sky-900/40": active,
                            "text-sky-300": isUserPath
                          })}>
                            <ArrowLeftIcon className="w-7" />Visit
                          </MyLink>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => {
                          const href = "/user"
                          return (
                            <MyLink href={href} className={clsx("flex items-center gap-1.5 pr-3 pr-3 pl-1.5 py-1 transition duration-150", {
                              "bg-slate-900": active,
                              "text-sky-300": router.asPath == href
                            })}>
                              <CogIcon className="w-7" />Settings
                            </MyLink>
                          )
                        }}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button type="button" onClick={() => modal({ type: "LogOut" })} className={clsx("flex items-center gap-1.5 w-full pr-3 pl-1.5 py-1 rounded-b transition duration-150", active && "bg-rose-700")}>
                            <ArrowRightOnRectangleIcon className="w-7" />Log Out
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </>
              )}
            </Menu>
          )}
        </div>
      </div>
    </header>
  )
})