
import { differenceInMinutes, parse, isValid } from 'date-fns';

export interface TimesheetCalculation {
  workingHours: number;
  otHours: number;
  isLate: boolean;
  isEarlyLeave: boolean;
}

/**
 * Calculates working hours, overtime, and punctuality.
 * Optimized for standard 8-hour workday with OT.
 */
export function calculateHours(
  checkIn: string,
  checkOut: string,
  breakMinutes: number = 60,
  rules = {
    standardStart: '08:00',
    standardEnd: '17:00',
    maxNormalHours: 8,
  }
): TimesheetCalculation {
  if (!checkIn || !checkOut) {
    return { workingHours: 0, otHours: 0, isLate: false, isEarlyLeave: false };
  }

  const start = parse(checkIn, 'HH:mm', new Date());
  const end = parse(checkOut, 'HH:mm', new Date());
  const standardStart = parse(rules.standardStart, 'HH:mm', new Date());
  const standardEnd = parse(rules.standardEnd, 'HH:mm', new Date());

  if (!isValid(start) || !isValid(end)) {
    return { workingHours: 0, otHours: 0, isLate: false, isEarlyLeave: false };
  }

  const totalMinutes = differenceInMinutes(end, start);
  const effectiveWorkMinutes = Math.max(0, totalMinutes - breakMinutes);
  const totalHoursWorked = effectiveWorkMinutes / 60;
  
  // OT Calculation: Any time after standardEnd
  let otHours = 0;
  if (end > standardEnd) {
    otHours = differenceInMinutes(end, standardEnd) / 60;
  }

  // Cap normal working hours at 8
  const workingHours = Math.min(totalHoursWorked - otHours, rules.maxNormalHours);

  return {
    workingHours: Number(workingHours.toFixed(1)),
    otHours: Number(otHours.toFixed(1)),
    isLate: start > standardStart,
    isEarlyLeave: end < standardEnd
  };
}
