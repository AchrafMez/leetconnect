import avatar from "./avatar.png";

export type Freelancer = {
  id: string;
  avatar: string;
  price: number;
  name: string;
  title: string;
  categorie?: string;
  expLevel: "Junior" | "Mid" | "Sunior";
  skills: string[];
};

export const freelencer: Freelancer[] = [
  {
    id: "0",
    avatar,
    price: 80,
    name: "Sarah Jenkins",
    title: "Senior Frontend Architect",
    categorie: "Web Development",
    expLevel: "Junior",
    skills: ["React", "Vue.js", "Figma", "React", "Vue.js", "Figma"],
  },
  {
    id: "1",
    avatar,
    price: 60,
    name: "Sarah Jenkins",
    title: "Senior Frontend Architect",
    categorie: "Web Development",
    expLevel: "Junior",
    skills: ["React", "Vue.js", "Figma"],
  },
  {
    id: "2",
    avatar,
    price: 60,
    name: "Sarah Jenkins",
    title: "Senior Frontend Architect",
    categorie: "Web Development",
    expLevel: "Junior",
    skills: ["React", "Vue.js", "Figma"],
  },
  {
    id: "3",
    avatar,
    price: 60,
    name: "Sarah Jenkins",
    title: "Senior Frontend Architect",
    categorie: "Web Development",
    expLevel: "Junior",
    skills: ["React", "Vue.js", "Figma"],
  },
  {
    id: "4",
    avatar,
    price: 50,
    name: "Sarah Jenkins",
    title: "Senior Frontend Architect",
    categorie: "Web Development",
    expLevel: "Junior",
    skills: ["React", "Vue.js", "Figma"],
  },
  {
    id: "5",
    avatar,
    price: 50,
    name: "Sarah Jenkins",
    title: "Senior Frontend Architect",
    categorie: "Web Development",
    expLevel: "Junior",
    skills: ["React", "Vue.js", "Figma"],
  },
  {
    id: "6",
    avatar,
    price: 50,
    name: "Sarah Jenkins",
    title: "Senior Frontend Architect",
    expLevel: "Junior",
    skills: ["React", "Vue.js", "Figma"],
  },
  {
    id: "7",
    avatar,
    price: 40,
    name: "Sarah Jenkins",
    title: "Senior Frontend Architect",
    categorie: "Web Development",
    expLevel: "Junior",
    skills: ["React", "Vue.js", "Figma"],
  },
  {
    id: "8",
    avatar,
    price: 40,
    name: "Sarah Jenkins",
    title: "Senior Frontend Architect",
    categorie: "Web Development",
    expLevel: "Mid",
    skills: ["React", "Vue.js", "Figma"],
  },
  {
    id: "9",
    avatar,
    price: 30,
    name: "Sarah Jenkins",
    title: "Senior Frontend Architect",
    categorie: "Mobile Apps",
    expLevel: "Mid",
    skills: ["React", "Vue.js", "Figma"],
  },
  {
    id: "10",
    avatar,
    price: 30,
    name: "Sarah Jenkins",
    title: "Senior Frontend Architect",
    categorie: "Mobile Apps",
    expLevel: "Mid",
    skills: ["Vue.js", "Figma"],
  },
  {
    id: "11",
    avatar,
    price: 20,
    name: "Sarah Jenkins",
    title: "Senior Frontend Architect",
    categorie: "Mobile Apps",
    expLevel: "Mid",
    skills: ["Vue.js", "Figma"],
  },
  {
    id: "12",
    avatar,
    price: 20,
    name: "Sarah Jenkins",
    title: "Senior Frontend Architect",
    categorie: "Mobile Apps",
    expLevel: "Mid",
    skills: ["React", "Vue.js", "Figma"],
  },
  {
    id: "13",
    avatar,
    price: 20,
    name: "Sarah Jenkins",
    title: "Senior Frontend Architect",
    categorie: "Graphic Design",
    expLevel: "Mid",
    skills: ["React", "Vue.js", "Figma"],
  },
  {
    id: "14",
    avatar,
    price: 10,
    name: "Sarah Jenkins",
    title: "Senior Frontend Architect",
    categorie: "Graphic Design",
    expLevel: "Mid",
    skills: ["React", "Vue.js", "Figma"],
  },
  {
    id: "15",
    avatar,
    price: 10,
    name: "Sarah Jenkins",
    title: "Senior Frontend Architect",
    categorie: "Graphic Design",
    expLevel: "Sunior",
    skills: ["React", "Vue.js", "Figma"],
  },
  {
    id: "16",
    avatar,
    price: 10,
    name: "Sarah Jenkins",
    title: "Senior Frontend Architect",
    categorie: "Graphic Design",
    expLevel: "Sunior",
    skills: ["Vue.js", "Figma"],
  },
  {
    id: "17",
    avatar,
    price: 50,
    name: "Sarah Jenkins",
    title: "Senior Frontend Architect",
    categorie: "Graphic Design",
    expLevel: "Sunior",
    skills: ["Vue.js", "Figma"],
  },
  {
    id: "18",
    avatar,
    price: 30,
    name: "Sarah Jenkins",
    title: "Senior Frontend Architect",
    categorie: "Graphic Design",
    expLevel: "Sunior",
    skills: ["React", "Vue.js", "Figma", "React"],
  },
  {
    id: "19",
    avatar,
    price: 70,
    name: "Sarah Jenkins",
    title: "Senior Frontend Architect",
    categorie: "Graphic Design",
    expLevel: "Sunior",
    skills: ["Vue.js", "Figma"],
  },
];


export type CategoriesData = {
  [key: string]: string[];
};

export const categoriesData: CategoriesData = {
  "Software Development": [
    "Python", "JavaScript", "TypeScript", "Java", "C#", "Go", "Rust", "PHP", "Ruby", "Node.js", "Express", "Django", "FastAPI", "Spring Boot", ".NET", "GraphQL", "REST APIs", "Microservices", "PostgreSQL", "MongoDB", "Redis", "RabbitMQ", "gRPC", "WebSockets"
  ],
  "Mobile Development": [
    "Swift", "Kotlin", "Objective-C", "Java (Android)", "React Native", "Flutter", "Dart", "Expo", "Firebase", "Push Notifications", "App Store Optimization", "Mobile UI", "Offline-first apps", "BLE / NFC integration"
  ],
  "Cloud & DevOps": [
    "AWS", "GCP", "Azure", "Terraform", "Ansible", "Docker", "Kubernetes", "Helm", "CI/CD", "GitHub Actions", "GitLab CI", "Jenkins", "Linux", "Nginx", "Prometheus", "Grafana", "ELK Stack", "CloudFormation", "Pulumi", "ArgoCD"
  ],
  "UI / UX Design": [
    "Figma", "Adobe XD", "Sketch", "Prototyping", "Wireframing", "User Research", "Usability Testing", "Design Systems", "Component Libraries", "Accessibility (WCAG)", "Responsive Design", "Motion Design", "Information Architecture"
  ],
  "AI / ML Engineering": [
    "Python", "PyTorch", "TensorFlow", "Scikit-learn", "LLM Integration", "OpenAI API", "LangChain", "LlamaIndex", "RAG", "Fine-tuning", "MLOps", "Hugging Face", "Vector Databases", "Pinecone", "Weaviate", "AI Agents", "Prompt Engineering", "Computer Vision", "NLP"
  ],
  "Data Engineering": [
    "Apache Spark", "Kafka", "Airflow", "dbt", "SQL", "Python", "Snowflake", "BigQuery", "Redshift", "Delta Lake", "ETL/ELT", "Data Modeling", "Databricks", "Flink", "Hadoop", "PostgreSQL", "Data Lake Architecture", "Streaming Pipelines"
  ],
  "Data Science & Analytics": [
    "Python", "R", "SQL", "Pandas", "NumPy", "Matplotlib", "Scikit-learn", "Tableau", "Power BI", "Looker", "Statistical Modeling", "A/B Testing", "Forecasting", "Machine Learning", "Feature Engineering", "Jupyter", "Data Storytelling"
  ],
  "Cybersecurity": [
    "Penetration Testing", "OWASP", "Burp Suite", "Metasploit", "Nmap", "Wireshark", "SIEM", "SOC Operations", "Incident Response", "Threat Modeling", "ISO 27001", "SOC 2", "GDPR Compliance", "Vulnerability Assessment", "Reverse Engineering", "Malware Analysis", "Zero Trust Architecture"
  ],
  "Embedded & Systems": [
    "C", "C++", "Rust", "Assembly", "RTOS", "FreeRTOS", "Zephyr", "Arduino", "Raspberry Pi", "STM32", "UART", "SPI", "I2C", "CAN Bus", "Firmware Development", "IoT Protocols (MQTT, CoAP)", "OTA Updates", "Power Optimization", "PCB Interfacing"
  ],
  "Blockchain & Web3": [
    "Solidity", "Rust (Solana)", "Move (Aptos/Sui)", "Smart Contracts", "Hardhat", "Foundry", "Truffle", "ethers.js", "web3.js", "DeFi Protocols", "NFT Standards (ERC-721, ERC-1155)", "IPFS", "Smart Contract Auditing", "Layer 2", "Cross-chain Bridges", "Tokenomics Design"
  ],
  "QA & Testing": [
    "Selenium", "Cypress", "Playwright", "Jest", "Mocha", "JUnit", "Postman", "k6", "JMeter", "TestRail", "BDD/TDD", "API Testing", "Load Testing", "Performance Testing", "Mobile Testing", "Accessibility Testing", "Test Strategy", "Bug Tracking (Jira)"
  ],
  "DevSecOps": [
    "SAST", "DAST", "Snyk", "SonarQube", "Trivy", "Vault (HashiCorp)", "OWASP ZAP", "Secrets Management", "Container Security", "SBOM", "Shift-left Security", "GitHub Advanced Security", "Compliance Automation", "SOC 2", "PCI-DSS", "NIST Framework", "Policy as Code", "OPA", "Falco"
  ]
};