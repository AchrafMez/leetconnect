import 'dotenv/config'
import { prisma } from '../src/config/prisma'
import { Role, Status, JobStatus, BudgetType } from '@prisma/client';

// const generateId = () => crypto.randomUUID();

const mockUsers = [
	{ email: 'admin@leetconnect.io', username: 'abdelali', firstname: 'Abdelali', lastname: 'Mahfoudi', role: Role.ADMIN, status: Status.active, avatar: 'AB' },
	{ email: 'ronaldo@leetconnect.io', username: 'ronaldo', firstname: 'Cristiano', lastname: 'Ronaldo', role: Role.ADMIN, status: Status.active, avatar: 'CR' },
	{ email: 'messi@leetconnect.io', username: 'messi', firstname: 'Lionel', lastname: 'Messi', role: Role.MODERATOR, status: Status.active, avatar: 'LM' },
	{ email: 'mbappe@leetconnect.io', username: 'mbappe', firstname: 'Kylian', lastname: 'Mbappé', role: Role.USER, status: Status.active, avatar: 'KM' },
	{ email: 'kdb@leetconnect.io', username: 'kdb', firstname: 'Kevin', lastname: 'De Bruyne', role: Role.MODERATOR, status: Status.active, avatar: 'KB' },
	{ email: 'osimhen@leetconnect.io', username: 'osimhen', firstname: 'Victor', lastname: 'Osimhen', role: Role.USER, status: Status.pending, avatar: 'VO' },
	{ email: 'hakimi@leetconnect.io', username: 'hakimi', firstname: 'Achraf', lastname: 'Hakimi', role: Role.MODERATOR, status: Status.active, avatar: 'AH' },
	{ email: 'haaland@leetconnect.io', username: 'haaland', firstname: 'Erling', lastname: 'Haaland', role: Role.USER, status: Status.active, avatar: 'EH' },
	{ email: 'neymar@leetconnect.io', username: 'neymar', firstname: 'Neymar', lastname: 'Jr', role: Role.USER, status: Status.active, avatar: 'NJ' },
	{ email: 'salah@leetconnect.io', username: 'salah', firstname: 'Mohamed', lastname: 'Salah', role: Role.MODERATOR, status: Status.active, avatar: 'MS' },
	{ email: 'modric@leetconnect.io', username: 'modric', firstname: 'Luka', lastname: 'Modrić', role: Role.USER, status: Status.active, avatar: 'LM' },
	{ email: 'benzema@leetconnect.io', username: 'benzema', firstname: 'Karim', lastname: 'Benzema', role: Role.USER, status: Status.pending, avatar: 'KB' },
	{ email: 'vinicius@leetconnect.io', username: 'vinicius', firstname: 'Vinícius', lastname: 'Jr', role: Role.USER, status: Status.suspended, avatar: 'VJ' },
	{ email: 'bellingham@leetconnect.io', username: 'bellingham', firstname: 'Jude', lastname: 'Bellingham', role: Role.USER, status: Status.active, avatar: 'JB' },
	{ email: 'pedri@leetconnect.io', username: 'pedri', firstname: 'Pedri', lastname: 'González', role: Role.USER, status: Status.pending, avatar: 'PG' },
	{ email: 'lewa@leetconnect.io', username: 'lewa', firstname: 'Robert', lastname: 'Lewandowski', role: Role.MODERATOR, status: Status.active, avatar: 'RL' },
	{ email: 'kane@leetconnect.io', username: 'kane', firstname: 'Harry', lastname: 'Kane', role: Role.USER, status: Status.active, avatar: 'HK' },
	{ email: 'son@leetconnect.io', username: 'son', firstname: 'Heung-min', lastname: 'Son', role: Role.USER, status: Status.active, avatar: 'HS' },
	{ email: 'saka@leetconnect.io', username: 'saka', firstname: 'Bukayo', lastname: 'Saka', role: Role.USER, status: Status.active, avatar: 'BS' },
	{ email: 'foden@leetconnect.io', username: 'foden', firstname: 'Phil', lastname: 'Foden', role: Role.USER, status: Status.active, avatar: 'PF' },
	{ email: 'rodri@leetconnect.io', username: 'rodri', firstname: 'Rodri', lastname: 'Hernández', role: Role.MODERATOR, status: Status.active, avatar: 'RH' },
	{ email: 'griezmann@leetconnect.io', username: 'griezmann', firstname: 'Antoine', lastname: 'Griezmann', role: Role.USER, status: Status.pending, avatar: 'AG' },
	{ email: 'dembele@leetconnect.io', username: 'dembele', firstname: 'Ousmane', lastname: 'Dembélé', role: Role.USER, status: Status.active, avatar: 'OD' },
];

const MOCK_JOBS = [
  {
    title: 'Senior React Developer for SaaS Dashboard',
    category: 'Frontend Dev',
    budget: 3500,
    budgetType: BudgetType.fixed,
    status: JobStatus.active,
    proposals: 12,
    postedByName: 'Lionel Messi',
    deadline: new Date('2024-06-01'),
    description: 'Looking for an experienced React developer...',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Recharts'],
  },
  {
    title: 'Node.js Backend API for E-commerce Platform',
    category: 'Backend Dev',
    budget: 85,
    budgetType: BudgetType.hourly,
    status: JobStatus.active,
    proposals: 7,
    postedByName: 'Kylian Mbappé',
    deadline: new Date('2024-07-01'),
    description: 'Need a Node.js expert...',
    skills: ['Node.js', 'Express', 'PostgreSQL', 'Redis', 'Stripe'],
  },
  {
    title: 'Mobile App UI/UX Redesign (iOS & Android)',
    category: 'UI/UX Design',
    budget: 2200,
    budgetType: BudgetType.fixed,
    status: JobStatus.flagged,
    proposals: 3,
    postedByName: 'Cristiano Ronaldo',
    deadline: new Date('2024-05-30'),
    description: 'Complete redesign...',
    skills: ['Figma', 'iOS', 'Android', 'Prototyping', 'Design Systems'],
  },
  {
    title: 'DevOps Engineer — CI/CD Pipeline Setup',
    category: 'DevOps',
    budget: 120,
    budgetType: BudgetType.hourly,
    status: JobStatus.active,
    proposals: 5,
    postedByName: 'Kevin De Bruyne',
    deadline: new Date('2036-07-10'),
    description: 'Set up GitHub Actions...',
    skills: ['Docker', 'Kubernetes', 'GitHub Actions', 'AWS', 'Terraform'],
  },
  {
    title: 'Full Stack Next.js App with Supabase',
    category: 'Full Stack',
    budget: 5000,
    budgetType: BudgetType.fixed,
    status: JobStatus.active,
    proposals: 19,
    postedByName: 'Neymar Jr',
    deadline: new Date('2024-08-01'),
    description: 'Build a full-stack web application...',
    skills: ['Next.js', 'Supabase', 'TypeScript', 'Stripe', 'Tailwind CSS'],
  },
  {
    title: 'Python Data Pipeline & Dashboard',
    category: 'Data Science',
    budget: 4500,
    budgetType: BudgetType.fixed,
    status: JobStatus.closed,
    proposals: 8,
    postedByName: 'Mohamed Salah',
    deadline: new Date('2024-05-15'),
    description: 'Completed project...',
    skills: ['Python', 'Airflow', 'BigQuery', 'Pandas', 'Metabase'],
  },
  {
    title: 'React Native Fitness Tracking App',
    category: 'Mobile Dev',
    budget: 6000,
    budgetType: BudgetType.fixed,
    status: JobStatus.active,
    proposals: 0,
    postedByName: 'Erling Haaland',
    deadline: new Date('2024-05-15'),
    description: 'Fitness app with workout tracking...',
    skills: ['React Native', 'Expo', 'HealthKit', 'Firebase'],
  },
  {
    title: 'WordPress to Headless CMS Migration',
    category: 'Full Stack',
    budget: 2800,
    budgetType: BudgetType.fixed,
    status: JobStatus.active,
    proposals: 4,
    postedByName: 'Vinícius Jr',
    deadline: new Date('2024-05-15'),
    description: 'Migrate existing WordPress site...',
    skills: ['Next.js', 'Contentful', 'WordPress', 'SEO', 'GraphQL'],
  },
  {
    title: 'QA Automation Framework — Playwright',
    category: 'QA & Testing',
    budget: 60,
    budgetType: BudgetType.hourly,
    status: JobStatus.flagged,
    proposals: 2,
    postedByName: 'Luka Modrić',
    description: 'Flagged for duplicate posting...',
    skills: ['Playwright', 'TypeScript', 'CI/CD', 'Testing'],
  },
  {
    title: 'Technical Blog Content Writer (SaaS)',
    category: 'Content Writing',
    budget: 150,
    budgetType: BudgetType.fixed,
    status: JobStatus.active,
    proposals: 31,
    postedByName: 'Jude Bellingham',
    description: 'Write 4 technical blog posts...',
    skills: ['Technical Writing', 'SEO', 'Markdown', 'SaaS'],
  },
];

async function main() {
  // 1. Clean the database
  // Removed 'RESTART IDENTITY' because UUIDs don't have sequences to reset
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "Job", "User" CASCADE;`
  );

  // 2. Seed Users
  for (const user of mockUsers) {
    await prisma.user.create({ data: user });
    console.log(`Created User: ${user.username}`);
  }

  // 3. Fetch users to get their generated UUIDs
  const users = await prisma.user.findMany();

  const normalize = (name: string) => name.toLowerCase().trim();

  // Mapping full names to the new UUID strings
  const userMap = Object.fromEntries(
    users.map(user => [
      normalize(`${user.firstname} ${user.lastname}`), 
      user.id,
    ])
  );

  for (const job of MOCK_JOBS) {
    const clientId = userMap[normalize(job.postedByName)] || users[0]!.id;

    await prisma.job.create({
      data: {
        ...job,
        clientId,
      },
    });

    console.log(`Created job: ${job.title}`);
  }

  console.log('✅ Seeded Successfully with UUIDs');
}

main()
	.catch((err) => {
		console.error(err);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});