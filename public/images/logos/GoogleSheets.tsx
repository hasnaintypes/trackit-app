import { type SVGProps } from "react";

export default function GoogleSheets(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      height="1em"
      width="1em"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flex: "none", lineHeight: 1 }}
      {...props}
    >
      <title>{"Google Sheets"}</title>
      <path d="M14.727 6.727H14V0l6.727 6.727h-6z" fill="#188038" />
      <path
        d="M14 0H4.91A1.91 1.91 0 003 1.91v20.18A1.91 1.91 0 004.91 24h14.18A1.91 1.91 0 0021 22.09V7l-7-7z"
        fill="#34A853"
      />
      <path d="M14 0v5.09A1.91 1.91 0 0015.91 7H21L14 0z" fill="#188038" />
      <rect x="7" y="11" width="10" height="8" rx="0.5" fill="white" />
      <line x1="7" y1="14" x2="17" y2="14" stroke="#34A853" strokeWidth="0.6" />
      <line
        x1="7"
        y1="16.5"
        x2="17"
        y2="16.5"
        stroke="#34A853"
        strokeWidth="0.6"
      />
      <line
        x1="11.5"
        y1="11"
        x2="11.5"
        y2="19"
        stroke="#34A853"
        strokeWidth="0.6"
      />
    </svg>
  );
}
