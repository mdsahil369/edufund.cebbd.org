import type {
  CampaignStatus,
  Student,
  StudentPrivateInfo,
  StudentStory,
  StudentSupportPlans,
  StudentVisibility,
} from "@/types";

interface StudentSeed {
  id: string;
  slug: string;
  fullName: string;
  gender: "male" | "female" | "other";
  district: string;
  division: string;
  categoryId: string;
  institution: string;
  headline: string;
  shortBio: string;
  story: StudentStory;
  previousExam: string;
  passingYear: number;
  result: string;
  futureGoal: string;
  requiredAmount: number;
  raisedSeed: number;
  campaignStatus?: CampaignStatus;
  visibility?: StudentVisibility;
  featured?: boolean;
  createdAt: string;
  privateInfo: StudentPrivateInfo;
}

const oneTimeOptions = [1000, 2500, 5000, 10000];

function buildSupportPlans(requiredAmount: number, raisedSeed: number): StudentSupportPlans {
  const monthly = Math.max(1000, Math.round((requiredAmount * 0.02) / 500) * 500);
  const remaining = Math.max(5000, requiredAmount - raisedSeed);
  return {
    oneTimeOptions,
    monthly,
    yearly: monthly * 10,
    fullScholarship: Math.round(remaining / 1000) * 1000,
  };
}

const seeds: StudentSeed[] = [
  {
    id: "stu-01",
    slug: "ayesha-siddiqua",
    fullName: "Ayesha Siddiqua",
    gender: "female",
    district: "Dhaka",
    division: "Dhaka",
    categoryId: "cat-diploma",
    institution: "Dhaka Polytechnic Institute",
    headline:
      "Aspiring software engineer who tutors neighbourhood children to help her family",
    shortBio:
      "Ayesha is a first-year Computer Technology student from Mirpur. She is determined to become a software engineer and already teaches younger students in her community.",
    story: {
      family:
        "Ayesha lives in Mirpur with her parents and two younger siblings. Her father drives a rented CNG auto-rickshaw and her mother manages the household on a modest, irregular income.",
      challenges:
        "Admission, laboratory, and semester fees are beyond what the family can afford. Ayesha sometimes misses classes to tutor neighbourhood children for extra income.",
      ambitions:
        "She wants to become a full-stack developer and has already completed two free online programming courses using a borrowed laptop and mobile data.",
      financialNeeds:
        "Support is needed for semester fees, examination costs, and a small monthly allowance for transport and study materials.",
      dreams:
        "Ayesha dreams of building technology that helps small businesses across Bangladesh — and of one day funding a scholarship herself.",
    },
    previousExam: "SSC 2025",
    passingYear: 2025,
    result: "GPA 4.83",
    futureGoal: "BSc in Computer Science and Engineering",
    requiredAmount: 85000,
    raisedSeed: 52000,
    featured: true,
    createdAt: "2026-10-20",
    privateInfo: {
      dateOfBirth: "2008-04-12",
      mobile: "01700-000101",
      fatherName: "Md. Shahjahan Mia",
      motherName: "Rokeya Begum",
      address: "House 14, Road 3, Mirpur 11, Dhaka",
      guardianOccupation: "CNG auto-rickshaw driver",
      familyIncome: 18000,
      adminNotes: "Documents verified on 12 September 2026. Home visit scheduled.",
    },
  },
  {
    id: "stu-02",
    slug: "md-rakib-hasan",
    fullName: "Md. Rakib Hasan",
    gender: "male",
    district: "Chattogram",
    division: "Chattogram",
    categoryId: "cat-diploma",
    institution: "Chattogram Polytechnic Institute",
    headline:
      "Electrical technology student rebuilding his family's home after a cyclone",
    shortBio:
      "Rakib lost part of his family home in a cyclone last year. He is continuing his electrical technology diploma while helping his father repair the house.",
    story: {
      family:
        "Rakib's family lives in Sitakunda, where his father works as a day labourer and his mother sells homemade snacks at the local bazaar.",
      challenges:
        "The family spent their savings repairing cyclone damage. Rakib's semester fees are overdue and he walks forty minutes to campus to save bus fare.",
      ambitions:
        "He wants to specialise in renewable energy and help bring reliable solar power to coastal communities.",
      financialNeeds:
        "He needs help clearing outstanding semester fees and covering laboratory costs for the next two terms.",
      dreams:
        "Rakib hopes to open a small electrical workshop that trains young people in his area.",
    },
    previousExam: "SSC 2025",
    passingYear: 2025,
    result: "GPA 4.61",
    futureGoal: "BSc in Electrical and Electronic Engineering",
    requiredAmount: 78000,
    raisedSeed: 31000,
    featured: true,
    createdAt: "2026-10-18",
    privateInfo: {
      dateOfBirth: "2007-11-03",
      mobile: "01700-000102",
      fatherName: "Abul Kalam",
      motherName: "Nasima Akter",
      address: "Village Barabkunda, Sitakunda, Chattogram",
      guardianOccupation: "Day labourer",
      familyIncome: 14000,
      adminNotes: "Cyclone relief case. Verified by local CEBBD volunteer.",
    },
  },
  {
    id: "stu-03",
    slug: "fatema-akter",
    fullName: "Fatema Akter",
    gender: "female",
    district: "Khulna",
    division: "Khulna",
    categoryId: "cat-diploma",
    institution: "Khulna Polytechnic Institute",
    headline:
      "Civil technology student who wants to design safer school buildings",
    shortBio:
      "Fatema is the first person in her family to attend a polytechnic institute. She is passionate about safe, climate-resilient construction.",
    story: {
      family:
        "Fatema lives with her grandmother and younger brother in Khalishpur. Her mother works in a shrimp-processing factory and sends what she can each month.",
      challenges:
        "The family's income is seasonal. Fatema often chooses between buying drawing supplies and paying for transport to her practical classes.",
      ambitions:
        "She is working toward a career in civil engineering with a focus on disaster-resilient school buildings in coastal Khulna.",
      financialNeeds:
        "She needs support with tuition, survey equipment fees, and exam registration for the current academic year.",
      dreams:
        "Fatema wants to return to her community as a licensed engineer and mentor girls interested in construction.",
    },
    previousExam: "SSC 2024",
    passingYear: 2024,
    result: "GPA 4.72",
    futureGoal: "BSc in Civil Engineering",
    requiredAmount: 92000,
    raisedSeed: 74000,
    createdAt: "2026-10-16",
    privateInfo: {
      dateOfBirth: "2007-02-19",
      mobile: "01700-000103",
      fatherName: "Late Abdul Hamid",
      motherName: "Salma Begum",
      address: "Khalishpur, Khulna",
      guardianOccupation: "Shrimp processing worker",
      familyIncome: 12000,
    },
  },
  {
    id: "stu-04",
    slug: "sajib-kumar-das",
    fullName: "Sajib Kumar Das",
    gender: "male",
    district: "Rajshahi",
    division: "Rajshahi",
    categoryId: "cat-diploma",
    institution: "Rajshahi Polytechnic Institute",
    headline:
      "Mechanical technology student supporting his mother after his father's illness",
    shortBio:
      "Sajib's father has been unable to work since a stroke. Sajib is balancing his mechanical diploma with part-time work at a bicycle repair shop.",
    story: {
      family:
        "Sajib lives with his parents and sister in Boalia. His mother takes in sewing work while the family waits for his father's recovery.",
      challenges:
        "Medical bills have consumed the family's savings. Sajib's admission fee for the new semester remains unpaid.",
      ambitions:
        "He wants to become a mechanical technician and eventually start a repair and maintenance business.",
      financialNeeds:
        "The immediate need is the current semester fee, followed by workshop tools and exam fees.",
      dreams:
        "Sajib hopes to employ young people from his neighbourhood and support his sister's education.",
    },
    previousExam: "SSC 2025",
    passingYear: 2025,
    result: "GPA 4.38",
    futureGoal: "Diploma in Mechanical Engineering and a maintenance business",
    requiredAmount: 80000,
    raisedSeed: 20500,
    campaignStatus: "paused",
    createdAt: "2026-10-14",
    privateInfo: {
      dateOfBirth: "2007-07-21",
      mobile: "01700-000104",
      fatherName: "Nikhil Chandra Das",
      motherName: "Anita Rani Das",
      address: "Boalia, Rajshahi",
      guardianOccupation: "Former tailor",
      familyIncome: 10000,
      adminNotes: "Campaign paused while family medical situation is reviewed.",
    },
  },
  {
    id: "stu-05",
    slug: "nusrat-jahan",
    fullName: "Nusrat Jahan",
    gender: "female",
    district: "Barishal",
    division: "Barishal",
    categoryId: "cat-diploma",
    institution: "Barishal Nursing Institute",
    headline:
      "Nursing student from a river island who wants to serve her own community",
    shortBio:
      "Nusrat grew up on a remote river island where the nearest clinic is hours away. She is training to become a nurse and return home.",
    story: {
      family:
        "Nusrat's family lives on Char Kukri-Mukri. Her father is a fisherman and her mother weaves mats during the monsoon season.",
      challenges:
        "Hostel and clinical training costs are high, and the family's income disappears when the river is rough.",
      ambitions:
        "She wants to qualify as a registered nurse and work in a rural health centre near her island.",
      financialNeeds:
        "She needs hostel fees, clinical uniform costs, and exam registration support for the nursing diploma.",
      dreams:
        "Nusrat dreams of running a small mobile health camp for women on the chars.",
    },
    previousExam: "SSC 2024",
    passingYear: 2024,
    result: "GPA 4.67",
    futureGoal: "Registered Nurse and rural health advocate",
    requiredAmount: 96000,
    raisedSeed: 41000,
    featured: true,
    createdAt: "2026-10-12",
    privateInfo: {
      dateOfBirth: "2006-12-08",
      mobile: "01700-000105",
      fatherName: "Md. Jalil Mia",
      motherName: "Hasina Begum",
      address: "Char Kukri-Mukri, Bhola, Barishal",
      guardianOccupation: "Fisherman",
      familyIncome: 13000,
    },
  },
  {
    id: "stu-06",
    slug: "tanvir-ahmed",
    fullName: "Tanvir Ahmed",
    gender: "male",
    district: "Sylhet",
    division: "Sylhet",
    categoryId: "cat-diploma",
    institution: "Sylhet Polytechnic Institute",
    headline:
      "Computer science student and coding club mentor — campaign fully funded",
    shortBio:
      "Tanvir teaches basic coding to first-year students and has completed his funded diploma campaign with support from 42 community donors.",
    story: {
      family:
        "Tanvir is the eldest of three siblings. His father runs a small mobile phone repair stall in Sylhet city.",
      challenges:
        "The family's income was stretched thin by his admission fee and the cost of a used laptop for coursework.",
      ambitions:
        "He wants to work as a junior developer while completing his diploma, then pursue a degree in software engineering.",
      financialNeeds:
        "The campaign covered admission fees, a refurbished laptop, and semester costs. It is now fully funded.",
      dreams:
        "Tanvir plans to keep mentoring students in the coding club and build a free learning platform in Bangla.",
    },
    previousExam: "SSC 2024",
    passingYear: 2024,
    result: "GPA 4.90",
    futureGoal: "Software engineering degree and a Bangla learning platform",
    requiredAmount: 76000,
    raisedSeed: 76000,
    campaignStatus: "fully-funded",
    createdAt: "2026-10-10",
    privateInfo: {
      dateOfBirth: "2007-01-30",
      mobile: "01700-000106",
      fatherName: "Md. Faruk Ahmed",
      motherName: "Shirin Akter",
      address: "Zindabazar, Sylhet",
      guardianOccupation: "Mobile phone repairer",
      familyIncome: 16000,
      adminNotes: "Campaign closed as fully funded on 3 October 2026.",
    },
  },
  {
    id: "stu-07",
    slug: "mim-akter",
    fullName: "Mim Akter",
    gender: "female",
    district: "Rangpur",
    division: "Rangpur",
    categoryId: "cat-diploma",
    institution: "Rangpur Agricultural Institute",
    headline:
      "Agriculture student with a plan for climate-smart farming at home",
    shortBio:
      "Mim grew up helping her family grow rice and vegetables. She is studying agriculture to bring modern, climate-smart methods back to her village.",
    story: {
      family:
        "Mim's family farms a small plot in Gangachara. Her father also works as a seasonal labourer during the lean months.",
      challenges:
        "Flooding has reduced the family's harvest for two years in a row, leaving little margin for education costs.",
      ambitions:
        "She wants to become an agricultural officer and help smallholder farmers improve their yields sustainably.",
      financialNeeds:
        "Support is needed for tuition, field practicals, and safe hostel accommodation near the institute.",
      dreams:
        "Mim hopes to establish a demonstration farm that teaches local women climate-smart techniques.",
    },
    previousExam: "SSC 2025",
    passingYear: 2025,
    result: "GPA 4.55",
    futureGoal: "Agricultural officer and climate-smart farming trainer",
    requiredAmount: 64000,
    raisedSeed: 22000,
    createdAt: "2026-10-08",
    privateInfo: {
      dateOfBirth: "2008-06-14",
      mobile: "01700-000107",
      fatherName: "Md. Mokbul Hossain",
      motherName: "Amena Khatun",
      address: "Gangachara, Rangpur",
      guardianOccupation: "Farmer",
      familyIncome: 11000,
    },
  },
  {
    id: "stu-08",
    slug: "arif-hossain",
    fullName: "Arif Hossain",
    gender: "male",
    district: "Mymensingh",
    division: "Mymensingh",
    categoryId: "cat-diploma",
    institution: "Mymensingh Polytechnic Institute",
    headline:
      "Civil technology student who volunteers with a local flood response team",
    shortBio:
      "Arif spends his weekends volunteering with a flood response team. He wants to design embankments and drainage systems that protect rural communities.",
    story: {
      family:
        "Arif lives with his mother and two sisters. His father passed away three years ago, and the family depends on his mother's tailoring income.",
      challenges:
        "He is the first in his family to attend tertiary education, and the cost of survey camps and materials is a constant worry.",
      ambitions:
        "Arif wants to specialise in water resource engineering and work on flood resilience projects.",
      financialNeeds:
        "The campaign will cover his remaining semester fees, survey equipment, and examination costs.",
      dreams:
        "He dreams of building safer villages along the Brahmaputra and inspiring other students from his area.",
    },
    previousExam: "SSC 2024",
    passingYear: 2024,
    result: "GPA 4.44",
    futureGoal: "Water resource engineering and flood resilience work",
    requiredAmount: 82000,
    raisedSeed: 49000,
    createdAt: "2026-10-06",
    privateInfo: {
      dateOfBirth: "2006-09-25",
      mobile: "01700-000108",
      fatherName: "Late Anwar Hossain",
      motherName: "Rahima Begum",
      address: "Trishal, Mymensingh",
      guardianOccupation: "Tailor",
      familyIncome: 9000,
    },
  },
  {
    id: "stu-09",
    slug: "sumaiya-islam",
    fullName: "Sumaiya Islam",
    gender: "female",
    district: "Cumilla",
    division: "Chattogram",
    categoryId: "cat-diploma",
    institution: "Cumilla Polytechnic Institute",
    headline:
      "Electronics student building low-cost devices for her community",
    shortBio:
      "Sumaiya repairs small electronics for neighbours and is studying electronics technology at Cumilla Polytechnic Institute.",
    story: {
      family:
        "Sumaiya's family lives in Adarsha Sadar. Her father is a school caretaker and her mother is a homemaker.",
      challenges:
        "The family has no savings, and Sumaiya's laboratory fees are due at the start of each semester.",
      ambitions:
        "She wants to become an electronics engineer and develop affordable devices for rural households.",
      financialNeeds:
        "She needs help with semester fees, a basic electronics toolkit, and transport costs.",
      dreams:
        "Sumaiya hopes to run a small electronics training centre for women in Cumilla.",
    },
    previousExam: "SSC 2025",
    passingYear: 2025,
    result: "GPA 4.75",
    futureGoal: "Electronics engineering and affordable rural technology",
    requiredAmount: 72000,
    raisedSeed: 18000,
    createdAt: "2026-10-04",
    privateInfo: {
      dateOfBirth: "2008-03-02",
      mobile: "01700-000109",
      fatherName: "Md. Nurul Islam",
      motherName: "Shahida Parvin",
      address: "Adarsha Sadar, Cumilla",
      guardianOccupation: "School caretaker",
      familyIncome: 12000,
    },
  },
  {
    id: "stu-10",
    slug: "hasan-mahmud",
    fullName: "Hasan Mahmud",
    gender: "male",
    district: "Bogura",
    division: "Rajshahi",
    categoryId: "cat-diploma",
    institution: "Bogura Polytechnic Institute",
    headline:
      "Mechanical student restoring agricultural machinery for local farmers",
    shortBio:
      "Hasan grew up around farm equipment and now repairs pumps and tillers for farmers in his spare time. He is studying mechanical technology.",
    story: {
      family:
        "Hasan's family owns a small repair workshop in Sherpur. His father and uncle run the business together.",
      challenges:
        "A recent fire damaged part of the workshop, and the family is still recovering financially.",
      ambitions:
        "He wants to formalise his mechanical skills and build a modern agricultural machinery service centre.",
      financialNeeds:
        "Support will cover his remaining tuition and the tools required for advanced workshop practicals.",
      dreams:
        "Hasan wants to make affordable repair services available to small farmers across Bogura.",
    },
    previousExam: "SSC 2024",
    passingYear: 2024,
    result: "GPA 4.32",
    futureGoal: "Agricultural machinery service centre",
    requiredAmount: 88000,
    raisedSeed: 66000,
    createdAt: "2026-10-02",
    privateInfo: {
      dateOfBirth: "2006-08-17",
      mobile: "01700-000110",
      fatherName: "Md. Sirajul Islam",
      motherName: "Momena Begum",
      address: "Sherpur, Bogura",
      guardianOccupation: "Workshop owner",
      familyIncome: 20000,
    },
  },
  {
    id: "stu-11",
    slug: "rima-khatun",
    fullName: "Rima Khatun",
    gender: "female",
    district: "Jashore",
    division: "Khulna",
    categoryId: "cat-diploma",
    institution: "Jashore Polytechnic Institute",
    headline:
      "Computer technology student and the first woman in her family to study IT",
    shortBio:
      "Rima is the first woman in her family to pursue a technical education. She wants to become a web developer and teach other girls to code.",
    story: {
      family:
        "Rima lives in Jhikargacha with her parents and three brothers. Her father is a vegetable trader.",
      challenges:
        "The family prioritises her brothers' education, and Rima has had to negotiate hard to continue her studies.",
      ambitions:
        "She is learning front-end development through free resources and hopes to freelance while completing her diploma.",
      financialNeeds:
        "She needs semester fees, internet access for coursework, and a basic laptop.",
      dreams:
        "Rima wants to open a small coding school for girls in her union.",
    },
    previousExam: "SSC 2025",
    passingYear: 2025,
    result: "GPA 4.69",
    futureGoal: "Web development and a coding school for girls",
    requiredAmount: 74000,
    raisedSeed: 33000,
    createdAt: "2026-09-30",
    privateInfo: {
      dateOfBirth: "2008-01-11",
      mobile: "01700-000111",
      fatherName: "Md. Azhar Ali",
      motherName: "Rahima Khatun",
      address: "Jhikargacha, Jashore",
      guardianOccupation: "Vegetable trader",
      familyIncome: 15000,
    },
  },
  {
    id: "stu-12",
    slug: "shahin-alam",
    fullName: "Shahin Alam",
    gender: "male",
    district: "Dinajpur",
    division: "Rangpur",
    categoryId: "cat-diploma",
    institution: "Dinajpur Polytechnic Institute",
    headline:
      "Electrical student from a remote village with a long commute to campus",
    shortBio:
      "Shahin travels two hours each way to attend classes. He is determined to become an electrical technician and support his family.",
    story: {
      family:
        "Shahin's parents are sharecroppers in Birganj. The family income depends entirely on the rice harvest.",
      challenges:
        "Travel and accommodation costs make his diploma difficult to sustain, and he often studies by solar lamp at home.",
      ambitions:
        "He wants to work in rural electrification and solar installation after finishing his diploma.",
      financialNeeds:
        "The campaign will cover his hostel fees, transport, and examination registration.",
      dreams:
        "Shahin hopes to bring reliable solar power to every household in his village.",
    },
    previousExam: "SSC 2025",
    passingYear: 2025,
    result: "GPA 4.41",
    futureGoal: "Rural electrification and solar installation",
    requiredAmount: 70000,
    raisedSeed: 12000,
    createdAt: "2026-09-28",
    privateInfo: {
      dateOfBirth: "2007-05-09",
      mobile: "01700-000112",
      fatherName: "Md. Kuddus Ali",
      motherName: "Sufia Begum",
      address: "Birganj, Dinajpur",
      guardianOccupation: "Sharecropper",
      familyIncome: 8000,
    },
  },
  {
    id: "stu-13",
    slug: "tania-sultana",
    fullName: "Tania Sultana",
    gender: "female",
    district: "Faridpur",
    division: "Dhaka",
    categoryId: "cat-diploma",
    institution: "Faridpur Medical Institute",
    headline:
      "Nursing student caring for her mother while training to care for others",
    shortBio:
      "Tania is training as a nurse while caring for her mother, who lives with a chronic illness. She wants to specialise in community health.",
    story: {
      family:
        "Tania lives with her mother and younger sister in Faridpur town. Her father left the family several years ago.",
      challenges:
        "Her mother's treatment costs consume most of the household income, and Tania's clinical training fees are unpaid.",
      ambitions:
        "She wants to become a community health nurse and run regular health camps in rural Faridpur.",
      financialNeeds:
        "Support is needed for clinical training fees, uniforms, and her mother's ongoing treatment.",
      dreams:
        "Tania hopes to build a small clinic where no mother has to travel far for basic care.",
    },
    previousExam: "SSC 2024",
    passingYear: 2024,
    result: "GPA 4.58",
    futureGoal: "Community health nursing and a rural clinic",
    requiredAmount: 94000,
    raisedSeed: 58000,
    featured: true,
    createdAt: "2026-09-26",
    privateInfo: {
      dateOfBirth: "2006-10-30",
      mobile: "01700-000113",
      fatherName: "Md. Sattar Sheikh",
      motherName: "Rokeya Sultana",
      address: "Kanaipur, Faridpur",
      guardianOccupation: "Homemaker",
      familyIncome: 7000,
      adminNotes: "Sensitive family situation. Handle communications with care.",
    },
  },
  {
    id: "stu-14",
    slug: "imran-kabir",
    fullName: "Imran Kabir",
    gender: "male",
    district: "Noakhali",
    division: "Chattogram",
    categoryId: "cat-diploma",
    institution: "Noakhali Polytechnic Institute",
    headline:
      "Marine technology student from a fishing family with big ambitions",
    shortBio:
      "Imran comes from a fishing family in Hatiya. He is studying marine technology and hopes to work on modern, safer fishing vessels.",
    story: {
      family:
        "Imran's father and older brothers are fishermen. The family's income depends on the sea and is highly seasonal.",
      challenges:
        "Cyclones and fishing bans make income unpredictable. Imran's hostel and practical fees are often delayed.",
      ambitions:
        "He wants to become a marine engineer and improve safety standards on small fishing boats.",
      financialNeeds:
        "The campaign covers his hostel fees, safety training, and semester costs.",
      dreams:
        "Imran dreams of designing a low-cost life-saving system for coastal fishing crews.",
    },
    previousExam: "SSC 2024",
    passingYear: 2024,
    result: "GPA 4.36",
    futureGoal: "Marine engineering and fishing crew safety",
    requiredAmount: 86000,
    raisedSeed: 27000,
    createdAt: "2026-09-24",
    privateInfo: {
      dateOfBirth: "2006-07-04",
      mobile: "01700-000114",
      fatherName: "Md. Ismail Hossain",
      motherName: "Jamila Khatun",
      address: "Hatiya, Noakhali",
      guardianOccupation: "Fisherman",
      familyIncome: 12000,
    },
  },
  {
    id: "stu-15",
    slug: "sadia-rahman",
    fullName: "Sadia Rahman",
    gender: "female",
    district: "Tangail",
    division: "Dhaka",
    categoryId: "cat-diploma",
    institution: "Tangail Textile Institute",
    headline:
      "Textile technology student with a passion for sustainable fabrics",
    shortBio:
      "Sadia is studying textile technology and wants to help Bangladesh's garment industry adopt cleaner, more sustainable production methods.",
    story: {
      family:
        "Sadia's father is a power-loom operator and her mother stitches clothes for a local tailor.",
      challenges:
        "The family's income is modest and inconsistent, and Sadia's practical materials are expensive.",
      ambitions:
        "She wants to work in textile quality control and research sustainable dyeing techniques.",
      financialNeeds:
        "Support is needed for semester fees, practical materials, and transport to mill visits.",
      dreams:
        "Sadia hopes to launch a small sustainable fabric brand that supports local weavers.",
    },
    previousExam: "SSC 2025",
    passingYear: 2025,
    result: "GPA 4.52",
    futureGoal: "Sustainable textile production",
    requiredAmount: 75000,
    raisedSeed: 44000,
    createdAt: "2026-09-22",
    privateInfo: {
      dateOfBirth: "2008-02-26",
      mobile: "01700-000115",
      fatherName: "Md. Abdur Rahman",
      motherName: "Sultana Razia",
      address: "Kalihati, Tangail",
      guardianOccupation: "Power-loom operator",
      familyIncome: 14000,
    },
  },
  {
    id: "stu-16",
    slug: "mehedi-hasan",
    fullName: "Mehedi Hasan",
    gender: "male",
    district: "Kushtia",
    division: "Khulna",
    categoryId: "cat-diploma",
    institution: "Kushtia Polytechnic Institute",
    headline:
      "Computer technology student learning to build accessible software",
    shortBio:
      "Mehedi is a computer technology student who volunteers at a local community centre teaching basic computer skills to children.",
    story: {
      family:
        "Mehedi's family lives in Kumarkhali. His father runs a small grocery shop and his mother tutors primary school children.",
      challenges:
        "The family shop was damaged in flooding this year, leaving little room for education expenses.",
      ambitions:
        "He wants to become a software developer focused on accessible tools for people with disabilities.",
      financialNeeds:
        "He needs semester fees and access to a reliable laptop for coursework.",
      dreams:
        "Mehedi hopes to build an accessible learning app in Bangla and train other students to use it.",
    },
    previousExam: "SSC 2025",
    passingYear: 2025,
    result: "GPA 4.47",
    futureGoal: "Accessible software development",
    requiredAmount: 72000,
    raisedSeed: 9000,
    createdAt: "2026-09-20",
    privateInfo: {
      dateOfBirth: "2008-05-16",
      mobile: "01700-000116",
      fatherName: "Md. Nazrul Islam",
      motherName: "Parvin Akter",
      address: "Kumarkhali, Kushtia",
      guardianOccupation: "Grocery shop owner",
      familyIncome: 13000,
    },
  },
  {
    id: "stu-17",
    slug: "farhana-yeasmin",
    fullName: "Farhana Yeasmin",
    gender: "female",
    district: "Satkhira",
    division: "Khulna",
    categoryId: "cat-diploma",
    institution: "Satkhira Polytechnic Institute",
    headline:
      "Electrical student and community solar volunteer — campaign fully funded",
    shortBio:
      "Farhana volunteers with a solar lighting project in her village and has completed her funded diploma campaign.",
    story: {
      family:
        "Farhana lives in Shyamnagar with her parents and grandmother. Her father is a mason and her mother grows vegetables for the local market.",
      challenges:
        "Saltwater intrusion has made farming difficult, and the family's income is increasingly uncertain.",
      ambitions:
        "She wants to become a solar technician and help her community adapt to a changing climate.",
      financialNeeds:
        "Her campaign covered tuition, tools, and hostel fees. It is now fully funded.",
      dreams:
        "Farhana plans to install solar systems in every household on her island.",
    },
    previousExam: "SSC 2024",
    passingYear: 2024,
    result: "GPA 4.63",
    futureGoal: "Solar technician and climate adaptation advocate",
    requiredAmount: 68000,
    raisedSeed: 68000,
    campaignStatus: "fully-funded",
    createdAt: "2026-09-18",
    privateInfo: {
      dateOfBirth: "2006-11-22",
      mobile: "01700-000117",
      fatherName: "Md. Yasin Ali",
      motherName: "Ferdousi Begum",
      address: "Shyamnagar, Satkhira",
      guardianOccupation: "Mason",
      familyIncome: 11000,
      adminNotes: "Fully funded on 21 September 2026. Thank-you letter received.",
    },
  },
  {
    id: "stu-18",
    slug: "rafiul-islam",
    fullName: "Rafiul Islam",
    gender: "male",
    district: "Pabna",
    division: "Rajshahi",
    categoryId: "cat-university",
    institution: "Rajshahi University of Engineering & Technology",
    headline:
      "RUET aspirant preparing for a computer science degree on a shared phone",
    shortBio:
      "Rafiul scored GPA 5.00 in his HSC exams and is preparing for university admission while supporting his family's small tea stall.",
    story: {
      family:
        "Rafiul's family runs a tea stall near Pabna town. His parents work long hours and have no savings for university fees.",
      challenges:
        "He shares a single smartphone with his siblings and often studies at the public library to access the internet.",
      ambitions:
        "He hopes to study computer science at RUET and build a career in artificial intelligence research.",
      financialNeeds:
        "Support covers admission coaching, application fees, and the first-year costs once he is admitted.",
      dreams:
        "Rafiul wants to make AI education accessible to students in small towns like his own.",
    },
    previousExam: "HSC 2026",
    passingYear: 2026,
    result: "GPA 5.00",
    futureGoal: "BSc in Computer Science and Engineering at RUET",
    requiredAmount: 120000,
    raisedSeed: 46000,
    featured: true,
    createdAt: "2026-09-16",
    privateInfo: {
      dateOfBirth: "2008-08-08",
      mobile: "01700-000118",
      fatherName: "Md. Rafiqul Islam",
      motherName: "Salma Khatun",
      address: "Sadar, Pabna",
      guardianOccupation: "Tea stall owner",
      familyIncome: 15000,
    },
  },
  {
    id: "stu-19",
    slug: "tasnim-chowdhury",
    fullName: "Tasnim Chowdhury",
    gender: "female",
    district: "Sylhet",
    division: "Sylhet",
    categoryId: "cat-university",
    institution: "Shahjalal University of Science & Technology",
    headline:
      "Physics aspirant who wants to teach science in her hometown",
    shortBio:
      "Tasnim is preparing for university admission with a dream of becoming a physics teacher and opening a free science club for girls.",
    story: {
      family:
        "Tasnim's father is a retired school clerk and her mother is a homemaker. The family lives on a small pension.",
      challenges:
        "Admission preparation and university fees are far beyond the family's monthly budget.",
      ambitions:
        "She wants to study physics at SUST and become a secondary school science teacher.",
      financialNeeds:
        "Support will cover admission preparation, application fees, and first-year university costs.",
      dreams:
        "Tasnim hopes to build a free science lab for girls in her neighbourhood.",
    },
    previousExam: "HSC 2026",
    passingYear: 2026,
    result: "GPA 4.92",
    futureGoal: "BSc in Physics and science education",
    requiredAmount: 110000,
    raisedSeed: 15000,
    createdAt: "2026-09-14",
    privateInfo: {
      dateOfBirth: "2008-09-19",
      mobile: "01700-000119",
      fatherName: "Md. Nurul Chowdhury",
      motherName: "Ruma Chowdhury",
      address: "Ambarkhana, Sylhet",
      guardianOccupation: "Retired school clerk",
      familyIncome: 12000,
    },
  },
  {
    id: "stu-20",
    slug: "jannatul-ferdous",
    fullName: "Jannatul Ferdous",
    gender: "female",
    district: "Cox's Bazar",
    division: "Chattogram",
    categoryId: "cat-higher",
    institution: "University of Chittagong",
    headline:
      "Third-year education student rebuilding after losing her family's home",
    shortBio:
      "Jannatul is in her third year of a BSc in Education. Her family lost their home in a fire and she is at risk of dropping out.",
    story: {
      family:
        "Jannatul's family lives in Cox's Bazar town. Her mother works at a local school and her father is a part-time security guard.",
      challenges:
        "A fire destroyed the family home last year. The family is still repaying loans and Jannatul's semester fees are overdue.",
      ambitions:
        "She wants to become an education officer and improve learning outcomes in coastal schools.",
      financialNeeds:
        "Support is needed to clear overdue semester fees and cover her final-year research costs.",
      dreams:
        "Jannatul dreams of opening a community learning centre for children affected by displacement.",
    },
    previousExam: "HSC 2023",
    passingYear: 2023,
    result: "GPA 4.78",
    futureGoal: "BSc in Education and community learning",
    requiredAmount: 150000,
    raisedSeed: 82000,
    featured: true,
    createdAt: "2026-09-12",
    privateInfo: {
      dateOfBirth: "2005-12-01",
      mobile: "01700-000120",
      fatherName: "Md. Jamal Uddin",
      motherName: "Nurjahan Begum",
      address: "Kolatoli, Cox's Bazar",
      guardianOccupation: "Part-time security guard",
      familyIncome: 16000,
    },
  },
  {
    id: "stu-21",
    slug: "rasheda-begum",
    fullName: "Rasheda Begum",
    gender: "female",
    district: "Chandpur",
    division: "Chattogram",
    categoryId: "cat-diploma",
    institution: "Chandpur Polytechnic Institute",
    headline:
      "Computer technology applicant awaiting verification before publishing",
    shortBio:
      "Rasheda has applied for a diploma scholarship and is currently completing document verification with the CEBBD team.",
    story: {
      family:
        "Rasheda lives in Chandpur with her parents and two younger sisters. Her father runs a small cycle repair shop.",
      challenges:
        "The family's income is limited and her admission fee is due soon.",
      ambitions:
        "She wants to become a computer technician and open a small training centre.",
      financialNeeds:
        "Support will be needed for admission and semester fees once her application is approved.",
      dreams:
        "Rasheda hopes to train young women in computer repair and digital skills.",
    },
    previousExam: "SSC 2026",
    passingYear: 2026,
    result: "GPA 4.50",
    futureGoal: "Computer technology and digital skills training",
    requiredAmount: 70000,
    raisedSeed: 0,
    campaignStatus: "draft",
    visibility: "unpublished",
    createdAt: "2026-09-10",
    privateInfo: {
      dateOfBirth: "2009-03-15",
      mobile: "01700-000121",
      fatherName: "Md. Harun Mia",
      motherName: "Ayesha Begum",
      address: "Sadar, Chandpur",
      guardianOccupation: "Cycle repairer",
      familyIncome: 10000,
      adminNotes: "Application under verification. Do not publish yet.",
    },
  },
];

export const students: Student[] = seeds.map((seed) => ({
  id: seed.id,
  slug: seed.slug,
  fullName: seed.fullName,
  gender: seed.gender,
  district: seed.district,
  division: seed.division,
  categoryId: seed.categoryId,
  institution: seed.institution,
  headline: seed.headline,
  shortBio: seed.shortBio,
  story: seed.story,
  previousExam: seed.previousExam,
  passingYear: seed.passingYear,
  result: seed.result,
  futureGoal: seed.futureGoal,
  requiredAmount: seed.requiredAmount,
  campaignStatus: seed.campaignStatus ?? "active",
  visibility: seed.visibility ?? "published",
  featured: seed.featured ?? false,
  createdAt: seed.createdAt,
  supportPlans: buildSupportPlans(seed.requiredAmount, seed.raisedSeed),
  privateInfo: seed.privateInfo,
}));

/** Used only to seed realistic approved donations. Raised totals are always
 * derived from approved donations at runtime. */
export const seedRaisedByStudentId: Record<string, number> = Object.fromEntries(
  seeds.map((seed) => [seed.id, seed.raisedSeed]),
);
