import React from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  ButtonProps,
} from "@relume_io/relume-ui";

type TableData = {
  name: string;
  company: string;
  number: number;
  team: string;
  date: string;
  link: string;
};

type RowGroup = {
  groupName: string;
  rows: TableData[];
};

type Props = {
  headerTitle: string;
  headerDescription: string;
  buttons: ButtonProps[];
  tableHeaders: string[];
  tableRows: RowGroup[];
  paginationItems: number[];
};

export type Table5Props = React.ComponentPropsWithoutRef<"section"> & Partial<Props>;

export const Table5 = (props: Table5Props) => {
  const { headerTitle, headerDescription, buttons, tableHeaders, tableRows } = {
    ...Table5Defaults,
    ...props,
  } as Props;

  const tableHeaderClasses = [
    "w-[245px] pr-4 xxl:w-[350px]",
    "w-[245px] pr-4 xxl:w-[250px]",
    "w-[128px] pr-4",
    "w-[245px] pr-4 xxl:w-[250px]",
    "w-[192px] pr-4",
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
        <div>
          <Table className="border-collapse">
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
              {tableRows.map((group, groupIndex) => (
                <React.Fragment key={groupIndex}>
                  <TableRow className="bg-background-secondary">
                    <TableCell
                      colSpan={tableHeaders.length}
                      className="h-14 w-full px-6 py-4 text-base font-semibold"
                    >
                      {group.groupName}
                    </TableCell>
                  </TableRow>
                  {group.rows.map((row, rowIndex) => (
                    <TableRow key={`${groupIndex}-${rowIndex}`}>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell>{row.company}</TableCell>
                      <TableCell>{row.number}</TableCell>
                      <TableCell>{row.team}</TableCell>
                      <TableCell>{row.date}</TableCell>
                      <TableCell className="py-6 text-center font-semibold">
                        <a href={row.link}>View</a>
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
};

export const Table5Defaults: Table5Props = {
  headerTitle: "Table Header",
  headerDescription: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  buttons: [
    { children: "Button", variant: "secondary", size: "sm" },
    { children: "Button", size: "sm" },
  ],
  tableHeaders: ["Name", "Company", "Number", "Team", "Date", ""],
  tableRows: [
    {
      groupName: "Group name",
      rows: [
        {
          name: "Full name",
          company: "Company name",
          number: 14,
          team: "Team name",
          date: "Jan 11, 2050",
          link: "#",
        },
        {
          name: "Full name",
          company: "Company name",
          number: 14,
          team: "Team name",
          date: "Jan 11, 2050",
          link: "#",
        },
        {
          name: "Full name",
          company: "Company name",
          number: 14,
          team: "Team name",
          date: "Jan 11, 2050",
          link: "#",
        },
      ],
    },
    {
      groupName: "Group name",
      rows: [
        {
          name: "Full name",
          company: "Company name",
          number: 14,
          team: "Team name",
          date: "Jan 11, 2050",
          link: "#",
        },
        {
          name: "Full name",
          company: "Company name",
          number: 14,
          team: "Team name",
          date: "Jan 11, 2050",
          link: "#",
        },
        {
          name: "Full name",
          company: "Company name",
          number: 14,
          team: "Team name",
          date: "Jan 11, 2050",
          link: "#",
        },
      ],
    },
  ],
};
