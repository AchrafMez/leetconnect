// Seed script for auth_db, chat_db, admin_db, analytics_db and market_db
// Run: docker cp scripts/seed.js auth:/tmp/seed.js && docker exec auth node /tmp/seed.js
// Mints 5 users (eve = ADMIN) with chat + marketplace mock data, mirrored to admin/analytics shadow tables.

const { Client } = require('pg');
const bcrypt = require('bcryptjs');

// ── Users ──────────────────────────────────────────────
// role: ADMIN | USER | MODERATOR  (permissions)
// type: CLIENT | FREELANCER       (marketplace persona)
const USERS = [
	{ id: 'a1a1a1a1-aaaa-4aaa-aaaa-aaaaaaaaaaaa', email: 'alice@test.com',   username: 'alice',   firstname: 'Alice',   lastname: 'Anderson', role: 'USER',  type: 'CLIENT',     avatar: 'https://i.pravatar.cc/500?img=1' },
	{ id: 'b2b2b2b2-bbbb-4bbb-bbbb-bbbbbbbbbbbb', email: 'bob@test.com',     username: 'bob',     firstname: 'Bob',     lastname: 'Brown',    role: 'USER',  type: 'FREELANCER', avatar: 'https://i.pravatar.cc/500?img=2' },
	{ id: 'c3c3c3c3-cccc-4ccc-cccc-cccccccccccc', email: 'charlie@test.com', username: 'charlie', firstname: 'Charlie', lastname: 'Clark',    role: 'USER',  type: 'CLIENT',     avatar: 'https://i.pravatar.cc/500?img=3' },
	{ id: 'd4d4d4d4-dddd-4ddd-dddd-dddddddddddd', email: 'diana@test.com',   username: 'diana',   firstname: 'Diana',   lastname: 'Davis',    role: 'USER',  type: 'FREELANCER', avatar: 'https://i.pravatar.cc/500?img=4' },
	{ id: 'e5e5e5e5-eeee-4eee-eeee-eeeeeeeeeeee', email: 'eve@test.com',     username: 'eve',     firstname: 'Eve',     lastname: 'Edwards',  role: 'ADMIN', type: 'CLIENT',     avatar: 'https://i.pravatar.cc/500?img=5' },
];

// Password for all users: Test1234

// ── Messages for alice & bob conversation (35+ messages) ──
const ALICE = USERS[0].id;
const BOB   = USERS[1].id;
const CHARLIE = USERS[2].id;
const DIANA = USERS[3].id;

const aliceBobMessages = [
	{ sender: ALICE, content: 'Hey Bob! I saw your profile, are you available for a React project?' },
	{ sender: BOB,   content: 'Hi Alice! Yeah I\'m free right now. What kind of project?' },
	{ sender: ALICE, content: 'It\'s a dashboard for our analytics team. Mostly charts and data tables.' },
	{ sender: BOB,   content: 'Nice, I\'ve done a few of those. What charting library are you thinking?' },
	{ sender: ALICE, content: 'We\'re open to suggestions. Maybe Recharts or Chart.js?' },
	{ sender: BOB,   content: 'I\'d recommend Recharts if you\'re using React. It integrates really well.' },
	{ sender: ALICE, content: 'Sounds good. How about the timeline? We need it done in about 3 weeks.' },
	{ sender: BOB,   content: '3 weeks is tight but doable. How many pages are we talking?' },
	{ sender: ALICE, content: 'Around 5 main pages: overview, users, revenue, traffic, and settings.' },
	{ sender: BOB,   content: 'Ok that\'s manageable. Do you have designs or wireframes?' },
	{ sender: ALICE, content: 'We have Figma mockups. I can share the link once we agree on terms.' },
	{ sender: BOB,   content: 'Perfect. What\'s the budget looking like?' },
	{ sender: ALICE, content: 'We\'re thinking $2500 for the whole thing. Is that reasonable?' },
	{ sender: BOB,   content: 'For 5 pages with charts in 3 weeks, I\'d say $3000 is more fair.' },
	{ sender: ALICE, content: 'Let me check with my team and get back to you.' },
	{ sender: BOB,   content: 'Sure, take your time. No rush.' },
	{ sender: ALICE, content: 'Ok we can do $2800. Does that work?' },
	{ sender: BOB,   content: 'Deal! When do we start?' },
	{ sender: ALICE, content: 'How about Monday? I\'ll send over the Figma link and API docs.' },
	{ sender: BOB,   content: 'Monday works. I\'ll set up the repo over the weekend.' },
	{ sender: ALICE, content: 'Great! Use Next.js if possible, we want SSR for SEO.' },
	{ sender: BOB,   content: 'Hmm dashboards usually don\'t need SEO though. Are you sure about Next?' },
	{ sender: ALICE, content: 'Good point actually. Plain React with Vite is fine then.' },
	{ sender: BOB,   content: 'Cool. I\'ll use Vite + React + TypeScript + Tailwind. Sound good?' },
	{ sender: ALICE, content: 'Perfect stack. We use Tailwind internally too so that\'s consistent.' },
	{ sender: BOB,   content: 'One question - will I need to build the API or just the frontend?' },
	{ sender: ALICE, content: 'Just frontend. Our backend team already has the REST API ready.' },
	{ sender: BOB,   content: 'Even better. Can you share the API docs so I can start planning components?' },
	{ sender: ALICE, content: 'Here\'s our Swagger docs: https://api.example.com/docs' },
	{ sender: BOB,   content: 'Got it. I see about 15 endpoints. This is well documented, nice job.' },
	{ sender: ALICE, content: 'Thanks! Our backend lead is pretty thorough.' },
	{ sender: BOB,   content: 'Quick question - do you need dark mode support?' },
	{ sender: ALICE, content: 'Yes please! That\'s actually a requirement from the design team.' },
	{ sender: BOB,   content: 'No problem, I\'ll use CSS variables with Tailwind\'s dark mode.' },
	{ sender: ALICE, content: 'Awesome. Also we need the dashboard to be responsive for tablets.' },
	{ sender: BOB,   content: 'Responsive is standard for me. I\'ll test on iPad and common tablet sizes.' },
	{ sender: ALICE, content: 'You\'re a legend. I think we\'re all set then!' },
	{ sender: BOB,   content: 'Looking forward to it. Talk Monday!' },
	{ sender: ALICE, content: 'See you Monday! Have a great weekend.' },
];

// ── Messages for group conversation ──
const groupMessages = [
	{ sender: ALICE,   content: 'Hey everyone, welcome to the Project Alpha group!' },
	{ sender: CHARLIE, content: 'Thanks for adding me Alice.' },
	{ sender: DIANA,   content: 'Hi all! Excited to work on this.' },
	{ sender: ALICE,   content: 'So the plan is to launch the MVP by end of month.' },
	{ sender: CHARLIE, content: 'What\'s the tech stack?' },
	{ sender: DIANA,   content: 'I\'d suggest Node.js backend with React frontend.' },
	{ sender: ALICE,   content: 'That works. Charlie, can you handle the database design?' },
	{ sender: CHARLIE, content: 'Sure, I\'ll draft the ERD this week.' },
	{ sender: DIANA,   content: 'I\'ll start on the API endpoints once the schema is ready.' },
	{ sender: ALICE,   content: 'Perfect. Let\'s sync again on Wednesday.' },
];

// ── Messages for bob & diana conversation ──
const bobDianaMessages = [
	{ sender: BOB,   content: 'Hey Diana, have you worked with Socket.IO before?' },
	{ sender: DIANA, content: 'Yeah, I used it in my last project for real-time notifications.' },
	{ sender: BOB,   content: 'Nice. I might need your help with the chat feature I\'m building.' },
	{ sender: DIANA, content: 'Sure! Happy to help. Just ping me when you\'re ready.' },
	{ sender: BOB,   content: 'Will do, thanks!' },
];

// ── Helper: generate timestamps spaced 2-5 min apart ──
function generateTimestamps(count, startHoursAgo) {
	const stamps = [];
	let t = new Date(Date.now() - startHoursAgo * 60 * 60 * 1000);
	for (let i = 0; i < count; i++) {
		stamps.push(new Date(t));
		t = new Date(t.getTime() + (2 + Math.random() * 3) * 60 * 1000);
	}
	return stamps;
}

async function seed() {
	const hash = await bcrypt.hash('Test1234', 12);
	const now = new Date().toISOString();

	// ── Connect to all five databases ──
	const authDb      = new Client({ connectionString: 'postgresql://auth_user:auth_pass@postgres:5432/auth_db' });
	const chatDb      = new Client({ connectionString: 'postgresql://chat_user:chat_pass@postgres:5432/chat_db' });
	const adminDb     = new Client({ connectionString: 'postgresql://admin_user:admin_pass@postgres:5432/admin_db' });
	const analyticsDb = new Client({ connectionString: 'postgresql://analytics_user:analytics_pass@postgres:5432/analytics_db' });
	const marketDb    = new Client({ connectionString: 'postgresql://market_user:market_pass@postgres:5432/market_db' });
	await authDb.connect();
	await chatDb.connect();
	await adminDb.connect();
	await analyticsDb.connect();
	await marketDb.connect();

	console.log('connected to all 5 databases');

	// ── Clean existing data ──
	await authDb.query('TRUNCATE "RefreshToken" CASCADE');
	await authDb.query('TRUNCATE "User" CASCADE');
	await chatDb.query('TRUNCATE "Message" CASCADE');
	await chatDb.query('TRUNCATE "ConversMember" CASCADE');
	await chatDb.query('TRUNCATE "Convers" CASCADE');
	await chatDb.query('TRUNCATE "FriendRequest" CASCADE');
	await chatDb.query('TRUNCATE "Notification" CASCADE');
	await chatDb.query('TRUNCATE "User" CASCADE');
	await adminDb.query('TRUNCATE "Job" CASCADE');
	await adminDb.query('TRUNCATE "User" CASCADE');
	await analyticsDb.query('TRUNCATE "Job" CASCADE');
	await analyticsDb.query('TRUNCATE "User" CASCADE');
	await marketDb.query('TRUNCATE "Payment" CASCADE');
	await marketDb.query('TRUNCATE "Review" CASCADE');
	await marketDb.query('TRUNCATE "Proposal" CASCADE');
	await marketDb.query('TRUNCATE "Job" CASCADE');

	console.log('cleared existing data');

	// ── Seed auth_db users ──
	for (const u of USERS) {
		await authDb.query(
			`INSERT INTO "User" (id, email, username, password, firstname, lastname, role, type, avatar, "isOnline", "twoFAEnabled", "createdAt", "updatedAt")
			 VALUES ($1, $2, $3, $4, $5, $6, $7::"Role", $8::"UserType", $9, false, false, $10, $10)`,
			[u.id, u.email, u.username, hash, u.firstname, u.lastname, u.role, u.type, u.avatar || '/avatars/default.png', now]
		);
	}
	console.log(`seeded ${USERS.length} users in auth_db`);

	// ── Seed chat_db users (shadow copies, no password) ──
	for (const u of USERS) {
		await chatDb.query(
			`INSERT INTO "User" (id, email, username, firstname, lastname, role, type, avatar, "isOnline", "createdAt", "updatedAt")
			 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false, $9, $9)`,
			[u.id, u.email, u.username, u.firstname, u.lastname, u.role, u.type, u.avatar || '/avatars/default.png', now]
		);
	}
	console.log(`seeded ${USERS.length} users in chat_db`);

	// ── Create conversations ──

	// 1. Alice & Bob (Direct) - 35+ messages
	const c1 = await chatDb.query(
		`INSERT INTO "Convers" (name, type, created_at, updated_at) VALUES (NULL, 'Direct', $1, $1) RETURNING id`,
		[now]
	);
	const convers1 = c1.rows[0].id;

	// 2. Group chat: Alice, Charlie, Diana
	const c2 = await chatDb.query(
		`INSERT INTO "Convers" (name, type, created_at, updated_at) VALUES ('Project Alpha', 'Group', $1, $1) RETURNING id`,
		[now]
	);
	const convers2 = c2.rows[0].id;

	// 3. Bob & Diana (Direct)
	const c3 = await chatDb.query(
		`INSERT INTO "Convers" (name, type, created_at, updated_at) VALUES (NULL, 'Direct', $1, $1) RETURNING id`,
		[now]
	);
	const convers3 = c3.rows[0].id;

	console.log(`created 3 conversations (ids: ${convers1}, ${convers2}, ${convers3})`);

	// ── Add members to conversations ──
	const members = [
		[ALICE, convers1], [BOB, convers1],
		[ALICE, convers2], [CHARLIE, convers2], [DIANA, convers2],
		[BOB, convers3], [DIANA, convers3],
	];
	for (const [uid, cid] of members) {
		await chatDb.query(
			`INSERT INTO "ConversMember" (user_id, convers_id, joined_at) VALUES ($1, $2, $3)`,
			[uid, cid, now]
		);
	}
	console.log(`added ${members.length} conversation members`);

	// ── Insert messages ──
	const stamps1 = generateTimestamps(aliceBobMessages.length, 48);
	for (let i = 0; i < aliceBobMessages.length; i++) {
		const m = aliceBobMessages[i];
		await chatDb.query(
			`INSERT INTO "Message" (content, sender_id, convers_id, created_at) VALUES ($1, $2, $3, $4)`,
			[m.content, m.sender, convers1, stamps1[i].toISOString()]
		);
	}
	console.log(`inserted ${aliceBobMessages.length} messages in alice-bob conversation`);

	const stamps2 = generateTimestamps(groupMessages.length, 24);
	for (let i = 0; i < groupMessages.length; i++) {
		const m = groupMessages[i];
		await chatDb.query(
			`INSERT INTO "Message" (content, sender_id, convers_id, created_at) VALUES ($1, $2, $3, $4)`,
			[m.content, m.sender, convers2, stamps2[i].toISOString()]
		);
	}
	console.log(`inserted ${groupMessages.length} messages in group conversation`);

	const stamps3 = generateTimestamps(bobDianaMessages.length, 12);
	for (let i = 0; i < bobDianaMessages.length; i++) {
		const m = bobDianaMessages[i];
		await chatDb.query(
			`INSERT INTO "Message" (content, sender_id, convers_id, created_at) VALUES ($1, $2, $3, $4)`,
			[m.content, m.sender, convers3, stamps3[i].toISOString()]
		);
	}
	console.log(`inserted ${bobDianaMessages.length} messages in bob-diana conversation`);

	// ── Friend requests ──
	await chatDb.query(
		`INSERT INTO "FriendRequest" (sender_id, receiver_id, status, created_at, updated_at) VALUES ($1, $2, 'ACCEPTED', $3, $3)`,
		[ALICE, BOB, now]
	);
	await chatDb.query(
		`INSERT INTO "FriendRequest" (sender_id, receiver_id, status, created_at, updated_at) VALUES ($1, $2, 'PENDING', $3, $3)`,
		[CHARLIE, ALICE, now]
	);
	await chatDb.query(
		`INSERT INTO "FriendRequest" (sender_id, receiver_id, status, created_at, updated_at) VALUES ($1, $2, 'ACCEPTED', $3, $3)`,
		[DIANA, BOB, now]
	);
	await chatDb.query(
		`INSERT INTO "FriendRequest" (sender_id, receiver_id, status, created_at, updated_at) VALUES ($1, $2, 'REJECTED', $3, $3)`,
		[BOB, CHARLIE, now]
	);
	console.log('created 4 friend requests');

	// ── Notifications ──
	const notifs = [
		{ user: ALICE,   type: 'FRIEND_REQ', title: 'New friend request',        body: 'charlie sent you a friend request' },
		{ user: BOB,     type: 'FRIEND_REQ', title: 'Friend request accepted',   body: 'alice accepted your friend request' },
		{ user: BOB,     type: 'MESSAGE',    title: 'New message',               body: 'alice sent you a message' },
		{ user: ALICE,   type: 'SYSTEM',     title: 'Welcome to LeetConnect!',   body: 'Start by adding friends and joining conversations' },
		{ user: CHARLIE, type: 'SYSTEM',     title: 'Welcome to LeetConnect!',   body: 'Start by adding friends and joining conversations' },
		{ user: DIANA,   type: 'SYSTEM',     title: 'Welcome to LeetConnect!',   body: 'Start by adding friends and joining conversations' },
	];
	for (const n of notifs) {
		await chatDb.query(
			`INSERT INTO "Notification" (user_id, type, title, body, is_read, created_at)
			 VALUES ($1, $2::"NotifType", $3, $4, false, $5)`,
			[n.user, n.type, n.title, n.body, now]
		);
	}
	console.log(`created ${notifs.length} notifications`);

	// ── Seed admin_db users (shadow) ──
	for (const u of USERS) {
		await adminDb.query(
			`INSERT INTO "User" (id, email, username, firstname, lastname, role, type, avatar, "isOnline", "twoFAEnabled", "createdAt", "updatedAt")
			 VALUES ($1, $2, $3, $4, $5, $6::"Role", $7::"UserType", $8, false, false, $9, $9)`,
			[u.id, u.email, u.username, u.firstname, u.lastname, u.role, u.type, u.avatar || '/avatars/default.png', now]
		);
	}
	console.log(`seeded ${USERS.length} users in admin_db`);

	// ── Seed analytics_db users (shadow) ──
	for (const u of USERS) {
		await analyticsDb.query(
			`INSERT INTO "User" (id, email, username, firstname, lastname, role, type, avatar, "isOnline", "twoFAEnabled", "createdAt", "updatedAt")
			 VALUES ($1, $2, $3, $4, $5, $6::"Role", $7::"UserType", $8, false, false, $9, $9)`,
			[u.id, u.email, u.username, u.firstname, u.lastname, u.role, u.type, u.avatar || '/avatars/default.png', now]
		);
	}
	console.log(`seeded ${USERS.length} users in analytics_db`);

	// ── Jobs (marketplace = source of truth, mirrored to admin & analytics) ──
	// Alice and Charlie are CLIENTS, Bob and Diana are FREELANCERS.
	// status mapping: market(canonical) → admin(active|flagged|closed) → analytics(active|flagged|closed|in_progress|completed)
	const JOBS = [
		{
			id: '1111aaaa-1111-4111-8111-111111111111',
			title: 'Build a React analytics dashboard',
			description: 'Need a responsive analytics dashboard with charts, dark mode, and 5 main pages. Recharts preferred.',
			category: 'Web Development',
			budget: 2800,
			skills: ['React', 'TypeScript', 'Tailwind', 'Recharts'],
			clientId: ALICE,
			postedByName: 'alice',
			marketStatus: 'COMPLETED',
			adminStatus:  'closed',
			analyticsStatus: 'completed',
		},
		{
			id: '2222bbbb-2222-4222-8222-222222222222',
			title: 'Real-time chat module with Socket.IO',
			description: 'Looking for help integrating Socket.IO for a real-time messaging feature. Backend already in Node.js.',
			category: 'Backend',
			budget: 1500,
			skills: ['Node.js', 'Socket.IO', 'TypeScript'],
			clientId: ALICE,
			postedByName: 'alice',
			marketStatus: 'OPEN',
			adminStatus:  'active',
			analyticsStatus: 'active',
		},
		{
			id: '3333cccc-3333-4333-8333-333333333333',
			title: 'Database schema and ERD for SaaS MVP',
			description: 'Need a database designer to draft Postgres schema + ERD for Project Alpha (SaaS).',
			category: 'Database',
			budget: 900,
			skills: ['PostgreSQL', 'ERD', 'Schema Design'],
			clientId: CHARLIE,
			postedByName: 'charlie',
			marketStatus: 'OPEN',
			adminStatus:  'active',
			analyticsStatus: 'active',
		},
	];

	for (const j of JOBS) {
		// marketplace (canonical)
		await marketDb.query(
			`INSERT INTO "Job" (id, title, category, budget, description, skills, status, "clientId", "createdAt", "updatedAt")
			 VALUES ($1, $2, $3, $4, $5, $6, $7::"JobStatus", $8, $9, $9)`,
			[j.id, j.title, j.category, j.budget, j.description, j.skills, j.marketStatus, j.clientId, now]
		);
		// admin (shadow)
		await adminDb.query(
			`INSERT INTO "Job" (id, title, description, budget, category, "clientId", status, "createdAt", proposals, skills, "postedByName")
			 VALUES ($1, $2, $3, $4, $5, $6, $7::"JobStatus", $8, 0, $9, $10)`,
			[j.id, j.title, j.description, j.budget, j.category, j.clientId, j.adminStatus, now, j.skills, j.postedByName]
		);
		// analytics (shadow)
		await analyticsDb.query(
			`INSERT INTO "Job" (id, title, description, budget, category, "clientId", status, "createdAt", proposals, skills, "postedByName")
			 VALUES ($1, $2, $3, $4, $5, $6, $7::"JobStatus", $8, 0, $9, $10)`,
			[j.id, j.title, j.description, j.budget, j.category, j.clientId, j.analyticsStatus, now, j.skills, j.postedByName]
		);
	}
	console.log(`seeded ${JOBS.length} jobs across market_db / admin_db / analytics_db`);

	// ── Proposals (marketplace only) ──
	const PROPOSALS = [
		{
			id: 'p1111111-1111-4111-8111-111111111111',
			coverLetter: 'I have built several React dashboards with Recharts. Can deliver in 3 weeks.',
			proposedBudget: 2800,
			deliveryDays: 21,
			status: 'ACCEPTED',
			freelancerId: BOB,
			jobId: JOBS[0].id,
		},
		{
			id: 'p2222222-2222-4222-8222-222222222222',
			coverLetter: 'Socket.IO is my specialty. Happy to start this week.',
			proposedBudget: 1400,
			deliveryDays: 10,
			status: 'PENDING',
			freelancerId: DIANA,
			jobId: JOBS[1].id,
		},
		{
			id: 'p3333333-3333-4333-8333-333333333333',
			coverLetter: 'I can draft the full ERD and schema in under a week.',
			proposedBudget: 900,
			deliveryDays: 5,
			status: 'PENDING',
			freelancerId: BOB,
			jobId: JOBS[2].id,
		},
	];

	for (const p of PROPOSALS) {
		await marketDb.query(
			`INSERT INTO "Proposal" (id, "coverLetter", "proposedBudget", "deliveryDays", status, "rejectionCount", "freelancerId", "jobId", "createdAt")
			 VALUES ($1, $2, $3, $4, $5::"ProposalStatus", 0, $6, $7, $8)`,
			[p.id, p.coverLetter, p.proposedBudget, p.deliveryDays, p.status, p.freelancerId, p.jobId, now]
		);
	}
	console.log(`seeded ${PROPOSALS.length} proposals in market_db`);

	// ── Payment for the accepted proposal (Bob → Alice's dashboard job) ──
	await marketDb.query(
		`INSERT INTO "Payment" (id, amount, status, "proposalId", "jobId", "clientId", "freelancerId", "createdAt", "updatedAt")
		 VALUES ($1, $2, $3::"PaymentStatus", $4, $5, $6, $7, $8, $8)`,
		[
			'pay11111-1111-4111-8111-111111111111',
			2800,
			'PAID',
			PROPOSALS[0].id,
			JOBS[0].id,
			ALICE,
			BOB,
			now,
		]
	);
	console.log('seeded 1 payment in market_db');

	// ── Review (Alice rates Bob for the completed dashboard job) ──
	await marketDb.query(
		`INSERT INTO "Review" (id, rating, comment, "fromUserId", "toUserId", "jobId", "createdAt")
		 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		[
			'rev11111-1111-4111-8111-111111111111',
			5,
			'Bob delivered on time and the dashboard looks great. Highly recommended.',
			ALICE,
			BOB,
			JOBS[0].id,
			now,
		]
	);
	console.log('seeded 1 review in market_db');

	// ── Done ──
	await authDb.end();
	await chatDb.end();
	await adminDb.end();
	await analyticsDb.end();
	await marketDb.end();

	console.log('\n--- seed complete ---');
	console.log('users:    alice, bob, charlie, diana, eve (ADMIN)');
	console.log('password: Test1234');
	console.log(`chat:     ${convers1} (alice+bob, ${aliceBobMessages.length} msgs), ${convers2} (group, ${groupMessages.length} msgs), ${convers3} (bob+diana, ${bobDianaMessages.length} msgs)`);
	console.log(`market:   ${JOBS.length} jobs, ${PROPOSALS.length} proposals, 1 payment, 1 review`);
	console.log(`shadows:  users + jobs mirrored to admin_db and analytics_db`);
}

seed().catch(err => { console.error('seed failed:', err); process.exit(1); });
