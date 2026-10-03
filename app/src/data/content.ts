/**
 * Every word on the site lives here, so the components stay reusable and the story stays editable.
 *
 * Facts come from Jayanth's brief and his previous portfolio. Lines marked `// DRAFT` are
 * phrasing written for him from that brief: edit them freely, they make no new claims.
 */

export type Status = 'SHIPPED' | 'BUILDING' | 'EXPERIMENT' | 'EXPERIMENTING' | 'LEARNING' | 'ABANDONED'

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

/** The spine of the whole site. */
export const chain = [
  { label: 'SQL', code: 'SELECT customer_id, SUM(amount) FROM invoices GROUP BY 1;' },
  { label: 'Python', code: 'rows = cursor.fetchall()' },
  { label: 'Data Science', code: 'df.groupby("month")["amount"].describe()' },
  { label: 'Machine Learning', code: 'model.fit(X_train, y_train)' },
  { label: 'Computer Vision', code: 'boxes = detector(frame)' },
  { label: 'Deep Learning', code: 'for epoch in range(epochs): train_one_epoch(model)' },
  { label: 'Generative AI', code: 'llm.invoke("explain this in plain words")' },
  { label: 'RAG', code: 'chain = retriever | prompt | llm' },
  { label: 'AI Agents', code: 'agent.run(goal, tools=tools)' },
] as const

export const sections = [
  { id: 'top', path: '~', title: 'Start' },
  { id: 'short-version', path: '~/short-version', title: 'The short version' },
  { id: 'how-i-got-here', path: '~/how-i-got-here', title: 'How I got here' },
  { id: 'builds', path: '~/builds', title: 'Things I build' },
  { id: 'tabs', path: '~/open-tabs', title: 'Too many tabs' },
  { id: 'lab', path: '~/lab', title: 'The lab' },
  { id: 'toolbox', path: '~/toolbox', title: 'Toolbox' },
  { id: 'lessons', path: '~/lessons', title: 'How I think' },
  { id: 'next', path: '~/next', title: "What's next" },
  { id: 'contact', path: '~/contact', title: 'Contact' },
] as const

/* ───────────────────────── short version ───────────────────────── */

export type Segment = string | { term: string; note: string }

// DRAFT: rewritten from the brief.
export const shortVersion: Segment[][] = [
  ['My career started where data lives: databases, ', { term: 'billing systems', note: 'Telecom billing data at TCS: migrations, financial feeds and validation reports. One wrong field is one wrong invoice.' }, ' and enterprise records that had to be right every single time.'],
  ['Somewhere along the way, my questions changed. Less "where is this stored?" and more "what is this data trying to tell us?"'],
  ['So I started learning ', { term: 'machine learning', note: 'Models that learn patterns from examples instead of following hand-written rules.' }, ', ', { term: 'computer vision', note: 'Teaching software to understand images and video. In my case: spotting people in a live camera feed.' }, ', ', { term: 'NLP', note: 'Natural language processing: getting software to work with human text.' }, ' and ', { term: 'generative AI', note: 'Models that produce text, code or images. Useful, and very good at sounding sure of themselves.' }, ', and building things to find out whether I really understood them.'],
  ['Now I build systems that don\'t just store information. They use it.'],
]

export const facts = [
  'Assistant System Engineer · TCS · since Sep 2023',
  'B.Tech, Computer Science · BVRIT · 2022',
  'Hyderabad, India',
]

/* ───────────────────────── evolution ───────────────────────── */

export type Stage = {
  year: string
  title: string
  layer: string
  working: string
  learned: string
  changed: string
  tags: string[]
}

// DRAFT for the "what changed" lines; the facts are from the previous portfolio.
export const evolution: Stage[] = [
  {
    year: '2022', title: 'B.Tech · Computer Science', layer: 'CS',
    working: 'Finishing a B.Tech in Computer Science and Engineering at B.V. Raju Institute of Technology.',
    learned: 'Programming fundamentals, data structures, databases, and how to read an error message without panicking.',
    changed: 'Code stopped being homework and became a way to make things.',
    tags: ['B.Tech CSE', 'CGPA 8.17'],
  },
  {
    year: '2023', title: 'Enterprise software + SQL', layer: 'SQL',
    working: 'An internship at TalentSprint, where I built the first version of Ez-Learn. Then TCS, as an Assistant System Engineer on telecom billing data.',
    learned: 'SQL, Oracle and PL/SQL on real enterprise data: migrations, financial feeds, validation reports. Linux and shell for everything around them.',
    changed: 'Correctness became a reflex. In billing, one wrong field is one wrong invoice.',
    tags: ['SQL', 'Oracle', 'PL/SQL', 'Linux'],
  },
  {
    year: '2024', title: 'Data + backend + automation', layer: 'Backend',
    working: 'Pre-migration and validation scripts at work. On my own time, taking Ez-Learn from prototype to a deployed Django app with payments.',
    learned: 'Django, payment flows, deployment, and scripting away the repetitive parts.',
    changed: 'I started caring less about where data sits and more about what it could do.',
    tags: ['Python', 'Django', 'Shell', 'Render'],
  },
  {
    year: '2025', title: 'Machine Learning + Data Science', layer: 'ML',
    working: 'Experiments with pandas and scikit-learn: forecasting, recommenders, NLP. Then real-time computer vision with YOLOv8.',
    learned: 'Baselines, evaluation, feature work, and the fact that real-time systems are mostly engineering.',
    changed: 'From reporting what happened to predicting what might, and being honest about how wrong I could be.',
    tags: ['scikit-learn', 'YOLOv8', 'OpenCV', 'CUDA'],
  },
  {
    year: '2026', title: 'GenAI + RAG + AI Agents', layer: 'GenAI',
    working: 'KnowYourRules, a RAG assistant over official Indian traffic documents. LLM experiments. First steps with agents.',
    learned: 'Embeddings, vector search, chunking, LangChain LCEL, grounding, and designing for refusal.',
    changed: 'Fluent isn\'t the same as correct. A system that can say "I don\'t know" is worth more than one that guesses.',
    tags: ['LangChain', 'Chroma', 'Ollama', 'Groq'],
  },
  {
    year: 'NEXT', title: 'Build intelligent systems', layer: 'Next',
    working: 'Looking for a team where software, data and AI meet in something people actually use.',
    learned: 'Still to learn: evaluation, agents that act reliably, and AI that survives production.',
    changed: 'From writing software to building systems that use what they know.',
    tags: ['AI/ML', 'GenAI', 'Agents', 'Production'],
  },
]

/* ───────────────────────── projects ───────────────────────── */

export type PipelineNode = { label: string; what: string; decision: string; tech?: string[] }
export type Metric = { value: number; prefix?: string; suffix?: string; label: string }
export type Project = {
  id: 'kyr' | 'cv' | 'ez'
  index: string
  name: string
  kicker: string
  oneLiner: string
  why: string
  stack: string[]
  metrics: Metric[]
  pipelineTitle: string
  pipeline: PipelineNode[]
  learned: string[]
  next: string
  links: { label: string; href: string }[]
}

// DRAFT for the "decision" lines: reconstructed from the brief, worth checking against the real code.
export const projects: Project[] = [
  {
    id: 'kyr', index: '01', name: 'KnowYourRules', kicker: 'RAG · Indian traffic law',
    oneLiner: 'An assistant that answers questions about Indian traffic law only from official government documents, and refuses when the documents don\'t cover the question.',
    why: 'Traffic rules live in long, dense legal documents. Most people get their answers from forwarded messages and half-remembered advice instead. I wanted something that answers from the official text, points to where the answer came from, and admits when the documents don\'t say.',
    stack: ['LangChain LCEL', 'Chroma', 'Ollama', 'nomic-embed-text', 'Groq', 'FastAPI', 'HTML/JavaScript'],
    metrics: [{ value: 400, suffix: '+', label: 'official documents went in' }, { value: 9, label: 'stages from PDF to answer' }],
    pipelineTitle: 'From a pile of PDFs to a grounded answer',
    pipeline: [
      { label: 'Official documents', what: 'Government traffic acts, rules and notifications. More than 400 documents went in.', decision: 'Only official sources. If it isn\'t in these documents, the assistant shouldn\'t claim it.', tech: ['PDF'] },
      { label: 'Extraction', what: 'Text is pulled out of every document.', decision: 'Keep track of which document every passage came from, so an answer can point back to its source.' },
      { label: 'Cleaning', what: 'Headers, footers, page numbers and broken lines are stripped. Not every document deserves to stay.', decision: 'Curate. 400+ documents became a smaller knowledge base, because noise in the corpus turns into noise in the answers.' },
      { label: 'Chunking', what: 'Documents are split into passages small enough to retrieve precisely.', decision: 'A chunk has to be small enough to match one question and big enough to still make sense on its own.' },
      { label: 'Embeddings', what: 'Every chunk becomes a vector using nomic-embed-text, running locally through Ollama.', decision: 'Embeddings run on my machine, so building the index doesn\'t depend on a paid API.', tech: ['Ollama', 'nomic-embed-text'] },
      { label: 'Vector database', what: 'Chroma stores every vector alongside its text and source.', decision: 'Store the source with the text. A citation you didn\'t store is a citation you can never show.', tech: ['Chroma'] },
      { label: 'Retrieval', what: 'The question is embedded the same way, and the closest passages come back.', decision: '"Close" isn\'t the same as "relevant". Retrieval decides the answer before the model ever sees it.' },
      { label: 'LLM', what: 'A Groq-hosted LLM, wired up with LangChain LCEL, writes an answer from the retrieved passages only.', decision: 'The prompt allows exactly two outcomes: answer from the context, or say it isn\'t there.', tech: ['Groq', 'LangChain LCEL'] },
      { label: 'Grounded answer', what: 'An answer tied to official text, served through FastAPI to a plain HTML/JavaScript page. Or a clear refusal.', decision: 'Refusing is a feature. A wrong answer about the law is worse than no answer.', tech: ['FastAPI'] },
    ],
    learned: [
      'Retrieval quality is decided long before the model runs: in extraction, cleaning and chunking.',
      'A good "no" has to be designed, prompted and tested like any other feature.',
    ],
    next: 'An evaluation set: questions it must answer, questions it must refuse, and trick questions that only look answerable.',
    links: [{ label: 'More on GitHub', href: site.github }],
  },
  {
    id: 'cv', index: '02', name: 'Unauthorized Human Detection', kicker: 'Real-time computer vision',
    oneLiner: 'Watches a live camera feed, lets you redraw restricted zones while it runs, and raises an event the moment a person steps into one.',
    why: 'Nobody watches a security feed all day. I wanted a system that does the watching and only speaks up when someone enters a zone they shouldn\'t be in. And it had to be fast enough to keep up with a live stream, not just a recorded clip.',
    stack: ['YOLOv8', 'OpenCV', 'CUDA', 'RTSP', 'Multithreading', 'Python'],
    metrics: [{ value: 35, prefix: '~', label: 'frames per second' }, { value: 24, prefix: '~', suffix: ' ms', label: 'latency per frame' }],
    pipelineTitle: 'From a camera to an alert, in real time',
    pipeline: [
      { label: 'Camera / video', what: 'A webcam, a video file or an RTSP stream from an IP camera.', decision: 'All three sources feed the same pipeline, so nothing downstream cares where a frame came from.', tech: ['RTSP', 'OpenCV'] },
      { label: 'Frame capture', what: 'Frames are read continuously from the source.', decision: 'Capture runs on its own thread, so reading the next frame never waits for detection to finish.', tech: ['Multithreading'] },
      { label: 'YOLO detection', what: 'YOLOv8 finds the people in each frame, on the GPU.', decision: 'CUDA is the difference between real-time and a slideshow.', tech: ['YOLOv8', 'CUDA'] },
      { label: 'Dynamic zones', what: 'Restricted areas are polygons that can be redrawn while the system runs.', decision: 'Zones are data, not code: change the area without restarting the stream.' },
      { label: 'Intersection', what: 'Every detected person is checked against every zone.', decision: 'It\'s geometry: does this person\'s box overlap the zone enough to count?' },
      { label: 'Event trigger', what: 'An overlap becomes an event.', decision: 'An event should mean "someone entered", not "someone was seen again in the next frame".' },
      { label: 'Alert · capture · log', what: 'The event is logged and the moment is captured as images or video.', decision: 'An alert without the frame that caused it is hard to trust.' },
    ],
    learned: [
      'Latency is the feature. A correct detection that arrives late is a wrong one.',
      'The model is a small part of a vision system. Most of the work is I/O, threading and deciding what counts as an event.',
    ],
    next: 'Tracking identities across frames, and a small dashboard for reviewing events.',
    links: [{ label: 'More on GitHub', href: site.github }],
  },
  {
    id: 'ez', index: '03', name: 'Ez-Learn', kicker: 'Full-stack learning platform',
    oneLiner: 'A Django learning platform with a course catalogue, enrolment, payments, progress tracking and an admin panel, deployed on Render.',
    why: 'Online learning often splits videos, payments and progress across different tools. I wanted one place where a student could find a course, pay for it and pick up where they left off. It started as my internship project at TalentSprint and became the first thing I built that strangers could actually use.',
    stack: ['Python', 'Django', 'JavaScript', 'HTML/CSS', 'Database', 'Payment integration', 'Render'],
    metrics: [],
    pipelineTitle: 'One student, one flow',
    pipeline: [
      { label: 'User', what: 'A student browses the catalogue, signs up and enrols.', decision: 'Design around the student\'s next step: find, pay, learn, come back.' },
      { label: 'Django', what: 'Django handles routing, views, authentication and the admin panel.', decision: 'Lean on Django\'s built-ins (auth, ORM, admin) and spend the time on the product instead of plumbing.', tech: ['Django', 'Python'] },
      { label: 'Database', what: 'Users, courses, enrolments and payments live in related tables.', decision: 'Model the relationships first. Most features fall out of a good schema. (The SQL years helped.)', tech: ['Database'] },
      { label: 'Courses', what: 'A dynamic catalogue with course pages and enrolment.', decision: 'Courses are data, so adding one is an admin task, not a code change.' },
      { label: 'Payments', what: 'Students pay through an integrated payment flow.', decision: 'A course unlocks only after the payment is confirmed.', tech: ['Payment integration'] },
      { label: 'Progress tracking', what: 'A dashboard shows each student their courses and progress.', decision: 'Progress is stored per student and per course, so nobody starts over.' },
      { label: 'Deployment', what: 'The whole thing runs on Render.', decision: 'Shipping taught more than building: environment config, static files, migrations.', tech: ['Render'] },
    ],
    learned: [
      'Deploying is part of building, not a step after it.',
      'Payments are mostly about the unhappy paths.',
    ],
    next: 'Tests around the payment flow, and a recommendation module (the architecture was built to take one).',
    links: [
      { label: 'Live app', href: 'https://ez-learn.onrender.com' },
      { label: 'Code on GitHub', href: 'https://github.com/Vukkisa/Ez-Learn' },
    ],
  },
]

/* ───────────────────────── open tabs ───────────────────────── */

// DRAFT: statuses other than RAG, Agents and Computer Vision are a first guess.
export const obsessions: { topic: string; slug: string; status: Status; question: string }[] = [
  { topic: 'RAG', slug: 'rag', status: 'BUILDING', question: 'How do I make an LLM answer from the right information instead of confidently making things up?' },
  { topic: 'LLMs', slug: 'llms', status: 'BUILDING', question: 'What can I trust a model to do on its own, and what needs a guardrail around it?' },
  { topic: 'AI Agents', slug: 'agents', status: 'EXPERIMENTING', question: 'What happens when an LLM gets tools, memory and the ability to act?' },
  { topic: 'Computer Vision', slug: 'computer-vision', status: 'SHIPPED', question: 'Real-time detection isn\'t difficult until you care about latency.' },
  { topic: 'NLP', slug: 'nlp', status: 'EXPERIMENTING', question: 'How far do simple models get with language before sarcasm breaks them?' },
  { topic: 'Machine Learning', slug: 'ml', status: 'LEARNING', question: 'When does a simple baseline beat the clever model? (More often than I expected.)' },
  { topic: 'Time Series', slug: 'time-series', status: 'EXPERIMENTING', question: 'How wrong will this forecast be, and can I say so honestly?' },
  { topic: 'Multimodal AI', slug: 'multimodal', status: 'LEARNING', question: 'When does a model that sees and reads beat one trained to detect a single thing?' },
  { topic: 'AI Evaluation', slug: 'evaluation', status: 'LEARNING', question: 'How do I know it works, beyond "it looked right when I tried it"?' },
  { topic: 'Production AI', slug: 'production', status: 'LEARNING', question: 'What breaks the day after the demo works?' },
]

export const statusMeaning: Record<Status, string> = {
  SHIPPED: 'Real, working, out in the world.',
  BUILDING: 'Something real exists and it\'s growing.',
  EXPERIMENT: 'A question I\'m poking at in code.',
  EXPERIMENTING: 'A question I\'m poking at in code.',
  LEARNING: 'Reading, taking notes, building small things to check.',
  ABANDONED: 'Tried it, learned something, stopped.',
}

/* ───────────────────────── lab ───────────────────────── */

// DRAFT: set each status to the truth. ABANDONED is supported, use it where it applies.
export const lab: { name: string; status: Status; idea: string; question: string; link?: string }[] = [
  { name: 'Unauthorized Human Detection', status: 'SHIPPED', idea: 'Graduated from the lab.', question: 'Left the lab. The full story is up in Things I build.', link: '#cv' },
  { name: 'Ez-Learn', status: 'SHIPPED', idea: 'Graduated from the lab. Live on Render.', question: 'Left the lab. The full story is up in Things I build.', link: '#ez' },
  { name: 'KnowYourRules', status: 'BUILDING', idea: 'Works. Not finished: it needs an evaluation set.', question: 'Half in, half out. The full story is up in Things I build.', link: '#kyr' },
  { name: 'AI Playground', status: 'BUILDING', idea: 'A place to try prompts, models and small AI tools side by side.', question: 'What\'s the fastest way to compare two approaches on the same input?' },
  { name: 'AI Travel Guide', status: 'EXPERIMENT', idea: 'An LLM that turns a few preferences into a trip plan.', question: 'Can it plan around real constraints like time and budget, not just list famous places?' },
  { name: 'NLP experiments', status: 'EXPERIMENT', idea: 'Text classification, sentiment, and the limits of simple models.', question: 'How far does a simple model get before sarcasm breaks it?' },
  { name: 'Time-series forecasting', status: 'EXPERIMENT', idea: 'Forecasts with trend and seasonality, measured against honest baselines.', question: 'Does the clever model actually beat "same as last year"?' },
  { name: 'Recommendation systems', status: 'EXPERIMENT', idea: 'Content-based and similarity-based recommenders.', question: 'How do you recommend something to someone you know almost nothing about?' },
  { name: 'Computer vision experiments', status: 'EXPERIMENT', idea: 'Small detection and image experiments beyond the main project.', question: 'What changes when the camera, the light or the angle changes?' },
  { name: 'LLM experiments', status: 'LEARNING', idea: 'Prompting, local models through Ollama, fast inference through Groq.', question: 'When is a small local model good enough?' },
]

/* ───────────────────────── toolbox ───────────────────────── */

export const toolbox: { verb: string; blurb: string; tools: { name: string; usedIn?: string[] }[] }[] = [
  { verb: 'BUILD', blurb: 'The languages I think in.', tools: [
    { name: 'Python', usedIn: ['KnowYourRules', 'Human Detection', 'Ez-Learn'] },
    { name: 'SQL', usedIn: ['Enterprise data work at TCS'] },
    { name: 'JavaScript', usedIn: ['KnowYourRules', 'Ez-Learn'] },
  ] },
  { verb: 'THINK', blurb: 'Making sense of data before modelling it.', tools: [
    { name: 'Pandas', usedIn: ['The lab'] }, { name: 'NumPy', usedIn: ['The lab'] },
    { name: 'Scikit-learn', usedIn: ['The lab'] }, { name: 'Statistics', usedIn: ['Everything above'] },
  ] },
  { verb: 'SEE', blurb: 'Software that looks at the world.', tools: [
    { name: 'OpenCV', usedIn: ['Human Detection'] }, { name: 'YOLO', usedIn: ['Human Detection'] },
    { name: 'Computer Vision', usedIn: ['Human Detection', 'The lab'] },
  ] },
  { verb: 'GENERATE', blurb: 'Models that write, retrieve and act.', tools: [
    { name: 'LLMs', usedIn: ['KnowYourRules', 'The lab'] }, { name: 'RAG', usedIn: ['KnowYourRules'] },
    { name: 'Embeddings', usedIn: ['KnowYourRules'] }, { name: 'Vector Databases', usedIn: ['KnowYourRules'] },
    { name: 'LangChain', usedIn: ['KnowYourRules'] }, { name: 'AI Agents', usedIn: ['The lab'] },
  ] },
  { verb: 'SERVE', blurb: 'Putting it behind something other people can call.', tools: [
    { name: 'FastAPI', usedIn: ['KnowYourRules'] }, { name: 'Django', usedIn: ['Ez-Learn'] },
    { name: 'REST APIs', usedIn: ['KnowYourRules'] },
  ] },
  { verb: 'SHIP', blurb: 'Getting it off my laptop.', tools: [
    { name: 'Git', usedIn: ['Every project'] }, { name: 'Linux', usedIn: ['Enterprise data work at TCS'] },
    { name: 'Docker' }, { name: 'Cloud deployment', usedIn: ['Ez-Learn on Render'] },
  ] },
]

/* ───────────────────────── lessons ───────────────────────── */

// DRAFT: written from the projects above.
export const lessons: { text: string; detail: string; from: string }[] = [
  { text: 'Don\'t start with the model. Start with the problem.', detail: 'The interesting decisions in KnowYourRules weren\'t about which LLM to call. They were about what the system should refuse to answer.', from: 'KnowYourRules' },
  { text: 'Retrieval quality can matter more than model size.', detail: 'If the right passage never reaches the prompt, a bigger model just sounds more convincing while it\'s wrong.', from: 'KnowYourRules' },
  { text: 'A project isn\'t finished when the notebook runs.', detail: 'Serving it, deploying it and watching it meet someone else\'s input is where it starts being real.', from: 'Ez-Learn' },
  { text: 'In real-time systems, latency is a feature.', detail: 'At a live camera feed, a detection that arrives late is a wrong detection.', from: 'Human Detection' },
  { text: 'Knowing SQL changes how you think about data.', detail: 'Before I ask which model to use, I ask where a number came from, what a row represents, and what a join might be quietly duplicating.', from: 'TCS' },
  { text: '"I don\'t know" is a design decision.', detail: 'It doesn\'t happen by default. You have to build the path where the system admits it, and test it.', from: 'KnowYourRules' },
]

/* ───────────────────────── next ───────────────────────── */

export const nextUp = {
  statement: [
    'I\'m looking for work where software engineering, data, machine learning and generative AI meet, and where the goal is a useful system rather than an impressive demo.',
    'I bring the habits of someone who learned on enterprise data, where correctness wasn\'t optional, and the curiosity of someone who still opens too many tabs.',
  ],
  directions: ['AI / ML', 'Data Science', 'Generative AI', 'AI Agents', 'Production AI systems'],
}
