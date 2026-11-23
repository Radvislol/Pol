# Seimas: Battle for Lithuania

A friendly, cartoon-style strategy game about a Lithuanian parliamentary (Seimas) election, designed for phones. You run one party's campaign for twelve weeks, then try to build a 71-seat governing majority.

## Playing

- **Rūta, your campaign manager**, walks you through the first week step by step. After that she suggests the best moves each week. You can carry out a suggestion in one tap, or let her plan the rest of your week.
- **The map** shows Lithuania's real county outlines, coloured by whoever leads in each region. Close races are striped, and bouncing stars mark Rūta's recommended regions. Tap a region to see the race and every move you can make there.
- **Plain-language moves.** Each move shows its cost (energy and euros) and its expected effect before you tap.

## The model

- **141 seats, mixed system.** There are 70 proportional list seats, split by Hare–Niemeyer largest remainder among parties with at least 5% of the national vote. The other 71 are single-mandate constituencies, decided by two rounds.
- **Runoffs.** A candidate who wins more than 50% in round one takes the seat. Otherwise the top two go to a runoff. Voters of eliminated parties transfer by ideological distance across four policy axes, and some stay home. There is also anti-landslide tactical voting against a runaway national leader.
- **13 regions.** Map outlines are simplified from the MIT-licensed `@react-map/lithuania` package (see `THIRD_PARTY_NOTICES.md`). Vilnius and Kaunas cities are split from their counties, and there is a seat for Lithuanians abroad. Each region has a population, an urban/rural split, local issues, ideal policy positions, and named constituencies with their own leans. For example, the Polish-minority vote is concentrated in Šalčininkai and Naujoji Vilnia.
- **8 playable parties.** LSDP, TS-LKD, Nemuno aušra, DSVL, Liberalų sąjūdis, LVŽS, Laisvės partija and LLRA-KŠS. Each has its own funds, strongholds and passive trait. AI rivals run their own weekly campaigns.
- **Each week.** You get 6 action points plus donations. Region actions are rallies, social ads, TV/radio, door-to-door canvassing and attacks. You can also shift your platform, raise money (including lobbying, which builds scandal risk), and run national actions.
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
