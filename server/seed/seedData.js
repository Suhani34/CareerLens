// Convert a string into a URL-friendly slug
const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// Company source data
const companyRows = [
  [
    "Vertex Technologies",
    "Information Technology",
    "Bengaluru",
    "201-500",
    2016,
    "#6254D9",
    "Engineering digital experiences for a connected world.",
  ],
  [
    "CloudNova Labs",
    "Cloud Computing",
    "Hyderabad",
    "501-1000",
    2018,
    "#2563EB",
    "Simplifying cloud infrastructure for modern businesses.",
  ],
  [
    "SecureStack Solutions",
    "Cybersecurity",
    "Pune",
    "51-200",
    2019,
    "#059669",
    "Protecting digital ecosystems through intelligent security.",
  ],
  [
    "DataSphere Analytics",
    "Data Analytics",
    "Mumbai",
    "201-500",
    2017,
    "#7C3AED",
    "Transforming complex data into meaningful decisions.",
  ],
  [
    "PixelCraft Studio",
    "Design & Creative",
    "Jaipur",
    "11-50",
    2020,
    "#DB2777",
    "Creating thoughtful and human-centered digital products.",
  ],
  [
    "NeuralForge AI",
    "Artificial Intelligence",
    "Bengaluru",
    "51-200",
    2021,
    "#4F46E5",
    "Building responsible and practical AI solutions.",
  ],
  [
    "MarketPulse Digital",
    "Digital Marketing",
    "Delhi",
    "51-200",
    2018,
    "#EA580C",
    "Helping ambitious brands discover new audiences.",
  ],
  [
    "FinEdge Capital",
    "Financial Services",
    "Mumbai",
    "501-1000",
    2012,
    "#0F766E",
    "Making financial intelligence accessible and actionable.",
  ],
  [
    "TalentBridge Consulting",
    "Human Resources",
    "Gurugram",
    "201-500",
    2015,
    "#9333EA",
    "Connecting talented people with meaningful opportunities.",
  ],
  [
    "Nexora Systems",
    "Information Technology",
    "Noida",
    "201-500",
    2014,
    "#0891B2",
    "Developing scalable software for growing organizations.",
  ],
  [
    "QuantumLeaf Innovations",
    "Research & Technology",
    "Chennai",
    "51-200",
    2020,
    "#16A34A",
    "Turning innovative ideas into impactful products.",
  ],
  [
    "BluePeak Enterprises",
    "Business Consulting",
    "Gurugram",
    "501-1000",
    2010,
    "#1D4ED8",
    "Supporting organizations through strategic transformation.",
  ],
  [
    "InsightOrbit",
    "Data Analytics",
    "Hyderabad",
    "51-200",
    2019,
    "#C026D3",
    "Discovering opportunities through intelligent analytics.",
  ],
  [
    "IronShield Digital",
    "Cybersecurity",
    "Delhi",
    "201-500",
    2017,
    "#475569",
    "Helping businesses strengthen their digital resilience.",
  ],
  [
    "BrightPath Solutions",
    "Business Services",
    "Ahmedabad",
    "201-500",
    2015,
    "#D97706",
    "Building practical solutions for sustainable business growth.",
  ],
];

const companies = companyRows.map((row, index) => {
  const [
    name,
    industry,
    headquarters,
    companySize,
    founded,
    brandColor,
    tagline,
  ] = row;

  const slug = slugify(name);

  return {
    name,
    slug,
    logo: "",
    brandColor,
    tagline,

    description:
      `${name} is a fictional ${industry.toLowerCase()} ` +
      `company headquartered in ${headquarters}, India. ` +
      `${tagline} The organization encourages continuous ` +
      `learning, collaboration and professional growth. ` +
      `Its teams work together to deliver reliable, ` +
      `customer-focused solutions while maintaining ` +
      `a supportive working environment.`,

    industry,
    headquarters: `${headquarters}, India`,

    locations: [
      headquarters,
      index % 2 === 0 ? "Bengaluru" : "Pune",
    ].filter(
      (location, i, list) =>
        list.indexOf(location) === i
    ),

    companySize,
    founded,

    // Reserved example domain, not a real company website
    website: `https://${slug}.example.com`,

    culture:
      "A collaborative and inclusive workplace that values " +
      "curiosity, responsibility, creativity and continuous improvement.",

    benefits: [
      "Health insurance",
      "Flexible working hours",
      "Professional development budget",
      "Paid annual leave",
      "Performance-based incentives",
      "Employee wellness programs",
    ],

    recruiter: {
      name: `${name} Recruitment Team`,
      designation: "Talent Acquisition",
      email: `careers@${slug}.example.com`,
      avatar: "",
    },

    featured: index < 8,
    isDemo: true,
  };
});

// Format:
// [title, skills, salaryMin, salaryMax, expMin, expMax]
//
// Salary values are annual amounts in lakhs.

const careerGroups = [
  {
    category: "Software Development",
    companyIndexes: [0, 9, 10],

    focus:
      "Develop reliable software products and improve " +
      "application performance and user experience.",

    responsibilities: [
      "Develop and maintain scalable applications",
      "Write clean, reusable and maintainable code",
      "Collaborate with design and engineering teams",
      "Participate in code reviews and testing",
    ],

    roles: [
      ["Frontend Developer",
        ["React", "JavaScript", "HTML", "CSS", "Git"],
        4, 8, 0, 2],

      ["MERN Stack Developer",
        ["MongoDB", "Express.js", "React", "Node.js", "REST API"],
        5, 12, 1, 3],

      ["Backend Developer",
        ["Node.js", "Express.js", "SQL", "MongoDB", "Docker"],
        6, 14, 2, 4],

      ["Software Engineering Intern",
        ["JavaScript", "Git", "HTML", "CSS"],
        1.8, 3.6, 0, 0],

      ["Senior Software Engineer",
        ["Java", "System Design", "SQL", "Docker", "Git"],
        15, 28, 5, 8],

      ["Python Developer",
        ["Python", "Django", "REST API", "PostgreSQL"],
        5, 11, 1, 3],
    ],
  },

  {
    category: "Cybersecurity",
    companyIndexes: [2, 13, 9],

    focus:
      "Protect digital assets, identify security risks " +
      "and strengthen organizational security controls.",

    responsibilities: [
      "Monitor systems for potential security incidents",
      "Assess vulnerabilities and recommend remediation",
      "Prepare security documentation and reports",
      "Support security testing and incident response",
    ],

    roles: [
      ["SOC Analyst",
        ["SIEM", "Linux", "Networking", "Wireshark"],
        4, 8, 0, 2],

      ["Cybersecurity Analyst",
        ["Linux", "Python", "Networking", "Risk Assessment"],
        5, 11, 1, 3],

      ["Penetration Testing Associate",
        ["Burp Suite", "Linux", "OWASP", "Networking"],
        5, 10, 1, 3],

      ["Cybersecurity Intern",
        ["Linux", "Wireshark", "Networking", "Python"],
        1.2, 3, 0, 0],

      ["Security Engineer",
        ["Cloud Security", "Python", "SIEM", "IAM"],
        10, 20, 3, 5],

      ["Application Security Engineer",
        ["OWASP", "Secure Coding", "DevSecOps", "Git"],
        12, 24, 5, 7],
    ],
  },

  {
    category: "Data Science",
    companyIndexes: [3, 12, 7],

    focus:
      "Analyze business information and transform " +
      "complex datasets into practical insights.",

    responsibilities: [
      "Collect, clean and validate datasets",
      "Create reports and visualizations",
      "Identify meaningful patterns and trends",
      "Communicate findings to business stakeholders",
    ],

    roles: [
      ["Data Analyst",
        ["Python", "SQL", "Excel", "Power BI"],
        4, 8, 0, 2],

      ["Data Scientist",
        ["Python", "Pandas", "Statistics", "Scikit-learn"],
        8, 16, 2, 4],

      ["Business Intelligence Analyst",
        ["SQL", "Tableau", "Power BI", "Excel"],
        5, 11, 1, 3],

      ["Data Analytics Intern",
        ["Python", "Excel", "SQL", "Pandas"],
        1.8, 3.6, 0, 0],

      ["Data Engineer",
        ["Python", "SQL", "Spark", "ETL"],
        8, 18, 3, 5],

      ["Senior Data Scientist",
        ["Python", "Statistics", "Machine Learning", "SQL"],
        18, 30, 5, 8],
    ],
  },

  {
    category: "UI/UX Design",
    companyIndexes: [4, 0, 10],

    focus:
      "Create accessible, visually appealing and " +
      "user-centered digital experiences.",

    responsibilities: [
      "Conduct user research and usability evaluations",
      "Develop wireframes and interactive prototypes",
      "Maintain consistent design systems",
      "Collaborate with frontend development teams",
    ],

    roles: [
      ["UI Designer",
        ["Figma", "Typography", "Visual Design", "Prototyping"],
        3.5, 7, 0, 2],

      ["UX Designer",
        ["Figma", "User Research", "Wireframing", "Usability Testing"],
        5, 10, 1, 3],

      ["Product Designer",
        ["Figma", "Design Systems", "Prototyping", "User Research"],
        7, 15, 2, 4],

      ["UI/UX Design Intern",
        ["Figma", "Wireframing", "Canva", "Visual Design"],
        1.2, 3, 0, 0],

      ["UX Researcher",
        ["User Research", "Data Analysis", "Usability Testing"],
        5, 12, 2, 4],

      ["Senior Product Designer",
        ["Figma", "Design Systems", "Leadership", "Accessibility"],
        14, 25, 5, 8],
    ],
  },

  {
    category: "Cloud & DevOps",
    companyIndexes: [1, 9, 0],

    focus:
      "Build reliable infrastructure, automate delivery " +
      "processes and improve operational efficiency.",

    responsibilities: [
      "Maintain deployment and infrastructure workflows",
      "Automate repetitive operational tasks",
      "Monitor application availability and performance",
      "Improve infrastructure reliability and documentation",
    ],

    roles: [
      ["Cloud Engineer",
        ["AWS", "Linux", "Networking", "Terraform"],
        5, 10, 0, 2],

      ["DevOps Engineer",
        ["Docker", "Kubernetes", "Git", "CI/CD", "Linux"],
        6, 14, 1, 3],

      ["Site Reliability Engineer",
        ["Linux", "Kubernetes", "Prometheus", "Python"],
        10, 20, 3, 5],

      ["Cloud & DevOps Intern",
        ["Linux", "Docker", "Git", "AWS"],
        1.8, 4.2, 0, 0],

      ["Platform Engineer",
        ["Kubernetes", "Terraform", "AWS", "Python"],
        12, 22, 3, 5],

      ["Senior DevOps Engineer",
        ["AWS", "Kubernetes", "Terraform", "CI/CD", "Monitoring"],
        18, 32, 5, 8],
    ],
  },

  {
    category: "AI & Machine Learning",
    companyIndexes: [5, 10, 12],

    focus:
      "Develop practical intelligent systems and " +
      "evaluate machine-learning solutions.",

    responsibilities: [
      "Prepare datasets for model development",
      "Develop and evaluate intelligent solutions",
      "Document model performance and limitations",
      "Collaborate on responsible AI implementation",
    ],

    roles: [
      ["Machine Learning Engineer",
        ["Python", "TensorFlow", "Scikit-learn", "Pandas"],
        7, 15, 1, 3],

      ["AI Engineer",
        ["Python", "PyTorch", "NLP", "Machine Learning"],
        8, 18, 2, 4],

      ["NLP Engineer",
        ["Python", "NLP", "Transformers", "PyTorch"],
        9, 18, 2, 4],

      ["Machine Learning Intern",
        ["Python", "NumPy", "Pandas", "Statistics"],
        2.4, 4.8, 0, 0],

      ["Computer Vision Engineer",
        ["Python", "OpenCV", "PyTorch", "Deep Learning"],
        8, 17, 2, 4],

      ["Senior AI Engineer",
        ["Python", "PyTorch", "MLOps", "System Design"],
        20, 35, 5, 8],
    ],
  },

  {
    category: "Digital Marketing",
    companyIndexes: [6, 14, 4],

    focus:
      "Develop creative marketing strategies and " +
      "improve measurable audience engagement.",

    responsibilities: [
      "Plan and execute digital marketing campaigns",
      "Analyze campaign and website performance",
      "Develop engaging audience-focused content",
      "Optimize marketing strategies using data",
    ],

    roles: [
      ["Digital Marketing Executive",
        ["SEO", "Google Analytics", "Content Marketing"],
        3, 6, 0, 2],

      ["SEO Specialist",
        ["SEO", "Keyword Research", "Google Analytics"],
        4, 8, 1, 3],

      ["Social Media Manager",
        ["Social Media", "Canva", "Content Strategy"],
        4, 9, 1, 3],

      ["Digital Marketing Intern",
        ["Canva", "SEO", "Social Media", "Communication"],
        1.2, 2.4, 0, 0],

      ["Performance Marketing Specialist",
        ["Google Ads", "Meta Ads", "Analytics", "Excel"],
        5, 12, 2, 4],

      ["Marketing Manager",
        ["Marketing Strategy", "SEO", "Leadership", "Analytics"],
        10, 20, 5, 8],
    ],
  },

  {
    category: "Finance",
    companyIndexes: [7, 11, 14],

    focus:
      "Support financial planning, reporting and " +
      "evidence-based business decisions.",

    responsibilities: [
      "Prepare and analyze financial reports",
      "Assist with budgeting and forecasting",
      "Maintain accurate financial documentation",
      "Evaluate business performance and financial risks",
    ],

    roles: [
      ["Financial Analyst",
        ["Excel", "Financial Modeling", "Accounting"],
        4, 9, 0, 2],

      ["Investment Analyst",
        ["Financial Modeling", "Research", "Excel"],
        6, 13, 1, 3],

      ["Accountant",
        ["Accounting", "Tally", "Excel", "Taxation"],
        3, 7, 1, 3],

      ["Finance Intern",
        ["Excel", "Accounting", "Communication"],
        1.2, 3, 0, 0],

      ["Risk Analyst",
        ["Risk Assessment", "Statistics", "SQL", "Excel"],
        6, 12, 2, 4],

      ["Finance Manager",
        ["Financial Planning", "Budgeting", "Leadership"],
        12, 24, 5, 8],
    ],
  },

  {
    category: "Human Resources",
    companyIndexes: [8, 11, 14],

    focus:
      "Support talent acquisition, employee engagement " +
      "and organizational development.",

    responsibilities: [
      "Coordinate recruitment and onboarding activities",
      "Maintain accurate employee documentation",
      "Support employee engagement initiatives",
      "Collaborate with hiring managers and leadership",
    ],

    roles: [
      ["HR Executive",
        ["Recruitment", "Communication", "Excel"],
        3, 6, 0, 2],

      ["Talent Acquisition Specialist",
        ["Recruitment", "Interviewing", "Communication"],
        4, 8, 1, 3],

      ["HR Operations Associate",
        ["HR Operations", "Excel", "Documentation"],
        3, 7, 1, 3],

      ["Human Resources Intern",
        ["Communication", "Excel", "Recruitment"],
        1.2, 2.4, 0, 0],

      ["Learning & Development Specialist",
        ["Training", "Communication", "Leadership"],
        5, 11, 2, 4],

      ["HR Manager",
        ["HR Strategy", "Leadership", "Employee Relations"],
        10, 20, 5, 8],
    ],
  },

  {
    category: "Business & Management",
    companyIndexes: [11, 14, 3],

    focus:
      "Improve business operations, identify opportunities " +
      "and support organizational decision-making.",

    responsibilities: [
      "Analyze business requirements and processes",
      "Coordinate cross-functional initiatives",
      "Prepare reports and project documentation",
      "Identify opportunities for operational improvement",
    ],

    roles: [
      ["Business Analyst",
        ["Excel", "SQL", "Business Analysis", "Communication"],
        4, 9, 0, 2],

      ["Project Coordinator",
        ["Project Management", "Jira", "Communication"],
        4, 8, 1, 3],

      ["Operations Executive",
        ["Operations Management", "Excel", "Problem Solving"],
        3, 7, 0, 2],

      ["Business Development Intern",
        ["Communication", "Excel", "Market Research"],
        1.2, 3, 0, 0],

      ["Product Manager",
        ["Product Strategy", "Analytics", "Agile", "Communication"],
        10, 22, 3, 5],

      ["Senior Business Consultant",
        ["Business Strategy", "Leadership", "Analytics"],
        15, 28, 5, 8],
    ],
  },
];

// Generate individual job records

const workModes = [
  "Hybrid",
  "Remote",
  "On-site",
];

const extraLocations = [
  "Jaipur",
  "Ahmedabad",
  "Delhi",
  "Pune",
  "Gurugram",
  "Chennai",
];

const jobs = careerGroups.flatMap(
  (group, groupIndex) =>
    group.roles.map((role, roleIndex) => {
      const [
        title,
        skills,
        salaryMin,
        salaryMax,
        expMin,
        expMax,
      ] = role;

      const companyIndex =
        group.companyIndexes[
          roleIndex % group.companyIndexes.length
        ];

      const company = companies[companyIndex];

      const index =
        groupIndex * 6 + roleIndex;

      const internship =
        title.toLowerCase().includes("intern");

      let experienceLevel;

      if (internship) {
        experienceLevel = "Fresher";
      } else if (expMin <= 1) {
        experienceLevel = "Entry Level";
      } else if (expMin <= 4) {
        experienceLevel = "Mid Level";
      } else {
        experienceLevel = "Senior Level";
      }

      const location =
        roleIndex === 4
          ? extraLocations[
              groupIndex % extraLocations.length
            ]
          : company.headquarters.split(",")[0];

      const jobType = internship
        ? "Internship"
        : roleIndex === 4 && groupIndex % 2 === 0
          ? "Contract"
          : roleIndex === 0 && groupIndex % 4 === 3
            ? "Part-time"
            : "Full-time";

      const postedAt = new Date(
        Date.now() -
        (index % 14) * 24 * 60 * 60 * 1000
      );

      const deadline = new Date(
        Date.now() +
        (20 + index % 25) * 24 * 60 * 60 * 1000
      );

      return {
        title,

        slug: slugify(
          `${title}-${company.name}`
        ),

        companySlug: company.slug,

        category: group.category,

        industry: company.industry,

        location,

        workMode:
          workModes[
            (groupIndex + roleIndex) % 3
          ],

        jobType,

        experience: {
          min: expMin,
          max: expMax,
          level: experienceLevel,
        },

        salary: {
          min: Math.round(salaryMin * 100000),
          max: Math.round(salaryMax * 100000),
          currency: "INR",
          period: "year",
        },

        skills,

        description:
          `${company.name} is looking for a ${title} ` +
          `to join its collaborative professional team. ` +
          `${group.focus} You will contribute to meaningful ` +
          `projects, develop practical expertise and work ` +
          `with experienced colleagues. This demonstration ` +
          `listing is designed to represent a realistic ` +
          `career opportunity.`,

        responsibilities: [
          ...group.responsibilities,
          `Apply ${skills.slice(0, 2).join(" and ")} ` +
          `to relevant professional tasks`,
        ],

        requirements: [
          internship
            ? "Currently pursuing or recently completed a relevant degree"
            : "Bachelor's degree or equivalent practical experience",

          expMin === 0
            ? "Fresh graduates are welcome to apply"
            : `${expMin}-${expMax} years of relevant experience`,

          `Knowledge of ${skills.join(", ")}`,

          "Strong communication and problem-solving abilities",

          "Willingness to learn and collaborate",
        ],

        benefits: internship
          ? [
              "Professional mentorship",
              "Internship completion certificate",
              "Hands-on project experience",
              "Learning opportunities",
            ]
          : [...company.benefits],

        openings: (index % 4) + 1,

        featured:
          roleIndex === 0 ||
          (groupIndex < 4 && roleIndex === 1),

        trending:
          roleIndex === 1 ||
          roleIndex === 3,

        views: 0,
        postedAt,
        deadline,

        status: "Active",
        isDemo: true,
      };
    })
);

// Career advice articles

const articleRows = [
  {
    title:
      "How to Build a Resume That Actually Gets Noticed",

    category: "Resume Tips",

    accentColor: "#6254D9",

    tags: ["Resume", "Career", "Freshers"],

    content: [
      {
        heading: "Start with clarity",
        body:
          "A strong resume should make your qualifications easy to understand. Begin with your name, contact information and a concise professional summary. Use a clean layout and consistent formatting so recruiters can quickly identify your relevant experience.",
      },
      {
        heading: "Show achievements, not only responsibilities",
        body:
          "Explain what you accomplished in your projects and previous roles. Instead of simply listing technologies, describe what you built, the problems you solved and the outcomes you achieved. Include measurable results when they are available.",
      },
      {
        heading: "Customize your resume",
        body:
          "Review the job description before applying. Highlight relevant skills and experience without making unsupported claims. Proofread carefully and save the final resume as a clearly named PDF when the employer accepts that format.",
      },
    ],
  },

  {
    title:
      "10 Ways to Prepare for Your First Job Interview",

    category: "Interview Preparation",

    accentColor: "#2563EB",

    tags: ["Interview", "Freshers", "Preparation"],

    content: [
      {
        heading: "Research the opportunity",
        body:
          "Understand the company's products, industry and values. Read the job description carefully and identify the skills required for the role. Prepare examples that demonstrate those skills.",
      },
      {
        heading: "Practice your answers",
        body:
          "Practice introducing yourself, describing your projects, explaining challenges and discussing your strengths. Review technical fundamentals, conduct a mock interview and prepare examples using the situation, task, action and result structure.",
      },
      {
        heading: "Prepare for interview day",
        body:
          "Check your internet connection or travel arrangements, prepare necessary documents, dress appropriately and arrive on time. Listen carefully during the interview and prepare thoughtful questions for the interviewer.",
      },
    ],
  },

  {
    title:
      "A Beginner's Roadmap to a Career in Technology",

    category: "Career Guidance",

    accentColor: "#059669",

    tags: ["Technology", "Roadmap", "Learning"],

    content: [
      {
        heading: "Build strong foundations",
        body:
          "Start with programming fundamentals, operating systems, networking basics and version control. Understanding these concepts makes it easier to learn specialized technologies later.",
      },
      {
        heading: "Choose a specialization",
        body:
          "Explore software development, cybersecurity, data science, cloud computing and design. Complete small practical exercises in different areas before deciding which direction interests you most.",
      },
      {
        heading: "Create practical projects",
        body:
          "Build projects that solve meaningful problems. Document your decisions, publish your code when appropriate and explain the limitations of your work. Practical experience strengthens both your confidence and portfolio.",
      },
    ],
  },

  {
    title:
      "Remote vs Hybrid vs On-site: Choosing Your Work Style",

    category: "Workplace",

    accentColor: "#0891B2",

    tags: ["Remote", "Hybrid", "Workplace"],

    content: [
      {
        heading: "Understand remote work",
        body:
          "Remote work provides geographical flexibility but requires self-discipline, reliable communication and a suitable working environment. Consider whether you can remain productive without regular in-person supervision.",
      },
      {
        heading: "Explore hybrid work",
        body:
          "Hybrid roles combine office attendance with remote flexibility. They can support collaboration while reducing commuting, although expectations differ across employers.",
      },
      {
        heading: "Evaluate on-site opportunities",
        body:
          "On-site positions can provide direct mentorship, structured routines and stronger in-person interaction. Compare each work mode against your responsibilities, learning needs and personal preferences.",
      },
    ],
  },

  {
    title:
      "Essential Skills Every Modern Software Developer Needs",

    category: "Skill Development",

    accentColor: "#7C3AED",

    tags: ["Programming", "Software", "Git"],

    content: [
      {
        heading: "Learn beyond syntax",
        body:
          "Programming languages are important, but problem-solving, data structures, debugging and software design are equally valuable. Focus on understanding why an approach works rather than memorizing code.",
      },
      {
        heading: "Use professional development tools",
        body:
          "Become comfortable with Git, command-line tools, testing frameworks, APIs and databases. Practice developing applications that include realistic error handling and meaningful documentation.",
      },
      {
        heading: "Improve communication",
        body:
          "Developers work with designers, managers and other engineers. Learn to explain technical decisions clearly, request useful feedback and write understandable documentation.",
      },
    ],
  },

  {
    title:
      "How to Negotiate Your Salary with Confidence",

    category: "Salary & Growth",

    accentColor: "#D97706",

    tags: ["Salary", "Negotiation", "Career Growth"],

    content: [
      {
        heading: "Research realistic compensation",
        body:
          "Compare salary information for similar positions, experience levels and locations. Consider responsibilities and the overall compensation package rather than relying on a single salary figure.",
      },
      {
        heading: "Explain your value",
        body:
          "Present relevant skills, achievements and experience when discussing compensation. Communicate respectfully and explain why your expected range is appropriate for the position.",
      },
      {
        heading: "Consider the complete offer",
        body:
          "Evaluate benefits, professional development, flexibility, job stability and career progression alongside salary. Ask for written details before accepting an offer.",
      },
    ],
  },

  {
    title:
      "Building a Professional Portfolio as a College Student",

    category: "Career Guidance",

    accentColor: "#DB2777",

    tags: ["Portfolio", "Students", "Projects"],

    content: [
      {
        heading: "Select meaningful projects",
        body:
          "Choose a small number of projects that demonstrate different abilities. Explain the purpose of each project, your contribution, the technologies used and the challenges you addressed.",
      },
      {
        heading: "Make your work accessible",
        body:
          "Maintain organized repositories with clear README files. Add screenshots, setup instructions and demonstrations where appropriate. Ensure that confidential information and credentials are excluded.",
      },
      {
        heading: "Keep improving your portfolio",
        body:
          "Update your projects as your knowledge grows. Focus on quality, reliability and clear explanations rather than collecting a large number of incomplete applications.",
      },
    ],
  },

  {
    title:
      "Using AI Responsibly in Your Job Search",

    category: "Career Technology",

    accentColor: "#4F46E5",

    tags: ["AI", "Recommendations", "Job Search"],

    content: [
      {
        heading: "Use recommendations as guidance",
        body:
          "Intelligent recommendation systems can help discover relevant roles based on interests, skills and previous activity. However, recommendations are suggestions rather than guarantees of employment or professional suitability.",
      },
      {
        heading: "Review generated content",
        body:
          "AI tools can assist with resume improvement, interview preparation and learning plans. Review all generated information carefully and ensure that your applications accurately represent your qualifications.",
      },
      {
        heading: "Protect your personal information",
        body:
          "Avoid sharing unnecessary confidential documents or sensitive personal information. Understand how a platform uses your activity and review the available privacy controls.",
      },
    ],
  },
];

const articles = articleRows.map(
  (article, index) => ({
    ...article,

    slug: slugify(article.title),

    excerpt: article.content[0].body,

    author: "CareerLens Editorial",

    coverImage: "",

    readTime: Math.max(
      1,
      Math.ceil(
        article.content
          .map((section) => section.body)
          .join(" ")
          .split(/\s+/).length / 200
      )
    ),

    featured: index < 3,

    publishedAt: new Date(
      Date.now() -
      index * 2 * 24 * 60 * 60 * 1000
    ),

    status: "Published",
  })
);

module.exports = {
  companies,
  jobs,
  articles,
};