# Fixture spec

## A What it does today
- The status line: `deck/app.js:1-385`.

## B What Joseph needs it to do
- As Joseph, when I open the hub on day 1, I want the count 1, so that I know where I stand.
- As Joseph, when I open the hub on day 2, I want the count 2, so that I know where I stand.

## C Data
- `prometheus.hub.tasks`: an array

## D Screens
- Home: the status line.

## E Rules and edge cases
- Rule 1: a value of 0 is not unknown.
- Rule 2: a value of 0 is not unknown.
- Rule 3: a value of 0 is not unknown.

## F Acceptance tests
F1. Given 1 open tasks, when the page loads, then the line shows 1.
F2. Given 2 open tasks, when the page loads, then the line shows 2.
F3. Given 3 open tasks, when the page loads, then the line shows 3.

## G Order of work
1. Build the line.

## H Must not
- No server.
