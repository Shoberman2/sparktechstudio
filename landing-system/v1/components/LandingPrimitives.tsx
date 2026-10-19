import type { CSSProperties, ReactNode } from "react";

/** Brand-owned wordmark slot. Pass the real mark and exact punctuation. */
export function LandingWordmark({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`landing-wordmark ${className}`}>{children}</span>;
}

/** One clear action, with an optional quiet secondary action. */
export function LandingActions({ primary, secondary }: {
  primary: { label: string; href: string; icon?: ReactNode };
  secondary?: { label: string; href: string };
}) {
  return <div className="landing-actions">
    <a className="landing-action-primary" href={primary.href}>{primary.label}{primary.icon}</a>
    {secondary ? <a className="landing-action-secondary" href={secondary.href}>{secondary.label}</a> : null}
  </div>;
}

/** Product-evidence section. Visual content stays authored by the adopting company. */
export function LandingFeature({ eyebrow, title, children, visual, reverse = false, style }: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  visual: ReactNode;
  reverse?: boolean;
  style?: CSSProperties;
}) {
  return <section className={`landing-feature${reverse ? " is-reversed" : ""}`} style={style}>
    <div className="landing-feature-copy"><p>{eyebrow}</p><h2>{title}</h2><div>{children}</div></div>
    <div className="landing-feature-visual">{visual}</div>
  </section>;
}

/** Disclosure for synthetic UI or fictional examples. */
export function IllustrativeDisclosure({ children }: { children: ReactNode }) {
  return <p className="landing-illustrative-disclosure">{children}</p>;
}
