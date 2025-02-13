export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    return false;
  }

  let permission = Notification.permission;

  if (permission !== 'granted') {
    permission = await Notification.requestPermission();
  }

  return permission === 'granted';
};

export const scheduleNotification = (title: string, time: Date) => {
  const now = new Date();
  const delay = time.getTime() - now.getTime();

  if (delay < 0) return;

  setTimeout(() => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body: 'Time to take your medicine!',
        icon: '/medicine-icon.png'
      });
    }
  }, delay);
};