import { Box, Button as ButtonBase, Typography, Checkbox, Chip } from "@mui/material";
import React, { useMemo, useState } from "react";
import { grey, purple, blue, orange, red, green } from "@mui/material/colors";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { styled } from "@mui/material/styles";
import AccessTimeFilledRoundedIcon from "@mui/icons-material/AccessTimeFilledRounded";

const Button = styled(ButtonBase)(() => ({
  textTransform: "capitalize",
}));
interface Shift {
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

type MonthShifts = Record<string, Shift[]>;
export type GroupedShifts = Record<string, MonthShifts>;

interface ShiftsBoardProps {
  shifts: GroupedShifts;
  refreshShifts: () => void;
}

export const ShiftsBoard = ({ shifts, refreshShifts }: ShiftsBoardProps) => {
  const monthShiftsGrouped = useMemo<Record<string, Shift[]>>(() => {
    return Object.entries(shifts).reduce((prev, [month, monthShifts]) => {
      return {
        ...prev,
        [month]: Object.values(monthShifts).reduce((prev, dayShifts) => {
          return [...prev, ...dayShifts];
        }, []),
      };
    }, {});
  }, [shifts]);

  const [selectedShifts, setSelectedShifts] = useState(new Set<string>());
  const [loading, setLoading] = useState(false);

  const addSelectedShift = (id: string) => {
    setSelectedShifts((prev) => {
      const copy = new Set(prev);
      copy.add(id);
      return copy;
    });
  };

  const deleteSelectedShift = (id: string) => {
    setSelectedShifts((prev) => {
      const copy = new Set(prev);
      copy.delete(id);
      return copy;
    });
  };

  const updateShiftsStatus = async (changes: any[]) => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/shift/updateShiftsStatus", {
        method: "POST",
        body: JSON.stringify(changes),
        headers: {
          "content-type": "application/json",
        },
      });

      if (res.ok) {
        const { success, error, data } = await res.json();
        if (success) {
          console.log(data);
          return data;
        }

        throw new Error(error);
      }

      throw new Error("Server error");
    } catch (e: any) {
      console.error(e);
      // Can be displayed in a snack bar
    } finally {
      setLoading(false);
      refreshShifts();
    }
  };

  const confirmShift = async (id: string) => {
    updateShiftsStatus([
      {
        shiftId: id,
        status: "CONFIRMED",
      },
    ]);
  };
  const declineShift = (id: string) => {
    updateShiftsStatus([
      {
        shiftId: id,
        status: "DECLINED",
      },
    ]);
  };

  const confirmMultipleShifts = (ids: string[]) => {
    updateShiftsStatus(
      ids.map((id) => {
        return {
          shiftId: id,
          status: "CONFIRMED",
        };
      })
    );
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
      }}
    >
      {Object.keys(shifts).length === 0 ? (
        <Typography variant="h4">No shift found</Typography>
      ) : (
        <Box
          sx={{
            width: "100%",
            height: { sm: "100%" },
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            overflow: { xs: "hidden auto", sm: "auto hidden" },
          }}
        >
          {Object.entries(shifts).map(([month, monthShifts]) => {
            return (
              <Box
                key={month}
                sx={{
                  minWidth: { sm: "45%", md: "30%" },
                  height: { xs: "fit-content", sm: "100%" },
                  borderWidth: 2,
                  borderColor: grey[300],
                  borderStyle: "solid",
                  boxSizing: "border-box",
                  borderRadius: 2,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 1,
                    bgcolor: grey[200],
                    padding: 1,
                    borderTopLeftRadius: 6,
                    borderTopRightRadius: 6,
                    alignItems: "center",
                  }}
                >
                  <Checkbox
                    size="small"
                    sx={{
                      padding: 0,
                    }}
                    color="success"
                    disabled={
                      !monthShiftsGrouped[month].some((shift) => {
                        return shift.status === "PENDING";
                      })
                    }
                    checked={
                      monthShiftsGrouped[month].filter((shift) => {
                        return shift.status === "PENDING";
                      }).length > 0 &&
                      monthShiftsGrouped[month]
                        .filter((shift) => {
                          return shift.status === "PENDING";
                        })
                        .every((shift) => {
                          return selectedShifts.has(shift.id);
                        })
                    }
                    onChange={(ev, checked) => {
                      if (checked) {
                        monthShiftsGrouped[month].forEach((shift) => {
                          if (shift.status === "PENDING") addSelectedShift(shift.id);
                        });
                      } else {
                        monthShiftsGrouped[month].forEach((shift) => {
                          if (shift.status === "PENDING") deleteSelectedShift(shift.id);
                        });
                      }
                    }}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      flex: 1,
                      gap: 0.5,
                      flexWrap: "wrap",
                    }}
                  >
                    <Typography variant="body2" width={"6em"}>
                      {new Date(month).toLocaleString("en-US", {
                        month: "long",
                        year: "numeric",
                        timeZone: "UTC",
                      })}
                    </Typography>
                    <Typography variant="body2" width={"7em"}>
                      ({monthShiftsGrouped[month].length} held shifts)
                    </Typography>
                  </Box>
                  <Button
                    variant={"contained"}
                    size="small"
                    color="success"
                    disabled={
                      !monthShiftsGrouped[month].some((shift) => {
                        return selectedShifts.has(shift.id);
                      }) || loading
                    }
                    onClick={() => {
                      const shiftIds = monthShiftsGrouped[month]
                        .filter((shift) => {
                          return shift.status === "PENDING" && selectedShifts.has(shift.id);
                        })
                        .map((shift) => shift.id);
                      confirmMultipleShifts(shiftIds);
                    }}
                  >
                    Confirm
                  </Button>
                </Box>
                <Box
                  sx={{
                    overflowX: "hidden",
                    overflowY: "auto",
                  }}
                >
                  {Object.entries(monthShifts).map(([day, dayShifts]) => {
                    return (
                      <Box key={day}>
                        <Typography variant="body2" sx={{ bgcolor: grey[100], px: 1 }}>
                          {new Date(day).toLocaleString("en-US", {
                            day: "numeric",
                            month: "long",
                            timeZone: "UTC",
                          })}
                        </Typography>
                        {dayShifts.map((shift) => {
                          return (
                            <Box
                              key={shift.id}
                              sx={{
                                display: "flex",
                                flexDirection: "row",
                                gap: 2,
                                alignItems: "center",
                                py: 1,
                              }}
                            >
                              <Checkbox
                                color="success"
                                disabled={shift.status !== "PENDING"}
                                checked={selectedShifts.has(shift.id)}
                                onChange={(ev, checked) => {
                                  if (checked) {
                                    addSelectedShift(shift.id);
                                  } else {
                                    deleteSelectedShift(shift.id);
                                  }
                                }}
                              />
                              <Box
                                sx={{ display: "flex", flexDirection: "column", gap: 0.5, flex: 1 }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <Typography variant={"body2"}>
                                    {new Date(shift.startedAt).toLocaleString("en-US", {
                                      hour: "numeric",
                                      minute: "2-digit",
                                      hour12: true,
                                      timeZone: "UTC",
                                    })}{" "}
                                    -{" "}
                                    {new Date(shift.endedAt).toLocaleString("en-US", {
                                      hour: "numeric",
                                      minute: "2-digit",
                                      hour12: true,
                                      timeZone: "UTC",
                                    })}
                                  </Typography>
                                  {/* Can be enabled */}
                                  {false && (
                                    <Chip
                                      icon={<AccessTimeFilledRoundedIcon color="warning" />}
                                      label={`Release in 3 mins`}
                                      sx={{
                                        bgcolor: orange[100],
                                      }}
                                      size="small"
                                    />
                                  )}
                                </Box>

                                <Typography variant={"body2"}>
                                  {shift.userId} - {shift.lastName} {shift.firstName}{" "}
                                  {shift.chiName}
                                </Typography>
                                <Box>
                                  <Typography
                                    variant={"body2"}
                                    sx={{ display: "flex", alignItems: "center", gap: 0.3 }}
                                  >
                                    <FiberManualRecordIcon
                                      sx={{
                                        fontSize: 10,
                                        color:
                                          shift.role === "ST"
                                            ? blue[200]
                                            : shift.role === "EN"
                                            ? purple[400]
                                            : orange[200],
                                      }}
                                    />
                                    {shift.role}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: "flex", gap: 2 }}>
                                  {shift.status === "PENDING" ? (
                                    <>
                                      <Button
                                        color="error"
                                        variant="outlined"
                                        size="small"
                                        disabled={loading}
                                        onClick={() => {
                                          declineShift(shift.id);
                                        }}
                                      >
                                        Decline
                                      </Button>
                                      <Button
                                        color="success"
                                        variant="contained"
                                        size="small"
                                        onClick={() => {
                                          confirmShift(shift.id);
                                        }}
                                      >
                                        Confirm
                                      </Button>
                                    </>
                                  ) : (
                                    <Button
                                      variant="contained"
                                      size="small"
                                      sx={{
                                        "&:disabled":
                                          shift.status === "CONFIRMED"
                                            ? { bgcolor: green[100], color: green[800] }
                                            : { bgcolor: red[100], color: red[800] },
                                      }}
                                      disabled
                                    >
                                      {shift.status.toLowerCase()}
                                    </Button>
                                  )}
                                </Box>
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};
