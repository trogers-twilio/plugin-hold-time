export const getCustomerParticipantFromTask = (task) => {
  const conferenceChildren = task?.conference?.source?.children || [];

  const customerParticipant = conferenceChildren.find(p => p?.value?.participant_type === 'customer');

  return customerParticipant;
}
