import { useEffect, useState } from "react";

interface LastUpdatedDisplayProps {
  lastUpdated: Date | null;
}

export const LastUpdatedDisplay = ({ lastUpdated }: LastUpdatedDisplayProps) => {
  const [displayTime, setDisplayTime] = useState(0);

  useEffect(() => {
    if (!lastUpdated) return;

    // update immediately
    setDisplayTime(Math.round((Date.now() - lastUpdated.getTime()) / 1000));

    // then update every second
    const interval = setInterval(() => {
      setDisplayTime(Math.round((Date.now() - lastUpdated.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [lastUpdated]);

  if (!lastUpdated) return null;

  return (
    <p className="text-xs text-muted-foreground">
      Updated {displayTime < 5 ? "just now" : `${displayTime}s ago`}
    </p>
  );
};
