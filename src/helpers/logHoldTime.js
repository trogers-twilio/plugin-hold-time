import { Manager, TaskHelper } from '@twilio/flex-ui';

import { holdPressed, unholdPressed } from "../actions/holdActions";

const manager = Manager.getInstance();

export const logHoldPress = (payload, store, holdStartTime) => {
  const reservationSid = payload.sid;

  store.dispatch(holdPressed(reservationSid, holdStartTime));
};

export const logUnholdPress = (payload, store, wrapup, holdEndTime) => {
  const reservationSid = payload.sid;
  const state = store.getState();

  if (reservationSid in state.holdTimeTracker.reservations) {
    const holdStartTime = new Date(
      state.holdTimeTracker.reservations[reservationSid].holdStartTime
    );
    const trueHoldEndTime = holdEndTime || Date.now();

    const newHoldDuration = (trueHoldEndTime - holdStartTime) / 1000;
    const currentHoldTime = state.holdTimeTracker.reservations[reservationSid].holdTime
      ? state.holdTimeTracker.reservations[reservationSid].holdTime
      : 0;

    const holdTime = newHoldDuration + currentHoldTime;
    store.dispatch(unholdPressed(reservationSid, holdTime, wrapup));
  }
};

export const handleOnDisconnectVoiceClient = (payload, store) => {
  const call_sid = payload.parameters.CallSid;
  let flag = false;
  const reservations = store.getState().flex.worker.tasks;

  for (let [, reservation] of reservations) {
    if (reservation.conference && reservation.conference.participants) {
      for (let i = 0; i < reservation.conference.participants.length; i++) {
        let participantCallSid = reservation.conference.participants[i].callSid;
        if (participantCallSid === call_sid) {
          flag = true;
          break;
        }
      }
      if (flag) {
        wrapupTask(reservation, store);
        break;
      }
    }
  }
};

export const wrapupTask = (reservation, store) => {
  let state = store.getState();
  const reservationSid = reservation.sid;
  let holdTime = 0;

  if (state.holdTimeTracker.reservations[reservationSid]) {
    // calulate hold time if call disconnected during hold
    const disconnectOnHold = state.holdTimeTracker.reservations[reservationSid].activeHold;
    const payload = { sid: reservationSid };

    if (disconnectOnHold) {
      logUnholdPress(payload, store, true);
      state = store.getState();
    }

    holdTime = state.holdTimeTracker.reservations[reservationSid].holdTime == null
      ? 0
      : state.holdTimeTracker.reservations[reservationSid].holdTime;

    console.log("The calculated hold time is", holdTime);
  }
};

export const handleOnBeforeCompleteTask = async (payload, store) => {
  const { task } = payload;

  if (TaskHelper.isCallTask(task)) {
    let state = store.getState();

    const reservationSid = payload.sid;
    let holdCount = null
    let onholdHangup = null
    let holdTime = 0

    if (state.holdTimeTracker.reservations[reservationSid]) {
      holdCount = state.holdTimeTracker.reservations[reservationSid].holdCounter;
      onholdHangup = state.holdTimeTracker.reservations[reservationSid]
        .activeHold
        ? true
        : false;
      holdTime = state.holdTimeTracker.reservations[reservationSid].holdTime;
    } 

    let attributes = payload.task.attributes;

    const workerAttributes = manager.workerClient?.attributes;

    // Setting hold time and key worker attributes on task. Adding the worker
    // attributes to this plugin instead of its own plugin to avoid task attribute 
    // update conflicts in the beforeCompleteTask listeners
    const newTaskAttributes = {
      ...attributes,
      conversations: {
        ...attributes.conversations,
        hold_time: holdTime,
        conversation_attribute_9: workerAttributes?.location,
        conversation_attribute_10: workerAttributes?.manager
      }
    }

    await payload.task.setAttributes(newTaskAttributes);
    console.log("Updated hold_time on task to", holdTime);
  }
};
