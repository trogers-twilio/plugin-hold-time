import { Manager } from '@twilio/flex-ui';

const manager = Manager.getInstance();

export const initializeStrings = () => {
  manager.strings.TaskLineCallAssigned = '{{CustomTaskLineCallAssigned}}';
  manager.strings.TaskHeaderStatusAccepted = '{{CustomTaskLineCallAssigned}}';
  manager.strings.SupervisorTaskLive = '{{CustomTaskLineCallAssigned}}';
  manager.strings.TaskHeaderGroupCallAccepted = "{{CustomTaskLineCallAssigned}} | {{{icon name='Participant'}}} {{task.conference.liveParticipantCount}}" ;
  manager.strings.TaskLineGroupCallAssigned = "{{CustomTaskLineCallAssigned}} | {{{icon name='Participant'}}} {{task.conference.liveParticipantCount}}";
  manager.strings.SupervisorTaskGroupCall = "{{CustomTaskLineCallAssigned}} | {{task.conference.liveParticipantCount}}";
}
