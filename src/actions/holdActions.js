export const holdPressed = (reservationSid, holdStartTime) => ({
  type: "HOLD_PRESSED",
  reservationSid,
  holdStartTime
});

export const unholdPressed = (reservationSid, holdTime, wrapup) => ({
  type: "UNHOLD_PRESSED",
  reservationSid,
  holdTime,
  wrapup,
});
