
import { differenceInMinutes, parse, format } from 'date-fns';

export interface TimesheetCalculation {
  workingHours: number;
  otHours: number;
  isLate: boolean;
  isEarlyLeave: boolean;
}

export function calculateHours(
  checkIn: string, // HH:mm
  checkOut: string, // HH:mm
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

  const totalMinutes = differenceInMinutes(end, start);
  const effectiveWorkMinutes = totalMinutes - breakMinutes;
  
  // Normal hours are capped at 8 usually, but let's follow the requirement:
  // "OT after 8 hours" and "OT starts after 17:00"
  
  const workingHours = Math.max(0, effectiveWorkMinutes / 60);
  
  // OT logic: Hours worked after 17:00
  let otHours = 0;
  if (end > standardEnd) {
    otHours = differenceInMinutes(end, standardEnd) / 60;
  }

  // Late arrival
  const isLate = start > standardStart;

  // Early leave
  const isEarlyLeave = end < standardEnd;

  return {
    workingHours: Math.min(workingHours, rules.maxNormalHours),
    otHours: otHours,
    isLate,
    isEarlyLeave
  };
}
