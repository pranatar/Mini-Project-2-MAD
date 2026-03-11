import { useState, useEffect } from "react";
import { calculateTimeRemaining, getUrgencyLevel } from "@/utils/timeHelpers";

export const useCountdown = (dueDate: number, refreshInterval: number = 1000) => {
  const [timeRemaining, setTimeRemaining] = useState(() => calculateTimeRemaining(dueDate));
  const [urgency, setUrgency] = useState(() => getUrgencyLevel(dueDate));

  useEffect(() => {
    // Update immediately
    setTimeRemaining(calculateTimeRemaining(dueDate));
    setUrgency(getUrgencyLevel(dueDate));

    // Set up interval for real-time updates
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(dueDate));
      setUrgency(getUrgencyLevel(dueDate));
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [dueDate, refreshInterval]);

  return {
    ...timeRemaining,
    urgency,
    dueDate: new Date(dueDate),
  };
};

export const useOverdueFine = (dueDate: number, refreshInterval: number = 60000) => {
  const [fine, setFine] = useState(() => {
    const { calculateOverdueFine } = require("@/utils/timeHelpers");
    return calculateOverdueFine(dueDate);
  });

  useEffect(() => {
    const { calculateOverdueFine } = require("@/utils/timeHelpers");
    
    // Update immediately
    setFine(calculateOverdueFine(dueDate));

    // Update every minute (fine doesn't change as frequently)
    const interval = setInterval(() => {
      setFine(calculateOverdueFine(dueDate));
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [dueDate, refreshInterval]);

  return fine;
};
