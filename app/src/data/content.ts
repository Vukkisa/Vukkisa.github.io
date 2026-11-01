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
  /** What the work is, in two words each. Shown above the name. */
  focus: ['AI engineering', 'Applied ML'],
  /** The one-line hero statement. Each clause is one of the projects below (KYR, AI Surveillance, speech). */
  tagline: ['I build AI that', 'reads the rules,', 'watches the zone', 'and listens through the noise.'],
  now: 'Associate Data Scientist intern at AiSpry',
  summary:
    'Postgraduate student in AI & Data Science at Jio Institute and Associate Data Scientist intern at AiSpry, after two and a half years as a Data Developer at TCS working on telecom billing systems. I build retrieval, computer-vision and speech-recognition systems.',
}

/**
 * The hero's illustration: the speech-recognition pipeline from the AiSpry internship, stage by
 * stage. Every name here is from the project card below (approved by the owner); nothing shows
 * real audio or results.
 */
export const signalFigure = {
  title: 'Noisy railway audio → text',
  caption: 'Illustration of my internship pipeline. Not real audio, and no results.',
  stages: [
    { name: 'Denoise', detail: 'Spectral · RNNoise · DeepFilterNet' },
    { name: 'Segment', detail: 'Silence and voice (Silero VAD)' },
    { name: 'Transcribe', detail: 'Whisper · Indic-Conformer · Qwen3-ASR' },
    { name: 'Score', detail: 'Word and character error rate' },
  ],
}

export type Link = { label: string; href: string; note?: string }

export type CaseStudy = {
  /** How it works, in order. */
  steps: { name: string; detail: string }[]
  /** What I personally did. */
  mine: string[]
  /** Parts other people built, when it was a team project. */
  team?: string
  /** What has been measured, or a plain statement that it hasn't. Never a goal. */
  evaluation: string
  limitations: string[]
}

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
  /** Illustration basename in /images/projects (with a -dark variant). Illustrative, not a screenshot. */
  cover: string
  /** A drawn diagram of how the project works, shown instead of the cover. Illustrative, not live. */
  visual?: 'rag' | 'cv' | 'speech'
  /** The expandable case study under the card. Only facts that are backed up; say so when nothing is measured. */
  caseStudy: CaseStudy
  /** A related experiment in the Lab section. */
  lab?: { label: string; href: string }
}

/**
 * Homepage order: inspectable evidence and relevance to AI/ML roles first, then recency.
 * Public code (KnowYourRules, AI Surveillance) comes before the internship work that can't be
 * shown, and Ez-Learn (full-stack, older) comes last.
 */
export const projects: Project[] = [
  {
    id: 'knowyourrules',
    title: 'KnowYourRules',
    subtitle: 'Traffic-law assistant grounded in official documents',
    context: 'Jio Institute · team project · Sep 2026',
    status: { label: 'Local prototype', tone: 'done' },
    problem: 'Indian traffic rules are spread across central, state, city and court documents, so there’s no single place to look one up.',
    built:
      'The RAG pipeline, my part of the team project: LangChain chunking, local Ollama embeddings in a Chroma vector store, and Groq (gpt-oss-120b) answering only from the retrieved passages, with the source shown.',
    evidence: 'Indexed so far: the central Motor Vehicles Act and Rules, Gujarat and Delhi. Answer accuracy hasn’t been evaluated yet; a cited source shows where an answer came from, not that it’s correct.',
    tools: ['Python', 'LangChain', 'Ollama', 'Chroma', 'Groq'],
    cover: 'knowyourrules',
    visual: 'rag',
    lab: { label: 'Step through the pipeline', href: '#lab-rag' },
    caseStudy: {
      steps: [
        { name: 'Ingest', detail: 'Official documents (the central Motor Vehicles Act and Rules, Gujarat and Delhi) are split into chunks with LangChain, embedded locally with Ollama (nomic-embed-text) and stored in Chroma, each chunk tagged with its source and state.' },
        { name: 'Ask', detail: 'You ask a traffic-rules question. If the app doesn’t know your state it asks, and it rewrites a follow-up into a standalone question.' },
        { name: 'Retrieve', detail: 'The question is embedded the same way and matched against Chroma: 4 chunks from the central rules, plus 4 from your state’s rules when that state is indexed.' },
        { name: 'Ground', detail: 'The chunks go into a strict prompt, each labelled with its source and state, that allows answers only from that text.' },
        { name: 'Answer', detail: 'Groq (gpt-oss-120b) answers and names its source documents, or says the knowledge base doesn’t cover the question.' },
      ],
      mine: ['The RAG pipeline: chunking, local embeddings, the Chroma store, retrieval, and the grounded prompt and answer.'],
      team: 'Teammates built the backend around it, including asking for your state and rewriting follow-up questions.',
      evaluation: 'Not evaluated yet. A cited source shows where an answer came from, not that the answer is correct.',
      limitations: ['Only the central rules, Gujarat and Delhi are indexed so far.', 'Answer accuracy hasn’t been measured.', 'It runs as a local prototype, not a public service.'],
    },
    links: [
      { label: 'Team repository', href: 'https://github.com/DAG-21/KnowYourRules' },
      { label: 'How it was built', href: 'https://github.com/DAG-21/KnowYourRules#the-process' },
    ],
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
    evidence: 'Packaged as an installable command-line tool with a built-in FPS benchmark; benchmark results not yet recorded. Hidden feet or crowded scenes can cause missed or false alerts.',
    tools: ['Python', 'YOLOv8', 'OpenCV', 'NumPy'],
    cover: 'ai-surveillance',
    visual: 'cv',
    lab: { label: 'Try the zone check', href: '#lab-zone' },
    caseStudy: {
      steps: [
        { name: 'Input', detail: 'Any camera feed: a webcam, a USB camera, an RTSP stream or a video file.' },
        { name: 'Zone', detail: 'You draw the restricted zone as a polygon on the frame.' },
        { name: 'Detect', detail: 'YOLOv8 detects people in each frame.' },
        { name: 'Test', detail: 'Each person’s feet point, the bottom-centre of their box, is tested against the zone.' },
        { name: 'Record', detail: 'Every intrusion saves a video clip, a snapshot and a CSV log entry.' },
      ],
      mine: ['Built the tool as Jio Institute coursework and packaged it as an installable command-line tool with a built-in FPS benchmark.'],
      evaluation: 'No accuracy or speed results recorded yet. The FPS benchmark is built in, but its results haven’t been recorded.',
      limitations: ['Hidden feet or crowded scenes can cause missed or false alerts.', 'It watches for people only.'],
    },
    links: [
      { label: 'Repository', href: 'https://github.com/Vukkisa/AI_Surveillance' },
      { label: 'Known limitations', href: 'https://github.com/Vukkisa/AI_Surveillance#known-limitations' },
    ],
  },
  {
    id: 'speech-recognition',
    title: 'Railway speech recognition',
    subtitle: 'Transcribing noisy, multilingual railway audio',
    context: 'AiSpry · internship · Oct 2026 – now',
    status: { label: 'In progress', tone: 'progress' },
    problem: 'Railway audio recordings are noisy and multilingual, and off-the-shelf speech models struggle with them.',
    built:
      'A fully local speech-recognition pipeline. I tested denoising methods (spectral, RNNoise, DeepFilterNet) and silence- and voice-based segmentation, benchmarked Indic-Conformer, Qwen3-ASR and Whisper, and merged their outputs with a word-level ensemble, all within tight compute and disk limits.',
    evidence: 'Every variant is scored on word and character error rate. Now fine-tuning a model to lower WER. Results not yet shareable.',
    tools: ['Python', 'PyTorch', 'Hugging Face Transformers', 'faster-whisper', 'Silero VAD', 'jiwer'],
    cover: 'railway-speech',
    visual: 'speech',
    caseStudy: {
      steps: [
        { name: 'Denoise', detail: 'Spectral denoising, RNNoise and DeepFilterNet, each tested.' },
        { name: 'Segment', detail: 'Silence-based and voice-based segmentation, using Silero VAD.' },
        { name: 'Transcribe', detail: 'Indic-Conformer, Qwen3-ASR and Whisper (via faster-whisper), benchmarked side by side.' },
        { name: 'Combine', detail: 'A word-level ensemble merges the models’ outputs.' },
        { name: 'Score', detail: 'Every variant is scored on word and character error rate (WER, CER) with jiwer.' },
      ],
      mine: ['Built the fully local pipeline during the internship, within tight compute and disk limits.', 'Now fine-tuning a model to lower WER.'],
      evaluation: 'Every variant is scored on WER and CER, but the results are company data and can’t be shared yet.',
      limitations: ['Company project: the code, audio and results aren’t public.', 'Work in progress: fine-tuning is under way.'],
    },
    links: [],
    privateNote: 'Company project: code and data aren’t public.',
  },
  {
    id: 'ez-learn',
    title: 'Ez-Learn',
    subtitle: 'Full-stack learning platform',
    context: 'TalentSprint · 2023, updated 2025',
    status: { label: 'Live demo', tone: 'live' },
    problem: 'Learners need one place to sign up, pay, study, take quizzes and earn a certificate, and instructors need a way to run their courses.',
    built:
      'A Django platform. Learners sign up with email OTP, study course content, take scored quizzes and earn certificates. Instructors manage courses and quizzes. Paid courses go through Razorpay with payment verification, on PostgreSQL.',
    evidence: 'Deployed on Render with a public demo.',
    tools: ['Python', 'Django', 'PostgreSQL', 'Razorpay', 'Render'],
    cover: 'ez-learn',
    caseStudy: {
      steps: [
        { name: 'Sign up', detail: 'Learners sign up with a one-time code sent by email.' },
        { name: 'Learn', detail: 'They study course content and take scored quizzes.' },
        { name: 'Pay', detail: 'Paid courses go through Razorpay, with payment verification.' },
        { name: 'Certify', detail: 'Learners earn certificates.' },
        { name: 'Teach', detail: 'Instructors manage their courses and quizzes. Everything runs on Django and PostgreSQL.' },
      ],
      mine: ['Built it during the TalentSprint Full Stack Developer program (2023), then updated it and deployed it on Render (2025).'],
      evaluation: 'No formal evaluation. It’s a working deployment you can try.',
      limitations: ['The demo server sleeps when idle, so it can take a minute to wake.', 'The repository isn’t linked here yet.'],
    },
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
    href: 'https://github.com/Vukkisa/Gen_AI/blob/main/GenerativeAI_Assignment_2.ipynb',
  },
  {
    title: 'LLM extraction pipelines',
    body: 'LangChain + Groq pipelines that classify, summarise and extract entities from news articles and job postings.',
    context: 'Jio Institute coursework',
    href: 'https://github.com/Vukkisa/Gen_AI/blob/main/Generative%20AI%20-%20Assignment%201.ipynb',
  },
]

export const education = [
  { org: 'Jio Institute', role: 'PG Program in AI & Data Science', when: 'Apr 2026 – Apr 2027' },
  { org: 'B.V. Raju Institute of Technology', role: 'B.Tech, Computer Science & Engineering · CGPA 8.17', when: '2022' },
] as const

export const certifications = ['SQL (Advanced), HackerRank, 2023', 'Full Stack Developer (Python), TalentSprint, 2023']

export const skillGroups = [
  { name: 'Data', items: ['SQL', 'PL/SQL', 'Oracle', 'PostgreSQL', 'Power BI'] },
  { name: 'ML & vision', items: ['Python', 'scikit-learn', 'PyTorch', 'YOLOv8', 'OpenCV', 'Hugging Face'] },
  { name: 'GenAI & RAG', items: ['LangChain', 'LangGraph', 'Chroma', 'Ollama', 'Groq'] },
  { name: 'Apps & tools', items: ['Django', 'FastAPI', 'Gradio', 'Git'] },
] as const

/**
 * The journey, year by year, and the only record of work experience on the site (roles, dates and
 * the TCS results all live here). `station` lights up that part of the landscape illustration
 * (0 start · 1 data · 2 processing · 3 learning · 4 retrieval · 5 applications). Dates match
 * `education` and `projects`; the last entry is a direction, not a claim.
 */
export const chapters = [
  {
    year: '2022', station: 0, kind: 'Start',
    title: 'B.Tech, Computer Science & Engineering', org: 'B.V. Raju Institute of Technology',
    points: ['Graduated with a CGPA of 8.17.'],
  },
  {
    year: '2023', station: 1, kind: 'Data',
    title: 'Full Stack Developer program', org: 'TalentSprint · Mar – Sep 2023',
    points: [
      '200+ hours of Python, Django and web development. Ez-Learn started here; I later updated it and deployed it on Render (2025).',
      'Certified in SQL (Advanced) on HackerRank.',
    ],
  },
  {
    year: '2023 – 26', station: 2, kind: 'Processing',
    title: 'Data Developer', org: 'Tata Consultancy Services · Sep 2023 – Apr 2026',
    points: [
      'Configured billing rules and rate plans for a Kenan billing migration of 2M+ customer records.',
      'Built pre-migration scripts for bulk call-record (CDR) loads, improving processing speed by 25%.',
      'Automated a billing charge-inventory report, cutting manual validation time by 40%.',
      'Star of the Month, TCS project excellence award (2024).',
    ],
  },
  {
    year: '2026', station: 3, kind: 'Learning',
    title: 'PG Program in AI & Data Science', org: 'Jio Institute · Apr 2026 – Apr 2027',
    points: [
      'Coursework includes computer vision and generative AI.',
      'Built AI Surveillance (YOLOv8 zone-intrusion detection) and LLM extraction and RAG notebooks.',
    ],
  },
  {
    year: 'Sep 2026', station: 4, kind: 'Retrieval',
    title: 'KnowYourRules', org: 'Jio Institute · team project',
    points: ['Built the RAG pipeline that answers traffic-law questions only from official documents, with the source shown.'],
  },
  {
    year: 'Oct 2026', station: 5, kind: 'Applications',
    title: 'Associate Data Scientist (internship)', org: 'AiSpry · Oct 2026 – Dec 2026',
    points: ['Speech recognition for noisy railway audio: building a local speech-recognition setup and working to lower the word error rate (WER).'],
  },
  {
    year: 'Next', station: 5, kind: 'Direction',
    title: 'AI agents', org: 'Where I’m heading',
    points: ['Systems that plan, call tools and check their own work. I’ve rebuilt one coursework RAG project as a LangGraph graph; agents are the next step.'],
  },
] as const

export const now = [
  { label: 'Now', text: 'Lowering word error rate on noisy railway audio at AiSpry.' },
  { label: 'Studying', text: 'PG Program in AI & Data Science at Jio Institute, until April 2027.' },
  { label: 'Next', text: 'AI agents: tool use, planning and evaluation.' },
]
