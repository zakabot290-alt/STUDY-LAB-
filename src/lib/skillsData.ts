import { SkillNode } from '../types';

export const INITIAL_SKILL_NODES: SkillNode[] = [
  // 1. Mathematics
  {
    id: 'skill_math_1',
    category: 'Mathematics',
    categoryAr: 'الرياضيات',
    title: 'Algebraic Fundamentals',
    titleAr: 'الجبر الخطي والمصفوفات',
    description: 'Master polynomial manipulations, system of equations, and coordinate geometry.',
    descriptionAr: 'التحكم في كثيرات الحدود، وحل أنظمة المعادلات الخطية والمصفوفات.',
    tier: 1,
    requiredXp: 0,
    unlocked: true,
    challenges: [
      { id: 'ch_math_1', title: 'Solve 5 system equations', titleAr: 'حل 5 أنظمة معادلات خطية', xpReward: 30, completed: true },
      { id: 'ch_math_2', title: 'Compute matrix eigenvalues', titleAr: 'حساب القيم الذاتية لمصفوفة', xpReward: 50, completed: false },
    ],
  },
  {
    id: 'skill_math_2',
    category: 'Mathematics',
    categoryAr: 'الرياضيات',
    title: 'Multivariable Calculus',
    titleAr: 'التفاضل والتكامل متعدد المتغيرات',
    description: 'Gradient vectors, double integrals, and partial derivatives.',
    descriptionAr: 'متجهات التدرج، التكاملات الثنائية والثلاثية، والمشتقات الجزئية.',
    tier: 2,
    requiredXp: 300,
    unlocked: false,
    challenges: [
      { id: 'ch_math_3', title: 'Derive Stokes theorem', titleAr: 'برهان نظرية ستوكس في الحقول المتجهة', xpReward: 60, completed: false },
    ],
  },

  // 2. Logical Thinking
  {
    id: 'skill_logic_1',
    category: 'Logical Thinking',
    categoryAr: 'التفكير المنطقي',
    title: 'Propositional Logic',
    titleAr: 'منطق القضايا وجداول الصدق',
    description: 'Truth tables, De Morgan’s laws, and formal syllogisms.',
    descriptionAr: 'جداول الصواب والخطأ، قوانين دي مورغان، والقياس الأرسطي الصوري.',
    tier: 1,
    requiredXp: 0,
    unlocked: true,
    challenges: [
      { id: 'ch_log_1', title: 'Solve 3 truth table deductions', titleAr: 'حل 3 جداول صدق مركبة', xpReward: 35, completed: true },
    ],
  },
  {
    id: 'skill_logic_2',
    category: 'Logical Thinking',
    categoryAr: 'التفكير المنطقي',
    title: 'Cognitive Bias Mitigation',
    titleAr: 'تحييد الانحيازات المعرفية والتفكير النقدي',
    description: 'Identifying logical fallacies and Bayesian updating under uncertainty.',
    descriptionAr: 'رصد المغالطات المنطقية والتحديث البايزي للاحتمالات عند نقص المعلومات.',
    tier: 2,
    requiredXp: 250,
    unlocked: false,
    challenges: [
      { id: 'ch_log_2', title: 'Detect 5 informal fallacies', titleAr: 'استخراج 5 مغالطات في مقال جدلي', xpReward: 50, completed: false },
    ],
  },

  // 3. Programming
  {
    id: 'skill_prog_1',
    category: 'Programming',
    categoryAr: 'البرمجة وهندسة البرمجيات',
    title: 'Algorithmic Thinking',
    titleAr: 'التفكير الخوارزمي وبنى المعطيات',
    description: 'Writing optimal logic in Kotlin, TypeScript, and Python.',
    descriptionAr: 'صياغة منطق خوارزمي فعال وتحسين استهلاك الذاكرة والمعالج.',
    tier: 1,
    requiredXp: 0,
    unlocked: true,
    challenges: [
      { id: 'ch_prog_1', title: 'Implement binary search', titleAr: 'برمجة خوارزمية البحث الثنائي', xpReward: 40, completed: true },
    ],
  },
  {
    id: 'skill_prog_2',
    category: 'Programming',
    categoryAr: 'البرمجة وهندسة البرمجيات',
    title: 'Android & Clean Architecture',
    titleAr: 'هندسة تطبيقات أندرويد المعمارية',
    description: 'Jetpack Compose, Room WAL caching, and Coroutine dispatchers.',
    descriptionAr: 'إتقان Jetpack Compose، ومستودعات Room غير المتزامنة ومحددات المسارات.',
    tier: 2,
    requiredXp: 400,
    unlocked: false,
    challenges: [
      { id: 'ch_prog_2', title: 'Build a Room offline repository', titleAr: 'بناء مستودع بيانات محلي في Room', xpReward: 80, completed: false },
    ],
  },

  // 4. English Language
  {
    id: 'skill_eng_1',
    category: 'English Language',
    categoryAr: 'اللغة الإنجليزية الأكاديمية',
    title: 'Scholarly Lexicon & Syntax',
    titleAr: 'المفردات الأكاديمية والتراكيب المتقدمة',
    description: 'High-register rhetoric, academic phraseology, and technical writing.',
    descriptionAr: 'المصطلحات البحثية والتحليلية وكتابة الأوراق الأكاديمية بدقة.',
    tier: 1,
    requiredXp: 0,
    unlocked: true,
    challenges: [
      { id: 'ch_eng_1', title: 'Master 20 GRE/TOEFL keywords', titleAr: 'إتقان 20 مصطلحاً أكاديمياً متقدماً', xpReward: 35, completed: false },
    ],
  },

  // 5. Problem Solving
  {
    id: 'skill_prob_1',
    category: 'Problem Solving',
    categoryAr: 'حل المشكلات المعقدة',
    title: 'First Principles Decomposition',
    titleAr: 'التفكيك إلى المبادئ الأولى',
    description: 'Breaking down multifaceted systems into irreducible physical and logical truths.',
    descriptionAr: 'تفكيك المعضلات المعقدة إلى حقائقها الأولية غير القابلة للاختزال.',
    tier: 1,
    requiredXp: 100,
    unlocked: true,
    challenges: [
      { id: 'ch_prob_1', title: 'Deconstruct a physics system', titleAr: 'تفكيك مسألة فيزيائية إلى المبادئ الأولى', xpReward: 45, completed: false },
    ],
  },

  // 6. Research Skills
  {
    id: 'skill_res_1',
    category: 'Research Skills',
    categoryAr: 'مهارات البحث والتوثيق',
    title: 'Literature Synthesis',
    titleAr: 'التوليف البيبليوغرافي وتقييم المصادر',
    description: 'Critiquing methodologies, cross-referencing papers, and synthesizing findings.',
    descriptionAr: 'فحص منهجيات الأوراق العلمية واستخلاص البراهين الموثوقة.',
    tier: 1,
    requiredXp: 150,
    unlocked: true,
    challenges: [
      { id: 'ch_res_1', title: 'Synthesize 3 scholarly studies', titleAr: 'كتابة مقارنة منهجية لثلاث أوراق بحثية', xpReward: 50, completed: false },
    ],
  },

  // 7. Learning Techniques
  {
    id: 'skill_tech_1',
    category: 'Learning Techniques',
    categoryAr: 'تقنيات التعلم الفائق',
    title: 'Feynman Technique & Metacognition',
    titleAr: 'تقنية فاينمان والميتامعرفة',
    description: 'Simplifying complex theorems to plain language to expose knowledge gaps.',
    descriptionAr: 'شرح المفاهيم المعقدة بلغة مبسطة لاكتشاف الفجوات الإدراكية وسدها.',
    tier: 1,
    requiredXp: 0,
    unlocked: true,
    challenges: [
      { id: 'ch_tech_1', title: 'Explain a theorem to a novice', titleAr: 'تدوين شرح مبسط لمفهوم فيزيائي/رياضي', xpReward: 30, completed: true },
    ],
  },
];
