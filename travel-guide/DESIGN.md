---
name: Luxury Travel App Design System
colors:
  surface: '#fcf8f8'
  surface-dim: '#ddd9d9'
  surface-bright: '#fcf8f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f1edec'
  surface-container-high: '#ebe7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#444748'
  inverse-surface: '#313030'
  inverse-on-surface: '#f4f0ef'
  outline: '#747878'
  outline-variant: '#c4c7c8'
  surface-tint: '#5d5f5f'
  primary: '#5d5f5f'
  on-primary: '#ffffff'
  primary-container: '#ffffff'
  on-primary-container: '#747676'
  inverse-primary: '#c6c6c7'
  secondary: '#5d5f5f'
  on-secondary: '#ffffff'
  secondary-container: '#dcdddd'
  on-secondary-container: '#5f6161'
  tertiary: '#5f5e5e'
  on-tertiary: '#ffffff'
  tertiary-container: '#ffffff'
  on-tertiary-container: '#777575'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c7'
  on-primary-fixed: '#1a1c1c'
  on-primary-fixed-variant: '#454747'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1c1b1b'
  on-tertiary-fixed-variant: '#474746'
  background: '#fcf8f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
  border-subtle: '#E5E5E5'
  border-accent: '#222222'
  status-best: '#E8F5E9'
  status-best-text: '#2E7D32'
  status-good: '#FFF3E0'
  status-good-text: '#EF6C00'
  status-avoid: '#FFEBEE'
  status-avoid-text: '#C62828'
  overlay-scrim: rgba(0, 0, 0, 0.4)
typography:
  display-hero:
    fontFamily: Noto Serif
    fontSize: 40px
    fontWeight: '400'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  section-heading:
    fontFamily: Noto Serif
    fontSize: 24px
    fontWeight: '400'
    lineHeight: '1.4'
  card-title:
    fontFamily: Noto Serif
    fontSize: 20px
    fontWeight: '400'
    lineHeight: '1.4'
  body-large:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-main:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.15em
  helper-text:
    fontFamily: Manrope
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.4'
spacing:
  xs: 0.5rem
  sm: 0.75rem
  md: 1rem
  lg: 1.5rem
  xl: 2rem
  container-max: 1000px
  gutter: 2rem
---

# Luxury Travel App - Design Prompt

## Project Overview
Design a premium travel curation platform that helps discerning travelers plan their journeys with comprehensive itineraries and survival kits. The application should feel sophisticated, refined, and elegant while providing practical travel planning tools.

---

## Visual Design Philosophy

### Aesthetic Direction
- **Refined & Luxurious**: Elegant, minimalist approach with premium spacing and typography
- **Sophistication over boldness**: Use lighter font weights, generous whitespace, and subtle details
- **Premium materials feel**: Clean surfaces, fine borders, understated elegance
- **Editorial quality**: Professional, polished, carefully curated appearance

### Design Principles
- Minimal visual noise - only essential elements
- Generous spacing and breathing room
- Subtle transitions and smooth interactions
- Attention to typographic hierarchy
- Refined minimalism over decorative elements

---

## Layout Structure

### 1. Header Section
- Premium branding area at the top
- Tagline emphasizing exclusivity ("Curated experiences for the discerning traveler")
- Subtle background differentiation from main content
- Refined typography with small caps and letter-spacing for labels

---

## 2. Navigation & Tabs

### Tab Design
- Horizontal tab navigation with categories: All, International, India, US, Canada
- **Style**: Clean, uppercase labels with letter-spacing
- **Interaction**: Bottom border indicator on active tab (no background fill)
- **Spacing**: Generous margin between tabs
- Subtle border separating tabs from content below

### Search Bar
- Single-line search input with placeholder text
- Label above search field in uppercase with letter-spacing
- Subtle icon inside the search field
- Simple, clean design without rounded corners
- Focus state with refined border treatment

---

## 3. Destination Cards

### Card Layout
- Grid-based layout with consistent spacing between cards
- Each card divided into two sections: header and content

### Header Section
- Subtle gradient background (light neutral tones)
- Large emoji/icon at the top (48px)
- Destination name in large, light font weight
- Border separator between header and content

### Content Section
- Three key information areas stacked vertically:

#### Area 1: Best Time to Visit
- Uppercase label with letter-spacing
- Readable date ranges or season names
- Clean, scannable format

#### Area 2: Budget Estimation
- Prominent budget figure (largest text in this section)
- Clearly labeled as "5 days" estimate
- Range shown underneath in smaller text
- Currency explicitly stated

#### Area 3: Action Buttons
- Two equal-width buttons below information
- Button 1: "Itinerary" (secondary style)
- Button 2: "Survival Kit" (slightly bolder style)
- Buttons have subtle borders and hover effects

### Card Interaction
- Smooth elevation on hover
- Slight upward movement on hover (not rotation)
- Enhanced shadow effect on hover
- Smooth transition timing

---

## 4. Modal/Detail View

### Modal Structure
- Overlay with semi-transparent dark background
- Centered modal with maximum width constraint
- Scrollable content area for longer information

### Modal Header
- Premium header section with refined typography
- "Travel Guide" label above destination name
- Destination name in large, elegant font
- Subtitle with context
- Close button (X) in top-right corner

### Export Options Bar
- Positioned immediately below header
- Two equal-width buttons: "Download DOCX" and "Download PDF"
- Refined button styling with borders
- Uppercase labels with letter-spacing
- Subtle background color differentiation from white

### Modal Content

#### For Itinerary View:
- **Day cards**: Five cards, one for each day
- **Card structure**:
  - Left border accent for visual interest
  - Day label in uppercase with letter-spacing
  - Day title in elegant font
  - Description paragraph with activity details
  - Right-aligned budget figure for that day
  - Clean, organized layout
  
- **Cost summary box** at bottom:
  - Prominent total estimated cost
  - Range explanation
  - Inclusive details (accommodation, meals, activities)
  - Subtle background differentiation
  - Refined typography hierarchy

#### For Survival Kit View:
- **Seasonal Overview section**:
  - Grid of season cards
  - Each card shows:
    - Season name with date range
    - Status badge (Best/Good/Avoid)
    - Detailed description of conditions
    - Weather and activity suitability info
  - Consistent spacing and alignment
  
- **Essential Preparations section**:
  - Four information blocks with left border accents:
    - Documentation requirements
    - Health & Safety tips
    - Financial preparation
    - Packing essentials
  - Clean, scannable format with checkmarks
  - Descriptions underneath each category
  - Consistent styling across all blocks

---

## 5. Status Badges (Seasonal)

### Badge Styling
- **Best Season**: Positive status with distinct background
- **Good Season**: Neutral/acceptable status
- **Avoid Season**: Warning status
- Badges appear inline with season names
- Small, uppercase text
- Distinct visual treatment for quick scanning

---

## Typography Hierarchy

### Font Weights
- Display text (headings): Light weight (400)
- Body text: Regular weight (400)
- Labels & small text: Medium weight (500)
- Uppercase labels: Medium weight with letter-spacing

### Font Sizes (Proportional)
- Premium branding/main header: Extra large
- Section headings: Large
- Card titles/destination names: Large-medium
- Labels (uppercase): Small with increased spacing
- Body text: Medium
- Helper text/descriptions: Small
- Smallest text (subtitles): Extra small

### Text Treatment
- Consistent line-height for readability
- Generous line-spacing in description text
- Sentence case for all body content
- Uppercase treatment only for labels and headers

---

## Interaction & Motion

### Hover States
- Smooth transitions (300-400ms)
- Subtle shadow enhancement on cards
- Slight vertical movement on cards (translateY)
- Button opacity changes on hover
- Input focus states with refined border treatment

### Scroll Behavior
- Modal content scrolls independently
- Fixed header in modal stays visible while scrolling
- Smooth scroll transitions

### User Feedback
- Click states with subtle scale adjustment
- Clear visual indication of active states
- Disabled states shown clearly where applicable

---

## Spacing & Layout

### Vertical Spacing
- Generous margins between major sections (2rem)
- Consistent spacing between cards (2rem gap)
- Content padding: 2rem inside containers
- Section margins: 1.5-2rem between information blocks

### Horizontal Spacing
- Centered max-width container (max ~1000px)
- Side padding on mobile-responsive layout
- Consistent internal card padding
- Balanced alignment of elements

### Grid Layout
- Responsive grid for cards (auto-fit columns)
- Minimum card width: 280px
- Maximum width constraint for content
- Equal-width elements where appropriate

---

## Visual Details

### Borders
- Minimal, subtle borders (1px)
- Used primarily for definition and structure
- Left border accents on information blocks (3px)
- Top/bottom borders for section separation (1px)
- No rounded corners on most elements (square/minimal radius)

### Background Treatment
- Primary background: Clean white
- Secondary backgrounds: Subtle neutral tone
- Overlay backgrounds: Semi-transparent dark tones
- Section backgrounds: Slightly differentiated from primary
- No gradients, textures, or patterns

### Icons & Visual Elements
- Large emoji icons (48px) for destinations
- Smaller icons inline in text
- Simple, minimal visual approach
- Icons serve functional purpose only

### Shadows & Depth
- Minimal use of shadows
- Card shadows: Subtle, soft (not dramatic)
- Enhanced shadow only on hover states
- No layered shadow effects
- Elevation achieved through spacing and borders

---

## Component States

### Buttons
- Default state: Outlined border style
- Hover state: Enhanced visual feedback
- Active state: Slight compression/scale effect
- Disabled state: Reduced opacity
- All button text: Uppercase with letter-spacing

### Input Fields
- Default: Clean border, minimal styling
- Focus: Enhanced border treatment
- Placeholder text: Subtle, readable contrast
- No background fill on default state

### Cards
- Default: Subtle shadow, clean presentation
- Hover: Enhanced shadow, slight elevation
- Active: Visual indication when selected
- Responsive to interaction without distraction

---

## Search & Filtering

### Search Suggestions
- Dropdown list below search input
- Destination name and region clearly shown
- Hover effect on suggestions (subtle background change)
- Clean, scannable list format
- Quick selection/click to filter

### Tab Filtering
- Clicking tabs instantly filters results
- Visual indication of active tab (bottom border)
- Smooth re-rendering of card grid
- No loading states needed (instant)

---

## Responsive Behavior

### Desktop Layout
- Full grid layout with multiple cards visible
- All content accessible without excessive scrolling
- Hover states fully functional
- Modal centered on viewport

### Tablet Layout
- Reduced card width but maintains proportions
- Grid adapts to available space
- Touch-friendly button sizes
- Modal adjusts to tablet viewport

### Mobile Considerations
- Single column card layout
- Full-width search and navigation
- Touch-friendly button sizes (minimum 44px)
- Modal optimized for smaller screens
- Simplified hover effects for touch devices

---

## User Experience Flow

### 1. Landing
- User sees curated destination cards
- All regions visible by default
- Clear call-to-action buttons on each card

### 2. Filtering
- User can browse by region using tabs
- Search functionality available for direct country lookup
- Instant results on filter change

### 3. Exploration
- User can view seasonal information and budget estimates
- Visual badges help quick decision-making
- Hovering over cards shows premium interaction

### 4. Detail View
- Clicking "Itinerary" shows 5-day plan with costs
- Clicking "Survival Kit" shows seasonal guide and prep tips
- Export buttons always available at top of modal
- Smooth scrolling through detailed content

### 5. Export
- Export buttons trigger download process
- No page navigation or disruption
- Return to browsing seamlessly

---

## Key Design Features Summary

✓ Refined, luxury aesthetic with minimal visual noise
✓ Sophisticated typography hierarchy
✓ Generous whitespace and breathing room
✓ Budget estimation prominently displayed
✓ Seasonal information with visual status indicators
✓ Smooth, subtle interactions
✓ Clean grid-based layout
✓ Professional export functionality
✓ Intuitive navigation and filtering
✓ Responsive to all screen sizes
✓ Premium feel without excessive decoration
✓ Focus on readability and usability

---

## File Organization (For Development)

### Components to Build
1. Header component
2. Navigation/Tab component
3. Search component with suggestions
4. Destination card component
5. Modal/Detail view component
6. Itinerary day card
7. Season status badge
8. Information block component

### Sections to Style
1. Page container
2. Header section
3. Search section
4. Tab navigation
5. Card grid
6. Modal overlay
7. Modal content areas
8. Button styles
9. Badge styles
10. Spacing utilities

---

## Design Specifications

### Container Widths
- Max-width: 1000px
- Side padding: Responsive (1.5rem on mobile, scales with viewport)
- Grid columns: Auto-fit with minimum 280px column width

### Spacing Scale
- Extra large: 2rem
- Large: 1.5rem
- Medium: 1rem
- Small: 12px
- Extra small: 8px

### Typography Scale
- Premium heading: Extra large
- Section heading: Large
- Card title: Large-medium
- Body text: Medium (base)
- Label text: Small (with letter-spacing)
- Helper text: Extra small

---

## Accessibility Considerations

- Sufficient color contrast for text readability
- Clear focus states for keyboard navigation
- Semantic HTML structure
- ARIA labels where appropriate
- Alt text for emoji/icons
- Keyboard-accessible modals and navigation
- Readable font sizes (minimum 12px for labels)
- Proper heading hierarchy

---

## Brand Voice in Design

The design should communicate:
- Sophistication and refinement
- Trustworthiness and expertise
- Attention to detail
- Premium quality
- Elegance without pretension
- Professional curation
- Customer care and planning assistance

This should be reflected in every visual choice, spacing decision, and typographic treatment.
