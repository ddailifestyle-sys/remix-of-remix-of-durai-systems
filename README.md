# Remix of Remix of Durai Systems

You are an expert frontend engineer, UI/UX designer, creative developer, and interactive experience designer.

You are going to build a completely NEW personal portfolio website for:

DURAI B

Professional Title:
BACKEND ENGINEER | CLOUD DEVELOPER | IoT SYSTEMS ENGINEER

Professional Positioning:
Building scalable backend systems, cloud-native applications, and intelligent IoT solutions.

IMPORTANT:
This is a completely new website.

The existing website is:
https://durai.web.app

Do NOT copy its layout, design, animations, structure, colors, or visual style.

Use the existing website only as a reference that this is a portfolio website.

The new website must feel completely different.

============================================================
PROJECT VISION
============================================================

Create a premium, cinematic, futuristic, interactive portfolio website that combines:

1. AAA game-style visual presentation
2. Ultra-realistic futuristic engineering environment
3. Modern developer portfolio
4. Sci-fi command-center interface
5. Interactive digital laboratory
6. Professional recruiter-friendly UX

The website should make visitors feel like they are entering:

"DURAI'S ENGINEERING SYSTEM"

rather than opening a traditional portfolio.

The website should feel like:

ENGINEERING + TECHNOLOGY + GAMING + CINEMATIC EXPERIENCE

However, it must remain professional.

The website should NOT look like:

- a generic developer portfolio
- a gaming landing page
- a cyberpunk template
- a neon-heavy website
- a basic glassmorphism template
- a simple scrolling portfolio
- a template generated from a UI kit

The visual quality should feel custom-designed.

============================================================
PHASE 1 SCOPE
============================================================

THIS PHASE ONLY BUILDS:

- project foundation
- application architecture
- design system
- global layout
- loading experience
- cinematic intro
- main landing screen
- initial command-center environment
- global navigation foundation
- responsive foundation
- accessibility foundation
- performance foundation

DO NOT fully build:

- project details
- skill tree
- experience timeline
- achievement section
- certifications
- education section
- AI terminal
- detailed resume page

Those will be built in later phases.

Create placeholders/routes/components for future sections where necessary, but do not spend time implementing their complete UI yet.

============================================================
TECHNOLOGY STACK
============================================================

Use:

- Next.js
- React
- TypeScript
- Tailwind CSS

For animation:

- GSAP
- Framer Motion

For 3D/interactive environments:

- Three.js
- React Three Fiber
- @react-three/drei

Use 3D only where it genuinely improves the experience.

Do not make the entire website dependent on heavy 3D rendering.

Use dynamic imports and lazy loading for heavy components.

Use a clean, scalable component architecture.

============================================================
PROJECT ARCHITECTURE
============================================================

Create a professional folder structure.

Suggested structure:

app/
  page.tsx
  layout.tsx
  globals.css

components/
  layout/
  navigation/
  hero/
  boot/
  command-center/
  ui/
  effects/

lib/
  constants/
  utils/
  animations/

public/
  images/
  models/
  textures/
  icons/

Do not create one giant page.tsx file.

Break the interface into reusable components.

Use TypeScript interfaces/types wherever appropriate.

Keep components maintainable.

============================================================
DESIGN PHILOSOPHY
============================================================

The website should look like a futuristic engineering facility.

Imagine:

A dark high-tech command center at night.

Inside the environment:

- large digital displays
- metallic surfaces
- subtle reflections
- engineering equipment
- abstract server structures
- IoT nodes
- holographic interfaces
- data panels
- subtle atmospheric fog
- floating particles
- thin technical lines
- restrained lighting

The environment should feel realistic and premium.

Do NOT create a cartoon environment.

Do NOT create a bright colorful gaming environment.

Do NOT cover everything with glowing cyan borders.

Use futuristic lighting carefully.

============================================================
COLOR SYSTEM
============================================================

Use a dark cinematic base.

Primary:

Near-black
Deep charcoal
Very dark navy

Secondary:

Dark blue
Cool gray
Steel

Accent:

Use a restrained futuristic blue/cyan accent.

Accent colors should be used mainly for:

- active states
- system indicators
- important buttons
- selected elements
- subtle illumination
- technical data

The majority of the interface should remain dark and neutral.

Avoid rainbow gradients.

Avoid excessive neon.

============================================================
TYPOGRAPHY
============================================================

Use a premium modern typography system.

Headings:

Bold, futuristic, geometric, clean.

Body:

Highly readable modern sans-serif.

Technical/system text:

Monospace font.

Use monospace for:

- system labels
- coordinates
- status indicators
- technical metadata
- terminal-style elements
- small HUD labels

Do not use monospace for large paragraphs.

Typography must remain readable on mobile.

============================================================
GLOBAL VISUAL LANGUAGE
============================================================

Use:

- subtle grid patterns
- technical lines
- small system labels
- thin separators
- minimal HUD elements
- subtle scan effects
- restrained glow
- depth
- shadows
- reflections
- atmospheric effects

The interface should have depth.

Avoid excessive cards.

Avoid excessive rounded rectangles.

Use a mixture of:

- panels
- floating interfaces
- environmental objects
- HUD overlays
- typography
- interactive elements

============================================================
INITIAL LOADING EXPERIENCE
============================================================

When the visitor first opens the website, create a cinematic system initialization sequence.

The experience should be short.

Target approximately 2–4 seconds.

Do not create a long loading animation.

Example sequence:

--------------------------------------------------

DURAI SYSTEMS

INITIALIZING CORE SYSTEM...

BACKEND CORE ........ ONLINE
CLOUD CORE .......... ONLINE
IoT CORE ............ ONLINE
DATABASE CORE ....... ONLINE
NETWORK ............. ONLINE

SYSTEM CHECK ........ COMPLETE

ENGINEER PROFILE FOUND

DURAI B

--------------------------------------------------

Use animated progress indicators.

Use subtle sound-like visual feedback without actually playing sound automatically.

The animation should feel like a high-end system boot.

After completion:

Transition smoothly into the landing environment.

============================================================
SKIP LOADING
============================================================

Provide a discreet:

SKIP

control.

If the user clicks it:

Immediately transition to the main page.

Do not force visitors to watch the animation every time.

Store a session/local preference if appropriate so returning visitors can have a faster experience.

============================================================
REDUCED MOTION
============================================================

Respect:

prefers-reduced-motion

If reduced motion is enabled:

- remove complex camera movement
- reduce particles
- reduce transitions
- skip unnecessary animations
- keep the interface fully usable

============================================================
MAIN LANDING ENVIRONMENT
============================================================

After the boot sequence, display the main hero environment.

The first screen should be visually powerful.

The visitor should immediately understand:

WHO THIS IS
WHAT HE DOES
WHAT THE WEBSITE IS

============================================================
HERO CONTENT
============================================================

Main name:

DURAI B

Primary title:

BACKEND ENGINEER

Secondary titles:

CLOUD DEVELOPER
IoT SYSTEMS ENGINEER

Professional positioning:

Building scalable backend systems, cloud-native applications, and intelligent IoT solutions.

Do not add fake professional claims.

Do not add fake statistics.

Do not add fake company logos.

Do not add fake client names.

============================================================
HERO COMPOSITION
============================================================

Create a cinematic composition.

Suggested structure:

LEFT / CENTER:

DURAI B

BACKEND ENGINEER
CLOUD DEVELOPER
IoT SYSTEMS ENGINEER

Professional statement

Actions

RIGHT / BACKGROUND:

A futuristic engineering environment.

Possible visual elements:

- server structures
- abstract IoT devices
- floating data panels
- holographic engineering interface
- subtle digital grid
- atmospheric lighting
- rotating technical object

The right side should visually communicate:

BACKEND
CLOUD
IoT

without using generic stock illustrations.

============================================================
SYSTEM STATUS HUD
============================================================

Add a subtle system HUD.

Example:

SYSTEM STATUS
● ONLINE

ENGINEERING CORE
ACTIVE

NETWORK
CONNECTED

LOCATION
TAMIL NADU, INDIA

Do not make these look like actual live infrastructure metrics.

They are visual portfolio elements.

============================================================
PRIMARY BUTTON
============================================================

Create a prominent primary CTA:

ENTER SYSTEM

When clicked:

Transition into the future Command Center section.

For Phase 1, this can scroll/transition to the initial command-center area.

The transition should feel cinematic.

Example:

- slight camera movement
- environment zoom
- panel transition
- section reveal

Do not make it slow.

============================================================
SECONDARY BUTTON
============================================================

Create:

VIEW RESUME

For Phase 1:

Make it a functional button/link prepared for the resume.

If the actual resume file is available in the project, connect it.

Otherwise create the proper route/link architecture without inventing a file.

============================================================
COMMAND CENTER
============================================================

Below the initial hero, create the beginning of the future COMMAND CENTER.

This is NOT the complete portfolio yet.

It is the foundation for future phases.

Display a futuristic control room/interface containing system nodes.

Create approximately five major navigation systems:

01
PROFILE

02
SKILLS

03
PROJECTS

04
EXPERIENCE

05
ACHIEVEMENTS

Additional future systems can be represented subtly:

EDUCATION
CERTIFICATIONS
RESUME
CONTACT

These systems will be fully implemented in later phases.

============================================================
COMMAND CENTER VISUALIZATION
============================================================

The command center should feel like a physical/digital environment.

Possible layout:

                    DURAI SYSTEM
                         |
        -------------------------------------
        |          |          |              |
      PROFILE    SKILLS    PROJECTS     EXPERIENCE
                                     
                         |
                   ACHIEVEMENTS

Do not literally use this ASCII layout in the website.

Use it only as conceptual direction.

Create visually interesting spatial relationships.

============================================================
INTERACTION
============================================================

When the user hovers over a command-center system:

- subtle illumination
- small scale change
- surrounding lines activate
- status information appears
- cursor interaction occurs
- environment responds subtly

When clicked:

For Phase 1, navigate/scroll to the appropriate placeholder section.

Do not implement detailed sections yet.

============================================================
NAVIGATION
============================================================

Create a global navigation system.

Desktop navigation should contain:

DURAI

PROFILE
SKILLS
PROJECTS
EXPERIENCE
ACHIEVEMENTS

RESUME

Keep it minimal.

Do not use a large traditional navbar.

The navigation should feel integrated into the futuristic environment.

============================================================
SYSTEM INDICATOR
============================================================

Include a small persistent system indicator.

Example:

● SYSTEM ONLINE

or

DURAI SYSTEMS
ONLINE

It should be subtle.

============================================================
SCROLL EXPERIENCE
============================================================

Use smooth scrolling.

Scrolling should feel cinematic but not slow.

Use:

- subtle parallax
- section transitions
- depth movement
- environmental motion

Do NOT create excessive scroll-jacking.

The user must always feel in control.

Normal mouse wheel and touch scrolling must work correctly.

============================================================
CURSOR EXPERIENCE
============================================================

On desktop, optionally create a subtle custom cursor.

It can respond to:

- interactive elements
- command-center objects
- buttons

Do not make the cursor difficult to see.

Do not use a giant distracting cursor.

On mobile:

Disable custom cursor completely.

============================================================
BACKGROUND ENVIRONMENT
============================================================

Create a dynamic background.

Possible effects:

- very subtle particles
- atmospheric fog
- grid
- distant lights
- depth layers
- slow-moving abstract objects

Movement should be slow.

The background must never distract from text.

============================================================
3D IMPLEMENTATION
============================================================

If using Three.js:

Create a reusable:

<EngineeringEnvironment />

component.

Keep 3D isolated from normal UI.

Use:

- React Three Fiber
- Drei
- optimized geometry
- low polygon count where possible
- instancing where useful
- lazy loading

Do not import huge 3D assets unnecessarily.

If no suitable model exists:

Create the environment using procedural/simple geometry rather than fake-looking low-quality models.

============================================================
WEBGL FALLBACK
============================================================

This is extremely important.

If:

- WebGL is unavailable
- device performance is poor
- 3D fails to load

the website must automatically switch to a beautiful 2D visual environment.

The user must still receive the complete portfolio experience.

Never show:

"Your browser does not support WebGL"

as the primary experience.

Instead provide a polished fallback.

============================================================
RESPONSIVE DESIGN
============================================================

The website must work on:

- large desktop
- standard desktop
- laptop
- tablet
- mobile

Do NOT simply shrink desktop.

============================================================
DESKTOP EXPERIENCE
============================================================

Desktop:

- immersive environment
- 3D where appropriate
- cinematic hero
- HUD elements
- spatial command center
- richer animations

============================================================
TABLET EXPERIENCE
============================================================

Tablet:

- reduce environmental complexity
- maintain visual depth
- simplify navigation
- optimize touch interactions

============================================================
MOBILE EXPERIENCE
============================================================

Mobile is extremely important.

Do NOT attempt to place a huge 3D scene behind everything.

Instead create a focused mobile composition.

Mobile hero:

DURAI B

BACKEND ENGINEER
CLOUD DEVELOPER
IoT SYSTEMS ENGINEER

Short description

[ ENTER SYSTEM ]

[ VIEW RESUME ]

Then show a vertical system interface.

Example:

PROFILE
↓

SKILLS
↓

PROJECTS
↓

EXPERIENCE
↓

ACHIEVEMENTS

Use touch-friendly controls.

Minimum comfortable touch target:

approximately 44px.

============================================================
ACCESSIBILITY
============================================================

Use semantic HTML.

Buttons must be actual buttons.

Links must be actual links.

Provide:

- keyboard navigation
- focus states
- readable contrast
- aria-labels where needed
- accessible navigation
- reduced-motion support

Never make a UI element accessible only through hover.

============================================================
PERFORMANCE
============================================================

Performance is a major requirement.

Implement:

- lazy loading
- dynamic imports
- optimized images
- optimized fonts
- compressed assets
- minimal unnecessary dependencies
- code splitting
- lazy 3D
- responsive rendering

Avoid:

- massive background videos
- unnecessarily huge textures
- enormous GLTF models
- unnecessary animation loops
- excessive particle counts

The website must feel fast.

============================================================
SEO FOUNDATION
============================================================

Set the basic metadata.

Title:

Durai B — Backend Engineer | Cloud Developer | IoT Systems Engineer

Description:

Portfolio of Durai B, a Backend Engineer, Cloud Developer and IoT Systems Engineer building scalable backend systems, cloud-native applications, and intelligent IoT solutions.

Add:

- favicon configuration
- Open Graph metadata foundation
- viewport configuration
- semantic page structure

============================================================
CONTENT RULES
============================================================

Use only information provided in the resume/project data.

Do NOT invent:

- companies
- clients
- awards
- projects
- technologies
- job titles
- years of experience
- statistics
- users
- revenue
- proficiency percentages
- fake testimonials

The visual world can be futuristic.

The professional information must remain factual.

============================================================
NO GENERIC PLACEHOLDERS
============================================================

Do not use:

"Lorem ipsum"

"Your Name"

"John Doe"

"Software Developer"

"Project Title"

or generic placeholder text.

Use Durai's actual information where Phase 1 requires content.

============================================================
CODE QUALITY
============================================================

Write production-quality code.

Requirements:

- TypeScript
- reusable components
- clean naming
- no unnecessary duplication
- no giant components
- no hardcoded repeated styles
- reusable animation utilities
- clean responsive breakpoints
- clear comments only where useful

Do not add unnecessary libraries.

============================================================
ERROR HANDLING
============================================================

Handle:

- loading state
- animation initialization
- 3D loading
- WebGL failure
- missing assets
- responsive rendering issues

Do not allow one failed visual effect to break the entire website.

============================================================
BROWSER SUPPORT
============================================================

The core website should work in modern:

- Chrome
- Edge
- Firefox
- Safari

The 3D layer can gracefully degrade when necessary.

============================================================
PHASE 1 DELIVERABLES
============================================================

At the end of this phase, the application must contain:

1. Complete project architecture
2. Global design system
3. Global typography
4. Global color system
5. Responsive layout system
6. Cinematic boot screen
7. Skip loading functionality
8. Reduced-motion support
9. Main hero
10. DURAI B identity
11. Professional title
12. Professional positioning
13. Enter System CTA
14. View Resume CTA
15. Initial Command Center
16. System navigation
17. Interactive command-center nodes
18. Responsive mobile version
19. WebGL fallback
20. Performance optimization foundation
21. Accessibility foundation
22. SEO foundation

============================================================
DO NOT IMPLEMENT YET
============================================================

Do NOT fully implement:

- detailed project pages
- detailed project case studies
- complete skill tree
- experience timeline
- achievement gallery
- certification archive
- education section
- AI terminal
- recruiter mode
- advanced contact system

These belong to later phases.

============================================================
FINAL DESIGN TEST
============================================================

Before finishing Phase 1, ask yourself:

Does this look like a normal portfolio?

If YES:
REDESIGN IT.

Does it look like a generic gaming website?

If YES:
REDESIGN IT.

Does it look like a cyberpunk template?

If YES:
REDESIGN IT.

Does it feel premium, cinematic, technical and professional?

If NO:
REDESIGN IT.

Can a recruiter immediately understand who Durai is?

If NO:
IMPROVE THE INFORMATION HIERARCHY.

Does it work beautifully on mobile?

If NO:
FIX IT.

Does the website remain usable if 3D fails?

If NO:
FIX IT.

============================================================
FINAL OBJECTIVE
============================================================

The final Phase 1 result should feel like:

A PREMIUM DIGITAL ENGINEERING FACILITY

that happens to be a personal portfolio.

The first impression should communicate:

DURAI B

BACKEND ENGINEER
CLOUD DEVELOPER
IoT SYSTEMS ENGINEER

while creating curiosity that makes the visitor want to press:

ENTER SYSTEM

Build Phase 1 completely and professionally.

Do not move into Phase 2 until Phase 1 is stable, responsive, polished and error-free.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7880ab2f-719b-43ec-aa64-40e1bb60db3a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
