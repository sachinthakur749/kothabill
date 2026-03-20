import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      common: {
        welcome: "Welcome",
        logout: "Logout",
        save: "Save",
        cancel: "Cancel",
        loading: "Loading...",
        error: "Error",
        success: "Success",
        details: "Details",
        markPaid: "Mark Paid",
        due: "DUE",
        paid: "PAID",
        total: "TOTAL",
        totalAmount: "Total Amount",
        month: "Month",
        note: "Note",
        settings: "Settings",
        notifications: "Notifications",
        noNotifications: "No notifications yet.",
        year: "Year",
      },
      auth: {
        login: "Login",
        register: "Register",
        phone: "Phone Number",
        otp: "Verify OTP",
        owner: "Owner",
        tenant: "Tenant",
        selectRole: "Select your role",
      },
      owner: {
        dashboard: "Owner Dashboard",
        tenants: "Tenants",
        addBill: "Add Bill",
        history: "History",
        roomCode: "Room Code",
        shareCode: "Share this code with your tenants.",
        thisMonth: "This Month",
        recentActivity: "Recent Activity",
        addNewBill: "Add New Bill",
        selectTenant: "Select Tenant",
        noTenantsFound: "No tenants found.",
        billMonthBS: "Bill Month (Nepali BS)",
        optionalNote: "Optional Note",
        submitBill: "Submit Bill",
        selectNepaliMonth: "Select Nepali Month",
        confirmSelection: "Confirm Selection",
      },
      tenant: {
        dashboard: "My Dashboard",
        ownerInfo: "Owner Info",
        history: "Bill History",
        latestBill: "Latest Bill",
        noBills: "No bills found yet.",
      },
      bills: {
        rent: "Room Rent",
        electricity: "Electricity",
        water: "Water",
        dustbin: "Dustbin",
      },
      alerts: {
        selectTenant: "Please select a tenant",
        enterAmount: "Please enter at least one amount",
        billAdded: "Bill added successfully!",
        billFailed: "Failed to save bill. Please try again.",
      }
    }
  },
  np: {
    translation: {
      common: {
        welcome: "नमस्ते",
        logout: "लगआउट",
        save: "सुरक्षित गर्नुहोस्",
        cancel: "रद्द गर्नुहोस्",
        loading: "लोड हुँदैछ...",
        error: "त्रुटि",
        success: "सफल",
        details: "विवरण",
        markPaid: "तिरेको चिन्ह लगाउनुहोस्",
        due: "बाँकी",
        paid: "तिरेको",
        total: "जम्मा",
        totalAmount: "कुल रकम",
        month: "महिना",
        note: "नोट",
        settings: "सेटिङहरू",
        notifications: "सूचनाहरू",
        noNotifications: "अहिलेसम्म कुनै सूचना छैन।",
        year: "वर्ष",
      },
      auth: {
        login: "लगइन",
        register: "दर्ता",
        phone: "फोन नम्बर",
        otp: "OTP प्रमाणित गर्नुहोस्",
        owner: "घरबेटी",
        tenant: "भाडावाला",
        selectRole: "आफ्नो भूमिका छान्नुहोस्",
      },
      owner: {
        dashboard: "मालिक ड्यासबोर्ड",
        tenants: "भाडावालाहरू",
        addBill: "बिल थप्नुहोस्",
        history: "इतिहास",
        roomCode: "कोठा कोड",
        shareCode: "आफ्नो भाडावालासँग यो कोड साझा गर्नुहोस्।",
        thisMonth: "यस महिना",
        recentActivity: "हालको गतिविधि",
        addNewBill: "नयाँ बिल थप्नुहोस्",
        selectTenant: "भाडावाला छान्नुहोस्",
        noTenantsFound: "भाडावालाहरू भेटिएन।",
        billMonthBS: "बिल महिना (नेपाली)",
        optionalNote: "वैकल्पिक नोट",
        submitBill: "बिल बुझाउनुहोस्",
        selectNepaliMonth: "नेपाली महिना छान्नुहोस्",
        confirmSelection: "छनोट पुष्टि गर्नुहोस्",
      },
      tenant: {
        dashboard: "मेरो ड्यासबोर्ड",
        ownerInfo: "घरबेटी विवरण",
        history: "बिल इतिहास",
        latestBill: "हालको बिल",
        noBills: "अहिलेसम्म कुनै बिल भेटिएन।",
      },
      bills: {
        rent: "कोठा भाडा",
        electricity: "बिजुली बिल",
        water: "पानी बिल",
        dustbin: "फोहोर बिल",
      },
      alerts: {
        selectTenant: "कृपया भाडावाला छान्नुहोस्",
        enterAmount: "कृपया कम्तिमा एउटा रकम प्रविष्ट गर्नुहोस्",
        billAdded: "बिल सफलतापूर्वक थपियो!",
        billFailed: "बिल सुरक्षित गर्न असफल भयो। कृपया फेरि प्रयास गर्नुहोस्।",
        markAsPaid: "तिरेको चिन्ह लगाउनुहोस्",
        markAsPaidConfirm: "के तपाईं यस बिललाई तिरेको रूपमा चिन्ह लगाउन चाहनुहुन्छ?",
        billUpdated: "बिल तिरेको रूपमा अद्यावधिक गरियो।",
        updateFailed: "बिल अद्यावधिक गर्न असफल भयो।",
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
