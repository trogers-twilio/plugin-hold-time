import { Actions, Manager } from '@twilio/flex-ui';

import { getCustomerParticipantFromTask } from "../helpers/utils";
import {
  logHoldPress,
  logUnholdPress,
  handleOnDisconnectVoiceClient,
  handleOnBeforeCompleteTask,
} from "../helpers/logHoldTime";

const manager = Manager.getInstance();

let holdCheckInterval = undefined;
let totalHoldCheckRetryDelayMs = 0;
const holdCheckRetryDelayMs = 250;
const maxHoldCheckRetryDelayMs = 15000;

// This logic ensures the customer hold/unhold request actually happened
const waitForCustomerHoldChange = (task, targetHoldState) => new Promise((resolve, reject) => {
  if (holdCheckInterval) {
    clearInterval(holdCheckInterval);
  }
  if (totalHoldCheckRetryDelayMs > 0) {
    totalHoldCheckRetryDelayMs = 0;
  }
  holdCheckInterval = setInterval(() => {
    if (totalHoldCheckRetryDelayMs >= maxHoldCheckRetryDelayMs) {
      clearInterval(holdCheckInterval);
      holdCheckInterval = undefined;
      totalHoldCheckRetryDelayMs = 0;

      console.warn(`Customer hold state did not match ${targetHoldState} within ${maxHoldCheckRetryDelayMs} ms`);
      reject();
    } else {
      totalHoldCheckRetryDelayMs += holdCheckRetryDelayMs;

      const customerParticipant = getCustomerParticipantFromTask(task);

      if (customerParticipant?.value?.hold === targetHoldState) {
        clearInterval(holdCheckInterval);
        holdCheckInterval = undefined;
        totalHoldCheckRetryDelayMs = 0;

        resolve()
      }
    }
  }, holdCheckRetryDelayMs);
});

const logCustomerHold = async (payload) => {
  const { task } = payload;

  try {
    const holdStartTime = Date.now();
    const targetHoldState = true;
    await waitForCustomerHoldChange(task, targetHoldState);

    logHoldPress(payload, manager.store, holdStartTime);
  } catch (error) {
    console.warn('Not logging hold press');
  }
}

const logCustomerUnhold = async (payload) => {
  const { task } = payload;

  try {
    const holdEndTime = Date.now();
    const targetHoldState = false;
    await waitForCustomerHoldChange(task, targetHoldState);
    
    logUnholdPress(payload, manager.store, false, holdEndTime);
  } catch (error) {
    console.warn('Not logging unhold press');
  }
}

export const initializeListeners = () => {
  Actions.addListener("afterHoldCall", (payload) => {
    logCustomerHold(payload);
  });

  Actions.addListener("afterUnholdCall", (payload) => {
    logCustomerUnhold(payload);
  });

  Actions.addListener("afterHoldParticipant", (payload) => {
    const { participantType } = payload;
    
    if (participantType === 'customer') {
      logCustomerHold(payload);
    }
  });

  Actions.addListener("afterUnholdParticipant", (payload) => {
    const { participantType } = payload;
    
    if (participantType === 'customer') {
      logCustomerUnhold(payload);
    }
  });

  Actions.addListener("beforeCompleteTask", async (payload) =>
    handleOnBeforeCompleteTask(payload, manager.store)
  );

  manager.voiceClient.on("disconnect", (payload) =>
    handleOnDisconnectVoiceClient(payload, manager.store)
  );
}
