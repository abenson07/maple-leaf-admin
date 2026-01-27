import React from "react";
import { BiSearch } from "react-icons/bi";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  Button,
  ButtonProps,
  Input,
} from "@relume_io/relume-ui";

type BreadcrumbProps = {
  url: string;
  title: string;
};

type Props = {
  breadcrumbs?: BreadcrumbProps[];
  heading: string;
  description?: string;
  subtitle?: string;
  inputPlaceholder?: string;
  inputIcon?: React.ReactNode;
  inputValue?: string;
  onInputChange?: (value: string) => void;
  buttons: ButtonProps[];
  headerActions?: React.ReactNode;
};

export type PageHeader1Props = React.ComponentPropsWithoutRef<"section"> & Partial<Props>;

export const PageHeader1 = (props: PageHeader1Props) => {
  const { breadcrumbs, heading, description, subtitle, inputPlaceholder, inputIcon, inputValue, onInputChange, buttons, headerActions } = {
    ...PageHeader1Defaults,
    ...props,
  };
  return (
    <section id="relume" className="px-6 py-8 md:px-8 md:py-10 lg:py-12">
      <div className="flex items-start justify-between gap-4 w-full">
        <div className="max-w-lg lg:max-w-xxl flex-shrink-0">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <Breadcrumb className="mb-3 flex w-full items-center md:mb-4">
              <BreadcrumbList className="gap-2">
                {breadcrumbs.map((item, index) => (
                  <React.Fragment key={index}>
                    <BreadcrumbItem>
                      <BreadcrumbLink
                        className={`text-sm ${index === breadcrumbs.length - 1 && "font-medium"}`}
                        href={item.url}
                      >
                        {item.title}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          )}
          <div>
            <div className="max-w-lg flex-1">
              <h1 className="text-4xl font-bold md:text-5xl text-black">
                {heading}
              </h1>
              {subtitle && (
                <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
              )}
              {description && !subtitle && (
                <p className="mt-2 text-gray-600">{description}</p>
              )}
            </div>
          </div>
        </div>
        {headerActions && (
          <div className="flex-shrink-0 ml-auto">
            {headerActions}
          </div>
        )}
      </div>
    </section>
  );
};

export const PageHeader1Defaults: Props = {
  breadcrumbs: [],
  heading: "Heading goes here",
  description: "",
  inputPlaceholder: "Search",
  inputIcon: <BiSearch className="size-6" />,
  buttons: [
    { title: "Button", variant: "secondary", size: "sm" },
    {
      title: "Button",
      variant: "primary",
      size: "sm",
    },
  ],
};
