// Real-time utility functions for library calculations
// These should be called from client components with proper re-rendering

export const calculateTimeRemaining = (dueDate: number) => {
  const now = Date.now();
  const diff = dueDate - now;

  if (diff <= 0) {
    return {
      isOverdue: true,
      hours: 0,
      minutes: 0,
      days: 0,
      text: "Overdue!",
    };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const days = Math.floor(hours / 24);

  let text = "";
  if (days > 0) {
    text = `${days}d ${hours % 24}h left`;
  } else if (hours > 0) {
    text = `${hours}h ${minutes}m left`;
  } else {
    text = `${minutes}m left`;
  }

  return {
    isOverdue: false,
    hours,
    minutes,
    days,
    text,
  };
};

export const calculateOverdueFine = (dueDate: number, returnDate?: number) => {
  const now = returnDate || Date.now();
  const diff = now - dueDate;

  if (diff <= 0) {
    return {
      isOverdue: false,
      days: 0,
      fine: 0,
      fineText: "Rp 0",
    };
  }

  const FINE_PER_DAY = 1000;
  const daysOverdue = Math.ceil(diff / (1000 * 60 * 60 * 24));
  const fine = daysOverdue * FINE_PER_DAY;

  return {
    isOverdue: true,
    days: daysOverdue,
    fine,
    fineText: `Rp ${fine.toLocaleString("id-ID")}`,
  };
};

export const formatRelativeDate = (timestamp: number) => {
  const now = Date.now();
  const diff = timestamp - now;
  const absDiff = Math.abs(diff);

  const minutes = Math.floor(absDiff / (1000 * 60));
  const hours = Math.floor(absDiff / (1000 * 60 * 60));
  const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));

  if (diff < 0) {
    // Past
    if (days > 7) {
      return new Date(timestamp).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } else if (days > 0) {
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else {
      return "Just now";
    }
  } else {
    // Future
    if (days > 7) {
      return new Date(timestamp).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } else if (days > 0) {
      return `in ${days} day${days > 1 ? "s" : ""}`;
    } else if (hours > 0) {
      return `in ${hours} hour${hours > 1 ? "s" : ""}`;
    } else if (minutes > 0) {
      return `in ${minutes} minute${minutes > 1 ? "s" : ""}`;
    } else {
      return "Soon";
    }
  }
};

export const getUrgencyLevel = (dueDate: number) => {
  const { days, hours, isOverdue } = calculateTimeRemaining(dueDate);

  if (isOverdue) {
    return {
      level: "critical",
      color: "danger",
      icon: "alert-circle",
      message: "Overdue! Return immediately",
    };
  }

  if (days === 0 && hours <= 3) {
    return {
      level: "urgent",
      color: "danger",
      icon: "time",
      message: "Due in less than 3 hours!",
    };
  }

  if (days <= 1) {
    return {
      level: "warning",
      color: "warning",
      icon: "alert",
      message: "Due soon",
    };
  }

  if (days <= 3) {
    return {
      level: "moderate",
      color: "primary",
      icon: "information-circle",
      message: `${days} days remaining`,
    };
  }

  return {
    level: "normal",
    color: "success",
    icon: "checkmark-circle",
    message: "On track",
  };
};
