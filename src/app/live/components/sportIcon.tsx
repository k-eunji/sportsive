// src/app/live/components/sportIcon.tsx

export function getSportIcon(sport?: string) {
  switch (sport?.toLowerCase()) {
    case "football":
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 text-foreground opacity-80"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6l3 2-1 3-3 1-2-3 3-3z" />
        </svg>
      );

    case "rugby":
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 text-foreground opacity-80"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <ellipse cx="12" cy="12" rx="10" ry="6" />
          <path d="M2 12h20M12 6v12" />
        </svg>
      );

    case "cricket":
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 text-foreground opacity-80"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="10" y="3" width="4" height="14" rx="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      );

    case "tennis":
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 text-foreground opacity-80"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M4 8a10 10 0 0 0 16 0" />
        </svg>
      );

    case "golf":
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 text-foreground opacity-80"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 2v18" />
          <circle cx="12" cy="22" r="2" />
          <path d="M12 2l6 4-6 4" />
        </svg>
      );

    case "f1":
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 text-foreground opacity-80"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M2 12h20l-6 6H8z" />
          <path d="M4 10h16l-4-4H8z" />
        </svg>
      );

    case "horseracing":
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 text-foreground opacity-80"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 17l4-6 5 5 4-4 5 5" />
          <circle cx="7" cy="9" r="2" />
        </svg>
      );

    default:
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 text-foreground opacity-80"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      );
  }
}
