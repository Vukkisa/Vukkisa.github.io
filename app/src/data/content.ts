/**
 * Every word on the site lives here.
 *
 * Rule for editing: only write what can be backed up. Each project card says where the work came
 * from, what I personally built, and its evidence: a measured result, a verified capability, or a
 * plain statement that evaluation is pending. Never put a goal in the evidence line.
 * Sources: Jayanth's résumé, the linked repositories, and facts he confirmed directly.
 */

export const site = {
  name: 'Jayanth Vukkisa',
  url: 'https://vukkisa.github.io/',
  location: 'Hyderabad, India',
  email: 'vukkisajayanth@gmail.com',
  github: 'https://github.com/Vukkisa',
  linkedin: 'https://linkedin.com/in/jayanthvukkisa',
  resume: '/assests/Jayanth_Vukkisa_Resume.pdf',
  source: 'https://github.com/Vukkisa/Vukkisa.github.io',
}

export const intro = {
  role: 'AI & Data Science · Hyderabad',
  lines: [
    'I started with SQL. Then I wanted to know what the data could do.',
    'I spent two and a half years as a Data Developer at TCS, working on enterprise telecom billing data. Now I’m a postgraduate student in AI & Data Science at Jio Institute and an Associate Data Scientist intern at AiSpry, working on speech recognition, computer vision and retrieval (RAG).',
  ],
}

export type Link = { label: string; href: string; note?: string }

/** One recruiter-friendly card. Keep problem + built + evidence to roughly 50–90 words. */
export type Project = {
  id: string
  title: string
  subtitle: string
  context: string
  status: { label: string; tone: 'done' | 'progress' | 'live' }
  problem: string
  built: string
  evidence: string
  tools: string[]
  links: Link[]
  /** Shown instead of links when the work can't be public. */
  privateNote?: string
}

export const projects: Project[] = [
  {
    id: 'knowyourrules',
    title: 'KnowYourRules',
    subtitle: 'Traffic-law assistant grounded in official documents',
    context: 'Jio Institute · team project · Sep 2026',
    status: { label: 'Runs locally', tone: 'done' },
    problem: 'India’s traffic rules are scattered across central, state, city and court sources, with no single place to look them up.',
    built:
      'The RAG pipeline: LangChain chunking, local Ollama embeddings in a Chroma vector store, and Groq (gpt-oss-120b) answering under a strict prompt that only uses retrieved text and cites its source.',
    evidence: 'Runs locally with the central Motor Vehicles Act and Rules, Gujarat and Delhi indexed. Answer accuracy not yet evaluated.',
    tools: ['Python', 'LangChain', 'Ollama', 'Chroma', 'Groq'],
    links: [{ label: 'Team repository', href: 'https://github.com/DAG-21/KnowYourRules' }],
  },
  {
    id: 'speech-recognition',
    title: 'Railway speech recognition',
    subtitle: 'Transcribing noisy, multilingual cab audio',
    context: 'AiSpry · internship · Oct 2026 – now',
    status: { label: 'In progress', tone: 'progress' },
    problem: 'Locomotive cab recordings are noisy and multilingual, and off-the-shelf speech models struggle with them.',
    built:
      'A fully local speech-recognition pipeline. I tested denoising methods (spectral, RNNoise, DeepFilterNet) and silence- and voice-based segmentation, benchmarked Indic-Conformer, Qwen3-ASR and Whisper, and merged their outputs with a word-level ensemble, all within tight compute and disk limits.',
    evidence: 'Every variant is scored on word and character error rate. Now fine-tuning a model to lower WER. Results not yet shareable.',
    tools: ['Python', 'PyTorch', 'Hugging Face Transformers', 'faster-whisper', 'Silero VAD', 'jiwer'],
    links: [],
    privateNote: 'Company project: code and data aren’t public.',
  },
  {
    id: 'ai-surveillance',
    title: 'AI Surveillance',
    subtitle: 'Restricted-zone intrusion detection',
    context: 'Jio Institute · coursework · 2026',
    status: { label: 'Complete', tone: 'done' },
    problem: 'Guarding a restricted area shouldn’t depend on someone watching a screen all day.',
    built:
      'Draw a zone on any camera feed (webcam, USB, RTSP or video file). YOLOv8 detects people, each person’s feet point is tested against the zone, and every intrusion saves a clip, a snapshot and a CSV log entry.',
    evidence: 'Packaged as an installable CLI with threaded, self-reconnecting capture and a built-in FPS benchmark. Benchmark results not yet recorded.',
    tools: ['Python', 'YOLOv8', 'OpenCV', 'NumPy'],
    links: [{ label: 'Repository', href: 'https://github.com/Vukkisa/AI_Surveillance' }],
  },
  {
    id: 'drowsiness',
    title: 'Driver drowsiness detection',
    subtitle: 'Posture and face signals, built for poor light',
    context: 'AiSpry · live project · 2026',
    status: { label: 'In progress', tone: 'progress' },
    problem: 'Spotting a drowsy driver in cab video, often in dim light, without enough labelled data to train a model from scratch.',
    built:
      'Improved an existing pipeline instead. YOLOv8-Pose reads posture and MediaPipe reads eye closure, yawning and head tilt. The signals are fused so detection still works when one is missing, classified with RandomForest/SVM, trained on videos recreating real scenarios, and tuned for faster processing.',
    evidence: 'Performance is reported per lighting condition: normal, dim and dark. Results not yet shareable.',
    tools: ['Python', 'YOLOv8-Pose', 'MediaPipe', 'scikit-learn', 'OpenCV'],
    links: [],
    privateNote: 'Company project: code and data aren’t public.',
  },
  {
    id: 'ez-learn',
    title: 'Ez-Learn',
    subtitle: 'Full-stack learning platform',
    context: 'TalentSprint · 2023, updated 2025',
    status: { label: 'Live demo', tone: 'live' },
    problem: 'A complete learning product rather than a notebook: accounts, payments, content, quizzes and certificates for two kinds of user.',
    built:
      'A Django platform. Learners sign up with email OTP, study course content, take scored quizzes and earn certificates. Instructors manage courses and quizzes. Paid courses go through Razorpay with payment verification, on PostgreSQL.',
    evidence: 'Deployed on Render with a public demo.',
    tools: ['Python', 'Django', 'PostgreSQL', 'Razorpay', 'Render'],
    links: [
      { label: 'Live demo', href: 'https://ez-learn.onrender.com/', note: 'may take a minute to wake' },
    ],
  },
]

export const moreWork = [
  {
    title: 'Smart Mutual Fund Advisor',
    body: 'RAG over a mutual-fund dataset with Chroma and structured output, served in Gradio, then rebuilt as a LangGraph graph.',
    context: 'Jio Institute coursework',
    href: 'https://github.com/Vukkisa/Gen_AI',
  },
  {
    title: 'LLM extraction pipelines',
    body: 'LangChain + Groq pipelines that classify, summarise and extract entities from news articles and job postings.',
    context: 'Jio Institute coursework',
    href: 'https://github.com/Vukkisa/Gen_AI',
  },
]

export const experience = [
  {
    org: 'AiSpry',
    role: 'Associate Data Scientist (internship)',
    when: 'Oct 2026 – Dec 2026',
    points: ['Speech recognition for noisy railway audio and driver drowsiness detection.'],
  },
  {
    org: 'Tata Consultancy Services',
    role: 'Data Developer',
    when: 'Sep 2023 – Apr 2026',
    points: [
      'Configured billing rules and rate plans for a Kenan billing migration of 2M+ customer records.',
      'Built pre-migration scripts for bulk call-record (CDR) loads, improving processing speed by 25%.',
      'Automated a billing charge-inventory report, cutting manual validation time by 40%.',
      'Star of the Month, TCS project excellence award (2024).',
    ],
  },
  {
    org: 'TalentSprint',
    role: 'Full Stack Developer program',
    when: 'Mar 2023 – Sep 2023',
    points: ['200+ hour program in Python, Django and web development, where Ez-Learn started.'],
  },
] as const

export const education = [
  { org: 'Jio Institute', role: 'PG Program in AI & Data Science', when: 'Apr 2026 – Apr 2027' },
  { org: 'B.V. Raju Institute of Technology', role: 'B.Tech, Computer Science & Engineering · CGPA 8.17', when: '2022' },
] as const

export const certifications = ['SQL (Advanced), HackerRank, 2023', 'Full Stack Developer (Python), TalentSprint, 2023']

export const skills = [
  'Python', 'SQL', 'PL/SQL', 'Oracle', 'PostgreSQL', 'scikit-learn', 'PyTorch', 'YOLOv8', 'OpenCV', 'MediaPipe',
  'LangChain', 'LangGraph', 'Chroma', 'Ollama', 'Groq', 'Hugging Face', 'Django', 'FastAPI', 'Gradio', 'Git', 'Power BI',
]
