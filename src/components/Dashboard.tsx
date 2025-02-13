import React, { useState, useRef, useEffect } from 'react';
import { Upload, AlertCircle, X, CheckCircle, Bell, Loader2, Calendar, ChevronLeft, ChevronRight, Pill } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay, isToday } from 'date-fns';
import { generateReminders } from '../utils/reminderUtils';
import { requestNotificationPermission, scheduleNotification } from '../utils/notifications';
import { fetchDrugInfo } from '../utils/druginfoUtils';
import { sendWhatsAppMessage } from '../utils/smsUtils';

interface DashboardProps {
  showCalendar: boolean;
  setShowCalendar: (show: boolean) => void;
  activeView: 'upload' | 'calendar' | 'notifications' | 'medicines';
}

interface FormErrors {
  medicineName?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  startDate?: string;
  phoneNumber?: string; 
}

interface Reminder {
  id: string;
  medicine: string;
  time: string;
  date: string;
  dosage: string;
  type: string;
  taken: boolean;
  phoneNumber?: string; 
}

interface TimeInput {
  time: string;
}

const Dashboard = ({ showCalendar, setShowCalendar, activeView }: DashboardProps) => {
  const [allReminders, setAllReminders] = useState<Reminder[]>([]);

  const handleAddReminder = (newReminders: Reminder[]) => {
    setAllReminders(prev => [...prev, ...newReminders]);
  };
  const handleUpdateReminder = (updatedReminder: Reminder) => {
    setAllReminders(prev =>
      prev.map(r => (r.id === updatedReminder.id ? updatedReminder : r))
    );
  };

  const renderContent = () => {
    switch (activeView) {
      case 'upload':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {showCalendar ? (
              <CalendarView 
                onClose={() => setShowCalendar(false)} 
                reminders={allReminders}
                onUpdateReminder={(updatedReminder) => {
                  setAllReminders(prev => 
                    prev.map(r => r.id === updatedReminder.id ? updatedReminder : r)
                  );
                }}
              />
            ) : (
              <UploadSection onAddReminders={handleAddReminder} />
            )}
            <ActiveReminders 
              onShowCalendar={() => setShowCalendar(true)} 
              reminders={allReminders}
              onUpdateReminder={(updatedReminder) => {
                setAllReminders(prev => 
                  prev.map(r => r.id === updatedReminder.id ? updatedReminder : r)
                );
              }}
            />
          </div>
        );
        
      case 'notifications':
        return <NotificationsView reminders={allReminders} />;
        case 'medicines':
          return (
            <MedicinesView
              reminders={allReminders}
              onUpdateReminder={(updatedReminder) => {
                setAllReminders(prev =>
                  prev.map(r => r.id === updatedReminder.id ? updatedReminder : r)
                );
              }}
            />
          );
      
        case 'calendar':
          return (
            <CalendarView 
                onClose={() => setShowCalendar(false)} 
                reminders={allReminders}
                onUpdateReminder={(updatedReminder) => {
                  setAllReminders(prev => 
                    prev.map(r => r.id === updatedReminder.id ? updatedReminder : r)
                  );
                }}
              />
          );
        default:
        return null;
    }
  };

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {activeView === 'upload' && 'Dashboard'}
          {activeView === 'notifications' && 'Notifications'}
          {activeView === 'medicines' && 'Medicines'}
        </h1>
        <p className="text-gray-600">
          {activeView === 'upload' && 'Upload and manage your prescriptions'}
          {activeView === 'notifications' && 'Stay updated with your medication schedule'}
          {activeView === 'medicines' && 'Track your medications and prescriptions'}
        </p>
      </header>
      {renderContent()}
    </div>
  );
};

const UploadSection = ({ onAddReminders }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customTimes, setCustomTimes] = useState<TimeInput[]>([{ time: '09:00' }]);
  const [formData, setFormData] = useState({
    medicineName: '',
    dosage: '',
    frequency: '',
    duration: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    phoneNumber: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const handleAddTime = () => {
    setCustomTimes([...customTimes, { time: '09:00' }]);
  };

  const handleRemoveTime = (index: number) => {
    setCustomTimes(customTimes.filter((_, i) => i !== index));
  };

  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...customTimes];
    newTimes[index].time = value;
    setCustomTimes(newTimes);
  };

  const processImage = async (file: File) => {
    try {
      setIsProcessing(true);
      const worker = await createWorker('eng');
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      const medicinePattern = /([A-Za-z]+)\s*(\d+(?:\.\d+)?(?:\s*mg|\s*ml)?)/g;
      const matches = Array.from(text.matchAll(medicinePattern));

      if (matches.length > 0) {
        const [_, medicineName, dosage] = matches[0];
        setFormData(prev => ({
          ...prev,
          medicineName: medicineName.trim(),
          dosage: dosage.trim()
        }));

        setNotification({
          type: 'success',
          message: 'Prescription processed successfully'
        });
      } else {
        setNotification({
          type: 'error',
          message: 'Could not extract medicine information. Please fill in manually.'
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to process prescription. Please try again or fill in manually.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.medicineName.trim()) {
      newErrors.medicineName = 'Medicine name is required';
    }
    if (!formData.dosage.trim()) {
      newErrors.dosage = 'Dosage is required';
    }
    if (!formData.frequency) {
      newErrors.frequency = 'Frequency is required';
    }
    if (!formData.duration.trim()) {
      newErrors.duration = 'Duration is required';
    } else if (isNaN(Number(formData.duration))) { // Check if it is a number
        newErrors.duration = 'Duration must be a number';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (customTimes.length === 0 && formData.frequency !== "once") { // Check if custom times are set when needed
      newErrors.frequency = 'At least one time must be set';
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required'; // Validate phone number
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      handleFile(file);
    } else {
      setNotification({
        type: 'error',
        message: 'Please upload a valid image (JPG or PNG)'
      });
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = async (file: File) => {
    setPreview(URL.createObjectURL(file));
    await processImage(file);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setNotification({
        type: 'error',
        message: 'Please fill in all required fields'
      });
      return;
    }

    try {
      const times = customTimes.map(t => t.time);
       const duration = Number(formData.duration);
      const reminders = generateReminders(
        formData.medicineName,
        formData.dosage,
        formData.frequency,
        formData.startDate,
        formData.duration,
        times,
        formData.phoneNumber
      );

      reminders.forEach((reminder) => {
        const [date, time] = [reminder.date, reminder.time];
        const reminderDate = new Date(`${date} ${time}`);
  
        // Schedule local notification
        scheduleNotification(`Time to take ${reminder.medicine} ${reminder.dosage}`, reminderDate);
  
        // Send WhatsApp message
        sendWhatsAppMessage(
          formData.phoneNumber, // Recipient's phone number
          {
            '1': reminder.medicine, // Medicine name
            '2': reminder.time,     // Time to take the medicine
          }
        );
      });
      
      onAddReminders(reminders);
      
      setNotification({
        type: 'success',
        message: 'Prescription saved and reminders scheduled'
      });
      
      setFormData({
        medicineName: '',
        dosage: '',
        frequency: '',
        duration: '',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        phoneNumber: '',
      });
      setCustomTimes([{ time: '09:00' }]);
      setPreview(null);
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to save prescription. Please try again.'
      });
    }
  };

  return (
    <div className="space-y-6">
      {notification.type && (
        <div
          className={`p-4 rounded-lg ${
            notification.type === 'success'
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <p>{notification.message}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Upload Prescription</h2>
        <div 
          className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
            dragActive 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center text-center">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600">Processing prescription...</p>
            </div>
          ) : preview ? (
            <div className="relative">
              <img 
                src={preview} 
                alt="Prescription preview" 
                className="max-h-64 mx-auto rounded-lg"
              />
              <button 
                onClick={() => setPreview(null)}
                className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <Upload className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">
                Drag and drop your prescription here, or
              </p>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Files
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInput}
                accept="image/jpeg,image/png"
                className="hidden"
              />
              <p className="text-sm text-gray-500 mt-2">
                Supports JPG and PNG files
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Prescription Details</h2>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medicine Name
            </label>
            <input
              type="text"
              value={formData.medicineName}
              onChange={(e) => {
                setFormData({...formData, medicineName: e.target.value});
                if (errors.medicineName) {
                  setErrors({...errors, medicineName: undefined});
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.medicineName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter medicine name"
            />
            {errors.medicineName && (
              <p className="mt-1 text-sm text-red-600">{errors.medicineName}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dosage
              </label>
              <input
                type="text"
                value={formData.dosage}
                onChange={(e) => {
                  setFormData({...formData, dosage: e.target.value});
                  if (errors.dosage) {
                    setErrors({...errors, dosage: undefined});
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.dosage ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., 500mg"
              />
              {errors.dosage && (
                <p className="mt-1 text-sm text-red-600">{errors.dosage}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequency
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => {
                  setFormData({...formData, frequency: e.target.value});
                  // Update number of time inputs based on frequency
                  const freq = e.target.value;
                  if (freq) {
                    const count = freq === 'once' ? 1 : 
                                freq === 'twice' ? 2 : 
                                freq === 'thrice' ? 3 : 4;
                    setCustomTimes(Array(count).fill(null).map(() => ({ time: '09:00' })));
                  }
                  if (errors.frequency) {
                    setErrors({...errors, frequency: undefined});
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.frequency ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select frequency</option>
                <option value="once">Once daily</option>
                <option value="twice">Twice daily</option>
                <option value="thrice">Thrice daily</option>
                <option value="four">Four times daily</option>
                <option value="custom">Custom times</option>
              </select>
              {errors.frequency && (
                <p className="mt-1 text-sm text-red-600">{errors.frequency}</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Medicine Times
            </label>
            {customTimes.map((timeInput, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="time"
                  value={timeInput.time}
                  onChange={(e) => handleTimeChange(index, e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                />
                {formData.frequency === 'custom' && (
                  <button
                    type="button"
                    onClick={() => handleRemoveTime(index)}
                    className="p-2 text-red-600 hover:text-red-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
            {formData.frequency === 'custom' && (
              <button
                type="button"
                onClick={handleAddTime}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                + Add another time
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (days)
              </label>
              <input
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) => {
                  setFormData({...formData, duration: e.target.value});
                  if (errors.duration) {
                    setErrors({...errors, duration: undefined});
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.duration ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., 7"
              />
              {errors.duration && (
                <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                min={format(new Date(), 'yyyy-MM-dd')}
                onChange={(e) => {
                  setFormData({...formData, startDate: e.target.value});
                  if (errors.startDate) {
                    setErrors({...errors, startDate: undefined});
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.startDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
              )}
            </div>
          </div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
          <input
        type="text"
        value={formData.phoneNumber}
        onChange={(e) =>
          setFormData({ ...formData, phoneNumber: e.target.value })
        }
        placeholder="Enter phone number (e.g., +1234567890)"
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {errors.phoneNumber && <p>{errors.phoneNumber}</p>}

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Prescription
          </button>
        </form>
      </div>
    </div>
  );
};

const CalendarView = ({ 
  onClose, 
  reminders, 
  onUpdateReminder 
}: { 
  onClose: () => void;
  reminders: Reminder[];
  onUpdateReminder: (reminder: Reminder) => void;
}) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const weekDays = Array.from({ length: 7 }, (_, i) => 
    addDays(startOfWeek(currentWeek), i)
  );

  const handlePrevWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));
  const handleNextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));

  const dayReminders = (date: Date) => 
    reminders.filter(r => isSameDay(new Date(r.date), date));

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Calendar View</h2>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={handlePrevWeek}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNextWeek}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Back to Upload
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {weekDays.map((date) => (
          <div 
            key={date.toISOString()} 
            className={`border rounded-lg p-3 min-w-0 ${
              isToday(date) ? 'bg-blue-50 border-blue-200' : ''
            }`}
          >
            <div className="text-center mb-2">
              <p className="text-sm text-gray-500">
                {format(date, 'EEE')}
              </p>
              <p className={`text-lg font-semibold ${
                isToday(date) ? 'text-blue-600' : ''
              }`}>
                {format(date, 'd')}
              </p>
            </div>
            <div className="space-y-2">
              {dayReminders(date).map((reminder) => (
                <div
                  key={reminder.id}
                  className={`p-2 rounded-md text-sm overflow-hidden group relative ${
                    reminder.taken
                      ? 'bg-green-50 text-green-700'
                      : 'bg-blue-50 text-blue-700'
                  }`}
                >
                  <div 
                    className="font-medium truncate cursor-help"
                    title={`${reminder.medicine} - ${reminder.dosage}`}
                  >
                    {reminder.medicine}
                  </div>
                  <div 
                    className="text-xs truncate cursor-help"
                    title={reminder.dosage}
                  >
                    {reminder.dosage}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs">{reminder.time}</span>
                    {!reminder.taken && (
                      <button
                        onClick={() => onUpdateReminder({ ...reminder, taken: true })}
                        className="text-xs hover:text-blue-800 whitespace-nowrap"
                      >
                        Take
                      </button>
                    )}
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 left-1/2 -translate-x-1/2 -top-8 w-max max-w-[200px] z-50">
                    {reminder.medicine}
                    <div className="absolute w-2 h-2 bg-gray-900 rotate-45 left-1/2 -translate-x-1/2 bottom-[-4px]"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ActiveReminders = ({ 
  onShowCalendar,
  reminders,
  onUpdateReminder
}: { 
  onShowCalendar: () => void;
  reminders: Reminder[];
  onUpdateReminder: (reminder: Reminder) => void;
}) => {
  const todayReminders = reminders.filter(reminder => 
    isSameDay(new Date(reminder.date), new Date())
  );

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Today's Reminders</h2>
        <div className="flex gap-2">
          <button 
            onClick={onShowCalendar}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Calendar className="h-5 w-5" />
          </button>
          <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <Bell className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="space-y-4">
        {todayReminders.length > 0 ? (
          todayReminders.map((reminder) => (
            <div 
              key={reminder.id}
              className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                reminder.taken
                  ? 'bg-green-50'
                  : 'bg-gray-50'
              }`}
            >
              <div>
                <h3 className="font-medium text-gray-900">{reminder.medicine}</h3>
                <p className="text-sm text-gray-600">
                  {reminder.dosage} • {reminder.type}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-blue-600">{reminder.time}</p>
                <button 
                  onClick={() => onUpdateReminder({ ...reminder, taken: true })}
                  className={`text-sm transition-colors ${
                    reminder.taken
                      ? 'text-green-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  disabled={reminder.taken}
                >
                  {reminder.taken ? 'Taken' : 'Mark as taken'}
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-4">
            No reminders for today
          </p>
        )}
      </div>
    </div>
  );
};



const NotificationsView = ({ reminders }: { reminders: Reminder[] }) => {
  console.log('Reminders:', reminders);
  const today = new Date();
  const notifications = reminders
    .filter(reminder => new Date(reminder.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="space-y-4">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div 
                key={notification.id}
                className="flex items-start gap-4 p-4 rounded-lg bg-gray-50"
              >
                <div className="p-2 rounded-full bg-blue-100">
                  <Bell className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    Time to take {notification.medicine}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {notification.dosage} • {notification.time}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {format(new Date(notification.date), 'MMMM d, yyyy')}
                  </p>
                </div>
                {!notification.taken && (
                  <button className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Mark as taken
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No notifications
              </h3>
              <p className="text-gray-600">
                You're all caught up! Check back later for new reminders.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface MedicinesViewProps {
  reminders: Reminder[];
  onUpdateReminder: (reminder: Reminder) => void; // Function to update reminders
}

interface Reminder {
  id: string;
  medicine: string;
  time: string;
  date: string;
  dosage: string;
  type: string;
  taken: boolean;
}

const MedicinesView = ({ reminders, onUpdateReminder }: MedicinesViewProps) => {
  const [selectedMedicine, setSelectedMedicine] = useState<string | null>(null); // State to track selected medicine
  const [drugInfo, setDrugInfo] = useState<any | null>(null); // State to store drug info fetched from API
  const [loading, setLoading] = useState(false); // Loading state for API call

  // Group reminders by medicine name
  const medicines = Array.from(new Set(reminders.map((r) => r.medicine))).map((medicine) => {
    const medicineReminders = reminders.filter((r) => r.medicine === medicine);
    const totalDoses = medicineReminders.length;
    const takenDoses = medicineReminders.filter((r) => r.taken).length;
    return {
      name: medicine,
      dosage: medicineReminders[0]?.dosage || 'N/A', // Default dosage if unavailable
      progress: (takenDoses / totalDoses) * 100,
      remainingDoses: totalDoses - takenDoses,
      nextDose: medicineReminders.find((r) => !r.taken)?.time || 'Completed',
      nextDoseId: medicineReminders.find((r) => !r.taken)?.id || null, // ID of the next untaken dose
    };
  });

  // Fetch drug information when a medicine is clicked
  const handleMedicineClick = async (medicineName: string) => {
    setLoading(true);
    setSelectedMedicine(medicineName);
    try {
      const info = await fetchDrugInfo(medicineName);
      setDrugInfo(info);
    } catch (error) {
      console.error('Failed to fetch drug information:', error);
      setDrugInfo(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle marking a reminder as taken
  const handleMarkAsTaken = (reminderId: string) => {
    const reminderToUpdate = reminders.find((r) => r.id === reminderId);
    if (reminderToUpdate) {
      const updatedReminder = { ...reminderToUpdate, taken: true };
      onUpdateReminder(updatedReminder); // Update the reminder in the parent
    }
  };

  return (
    <div className="flex gap-12">
      {/* List of medicines */}
      {medicines.map((medicine) => (
        <div key={medicine.name} className="mb-6">
          <button
            onClick={() => handleMedicineClick(medicine.name)} // Fetch drug info on click
            className="text-left w-full"
          >
            <h3 className="text-lg font-semibold text-gray-800">{medicine.name}</h3>
            <p className="text-sm text-gray-600">{medicine.dosage}</p>
            <div className="mt-2">
              <p className="text-xs text-gray-500">Progress</p>
              <p className="text-base font-medium text-gray-700">{medicine.progress.toFixed(0)}%</p>
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">Remaining doses</p>
              <p className="text-base font-medium text-gray-700">{medicine.remainingDoses}</p>
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">Next dose</p>
              <p className="text-base font-medium text-gray-700">{medicine.nextDose}</p>
            </div>
            {/* Mark as Taken Button */}
            {medicine.nextDoseId && (
              <button
                onClick={() => handleMarkAsTaken(medicine.nextDoseId!)}
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Mark as Taken
              </button>
            )}
          </button>
        </div>
      ))}

      {/* Display drug info if a medicine is selected */}
      {selectedMedicine && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900">Details for {selectedMedicine}</h2>
          {loading ? (
            <p className="text-gray-600">Loading drug information...</p>
          ) : drugInfo ? (
            <div>
              <p className="text-gray-700">
                <strong>Indications:</strong> {drugInfo.indications_and_usage || 'Not available'}
              </p>
              <p className="text-gray-700">
                <strong>Side Effects:</strong> {drugInfo.adverse_reactions || 'Not available'}
              </p>
              <p className="text-gray-700">
                <strong>Dosage Info:</strong> {drugInfo.dosage_and_administration || 'Not available'}
              </p>
            </div>
          ) : (
            <p className="text-red-500">Failed to load drug information.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;