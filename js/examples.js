// Example answers, so nobody has to start from a blank page.
// The first one shows as faded placeholder text; "Give me one" cycles through them all.

const EXAMPLE_NAMES = [
  "Dominic \"Dom\" Ferraro", "Lou Kettering", "Rosa Mancini", "Vernon Pike", "Teddy Marsh",
  "Augie Delacroix", "Carla Ruiz", "Sal Benedetto", "Mickey O'Rourke", "Benny Kowalski",
  "Frankie Vance", "Ruth \"Ruthie\" Gale", "Otis Pell", "Gina Torres", "Leo Szabo",
];

const EXAMPLE_LOOKS = [
  "Broken nose, borrowed suit, smells like motor oil",
  "Six foot five, soft voice, knuckles like walnuts",
  "Wiry, twitchy, chews toothpicks down to splinters",
  "Too-clean sneakers and a jacket two sizes too big",
  "Grey at the temples, reading glasses on a chain",
  "Neck tattoo they regret, gold tooth they don't",
  "Always cold. Always in a scarf. Even in July.",
  "Looks like somebody's uncle. Is somebody's uncle.",
];

const EXAMPLE_STENCILS = ["GOON #4", "KNUCKLES", "MR. TUESDAY", "LEFTY", "NUMBER 9", "SPARKY", "THE NEW GUY", "BIG LOU", "HENCH 12", "BUTTONS"];

const EXAMPLES = {
  // Personnel
  p_years: [
    "Eleven years. Started running numbers for my uncle when I was fourteen.",
    "Three years. I drove a getaway car for a bank job and nobody ever asked me to stop.",
    "Since the docks closed. Turned out the only people still hiring were the wrong ones.",
  ],
  p_cut: [
    "My kid sister's tuition. She's going to be a lawyer. She thinks I sell insurance.",
    "Paying off a man named Eddie before Eddie stops being patient.",
    "A diner. Twelve stools, one booth, no customers named after weather.",
  ],
  p_home: [
    "My ma. She leaves the porch light on until I'm back. Every time.",
    "Nobody. My wife took the dog and the good towels two winters ago.",
    "A goldfish called Dutch. He's seen things.",
  ],
  p_lastjob: [
    "A warehouse on the east side. Somebody said 'did you hear that?' and then I woke up zip-tied to a lamppost.",
    "The lights went out. Then a sound like a sail catching wind. Then the ambulance.",
    "Counting the money. I got to four thousand and then I was on the floor and it was morning.",
  ],
  p_rule: [
    "Never work on a full moon. My first boss went in on one and never came out.",
    "Never leave a man behind. Learned it the hard way, from the man I left.",
    "Always know two exits. My old cellmate drew them on napkins at every diner.",
  ],
  p_rumor: [
    "That there's something on the rooftops picking off crews. Ghost stories for rookies.",
    "That the cops have a guy who doesn't play by cop rules. Nobody works for free.",
    "That the boss has never once been seen in daylight.",
  ],

  // The Muscle
  m_hospital: [
    "Nineteen. The one that bothers me is the bouncer at the Starlite. He just wanted to go home.",
    "Lost count after thirty. I remember the one who said thank you.",
  ],
  m_weapon: [
    "A length of chain my grandfather used on the boats. Feels like he's got my back.",
    "Brass knuckles with my initials on them. A gift from my first boss.",
  ],
  m_beaten: [
    "I say it was three guys with bats. It was one guy and I never even saw him move.",
    "I tell people I slipped on ice. In August.",
  ],
  m_bullet: [
    "The Rookie. Kid reminds me of my little brother, and I'd never say that out loud.",
    "The Doc. They sewed my ear back on and never told anyone I cried.",
  ],
  m_ceiling: [
    "Old habit from a job that went bad. Something came from above. I don't talk about it.",
    "My cellmate told me the dangerous ones never come through the door.",
  ],
  m_soft: [
    "I knit. Scarves, mostly. Half the crew is wearing one and doesn't know it.",
    "I still write letters to my third-grade teacher.",
  ],
  m_afraid: [
    "The dark. Not the dark itself — what's quiet in it.",
    "Being forgotten. Ending up a name nobody stencils anymore.",
  ],

  // The Wheelman
  w_inside: [
    "Because the boss doesn't ask twice, and the last guy who argued drives a bus now.",
    "Because the money's inside, and I've been stiffed by crews before.",
  ],
  w_engine: [
    "Low. Too low for a car. Like a jet that's learned to purr.",
    "A turbine whine that comes from nowhere and is gone before you can look.",
  ],
  w_route: [
    "Through the old rail yard, under the freeway, out by the cannery. Forty seconds, no lights.",
    "The parking garage on 5th has a back ramp nobody's used since the seventies.",
  ],
  w_teacher: [
    "My old man, in a stolen Buick. He's not around anymore and I don't like the reason.",
    "A stunt driver who lost a bet. They're in a wheelchair now and still the best I've seen.",
  ],
  w_glovebox: [
    "Fake registration, a roll of quarters, and my daughter's drawing of the car.",
    "A rosary and a can of tear gas. Covering all the options.",
  ],
  w_close: [
    "Rolled a car into the river with two cops behind me. A tow truck saved me — wrong car got towed.",
    "Got boxed in on the bridge. A truck blew a tire and the whole lane cleared.",
  ],
  w_exit: [
    "If I hear sirens and nobody's out in three minutes, I'm gone.",
    "If the lights go out, I leave. That's it. That's the rule.",
  ],

  // The Safecracker
  s_lock: [
    "A Kessler 900 in a jeweller's basement. It laughed at me. I swear I heard it.",
    "The old safe in my father's study. He took the combination with him.",
  ],
  s_roll: [
    "Picks, a stethoscope, a dentist's mirror. The tension wrench was my mentor's, and they never knew.",
    "Twelve tools, eleven bought. The diamond drill bit, I liberated.",
  ],
  s_finger: [
    "A time lock with a nasty sense of humour.",
    "Car door. Embarrassing. I tell people it was a Doberman.",
  ],
  s_mentor: [
    "An old man called Ignatz. I took a job he told me not to, and someone got hurt.",
    "My aunt. She went straight, and I'm the reason she can't forget the old life.",
  ],
  s_kept: [
    "A pocket watch with someone else's initials. It still ticks. I check it every night.",
    "A child's music box. I couldn't sell it. I couldn't give it back either.",
  ],
  s_silence: [
    "Footsteps above me. On the roof. Then nothing. The building was empty.",
    "Breathing. Slow and patient. Not mine.",
  ],
  s_count: [
    "Started doing it in juvie to stay calm. Now I can't stop.",
    "Tumblers have a rhythm. If I lose the count, I lose the lock.",
  ],

  // The Lookout
  l_rooftop: [
    "A shape on the water tower. Bigger than a man should be. I told myself it was a tarp.",
    "Two eyes reflecting in the dark. Too high up for a cat.",
  ],
  l_signal: [
    "Two short whistles and a long one. Got four people out. Didn't get one.",
    "I flick my lighter three times. Nobody else smokes, so they always know it's me.",
  ],
  l_missed: [
    "Benny went down for six years. I missed a squad car with its lights off.",
    "My cousin. I was watching the street. It didn't come from the street.",
  ],
  l_awake: [
    "Sunflower seeds and true-crime paperbacks.",
    "I count windows. Lit, dark, lit. I know every building on the block by heart.",
  ],
  l_trust: [
    "The Inside Man. I saw them make a phone call from a payphone they said they'd never used.",
    "The Brains. They checked their watch right before the last job went bad.",
  ],
  l_habit: [
    "I narrate everything under my breath, like a nature documentary.",
    "I hum. Same four bars. Nobody knows what song it is, me included.",
  ],
  l_quiet: [
    "The city's never quiet. When it is, it's because something's listening.",
    "Last time it went quiet, a whole crew vanished before sunrise.",
  ],

  // The Brains
  b_life: [
    "It's the one score where nobody gets hurt. On paper.",
    "Because after this, I never have to plan for anyone else again.",
  ],
  b_secret: [
    "There's a second exit. Only big enough for one.",
    "The buyer isn't who the boss thinks it is.",
  ],
  b_blueprints: [
    "A woman in a grey coat at the library. She said 'consider it a gift'.",
    "An envelope under my door. No stamp. No name. My exact handwriting on the front.",
  ],
  b_contingency: [
    "What if the power goes out? They laughed. I brought flashlights for everyone.",
    "What if we're being watched before we even go in?",
  ],
  b_variable: [
    "The night guard schedule has a gap nobody can explain. Somebody's covering that floor, and it isn't on payroll.",
    "Every plan I make for this city goes wrong in the same way. From above.",
  ],
  b_expendable: [
    "The Rookie. The plan only works if somebody's slow.",
    "The Muscle. Big target. Big distraction.",
  ],
  b_lastcrew: [
    "'Ask the genius why they weren't in the van.'",
    "Nothing. That was worse.",
  ],

  // The Wire
  t_alarm: [
    "A Halvorsen Mark IV with motion sensors. Six minutes, if nobody breathes on me.",
    "Pressure plates and a silent alarm on a separate line. Two minutes for the line, a prayer for the plates.",
  ],
  t_blindspot: [
    "Because every time I zoom in, the dark patch is somewhere else.",
    "Because I'm afraid that if I say it out loud, it'll be in this feed too.",
  ],
  t_backdoor: [
    "A kill switch on every camera system I've ever installed. Including the boss's.",
    "I can listen to the boss's phone. I never have. Mostly.",
  ],
  t_deleted: [
    "A guy getting lifted off the ground by nothing I could see. Ten frames. I deleted it and threw up.",
    "Me. Somewhere I'd never been, on a night I can't remember.",
  ],
  t_tapped: [
    "There's a click on every call. And last week someone said my name before I picked up.",
    "My battery dies at the same time every night. 2:13 AM.",
  ],
  t_straight: [
    "Got fired from the phone company for 'creative billing'.",
    "Scholarship to State. Lost it the day I showed my professor what I could get into.",
  ],
  t_gadget: [
    "A garage-door opener that opens every garage door on the street. Worked once. Spectacularly.",
    "Night-vision goggles made from a camcorder. They work if you don't mind everything being green and blurry.",
  ],

  // The Trigger
  g_missed: [
    "A shape in the rafters. I saw it. Every bullet went into dark wood.",
    "Something moving fast between two streetlights. It was never where I aimed.",
  ],
  g_gun: [
    "A snub-nose .38 called Dolores. After my grandmother. Both terrifying.",
    "A pump shotgun called 'The Argument'. It ends them.",
  ],
  g_never: [
    "My brother. He's a cop. We don't talk about it at Thanksgiving.",
    "The Rookie. Kid has a mom who waits up.",
  ],
  g_counting: [
    "Twice. I'm all bluff, and the bluff works ninety percent of the time.",
    "Once. I don't like what happened after.",
  ],
  g_light: [
    "On my first job the lights went out and the first flashlight never came back on.",
    "Because darkness is when things go wrong. Always.",
  ],
  g_owed: [
    "The Wheelman. Pulled them out of a burning car. They bought me a coffee. That's it.",
    "The Muscle. Twice. They think I don't remember.",
  ],
  g_quit: [
    "If I ever see the thing everybody whispers about. That's when I'm done.",
    "A kid of my own. Or a reason to stop looking over my shoulder.",
  ],

  // The Doc
  d_license: [
    "Wrote prescriptions for people who didn't exist. Then for people who shouldn't.",
    "Operated drunk. The patient lived. The board didn't care.",
  ],
  d_injuries: [
    "They say they 'fell'. Every one of them. Same fall, apparently. From the same height.",
    "They won't say. They just look at the window.",
  ],
  d_bag: [
    "A flask, a photo of my old clinic, and smelling salts I use on myself.",
    "A paperback poetry collection and a scalpel I've never used for surgery.",
  ],
  d_lost: [
    "A teenager. Gunshot. I still carry their bus pass in my wallet.",
    "My first patient. A fisherman. I keep his lucky lure on my keychain.",
  ],
  d_hands: [
    "Withdrawal. From what, I won't say.",
    "Because when I'm not working, I'm thinking about the ones I couldn't save.",
  ],
  d_crew: [
    "The Trigger. A gunshot wound they gave themselves. Accidentally. Twice.",
    "The Lookout. Stress ulcer. They're terrified of something and won't say what.",
  ],
  d_oath: [
    "'First, do no harm.' I interpret it loosely.",
    "I don't let anyone die on my table. That's the only part left.",
  ],

  // The Inside Man
  i_name: [
    "'Gerald'. The receptionist brings me cookies. I'm going to feel terrible.",
    "'Sam Price'. The night janitor calls me kid and shares his sandwiches.",
  ],
  i_nightshift: [
    "The guards never go up to the top floor. They say it's 'covered'. By who?",
    "The cameras on the east side all reboot at 2:13 every night. Nobody's ever asked why.",
  ],
  i_tell: [
    "I touch my ear. I've practised not doing it. I still do it.",
    "I get more polite. Way more polite.",
  ],
  i_rat: [
    "Because I was the only one who walked away clean from the last job.",
    "Because I've been seen talking to a cop. It was my sister. Nobody believes that.",
  ],
  i_guilt: [
    "The security chief. She's three months from retiring.",
    "The kid in the mailroom. He wants to be just like me.",
  ],
  i_door: [
    "Sub-basement, past the boiler. No handle on my side. It's warm to the touch.",
    "Top floor, end of the hall. The cleaning crew isn't allowed to go near it.",
  ],
  i_after: [
    "Sleep for a week. Then never wear a tie again.",
    "Open a bakery under my real name. If I can remember it.",
  ],

  // The Rookie
  r_vouch: [
    "My cousin Teddy. I owe him two hundred bucks and my dignity.",
    "The Muscle. They knew my dad. They won't tell me how.",
  ],
  r_lie: [
    "That I'd done this before. I have watched a lot of movies.",
    "That I can drive stick.",
  ],
  r_money: [
    "Rent's three months late and my landlord has started saying my name with a smile.",
    "My ma's hospital bills. She thinks I got a raise at the cannery.",
  ],
  r_advice: [
    "'If you hear something above you, don't look up. Just run.' They weren't laughing.",
    "'Never be the last one in a hallway.'",
  ],
  r_hero: [
    "The Trigger. They don't know I've never held a gun before tonight.",
    "The Brains. They don't know I'm the one who leaked the last plan, by accident.",
  ],
  r_promise: [
    "That I'd never hurt anyone. I promised my little sister.",
    "That I'd never end up like my father.",
  ],
  r_pocket: [
    "A bottle cap from the first beer I ever had with my dad.",
    "A plastic toy badge. I wanted to be a cop when I was six.",
  ],
};
