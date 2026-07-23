# Bniiine — Image Asset Prompts

Each block below is a **standalone prompt** you can paste into any image generator (Midjourney, Gemini, DALL·E, Flux, Firefly). The master style anchor is embedded in every prompt so the whole set stays visually consistent. Save the outputs into `assets/` using the suggested filenames — the game code is structured to swap SVGs for these PNGs directly.

## 0 · Master style anchor

Do **not** modify this — it's already baked into every prompt below.

> Highly polished 2D digital illustration for a premium mobile game. Clean, expressive linework in the style of modern Netflix-quality animation crossed with classic French Bande Dessinée — rich environmental storytelling, confident graphic outlines, painterly volumetric shading. Palette: warm sunset ochre and coral, jewel-toned majorelle blue and zellige teal, saffron, terracotta, deep berry, with copper and burnished gold accents. Warm golden-hour lighting with soft atmospheric rim light and gentle bloom. Culturally accurate North African / Maghrebi motifs (zellige, muqarnas, Moroccan arches). Stylized appetizing food rendering. No text unless specified.

## Recommended delivery order

1. **Splash + Logo + Title** (§1, §2) — biggest first-impression jump
2. **Mascot** (§3) — replaces the current SVG chef
3. **Main game background** (§4.1) — behind the merge board
4. **Ingredient icons** (§6, all 15) — replaces the inline SVGs
5. **Spice Crate art** (§7.2, §7.3) — the loot-box moment
6. **UI ornaments + zellige pattern** (§5, §7, §8)

---

## 1 · Splash screen

### 1.1 — Full-bleed splash illustration
- **File:** `assets/splash-hero.jpg` (also request a `1080×1920` portrait variant `splash-hero-portrait.jpg`)
- **Size:** 2560×1600 landscape, 1080×1920 portrait
- **Prompt:**
> Wide cinematic hero illustration for a mobile game splash screen: a bustling Moroccan medina at magic hour, viewed from a slightly elevated angle. Left side shows a colorful souk alley — pyramid mounds of saffron, turmeric, paprika, and cumin spices arranged in front of a spice merchant's stall, embroidered rugs draped, brass mint-tea pots stacked, ripe oranges in a wicker basket. Middle-right shows an ornate riad courtyard with intricate zellige tile floor patterns in majorelle blue and teal, a horseshoe-arched doorway framed with muqarnas carving, low cushioned seating with velvet pillows in jewel tones, and a small orange tree. Two intricate brass Moroccan lanterns hang from the top corners casting warm golden pools of light. In the far background: layered Marrakech rooftops fading into a coral-and-amber sunset sky, silhouette of a minaret backlit by the sun. In the center-right foreground: a friendly Moroccan chef in a white tunic and red fez presents a steaming clay tagine on a copper tray, with a family of three delighted customers seated on the cushions. Above them a soft speech bubble contains "DELICIOUS!" in playful lettering. In the lower-right corner: an ornate wooden treasure chest bursting open with colorful spice pouches and a "SPICE CRATES" banner. Rich Bande Dessinée environmental detail density, appetizing warmth, warm atmospheric golden-hour haze with faint spice dust floating in the light shafts, Netflix-animation clean lines, high polish, painterly. Composition leaves a dark warm slot at bottom-center for a logo overlay.

### 1.2 — Splash background only (no scene, for logo overlay)
- **File:** `assets/splash-bg.jpg`
- **Size:** 2560×1600
- **Prompt:**
> Textured warm gradient background: golden-hour sky transitioning from soft cream ivory at the top through saffron and coral to deep terracotta and burgundy at the bottom. A subtle soft warm sun glow bloom in the upper center. Faint zellige diamond pattern overlay at very low opacity throughout. Delicate floating warm spice-dust motes catching the light. Painterly, cinematic, no text, no characters, no architecture — pure atmosphere ready for a logo overlay in the center.

---

## 2 · Logo & brand

### 2.1 — Primary wordmark logo
- **File:** `assets/logo-bniiine.png` (also request an SVG)
- **Size:** 2400×900px, transparent background
- **Prompt:**
> Custom hand-lettered wordmark for the word **"Bniiine"** in a warm, rounded, cheerful serif with subtle Arabic-Kufic-inspired flourishes on the strokes. Letters carved from burnished copper and rose gold with tiny zellige tile inlays on the counters. Small saffron sparkle over the second "i" dot. Soft golden-hour drop shadow. Below the wordmark: elegant subtitle **"The Ultimate North African Culinary Empire"** in refined uppercase widely-spaced letters. Transparent background. Polished mobile game logo, Netflix-animation clean lines meets Bande Dessinée. Vibrant, appetizing, premium.

### 2.2 — App icon / rounded tile
- **File:** `assets/icon-app-1024.png`
- **Size:** 1024×1024, no transparency, rounded corners baked in
- **Prompt:**
> Mobile game app icon, 1024×1024, rounded square. A single stylized tagine pot (cone-lid earthenware) glowing from within with warm saffron light, sitting on a small zellige-tile mosaic base of majorelle blue and teal. A wisp of steam curls upward forming a subtle "B" shape. Warm terracotta-and-gold radial background with an eight-point Moroccan star silhouette. Bold, punchy, readable at 60px. Vibrant Netflix-animation meets Bande Dessinée style.

---

## 3 · Mascot: Chef Karim

### 3.1 — Mascot hero pose (main mascot art)
- **File:** `assets/mascot-karim-hero.png`
- **Size:** 1600×2000, transparent PNG
- **Prompt:**
> Full-body 2D character illustration of a friendly middle-aged Moroccan chef named **Karim**: warm brown skin, kind almond eyes, neatly trimmed grey-and-black beard, laugh lines. He wears a crisp white chef's tunic with terracotta piping and a small **red fez cap** with a black tassel. In his hands he presents a steaming ceramic tagine pot with a proud smile. A colorful embroidered apron with subtle Berber patterns wraps his waist. Slight three-quarter view, welcoming pose, feet grounded. Warm rim light from the upper left, soft ambient occlusion. Clean expressive linework, no outline overload. Transparent background.

### 3.2 — Mascot expression sheet
- **File:** `assets/mascot-karim-expressions.png`
- **Size:** 2400×800, transparent PNG, 4 head-and-shoulder busts in a row
- **Prompt:**
> Character expression sheet for Chef Karim (Moroccan chef, white tunic, red fez): four head-and-shoulder portraits in a horizontal row, transparent background between. **(1) Warm greeting** — eyes half-closed, big smile, one hand raised in salaam; **(2) Delighted** — eyes wide with joy, hands clasped, mouth open in "Delicious!"; **(3) Thoughtful** — one hand stroking beard, gentle raised eyebrow; **(4) Cooking** — determined focus, sleeves rolled, wiping brow with a cloth. Consistent character design across all four. Clean linework, warm golden-hour lighting.

### 3.3 — Customer characters (recommended)
- **File:** `assets/customers-sheet.png`
- **Size:** 2400×1200, transparent PNG, 3 characters side by side
- **Prompt:**
> Three friendly Moroccan / Tunisian customer characters, full-body cartoony but grounded, transparent background: **(1) Older grandmother** in a colorful teal-and-gold caftan and headscarf, holding a small clay teapot, warm smile; **(2) Young man** in modern casual clothes over a djellaba, curious expression, phone in one hand; **(3) Traveling merchant** with rolled fabrics slung over shoulder, gold earring, hearty laugh. Diverse ages, all with warm brown skin tones and expressive kind faces. Cohesive with Chef Karim's style.

---

## 4 · Backgrounds & scenes

### 4.1 — Main game background (behind the merge board)
- **File:** `assets/bg-medina-desktop.jpg` + `assets/bg-medina-portrait.jpg`
- **Size:** 2560×1600 landscape + 1080×1920 portrait
- **Prompt:**
> Cinematic Moroccan medina courtyard at golden hour, viewed slightly from above. Warm terracotta walls with intricate carved stucco, layered rooftops of Marrakech fading into a coral-and-amber sunset sky. Palm fronds silhouetted on the left. A distant minaret backlit by the sun. Foreground shows the corner of a lush riad courtyard with jewel-toned zellige tile floor patterns (majorelle blue, teal, saffron). Two ornate brass lanterns glow softly in the upper corners casting warm light. Empty middle area (composition leaves room for a game board overlay to sit centered). Rich Bande Dessinée environmental storytelling, appetizing warmth, atmospheric haze, painterly.

### 4.2 — Title screen backdrop
- **File:** `assets/bg-title-hero.jpg`
- **Size:** 2560×1600
- **Prompt:**
> Dramatic wide establishing shot of a bustling North African souk at magic hour: winding alley lined with pyramid mounds of colorful spices (crimson, saffron, ochre, paprika), hanging brass lamps, embroidered rugs, terracotta pottery stalls, and in the distance a sunlit ochre riad archway. A shaft of golden light beams through the alley catching floating spice dust. Silhouettes of shopkeepers arranging goods. Zellige tile detail visible on lower walls. Cinematic composition with a dark warm foreground and glowing midground focal point.

### 4.3 — Riad kitchen (chef backdrop)
- **File:** `assets/bg-riad-kitchen.jpg`
- **Size:** 1600×2000 (portrait)
- **Prompt:**
> Interior view of a traditional Moroccan riad courtyard converted into a kitchen. Ornate horseshoe archway framing the scene, walls of intricate zellige mosaic in majorelle blue, teal, and saffron. A carved cedar-wood counter with clay tagines, brass mint-tea pots, and bowls of couscous. Overhead: a filigreed brass chandelier lantern casting golden lace-patterns on the tiled floor. Small orange tree in a decorated pot to one side. Warm golden-hour light streaming through carved wooden latticework. Painterly, warm, welcoming, no people.

### 4.4 — Souk stall backdrop (orders panel)
- **File:** `assets/bg-souk-stall.jpg`
- **Size:** 1200×1800 (portrait)
- **Prompt:**
> Cozy market stall interior view: three tall pyramid mounds of colorful spices in the foreground (turmeric yellow, harissa red, cumin brown), woven baskets of dates and dried figs behind them, strings of dried peppers hanging above, all lit by a warm hanging brass lantern. Wall behind is carved terracotta plaster with a small niche holding a mint-tea pot. Rich texture density, appetizing, jewel tones on the spices, warm golden ambience.

---

## 5 · Repeating textures & silhouettes

### 5.1 — Seamless zellige tile pattern
- **File:** `assets/pattern-zellige-seamless.png`
- **Size:** 1024×1024, seamlessly tileable
- **Prompt:**
> Seamless tileable geometric Moroccan zellige tile pattern, 1024×1024, edges perfectly tile. Eight-pointed star mosaics interlocking with hexagonal and diamond shapes. Jewel-toned palette: deep majorelle blue, zellige teal, ivory, terracotta, and saffron with thin ivory grout lines. Slight painterly texture, subtle age wear. Flat top-down view, no lighting, ready to use as a repeating pattern.

### 5.2 — Medina silhouette skyline strip
- **File:** `assets/silhouette-medina.png`
- **Size:** 3200×600, transparent PNG, silhouette only
- **Prompt:**
> Long horizontal silhouette of a Moroccan medina skyline — tightly packed flat-roofed buildings, several minarets, small domes, palm trees, satellite dishes, and a distant kasbah. Pure dark warm-brown silhouette on transparent background, no gradients or details inside the shapes. Layered depth in three subtle shades. Composition designed to sit at the bottom of a game screen.

---

## 6 · Ingredient icons — the 15 merge tiles

**Every icon shares this envelope:**
- **Size:** 1024×1024, transparent PNG, centered subject, ~15% padding.
- **Style bake-in:** *"Isometric-ish three-quarter view, subject centered on transparent background, appetizing chunky stylized game asset, warm golden-hour rim light, soft cast shadow underneath. Netflix-animation clean lines with Bande Dessinée detail. Consistent scale and lighting across the set."*

### Spice chain (5)

**6.1 — `assets/tile-spice-1-cumin.png`  — Cumin Seed**
> A small handful of golden-brown cumin seeds scattered on an invisible surface, tiny highlights catching golden light, appetizing texture. Chunky mobile-game icon.

**6.2 — `assets/tile-spice-2-ras.png`  — Ras el Hanout**
> A neat pyramid mound of ras el hanout spice blend in rich burnt-orange, brick-red, and ochre, glossy stylized grains visible, tiny star anise and rosebud petals dusted on top. Sitting on a small circle of hessian cloth.

**6.3 — `assets/tile-spice-3-harissa.png` — Harissa Jar**
> A small ceramic jar in glossy terracotta glaze with intricate Berber pattern trim, brimming with deep crimson harissa paste, a wooden spoon resting in it, a fresh mint leaf tucked at the side. Steaming spice aroma wisp.

**6.4 — `assets/tile-spice-4-chest.png` — Spice Chest**
> An ornate small wooden chest with brass corner reinforcements and a copper padlock, lid slightly ajar revealing colorful paper spice packets and a bag of saffron threads inside. Warm inner glow. Zellige-tile inlay on the front panel.

**6.5 — `assets/tile-spice-5-masala.png` — Grand Masala**
> An ornate golden filigreed ceremonial bowl overflowing with layered spice mounds — saffron, paprika, turmeric, sumac, cardamom pods — with a small floating cardamom crown, faint golden sparkles rising. Legendary tier feel, radiant warm glow.

### Grain chain (5)

**6.6 — `assets/tile-grain-1-wheat.png` — Wheat Grain**
> A small tied bundle of three golden wheat stalks with plump grain heads and delicate whiskers, warm sunlight catching each grain. Ribbon of natural twine at the base.

**6.7 — `assets/tile-grain-2-semolina.png` — Semolina**
> A small ivory ceramic bowl brimming with a rounded mound of fine pale-gold semolina flour, tiny scoop mark on top, a wooden spoon leaning against the bowl.

**6.8 — `assets/tile-grain-3-couscous.png` — Fresh Couscous**
> A small clay bowl mounded with fluffy fresh golden couscous grains, thin steam wisps rising, a sprig of fresh mint on top, tiny drizzle of olive oil glinting.

**6.9 — `assets/tile-grain-4-royal-couscous.png` — Royal Couscous**
> An ornate blue-and-white ceramic platter mounded with steaming golden couscous, topped with jewel-toned vegetables (orange carrots, green zucchini, red bell pepper, chickpeas) arranged in a decorative crown, a whole date and a mint sprig on top.

**6.10 — `assets/tile-grain-5-berber.png` — Berber Feast**
> A grand three-tier feast platter of couscous royale: bottom tier fluffy couscous, middle tier caramelized vegetables and dried apricots, top tier crowned with a small golden dome and a Berber-cross gold ornament. Sparkles and warm glow, legendary tier.

### Protein chain (5)

**6.11 — `assets/tile-meat-1-chicken.png` — Farm Chicken**
> A fresh plump farm-raised chicken, appetizing but stylized (not gory), skin pale gold, small sprig of rosemary tucked into its trussed legs, sitting on a small round chopping board.

**6.12 — `assets/tile-meat-2-kefta.png` — Kefta Skewer**
> A single wooden skewer of three round meatballs (kefta) seasoned with visible parsley and cumin flecks, glossy caramelized surface, a few pomegranate seeds sprinkled around.

**6.13 — `assets/tile-meat-3-merguez.png` — Merguez Sausage**
> A pair of curved bright-red merguez sausages, glossy and slightly charred, sprinkled with cumin and paprika, one halved to show the rustic spiced meat inside, a sprig of coriander alongside.

**6.14 — `assets/tile-meat-4-tagine-chicken.png` — Chicken Tagine**
> A traditional conical clay tagine pot in warm terracotta with a hand-painted turquoise band around the base, lid slightly lifted showing golden chicken, preserved lemon, green olives, and thin steam wisps curling up. Small brass knob on top of the cone.

**6.15 — `assets/tile-meat-5-lamb-tagine.png` — Grand Lamb Tagine**
> An ornate cobalt-blue-and-gold ceremonial tagine pot with intricate Berber patterns, cone-lid off to the side revealing slow-braised lamb shanks, jewel-toned prunes, toasted almonds, and saffron threads glistening in dark sauce. Golden crown floating above, sparkles, radiant warm glow. Legendary tier.

---

## 7 · UI icons & interactive elements

### 7.1 — Coin
- **File:** `assets/ui-coin.png` — 512×512, transparent
> A polished round gold coin embossed with a stylized cursive "B" surrounded by a ring of eight-pointed zellige stars, edge milled, slight patina in the recesses, warm rim light catching the top edge. Chunky mobile-game coin, appetizing shine, tiny gold sparkle. Front-facing.

### 7.2 — Spice Crate (closed)
- **File:** `assets/ui-crate-closed.png` — 1024×1024, transparent
> A weathered wooden treasure chest with rich walnut planks, copper strap reinforcements engraved with tiny arabesque patterns, a large brass padlock with an eight-pointed Moroccan star cutout, small colorful paper spice tags tied around the lock with twine. A saffron-yellow ribbon on top. Warm golden glow leaking from the seam. Isometric three-quarter view.

### 7.3 — Spice Crate (open, bursting)
- **File:** `assets/ui-crate-open.png` — 1024×1024, transparent
> Same treasure chest as closed version, now flung open with the lid tilted back. Colorful spice pouches, gold coins, a saffron thread bundle, and a cardamom sprig burst upward in a joyful spray. Bright warm light beam explodes upward from inside. Sparkles, small confetti stars.

### 7.4 — Recipe Book (grand tome)
- **File:** `assets/ui-recipe-book.png` — 1024×1024, transparent
> A thick ornate cookbook standing slightly open at a slight angle. Cover in rich burgundy leather with heavy gold-tooled arabesque border, embossed title "Kitab al-Matbakh" ("The Kitchen Book") in Arabic-styled Latin letters, gold clasp, silk bookmark ribbon in majorelle blue. Pages inside show tiny handwritten recipe sketches and a spice diagram.

### 7.5 — Sparkle / burst effect
- **File:** `assets/ui-sparkle-burst.png` — 1024×1024, transparent
> A radial burst of eight tapering golden light rays with a central four-point star and small floating sparkle particles around it. Warm saffron-and-gold gradient. Transparent background.

### 7.6 — Ornate lantern
- **File:** `assets/ui-lantern.png` — 800×1400, transparent
> An intricately pierced brass Moroccan lantern hanging from a short chain, hexagonal body with cutout arabesque patterns projecting a warm honey glow, small colored glass panels (amber, emerald, sapphire), decorative finial on top. Warm inner light spilling out.

### 7.7 — Order card ornament frame
- **File:** `assets/ui-order-frame.png` — 1200×400, transparent
> An ornate horizontal frame border for an order card. Warm cream parchment center panel bordered by intricate arabesque scrollwork ribbon in copper and majorelle blue, tiny zellige star medallions in the corners, small mint sprig decoration at the top center. Ready to overlay text on the parchment center.

### 7.8 — Primary button ornament
- **File:** `assets/ui-button-ornament.png` — 1200×300, transparent
> A pill-shaped button design in warm terracotta gradient with a burnished-gold border and small arabesque flourish caps on left and right ends, subtle inner glow, ready for overlay text. Central area kept flat and readable.

### 7.9 — Settings gear
- **File:** `assets/ui-gear.png` — 512×512, transparent
> An ornate brass gear icon shaped like an eight-pointed Moroccan zellige star with delicate cutout arabesque details in the center, warm copper highlights on the edges catching golden-hour light. Chunky mobile-game feel.

### 7.10 — Trophy (achievements)
- **File:** `assets/ui-trophy.png` — 512×512, transparent
> An ornate golden Moroccan-styled ceremonial trophy chalice with intricate filigree work, tapered stem, two curved handles shaped like small arches, gold "B" medallion at the front, gentle glow. Warm rim lighting.

---

## 8 · Decorative ornaments

### 8.1 — Arabesque divider (horizontal)
- **File:** `assets/ornament-divider.png` — 1600×200, transparent
> Elegant horizontal ornament: two symmetrical scrolling arabesque vines meeting at a central eight-pointed star medallion in copper and gold, flanked by tapering paisley flourishes. Delicate, refined, publication-quality linework. Transparent background.

### 8.2 — Moroccan arch frame
- **File:** `assets/ornament-arch-frame.png` — 1200×1600, transparent
> A tall keyhole-shaped Moroccan horseshoe arch outline with detailed muqarnas (stalactite) carving in the crown, columns with zellige tile inlay bases, warm cream stucco color with copper highlights. Interior kept transparent so game content can be framed inside.

### 8.3 — Steam wisps (transparent overlay)
- **File:** `assets/fx-steam.png` — 800×1200, transparent
> A soft translucent column of curling steam rising and dispersing at the top, painted with subtle warm-cream and pale-gold highlights suggesting golden-hour light through vapor. Semi-transparent, ready to composite over dishes.

### 8.4 — Palm frond corner decoration
- **File:** `assets/ornament-palm-fronds.png` — 1200×1200, transparent
> Cluster of three date-palm fronds arching gracefully from a bottom corner, deep emerald and teal fronds with warm golden-hour rim light on the top edges, small cluster of orange dates at the base. Ready to place in a page corner.

### 8.5 — Confetti particles (sheet)
- **File:** `assets/fx-confetti-sheet.png` — 2048×2048, transparent
> A sprite sheet of 24 small confetti shapes in warm sunset and jewel-tone colors: rectangles, spirals, spice grains, and tiny eight-point stars. Each shape is roughly 128×128 with margin between them, laid out in a 4×6 grid. Bright, punchy, drop-shadowed. Ready to slice into individual assets.

---

## Once you have the PNGs

Drop them into `assets/` and ping me. The code is set up so replacing an SVG `<use>` with an `<img>` is a one-line swap per icon, and each CSS gradient background can accept a `background-image: url('assets/…')` override without any other changes. The splash screen background is a single `background:` property on `.splash` in `styles.css` — same swap.
