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
  /** The one-line hero statement. Each clause is one of the projects below (KYR, AI Surveillance, speech). */
  tagline: ['I build AI that', 'reads the rules,', 'watches the zone', 'and listens through the noise.'],
  now: 'Associate Data Scientist intern at AiSpry',
  /** The areas I'm aiming at, shown under the tagline. */
  roles: ['Applied AI / ML', 'Speech AI', 'NLP', 'Generative AI'],
  /** Where I am and where I've been, in one glance. Dates match `education` and `chapters`. */
  affiliations: [
    { org: 'Jio Institute', what: 'PG Programme in AI & DS' },
    { org: 'AiSpry', what: 'Associate Data Scientist Intern' },
    { org: 'TCS', what: '2.5 years of experience' },
  ],
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
  /** One line: what I personally did. */
  contribution: string
  built: string
  evidence: string
  tools: string[]
  links: Link[]
  /** Shown instead of links when the work can't be public. */
  privateNote?: string
  /** Illustration basename in /images/projects (with a -dark variant). Illustrative, not a screenshot. */
  cover: string
  /** A drawn diagram of how the project works, shown instead of the cover. Illustrative, not live. */
  visual?: 'rag' | 'cv' | 'speech' | 'learn'
  /** The expandable case study under the card. Only facts that are backed up; say so when nothing is measured. */
  caseStudy: CaseStudy
  /** A related experiment in the Lab section. */
  lab?: { label: string; href: string }
}

/**
 * Homepage order: the current internship work first (Railway speech AI), then KnowYourRules and
 * AI Surveillance, with Ez-Learn (full-stack, older) last.
 */
export const projects: Project[] = [
  {
    id: 'speech-recognition',
    title: 'Railway speech recognition',
    subtitle: 'Transcribing noisy, multilingual railway audio',
    context: 'AiSpry · internship · Oct 2026 – Present',
    status: { label: 'In progress · evaluation pending', tone: 'progress' },
    problem: 'Railway audio recordings are noisy and multilingual, and off-the-shelf speech models struggle with them.',
    contribution: 'Built the local pipeline and fine-tuned Indic-Conformer on noisy railway audio.',
    built:
      'A fully local speech-recognition pipeline. I tested denoising methods (spectral, RNNoise, DeepFilterNet) and silence- and voice-based segmentation, benchmarked Indic-Conformer, Qwen3-ASR and Whisper, and merged their outputs with a word-level ensemble, all within tight compute and disk limits.',
    evidence: 'Variants are scored on word and character error rate. Indic-Conformer fine-tuning is complete; the fine-tuned model’s WER and CER haven’t been measured yet.',
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
      mine: ['Built the fully local pipeline during the internship, within tight compute and disk limits.', 'Fine-tuned Indic-Conformer on noisy railway audio.'],
      evaluation: 'The fine-tuned model’s WER and CER haven’t been measured yet. The project is company work, and its code, audio and results aren’t public.',
      limitations: ['Company project: the code, audio and results aren’t public.', 'Fine-tuning is complete, but the fine-tuned model hasn’t been evaluated yet.'],
    },
    links: [],
    privateNote: 'Company project: code and data aren’t public.',
  },
  {
    id: 'knowyourrules',
    title: 'KnowYourRules',
    subtitle: 'Telangana motor-vehicle law assistant, grounded in official sources',
    context: 'Jio Institute · started as a team project · Sep – Nov 2026',
    status: { label: 'Private preview', tone: 'progress' },
    problem: 'Telangana’s motor-vehicle rules are spread across the Central Act, state rules and government orders, and a chatbot that guesses can mislead.',
    contribution: 'Built the Telangana-only assistant: retrieval, answer validator and provider fallback. It began as a team project.',
    built:
      'A Telangana-only RAG assistant. Hybrid retrieval (provision lookup, BM25 and vector search) feeds a model whose cited claims are checked by a validator. If the approved sources don’t support an answer, or the question asks for fines or penalties, it declines instead of guessing.',
    evidence: 'Tried on a private Vercel Preview on 17 Nov 2026: 39 basic questions, 17 declined for lack of support. The sources are approved on the owner’s statement, not a legal review, so this is not legal advice.',
    tools: ['Python', 'FastAPI', 'LangChain', 'Chroma', 'Ollama', 'Groq', 'Vercel'],
    cover: 'knowyourrules',
    visual: 'rag',
    lab: { label: 'Step through the pipeline', href: '#lab-rag' },
    caseStudy: {
      steps: [
        { name: 'Sources', detail: 'The Telangana Motor Vehicles Rules, the Taxation Rules and Telangana government orders, plus a few Central provisions that stay labelled Central: an extract of the Motor Vehicles Act, 1988 and the 2017 Driving Regulations with their 2020 amendment. The Central Motor Vehicles Rules, 1989 are not indexed, because the only copy found is out of date. Other states get a “not covered” reply.' },
        { name: 'Index', detail: 'Each section or rule becomes one chunk (long ones are split), embedded with nomic-embed-text into Chroma. Every cited passage has to trace back to one source file by its SHA-256 hash.' },
        { name: 'Approve', detail: 'A source is served only if a lifecycle registry lists it as approved and active and its hash matches the indexed file. If the registry or the index changes, answers stop until it is revalidated.' },
        { name: 'Retrieve', detail: 'Exact provision lookups, BM25 and vector search run together and are merged by reciprocal rank fusion. The vector search is exact rather than Chroma’s approximate index, which returned different results from identical copies of the same index.' },
        { name: 'Answer', detail: 'The model returns short claims, each tied to the passages it cites. A validator checks the format, citations, identifiers and penalty wording, plus checks for changed negations, qualifiers and numbers, with at most one conflict-aware retry. An answer that fails is withheld.' },
        { name: 'Fallback', detail: 'Groq (gpt-oss-120b) answers first, then Cerebras, then Gemini; local Ollama is for development only. Only transport failures such as quota or outages move to the next provider. A refusal is never re-asked, and if every provider fails the app says it is unavailable.' },
        { name: 'Decline', detail: 'Questions about fines, penalties or compounding are refused in code. A separate lookup of amounts shown on the Telangana Police e-Challan website exists, switched off by default and labelled as the website’s own figures.' },
      ],
      mine: ['The Telangana-only assistant in my own repository, from Oct 2026: the indexing profile and Telangana ingestion, hybrid and exact retrieval, the answer validator, the document lifecycle and release gates, provider fallback, and the Vercel Preview setup.'],
      team: 'It began as a Jio Institute team project in Sep 2026. A teammate’s commits cover the government-source research, the document extraction script and the first README.',
      evaluation: 'Tested on synthetic material, not on legal accuracy. The repository has an offline test suite of over 100 test files, and an answer-quality check of 94 synthetic cases that tests the validator, not the law. A retrieval benchmark on an invented legal corpus (72 queries) found the chosen chunking slightly ahead of the baseline, but not statistically significant, and keyword and hybrid retrieval gave no gain there. A 108-question Telangana retrieval benchmark exists, but its labels are machine-made and awaiting human review. On the private Vercel Preview run of 17 Nov 2026, 39 basic questions gave 10 answers, 17 declines, 3 restricted replies and 9 failures from provider quota or transport errors. Fixes made afterwards were tested locally, and I found no re-run on the preview in the repository.',
      limitations: [
        'Telangana only, plus selected Central provisions. Details the Central Motor Vehicles Rules, 1989 prescribe, such as forms, fees and test procedure, are not answered.',
        'All 23 source versions are active on the project owner’s statement that legal review was completed. No reviewer name or signature is on file, and the texts stay unverified, so answers carry a warning and the app shows “Pending counsel”.',
        'It is not a legal-advice system. Fine, penalty and compounding questions are blocked, and answers go no further than the approved text.',
        'The preview declined 17 of 39 basic questions. The causes include over-cautious model refusals, strict validator rules, retrieval misses and missing sources. Some were fixed afterwards.',
        'Hindi and Hinglish questions retrieved poorly in the synthetic benchmark, and no multilingual embedding model was tested.',
        'The only deployment on record is a private Vercel Preview, and there is no public demo link. The Render and GitHub Pages files are deployment templates; I found no record that they were run.',
      ],
    },
    links: [
      { label: 'Repository', href: 'https://github.com/Vukkisa/KnowYourRules' },
      { label: 'Approval and trust model', href: 'https://github.com/Vukkisa/KnowYourRules/blob/feature/telangana-assistant/docs/approval-trust-model.md' },
      { label: 'Answer-quality report', href: 'https://github.com/Vukkisa/KnowYourRules/blob/feature/telangana-assistant/eval/answer-quality/REPORT.md' },
    ],
  },
  {
    id: 'ai-surveillance',
    title: 'AI Surveillance',
    subtitle: 'Restricted-zone intrusion detection',
    context: 'Jio Institute · coursework · 2026',
    status: { label: 'Complete', tone: 'done' },
    problem: 'Guarding a restricted area shouldn’t depend on someone watching a screen all day.',
    contribution: 'Built the tool as coursework and packaged it as an installable command-line tool.',
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
    id: 'ez-learn',
    title: 'Ez-Learn',
    subtitle: 'Full-stack learning platform',
    context: 'TalentSprint · 2023, updated 2025',
    status: { label: 'Live demo', tone: 'live' },
    problem: 'Learners need one place to sign up, pay, study, take quizzes and earn a certificate, and instructors need a way to run their courses.',
    contribution: 'Built it in the TalentSprint program, then updated it and deployed it on Render.',
    built:
      'A Django platform. Learners sign up with email OTP, study course content, take scored quizzes and earn certificates. Instructors manage courses and quizzes. Paid courses go through Razorpay with payment verification, on PostgreSQL.',
    evidence: 'Deployed on Render with a public demo.',
    tools: ['Python', 'Django', 'PostgreSQL', 'Razorpay', 'Render'],
    visual: 'learn',
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
    points: ['Started as a team project and grew into a Telangana-only assistant that answers only from approved official documents, with checked citations. Tried on a private preview; not legal advice.'],
  },
  {
    year: 'Oct 2026', station: 5, kind: 'Applications',
    title: 'Associate Data Scientist (internship)', org: 'AiSpry · Oct 2026 – Present',
    points: ['Speech recognition for noisy railway audio: a local speech-recognition setup, with Indic-Conformer fine-tuned for it. The fine-tuned model’s WER and CER haven’t been measured yet.'],
  },
] as const

export const now = [
  { label: 'Now', text: 'Speech recognition for noisy railway audio at AiSpry. Indic-Conformer is fine-tuned; its results aren’t measured yet.' },
  { label: 'Studying', text: 'PG Program in AI & Data Science at Jio Institute, until April 2027.' },
]
