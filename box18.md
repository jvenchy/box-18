Box18 (not a b2b saas)  
![][image1]

Idea:  
Thesis: Apply ML+AI powered sports analytics to youth soccer in NA

Stakeholders:

- Players  
  - Upload videos  
  - Gets processed  
  - ML model returns analysis of a player, saved to Supabase,   
  - Can view their stats  
  - Make a profile; contact info, position, current team/league gpa, etc.  
- Coaches  
  - Can search for players by attributes through advanced filtering  
  - Can save players, contact them  
- Clubs (non-MVP)  
  - Contracts with clubs to either set up recording for games; or having a portal for them to upload their own games \+ stat sheets

Infrastructure:

Machine Learning:

- Player identification  
  - Assuming player specified their jersey number  
  - Existing weights for identifying jersey numbers? How to track a player based on jersey number even when it’s covered? Camera quality can vary  
    - Identify as many players on the field, rule out players based on target player’s jersey number, for any unidentified players, collect their stats and send a notification to the user to identify themselves from screenshots to finalize compilation

Scraping/Analysing stat sheets:

- Analyze and consolidate and extract from existing youth sports games stats (can see ur own performance and coach performance)

Front-end:

- React, [Next.js](http://Next.js), Supabase stack

Data tracked by ML (total / per match):

- Minutes played  
- Goals scored (human-assisted)  
- Shot attempts  
- Ball interactions (touches)  
- Carries (simple dribble proxy)  
- Heatmap of player distribution

![][image2]

- Sprint bursts

Datasets:  
ML Resources:  
[https://www.soccer-net.org/](https://www.soccer-net.org/) \- annotations  
[https://github.com/NirAharon/BoT-SORT?ref=blog.roboflow.com](https://github.com/NirAharon/BoT-SORT?ref=blog.roboflow.com) \- object tracking/player detection (maybe need annotated data for detecting jerseys)  
[http://ufldl.stanford.edu/housenumbers/](http://ufldl.stanford.edu/housenumbers/) \- jersey number detection

Games:  
[https://github.com/statsbomb/open-data](https://github.com/statsbomb/open-data)  
[https://drive.google.com/drive/folders/1peXQ9uBVZHPb9p8JZpdJ1VX8TQFL7YvA?usp=sharing](https://drive.google.com/drive/folders/1peXQ9uBVZHPb9p8JZpdJ1VX8TQFL7YvA?usp=sharing)  
[https://drive.google.com/drive/folders/1gaBQ3\_7y84I6y6NjYIeGINMJNMqSnk7K?usp=sharing](https://drive.google.com/drive/folders/1gaBQ3_7y84I6y6NjYIeGINMJNMqSnk7K?usp=sharing)  
[https://drive.google.com/drive/folders/1qoZMhZW1VNg-8skEY6JckkubAtNzFclO?usp=sharing](https://drive.google.com/drive/folders/1qoZMhZW1VNg-8skEY6JckkubAtNzFclO?usp=sharing)

References for data:  
[https://league1ontario.com/competition/league-2-mens/northeast/](https://league1ontario.com/competition/league-2-mens/northeast/)  
[https://playerlink.ca/players/5301/david-chen](https://playerlink.ca/players/5301/david-chen)

Business

Subscription service to upload footage

**Value proposition to clubs:** you need to use this or else you fall behind  
Coaches will love it, players and clubs will be forced to use it and still pay subscription fees

TODO: Research funding for ML and VC space

Proposition to VCs:

- Connections with soccer industry and space in Canada  
- Technological and Entrepreneurial connections  
- Ability to add Basketball, Hockey, later down the line though athletics department connections  
- Credentials from Camel  
- 

Lybi notes:

- Non measurable characteristics

Adam’s inputted /stats:  
1\. Basic Box-Score Metrics (What Everyone Knows)

These are descriptive, not diagnostic.

Attacking  
	•	Goals – Outcome, not quality (tap-ins vs screamers)  
	•	Assists – Often misleading (final passer ≠ most valuable action)  
	•	Shots / Shots on Target – Volume without context

Passing  
	•	Pass completion % – Often rewards safe players  
	•	Total passes – Role-dependent (CBs inflate this)

Defending  
	•	Tackles  
	•	Interceptions  
	•	Clearances

⚠️ Problem: These stats reward involvement, not effectiveness.

⸻

2\. Contextualized Metrics (Where Things Get Interesting)

Expected Goals (xG)

Measures shot quality based on:  
	•	Distance  
	•	Angle  
	•	Body part  
	•	Defensive pressure  
	•	Assist type

Why it matters  
	•	Separates finishing luck from chance creation  
	•	A striker with 10 goals from 4 xG is hot (or lucky)

Expected Assists (xA)

Measures quality of chances a player creates, regardless of finish.

Key insight  
	•	Great creators can have low assists if teammates can’t finish.

⸻

3\. Possession & Progression Metrics (Midfield Truth Serum)

Progressive Passes

Passes that:  
	•	Move the ball meaningfully closer to goal  
	•	Break defensive lines

Progressive Carries

Dribbles that advance the ball under control.

Passes into Final Third / Penalty Area

Measures attacking intent, not just circulation.

Line-Breaking Passes

Passes that eliminate defenders.

These separate:  
	•	Recyclers (safe, sideways)  
	•	Drivers (vertical, risk-takers)

⸻

4\. Defensive Impact (Beyond “Tackles Won”)

Pressures  
	•	Number of times a player closes down an opponent  
	•	Often paired with pressure success rate

Defensive Actions per 90

Adjusts for playing time and team style.

Tackles \+ Interceptions per 90

Classic, but better normalized.

Blocks (Shots & Passes)

Positioning \> aggression.

Duels Won %  
	•	Ground duels  
	•	Aerial duels

⸻

5\. Off-Ball & Positional Intelligence (Harder to See)

Distance Covered  
	•	Total distance  
	•	High-intensity sprints

Heat Maps  
	•	Positional discipline  
	•	Role adherence

Defensive Coverage Zones

Who occupies dangerous space—not just who touches the ball.

⸻

6\. On-Ball Skill & Risk Management

Dribble Success Rate  
	•	Successful dribbles / attempts  
	•	High attempts \+ high success \= elite

Take-On Volume

Wingers should attempt more; CBs shouldn’t.

Turnovers in Dangerous Areas

A killer stat for judging decision-making.

⸻

7\. Impact Metrics (The “Do We Play Better With You?” Layer)

On/Off Stats

Team performance when player is:  
	•	On the pitch vs off  
	•	xG for / xG against

Plus-Minus (Adjusted)  
	•	Goal differential while playing  
	•	Context-adjusted versions are better

⸻

8\. Role-Specific “Good vs Bad” Indicators

Strikers  
	•	xG per 90  
	•	Shot locations  
	•	Touches in box  
	•	Pressures in final third

Midfielders  
	•	Progressive passes \+ carries  
	•	Passes under pressure  
	•	Defensive actions in middle third

Defenders  
	•	xG conceded when on pitch  
	•	Aerial duel %  
	•	Errors leading to shots  
	•	Progressive passing (modern CBs)

Goalkeepers  
	•	Post-Shot xG (PSxG) – Goals Allowed  
	•	Measures shot-stopping quality  
	•	Cross claims  
	•	Sweeper actions

⸻

9\. Where Stats Fail (Important)

Stats struggle with:  
	•	Leadership  
	•	Communication  
	•	Defensive positioning without action  
	•	Tactical discipline  
	•	Sacrificial runs that create space

This is why video \+ data beats either alone.

⸻

10\. TL;DR Framework

To tell if a player is “good”:

Ask three questions:  
	1\.	Do they improve chance quality? (xG / xA / progression)  
	2\.	Do they reduce opponent danger? (pressures, positioning)  
	3\.	Does the team perform better with them on the field? (on/off xG)

**“FEB20TH CONVERSATION SUMMARY”**

# **Core Vision**

A flashy, AI-powered sports recruitment platform demo that feels futuristic, visually impressive, and product-ready — even if the backend is initially lightweight.

The goal is not just functionality, but to **wow the audience (coaches/universities)** with a polished, working prototype that looks more advanced than competitors’ pitch-only ideas.

---

# **Product Concept**

## **1\. AI Recruitment Assistant (Primary Hook)**

* A chatbot-style interface where a coach can type:

  * “I want a striker who is fast, aggressive, good passing”

* The AI returns:

  * A ranked list of players from the database

  * Suggested best fits

* Framed as: **“the future of recruitment”**

This is positioned as the core differentiator.

---

## **2\. Hybrid UI Experience (Key Design Direction)**

### **Layout Vision:**

* Top half: Chatbot (“agent” interface)

* Scroll down: Doordash-style player discovery feed

* Visually rich player cards with:

  * Photos (professional-looking for demo polish)

  * Stats

  * Highlights

The UI should feel:

* Flashy

* Modern

* Highly interactive

* Demo-friendly

Not just functional — **impressive and memorable**.

---

## **3\. Player Profiles (Deep Visual Breakdown)**

Each player profile should include:

* Colorful stat visualizations

* Charts (performance metrics)

* Possibly:

  * Heatmaps (real or simulated)

  * Distribution maps

  * Skill breakdown visuals

Important nuance:

Even visual “smoke and mirrors” are acceptable for the demo as long as they look credible and data-informed.

---

## **4\. AI-Generated Player Comparisons (High Hype Feature)**

Example output style:

* “Plays like a young Neymar”

* “Defends like Mbappé”

* “Passing shows signs of Yamal”

This is meant to:

* Feel intelligent

* Be engaging for coaches

* Add perceived sophistication to the AI

---

## **5\. Data Strategy (Practical Foundation)**

### **Initial Database Source:**

* Web scraping league sites (e.g., League1 Ontario)

* Scraped basic stats to initialize player database

* Improve presentation via better UI than existing stat sites

---

## **6\. Dual System Architecture (Two Views)**

### **Coach View:**

* Driven by scraped data

* Search, filtering, recommendations

* Visual analytics and rankings

### **Player View:**

* Driven by ML base model

* Possibly:

  * Upload game footage

  * Generate insights from video

---

## **7\. Vision Model \+ Footage Pipeline (Future-Facing)**

Longer-term concept:

* Upload match footage

* Vision model tracks player movement

* Generates:

  * Heatmaps

  * Positioning analytics

  * Playstyle insights

Acknowledged dependency:

Accurate heatmaps require player tracking from vision model.

---

## **8\. “Agentic Scouts” Concept (Strategic Vision)**

A higher-level idea:

* Universities have AI scouting agents

* These agents:

  * Monitor player performance patterns

  * Alert coaches when a player fits specific criteria

  * Act as automated scouts

This suggests a scalable SaaS direction.

---

## **9\. Scout Credibility System**

* Scouts rated based on:

  * Accuracy of reports

  * Coach satisfaction

* Implies a trust/validation layer in the ecosystem.

---

## **10\. Demo Strategy Philosophy**

Very clear underlying mindset:

* Prioritize a polished demo over full technical depth

* Understand the audience (non-technical judges/teams)

* Differentiate through:

  * Strong UI

  * Working prototype

  * Visual sophistication

* Compete against teams pitching ideas without execution

---

# **Branding Direction**

* Give the AI a friendly, memorable name (e.g., “Boxy”)

* Make the system feel personable and intelligent

---

# **Immediate Execution Plan (Operational)**

1. One person builds a web scraper (player data ingestion)

2. One person sets up a base ML model

3. Initialize database with scraped stats

4. Build:

   * Chatbot UI

   * Scrollable player feed

   * Player profile analytics

5. Add visualizations once real data exists

---

# **Hidden Strategic Insight (Most Important)**

This is fundamentally a **demo-first, perception-driven product strategy**:

* Not purely deception

* But heavy emphasis on presentation, market understanding, and perceived sophistication

* Goal: look significantly more “real” and advanced than competing projects

Which, for a pitch environment, is actually a very calculated positioning move.

—----------------------------------------------------------------------------------------------------------------------------

## **SoccerNet Repo Analysis for Box18**

### **✅ Use These — Code-Ready & Directly Applicable**

**1\. `sn-gamestate` — Your core starting point** This is the single most important repo for you. It's a fully working, end-to-end pipeline that does exactly what you need: takes broadcast soccer video and outputs player tracking, jersey number identification, team affiliation, and a minimap showing player positions. It's built on top of **TrackLab** (their modular tracking framework) and uses pretrained weights that auto-download on first run. Under the hood it chains together YOLOv11 for detection, PRTReid for re-identification, TVCalib for camera calibration/field localization, and MMOCR for jersey number reading. This is your base model — clone it, run it on a video, and it immediately gives you player positions, jersey numbers, and team affiliation. Start here, full stop.

**2\. `sn-calibration` — Camera calibration, has working baseline code** Has actual Python source code in a `src/` folder with a working baseline. This handles mapping between the camera view and the real-world pitch coordinates — critical for generating accurate heatmaps and player position data. The good news is `sn-gamestate` already incorporates TVCalib (which is built on top of this work), so you likely won't need to run this independently. But it's worth knowing it exists if you need to customize the pitch-to-image mapping.

**3\. `sn-tracking` (challenge repo, but has benchmark code)** — Has benchmark implementations in the `Benchmarks/` folder you can actually run. However, since `sn-gamestate` already wraps a full tracking pipeline (StrongSORT \+ detection), you should use that instead. Flag this one as a reference/fallback, not a starting point.

**4\. `sn-reid` (challenge repo with working benchmarks)** — Has benchmark methods for re-identifying players across frames/cameras. Again, the PRTReid model inside `sn-gamestate` covers this already for the base model. Worth investigating if re-id accuracy is poor at the fine-tuning stage.

---

### **⚠️ Challenge-Only Repos — Flag for Winner Code Search**

These are challenge starter kits with no real model code, just data loaders and evaluation scripts. For MVP purposes they're not runnable as-is, but if you can find winning submissions, they'd be valuable additions:

**`sn-jersey`** — Challenge-only (no model code, just dataset downloader and README). The 2023 winner "ZZPM" hit 92.85% accuracy. Worth searching GitHub for their submission — if you find it, plugging in a better jersey number recognizer would be a meaningful upgrade over MMOCR. Mark this for research.

**`sn-spotting`** — Action spotting (detecting events like shots, fouls, corners). Not directly needed for the MVP stat pipeline but relevant later for "shot attempts" stat. Mark it — if a challenge winner's code surfaces, it could detect when a player takes a shot automatically.

**`sn-grounding`, `sn-caption`, `PTS-baseline`, `ActiveSpotting`** — Not relevant for the base model. These cover replay grounding, commentary generation, ball spotting, and active camera selection respectively. Skip for now.

**`sn-mvfoul`, `sn-depth`, `sn-nvs`, `sn-banner`, `sn-echoes`, `sn-teamspotting`** — Not relevant for Box18's MVP. These deal with multi-view foul detection, depth estimation, novel view synthesis, sponsor banner detection, crowd noise, and team spotting from broadcast. Leave these alone entirely.

**`SoccerNet-v3`, `SoccerNet` (main SDK)** — These are the data annotation/download SDKs, not models. You'll need `pip install SoccerNet` to download datasets but don't need to clone these as source code.

**`sn-trackeval`** — Evaluation library only. Used internally by TrackLab for benchmarking. Don't touch it directly.

---

### **🔍 Additional Open Source Tools Worth Adding**

Beyond SoccerNet, a few non-SoccerNet tools close key gaps:

**BoT-SORT** (`github.com/NirAharon/BoT-SORT`) — You already have this in your doc. Strong multi-object tracker, could swap in for StrongSORT inside TrackLab if needed. Good fallback.

**ByteTrack** (`github.com/ifzhang/ByteTrack`) — Another tracking option, actually used in several challenge-winning sn-tracking submissions. Easier to integrate than BoT-SORT and very fast.

**Ultralytics YOLOv11** — Already embedded in sn-gamestate. Fine-tuning it on youth soccer footage (lower camera quality, smaller players) will be your first real fine-tuning task.

**MMOCR** (`github.com/open-mmlab/mmocr`) — Already embedded in sn-gamestate for jersey number reading. The Stanford SVHN dataset you linked is the right dataset to fine-tune this for youth jersey fonts.

**StatsBomb Open Data** (`github.com/statsbomb/open-data`) — You already have this linked. Pure event/tracking data (no video), useful for validating your stat output format and seeding the coach-facing database.

---

## **Implementation Plan for the Base Vision Model**

Here's how to assemble the pipeline using the above:

**Step 1 — Clone and run sn-gamestate out of the box.** Install TrackLab \+ sn-gamestate, let it auto-download pretrained weights (YOLOv11, PRTReid, TVCalib, MMOCR), and point it at a clip of game footage. It will output: bounding boxes for every player per frame, track IDs, jersey numbers (where legible), team assignment (left/right), and 2D minimap positions. This is your end-to-end base model with zero training.

**Step 2 — Write a stat aggregation layer on top.** The TrackLab pipeline outputs a "Tracker State" object (basically a dataframe of all detections across all frames). Post-process this to compute: minutes played (track ID presence across frames), distance covered and sprint bursts (frame-to-frame displacement of minimap coordinates), ball interactions (proximity to ball detection), heatmap (bin the minimap coordinates into a grid), and carries (sustained lateral/forward movement sequences). Goals and shot attempts will need to be human-annotated initially or use sn-spotting winner code later.

**Step 3 — Player identity matching.** The user supplies their jersey number. After the pipeline runs, match the jersey number output to the player's track ID and filter all stats to that track. For frames where the jersey is occluded (and MMOCR returns \-1), re-id embeddings from PRTReid will maintain track continuity — this is exactly the fallback strategy your doc describes. For any remaining ambiguous frames, you can pull screenshots by frame ID and send them to the user for manual confirmation.

**Step 4 — Fine-tuning plan for later.** Once you have a working base: (1) fine-tune YOLOv11 on youth soccer footage for better small-player detection at lower resolutions, (2) fine-tune MMOCR on youth-style jersey fonts using SVHN \+ any labeled youth game frames, (3) optionally look for sn-jersey 2023 challenge winners to replace/augment MMOCR.

The beautiful thing is that sn-gamestate is literally designed to be modular — each component (detector, tracker, jersey reader, calibration) is swappable via a single YAML config. That's exactly the kind of architecture you want to build on for an MVP and then iterate.

[image1]: <data:image/png;base64,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>

[image2]: <data:image/png;base64,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>