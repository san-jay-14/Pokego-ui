# Build a Production-Quality Pokémon Explorer From Scratch

You are acting as a **senior frontend engineer, product designer, and UI/UX engineer**.

I am starting from an **empty repository**.

I have provided a frontend assignment specification for a **Pokémon Explorer**. Treat that assignment as the source of truth for the required functionality and deliverables.

Your responsibility is to **bootstrap the entire project from scratch and build the complete application**, not just provide instructions or example code.

The final application should feel like a real-world product rather than a basic API demo.

---

# 1. FIRST: UNDERSTAND THE ASSIGNMENT

Before writing code, carefully analyze the provided assignment.

The core requirements are:

- Pokémon listing
- Pokémon cards
- Pokémon search
- Load More pagination
- Pokémon details
- Type filtering
- Responsive design
- Loading states
- Error handling
- Empty states
- Type-based visual styling
- Smooth, subtle animations
- Good component architecture
- TypeScript
- Clean API integration

The assignment also provides optional bonus features:

- Favorites
- Dark mode
- Sorting
- Pokémon comparison
- Keyboard accessibility
- URL-based Pokémon pages

The evaluation prioritizes:

1. UI / Visual Design — 25%
2. API Integration — 20%
3. Functionality — 20%
4. Responsive Design — 15%
5. Code Quality — 10%
6. Loading / Error / Empty States — 5%
7. Extra Features — 5%

Therefore, prioritize **quality of the core experience before bonus features**.

---

# 2. BOOTSTRAP THE PROJECT

Because the repository is completely empty, start by creating the project.

Use:

- React
- TypeScript
- Vite
- Tailwind CSS
- Lucide React

Use the latest stable versions compatible with each other.

Before installing anything, check the environment and available Node/npm versions.

Create a clean modern frontend project.

The final project should be runnable with:

npm install
npm run dev

and build successfully with:

npm run build

Do not use Next.js unless there is a strong reason to change the stack. The assignment prefers React + TypeScript, and this project should remain a focused frontend application.

---

# 3. INITIAL PROJECT STRUCTURE

Create a clean structure similar to:

src/
├── components/
│   ├── layout/
│   ├── pokemon/
│   ├── search/
│   ├── filters/
│   ├── states/
│   └── ui/
│
├── pages/
│   ├── Home.tsx
│   └── PokemonDetails.tsx
│
├── services/
│   └── pokemonApi.ts
│
├── hooks/
│   ├── usePokemon.ts
│   ├── usePokemonSearch.ts
│   └── useFavorites.ts
│
├── types/
│   └── pokemon.ts
│
├── constants/
│   └── pokemonTypes.ts
│
├── utils/
│
├── App.tsx
├── main.tsx
└── index.css

You do not need to follow this structure literally.

Use the architecture that makes the most sense as the project develops.

Avoid creating folders merely for the sake of having folders.

---

# 4. ROUTING

Use React Router.

Create at minimum:

/
    
/pokemon/:name

The Pokémon detail route must be directly shareable.

For example:

/pokemon/pikachu

Opening that URL directly should correctly load Pikachu.

Handle invalid Pokémon routes gracefully.

---

# 5. API

Use the PokéAPI.

Base URL:

https://pokeapi.co/api/v2/

No API key is required.

Relevant endpoints:

GET /pokemon?limit=20&offset=0

GET /pokemon/{name}

GET /pokemon/{id}

GET /type/{type}

Create a dedicated API/service layer.

Do not scatter fetch calls throughout UI components.

For example:

services/pokemonApi.ts

Create proper TypeScript interfaces/types for the API responses.

The API layer should handle:

- successful responses
- HTTP failures
- network failures
- malformed responses
- missing Pokémon
- unexpected API data

Do not assume requests will always succeed.

---

# 6. DATA FETCHING ARCHITECTURE

Use a sensible data-fetching approach.

If React Query / TanStack Query is useful, you may use it.

If you introduce TanStack Query, use it consistently rather than mixing multiple data-fetching approaches.

The application should avoid:

- duplicate requests
- unnecessary refetching
- request waterfalls
- fetching every Pokémon on startup
- unnecessary useEffect-driven fetching

Cache data where appropriate.

Keep the implementation understandable.

Do not over-engineer a small assignment.

---

# 7. PRODUCT / VISUAL DIRECTION

This is NOT supposed to look like:

- a tutorial project
- a generic dashboard
- an AI-generated SaaS template
- a grid of boring white cards

The assignment explicitly emphasizes visual design.

Create a distinctive Pokémon Explorer experience.

The visual direction should feel:

- modern
- playful
- premium
- polished
- energetic
- clean
- approachable

Use strong visual hierarchy.

Use intentional:

- typography
- spacing
- card proportions
- borders
- shadows
- backgrounds
- iconography
- color
- animation

Create a coherent design system rather than styling every component independently.

---

# 8. USE THE FRONTEND SKILLS

If the following Claude Code skills are installed, use them appropriately:

- frontend-design
- ui-ux-pro-max
- react-best-practices
- composition-patterns
- web-design-guidelines

Use them for their intended purposes.

### frontend-design

Use for:

- overall visual direction
- layout
- typography
- visual hierarchy
- aesthetics
- animations
- product feel

### ui-ux-pro-max

Use for:

- design system decisions
- color systems
- typography pairing
- UX patterns
- product-specific UI decisions

### react-best-practices

Use for:

- React architecture
- rendering
- performance
- data fetching
- component behavior

### composition-patterns

Use for:

- reusable component architecture
- compound components
- avoiding prop explosion
- clean React composition

### web-design-guidelines

Use for:

- accessibility
- responsive behavior
- interaction states
- UX review
- final UI audit

Do not blindly apply every skill.

Use the appropriate skill when the task requires it.

---

# 9. DESIGN SYSTEM

Create centralized design tokens.

Define consistent values for:

- page background
- surface
- elevated surface
- text
- muted text
- border
- primary accent
- success
- error
- warning
- type colors
- spacing
- radii
- shadows
- transitions

Do not scatter arbitrary values throughout components.

Use the design system consistently.

---

# 10. POKÉMON TYPE COLORS

Create a centralized Pokémon type configuration.

At minimum support:

- Fire
- Water
- Grass
- Electric
- Psychic
- Ghost
- Ice
- Dragon
- Dark
- Fairy

Preferably support all Pokémon types returned by the API.

Each type should have:

- primary color
- background/tint
- text treatment
- optional gradient/accent

Cards and detail pages should visually respond to Pokémon types.

Do not hardcode type colors in individual components.

---

# 11. HOMEPAGE

Create a polished homepage.

The page should have:

### Header / Hero

Include:

- Pokémon Explorer branding
- short supporting description
- search
- filtering controls

The hero should immediately communicate what the application does.

Do not waste excessive vertical space.

---

# 12. POKÉMON GRID

Display Pokémon in a beautiful responsive card grid.

Initial API request:

limit=20

Each card must contain:

- Pokémon image
- Pokémon name
- Pokémon ID
- Pokémon type(s)

Cards should have:

- type-based visual styling
- strong hierarchy
- subtle elevation
- rounded corners
- polished hover state
- clear click affordance
- responsive sizing

Use high-quality Pokémon artwork from the API.

Handle image loading gracefully.

---

# 13. SEARCH

Create a prominent search bar.

Placeholder:

Search Pokémon...

When a user searches:

- query the PokéAPI
- display the Pokémon
- show loading state
- handle invalid Pokémon
- handle API/network errors

Search should feel polished.

Consider:

- search icon
- clear button
- keyboard support
- Enter to submit
- loading indicator
- sensible debounce if useful

Do not make search unnecessarily complicated.

---

# 14. TYPE FILTER

Create a type filtering interface.

At minimum:

All
Fire
Water
Grass
Electric
Psychic
Dragon
Ghost

Include other types as appropriate.

Selecting a type should update the displayed Pokémon.

The filter must work properly on:

- desktop
- tablet
- mobile

Do not create a filter UI that becomes unusable on mobile.

Use a responsive approach such as:

desktop:
horizontal filter controls

mobile:
compact dropdown / horizontally scrollable control / bottom sheet

Choose whichever provides the best UX.

---

# 15. LOAD MORE

Do not load every Pokémon at once.

Use the assignment's preferred:

Load More

Initial:

limit=20
offset=0

When the user clicks Load More:

fetch the next 20 Pokémon

append them to the existing list.

Do not replace the existing list.

Handle:

- loading state
- disabled button while loading
- API failure
- retry
- end of available results

Prevent duplicate requests.

---

# 16. DETAILS PAGE

Clicking a Pokémon card should navigate to:

/pokemon/:name

The detail page should include:

- large Pokémon image
- Pokémon name
- ID
- types
- height
- weight
- abilities
- base statistics
- basic move information

Create a strong visual composition.

Do not simply display a vertical list of API fields.

Use sections/cards appropriately.

For example:

Overview
Stats
Abilities
Moves

---

# 17. STATISTICS

Display:

HP
Attack
Defense
Special Attack
Special Defense
Speed

Use visual stat bars.

Example:

HP
██████████████░░░
70

The bars should be:

- animated subtly
- accessible
- visually consistent
- responsive

Avoid excessive animation.

---

# 18. LOADING STATES

Never leave the application blank while fetching.

Do NOT rely on:

"Loading..."

Use polished skeleton states.

Create reusable skeleton components for:

- Pokémon cards
- detail page
- stats
- images
- text

Use subtle shimmer animation.

Respect reduced-motion preferences.

---

# 19. ERROR STATES

Create reusable error components.

Handle:

### API failure

Something went wrong.
We couldn't load the Pokémon.

[Try Again]

### Pokémon not found

Pokémon not found.
Try searching for another Pokémon.

### Network failure

Explain the problem clearly.

### Unexpected API response

Fail gracefully.

Never allow an API failure to crash the UI.

---

# 20. EMPTY STATES

When a search/filter produces no results:

Show a polished empty state.

For example:

🔍

No Pokémon found.

Try searching for a different Pokémon.

Use appropriate iconography and spacing.

---

# 21. RESPONSIVE DESIGN

Design intentionally for:

### Mobile

375px
390px
430px

### Tablet

768px
1024px

### Desktop

1280px
1440px
1920px

Do not simply shrink the desktop layout.

Pay particular attention to:

- navigation
- search
- filter controls
- card grid
- detail page
- stat bars
- buttons
- spacing
- typography
- image sizing

There must be no horizontal overflow.

Touch targets should be appropriately sized.

---

# 22. ANIMATION

Use subtle animation.

Include:

- card hover
- button hover
- button press
- skeleton shimmer
- page transitions
- detail transitions
- filter transitions where appropriate

Do not overuse animations.

The interface should still feel fast.

Respect:

prefers-reduced-motion

---

# 23. ACCESSIBILITY

Treat accessibility as a core feature.

Support:

- keyboard navigation
- Tab
- Enter
- Escape
- visible focus states
- semantic HTML
- accessible labels
- appropriate ARIA
- sufficient contrast
- keyboard-accessible cards
- keyboard-accessible dialogs if used

Do not use clickable divs when buttons or links are appropriate.

Images need meaningful alt text.

---

# 24. BONUS FEATURES

Once all core requirements are complete and polished, implement the bonus features.

Implement in this order:

## 1. Favorites

Users can favorite Pokémon.

Persist favorites using localStorage.

## 2. Dark Mode

Support:

Light
Dark

Persist the preference.

Design both themes intentionally.

Do not simply invert the colors.

## 3. Sorting

Allow sorting by:

- ID
- Name
- Attack
- Speed
- HP

## 4. Compare

Allow users to select two Pokémon.

Compare:

- HP
- Attack
- Defense
- Speed
- other useful stats

Create a polished comparison experience.

## 5. URL-Based Search / Navigation

Ensure:

/pokemon/pikachu

works directly and is shareable.

---

# 25. PERFORMANCE

Apply sensible frontend performance practices.

Optimize:

- API calls
- caching
- image loading
- rerenders
- list rendering
- bundle size
- state updates

Avoid premature optimization.

Do not introduce complex infrastructure for problems that don't exist.

---

# 26. COMPONENT ARCHITECTURE

Use focused reusable components.

Potential structure:

components/
  layout/
    Header.tsx
    PageContainer.tsx

  pokemon/
    PokemonCard.tsx
    PokemonGrid.tsx
    PokemonStats.tsx
    PokemonTypeBadge.tsx
    PokemonDetails.tsx
    PokemonMoves.tsx

  search/
    SearchBar.tsx

  filters/
    TypeFilter.tsx
    SortControl.tsx

  states/
    PokemonCardSkeleton.tsx
    DetailsSkeleton.tsx
    ErrorState.tsx
    EmptyState.tsx

  favorites/
    FavoriteButton.tsx

Do not create giant components.

Avoid:

- excessive prop drilling
- boolean-prop explosions
- duplicated logic
- duplicated styles
- duplicated API calls

Use composition where appropriate.

---

# 27. TYPESCRIPT

Use TypeScript properly.

Create types for:

- Pokémon list response
- Pokémon details
- Pokémon stats
- Pokémon abilities
- Pokémon types
- Pokémon moves
- API errors
- application state where appropriate

Avoid:

any

unless there is a genuinely justified reason.

Do not create unnecessarily complex generic types.

---

# 28. STATE MANAGEMENT

Keep state as local as possible.

Use global state only when genuinely needed.

Likely state includes:

- loaded Pokémon
- loading
- error
- search
- selected type
- sorting
- favorites
- dark mode
- compare selection

Do not introduce Redux unless there is a real need.

---

# 29. README

Create a professional README.

Include:

# Pokémon Explorer

## Features

## Tech Stack

## API Used

## Installation

## Running Locally

## Project Structure

## Challenges Faced

## Future Improvements

## Screenshots

## Live Demo

Leave appropriate placeholders for:

- deployed URL
- screenshots

---

# 30. GIT

Initialize Git if it is not already initialized.

Create a sensible .gitignore.

Make clean commits where appropriate.

Do not commit:

- node_modules
- secrets
- build output
- unnecessary local files

There are no API secrets required for PokéAPI.

---

# 31. VALIDATION

Do not consider the project finished just because it compiles.

After implementation:

1. Run npm install.
2. Run npm run build.
3. Run npm run dev.
4. Open the application.
5. Test homepage.
6. Test Pokémon listing.
7. Test search.
8. Test invalid search.
9. Test filtering.
10. Test Load More.
11. Test Pokémon details.
12. Test invalid detail URL.
13. Test loading states.
14. Test API error states.
15. Test empty states.
16. Test favorites.
17. Test dark mode.
18. Test sorting.
19. Test compare.
20. Test keyboard navigation.
21. Test mobile layout.
22. Test tablet layout.
23. Test desktop layout.

If browser automation or browser inspection tools are available, use them.

Fix issues you discover.

Do not simply report them.

---

# 32. FINAL VISUAL REVIEW

After functionality is complete, stop thinking like the developer.

Think like a design reviewer evaluating a frontend assignment.

Review:

### Visual quality

Does this look professionally designed?

Does it have a distinctive identity?

Does it look like a real product?

Is the typography good?

Is spacing consistent?

Are colors intentional?

Are cards polished?

### UX

Are interactions obvious?

Are loading states polished?

Are errors helpful?

Are empty states useful?

Are buttons and controls intuitive?

### Responsive

Does mobile feel intentionally designed?

Does tablet feel intentional?

Is desktop visually balanced?

### Accessibility

Can everything important be used with keyboard?

Are focus states visible?

Are contrast ratios reasonable?

### Engineering

Are components reusable?

Is the API layer clean?

Is TypeScript used correctly?

Are there unnecessary effects?

Are there unnecessary rerenders?

Is there duplicated logic?

Fix every issue you find.

Then perform another review.

---

# 33. IMPORTANT PRIORITY ORDER

When deciding what to work on, use this priority:

1. Core functionality
2. Visual design
3. Responsive UX
4. Loading/error/empty states
5. Accessibility
6. Code quality
7. Performance
8. Bonus features
9. README/documentation

Do NOT sacrifice the core experience to implement more bonus features.

A beautifully polished core application is more valuable than a feature-heavy unfinished application.

---

# 34. WORKING STYLE

You are responsible for making sensible implementation decisions.

Do not ask me for permission for every small decision.

Do not repeatedly stop and ask:

"Should I use X or Y?"

Choose the best solution based on the assignment.

Only ask me if a decision would fundamentally change the project direction.

Do not give me a tutorial instead of building the application.

Actually create the files, install dependencies, write the code, run the project, test it, and fix problems.

Do not declare success until the application has been built and validated.

---

# 35. START NOW

Begin by:

1. Inspecting the empty repository.
2. Checking the installed Node/npm versions.
3. Bootstrapping the React + TypeScript + Vite project.
4. Installing and configuring Tailwind CSS and Lucide.
5. Installing any additional dependency you genuinely need.
6. Creating the initial architecture.
7. Creating the design system.
8. Implementing the core application.
9. Running and validating it.
10. Iterating on the UI until it looks production-quality.

Start with the foundation and work systematically.

**Do not merely describe what you would build. Build it.**