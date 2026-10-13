/**
 * Every word on the site lives here.
 *
 * Rule for editing: only write what can be backed up. Each project says where its evidence is
 * (a repo, a live demo, or "internship work, not public"), and anything not yet measured says so.
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

export const sections = [
  { id: 'work', title: 'Work' },
  { id: 'journey', title: 'Journey' },
  { id: 'experience', title: 'Experience' },
  { id: 'contact', title: 'Contact' },
] as const

export const hero = {
  kicker: 'AI & data science · Hyderabad',
  lineOne: 'I started with SQL.',
  intro:
    'I’m Jayanth Vukkisa. I spent two and a half years as a Data Developer at TCS, working on enterprise telecom billing data. Now I’m a postgraduate student in AI & Data Science at Jio Institute and an Associate Data Scientist intern at AiSpry, building speech-recognition, computer-vision and retrieval (RAG) systems.',
  now: [
    { label: 'Now', value: 'Associate Data Scientist (internship), AiSpry', detail: 'Oct 2026 – Dec 2026' },
    { label: 'Studying', value: 'PG Program in AI & Data Science, Jio Institute', detail: 'Apr 2026 – Apr 2027' },
    { label: 'Before', value: 'Data Developer, Tata Consultancy Services', detail: 'Sep 2023 – Apr 2026' },
  ],
}

export type Link = { label: string; href: string; note?: string }
export type Step = { label: string; detail?: string; mine?: boolean }

export type CaseFile = {
  id: string
  title: string
  summary: string
  context: string
  date: string
  status: { label: string; tone: 'done' | 'progress' | 'live' }
  /** The pipeline, drawn left to right. `mine` marks the steps Jayanth built on a team project. */
  flow: Step[]
  flowNote?: string
  problem: string
  did: { heading: string; points: string[] }
  decisions?: string[]
  limits: string[]
  stack: string[]
  links: Link[]
  /** Shown instead of links when the work can't be public. */
  privateNote?: string
}

export const work: CaseFile[] = [
  {
    id: 'knowyourrules',
    title: 'KnowYourRules',
    summary: 'A traffic-law assistant that answers only from official government documents, cites its source, and says “not covered” instead of guessing.',
    context: 'Jio Institute · team project',
    date: 'Sep 2026',
    status: { label: 'Runs locally', tone: 'done' },
    flow: [
      { label: '126 official sources' },
      { label: '1,400+ PDFs' },
      { label: '84 text-native Acts & Rules' },
      { label: '24 curated files' },
      { label: 'Chunk & embed', detail: 'LangChain · Ollama', mine: true },
      { label: 'Chroma', detail: 'vector store', mine: true },
      { label: 'Groq LLM', detail: 'strict grounding prompt', mine: true },
      { label: 'Cited answer', mine: true },
    ],
    flowNote: 'Highlighted steps are the RAG pipeline I built. The rest was built by the team.',
    problem:
      'India’s traffic rules are split across central, state, city and court sources, with no single index. A general chatbot will happily invent a fine or a rule that doesn’t exist in your state.',
    did: {
      heading: 'What I built: the RAG pipeline',
      points: [
        'Loaded and chunked the curated Acts and Rules with LangChain.',
        'Embedded them locally with Ollama (nomic-embed-text) into a Chroma vector store.',
        'Set up retrieval and answering with Groq (gpt-oss-120b) under a prompt that only allows answers from retrieved text, with the source cited.',
      ],
    },
    decisions: [
      'OCR on scanned PDFs measured at 9–40 seconds a page, so the corpus was narrowed to text-native Acts and Rules rather than spending 50+ hours on OCR.',
      'Every chunk carries a verified state field. That caught two files tagged with the wrong state because they had been downloaded from another state’s page.',
      'Retrieval is filtered by state: your state’s rules plus the nationwide central rules. If your state isn’t indexed, the assistant says so and falls back to central rules. It never answers with another state’s rules.',
    ],
    limits: [
      'Indexed so far: central Motor Vehicles Act and Rules, Gujarat and Delhi.',
      'An OCR and translation path for scanned, non-English documents was built but isn’t in the index yet.',
      'Not deployed: it runs locally.',
    ],
    stack: ['LangChain', 'Ollama', 'Chroma', 'Groq', 'FastAPI', 'Python'],
    links: [{ label: 'Team repository', href: 'https://github.com/DAG-21/KnowYourRules' }],
  },
  {
    id: 'speech-recognition',
    title: 'Speech recognition for noisy railway audio',
    summary: 'A local speech-recognition setup for noisy, multilingual recordings from locomotive cabs, built to bring the word error rate down.',
    context: 'AiSpry · internship',
    date: 'Oct 2026 – now',
    status: { label: 'In progress', tone: 'progress' },
    flow: [
      { label: 'Raw cab audio' },
      { label: 'Quality check', detail: 'noise, silence, clipping' },
      { label: 'Denoise', detail: 'spectral · RNNoise · DeepFilterNet' },
      { label: 'Segment', detail: 'silence & voice activity' },
      { label: 'Transcribe', detail: 'Indic-Conformer · Qwen3-ASR · Whisper' },
      { label: 'Ensemble', detail: 'word-level merge' },
      { label: 'Score', detail: 'WER · CER · real-time factor' },
    ],
    problem:
      'Cab recordings are noisy and mix languages. Out-of-the-box speech models struggle with them, and there isn’t enough labelled audio to train a model from scratch.',
    did: {
      heading: 'What I’ve done',
      points: [
        'Built a speech-recognition setup that runs fully locally.',
        'Tried several ways of splitting audio into speech segments, based on silence and voice activity.',
        'Tested several denoising methods before transcription: spectral subtraction, RNNoise and DeepFilterNet.',
        'Benchmarked Indian-language models side by side (AI4Bharat Indic-Conformer, Qwen3-ASR, Whisper) and combined their outputs with a word-level ensemble.',
        'Scored every variant with standard measures: word and character error rates, plus real-time factor.',
      ],
    },
    decisions: [
      'Everything runs locally with limited compute and disk space, so model choice, caching and storage were planned around those limits.',
      'Denoising is measured, not assumed: each method is scored against the same references before it’s kept.',
    ],
    limits: ['In progress: currently fine-tuning a model to reduce the error rate further.', 'Results will be added once they can be shared.'],
    stack: ['Python', 'PyTorch', 'Hugging Face Transformers', 'faster-whisper', 'Silero VAD', 'jiwer'],
    links: [],
    privateNote: 'Internship work: code and data aren’t public.',
  },
  {
    id: 'ai-surveillance',
    title: 'AI Surveillance',
    summary: 'Draw a restricted zone on any camera feed. The system detects people with YOLOv8 and raises an alert the moment someone steps inside.',
    context: 'Jio Institute · coursework',
    date: '2026',
    status: { label: 'Complete', tone: 'done' },
    flow: [
      { label: 'Any video source', detail: 'webcam · USB · RTSP · file' },
      { label: 'Threaded capture', detail: 'latest frame, auto-reconnect' },
      { label: 'YOLOv8', detail: 'person detection' },
      { label: 'Feet point', detail: 'bottom-centre of box' },
      { label: 'Zone test', detail: 'point in polygon' },
      { label: 'Alert', detail: 'clip · snapshot · CSV log' },
    ],
    problem:
      'Watching a restricted area means someone staring at a screen. The system should notice the moment a person enters a zone, on whatever camera is available, and keep evidence of it.',
    did: {
      heading: 'What I built',
      points: [
        'Works with any source: a webcam, a USB capture device, an IP/RTSP camera or a video file.',
        'Capture runs on its own thread, always processes the latest frame, and reconnects dropped streams.',
        'Zones are drawn by clicking on the live feed, saved to a file and reused across runs.',
        'Every intrusion saves a video clip and a snapshot, plus a timestamped CSV event log.',
        'A benchmark mode compares YOLOv8 model sizes on FPS and per-frame latency. Packaged as an installable command-line tool, with an optional standalone executable.',
      ],
    },
    decisions: [
      'Each person is tracked by their feet (the bottom-centre of the box), not the whole box, so someone standing in the zone triggers the alert even if their head leans outside it.',
    ],
    limits: [
      'If a person’s feet are hidden (behind furniture, for example), the feet point shifts and the alert can be missed or false.',
      'Crowded scenes with heavy overlap reduce reliability: it’s a single-camera, 2D approach.',
    ],
    stack: ['Python', 'YOLOv8', 'Ultralytics', 'OpenCV', 'NumPy'],
    links: [{ label: 'Repository', href: 'https://github.com/Vukkisa/AI_Surveillance' }],
  },
  {
    id: 'drowsiness',
    title: 'Driver drowsiness detection',
    summary: 'Combines body posture and facial signals to flag a drowsy driver, and keeps working in poor light.',
    context: 'AiSpry · live project',
    date: '2026',
    status: { label: 'In progress', tone: 'progress' },
    flow: [
      { label: 'Cab video' },
      { label: 'Body posture', detail: 'YOLOv8-Pose' },
      { label: 'Face signals', detail: 'MediaPipe: eyes, yawn, head tilt' },
      { label: 'Fusion', detail: 'works if one signal is missing' },
      { label: 'Classifier', detail: 'RandomForest / SVM' },
      { label: 'Alert or drowsy', detail: 'reported per lighting condition' },
    ],
    problem:
      'Training a drowsiness model from scratch needs a lot of labelled ground truth, which we didn’t have. Cab footage is also often dim or dark, which is exactly when face detection fails.',
    did: {
      heading: 'What I’ve done',
      points: [
        'Improved an existing detection pipeline instead of starting from zero, and trained it on videos recreating the situations it has to handle.',
        'Read body posture with YOLOv8-Pose and eye closure, yawning and head tilt with MediaPipe Face Mesh.',
        'Fused both into one signal that still works when one of them is missing, such as a face in the dark.',
        'Checked performance separately for normal, dim and dark lighting.',
        'Worked on reducing processing time so detection can keep up with video.',
      ],
    },
    limits: ['In progress.', 'Results will be added once they can be shared.'],
    stack: ['Python', 'YOLOv8-Pose', 'MediaPipe', 'scikit-learn', 'OpenCV'],
    links: [],
    privateNote: 'Company project: code and data aren’t public.',
  },
  {
    id: 'ez-learn',
    title: 'Ez-Learn',
    summary: 'A full-stack learning platform: learners sign up, pay, study, take quizzes and earn certificates, while instructors manage the courses.',
    context: 'TalentSprint · full-stack program',
    date: '2023 · updated 2025',
    status: { label: 'Live demo', tone: 'live' },
    flow: [
      { label: 'Sign up', detail: 'email OTP' },
      { label: 'Pay', detail: 'Razorpay' },
      { label: 'Learn', detail: 'course content' },
      { label: 'Quiz', detail: 'scored attempts' },
      { label: 'Certificate' },
    ],
    problem: 'An end-to-end product rather than a notebook: accounts, payments, content, assessment and certificates, for two kinds of user.',
    did: {
      heading: 'What I built',
      points: [
        'Learner side: email-OTP registration, course content, quizzes with scores, progress and certificates.',
        'Instructor side: add and edit courses, manage content, build and edit quizzes, see learners.',
        'Paid courses through Razorpay, with payment verification.',
        'Deployed on Render with a PostgreSQL database.',
      ],
    },
    limits: ['Hosted on a free plan: the demo can take up to a minute to wake up.'],
    stack: ['Python', 'Django', 'PostgreSQL', 'Razorpay', 'Render'],
    links: [
      { label: 'Live demo', href: 'https://ez-learn.onrender.com/', note: 'may take a minute to wake' },
      { label: 'Repository', href: 'https://github.com/Vukkisa/ez-learn' },
    ],
  },
]

export const moreWork = [
  {
    title: 'Smart Mutual Fund Advisor',
    context: 'Jio Institute · coursework',
    body: 'Describe what you want (“high return, only from one fund house”) and get recommended funds with an explanation. RAG over a Kaggle mutual-fund dataset with Chroma, structured output via Pydantic, a Gradio app, then the same pipeline rebuilt as a LangGraph graph.',
    stack: ['LangChain', 'LangGraph', 'Chroma', 'Groq', 'Gradio'],
    href: 'https://github.com/Vukkisa/gen_ai',
  },
  {
    title: 'LLM extraction pipelines',
    context: 'Jio Institute · coursework',
    body: 'LangChain pipelines that classify and summarise BBC news articles and extract entities, and classify job postings and pull out their requirements, with two Groq models split by task.',
    stack: ['LangChain', 'Groq', 'Pydantic', 'pandas'],
    href: 'https://github.com/Vukkisa/gen_ai',
  },
]

/** The journey. Each stage points at the evidence for it. */
export const journey = [
  { stage: 'SQL & PL/SQL', when: '2023', where: 'TCS', note: 'Queries, procedures and data checks on a Kenan telecom billing platform.', evidence: { label: 'Experience', href: '#experience' } },
  { stage: 'Data engineering', when: '2023 – 2026', where: 'TCS', note: 'Data migration, financial feed mappings and bulk loads of call records.', evidence: { label: 'Experience', href: '#experience' } },
  { stage: 'Machine learning', when: '2026', where: 'Jio Institute', note: 'Machine-learning coursework in the postgraduate program.', evidence: { label: 'Experience', href: '#experience' } },
  { stage: 'Computer vision', when: '2026', where: 'Jio Institute · AiSpry', note: 'Zone intrusion detection and driver drowsiness detection.', evidence: { label: 'AI Surveillance', href: '#ai-surveillance' } },
  { stage: 'Speech', when: '2026', where: 'AiSpry', note: 'Benchmarking, denoising and ensembling speech models on noisy audio.', evidence: { label: 'Speech recognition', href: '#speech-recognition' } },
  { stage: 'Generative AI', when: '2026', where: 'Jio Institute', note: 'LLM pipelines for classification, summaries and extraction.', evidence: { label: 'More work', href: '#more-work' } },
  { stage: 'RAG', when: '2026', where: 'Jio Institute', note: 'Grounded answers from official documents, with citations.', evidence: { label: 'KnowYourRules', href: '#knowyourrules' } },
  { stage: 'AI agents', when: 'Next', where: '', note: 'First steps with LangGraph. This is where I’m heading.', evidence: null },
] as const

export const experience = [
  {
    role: 'Associate Data Scientist (internship)',
    org: 'AiSpry',
    when: 'Oct 2026 – Dec 2026',
    points: ['Speech recognition for noisy, multilingual railway audio.', 'Driver drowsiness detection from cab video.'],
  },
  {
    role: 'PG Program in AI & Data Science',
    org: 'Jio Institute',
    when: 'Apr 2026 – Apr 2027',
    points: ['Machine learning, generative AI and RAG coursework and team projects, including KnowYourRules and AI Surveillance.'],
  },
  {
    role: 'Data Developer',
    org: 'Tata Consultancy Services',
    when: 'Sep 2023 – Apr 2026',
    points: [
      'Configured billing rules, rate plans and system parameters for a Kenan billing migration of 2M+ customer records.',
      'Built pre-migration scripts for bulk call-record (CDR) loads, improving processing speed by 25%.',
      'Engineered financial-feed field mappings that reduced data-flow errors for downstream teams.',
      'Automated a billing charge-inventory report, cutting manual validation time by 40%.',
      'Star of the Month, TCS project excellence award (2024).',
    ],
  },
  {
    role: 'Full Stack Developer program',
    org: 'TalentSprint',
    when: 'Mar 2023 – Sep 2023',
    points: ['200+ hour program in Python, Django and web development, where Ez-Learn started.'],
  },
  {
    role: 'B.Tech, Computer Science & Engineering',
    org: 'B.V. Raju Institute of Technology',
    when: 'Graduated 2022',
    points: ['CGPA 8.17 / 10.'],
  },
] as const

export const certifications = ['SQL (Advanced), HackerRank, 2023', 'Full Stack Developer (Python), TalentSprint, 2023']

export const skills = [
  { group: 'Languages & data', items: ['Python', 'SQL', 'PL/SQL', 'Shell', 'Oracle', 'PostgreSQL'] },
  { group: 'ML & vision', items: ['scikit-learn', 'PyTorch', 'YOLOv8', 'OpenCV', 'MediaPipe'] },
  { group: 'LLMs & RAG', items: ['LangChain', 'LangGraph', 'Chroma', 'Ollama', 'Groq', 'Hugging Face'] },
  { group: 'Apps & tools', items: ['Django', 'FastAPI', 'Gradio', 'Git', 'Power BI'] },
] as const
