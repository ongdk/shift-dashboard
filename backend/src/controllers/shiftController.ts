import { Router } from "express";
import ShiftService from "../services/ShiftService";

const router = Router();

router.get("/retrieveShifts", async (req, res) => {
  try {
    const shifts = await ShiftService.getShifts(req.query.search as string);
    res.send({
      success: true,
      data: shifts,
    });
  } catch (e: any) {
    res.send({
      success: false,
      error: e.message,
    });
  }
});

router.post("/updateShiftsStatus", async (req, res) => {
  try {
    const result = await ShiftService.updateShiftsStatus(req.body);
    res.send({
      success: true,
      data: result,
    });
  } catch (e: any) {
    res.send({
      success: false,
      error: e.message,
    });
  }
});

export default router;
