# UNIVERSAL TRAVEL ITINERARY SKILL.md
**Version 2.0 — Countries · Indian States · USA States & Provinces**

> **How to use:** Tell Claude the destination — any country, any Indian state, any US state or Canadian province — and this skill governs every decision: scope, currency, sections included, depth of detail, rating method, and output format. Everything adapts automatically to the destination type.

---

## SECTION 0 — DESTINATION DETECTION & MODE SELECTION

The very first task before writing a single word is to **classify the destination** and lock in the correct operating mode. All subsequent decisions flow from this.

### 0.1 Classification Rules

| Input Example | Classified As | Mode |
|---|---|---|
| "Cambodia", "Thailand", "Japan", "France", "Italy" | Sovereign country | **COUNTRY MODE** |
| "Kerala", "Rajasthan", "Tamil Nadu", "Goa", "Himachal Pradesh" | Indian state/UT | **INDIA-STATE MODE** |
| "California", "New York", "Texas", "Hawaii", "Alaska" | US state | **USA-STATE MODE** |
| "British Columbia", "Quebec", "Ontario" | Canadian province | **CANADA-PROVINCE MODE** |
| "Tuscany", "Provence", "Bavaria", "Catalonia" | Sub-national region of another country | **INTERNATIONAL-REGION MODE** |

### 0.2 Mode Locked — What Changes Per Mode

| Feature | COUNTRY | INDIA-STATE | USA-STATE | CANADA-PROVINCE |
|---|---|---|---|---|
| **Currency shown** | Local currency + USD | INR (₹) only | USD ($) only | CAD ($) |
| **Transport focus** | International flights + local | Trains + buses + auto-rickshaws | Road trips + domestic flights | Road trips + VIA Rail |
| **Budget anchor** | USD (global reference) | INR per day | USD per day | CAD per day |
| **Visa/Immigration** | Required section | Not applicable | Not applicable | Not applicable |
| **Language section** | Full (local language) | Regional language + Hindi | English only, note local languages | English/French as relevant |
| **Festival calendar** | National + local festivals | State-specific festivals | State holidays + events | Province events |
| **Accommodation labels** | Hostel/Hotel/Resort | Dharamshala/OYO/Heritage hotel/Resort | Motel/B&B/Hotel/Ranch/Airbnb | B&B/Lodge/Hotel/Chalet |
| **Food section** | International cuisine context | Regional Indian cuisine + local thali | American regional food + local specialties | Canadian regional cuisine |
| **Emergency contacts** | Local emergency + embassy | 112 / State tourism helpline | 911 / State tourism board | 911 / Provincial tourism |
| **Rating scale** | 5-factor global | 5-factor — weight heritage higher | 5-factor — weight nature & experience | 5-factor — weight nature & culture |

---

## SECTION 1 — DOCUMENT STRUCTURE (UNIVERSAL SPINE)

Every itinerary — regardless of mode — follows this spine. Sections marked with a mode tag are **included only for that mode** or have mode-specific content. Unmarked sections appear in all modes.

```
┌─────────────────────────────────────────────────────────┐
│  COVER / TITLE                                           │
│  Destination name, tagline, region type, date updated    │
├─────────────────────────────────────────────────────────┤
│  SECTION 1 — OVERVIEW                                    │
│  What makes this destination unique                      │
├─────────────────────────────────────────────────────────┤
│  SECTION 2 — BEST TIMES TO VISIT                         │
│  Seasonal table + festivals + weather warnings           │
├─────────────────────────────────────────────────────────┤
│  SECTION 3 — DESTINATION DEEP-DIVES                      │
│  City / Region / Area breakdowns                         │
│  (Each attraction: narrative, rating, timings, fees)     │
├─────────────────────────────────────────────────────────┤
│  SECTION 4 — BUDGET & COST ESTIMATION                    │
│  Budget / Mid-Range / Luxury tables                      │
│  Per-item costs + money-saving tips                      │
├─────────────────────────────────────────────────────────┤
│  SECTION 5 — PRACTICAL TRAVEL INFORMATION               │
│  Transport · Health · Accommodation · Language           │
│  [COUNTRY only: Visa + Emergency Contacts + Embassy]     │
│  [INDIA-STATE only: Train booking + IRCTC + Auto tips]   │
│  [USA-STATE only: Road trip tips + RV info + Parks pass] │
├─────────────────────────────────────────────────────────┤
│  SECTION 6 — SPECIAL INTEREST EXPERIENCES               │
│  Adventure · Culinary · Wildlife · Culture               │
│  Photography · Wellness · [mode-specific additions]      │
├─────────────────────────────────────────────────────────┤
│  SECTION 7 — SUGGESTED ITINERARIES                       │
│  3-day, 5-day, 7-day minimum                             │
│  (Add 10-day for countries, 2-day weekend for US states) │
├─────────────────────────────────────────────────────────┤
│  SECTION 8 — ETIQUETTE & CULTURAL RESPECT               │
│  [COUNTRY: full cultural guide]                          │
│  [INDIA-STATE: temple customs + regional do's/don'ts]    │
│  [USA-STATE: regional customs, tipping, park rules]      │
├─────────────────────────────────────────────────────────┤
│  SECTION 9 — FINAL RECOMMENDATIONS                       │
│  Summary + who this destination suits best               │
└─────────────────────────────────────────────────────────┘
```

---

## SECTION 2 — BEST TIMES TO VISIT

### 2.1 Universal Seasonal Table Format

Always produce a 4-row table covering:

| Season | Months | Temp Range | Weather | Crowd Level | Price Level | Best For |
|---|---|---|---|---|---|---|
| Peak | [months] | [°C / °F] | [conditions] | High | High | [activity type] |
| Shoulder | [months] | [°C / °F] | [mild/transitional] | Medium | Medium | [balanced travel] |
| Off-Season | [months] | [°C / °F] | [rain/heat/snow] | Low | Low | [budget travel] |
| Avoid / Warning | [months] | [conditions] | [reason] | — | — | [warning note] |

### 2.2 Mode-Specific Season Guidance

**COUNTRY MODE:**
- Reference international flight pricing peaks
- Note visa validity windows if seasonal
- Flag tropical monsoon, typhoon, hurricane, or extreme heat warnings
- Include major national holidays that close attractions

**INDIA-STATE MODE:**
- Reference Indian Railway season pricing (peak Diwali/Holi/New Year)
- Note state-specific festivals (Pongal in Tamil Nadu, Onam in Kerala, Pushkar Fair in Rajasthan)
- Flag when roads become impassable (monsoon landslides in hill states)
- Include pilgrim rush seasons (Char Dham, Vaishno Devi, Amarnath)
- Note burning / stubble smoke seasons (Punjab, Haryana — October–November)
- Reference school holiday crowds (May–June, October Dasara week)

**USA-STATE MODE:**
- Note National Park reservation windows (Yosemite, Zion require advance booking)
- Flag leaf-peeping season (New England: October), wildflower blooms (Texas: March–April)
- Reference major events that spike hotel prices (SXSW Austin, Mardi Gras Louisiana)
- Flag hurricane season (Florida, Gulf states: June–November)
- Note ski season vs. summer season for mountain states
- Reference America the Beautiful Pass coverage dates

**CANADA-PROVINCE MODE:**
- Note aurora viewing windows (Yukon, NWT: Sept–March)
- Flag provincial parks reservation opening dates (often February for summer)
- Note ice road conditions for northern provinces
- Reference whale watching seasons (BC: April–October)

### 2.3 Festivals & Events Section

For every destination, list **minimum 5 festivals/events** with:
- Name of festival
- Month and dates (if fixed) or lunar calendar note
- Cultural significance (1 sentence)
- Travel impact (crowded? book ahead? closures?)
- Whether it's worth timing your trip around it

---

## SECTION 3 — DESTINATION DEEP-DIVES

### 3.1 Structure for Each City / Region / Area

Every major area gets its own subsection header:

```
🏛️ [CITY/REGION NAME] ([Type: Ancient Capital / Beach Town / Hill Station / National Park / etc.])

OVERVIEW: (2–3 sentences covering: what makes it unique, population if relevant,
           best traveler type for this area)

[ATTRACTIONS listed below]
```

### 3.2 Attraction Entry Format (MANDATORY — every attraction)

Each attraction must follow this exact format. No shortcuts. No omissions.

```
• [ATTRACTION NAME] : ([distance from city center or nearest landmark], [travel time], [mode])

[NARRATIVE DESCRIPTION — 3–5 sentences covering:]
  - What it is physically/historically
  - Why it is significant (historical, architectural, cultural, spiritual, natural)
  - What visitors actually experience on the ground
  - What makes it different from similar places
  - Any cinematic/pop-culture references if relevant
  - Practical insider observation (what time, what angle, what to look for)

Rating: [X.X/5] ([justification in 10–20 words referencing rating factors])
Duration: [X–X hours] [(minimum recommended)]
Timings: [opening time – closing time] [days open/closed] [best time of day]
Entrance Fee: [local currency] (~[USD equivalent]) [what's included / not included]
[India-State ONLY] Dress Code: [if applicable — temples, mosques]
[India-State ONLY] Photography: [fee/restrictions if any]
[USA-State ONLY] Reservations: [required / recommended / walk-in OK]
[USA-State ONLY] America the Beautiful Pass: [accepted / not accepted]
Pro Tip: [one insider observation most guidebooks miss]
```

### 3.3 Number of Attractions Per Destination Type

| Destination Type | Minimum Attractions | Notes |
|---|---|---|
| Country (major: France, Japan) | 20–25 total across 4–5 cities | Cover capital + 3 major regions minimum |
| Country (small: Cambodia, Nepal) | 12–18 total across 3–4 cities | Cover all major tourist zones |
| Indian State (large: Rajasthan, UP) | 15–20 across 4–6 cities/towns | Cover heritage + nature + pilgrimage |
| Indian State (small: Goa, Sikkim) | 8–12 across 2–3 areas | Cover beaches/hills + cultural sites |
| USA State (large: California, Texas) | 15–20 across 5–6 regions | Cover parks + cities + coast/desert |
| USA State (small: Rhode Island, Delaware) | 6–10 across 2–3 areas | Focus on signature experiences |

### 3.4 Mode-Specific Attraction Categories to Always Include

**COUNTRY MODE:**
- UNESCO World Heritage Sites (mandatory if any exist)
- Capital city's top 5 sites minimum
- One nature/national park section
- One coastal/beach section (if applicable)
- One cultural/arts/museum section

**INDIA-STATE MODE:**
- Major temples / religious sites (mandatory — always present)
- Forts / palaces / heritage monuments
- National parks / wildlife sanctuaries
- Hill stations (if applicable)
- Markets / bazaars / local street food areas
- Beach / lake / river areas (if applicable)
- Specific regional crafts / art forms to experience

**USA-STATE MODE:**
- National Parks / State Parks (mandatory — always present)
- Major city attractions (walkable downtown, museums, food scene)
- Scenic drives / road trip routes (mandatory)
- Outdoor adventure zones (hiking, skiing, water sports)
- Historic districts / landmarks
- Local food & drink scene (breweries, wineries, BBQ, seafood — as relevant)

---

## SECTION 4 — RATING METHODOLOGY

### 4.1 Universal 5-Factor Weighted System

Every single attraction must receive a calculated rating — never a guessed number. Apply the formula:

```
RATING = (Historical Significance × 0.25)
       + (Visitor Experience Quality × 0.25)
       + (Tourist Popularity & Reviews × 0.20)
       + (Uniqueness Factor × 0.15)
       + (Emotional/Educational Impact × 0.15)
```

Each factor is scored out of 5, then weighted. Maximum = 5.0/5.0

### 4.2 Factor Definitions

**Historical Significance (25% weight)**
- Age of site or phenomenon
- UNESCO World Heritage, national monument, or equivalent status
- Role in local/national/world history
- Cultural importance to indigenous or local people

*Score guide:*
- 5/5: 500+ years old AND UNESCO or equivalent AND globally significant
- 4/5: 100–500 years old OR nationally significant
- 3/5: 50–100 years old or regionally significant
- 2/5: Modern but historically inspired
- 1/5: Contemporary, no historical depth

**Visitor Experience Quality (25% weight)**
- Architecture/natural beauty preservation
- Visitor facilities (guides, signage, restrooms, shade)
- Photogenic value and visual impact
- Sensory richness (sound, smell, atmosphere)
- Walkability and physical accessibility

**Tourist Popularity & Reviews (20% weight)**
- TripAdvisor/Google Maps consensus rating
- Volume of annual visitors
- Frequency of recommendation in reputable travel publications
- Word-of-mouth among experienced travelers

**Uniqueness Factor (15% weight)**
- How many similar experiences exist elsewhere in the world
- "Only in this place" score
- Rare natural phenomena, endemic species, singular architecture

**Emotional/Educational Impact (15% weight)**
- Cultural learning opportunity depth
- Emotional resonance (spiritual, moving, inspiring, joyful)
- Transformative potential for the visitor
- Stories visitors carry home

### 4.3 Rating Scale with Clear Definitions

```
5.0/5  ⭐⭐⭐⭐⭐ = ICONIC — Must-see, life-changing, globally famous
                  Examples: Taj Mahal, Grand Canyon, Angkor Wat, Eiffel Tower

4.8/5  ⭐⭐⭐⭐⭐ = EXCEPTIONAL — Excellent, unique, the top draw of its region
                  Examples: Bayon Temple, White Temple Chiang Rai, Zion Narrows

4.6/5  ⭐⭐⭐⭐½  = OUTSTANDING — Very highly recommended, memorable experience
                  Examples: Kerala backwaters, Sedona Red Rocks, Luang Prabang

4.5/5  ⭐⭐⭐⭐½  = EXCELLENT — Well worth the visit, culturally significant
                  Examples: Amber Fort Jaipur, Mysore Palace, Alcatraz

4.4/5  ⭐⭐⭐⭐   = VERY GOOD — Authentic, enjoyable, adds real value to trip
                  Examples: Phnom Penh Central Market, Savannah Historic District

4.3/5  ⭐⭐⭐⭐   = GOOD — Worthwhile, relaxing or culturally interesting
                  Examples: Sihanoukville Beach, Galveston Island

4.0/5  ⭐⭐⭐⭐   = DECENT — Solid experience, may not justify long detour
                  Examples: City parks, minor forts, secondary museums

3.5/5  ⭐⭐⭐½   = AVERAGE — Nice but not essential, visit if passing through
```

### 4.4 Mode-Specific Rating Adjustments

**INDIA-STATE MODE — adjust weights:**
- If the site is a major Hindu/Buddhist/Jain/Islamic pilgrimage site: add +0.2 to base score (spiritual significance modifier)
- If the site has UNESCO tag: boost Historical Significance factor to full 5/5 minimum
- Wildlife sanctuaries: Uniqueness factor boosted if it's home to endangered species

**USA-STATE MODE — adjust weights:**
- National Parks: Visitor Experience and Uniqueness weighted more heavily
- Natural wonders (geysers, slot canyons, glaciers): Uniqueness factor can dominate
- Historic sites on the National Register: Historical Significance boosted
- State parks vs National Parks: typically 0.2–0.4 points lower than comparable National Parks

---

## SECTION 5 — BUDGET & COST ESTIMATION

### 5.1 Universal Budget Table Format

Always produce a clean 3-tier table:

| Category | Budget | Mid-Range | Luxury | Per |
|---|---|---|---|---|
| Accommodation | [range] | [range] | [range+] | per night |
| Food | [range] | [range] | [range+] | per day |
| Local Transport | [range] | [range] | [range+] | per day |
| Major Attractions | [range] | [range] | [range+] | per trip |
| **Daily Total** | **[total]** | **[total]** | **[total+]** | per person |
| **7-Day Total** | **[total]** | **[total]** | **[total+]** | per person |

### 5.2 Mode-Specific Currency & Budget Anchors

**COUNTRY MODE:**
- Primary currency: Local (e.g., THB, EUR, JPY)
- Always provide USD equivalent in brackets
- Budget range: varies widely ($30–$300+/day depending on country tier)
- Country tiers:
  - Tier 1 (budget-friendly): Cambodia, Vietnam, Nepal, India = $25–50/day budget
  - Tier 2 (moderate): Thailand, Malaysia, Eastern Europe = $45–90/day budget
  - Tier 3 (expensive): Japan, Western Europe, Australia = $80–200/day budget
  - Tier 4 (premium): Switzerland, Scandinavia, UAE = $150–400+/day budget

**INDIA-STATE MODE:**
- Currency: INR (₹) exclusively
- Budget anchor: ₹800–₹2,000/day budget, ₹3,000–₹7,000/day mid-range, ₹10,000+/day luxury
- Always break out train costs separately (Indian Railways is the backbone)
- Note: Domestic flight prices vary enormously by booking lead time — always flag this
- Include auto-rickshaw / e-rickshaw / local bus costs as they dominate ground transport
- Heritage hotels (Rajasthan, MP): note these skew luxury pricing upward dramatically

**USA-STATE MODE:**
- Currency: USD ($) exclusively
- Budget anchor: $60–100/day budget (camping + fast food), $150–300/day mid-range, $400+/day luxury
- Always break out National Park fees ($35/vehicle or America the Beautiful Pass $80/year)
- Gas/petrol costs are a real factor — note average driving distances
- Tipping culture: 18–22% at restaurants, $2–5/day hotel housekeeping — budget accordingly
- State income tax on hotel rooms varies (Texas 15%+, some states no tax)

**CANADA-PROVINCE MODE:**
- Currency: CAD ($) with USD equivalent
- Budget: CAD $70–120/day budget, $180–300/day mid-range, $400+/day luxury
- Parks Canada Discovery Pass: CAD $75.25/person or $151/family — note coverage
- Note GST/HST on accommodation adds 5–15% to listed prices

### 5.3 Per-Item Cost Breakdown (Mandatory)

For every destination, provide individual cost lines for:
- Every paid attraction listed in Section 3
- The 3 most common meal types with price ranges
- Most common transport options with per-ride or per-day cost
- Accommodation in 3 tiers with specific area recommendations

### 5.4 Money-Saving Tips (Minimum 6 tips, destination-specific)

Format: Numbered list, each tip in bold with explanation. Examples by mode:

**COUNTRY MODE examples:**
- "Buy multi-day attraction passes (e.g., Angkor 3-day = $62 vs three 1-day passes = $111)"
- "Take overnight sleeper trains: saves hotel night + transport cost simultaneously"

**INDIA-STATE MODE examples:**
- "Book trains on IRCTC 60 days in advance — Tatkal surcharge can double the price"
- "Buy a single pass for ASI monuments (Archaeological Survey of India) — covers 15-day access"
- "Eat at dhaba/thali restaurants — full meal ₹80–150 vs ₹400–800 at tourist restaurants"
- "Hire a local auto-rickshaw driver for a full day (₹500–800) rather than individual rides"

**USA-STATE MODE examples:**
- "America the Beautiful Annual Pass ($80) covers all National Park entry for 1 year — pays off at 3+ parks"
- "Reserve National Park campgrounds 6 months in advance (recreation.gov opens at 7 AM Pacific)"
- "Many state park day-use areas are free or $5–10 vs National Parks at $35/vehicle"
- "Happy hour specials (4–6 PM at most US restaurants) cut drink prices 30–50%"

---

## SECTION 6 — PRACTICAL TRAVEL INFORMATION

### 6.1 Getting Around (Mode-Specific Content)

**COUNTRY MODE:**
- International arrival airports + transfer costs to city center
- Domestic transport options (budget airlines, trains, buses, ferries)
- Ride-hailing apps available in country (Grab, Uber, Bolt, Ola, etc.)
- Road conditions + driving license reciprocity (can your license be used?)
- Typical taxi vs app-based pricing comparison

**INDIA-STATE MODE:**

*Indian Railways (mandatory subsection):*
- Major railway stations in the state
- Key train routes with journey times and prices (Sleeper/3AC/2AC/1AC)
- How to book: IRCTC app/website, counter booking
- Train classes explained simply: Sleeper (~₹200–400), 3AC (~₹400–800), 2AC (~₹700–1,400), 1AC (~₹1,500+)
- Tatkal quota: available 1 day before, +30–50% surcharge
- Tourist Quota: reserved seats at major stations for foreign tourists

*State Road Transport:*
- State bus services (KSRTC / TNSTC / UPSRTC etc.) — name the correct authority
- Typical bus fare vs train comparison
- Whether buses serve major tourist routes

*Local Transport within Cities:*
- Auto-rickshaw: typical short-trip fare, meter vs fixed-price notes
- E-rickshaw: where available, typical fares
- City bus services: coverage and reliability
- Metro: if available (Delhi, Mumbai, Chennai, Bengaluru, Hyderabad, Kochi)
- Cab apps: Ola/Uber coverage in the state

**USA-STATE MODE:**

*Driving / Road Trips (mandatory — USA is fundamentally car-based):*
- Best road trip routes within the state (name specific highways/routes)
- Typical gas price range for the state (varies significantly)
- Distance between major attractions + drive times (actual drive, not as-the-crow-flies)
- Highway toll roads: which ones, typical costs, E-ZPass acceptance
- RV/campervan rental: if popular for this state, approximate cost ($150–300/day)

*Airports & Flights:*
- Major airports in state + which airlines serve them
- Typical flight prices from NYC, LAX, Chicago (the 3 major hubs)
- Airport ground transport to city center

*Public Transit:*
- Is it viable? (NYC: yes. Arizona: no)
- Subway/Metro systems if available
- Amtrak routes through the state (if relevant)

*Ride-hailing:*
- Uber/Lyft coverage + typical pricing for key routes
- Note any cities with limited coverage (rural areas)

### 6.2 Health & Safety

**COUNTRY MODE:**
- Vaccinations required or recommended (be specific with disease + shot name)
- Drinking water safety verdict
- Food safety guidance
- Travel insurance verdict (essential / recommended / optional)
- Country-specific health risks (malaria zones, altitude sickness, monsoon-related illness)
- Healthcare quality in major cities + nearest hospital to key tourist areas
- Safety rating + specific concerns (petty theft, scams, political stability)

**INDIA-STATE MODE:**
- Water safety: bottled water essential in [state] vs tap water drinkable in [specific city] if applicable
- Food hygiene: street food safety by type
- Altitude concerns if hill station state (Himachal, Uttarakhand, Sikkim, Ladakh)
- Heatstroke risk (Rajasthan, UP in May–June: real danger)
- State-specific animal concerns (Rajasthan: camels on roads; Kerala: elephants at festivals; Jim Corbett: tiger warning protocols)
- Emergency numbers: 112 (national), state police, tourism helplines
- Best hospitals in state capital and major tourist towns

**USA-STATE MODE:**
- Emergency: 911 (always)
- State-specific health concerns (rattlesnakes in Southwest, bears in mountain states, jellyfish in Gulf Coast)
- Altitude sickness warnings (Colorado, Utah, Nevada at elevation)
- Sun exposure: UV index warnings for desert states
- Wildfire smoke: California, Oregon, Washington — seasonal air quality alerts
- Water safety: tap water drinkable throughout USA — but note Flint-type exceptions if relevant
- Travel insurance: less critical domestically but recommended for trip cancellation coverage

### 6.3 Accommodation

**Universal format for all modes:**

Provide a table:

| Type | Price Range | Best Neighborhoods | Booking Platform |
|---|---|---|---|
| Budget | [range] | [specific areas] | [platform] |
| Mid-Range | [range] | [specific areas] | [platform] |
| Luxury | [range] | [specific areas] | [platform] |
| Unique Stay | [range] | [description] | [platform] |

**Mode-specific unique stay types:**

| Mode | Unique Stay Examples |
|---|---|
| COUNTRY | Overwater bungalows (Maldives), ryokan (Japan), riad (Morocco), jungle lodge |
| INDIA-STATE | Heritage palace hotel (Rajasthan), houseboat (Kerala), eco-camp (Coorg), tree-house (Wayanad) |
| USA-STATE | Glamping/yurt, dude ranch, lighthouse B&B, ski-in-ski-out lodge, national park lodge (must book months ahead) |

### 6.4 Language & Communication

**COUNTRY MODE:**
- Official language(s)
- English proficiency level (widespread / tourist areas only / very limited)
- 10 essential phrases with phonetic pronunciation
- SIM card: which operators, where to buy, cost for data
- WiFi availability rating (excellent / good / patchy / rare outside cities)
- Currency exchange: best method (ATM / exchange bureau / avoid airport)

**INDIA-STATE MODE:**
- Official state language (Tamil / Telugu / Kannada / Malayalam / Bengali / etc.)
- Hindi usefulness in that state (high / moderate / low — varies dramatically)
- English availability in tourist areas
- 8 phrases in the local state language (not just Hindi)
- SIM: Jio / Airtel / Vi recommended; airports sell tourist SIMs
- UPI/PayTM/PhonePe acceptance — cash vs digital payments by area
- Note: some pilgrimage areas are cash-only

**USA-STATE MODE:**
- English only in most areas; Spanish useful in Texas, California, New Mexico, Florida
- No SIM issues (US phone works everywhere; international visitors buy prepaid)
- WiFi: excellent in cities, patchy in national parks (this is intentional — embrace it)
- Tipping etiquette: 18–22% restaurants, 15–20% taxis, $1–2/drink at bars, $2–5/night hotel housekeeping

### 6.5 Visa & Entry [COUNTRY MODE ONLY]

- Visa required for [key nationalities: Indian, US, UK, Australian passport holders]
- Type of visa: on arrival / e-visa / embassy required
- Cost in USD
- Duration of stay permitted
- Processing time
- Key rules: single entry vs multiple entry, extension policy
- Border crossing notes if entering overland from a neighbouring country

### 6.6 Emergency Contacts [ALL MODES]

| Type | COUNTRY MODE | INDIA-STATE | USA-STATE |
|---|---|---|---|
| Emergency | Local emergency number | 112 | 911 |
| Police | Local police number | 100 | 911 |
| Medical | Local ambulance | 108 (ambulance) | 911 |
| Tourism helpline | Country tourism board number | Incredible India: 1800-111-363 | State tourism board number |
| Your embassy | List top 5 nationalities' embassies | N/A | N/A |

---

## SECTION 7 — SPECIAL INTEREST EXPERIENCES

Every itinerary includes ALL of the following categories, with **mode-specific content** for each.

### 7.1 Adventure Activities

**COUNTRY MODE:** Rock climbing, jungle trekking, scuba diving, volcano hiking, desert safaris, river rafting, bungee jumping — as geographically appropriate.

**INDIA-STATE MODE:**
- Trekking (name specific trails with difficulty, duration, permit requirements)
- River rafting (Rishikesh, Coorg, Manali — name specific rivers and grade)
- Wildlife safaris (name specific parks, jeep safari cost, permit booking process)
- Paragliding (Bir Billing, Solang Valley, Munnar)
- Scuba diving (Andamans, Lakshadweep) / Snorkelling
- Cycling tours (Coorg coffee estates, Spiti Valley, Rajasthan villages)
- Rock climbing (Hampi, Badami)

**USA-STATE MODE:**
- Hiking: Top 3 hikes in state with difficulty, distance, elevation gain
- Water sports: Kayaking, white-water rafting, surfing, snorkelling — as applicable
- Skiing/snowboarding (mountain states): major resorts, season, lift ticket price
- Rock climbing: Red Rock (Nevada), Yosemite (California), Moab (Utah)
- Off-roading / ATV: popular in Southwest states
- Fishing: types (fly-fishing, deep-sea, ice fishing), permit requirements
- Cycling: dedicated trails, Strava-famous routes

### 7.2 Culinary Tourism

**ALL MODES — Mandatory subsections:**
- Cooking classes: where, duration, cost, what you learn
- Food tours: guided street food / market tours
- Signature dishes to try: minimum 8 dishes with description and where to eat them
- Local drinks (alcoholic + non-alcoholic): regional specialties
- Best markets: name specific markets, their days/hours, what they sell

**INDIA-STATE MODE — Additional:**
- Regional thali: what comes on the plate, where to eat the definitive version, price
- Street food champion dishes: state-specific (e.g., Pani Puri in Mumbai, Dosa in Chennai, Litti Chokha in Bihar)
- Sweets and mithai unique to the state
- Chai culture: types of tea, famous tea stalls
- Food geography: note if different districts have distinct food cultures (e.g., Chettinad vs Chennai vs Coimbatore in Tamil Nadu)

**USA-STATE MODE — Additional:**
- The state's defining food identity (BBQ in Texas, lobster in Maine, Cajun in Louisiana, green chile in New Mexico)
- Brewery / winery / distillery scene: state is known for what drink, notable regions
- Farm-to-table culture if strong (Vermont, California, Oregon)
- State fair foods (if famous — Texas State Fair, Iowa State Fair)
- Best diners / roadside institutions

### 7.3 Wildlife & Nature

**COUNTRY MODE:**
- National parks + protected areas
- Signature wildlife species (Big 5 in Africa, tigers in India, etc.)
- Marine life / coral reefs (if coastal)
- Bird watching spots
- Responsible tourism guidelines

**INDIA-STATE MODE:**
- Tiger Reserves (Project Tiger network — name them)
- Wildlife Sanctuaries + National Parks with entry fees and safari costs
- Jeep safari vs elephant back (ethical guidance: NO elephant back rides)
- Migratory bird sanctuaries + season (Bharatpur, Vedanthangal, etc. — as relevant)
- Marine national parks (Gujarat, Andaman)
- Responsible wildlife tourism: do's and don'ts in Indian context
- Permit requirements: some reserves require permission days in advance

**USA-STATE MODE:**
- National Parks (mandatory) — include entry fee, best season, must-do hike
- State Parks — typically cheaper, less crowded, underrated gems
- Wildlife: bears, wolves, bison, eagles, marine mammals — where to see them
- Whale watching tours (coastal states): company, season, cost
- Birding hotspots (Bosque del Apache NM, Everglades FL, etc.)
- Leave No Trace principles — especially important to mention for wilderness areas
- National Wildlife Refuges — often overlooked, free entry

### 7.4 Cultural Experiences

**COUNTRY MODE:**
- Village / rural homestays
- Craft workshops (pottery, weaving, painting)
- Traditional ceremony attendance (temple festivals, market days)
- Monastery / temple stays

**INDIA-STATE MODE:**
- Temple circuits: major pilgrimages, important festivals at specific temples
- Classical art forms: Bharatanatyam (Tamil Nadu), Kathakali (Kerala), Odissi (Odisha), Mohiniyattam, etc. — where to see live performances, cost
- Craft traditions: Pashmina (Kashmir), Bidriware (Karnataka), Pattachitra (Odisha), Kantha (Bengal) — where to buy authentic pieces
- Village/tribal experiences: homestays with specific community names
- Regional cinema: name the local film industry (Tollywood, Kollywood, Mollywood, Sandalwood) — interesting for culturally curious visitors
- Yoga and Ayurveda: authentic vs tourist (rishikesh/Kerala — distinguish quality ashrams from commercial ones)

**USA-STATE MODE:**
- Native American / Indigenous cultural sites (mandatory to mention if present)
- History: Civil War battlefields, pioneer trails, colonial heritage — as relevant
- Music: Nashville (country), New Orleans (jazz), Austin (live music), Memphis (blues) — live music scene specifics
- Art districts: named galleries, First Friday events, museum free days
- Sports: major league teams in state, iconic sporting venues/experiences
- State capitol + civic architecture tours

### 7.5 Photography Hotspots

Every mode:

| Shot Type | Location | Best Time | Tips |
|---|---|---|---|
| Sunrise | [location] | [exact time] | [composition tip] |
| Sunset | [location] | [exact time] | [what to capture] |
| Architecture | [building/area] | [golden hour / overcast] | [angle/framing] |
| Wildlife | [sanctuary/park] | [season/time of day] | [lens/distance] |
| Street/People | [market/neighbourhood] | [morning/evening] | [ask permission?] |
| Landscape | [viewpoint] | [season/weather] | [ND filter / tripod?] |

### 7.6 Wellness & Retreats

**COUNTRY MODE:** Yoga retreats, spa traditions, meditation centers, detox programs specific to destination culture.

**INDIA-STATE MODE:**
- Ayurveda: Kerala is the gold standard — differentiate Panchakarma (multi-day therapeutic) from massage-only
- Yoga ashrams: authentic (Sivananda Ashram Rishikesh) vs commercial
- Meditation retreats: Vipassana 10-day silent retreats (free, only dana/donation)
- Spa experiences: cost range ₹1,000–₹5,000/session in most states
- Hot springs: Himachal (Kasol, Manikaran), Uttarakhand (Gaurikund), Sikkim
- Forest bathing: available in hill station states

**USA-STATE MODE:**
- Spa towns: Sedona (Arizona), Hot Springs (Arkansas), Asheville (North Carolina)
- Hot springs: Colorado (Glenwood Springs), Montana, Idaho
- Yoga: Sedona, Santa Fe, Portland, Byron Bay of USA — note which cities have the strongest yoga culture
- Canyon/desert meditation: growing trend in Southwest
- Wellness resorts vs day spas: cost comparison ($150–500+/day resort vs $80–150 day spa)

---

## SECTION 8 — SUGGESTED ITINERARIES

### 8.1 Universal Rules for Itinerary Design

- **Never overschedule.** Maximum 3–4 attractions per day. Travelers need meal time, travel time, rest, and spontaneous moments.
- **Always start with orientation.** Day 1 should be arrival + easy exploration. Never schedule a major site on Day 1 before lunch.
- **Cluster geographically.** Group attractions by physical proximity to minimise backtracking.
- **Include one free afternoon per 3 days.** Traveler fatigue is real.
- **Name specific restaurants for dinner.** Don't just say "dinner" — name real restaurants with price range.
- **Note the transport method for every move.** Don't assume the traveler knows how to get there.

### 8.2 Itinerary Set by Mode

**COUNTRY MODE — Minimum 3 itineraries:**
- 3-day (focused on capital / one major area)
- 5-day (capital + one secondary city)
- 7-day (capital + two regions)
- 10-day (comprehensive: capital + 3 regions, highly recommended for first visit)

**INDIA-STATE MODE — Minimum 3 itineraries:**
- 3-day (weekend getaway — one area, 1 travel day from nearest metro)
- 5-day (hits highlights without rushing)
- 7-day (comprehensive state experience)
- Optional: 10-day for large states (Rajasthan, UP, MP)

**USA-STATE MODE — Minimum 4 itineraries:**
- 2-day weekend (from nearest major city — realistic for most US travelers)
- 4-day long weekend
- 7-day (full state experience)
- Road trip route (specific highway/route with stops, mileage, overnight locations)

### 8.3 Daily Entry Format

Every day entry must include:

```
Day [N] — [Theme / Focus Title]

• [Time] AM: [Activity] — [Location] — [Transport method] — [Cost]
• [Time] AM: [Activity] — [Location] — [Duration] — [Key tip]
• [Time] PM: [Lunch at specific restaurant or market] — [Price range]
• [Time] PM: [Activity]
• [Time] PM: [Activity]
• [Time] PM/Evening: [Dinner recommendation] — [Restaurant name] — [Price range]
• Overnight: [Area/Hotel type] — [Budget/Mid-range/Luxury options with prices]
```

---

## SECTION 9 — ETIQUETTE & CULTURAL RESPECT

### 9.1 Universal Subsections (All Modes)

1. **Sacred / Religious Sites** — dress code, behaviour, photography rules
2. **Interacting with Locals** — appropriate greetings, what not to say
3. **Photography of People** — when/how to ask, payment norms, refusal respect
4. **Environmental Responsibility** — litter, wildlife interaction, Leave No Trace

### 9.2 Mode-Specific Etiquette

**COUNTRY MODE:**
- Full cultural guide covering all aspects of local customs
- What is considered deeply offensive (country-specific — this varies enormously)
- Tipping culture (yes/no, how much, when)
- Gift-giving customs if relevant
- What NOT to bring into the country (restricted items)
- Dress codes beyond temples (some countries have broad modesty requirements)

**INDIA-STATE MODE:**
- Temple etiquette: remove footwear, cover head if required (Sikh Gurdwaras, some mosques), menstruation restrictions at certain temples (controversial — note without judgment)
- Camera fees at monuments (ASI monuments often charge ₹25–100 for cameras, ₹500+ for video)
- Bargaining: where it is expected (bazaars, auto-rickshaws without meter) vs where it is rude (fixed-price shops, temples)
- Receiving with right hand; left hand considered unclean
- Touching feet of elders as sign of respect
- Loud discussions of sensitive topics (religion, politics, caste) — avoid
- Vegetarian/non-vegetarian awareness: many states have significant vegetarian populations; asking before offering food
- State-specific rules: no beef in UP/Rajasthan (Hindu-majority areas), no pork in certain Kashmiri restaurants

**USA-STATE MODE:**
- Tipping mandatory culture: 18–22% restaurants (not optional, servers earn $2–$5/hour base wage), 15–20% Uber/taxi, $1–2/drink bar
- Jaywalking: technically illegal, widely done in some states (NYC), strictly enforced in others (LA)
- Public alcohol: illegal in most states outside designated zones
- Cannabis: legal in [specific states — California, Colorado, Oregon, Washington etc.] — note current state law clearly
- Gun laws: open carry / concealed carry permitted in some states — relevant for visitors unfamiliar with seeing firearms
- Racial / social sensitivity: USA has active ongoing conversations; be mindful
- National Park rules: do not feed animals, stay on trails, pack out all trash
- Native American land etiquette if the destination includes tribal areas

---

## SECTION 10 — QUALITY ASSURANCE CHECKLIST

Before completing any itinerary, verify every item below is satisfied.

### 10.1 Completeness Check

- [ ] Destination correctly classified and mode applied throughout
- [ ] Cover page includes destination name, type, subtitle, date
- [ ] Overview section explains what makes this destination unique (not generic)
- [ ] Seasonal table has all 4 rows (Peak, Shoulder, Off-Season, Avoid/Warning)
- [ ] Minimum 5 festivals/events listed with dates and travel impact
- [ ] Minimum number of attractions for destination type met (see Section 3.3)
- [ ] Every attraction has: narrative, rating, duration, timings, entrance fee, pro tip
- [ ] All ratings calculated using 5-factor formula (not guessed)
- [ ] Budget table covers all 3 tiers (Budget, Mid-Range, Luxury)
- [ ] Per-item costs listed for every paid attraction
- [ ] Minimum 6 money-saving tips provided
- [ ] Transport section uses mode-specific content (trains for India, road trips for USA, etc.)
- [ ] Health & Safety covers vaccinations + water + specific regional risks
- [ ] Accommodation table covers 4 types including a unique stay option
- [ ] Language section has correct regional language for India states
- [ ] Visa section included for Country Mode
- [ ] Emergency contacts provided in correct format for mode
- [ ] All 6 Special Interest categories present (Adventure, Culinary, Wildlife, Cultural, Photography, Wellness)
- [ ] Photography table has 6 shot types with specific locations and timing
- [ ] Minimum 3 suggested itineraries (Country/India) or 4 (USA with weekend option)
- [ ] Every day in every itinerary has transport method + specific restaurant for at least 1 meal
- [ ] Etiquette section covers mode-specific content (not generic)
- [ ] Final recommendations paragraph written

### 10.2 Accuracy Check

- [ ] All entrance fees in correct local currency with USD equivalent
- [ ] Opening hours verified as current (note: "verify locally as hours change")
- [ ] Distances measured from correct reference point (city centre for countries, state capital for India states, nearest major city for USA)
- [ ] Attraction names spelled correctly in English AND local script if relevant (India states: include Hindi/regional script for key temples; Japan: kanji etc.)
- [ ] Budget figures realistic for current year (note the date of compilation)
- [ ] No generic filler phrases ("this is a must-see!") — all descriptions are specific

### 10.3 Quality Check

- [ ] Every attraction description is 3–5 sentences minimum
- [ ] No two attraction descriptions use the same opening phrase
- [ ] The narrative voice is engaging, not encyclopaedic
- [ ] Pro tips are genuinely useful insider observations (not "arrive early to avoid crowds" as the only tip)
- [ ] The itineraries feel human — they include meals, rest, transitions, not just sites
- [ ] Photography table has actionable composition tips, not just location names
- [ ] Special interest experiences go beyond the generic (specific school names, specific trails, specific dishes)

---

## SECTION 11 — OUTPUT FORMAT GUIDANCE

### 11.1 When to Create a Word Document (.docx)

Create a Word document (using the docx skill) when:
- The user explicitly requests a Word doc / downloadable file
- The itinerary is for a country or destination requiring 15+ attractions (comprehensive)
- Professional use is implied (tour operator, travel agency, client document)

Word doc formatting standards:
- Title font: Arial 36pt Bold, color #DC143C (crimson) for countries, #B8860B (gold) for India states, #1B4F72 (navy) for USA states
- H1 sections: Arial 28pt Bold, same color scheme
- H2 subsections: Arial 22pt Bold
- Body text: Arial 11pt, dark grey #333333
- Table headers: matching section color, white text
- Table rows: alternating #FFFFFF and #F5F5F5 (light grey)
- Page margins: 1 inch all sides
- Page size: A4 (international) or US Letter (for USA-state mode)

### 11.2 When to Respond in Chat (Markdown)

Respond in chat (markdown format) when:
- The user asks a quick question ("what's the best time to visit Kerala?")
- The destination is a small area requiring fewer than 8 attractions
- The user says "quick overview" or "brief itinerary"
- The user asks for a specific sub-section only ("just give me the budget")

### 11.3 Inline Response vs Full Guide

| User says | Produce |
|---|---|
| "Give me an itinerary for [destination]" | Full guide — all sections |
| "Create a word doc for [destination]" | Full guide as .docx |
| "What's the best time to visit [destination]" | Section 2 only |
| "How much does [destination] cost?" | Section 5 only |
| "What are the best things to do in [destination]?" | Section 3 only, abbreviated |
| "Plan a 5-day trip to [destination]" | Section 8 (5-day itinerary) + key attractions from Section 3 |
| "Give me a weekend trip to [US state]" | 2-day itinerary + budget + practical tips |

---

## SECTION 12 — EXAMPLE APPLICATIONS BY MODE

### 12.1 Country Mode — Cambodia (Reference Example)

- Mode: COUNTRY
- Currency: KHR / USD
- Budget Tier: Tier 1 (budget-friendly Southeast Asia)
- Cities covered: Siem Reap, Phnom Penh, Sihanoukville, Battambang
- Attractions: 14 total
- Unique stay: floating village guesthouse, eco-resort on Koh Rong
- Key festival: Khmer New Year (April), Bon Om Touk (October)
- Itineraries: 3-day, 5-day, 7-day

### 12.2 India State Mode — Rajasthan

- Mode: INDIA-STATE
- Currency: INR (₹) only
- State capital: Jaipur
- Major areas: Jaipur, Jodhpur, Udaipur, Jaisalmer, Pushkar, Ranthambore
- Attractions: 18–20 total
- Unique stay: heritage palace hotel (Taj Lake Palace, Umaid Bhawan, Neemrana Fort)
- Key festivals: Pushkar Camel Fair (Oct–Nov), Desert Festival Jaisalmer (Feb)
- Train: Jaipur–Jodhpur: Mandor Express; Jaipur–Udaipur: Mewar Express
- Language section: Hindi primary, English in tourist areas, Rajasthani/Marwari locally
- Budget: ₹1,500–₹2,500/day budget; ₹5,000–₹12,000 mid-range; ₹25,000+ luxury
- Itineraries: 3-day (Golden Triangle: Jaipur only), 5-day (Jaipur+Jodhpur), 7-day (Golden Triangle of Rajasthan: Jaipur+Jodhpur+Udaipur), 10-day (full circuit)

### 12.3 USA State Mode — Arizona

- Mode: USA-STATE
- Currency: USD ($)
- Major areas: Grand Canyon, Sedona, Phoenix, Scottsdale, Tucson, Monument Valley, Antelope Canyon
- Attractions: 16 total
- National Parks: Grand Canyon ($35/vehicle, or America the Beautiful Pass), Saguaro ($25)
- Road trip route: AZ-89 (Jacob Lake → Grand Canyon North Rim → Page → Antelope Canyon → Monument Valley) — 380 miles
- Unique stay: glamping at Mii amo (Sedona), Under Canvas (Grand Canyon)
- Key events: Tucson Gem Show (Feb, world's largest), Sedona International Film Festival (March)
- Budget: $80–120/day budget (camping); $200–300 mid-range; $500+ luxury
- Tipping: 18–22% restaurants mandatory; Arizona has no income tax on food but 8.5%+ on hotels
- Cannabis: legal for adults 21+ in Arizona since 2020
- Weather warning: Phoenix June–August 40°C+ (104°F+) — dangerous for outdoor activity

---

## SECTION 13 — FINAL PRINCIPLES

1. **Never be generic.** "A beautiful temple worth visiting" is worthless. "The only temple in India with a moat accessible by boat, housing a 16th-century granite idol of Shiva found floating in the Kaveri River" is useful.

2. **Distance and time are mandatory.** Every attraction must state how far it is from the city center (or relevant reference point) and how long to get there by the most common transport method.

3. **Ratings must be calculated, never guessed.** If you cannot justify the score using the 5-factor formula, the score is wrong.

4. **Mode discipline is absolute.** A USA-state itinerary must never recommend booking via IRCTC. An India-state itinerary must never show prices in USD only. The mode shapes every word.

5. **Practical beats inspirational.** A traveler needs to know what time the first bus departs more than they need to know that "the sunrise is magical." Include both, but never sacrifice practical for poetic.

6. **Respect cultural context.** An India-state itinerary must reflect whether the area is predominantly Hindu, Muslim, Sikh, Christian, Buddhist, or tribal — and the temple/shrine/mosque recommendations should reflect that reality. A USA-state itinerary must acknowledge Native American land and history where it exists.

7. **Budget transparency is kindness.** A traveler who runs out of money on Day 4 of a 7-day trip did not get a good itinerary. Be honest about what things cost, including hidden costs (tips, fees, transport between sites, national park entry, resort fees on hotel bills in USA).

8. **Itineraries are for humans, not algorithms.** Every itinerary must have: at least one free afternoon, at least one meal recommendation per day, realistic travel times between sites, and at least one "don't miss this, most tourists skip it" observation per area.

---

*SKILL.md v2.0 — Universal Travel Itinerary Framework*
*Covers: Countries (all) · Indian States (28 states + 8 UTs) · USA States (50) · Canadian Provinces (13)*
*Output formats: Word .docx (comprehensive) · Markdown (quick reference) · Section-only (targeted queries)*
