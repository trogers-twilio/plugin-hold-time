import { Utils } from '@twilio/flex-ui';

import { getCustomerParticipantFromTask } from './utils';

export const registerHandlebarsHelpers = () => {
  window.Handlebars.registerHelper('CustomTaskLineCallAssigned', (payload) => {
    const task = payload?.data?.root?.task
    const customerParticipant = getCustomerParticipantFromTask(task);

    const isCustomerOnHold = customerParticipant?.value?.hold;
    const customerUpdatedTimestamp = customerParticipant?.dateUpdated;

    let timeSinceTaskUpdated;
    if (task?.dateUpdated) {
      timeSinceTaskUpdated = Math.max(Date.now() - task.dateUpdated.getTime(), 0)
    }

    let timeSinceCustomerUpdated;
    if (customerUpdatedTimestamp) {
      timeSinceCustomerUpdated = Math.max(Date.now() - customerUpdatedTimestamp.getTime(), 0)
    }

    const value = isCustomerOnHold
      ? `Hold ${timeSinceCustomerUpdated ? `| ${Utils.formatTimeDuration(timeSinceCustomerUpdated)}` : ''}`
      : `Live ${timeSinceTaskUpdated ? `| ${Utils.formatTimeDuration(timeSinceTaskUpdated)}` : ''}`

    return value;
  });
}