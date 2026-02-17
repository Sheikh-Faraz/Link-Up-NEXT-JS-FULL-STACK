export const getMessagesApi = async (userId: string) => {
  const res = await fetch(`/api/messages/${userId}`);
  return res.json();
};