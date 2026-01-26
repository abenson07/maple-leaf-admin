"use client";

import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarInput,
} from "@relume_io/relume-ui";
import {
  BiBarChartAlt2,
  BiBell,
  BiBuilding,
  BiCog,
  BiHelpCircle,
  BiMap,
  BiPieChartAlt2,
  BiSearch,
  BiUser,
} from "react-icons/bi";
import { BiCalendarEvent } from "react-icons/bi";
import { RxChevronRight, RxCross2 } from "react-icons/rx";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: BiPieChartAlt2 },
  { title: "Neighbors", url: "/people", icon: BiUser },
  { title: "Routes", url: "/routes", icon: BiMap },
  { title: "Businesses", url: "/businesses", icon: BiBuilding },
  { title: "Events", url: "/events", icon: BiCalendarEvent },
];

const footerItems = [
  { title: "Support", url: "#", icon: BiHelpCircle },
  { title: "Settings", url: "#", icon: BiCog },
];

export const ApplicationShell4 = ({ children }: { children: React.ReactNode }) => (
  <AppSidebar>
    <main className="flex-1 bg-background-secondary pt-16 lg:pt-18">
      <Topbar />
      {children}
    </main>
  </AppSidebar>
);

const Topbar = () => {
  const [isSearchIconClicked, setIsSearchIconClicked] = useState(false);

  return (
    <header className="fixed left-0 right-0 top-0 z-30 flex min-h-16 w-full items-center border-b border-border-primary bg-white px-4 md:min-h-18 md:px-8">
      <div className="mx-auto grid size-full grid-cols-2 items-center justify-between gap-4 lg:grid-cols-[1fr_1.5fr_1fr]">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="lg:hidden" />
          <Link href="/" className="justify-self-start">
            <img
              src="https://d22po4pjz3o32e.cloudfront.net/logo-image.svg"
              alt="MLCC Dashboard"
              className="shrink-0"
            />
          </Link>
        </div>
        <div className="hidden lg:block lg:w-full lg:max-w-md lg:justify-self-center">
          <SidebarInput
            className="w-full"
            placeholder="Search"
            icon={<BiSearch className="size-6" />}
          />
        </div>
        <TopbarActions
          isSearchIconClicked={isSearchIconClicked}
          setIsSearchIconClicked={setIsSearchIconClicked}
        />
      </div>
      <AnimatePresence>
        {isSearchIconClicked && (
          <motion.div
            variants={{
              visible: { opacity: 1 },
              hidden: { opacity: 0 },
            }}
            initial="hidden"
            exit="hidden"
            animate={isSearchIconClicked ? "visible" : "hidden"}
            className="absolute bottom-0 left-0 right-0 top-16 flex min-h-16 max-w-md items-center justify-center border-b border-border-primary bg-white px-6 lg:hidden"
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
    </header>
  );
};

const TopbarActions = ({
  isSearchIconClicked,
  setIsSearchIconClicked,
}: {
  isSearchIconClicked: boolean;
  setIsSearchIconClicked: (value: boolean) => void;
}) => {
  return (
    <div className="flex items-center gap-2 justify-self-end md:gap-4">
      <button
        onClick={() => setIsSearchIconClicked(!isSearchIconClicked)}
        className="p-2 lg:hidden"
      >
        <BiSearch className="size-6" />
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger className="relative">
          <div className="absolute bottom-auto left-auto right-2 top-2 size-2 rounded-full bg-black outline outline-[3px] outline-offset-0 outline-white" />
          <BiBell className="size-6" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-w-[19rem] px-0" align="end" sideOffset={0}>
          <div className="flex flex-col">
            <div className="flex items-center justify-between px-4 py-2">
              <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
              <a href="#">Mark as read</a>
            </div>
            <DropdownMenuSeparator />
            <div className="h-full max-h-[14rem] overflow-auto px-2 py-1">
              <DropdownMenuItem className="mt-2 grid grid-cols-[max-content_1fr] gap-2 px-2 py-1">
                <div className="flex size-full flex-col items-start justify-start">
                  <img
                    src="https://d22po4pjz3o32e.cloudfront.net/relume-icon.svg"
                    alt="Avatar"
                    className="size-6"
                  />
                </div>
                <div>
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                  <p className="mt-2 text-sm">11 Jan 2022</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="mt-2 grid grid-cols-[max-content_1fr] gap-2 px-2 py-1">
                <div className="flex size-full flex-col items-start justify-start">
                  <img
                    src="https://d22po4pjz3o32e.cloudfront.net/relume-icon.svg"
                    alt="Avatar"
                    className="size-6"
                  />
                </div>
                <div>
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                  <p className="mt-2 text-sm">11 Jan 2022</p>
                </div>
              </DropdownMenuItem>
            </div>
          </div>
          <DropdownMenuSeparator />
          <div className="flex w-full items-end justify-end px-4 py-2">
            <Button variant="link" size="link" iconRight={<RxChevronRight />} asChild>
              <a href="#">View All</a>
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center p-0">
          <img
            src="https://d22po4pjz3o32e.cloudfront.net/avatar-image.svg"
            alt="Avatar"
            className="size-10 rounded-full object-cover"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={0} className="mt-1.5 px-0 py-2">
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <a href="#">My Profile</a>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <a href="#">Profile Settings</a>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="mx-4" />
            <DropdownMenuItem>
              <a href="#">Log Out</a>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

const AppSidebar = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const currentPath = router?.pathname || "/";

  return (
    <SidebarProvider>
      <Sidebar className="py-6" closeButtonClassName="fixed top-4 right-4 text-white">
        <SidebarContent className="pt-6 lg:pt-18">
          <SidebarMenu>
            {menuItems.map((item, index) => {
              const isActive = currentPath === item.url || (item.url !== "/" && currentPath.startsWith(item.url));
              return (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link href={item.url} className="flex w-full items-center gap-3 p-2">
                      <item.icon className="size-6 shrink-0" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="mt-auto">
          <div>
            {footerItems.map((item, index) => (
              <SidebarMenuItem key={index}>
                <SidebarMenuButton asChild>
                  <a href={item.url} className="flex w-full items-center gap-3 p-2">
                    <item.icon className="size-6 shrink-0" />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </div>
        </SidebarFooter>
      </Sidebar>
      {children}
    </SidebarProvider>
  );
};
