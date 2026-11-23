# Seimas: Battle for Lithuania

A political-drama strategy game about the **2028 Lithuanian Seimas election**, playable on **phones and desktop**, in **Lithuanian and English** (switch with the LT/EN toggle). You lead a real party and its real leader through a twelve-week campaign, then try to build a 71-seat governing majority and survive the Seimas confidence vote.

> Fictional simulation. Real parties and leaders appear for context; every event, quote and result is invented. Party emblems are original designs, not official logos, and leader portraits are cartoon drawings, not photos or likenesses. Starting polls roughly follow late-2026 averages, and party leaders were checked in November 2026.

## Look and layout

- **Dark "political drama" design**: night-blue glass panels over a blurred landmark, condensed italic headlines on black title bars, amber call-to-action buttons, white answer pills, party-coloured rows, shield emblems, white stat pills and a rolling national-news ticker.
- **Phones**: a compact top bar with the leader's card, stat pills and a campaign timeline (months, debates, endorsements, election day), and a bottom bar with the news ticker and sections.
- **Desktop (1024 px and wider)**: a command-centre layout with a full-width top bar (leader card, timeline, Next week), a navigation rail on the left, the large campaign map in the centre and a docked side panel on the right that shows region details or the latest news. News, debates and voters open as centred cinematic cards. Candidate selection becomes a two-pane screen with a large preview.

## Playing

- **Rūta, your campaign manager (optional).** On the party screen, choose *With Rūta* or *Play solo*. With Rūta, she walks you through the first week, explains the rules and gives rough forecasts on region moves. She never picks moves, news answers or debate answers for you. In solo mode there is no tutorial, no tips and no forecasts.
- **No hints on news and debates.** News choices and debate answers show only the words. You find out how they landed afterwards.
- **The campaign map** shows Lithuania's real county outlines. Switch between six layers: who leads, your support, this week's change, battlegrounds, your ground teams and rival moves. Dots around each region show the projected winner of every local district. Markers show your leader, your moves this week, news stories, rivals' attacks and strongholds waiting for a visit. Tap a region to see the race, local intel and every move you can make there.
- **Your leader tours the country.** Rallies are 30% stronger where the leader is and 15% weaker elsewhere. Each week brings one free bus ride to a neighbouring region; longer trips (and flights to the diaspora) cost energy. The week's route is drawn on the map.
- **Plain-language moves.** Each move shows its cost (energy and euros) and its expected effect before you tap.

## Parties and leaders (as of November 2026)

| Party | Leader | In the game |
|---|---|---|
| LSDP | Mindaugas Sinkevičius | In the Seimas |
| TS-LKD | Laurynas Kasčiūnas | In the Seimas |
| Nemuno aušra | Remigijus Žemaitaitis | In the Seimas |
| DSVL | Virginijus Sinkevičius | In the Seimas |
| Liberalų sąjūdis | Viktorija Čmilytė-Nielsen | In the Seimas |
| LVŽS | Aurelijus Veryga | In the Seimas |
| Laisvės partija | Vytautas Mitalas | In the Seimas |
| LLRA-KŠS | Valdemar Tomaševski | In the Seimas |
| Darbo partija | Gintaras Steponėnas | Outsider |
| Laisvė ir teisingumas | Artūras Zuokas | Outsider |
| Krikščionių sąjunga | Rimantas Jonas Dagys | Outsider |
| Lietuvos žaliųjų partija | Ieva Budraitė | Outsider |

The Labour Party (DP) leader comes from an undated party directory listing, so it may be out of date. The Lithuanian Regions Party is left out because its leadership was disputed at the time of checking.

## Art

Every leader and character has an original cartoon portrait whose expression reacts to the moment: debates, polls, coalition talks, results. Characters include Rūta, the LRT host, the news anchor, the croupier, the bookmaker, the private investigator and a face for each voter group. Regions, news stories and big moments use illustrations of real places: Gediminas Tower, Trakai Island Castle, Kaunas Castle, Klaipėda harbour with the Meridianas, the Hill of Crosses, Aukštaitija's lakes, farmland with a stork's nest, the Seimas and the Presidential Palace. Everything is drawn in SVG inside the component, so there are no image files.

## Strategy layers

- **Game settings.** Three difficulty levels (rival aggression, donations) and four scenarios: Standard election, Energy shock (governing parties start weaker, cost-of-living messages hit harder), Security scare (hawks gain), and Autumn of scandals (more rival scandals, low trust).
- **Message of the week.** Pick one of five messages (cost of living, security, regions, cities and the future, honest politics). Moves in regions where voters care about it are 12% stronger, elsewhere 3% weaker. Sticking with a message builds buzz; dropping one you pushed for weeks looks confused. The choice locks once you campaign that week.
- **Campaign team.** Hire up to three of seven specialists: a strategist (+1 energy), a press secretary, a digital director, a field organiser, a pollster, a fundraiser and an election lawyer. Each has a signing fee and a weekly wage; if you can't pay, someone quits.
- **Party board and unity.** Every week the party board sets a task: gain in a region, raise money, campaign widely, knock on doors, run a clean week, lift the national rating, or place in the debate. Success brings a reward; failure costs unity. Flip-flops, shady deals and drifting from the programme also cost unity. Below 40, a revolt breaks out, and low unity means your own MPs may vote against you as Prime Minister.
- **Rival scandals.** Rivals get into trouble too: hidden debts, poster vandalism, defecting councillors, hot-mic gaffes. You choose whether to attack, stay above it or go through the VRK.
- **Between the rounds.** After round one you see your closest runoffs, sign up to two runoff pacts (their voters back you, yours back them; partners remember it in coalition talks), and send three volunteer teams to the tightest races. Projections update as you plan.
- **Rival dossier.** The polls tab tracks the six biggest rivals: trend, momentum, last week's moves, attacks on you, and how close they are to you politically.
- **Achievements.** Fifteen achievements, saved in the browser across campaigns.

## Consequences

- **Promises and reputation.** Every answer in the news, in debates and on the street becomes a promise. Saying the opposite later is a flip-flop that costs reputation. Reputation (0–100) scales how much good news helps you and how willingly partners join a coalition.
- **Follow-up stories.** Ten decisions come back two or three weeks later: the farmers' petition, the donor behind your silence, landlords' billboards, a fact-check of your pension promise and more.
- **Rivals react.** Parties you hit with attack ads hit back in the same region the next week, and region leaders rush to defend places where you surged.
- **Neglected strongholds slip.** A safe region you ignore for four weeks starts to drift away.
- **Voters stop you.** After rallies and door-knocking, a voter may ask you something directly: a pensioner about heating bills, a farmer about milk prices, a minority parent about schools. Your answer has effects.
- **The weekly recap** lists what your choices led to.

## Systems

- **47 news stories** (including 10 follow-ups, many of them pinned to a place on the map) with three answers each, and **LRT debates** that draw 3 of 5 questions per debate. Midway through every debate a rival attacks you and you choose how to respond. A low reputation invites the "flip-flopper" attack.
- **Polls with margins of error.** Each week's poll comes from one of four fictional polling firms, each with a small house effect, a sample size and a margin of error.
- **Endorsements.** In weeks 6 and 10, trade unions, farmers', business, youth, seniors' and minority organisations back the party their members like most. Winning one gives a boost wherever that group lives.
- **Early voting.** In the final week many people have already voted, so moves are 15% weaker.
- **Star candidates.** Recruit a famous local face to boost one single-mandate district. AI parties field some too.
- **VRK spending limit.** Campaign spending is capped. Going over brings a fine and a scandal.
- **Risky money.** A casino with real European roulette odds, and bets on Žalgiris games. Both lose money on average, and every bet has a 12% chance of leaking to the press.
- **Kompromat.** Pay investigators to dig up dirt on a rival: a 45% chance of a hit and a 20% chance of being exposed yourself.
- **Voter groups.** Pensioners, young people, farmers, business owners, teachers and doctors, and minorities. Each group reacts to your promises, your news choices and your debate answers.
- **Election day.** Weather affects turnout, mostly in rural areas, and the count runs live, followed by the runoffs.
- **Confidence vote.** After the coalition is signed, the Seimas votes on your nomination as Prime Minister. In shaky coalitions, some MPs may rebel.

## The model

- **141 seats, mixed system.** There are 70 proportional list seats, split by Hare–Niemeyer largest remainder among parties with at least 5% of the national vote. The other 71 are single-mandate constituencies, decided by two rounds.
- **Runoffs.** A candidate who wins more than 50% in round one takes the seat. Otherwise the top two go to a runoff. Voters of eliminated parties transfer by ideological distance across four policy axes, and some stay home. There is also anti-landslide tactical voting against a runaway national leader.
- **13 regions.** Map outlines are simplified from the MIT-licensed `@react-map/lithuania` package (see `THIRD_PARTY_NOTICES.md`). Vilnius and Kaunas cities are split from their counties, and there is a seat for Lithuanians abroad. Each region has a population, an urban/rural split, local issues, ideal policy positions, and named constituencies with their own leans. For example, the Polish-minority vote is concentrated in Šalčininkai and Naujoji Vilnia.
- **12 playable parties.** Eight are in the Seimas today: LSDP, TS-LKD, Nemuno aušra, DSVL, Liberalų sąjūdis, LVŽS, Laisvės partija and LLRA-KŠS. Four are outsiders below 5%: Darbo partija, Laisvė ir teisingumas, Krikščionių sąjunga and the Greens. Each has its own funds, strongholds and passive trait. AI rivals run their own weekly campaigns.
- **Each week.** You get 6 energy plus donations. Region actions are rallies, online ads, TV/radio, door-to-door canvassing, star candidates and attack ads. You can also shift your promises, raise money, gamble, dig for dirt, and run national actions.
- **Events.** LRT debates happen in weeks 4, 8 and 11. Breaking-news events arrive every one or two weeks, each with three choices, and scandals are triggered by risky fundraising.
- **Election night and coalition talks.** Election night animates the live count, round one and the runoffs. Coalition talks cover willingness, policy demands, political-capital sweeteners, ministry allocation and a stability score. A partner much bigger than you wants the Prime Minister's job, so small parties usually have to grow first or join as junior partners.

## Files

- `src/SeimasGame.jsx`: the whole game as one React component (default export). It uses Tailwind classes and `lucide-react`, and calls no external APIs.
- `dist/seimas.html`: a built, self-contained page. React, ReactDOM and Lucide load from pinned CDN URLs, Tailwind is compiled inline, and fonts come from Google Fonts.
- `build/`: the esbuild + Tailwind build that produces `dist/seimas.html`.

## Build

```sh
npm install
npm run build   # writes dist/seimas.html
```

Progress autosaves in the browser (localStorage), so a campaign can be resumed from the title screen.
