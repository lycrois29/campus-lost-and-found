"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="container page-space"><div className="state-card"><div className="empty-icon">!</div><h2>Something went wrong</h2><p>We could not load this page. Please try again.</p><button className="button" onClick={() => reset()}>Try again</button></div></div>;
}
