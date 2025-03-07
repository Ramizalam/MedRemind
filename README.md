

# MedRemind: A Prescription and Reminder Management App

MedRemind is a web application designed to help users manage their prescriptions, set reminders for medicine intake, and receive notifications via SMS, WhatsApp, or desktop alerts. The app also provides basic drug information such as side effects, usage instructions, and alternatives.

---

## Features

- **Prescription Upload**:
  - Upload handwritten prescriptions using OCR (Optical Character Recognition) to extract medicine names and dosages.
- **Reminder Scheduling**:
  - Set reminders for medicine intake based on frequency, duration, and start date.
  - View reminders in a calendar format.
- **Notifications**:
  - Receive desktop notifications for scheduled reminders.
  - Get SMS/WhatsApp reminders for timely medicine intake.
- **Drug Information**:
  - Fetch detailed drug information, including side effects, usage instructions, and alternatives.
- **Persistent Storage**:
  - Reminders and user data are stored locally using `localStorage`.
- **Responsive Design**:
  - A clean and responsive UI with a collapsible sidebar for navigation.

---

## Technologies Used

- **Frontend**: React.js, TypeScript, Tailwind CSS
- **OCR**: Tesseract.js
- **Date Handling**: date-fns
- **Notifications**: Web Notifications API
- **SMS/WhatsApp**: Twilio API
- **Drug Information**: OpenFDA API
- **State Management**: React Hooks (`useState`, `useEffect`)
- **Storage**: `localStorage`

---

## Installation and Setup

### Prerequisites

1. **Node.js**: Ensure you have Node.js installed. You can download it from [here](https://nodejs.org/).
2. **Twilio Account**: Sign up for a Twilio account at [Twilio](https://www.twilio.com/) to enable SMS/WhatsApp notifications.
3. **OpenFDA API Key**: Optional, but recommended for fetching drug information.

### Steps to Run the Project Locally

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/medremind.git
   cd medremind
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   Create a `.env` file in the root directory and add the following variables:
   ```env
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   OPENFDA_API_KEY=your_openfda_api_key
   ```

4. **Run the Development Server**:
   ```bash
   npm start
   ```
   The app will be available at `http://localhost:3000`.

---

## Usage

### 1. Upload a Prescription
- Navigate to the "Upload Prescription" section.
- Drag and drop an image of your prescription or upload it manually.
- The app will extract medicine details using OCR. You can manually edit the extracted information if needed.

### 2. Schedule Reminders
- Fill in the dosage, frequency, duration, start date, and time.
- Save the prescription to schedule reminders.

### 3. View Reminders
- Use the "Calendar View" to see all scheduled reminders by date.
- Mark reminders as "Taken" once you’ve consumed the medicine.

### 4. Receive Notifications
- Desktop notifications will appear at the scheduled times.
- SMS/WhatsApp reminders will be sent to the phone number configured in the `.env` file.

### 5. Access Drug Information
- In the "Medicines" section, click on any medicine to view its details, including side effects, usage instructions, and alternatives.

---

## Folder Structure

```
medremind/
├── public/                # Static assets
├── src/
│   ├── components/        # Reusable components (e.g., Sidebar, Dashboard)
│   ├── utils/             # Utility functions (e.g., OCR, reminders, notifications)
│   ├── App.tsx            # Main application component
│   └── index.tsx          # Entry point
├── .env                   # Environment variables
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

---

## APIs Used

1. **Twilio API**:
   - For sending SMS/WhatsApp reminders.
   - Documentation: [Twilio Docs](https://www.twilio.com/docs)

2. **OpenFDA API**:
   - For fetching drug information.
   - Documentation: [OpenFDA Docs](https://open.fda.gov/)

3. **Tesseract.js**:
   - For OCR-based text extraction from images.
   - Documentation: [Tesseract.js Docs](https://tesseract.projectnaptha.com/)

---

## Contributing

We welcome contributions! If you’d like to contribute to this project, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add feature or fix"
   ```
4. Push your changes:
   ```bash
   git push origin feature-name
   ```
5. Submit a pull request.

---

## Contact

For questions, feedback, or collaboration opportunities, feel free to reach out:

- **Email**: ramizalam63@gmail.com

---

Thank you for using MedRemind! We hope this app helps you stay on top of your medication schedule and improves your overall health management experience. 🌟
