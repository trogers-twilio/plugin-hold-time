import { Actions, Manager } from '@twilio/flex-ui';

import {
  logHoldPress,
  logUnholdPress,
  handleOnDisconnectVoiceClient,
  handleOnBeforeCompleteTask,
} from "../helpers/logHoldTime";

const manager = Manager.getInstance();

export const initializeListeners = () => {
  Actions.addListener("beforeHoldCall", (payload) => {
    logHoldPress(payload, manager.store);
  });

  Actions.addListener("beforeUnholdCall", (payload) => {
    logUnholdPress(payload, manager.store, false);
  });

  Actions.addListener("beforeCompleteTask", async (payload) =>
    handleOnBeforeCompleteTask(payload, manager.store)
  );

  manager.voiceClient.on("disconnect", (payload) =>
    handleOnDisconnectVoiceClient(payload, manager.store)
  );
}
