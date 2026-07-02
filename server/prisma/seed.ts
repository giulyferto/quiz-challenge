import bcrypt from 'bcryptjs'
import { prisma } from '../src/lib/prisma.js'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@quiz.local'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'Admin123!'
const ADMIN_NAME = process.env.ADMIN_NAME ?? 'Admin'

const sampleQuiz = {
  id: 'agent-fundamentals',
  title: 'Agent Fundamentals',
  description: 'Test your knowledge of AI agent design and implementation',
  questions: [
    {
      question: 'What is the primary purpose of an AI agent?',
      options: [
        'To replace human workers',
        'To autonomously perform tasks and make decisions',
        'To store large amounts of data',
        'To create visual interfaces',
      ],
      correctAnswer: 1,
      explanation:
        'AI agents are designed to autonomously perform tasks and make decisions based on their environment and goals.',
    },
    {
      question: 'Which component is essential for an AI agent to learn from experience?',
      options: [
        'A graphical user interface',
        'A feedback mechanism',
        'A database connection',
        'A payment processor',
      ],
      correctAnswer: 1,
      explanation: 'A feedback mechanism allows agents to learn from their actions and improve over time.',
    },
    {
      question: "What is 'context window' in relation to AI models?",
      options: [
        'The browser window where AI runs',
        'The maximum amount of text a model can process at once',
        'The time period for model training',
        'The user interface for model configuration',
      ],
      correctAnswer: 1,
      explanation:
        'The context window defines how much information an AI model can consider in a single interaction.',
    },
    {
      question: 'Which strategy helps manage limited context windows?',
      options: [
        'Adding more servers',
        'Using larger fonts',
        'Summarization and chunking',
        'Increasing screen resolution',
      ],
      correctAnswer: 2,
      explanation: 'Summarization and chunking help fit relevant information within context limits.',
    },
    {
      question: "What is 'prompt engineering'?",
      options: [
        'Building physical AI hardware',
        'Designing effective instructions for AI models',
        'Creating user interfaces',
        'Managing cloud infrastructure',
      ],
      correctAnswer: 1,
      explanation:
        'Prompt engineering is the practice of designing and optimizing inputs to get desired outputs from AI models.',
    },
  ],
}

async function main() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10)
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      email: ADMIN_EMAIL,
      passwordHash,
      name: ADMIN_NAME,
      role: 'ADMIN',
    },
  })
  console.log(`Admin user ready: ${admin.email}`)

  const category = await prisma.category.upsert({
    where: { name: 'Artificial Intelligence' },
    update: {},
    create: {
      name: 'Artificial Intelligence',
      description: 'Quizzes about AI concepts, agents, and models',
    },
  })
  console.log(`Category ready: ${category.name}`)

  await prisma.quiz.upsert({
    where: { id: sampleQuiz.id },
    update: {},
    create: {
      id: sampleQuiz.id,
      title: sampleQuiz.title,
      description: sampleQuiz.description,
      categoryId: category.id,
      questions: {
        create: sampleQuiz.questions.map((q, i) => ({
          text: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          order: i,
        })),
      },
    },
  })
  console.log(`Quiz ready: ${sampleQuiz.title}`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
