# Frontend Ticket Challenge

The Volleyball Federation has decided to use an online selling platform for the next season, and our company has been chosen for implementing that.

## Requirements

In this challenge, you are going to develop a **responsive web application** to display stadium seats randomly to the user. Users can select a seat and buy a ticket. After buying the ticket, you should redirect to **another page** that shows the ticket ID to the user.


## API Standard

### `GET /map`

Response body sample: `['m213', 'm654', 'm63', 'm6888']`

Get the list of map IDs. Use this endpoint to get the list and choose one of the stadium maps randomly.

### `GET /map/<map_id>`

Get map details and display seats.

Response body sample:
```json
[
   [0, 0, 1, 0],
   [0, 1, 0, 0],
   [1, 1, 1, 1],
   [1, 1, 1, 1]
]
```

In the response, 1 means reserved, and 0 means the seat is available to buy.

### `POST /map/<map_id>/ticket`

Request body sample:
```json
{
   "x": 2,
   "y": 1
}
```

Buy tickets. `x` and `y` are seat coordinates in the request.

Suppose the backend APIs are concurrently in the development process. So mock APIs in some way to continue your work.

## Implementation details

Try to write your code as **reusable** and **readable** as possible. Also, don't forget to **document your code** and provide clear reasons for all your decisions in the code.

It is more valuable to us that the project comes with unit tests.

Please don't use any CSS framework (like Bootstrap, Material, ...).

Don't forget that many stadium seats are available (around 100k), so try to implement your code in a way that could display it smoothly. If your solution does not sample enough for implementing fast, you can just describe it in your documents.

Please fork this repository and add your code to that. Don't forget that your commits are important, so be sure that you're committing your code often with a proper commit message.

## Architecture decisions

### Feature-based folder structure
Code is organised by feature (`features/map`, `features/ticket`) rather than by type (components, hooks, pages). This keeps all code related to a feature co-located and makes it easy to reason about or remove a feature without hunting across the tree.

### API abstraction layer
`MapApi` is an interface. `mockApi` and `realApi` both implement it. `features/map/api/index.ts` selects the implementation at boot time based on `VITE_API_MODE`. This means no component or hook ever imports a concrete API — swapping to real endpoints requires zero application-code changes.

### SeatGrid — event delegation
Rather than attaching an `onClick` to every seat `<div>` (which would create thousands of handlers for large maps), a single `onClick` is attached to the viewport container. The handler reads `data-row` / `data-col` from `event.target` to identify the seat. This is both more memory-efficient and simpler to reason about.

### SeatGrid — pointer capture only for touch
`setPointerCapture` is called only for `pointerType === 'touch'`. Capturing mouse pointers redirects the subsequent `click` event to the capturing element (the viewport), which breaks `event.target`-based delegation. Touch capture is still needed so a dragging finger that leaves the viewport boundary continues to be tracked.

### Zoom implementation
Zoom is implemented by scaling the computed seat pixel size (via `ResizeObserver` + `ZOOM_SCALE` multiplier) rather than CSS `transform: scale()`. CSS transform does not affect the scrollable area, so overflow-based scrolling would not work at higher zoom levels. Scaling the actual element sizes lets the browser handle scroll geometry natively.

## Performance at scale (100k seats)

The current implementation renders every seat as a DOM `<div>`. This is fine for maps up to ~1 000–2 000 seats but would cause a severe performance problem at 100k seats (layout thrashing, large DOM, slow paint).

**The correct approach for large maps is row-level virtual scrolling:**

1. Only render the rows that are currently visible inside the viewport (the visible window), plus a small overscan buffer above and below.
2. Use a `ResizeObserver` to track the viewport height and an `onScroll` listener to track the scroll position.
3. Derive `firstVisibleRow` and `lastVisibleRow` from `scrollTop / rowHeight`.
4. Render a spacer `<div>` with `height = firstVisibleRow × rowHeight` at the top and another with `height = (totalRows - lastVisibleRow) × rowHeight` at the bottom so the scrollbar represents the full content height.

This limits the live DOM to the ~30–50 rows in view at any time regardless of the total seat count. Libraries such as `@tanstack/react-virtual` implement this pattern out of the box. The horizontal axis follows the same principle when the number of columns is large.

## Run locally

```bash
npm install
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`).

## API mode

By default the app uses the **mock API**.

- **Mock (default)**: no env vars needed
- **Real backend**:
  - `VITE_API_MODE=real`
  - `VITE_API_BASE_URL=http://<backend-host>` (optional; empty = same-origin)

