import type { SVGProps } from "react";

function Base(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    />
  );
}

export const IconDashboard = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <rect x="3.5" y="3.5" width="7" height="8" rx="2" />
    <rect x="13.5" y="3.5" width="7" height="5" rx="2" />
    <rect x="13.5" y="11.5" width="7" height="9" rx="2" />
    <rect x="3.5" y="14.5" width="7" height="6" rx="2" />
  </Base>
);
export const IconInbox = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <path d="M4 13.5 6.5 5h11L20 13.5" />
    <path d="M4 13.5V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4.5h-5l-1.2 2h-5.6L9 13.5Z" />
  </Base>
);
export const IconTutor = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c.7-3.6 3.4-5.5 7-5.5s6.3 1.9 7 5.5" />
  </Base>
);
export const IconLink = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
    <path d="M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 10 18.7l1-1" />
  </Base>
);
export const IconMenu = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Base>
);
export const IconClose = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Base>
);
export const IconEmpty = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <rect x="4" y="5" width="16" height="14" rx="3" />
    <path d="M8 10h8M8 14h4" />
  </Base>
);
export const IconAlert = (p: SVGProps<SVGSVGElement>) => (
  <Base {...p}>
    <path d="M12 4 3.5 19h17Z" />
    <path d="M12 10v4M12 16.5v.01" />
  </Base>
);
