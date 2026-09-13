# Durai Systems — Phase 1

## Goal
Build a new cinematic portfolio entry experience that immediately establishes Durai B as a backend, cloud, and IoT engineer, while staying fast, accessible, factual, and recruiter-friendly.

## Build
- Establish a dark cinematic design system with steel surfaces, restrained cyan-blue indicators, geometric display type, readable body type, and monospace system labels.
- Create a short, skippable system-initialization sequence that remembers completion for the current browser session and simplifies itself for reduced motion.
- Build the landing environment with Durai's identity, roles, positioning, clear actions, system-status details, and a responsive navigation layer.
- Add a lazy-loaded, isolated procedural 3D engineering environment for capable desktop devices, with a polished CSS-based fallback for mobile, reduced motion, WebGL failure, and slow devices.
- Build the initial command center with five interactive system nodes and restrained placeholders for later-phase destinations.
- Add a prepared resume destination without inventing a resume file, plus lightweight placeholder routes for the five future systems.
- Add keyboard/focus support, minimum touch targets, semantic structure, responsive layouts, reduced-motion handling, and route-specific metadata.
- Verify the result in desktop and mobile viewports, including boot skip, navigation, command-center interaction, fallback rendering, and clean runtime/build signals.

## Technical approach
- Keep TanStack Start, React 19, TypeScript, and Tailwind v4 because they are the supported project foundation; use TanStack route files instead of unsupported Next.js files.
- Use React Three Fiber, Drei, Three.js, Motion, and GSAP only where they add value; load the 3D scene in the browser and cap rendering cost.
- Use procedural abstract server/cloud/IoT geometry rather than external models, since the environment is conceptual and no real-world hero object is required.
- Keep page text and controls in accessible HTML above the visual layer; the 3D scene remains decorative and non-blocking.
