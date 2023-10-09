import { Box, CircularProgress, TextField, Typography } from "@mui/material";
import AccessTimeFilledRoundedIcon from "@mui/icons-material/AccessTimeFilledRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import useFetch from "@/hooks/useFetch";
import { ChangeEventHandler, useCallback, useEffect, useMemo, useState } from "react";
import { GroupedShifts, ShiftsBoard } from "@/components/ShiftsBoard";
import debounce from "lodash.debounce";

export default function Home() {
  const [search, setSearch] = useState("");

  const fetchShifts = useCallback(() => {
    return fetch(`http://localhost:8080/shift/retrieveShifts?search=${search}`).then(
      async (res) => {
        if (res.ok) {
          const { success, error, data } = await res.json();
          if (success) {
            return data as GroupedShifts;
          }

          throw new Error(error);
        }

        throw new Error("Server error");
      }
    );
  }, [search]);

  const { loading, data, error, refresh } = useFetch(fetchShifts);

  useEffect(() => {
    refresh();
  }, [search]);

  const searchChangeHandler: ChangeEventHandler<HTMLInputElement> = debounce((ev) => {
    setSearch(ev.target.value);
  }, 500);

  return (
    <Box
      sx={{
        p: 2,
        margin: 0,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        gap: 2,
        flex: 1,
        boxSizing: "border-box",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "row", gap: 1, alignItems: "center" }}>
        <AccessTimeFilledRoundedIcon color="warning" fontSize="small" />
        <Typography variant="caption">
          indicates held shift with less than 24 hours response time
        </Typography>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "row", gap: 1, alignItems: "center" }}>
        <Typography variant="body1">Caregiver Name</Typography>
        <TextField
          placeholder="Search"
          variant="outlined"
          size="small"
          InputProps={{
            endAdornment: <SearchRoundedIcon />,
          }}
          onChange={searchChangeHandler}
        />
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          width: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          overflow: "auto",
        }}
      >
        {loading && <CircularProgress size={100} />}
        {!loading && error && <span>{error.message}</span>}
        {!loading && data && <ShiftsBoard shifts={data!} refreshShifts={refresh} />}
      </Box>
    </Box>
  );
}
