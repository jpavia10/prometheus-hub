# Fixture spec

## A What it does today
- The status line: `deck/app.js:3-9`.

## B What Joseph needs it to do
- As Joseph, when I open the hub on day 1, I want the count 1, so that I know where I stand.
- As Joseph, when I open the hub on day 2, I want the count 2, so that I know where I stand.
- As Joseph, when I open the hub on day 3, I want the count 3, so that I know where I stand.
- As Joseph, when I open the hub on day 4, I want the count 4, so that I know where I stand.
- As Joseph, when I open the hub on day 5, I want the count 5, so that I know where I stand.
- As Joseph, when I open the hub on day 6, I want the count 6, so that I know where I stand.
- As Joseph, when I open the hub on day 7, I want the count 7, so that I know where I stand.
- As Joseph, when I open the hub on day 8, I want the count 8, so that I know where I stand.

## C Data
| record | field | type | unit | required | example | storage key | read by |
|---|---|---|---|---|---|---|---|
| task | due | date | - | yes | 2026-11-30 | prometheus.hub.tasks | Kairos |

## D Screens
- Home: the status line.

## E Rules and edge cases
- Rule 1: a value of 0 is not unknown.
- Rule 2: a value of 0 is not unknown.
- Rule 3: a value of 0 is not unknown.
- Rule 4: a value of 0 is not unknown.
- Rule 5: a value of 0 is not unknown.
- Rule 6: a value of 0 is not unknown.
- Rule 7: a value of 0 is not unknown.
- Rule 8: a value of 0 is not unknown.
- Rule 9: a value of 0 is not unknown.
- Rule 10: a value of 0 is not unknown.

## F Acceptance tests
F1. Given 1 open tasks, when the page loads, then the line shows 1.
F2. Given 2 open tasks, when the page loads, then the line shows 2.
F3. Given 3 open tasks, when the page loads, then the line shows 3.
F4. Given 4 open tasks, when the page loads, then the line shows 4.
F5. Given 5 open tasks, when the page loads, then the line shows 5.
F6. Given 6 open tasks, when the page loads, then the line shows 6.
F7. Given 7 open tasks, when the page loads, then the line shows 7.
F8. Given 8 open tasks, when the page loads, then the line shows 8.
F9. Given 9 open tasks, when the page loads, then the line shows 9.
F10. Given 10 open tasks, when the page loads, then the line shows 10.
F11. Given 11 open tasks, when the page loads, then the line shows 11.
F12. Given 12 open tasks, when the page loads, then the line shows 12.

## G Order of work
1. Build the line.

## H Must not
- No server.
