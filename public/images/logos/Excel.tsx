import { type SVGProps } from "react";

export default function Excel(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      height="1em"
      width="1em"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flex: "none", lineHeight: 1 }}
      {...props}
    >
      <title>{"Microsoft Excel"}</title>
      <path d="M23 1.5H8.25v5.25H13.5V1.5z" fill="#21A366" />
      <path d="M13.5 6.75H8.25V12H13.5V6.75z" fill="#107C41" />
      <path d="M23 6.75H13.5V12H23V6.75z" fill="#33C481" />
      <path d="M13.5 12H8.25v5.25H13.5V12z" fill="#185C37" />
      <path d="M23 12H13.5v5.25H23V12z" fill="#21A366" />
      <path d="M23 17.25H13.5V22.5H23v-5.25z" fill="#107C41" />
      <path d="M13.5 17.25H8.25V22.5H13.5v-5.25z" fill="#107C41" />
      <path d="M23 1.5H13.5v5.25H23V1.5z" fill="#33C481" />
      <path d="M1 4.125l7.25-1.25V21.125L1 19.875V4.125z" fill="#185C37" />
      <path
        d="M3.344 8.625L5.16 8.55l1.29 3.084L7.85 8.475l1.55-.075-2.05 3.6 2.1 3.6H7.8l-1.4-3.225L5.1 15.6H3.475l2.05-3.525-2.181-3.45z"
        fill="white"
      />
    </svg>
  );
}
