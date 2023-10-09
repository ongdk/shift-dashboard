import fs from "fs";

// Adding id to each shift and simulate indexing shifts by their id
const shifts = JSON.parse(fs.readFileSync(`${__dirname}/../assets/data.json`, "utf-8")).reduce(
  (prev: any, record: any, index: number) => {
    const id = `s${String(index).padStart(4, "0")}`;
    return {
      ...prev,
      [id]: {
        id,
        ...record,
      },
    };
  },
  {}
) as Record<string, Shift>;

export interface Shift {
  id: string;
  startedAt: string;
  endedAt: string;
  status: "CONFIRMED" | "PENDING" | "DECLINED";
  userId: number;
  chiName: string;
  lastName: string;
  firstName: string;
  role: "PWH" | "ST" | "EN";
}

const getShifts = (search = "") => {
  return Object.values(shifts).filter(({ firstName, lastName, chiName, id }) => {
    if (`${lastName} ${firstName}`.toLowerCase().includes(search.toLowerCase())) {
      return true;
    }
    if (chiName.toLowerCase().includes(search.toLowerCase())) {
      return true;
    }
    if (String(id).includes(search)) {
      return true;
    }
    return false;
  });
};

const getShiftById = (shiftId: string) => {
  return shifts[shiftId];
};

const updateShiftStatus = (shiftId: string, status: Shift["status"]) => {
  shifts[shiftId].status = status;
  return;
};

export default {
  getShifts,
  getShiftById,
  updateShiftStatus,
};
