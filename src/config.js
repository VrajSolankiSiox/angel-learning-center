/**
 * ALC V1 production config — from Laukik questionnaire 2026-08-06 + follow-ups.
 * Soft-launch location: Savannah. Rollout ready for other sites.
 */
export const ALC_CONFIG = {
  version: "v1",
  goLive: "2026-08-10",
  mode: "prod", // was pitch mockup; now production soft-launch

  waitlist: {
    registrationFee: 150,
  },

  product: {
    parentLogin: false,
    parentEmailCopy: false,
    linkModel: "one_public_link",
    language: "en", // Spanish UI retained but default EN; client said EN only
    eSign: "docusign", // yes — wire account when client provides
    multiChild: true,
    multiChildModel: "one_packet_multiple_children",
    showTuitionRates: false,
    inAppPayments: false,
    ssnTextFields: false,
    ssnDocumentUpload: true,
    hospitalRequired: false,
    pdfBasis: "demo_forms",
  },

  contact: {
    primary: {
      name: "Laukik Patel",
      role: "Owner",
      email: "lpatel@angellearningcenter.com",
      phone: "9126557260",
    },
    secondary: {
      name: "Hardik Patel",
      email: "hpatel@angellearningcenter.com",
    },
    uat: ["Laukik", "Hardik"],
  },

  email: {
    subject: "Enrollment Packet for Angel Learning Center",
    cc: ["lpatel@angellearningcenter.com"],
    ccPendingConfirm: "questionnaire had lpatel@angelearningcenter.com (typo?)",
    referenceFormat: "open",
  },

  v1Locations: ["savannah", "dawsonville", "smarr", "valdosta"],
  approvalDemo: false,

  locations: {
    savannah: {
      id: "savannah",
      name: "Savannah Highlands",
      legalName: "Angel Learning Center — Savannah",
      address: "178 Basswood Drive, Savannah, GA 31407",
      phone: "(912) 600-3899",
      hours: "Monday – Friday · 6:30 AM – 5:30 PM",
      inbox: "savannah@angellearningcenter.com",
      schoolDistrict: "Chatham County School System",
      hospital: "Chandler Hospital, 5353 Reynolds St.",
      enabled: true,
    },
    dawsonville: {
      id: "dawsonville",
      name: "Dawsonville",
      legalName: "Angel Learning Center — Dawsonville",
      address: "3276 Dawson Forest Rd E, Dawsonville, GA 30534",
      phone: "(706) 989-6855",
      hours: "Monday – Friday · 6:30 AM – 5:30 PM",
      inbox: "dawsonville@angellearningcenter.com",
      inboxAlternate: "dawnsonville@angellearningcenter.com",
      schoolDistrict: "Dawson County School System",
      hospital: "Chestatee Urgent Care, 2395 Thompson Rd.",
      enabled: true,
    },
    smarr: {
      id: "smarr",
      name: "Smarr / Forsyth",
      legalName: "Angel Learning Center — Smarr",
      address: "2329 US-41, Forsyth, GA 31029",
      phone: "(478) 999-9577",
      hours: "Monday – Friday · 6:30 AM – 5:30 PM",
      inbox: "smarr@angellearningcenter.com",
      schoolDistrict: "Monroe County School System",
      hospital: "88 Martin Luther King Jr Dr, Forsyth, GA 31029",
      enabled: true,
    },
    valdosta: {
      id: "valdosta",
      name: "Valdosta",
      legalName: "Angel Learning Center — Valdosta",
      address: "426 Murray Road, Valdosta, GA 31602",
      phone: "(229) 264-4606",
      hours: "Monday – Friday · 6:30 AM – 5:30 PM",
      inbox: "valdosta@angellearningcenter.com",
      schoolDistrict: "Valdosta City School System",
      hospital: "South Georgia Medical Center, 2501 N. Patterson St.",
      enabled: true,
    },
  },

  programs: [
    { id: "little_angels", label: "Little Angels (6 weeks – 12 months)", transport: false },
    { id: "tiny_explorers", label: "Tiny Explorers (1 year)", transport: false },
    { id: "busy_bee", label: "Busy Bee (2 years)", transport: false },
    { id: "little_learners", label: "Little Learners (3 years)", transport: false },
    { id: "part_time", label: "Part-time Stars (2-day / 3-day)", transport: false },
    { id: "before_care", label: "Before care", transport: true },
    { id: "after_care", label: "After care", transport: true },
    { id: "before_after", label: "Before & after care", transport: true },
    { id: "prek", label: "GA Pre-K", transport: false },
    { id: "summer_camp", label: "Summer Camp", transport: false },
    { id: "holiday_weeks", label: "Holiday Weeks", transport: false },
  ],

  transport: {
    allowUnlistedSchool: false,
    direction: "both_ways",
    when: ["am", "pm", "both"],
    policySource: "paper_forms",
    schools: {
      savannah: [
        { id: "godley", name: "Godley Station School", address: "2135 Benton Blvd, Savannah, GA 31407" },
        { id: "rice-creek", name: "Rice Creek School", address: "100 Mulberry Ave, Port Wentworth, GA 31407" },
      ],
      dawsonville: [
        { id: "robinson", name: "Robinson Elementary School", address: "1150 Dawson Forest Rd East, Dawsonville, GA 30534" },
        { id: "kilough", name: "Kilough Elementary School", address: "1063 Kilough Church Road, Dawsonville, GA 30534" },
        { id: "riverview", name: "Riverview Elementary School", address: "370 Dawson Forest Rd W, Dawsonville, GA 30534" },
        { id: "blacks-mill", name: "Black's Mill Elementary School", address: "1860 Dawson Forest Road East, Dawsonville, GA 30534" },
      ],
      smarr: [
        { id: "kb-sutton", name: "K. B. Sutton Elementary School", address: "1315 Highway 83 North, Forsyth, GA 31029" },
        { id: "tg-scott", name: "T.G. Scott Elementary School", address: "70 Thornton Rd, Forsyth, GA 31029" },
        { id: "hubbard", name: "Samuel E. Hubbard Elementary School", address: "558 Highway 83 South, Forsyth, GA 31029" },
      ],
      valdosta: [
        { id: "sallas-mahone", name: "Sallas Mahone Elementary School", address: "3686 Lake Laurie Drive, Valdosta, GA 31605" },
        { id: "wg-nunn", name: "W.G. Nunn Elementary School", address: "1610 Lakeland Avenue, Valdosta, GA 31602" },
        { id: "dewar", name: "Dewar Elementary School", address: "3539 Mt. Zion Church Road, Valdosta, GA 31605" },
        { id: "sl-mason", name: "S.L. Mason Elementary School", address: "821 W Gordon St, Valdosta, GA 31601" },
      ],
    },
  },

  forms: {
    core: ["enrollment", "financial", "transport", "emergency", "ies", "handbook", "photo", "watchMeGrow", "policyAck", "safeSleep", "strollerRide", "uploads"],
  },

  uploads: [
    {
      id: "parent_ssn_doc",
      label: "Parent / guardian SSN document (1 or 2 parents)",
      required: true,
      multiple: true,
      note: "SSN card or letter for each parent on the packet",
    },
    {
      id: "child_ssn_doc",
      label: "Child SSN document",
      required: true,
      note: "Required for each child on the packet",
    },
    { id: "birth_cert", label: "Birth certificate of the child", required: true },
    {
      id: "ga_shot_records",
      label: "Immunization / shot records (GA Form 3231)",
      required: true,
    },
    {
      id: "ga_residency",
      label: "Proof of GA residency (any one parent)",
      required: true,
      note: "Utility bill, lease, or other GA residency proof",
    },
    {
      id: "ga_parent_ids",
      label: "Parent / guardian photo ID(s)",
      required: true,
      multiple: true,
      note: "Required — government photo ID for parent(s)",
    },
    {
      id: "completed_ies",
      label: "Completed Meal Benefit (IES) form",
      required: false,
      note: "Optional — download from the Meal Benefit step, complete on the official form, then upload here if applicable",
    },
    {
      id: "credit_card_front",
      label: "Credit card — front photo",
      required: false,
      note: "Optional — for automated tuition billing; upload a clear photo of the front of your card",
    },
    {
      id: "credit_card_back",
      label: "Credit card — back photo",
      required: false,
      note: "Optional — upload a clear photo of the back of your card (signature panel visible)",
    },
    { id: "health_form", label: "Child Health Form (physician)", required: false },
    { id: "custody", label: "Custody documentation (if applicable)", required: false },
    { id: "caps", label: "CAPS documentation (if applicable)", required: false },
  ],

  handbook: {
    title: "Parent Handbook Acknowledgment",
    version: "2026",
    year: 2026,
    pages: 56,
    url: "assets/Parent-Handbook-2026.pdf",
    contact: "info@angellearningcenter.com",
    acknowledgment:
      "I acknowledge that I have received and read the Angel Learning Center Parent Handbook. I understand the policies, procedures, and expectations contained within and agree to abide by them while my child is enrolled at Angel Learning Center. I understand that policies may be updated as needed, and I will be notified of any changes.",
    source: "Parent-Handbook-2026.pdf",
  },

  medical: {
    hospitalRequired: false,
    note: "Handbook lists default facility per location for transport/emergency",
  },

  enrollmentRequiredFromHandbook: [
    "Completed Enrollment Application",
    "Signed Parent Handbook Acknowledgment",
    "Signed Tuition Agreement",
    "Child Health Form completed by a licensed physician",
    "Current Georgia Immunization Record (Form 3231)",
    "Emergency Contact Information",
    "Authorized Pick-Up List",
    "Custody Documentation (if applicable)",
    "Infant Feeding Schedule (for infants)",
    "Special Diet or Allergy Documentation (physician statement if allergy)",
    "Transportation Forms (if applicable)",
    "Photo/Video Permission Form",
    "CAPS Documentation (if applicable)",
  ],

  meals: {
    cacfp: "all_locations",
    options: ["Breakfast", "Lunch", "Snack"],
  },

  open: {
    waiting: [
      "Owner CC exact address (typed angelearningcenter typo?)",
    ],
    resolved: {
      docusign: "yes",
      smarrValdostaHours: "written as Mon–Fri 6:30–5:30 matching others",
      path: "v1_prod_not_pitch_mockup",
      multiChild: "one_packet_multiple_children",
      softLaunch: "savannah_first_aug_10",
      dawsonvilleInbox: "using dawsonville@ (corrected spelling from dawnsonville@)",
      schoolTimes: "parent enters pickup times until center defaults provided",
      handbook: "acknowledgment form until official PDF provided",
      ssnPolicy: "no typed SSN fields; required document uploads for parent(s) and child",
      iesSections:
        "A read-only letter/T&Cs; B required all ages; C Medicaid/SCHIP optional; D infant affidavit required for Little Angels",
    },
  },
};

export default ALC_CONFIG;
