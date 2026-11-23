# Seimas: Battle for Lithuania

A friendly, cartoon-style strategy game about the **2028 Lithuanian Seimas election**, designed for phones and available in **Lithuanian and English** (switch with the LT/EN toggle). You lead a real party and its real leader through a twelve-week campaign, then try to build a 71-seat governing majority and survive the Seimas confidence vote.

> Fictional simulation. Real parties and leaders appear for context; every event, quote and result is invented. Party emblems are original designs, not official logos. Starting polls roughly follow late-2026 averages, and party leaders were checked in November 2026.

## Playing

- **Rūta, your campaign manager**, walks you through the first week step by step. After that she suggests the best moves each week. You can carry out a suggestion in one tap, or let her plan the rest of your week.
- **The map** shows Lithuania's real county outlines, coloured by whoever leads in each region. Close races are striped, and bouncing stars mark Rūta's recommended regions. Tap a region to see the race and every move you can make there.
- **Plain-language moves.** Each move shows its cost (energy and euros) and its expected effect before you tap.

## Parties and leaders (as of November 2026)

| Party | Leader |
|---|---|
| LSDP | Mindaugas Sinkevičius |
| TS-LKD | Laurynas Kasčiūnas |
| Nemuno aušra | Remigijus Žemaitaitis |
| DSVL | Virginijus Sinkevičius |
| Liberalų sąjūdis | Viktorija Čmilytė-Nielsen |
| LVŽS | Aurelijus Veryga |
| Laisvės partija | Vytautas Mitalas |
| LLRA-KŠS | Valdemar Tomaševski |

## Systems

- **Star candidates.** Recruit a famous local face to boost one single-mandate district. AI parties field some too.
- **VRK spending limit.** Campaign spending is capped. Going over brings a fine and a scandal, and Rūta never plans past the limit.
- **Risky money.** A casino with real European roulette odds, and bets on Žalgiris games. Both lose money on average, and every bet has a 12% chance of leaking to the press.
- **Kompromat.** Pay investigators to dig up dirt on a rival: a 45% chance of a hit and a 20% chance of being exposed yourself.
- **Voter groups.** Pensioners, young people, farmers, business owners, teachers and doctors, and minorities. Each group reacts to your promises, your news choices and your debate answers.
- **Election day.** Weather affects turnout, mostly in rural areas, and the count runs live, followed by the runoffs.
- **Confidence vote.** After the coalition is signed, the Seimas votes on your nomination as Prime Minister. In shaky coalitions, some MPs may rebel.

## The model

- **141 seats, mixed system.** There are 70 proportional list seats, split by Hare–Niemeyer largest remainder among parties with at least 5% of the national vote. The other 71 are single-mandate constituencies, decided by two rounds.
- **Runoffs.** A candidate who wins more than 50% in round one takes the seat. Otherwise the top two go to a runoff. Voters of eliminated parties transfer by ideological distance across four policy axes, and some stay home. There is also anti-landslide tactical voting against a runaway national leader.
- **13 regions.** Map outlines are simplified from the MIT-licensed `@react-map/lithuania` package (see `THIRD_PARTY_NOTICES.md`). Vilnius and Kaunas cities are split from their counties, and there is a seat for Lithuanians abroad. Each region has a population, an urban/rural split, local issues, ideal policy positions, and named constituencies with their own leans. For example, the Polish-minority vote is concentrated in Šalčininkai and Naujoji Vilnia.
- **8 playable parties.** LSDP, TS-LKD, Nemuno aušra, DSVL, Liberalų sąjūdis, LVŽS, Laisvės partija and LLRA-KŠS. Each has its own funds, strongholds and passive trait. AI rivals run their own weekly campaigns.
- **Each week.** You get 6 energy plus donations. Region actions are rallies, online ads, TV/radio, door-to-door canvassing, star candidates and attack ads. You can also shift your promises, raise money, gamble, dig for dirt, and run national actions.
- **Events.** LRT debates happen in weeks 4, 8 and 11. Breaking-news events arrive every one or two weeks, each with three choices, and scandals are triggered by risky fundraising.
- **Election night and coalition talks.** Election night animates the live count, round one and the runoffs. Coalition talks cover willingness, policy demands, political-capital sweeteners, ministry allocation and a stability score.

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
