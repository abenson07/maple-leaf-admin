import React from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  ButtonProps,
} from "@relume_io/relume-ui";

type ImageProps = {
  src: string;
  alt?: string;
};

type TableData = {
  name: string;
  email: string;
  avatar: ImageProps;
  company: string;
  products: ImageProps[]; // Array of product images
  team: string;
  date: string;
  link: string;
};

type Props = {
  headerTitle: string;
  headerDescription: string;
  buttons: ButtonProps[];
  tableHeaders: string[];
  tableRows: TableData[];
  paginationItems: number[];
};

export type Table8Props = React.ComponentPropsWithoutRef<"section"> & Partial<Props>;

export const Table8 = (props: Table8Props) => {
  const { headerTitle, headerDescription, buttons, tableHeaders, tableRows, paginationItems } = {
    ...Table8Defaults,
    ...props,
  } as Props;

  const tableHeaderClasses = [
    "w-[350px] pr-4 xxl:w-[478px]",
    "w-[192px] pr-4 xxl:w-[192px]",
    "w-[192px] pr-4",
    "w-[192px] pr-4 xxl:w-[192px]",
    "w-[128px] pr-4",
    "w-[96px] pr-4 text-center",
  ];

  return (
    <section id="relume" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container relative">
        <div className="flex flex-col items-start justify-between gap-4 border border-b-0 border-border-primary p-6 sm:flex-row sm:items-center">
          <div>
            <h1 className="mb-1 text-md font-semibold md:text-lg">{headerTitle}</h1>
            <p>{headerDescription}</p>
          </div>
          <div className="flex gap-4">
            {buttons.map((buttonProps, index) => (
              <Button key={index} {...buttonProps} />
            ))}
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              {tableHeaders.map((header, index) => (
                <TableHead key={index} className={tableHeaderClasses[index]}>
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableRows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                <TableCell className="flex-1 font-medium">
                  <div className="grid grid-cols-[max-content_1fr] items-center gap-3">
                    <img
                      src={row.avatar.src}
                      alt={row.avatar.alt}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div className="w-full max-w-lg">
                      <div>{row.name}</div>
                      <a className="text-sm font-normal underline">{row.email}</a>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="min-w-[8rem] max-w-[12rem]">{row.company}</TableCell>
                <TableCell className="min-w-[8rem] max-w-[12rem]">
                  <div className="relative flex pl-2">
                    {row.products.map((product, index) => (
                      <div key={index} className="-ml-2">
                        <img
                          src={product.src}
                          alt={product.alt}
                          className="size-8 rounded-full border-2 border-border-alternative object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="min-w-[8rem] max-w-[12rem]">{row.team}</TableCell>
                <TableCell className="min-w-[8rem] max-w-[6rem]">{row.date}</TableCell>
                <TableCell className="py-6 text-center font-semibold">
                  <a href={row.link}>View</a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Pagination className="mt-10">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" size="sm" variant="secondary" />
            </PaginationItem>
            <PaginationItem className="hidden md:block">
              {paginationItems.map((item, index) => (
                <PaginationLink key={index} href="#" size="sm" variant="link" className="px-4 py-2">
                  {item}
                </PaginationLink>
              ))}
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" size="sm" variant="secondary" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </section>
  );
};

export const Table8Defaults: Table8Props = {
  headerTitle: "Table Header",
  headerDescription: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  buttons: [
    { children: "Button", variant: "secondary", size: "sm" },
    { children: "Button", size: "sm" },
  ],
  tableHeaders: ["Name", "Company", "Products", "Team", "Date", ""],
  tableRows: [
    {
      name: "Full name",
      email: "name@relume.io",
      avatar: {
        src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image-small.svg",
        alt: "Relume avatar 1",
      },
      company: "Company name",
      products: [
        {
          src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image-small.svg",
          alt: "Product 1",
        },
        {
          src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image-small.svg",
          alt: "Product 2",
        },
        {
          src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image-small.svg",
          alt: "Product 3",
        },
        {
          src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image-small.svg",
          alt: "Product 4",
        },
      ],
      team: "Team name",
      date: "1/11/2050",
      link: "#",
    },
    {
      name: "Full name",
      email: "name@relume.io",
      avatar: {
        src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image-small.svg",
        alt: "Relume avatar 1",
      },
      company: "Company name",
      products: [
        {
          src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image-small.svg",
          alt: "Product 5",
        },
        {
          src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image-small.svg",
          alt: "Product 6",
        },
        {
          src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image-small.svg",
          alt: "Product 7",
        },
        {
          src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image-small.svg",
          alt: "Product 8",
        },
      ],
      team: "Team name",
      date: "1/11/2050",
      link: "#",
    },
    {
      name: "Full name",
      email: "name@relume.io",
      avatar: {
        src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image-small.svg",
        alt: "Relume avatar 1",
      },
      company: "Company name",
      products: [
        {
          src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image-small.svg",
          alt: "Product 9",
        },
        {
          src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image-small.svg",
          alt: "Product 10",
        },
        {
          src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image-small.svg",
          alt: "Product 11",
        },
        {
          src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image-small.svg",
          alt: "Product 12",
        },
      ],
      team: "Team name",
      date: "1/11/2050",
      link: "#",
    },
    {
      name: "Full name",
      email: "name@relume.io",
      avatar: {
        src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image-small.svg",
        alt: "Relume avatar 1",
      },
      company: "Company name",
      products: [
        {
          src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image-small.svg",
          alt: "Product 13",
        },
        {
          src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image-small.svg",
          alt: "Product 14",
        },
        {
          src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image-small.svg",
          alt: "Product 15",
        },
        {
          src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image-small.svg",
          alt: "Product 16",
        },
      ],
      team: "Team name",
      date: "1/11/2050",
      link: "#",
    },
    {
      name: "Full name",
      email: "name@relume.io",
      avatar: {
        src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image-small.svg",
        alt: "Relume avatar 1",
      },
      company: "Company name",
      products: [
        {
          src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image-small.svg",
          alt: "Product 17",
        },
        {
          src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image-small.svg",
          alt: "Product 18",
        },
        {
          src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image-small.svg",
          alt: "Product 19",
        },
        {
          src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image-small.svg",
          alt: "Product 20",
        },
      ],
      team: "Team name",
      date: "1/11/2050",
      link: "#",
    },
    {
      name: "Full name",
      email: "name@relume.io",
      avatar: {
        src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image-small.svg",
        alt: "Relume avatar 1",
      },
      company: "Company name",
      products: [
        {
          src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image-small.svg",
          alt: "Product 21",
        },
        {
          src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image-small.svg",
          alt: "Product 22",
        },
        {
          src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image-small.svg",
          alt: "Product 23",
        },
        {
          src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image-small.svg",
          alt: "Product 24",
        },
      ],
      team: "Team name",
      date: "1/11/2050",
      link: "#",
    },
  ],
  paginationItems: [1, 2, 3, 4, 5],
};
