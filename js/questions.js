// Crew intake questionnaires.
// Each role gets the shared PERSONNEL questions plus its own. Question ids must stay
// stable once players start submitting — the text can change, the id shouldn't.

const PERSONNEL = [
  { id: "p_years", q: "How long have you been in the life, and what was the job that got you started?" },
  { id: "p_cut", q: "What's your cut for? Be specific — who or what is that money going to?" },
  { id: "p_home", q: "Who's waiting up for you tonight — or who finally stopped waiting?" },
  { id: "p_lastjob", q: "Your last job ended with you waking up somewhere you didn't fall asleep. What's the last thing you remember before it went dark?" },
  { id: "p_rule", q: "Every goon has one rule they never break on a job. What's yours, and who taught it to you?" },
  { id: "p_rumor", q: "There's a rumor going around the crews that you flat-out refuse to believe. What is it?" },
];

const ROLES = [
  {
    id: "muscle",
    title: "The Muscle",
    tag: "Hits things. Gets hit. Stays standing.",
    questions: [
      { id: "m_hospital", q: "How many people have you put in the hospital, and which one still visits you in your sleep?" },
      { id: "m_weapon", q: "What's the one thing you won't walk into a job without, and why can't you let it go?" },
      { id: "m_beaten", q: "Only one person has ever put you on the ground. You never saw their face. What do you tell people happened instead?" },
      { id: "m_bullet", q: "Which member of this crew would you take a bullet for, and why does that embarrass you?" },
      { id: "m_ceiling", q: "Why do you always check the ceiling when you walk into a room?" },
      { id: "m_soft", q: "What's the soft thing about you that nobody on the crew has figured out yet?" },
      { id: "m_afraid", q: "What are you actually afraid of? Not the tough-guy answer." },
    ],
  },
  {
    id: "wheelman",
    title: "The Wheelman",
    tag: "Knows every alley. Hates being away from the car.",
    questions: [
      { id: "w_inside", q: "For this job the boss insisted you come inside instead of waiting in the car. Why didn't you argue?" },
      { id: "w_engine", q: "There's one engine sound that makes your hands shake on the wheel. Describe it." },
      { id: "w_route", q: "What route do you know that no cop in the city has ever figured out?" },
      { id: "w_teacher", q: "Who taught you to drive, and why don't you talk about what happened to them?" },
      { id: "w_glovebox", q: "What do you always keep in the glovebox?" },
      { id: "w_close", q: "What's the closest you've ever come to getting pinched? What saved you?" },
      { id: "w_exit", q: "You have an exit rule — the moment you leave, no matter who's still inside. What is it?" },
    ],
  },
  {
    id: "safecracker",
    title: "The Safecracker",
    tag: "Gentle hands. Patient. Paid by the tumbler.",
    questions: [
      { id: "s_lock", q: "Which lock has never opened for you, and why do you still think about it?" },
      { id: "s_roll", q: "What's in the leather roll you carry, and which tool did you steal from your mentor?" },
      { id: "s_finger", q: "How did you lose the tip of your finger?" },
      { id: "s_mentor", q: "Who taught you the trade, and why won't they answer your calls anymore?" },
      { id: "s_kept", q: "What's the one thing you took from a vault that you never fenced?" },
      { id: "s_silence", q: "When you work, you go so quiet you can hear the whole building. Last job, you heard something that shouldn't have been there. What was it?" },
      { id: "s_count", q: "Why do you count under your breath?" },
    ],
  },
  {
    id: "lookout",
    title: "The Lookout",
    tag: "Eyes open. Mouth shut. Usually.",
    questions: [
      { id: "l_rooftop", q: "On your last job you saw something on a rooftop and said nothing. What did you see, and why did you keep quiet?" },
      { id: "l_signal", q: "What's your warning signal, and how many times has it actually gotten someone out?" },
      { id: "l_missed", q: "Somebody went away for a long time because you missed something. Who, and what did you miss?" },
      { id: "l_awake", q: "What do you do to stay awake on a long night?" },
      { id: "l_trust", q: "Who on this crew don't you trust, and what did you see them do?" },
      { id: "l_habit", q: "What's the habit you have that drives the rest of the crew nuts?" },
      { id: "l_quiet", q: "Why does it bother you when the city gets quiet?" },
    ],
  },
  {
    id: "brains",
    title: "The Brains",
    tag: "Made the plan. Will not be blamed for the plan.",
    questions: [
      { id: "b_life", q: "Why is this the job that sets you up for life?" },
      { id: "b_secret", q: "What part of the plan didn't you tell the rest of the crew?" },
      { id: "b_blueprints", q: "Who gave you the blueprints, and why didn't they ask to be paid?" },
      { id: "b_contingency", q: "What contingency did you plan for that the crew laughed at?" },
      { id: "b_variable", q: "There's one variable you can't account for, and it keeps you up at night. What is it?" },
      { id: "b_expendable", q: "Who on this crew is the most expendable in your plan? Do they know?" },
      { id: "b_lastcrew", q: "The last crew you planned for all went away. What did they say about you at the trial?" },
    ],
  },
  {
    id: "wire",
    title: "The Wire",
    tag: "Alarms, cameras, phones. Talks to machines better than people.",
    questions: [
      { id: "t_alarm", q: "What security system are you here to beat, and how long do you need?" },
      { id: "t_blindspot", q: "Lately camera feeds you've tapped keep showing the same blind spot — a patch that's a little too dark. Why haven't you told anyone?" },
      { id: "t_backdoor", q: "What's the backdoor you built that you never told the boss about?" },
      { id: "t_deleted", q: "What did you see on a camera once that you deleted, and why?" },
      { id: "t_tapped", q: "Why are you convinced your phone has been tapped?" },
      { id: "t_straight", q: "You could have had a straight job. What happened?" },
      { id: "t_gadget", q: "What's the homemade gadget you're proudest of, and has it ever actually worked?" },
    ],
  },
  {
    id: "trigger",
    title: "The Trigger",
    tag: "Carries the heavy iron. Never misses. Mostly.",
    questions: [
      { id: "g_missed", q: "You once emptied a full magazine and hit nothing. What were you shooting at?" },
      { id: "g_gun", q: "What do you carry, and what did you name it?" },
      { id: "g_never", q: "Who is the one person you'd never pull the trigger on, even if the boss ordered it?" },
      { id: "g_counting", q: "How many times have you actually fired on a job? Why is the number lower than everyone thinks?" },
      { id: "g_light", q: "Why do you always pack a second flashlight?" },
      { id: "g_owed", q: "Who on this crew owes you their life, and have they ever thanked you?" },
      { id: "g_quit", q: "What would make you put the gun down for good?" },
    ],
  },
  {
    id: "doc",
    title: "The Doc",
    tag: "Lost the license. Kept the bedside manner. Some of it.",
    questions: [
      { id: "d_license", q: "Why did you lose your medical license?" },
      { id: "d_injuries", q: "The guys you patch up from other crews keep coming in with the same injuries — broken jaws, dislocated shoulders, never a bullet wound. What do they tell you happened?" },
      { id: "d_bag", q: "What's in your bag besides the medical gear?" },
      { id: "d_lost", q: "Who's the patient you couldn't save, and why do you still carry something of theirs?" },
      { id: "d_hands", q: "Why do your hands shake when you're not working?" },
      { id: "d_crew", q: "Which member of the crew have you already patched up once, and what did they make you promise not to tell?" },
      { id: "d_oath", q: "Is there any part of the oath you still keep?" },
    ],
  },
  {
    id: "inside",
    title: "The Inside Man",
    tag: "Worked the place for months under a fake name.",
    questions: [
      { id: "i_name", q: "What's the fake name on your badge, and who at the place actually likes you?" },
      { id: "i_nightshift", q: "What did you notice about the night shift there that nobody else has?" },
      { id: "i_tell", q: "Everybody has a tell. What's yours when you lie?" },
      { id: "i_rat", q: "Why would the boss suspect you're a rat?" },
      { id: "i_guilt", q: "Who on the inside are you going to feel bad about when this goes down?" },
      { id: "i_door", q: "There's a door in that building you've never been able to get through, and no one will tell you what's behind it. Where is it?" },
      { id: "i_after", q: "What are you going to do once you never have to go back there?" },
    ],
  },
  {
    id: "rookie",
    title: "The Rookie",
    tag: "First real job. Desperately trying to look cool.",
    questions: [
      { id: "r_vouch", q: "Who vouched for you to get on this job, and what do you owe them now?" },
      { id: "r_lie", q: "What did you lie about to get hired?" },
      { id: "r_money", q: "Why do you need the money right now?" },
      { id: "r_advice", q: "The veterans gave you one piece of advice about working nights. What was it, and did they sound serious?" },
      { id: "r_hero", q: "Who on this crew do you look up to, and what don't they know about you?" },
      { id: "r_promise", q: "What did you promise someone you'd never do?" },
      { id: "r_pocket", q: "What's the thing in your pocket you keep touching for luck?" },
    ],
  },
];

const FINAL_QUESTION = {
  id: "f_name",
  q: "Last one. The boss doesn't learn names, so it's stencilled on your jumpsuit. What does it say?",
};
