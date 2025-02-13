import { addDays, format, parse, setHours, setMinutes } from 'date-fns';

export interface ReminderTime {
  hour: number;
  minute: number;
}

export interface CustomTime {
  time: string;
}

export const frequencyToTimes: Record<string, ReminderTime[]> = {
  once: [{ hour: 9, minute: 0 }],
  twice: [
    { hour: 9, minute: 0 },
    { hour: 21, minute: 0 }
  ],
  thrice: [
    { hour: 9, minute: 0 },
    { hour: 15, minute: 0 },
    { hour: 21, minute: 0 }
  ],
  four: [
    { hour: 9, minute: 0 },
    { hour: 13, minute: 0 },
    { hour: 17, minute: 0 },
    { hour: 21, minute: 0 }
  ]
};

export const generateReminders = (
  medicine: string,
  dosage: string,
  frequency: string,
  startDate: string,
  duration: string,
  customTimes?: string[],
  phoneNumber?: string // Add phone number parameter
) => {
  let times: { hour: number; minute: number }[] = [];

  if (customTimes && customTimes.length > 0) {
    times = customTimes.map(time => {
      const [hours, minutes] = time.split(':').map(Number);
      return { hour: hours, minute: minutes };
    });
  } else {
    times = frequencyToTimes[frequency];
  }

  const durationDays = parseInt(duration);
  const reminders = [];
  const start = parse(startDate, 'yyyy-MM-dd', new Date());

  for (let day = 0; day < durationDays; day++) {
    const currentDate = addDays(start, day);

    times.forEach(({ hour, minute }) => {
      const reminderTime = setMinutes(setHours(currentDate, hour), minute);
      reminders.push({
        id: `${medicine}-${format(reminderTime, 'yyyy-MM-dd-HH-mm')}`,
        medicine,
        dosage,
        time: format(reminderTime, 'h:mm a'),
        date: format(reminderTime, 'yyyy-MM-dd'),
        type: 'Regular',
        taken: false,
        phoneNumber // Include phone number in the reminder
      });
    });
  }

  return reminders;
};