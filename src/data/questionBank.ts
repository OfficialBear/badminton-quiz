import type { Question } from '@/types/quiz'

/**
 * SAMPLE / DRAFT question bank.
 *
 * These items exist so the quiz → results → review flow can be exercised and
 * verified. They are NOT the official, rule-reviewed 100-question bank and are
 * marked `reviewStatus: 'draft'` on purpose. `ruleVersion` stays "pending"
 * until a human has checked each item against the current BWF Laws of Badminton.
 * The UI shows a "sample bank — not rule-reviewed" notice whenever draft
 * questions are used, and production must not present them as validated rules.
 */
export const QUESTION_BANK_VERSION = '0.0.1-draft'
export const RULE_VERSION = 'pending'

export const QUESTION_BANK: Question[] = [
  {
    id: 'q-scoring-01',
    category: 'scoring',
    type: 'true-false',
    difficulty: 'basic',
    question: {
      zh: '在标准比赛中，先得到 21 分且领先 2 分的一方赢下一局。',
      en: 'In a standard match, the side that first reaches 21 points with a two-point lead wins the game.',
    },
    options: [
      { id: 'true', text: { zh: '正确', en: 'True' } },
      { id: 'false', text: { zh: '错误', en: 'False' } },
    ],
    correctOptionIds: ['true'],
    explanation: {
      zh: '一局由先得到 21 分的一方获胜；20 平后需领先 2 分，最高到 30 分。',
      en: 'A game is won by the first side to reach 21 points; after 20-all a two-point lead is required, up to 30.',
    },
    ruleReference: 'BWF Laws of Badminton',
    ruleVersion: 'pending',
    reviewStatus: 'draft',
    tags: ['scoring', 'game'],
  },
  {
    id: 'q-scoring-02',
    category: 'scoring',
    type: 'single',
    difficulty: 'basic',
    question: {
      zh: '在没有出现平分（20 平）的情况下，赢下一局需要多少分？',
      en: 'Without a deuce situation, how many points are needed to win a game?',
    },
    options: [
      { id: 'p15', text: { zh: '15 分', en: '15 points' } },
      { id: 'p21', text: { zh: '21 分', en: '21 points' } },
      { id: 'p25', text: { zh: '25 分', en: '25 points' } },
      { id: 'p30', text: { zh: '30 分', en: '30 points' } },
    ],
    correctOptionIds: ['p21'],
    explanation: {
      zh: '正常情况下先得 21 分者获胜。',
      en: 'Normally the first side to 21 points wins the game.',
    },
    ruleReference: 'BWF Laws of Badminton',
    ruleVersion: 'pending',
    reviewStatus: 'draft',
    tags: ['scoring'],
  },
  {
    id: 'q-scoring-03',
    category: 'scoring',
    type: 'true-false',
    difficulty: 'intermediate',
    question: {
      zh: '比分达到 20 平后，比赛继续进行，直到一方领先 2 分，最高到 30 分。',
      en: 'At 20-all, play continues until one side leads by two points, up to a maximum of 30 points.',
    },
    options: [
      { id: 'true', text: { zh: '正确', en: 'True' } },
      { id: 'false', text: { zh: '错误', en: 'False' } },
    ],
    correctOptionIds: ['true'],
    explanation: {
      zh: '20 平后需净胜 2 分；29 平时先到 30 分的一方获胜。',
      en: 'After 20-all a two-point margin is required; at 29-all the side reaching 30 wins.',
    },
    ruleReference: 'BWF Laws of Badminton',
    ruleVersion: 'pending',
    reviewStatus: 'draft',
    tags: ['scoring', 'deuce'],
  },
  {
    id: 'q-service-01',
    category: 'service',
    type: 'single',
    difficulty: 'basic',
    question: {
      zh: '单打比赛中，当发球方得分为偶数时，应从哪个发球区发球？',
      en: 'In singles, from which service court should the server serve when their score is even?',
    },
    options: [
      { id: 'right', text: { zh: '右发球区', en: 'Right service court' } },
      { id: 'left', text: { zh: '左发球区', en: 'Left service court' } },
      { id: 'any', text: { zh: '任意发球区', en: 'Either service court' } },
      { id: 'receiver', text: { zh: '由接发球方决定', en: 'Decided by the receiver' } },
    ],
    correctOptionIds: ['right'],
    explanation: {
      zh: '发球方得分为偶数时从右发球区发球，奇数时从左发球区发球。',
      en: 'The server serves from the right court when their score is even and from the left when it is odd.',
    },
    ruleReference: 'BWF Laws of Badminton',
    ruleVersion: 'pending',
    reviewStatus: 'draft',
    tags: ['service', 'singles'],
  },
  {
    id: 'q-service-02',
    category: 'service',
    type: 'true-false',
    difficulty: 'intermediate',
    question: {
      zh: '发球方可以在接发球方准备好之前发球。',
      en: 'The server may serve before the receiver is ready.',
    },
    options: [
      { id: 'true', text: { zh: '正确', en: 'True' } },
      { id: 'false', text: { zh: '错误', en: 'False' } },
    ],
    correctOptionIds: ['false'],
    explanation: {
      zh: '发球方和接发球方都必须准备好后才能发球，否则应重发球。',
      en: 'Neither side may serve until both are ready; otherwise a let is called.',
    },
    ruleReference: 'BWF Laws of Badminton',
    ruleVersion: 'pending',
    reviewStatus: 'draft',
    tags: ['service', 'let'],
  },
  {
    id: 'q-service-03',
    category: 'service',
    type: 'multiple',
    difficulty: 'expert',
    question: {
      zh: '以下哪些是合法的发球要求？（请选择所有符合的选项）',
      en: 'Which of the following are valid service requirements? (Select all that apply.)',
    },
    options: [
      {
        id: 'feet',
        text: { zh: '发球时双方双脚不得移动，脚的一部分须与地面接触', en: 'Neither side may move their feet; part of each foot must touch the floor' },
      },
      {
        id: 'waist',
        text: { zh: '击球瞬间整只球必须低于发球方的腰部', en: 'At the moment of impact the whole shuttle must be below the server\u2019s waist' },
      },
      {
        id: 'racket',
        text: { zh: '击球时球拍的拍头应指向下方', en: 'The racket head must be pointing downwards at impact' },
      },
      {
        id: 'toss',
        text: { zh: '发球方可以先将球向上抛起再击打', en: 'The server may toss the shuttle upwards before hitting it' },
      },
    ],
    correctOptionIds: ['feet', 'waist', 'racket'],
    explanation: {
      zh: '合法发球要求包含脚部动作、击球点低于腰部以及拍头向下；把球抛起再击打不是合法发球方式。',
      en: 'Valid service includes foot position, impact below the waist and a downward racket head; tossing the shuttle up is not a legal serve.',
    },
    ruleReference: 'BWF Laws of Badminton',
    ruleVersion: 'pending',
    reviewStatus: 'draft',
    tags: ['service', 'fault'],
  },
  {
    id: 'q-court-01',
    category: 'court',
    type: 'true-false',
    difficulty: 'basic',
    question: {
      zh: '如果球落在场地的界线上，应判为界内。',
      en: 'If the shuttle lands on a boundary line, it is considered in.',
    },
    options: [
      { id: 'true', text: { zh: '正确', en: 'True' } },
      { id: 'false', text: { zh: '错误', en: 'False' } },
    ],
    correctOptionIds: ['true'],
    explanation: {
      zh: '球触到界线即算界内。',
      en: 'A shuttle that touches a line is in.',
    },
    ruleReference: 'BWF Laws of Badminton',
    ruleVersion: 'pending',
    reviewStatus: 'draft',
    tags: ['court', 'line'],
  },
  {
    id: 'q-faults-01',
    category: 'faults',
    type: 'multiple',
    difficulty: 'intermediate',
    question: {
      zh: '以下哪些情况属于违例？（请选择所有符合的选项）',
      en: 'Which of the following are faults? (Select all that apply.)',
    },
    options: [
      {
        id: 'net',
        text: { zh: '球员在球尚未成死球前触网', en: 'A player touches the net while the shuttle is still in play' },
      },
      {
        id: 'double',
        text: { zh: '同一名球员在一次击球中连续两次击中球', en: 'The same player hits the shuttle twice in one stroke' },
      },
      {
        id: 'out',
        text: { zh: '球落在界外', en: 'The shuttle lands outside the boundary lines' },
      },
      {
        id: 'let',
        text: { zh: '重发球', en: 'A let is called' },
      },
    ],
    correctOptionIds: ['net', 'double', 'out'],
    explanation: {
      zh: '触网、连击和球出界都属于违例；重发球不是违例，而是重新发球。',
      en: 'Touching the net, a double hit and hitting out are faults; a let is not a fault but a replay.',
    },
    ruleReference: 'BWF Laws of Badminton',
    ruleVersion: 'pending',
    reviewStatus: 'draft',
    tags: ['faults', 'net', 'double-hit'],
  },
  {
    id: 'q-officials-01',
    category: 'officials',
    type: 'single',
    difficulty: 'expert',
    question: {
      zh: '在正式比赛中，主要负责宣报发球违例的是谁？',
      en: 'In an official match, who is primarily responsible for calling service faults?',
    },
    options: [
      { id: 'umpire', text: { zh: '裁判员', en: 'The umpire' } },
      { id: 'service-judge', text: { zh: '发球裁判员', en: 'The service judge' } },
      { id: 'line-judge', text: { zh: '司线员', en: 'A line judge' } },
      { id: 'referee', text: { zh: '裁判长', en: 'The referee' } },
    ],
    correctOptionIds: ['service-judge'],
    explanation: {
      zh: '发球裁判员负责判断发球是否违例，并向裁判员示意。',
      en: 'The service judge decides whether a service is a fault and signals the umpire.',
    },
    ruleReference: 'BWF Laws of Badminton',
    ruleVersion: 'pending',
    reviewStatus: 'draft',
    tags: ['officials', 'service-judge'],
  },
  {
    id: 'q-scenario-01',
    category: 'scenario',
    type: 'scenario',
    difficulty: 'intermediate',
    question: {
      zh: '回合中，球触网后下落并落在击球方的己方场区地面。应如何判罚？',
      en: "During a rally the shuttle hits the net and then falls to the floor on the striker's own side. What is the ruling?",
    },
    options: [
      { id: 'fault', text: { zh: '击球方违例，对方得分', en: 'Fault against the striker; the opponent scores' } },
      { id: 'let', text: { zh: '重发球', en: 'A let' } },
      { id: 'play-on', text: { zh: '继续比赛', en: 'Play continues' } },
      { id: 'opponent-fault', text: { zh: '判对方违例', en: 'Fault against the opponent' } },
    ],
    correctOptionIds: ['fault'],
    explanation: {
      zh: '球未越过网并落在击球方己方场区，属于击球方违例，对方得分。',
      en: 'The shuttle failed to cross the net and fell on the striker\u2019s own side, a fault against the striker.',
    },
    ruleReference: 'BWF Laws of Badminton',
    ruleVersion: 'pending',
    reviewStatus: 'draft',
    tags: ['scenario', 'fault'],
  },
]
