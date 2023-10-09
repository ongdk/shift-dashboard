import { group } from "console";
import ShiftModel, { Shift } from "../models/ShiftModel";

export interface ShiftChange {
  shiftId: string;
  status: "CONFIRMED" | "PENDING" | "DECLINED";
}

const getShifts = async (search = "") => {
  const shifts = ShiftModel.getShifts(search).sort((a, b) => {
    return new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime();
  });

  // Group shifts by month and date
  const groupedShifts: Record<string, Record<string, Shift[]>> = {};

  shifts.forEach((shift) => {
    const date = new Date(shift.startedAt);
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDate();
    const monthString = new Date(Date.UTC(year, month, 1)).toISOString();
    const dayString = new Date(Date.UTC(year, month, day)).toISOString();

    if (monthString in groupedShifts) {
      if (dayString in groupedShifts[monthString]) {
        groupedShifts[monthString][dayString].push(shift);
      } else {
        groupedShifts[monthString][dayString] = [shift];
      }
    } else {
      groupedShifts[monthString] = {
        [dayString]: [shift],
      };
    }
  });

  return groupedShifts;
};

const updateShiftsStatus = async (shiftChanges: ShiftChange[]) => {
  shiftChanges.forEach(({ shiftId, status }) => {
    const shift = ShiftModel.getShiftById(shiftId);

    if (!shift) {
      throw new Error(`Shift not found - ${shiftId}`);
    }

    if (shift.status === "PENDING") {
      ShiftModel.updateShiftStatus(shiftId, status);
    } else {
      throw new Error(`Cannot update non-pending shift - ${shiftId}`);
    }
  });

  return `Updated ${shiftChanges.length} records`;
};

export default {
  getShifts,
  updateShiftsStatus,
};
