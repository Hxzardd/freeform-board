# Freeform Digital Board

A frontend-only freeform digital board built using Next.js.

The application allows users to create, organize, and interact with pins and lists on a blank, infinite canvas. The focus of the project was on clean state management, smooth interactions, and overall usability rather than relying on heavy third-party libraries.

Live Link: https://freeform.hxzard.com/



## Features

### Blank Canvas Interface

- The board starts as an empty canvas
- Pins and lists can be placed anywhere on the board
- The canvas supports free panning and zooming, giving an infinite workspace feel

### Drag and Drop

- Pins can be freely dragged and repositioned
- Multiple pins can exist and be interacted with at the same time
- Pin dragging and canvas panning are handled separately to avoid interaction conflicts

### Pin Types

- **Text Pins** for quick notes
- **Image Pins** added via image URL or local file upload
- **List Pins** that support multiple list items

### Persistence

- All pins, lists, positions, tags, and canvas state are stored using localStorage
- The board state is restored correctly after refreshing or reopening the browser

### Undo / Redo

- Undo and redo support for:
  - Creating pins
  - Moving pins
  - Editing pin content
  - Deleting pins
- Keyboard shortcuts are supported (Ctrl / Cmd + Z, Ctrl / Cmd + Y)

### Zoom and Pan

- Canvas zoom using trackpad gestures (with Ctrl / Cmd)
- Zoom buttons with a visible percentage indicator
- Smooth canvas panning by dragging empty space
- Toolbar remains unaffected by canvas zoom and pan

### Grouping and Tagging

- Pins can be assigned tags for better organization
- Pins can also be assigned to groups, allowing structured organization and future filtering

### UI and UX Improvements

- Floating toolbar that can be dragged around the screen
- Toolbar can be collapsed to reduce clutter
- Clean and minimal design inspired by whiteboard-style tools

## Tech Stack

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- Vercel for deployment

No external drag-and-drop or canvas libraries were used.

## Design and Implementation Decisions

### State Management

A custom history-based state system (past / present / future) was implemented to support undo and redo functionality. This approach keeps state updates predictable and allows the board to correctly restore previous states.

### Canvas Handling

All pins are rendered inside a transformed canvas layer using CSS transforms for panning and zooming. UI elements such as the toolbar exist outside this layer so that they are not affected by canvas transformations.

### Persistence

The board state is serialized and stored in localStorage. The data model was kept backward-compatible so that future changes do not break previously saved boards.

### Minimal Dependencies

All interactions such as dragging, zooming, and panning were implemented manually instead of using external libraries. This keeps the codebase readable and makes the core logic easier to understand.

## Running the Project Locally

```bash
git clone https://github.com/Hxzardd/freeform-board.git
cd freeform-board
npm install
npm run dev
```

Then open http://localhost:3000 in your browser.

## Deployment

The project is deployed using Vercel with GitHub integration.

Since the application is frontend-only, no environment variables or backend configuration were required. The deployed version behaves the same as the local development version.

## Possible Future Improvements

- Snapshot and version saving for board states
- Group-based filtering and visibility toggles
- Multi-select and bulk operations on pins
- Import/export functionality for board data
