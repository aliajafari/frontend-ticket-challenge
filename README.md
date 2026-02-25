# Javascript Ticket Challenge

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

