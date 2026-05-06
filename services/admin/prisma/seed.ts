import 'dotenv/config'
import { prisma } from '../src/config/prisma'
import { Role, Status, JobStatus, BudgetType } from '@prisma/client';

// const generateId = () => crypto.randomUUID();

const mockUsers = [
	{ email: 'nyx@leetconnect.io', username: 'nyx.exe', firstname: 'Nyx', lastname: 'Void', role: Role.ADMIN, status: Status.active },
	{ email: 'blackice@leetconnect.io', username: 'black_ice', firstname: 'Black', lastname: 'ICE', role: Role.ADMIN, status: Status.active },
	{ email: 'ghostwire@leetconnect.io', username: 'ghostwire', firstname: 'Ghost', lastname: 'Wire', role: Role.MODERATOR, status: Status.active },
	{ email: 'cipherpunk@leetconnect.io', username: 'cipher.punk', firstname: 'Cipher', lastname: 'Punk', role: Role.USER, status: Status.active },
	{ email: 'neonviper@leetconnect.io', username: 'neon_viper', firstname: 'Neon', lastname: 'Viper', role: Role.MODERATOR, status: Status.active },
	{ email: 'zerocool@leetconnect.io', username: 'zero.cool', firstname: 'Zero', lastname: 'Cool', role: Role.USER, status: Status.pending },
	{ email: 'darkmatter@leetconnect.io', username: 'dark.matter', firstname: 'Dark', lastname: 'Matter', role: Role.MODERATOR, status: Status.active },
	{ email: 'voidrunner@leetconnect.io', username: 'void_runner', firstname: 'Void', lastname: 'Runner', role: Role.USER, status: Status.active },
	{ email: 'cryptshade@leetconnect.io', username: 'cryptshade', firstname: 'Crypt', lastname: 'Shade', role: Role.USER, status: Status.active },
	{ email: 'glitchcore@leetconnect.io', username: 'glitch.core', firstname: 'Glitch', lastname: 'Core', role: Role.MODERATOR, status: Status.active },
	{ email: 'hexreaper@leetconnect.io', username: 'hex_reaper', firstname: 'Hex', lastname: 'Reaper', role: Role.USER, status: Status.active },
	{ email: 'bitphantom@leetconnect.io', username: 'bit.phantom', firstname: 'Bit', lastname: 'Phantom', role: Role.USER, status: Status.pending },
	{ email: 'neurohack@leetconnect.io', username: 'neuro_hack', firstname: 'Neuro', lastname: 'Hack', role: Role.USER, status: Status.suspended },
	{ email: 'datashard@leetconnect.io', username: 'data.shard', firstname: 'Data', lastname: 'Shard', role: Role.USER, status: Status.active },
	{ email: 'silentshell@leetconnect.io', username: 'silent.shell', firstname: 'Silent', lastname: 'Shell', role: Role.USER, status: Status.pending },
	{ email: 'overclock@leetconnect.io', username: 'over.clock', firstname: 'Over', lastname: 'Clock', role: Role.MODERATOR, status: Status.active },
	{ email: 'specter@leetconnect.io', username: 'specter404', firstname: 'Specter', lastname: 'Null', role: Role.USER, status: Status.active },
	{ email: 'quantumflux@leetconnect.io', username: 'quantum.flux', firstname: 'Quantum', lastname: 'Flux', role: Role.USER, status: Status.active },
	{ email: 'blacknode@leetconnect.io', username: 'black.node', firstname: 'Black', lastname: 'Node', role: Role.USER, status: Status.active },
	{ email: 'cyberwraith@leetconnect.io', username: 'cyber.wraith', firstname: 'Cyber', lastname: 'Wraith', role: Role.USER, status: Status.active },
	{ email: 'zerotrace@leetconnect.io', username: 'zero.trace', firstname: 'Zero', lastname: 'Trace', role: Role.MODERATOR, status: Status.active },
	{ email: 'darknet@leetconnect.io', username: 'darknet.ghost', firstname: 'Darknet', lastname: 'Ghost', role: Role.USER, status: Status.pending },
	{ email: 'pulsecode@leetconnect.io', username: 'pulse.code', firstname: 'Pulse', lastname: 'Code', role: Role.USER, status: Status.active },
];

const MOCK_JOBS = [
  {
    title: 'Senior React Developer for SaaS Dashboard',
    category: 'Frontend Dev',
    budget: 3500,
    budgetType: BudgetType.fixed,
    status: JobStatus.active,
    proposals: 12,
    postedByName: 'Nyx.exe',
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
    postedByName: 'black_ice',
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
    postedByName: 'ghostwire',
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
    postedByName: 'cipher.punk',
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
    postedByName: 'neon_viper',
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
    postedByName: 'dark.matter',
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
    postedByName: 'void_runner',
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
    postedByName: 'cryptshade',
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
    postedByName: 'glitch.core',
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
    postedByName: 'hex_reaper',
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