"use client";

import { useEffect, useRef, useState } from "react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  useMediaQuery,
} from "@relume_io/relume-ui";
import { AnimatePresence, motion } from "framer-motion";
import { RxChevronDown, RxChevronRight, RxCross2 } from "react-icons/rx";
import { BiBell, BiSearch } from "react-icons/bi";
import Link from "next/link";
import { useRouter } from "next/router";
import { showToast } from "@/lib/toast";

type ImageProps = {
  url?: string;
  src: string;
  alt?: string;
};

type NavLink = {
  url: string;
  title: string;
  subMenuLinks?: NavLink[];
};

type Props = {
  logo: ImageProps;
  navLinks: NavLink[];
  children?: React.ReactNode;
};

export type ApplicationShell6Props = React.ComponentPropsWithoutRef<"section"> & Partial<Props>;

export const ApplicationShell6 = (props: ApplicationShell6Props) => {
  const { logo, navLinks, children } = {
    ...ApplicationShell6Defaults,
    ...props,
  };

  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchIconClicked, setIsSearchIconClicked] = useState<boolean>(false);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery("(max-width: 991px)");

  const handleLogout = async () => {
    try {
      const basePath = router.basePath || "";
      const response = await fetch(`${basePath}/api/auth/logout`, {
        method: "POST",
      });

      if (response.ok) {
        showToast.success("Logged out successfully");
        router.push("/login");
      } else {
        showToast.error("Error logging out");
      }
    } catch (error) {
      console.error("Logout error:", error);
      showToast.error("Error logging out");
    }
  };
  useEffect(() => {
    if (!isSearchIconClicked) {
      return;
    }
    const handleClickOutside = (event: PointerEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setIsSearchIconClicked(false);
      }
    };
    document.addEventListener("pointerdown", handleClickOutside);
    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, [isSearchIconClicked]);

  useEffect(() => {
    if (!menuRef) {
      return;
    }
    const handleClickOutside = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("pointerdown", handleClickOutside);
    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, [isSearchIconClicked]);

  return (
    <section id="relume">
      <div 
        className="sticky top-0 z-40 flex w-full flex-wrap items-center justify-between bg-white px-6 lg:px-8 rounded-b-lg"
        style={{
          boxShadow: '0px 1px 3px 0px rgba(0, 0, 0, 0.12), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 2px 1px -1px rgba(0, 0, 0, 0.2)'
        }}
      >
        <div className="flex min-h-16 items-center md:min-h-18">
          <button
            className="-ml-4 mr-4 flex size-12 flex-col items-center justify-center lg:hidden"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => {
              setIsMobileMenuOpen(!isMobileMenuOpen);
              setIsSearchIconClicked(false);
            }}
          >
            <motion.span
              className="my-[3px] h-0.5 w-6 bg-black"
              animate={isMobileMenuOpen ? ["open", "rotatePhase"] : "closed"}
              variants={topLineVariants}
            />
            <motion.span
              className="my-[3px] h-0.5 w-6 bg-black"
              animate={isMobileMenuOpen ? "open" : "closed"}
              variants={middleLineVariants}
            />
            <motion.span
              className="my-[3px] h-0.5 w-6 bg-black"
              animate={isMobileMenuOpen ? ["open", "rotatePhase"] : "closed"}
              variants={bottomLineVariants}
            />
          </button>
          <Link href={logo.url || "/"}>
            <img src={logo.src} alt={logo.alt} />
          </Link>
        </div>
        <div className="ml-auto flex flex-row items-center gap-4 lg:order-last">
          <div className="hidden w-full max-w-md lg:block">
            <Input className="w-full" placeholder="Search" icon={<BiSearch className="size-6" />} />
          </div>
          <div className="flex shrink-0 items-center gap-2 md:gap-4">
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsSearchIconClicked(!isSearchIconClicked);
              }}
              className="p-2 lg:hidden"
            >
              <BiSearch className="size-6" />
            </button>
            <AnimatePresence>
              {isSearchIconClicked && (
                <motion.div
                  ref={searchBarRef}
                  variants={{
                    visible: { opacity: 1 },
                    hidden: { opacity: 0 },
                  }}
                  initial="hidden"
                  exit="hidden"
                  animate={isSearchIconClicked ? "visible" : "hidden"}
                  className="absolute bottom-0 left-0 right-0 top-16 mt-px flex h-16 max-w-md items-center justify-center border-b border-border-primary bg-white px-6 lg:hidden"
                >
                  <Input
                    className="h-fit w-full"
                    placeholder="Search"
                    icon={<BiSearch className="size-6" />}
                  />
                  <button onClick={() => setIsSearchIconClicked(!isSearchIconClicked)}>
                    <RxCross2 className="ml-4 size-6" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            <DropdownMenu>
              <DropdownMenuTrigger className="relative">
                <div className="absolute bottom-auto left-auto right-2 top-2 size-2 rounded-full bg-black outline outline-[3px] outline-offset-0 outline-white" />
                <BiBell className="size-6" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-w-[19rem] px-0 bg-white rounded-lg border border-gray-200" align="end" sideOffset={0} style={{ boxShadow: '0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 5px 8px 0px rgba(0, 0, 0, 0.14), 0px 1px 14px 0px rgba(0, 0, 0, 0.12)' }}>
                <div className="flex flex-col">
                  <div className="flex items-center justify-between px-4 py-2">
                    <DropdownMenuLabel className="p-0 text-[#464D3F] font-semibold">Notifications</DropdownMenuLabel>
                    <a href="#" className="text-sm text-gray-600 hover:text-[#464D3F] transition-colors">Mark as read</a>
                  </div>
                  <DropdownMenuSeparator className="bg-gray-200" />
                  <div className="h-full max-h-[14rem] overflow-auto px-2 py-1">
                  <DropdownMenuItem className="mt-2 grid grid-cols-[max-content_1fr] gap-2 px-2 py-1 hover:bg-gray-50 rounded transition-colors">
                    <div className="flex size-full flex-col items-start justify-start">
                      <img
                        src="https://d22po4pjz3o32e.cloudfront.net/relume-icon.svg"
                        alt="Avatar"
                        className="size-6 rounded-full"
                      />
                    </div>
                    <div>
                      <p className="text-gray-700">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                      <p className="mt-2 text-sm text-gray-500">11 Jan 2022</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="mt-2 grid grid-cols-[max-content_1fr] gap-2 px-2 py-1 hover:bg-gray-50 rounded transition-colors">
                    <div className="flex size-full flex-col items-start justify-start">
                      <img
                        src="https://d22po4pjz3o32e.cloudfront.net/relume-icon.svg"
                        alt="Avatar"
                        className="size-6 rounded-full"
                      />
                    </div>
                    <div>
                      <p className="text-gray-700">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                      <p className="mt-2 text-sm text-gray-500">11 Jan 2022</p>
                    </div>
                  </DropdownMenuItem>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-gray-200" />
                <div className="flex w-full items-end justify-end px-4 py-2">
                  <Button variant="link" size="link" iconRight={<RxChevronRight />} asChild className="text-[#464D3F] hover:text-[#464D3F]">
                    <a href="#">View All</a>
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center p-0">
                <img
                  src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                  alt="Avatar"
                  className="size-10 rounded-full object-cover"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={0}
                className="mt-1.5 min-w-32 px-0 py-2 md:min-w-48 bg-white rounded-lg border border-gray-200"
                style={{ boxShadow: '0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 5px 8px 0px rgba(0, 0, 0, 0.14), 0px 1px 14px 0px rgba(0, 0, 0, 0.12)' }}
              >
                <DropdownMenuGroup>
                  <DropdownMenuItem className="hover:bg-gray-50 transition-colors">
                    <a href="#" className="text-gray-700 hover:text-[#464D3F]">My Profile</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-gray-50 transition-colors">
                    <a href="#" className="text-gray-700 hover:text-[#464D3F]">Profile Settings</a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="mx-4 bg-gray-200" />
                  <DropdownMenuItem className="hover:bg-gray-50 transition-colors">
                    <button
                      onClick={handleLogout}
                      className="text-gray-700 hover:text-[#464D3F] w-full text-left"
                    >
                      Log Out
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <motion.div
          ref={menuRef}
          variants={{
            open: {
              height: "var(--height-open, auto)",
            },
            close: {
              height: "var(--height-closed, 0)",
            },
          }}
          initial="close"
          exit="close"
          animate={isMobileMenuOpen ? "open" : "close"}
          transition={{ duration: 0.4 }}
          className="w-full overflow-hidden lg:order-2 lg:ml-6 lg:w-auto lg:grow lg:[--height-closed:auto] lg:[--height-open:auto]"
        >
          <div className="pb-8 pt-4 lg:flex lg:items-center lg:py-0">
            {navLinks.map((navLink, index) =>
              navLink.subMenuLinks && navLink.subMenuLinks.length > 0 ? (
                <SubMenu key={index} navLink={navLink} isMobile={isMobile} />
              ) : (
                <Link key={index} href={navLink.url} className="block py-3 lg:px-4 lg:py-2 text-gray-700 hover:text-[#464D3F] transition-colors font-medium">
                  {navLink.title}
                </Link>
              ),
            )}
          </div>
        </motion.div>
      </div>
      <main className="relative min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-4.5rem)]">
        <div 
          className="fixed inset-0 -z-10"
          style={{ 
            background: '#F7F7EC',
            height: '100vh',
            width: '100vw'
          }}
        />
        <div className="relative z-0">
          {children}
        </div>
      </main>
    </section>
  );
};

const SubMenu = ({ navLink, isMobile }: { navLink: NavLink; isMobile: boolean }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div
      onMouseEnter={() => !isMobile && setIsDropdownOpen(true)}
      onMouseLeave={() => !isMobile && setIsDropdownOpen(false)}
    >
      <button
        className="flex w-full items-center justify-between gap-2 py-3 text-left lg:flex-none lg:justify-start lg:px-4 lg:py-2 text-gray-700 hover:text-[#464D3F] transition-colors font-medium"
        onClick={() => setIsDropdownOpen((prev) => !prev)}
      >
        <span>{navLink.title}</span>
        <motion.span
          variants={{
            rotated: { rotate: 180 },
            initial: { rotate: 0 },
          }}
          animate={isDropdownOpen ? "rotated" : "initial"}
          transition={{ duration: 0.3 }}
        >
          <RxChevronDown />
        </motion.span>
      </button>
      {isDropdownOpen && (
        <AnimatePresence>
          <motion.nav
            variants={{
              open: {
                visibility: "visible",
                opacity: "var(--opacity-open, 100%)",
                y: 0,
              },
              close: {
                visibility: "hidden",
                opacity: "var(--opacity-close, 0)",
                y: "var(--y-close, 0%)",
              },
            }}
            animate={isDropdownOpen ? "open" : "close"}
            initial="close"
            exit="close"
            transition={{ duration: 0.2 }}
            className="bg-white lg:absolute lg:z-50 lg:border lg:border-gray-200 lg:p-2 lg:rounded-lg lg:[--y-close:25%]"
            style={{ boxShadow: '0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 5px 8px 0px rgba(0, 0, 0, 0.14), 0px 1px 14px 0px rgba(0, 0, 0, 0.12)' }}
          >
            {navLink.subMenuLinks?.map((navLink, index) => (
              <Link key={index} href={navLink.url} className="block px-4 py-2 text-gray-600 hover:text-[#464D3F] transition-colors">
                {navLink.title}
              </Link>
            ))}
          </motion.nav>
        </AnimatePresence>
      )}
    </div>
  );
};

export const ApplicationShell6Defaults: Props = {
  logo: {
    url: "/",
    src: "https://d22po4pjz3o32e.cloudfront.net/logo-image.svg",
    alt: "MLCC Dashboard",
  },
  navLinks: [
    // { title: "Dashboard", url: "/dashboard" }, // Commented out - Stripe bundling issue
    { title: "Neighbors", url: "/people" },
    { title: "Routes", url: "/routes" },
    { title: "Businesses", url: "/businesses" },
  ],
};

// Export ApplicationShell4 as an alias to ApplicationShell6 for backward compatibility
export const ApplicationShell4 = ({ children }: { children: React.ReactNode }) => (
  <ApplicationShell6>{children}</ApplicationShell6>
);

const topLineVariants = {
  open: {
    translateY: 8,
    transition: { delay: 0.1 },
  },
  rotatePhase: {
    rotate: -45,
    transition: { delay: 0.2 },
  },
  closed: {
    translateY: 0,
    rotate: 0,
    transition: { duration: 0.2 },
  },
};

const middleLineVariants = {
  open: {
    width: 0,
    transition: { duration: 0.1 },
  },
  closed: {
    width: "1.5rem",
    transition: { delay: 0.3, duration: 0.2 },
  },
};

const bottomLineVariants = {
  open: {
    translateY: -8,
    transition: { delay: 0.1 },
  },
  rotatePhase: {
    rotate: 45,
    transition: { delay: 0.2 },
  },
  closed: {
    translateY: 0,
    rotate: 0,
    transition: { duration: 0.2 },
  },
};
