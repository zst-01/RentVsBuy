# Rent vs Buy Calculator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Build a Chinese-language local web calculator that compares buyer home equity with renter investment assets over a selected period.

**Architecture:** Use a static page with plain HTML, CSS, and JavaScript. Keep financial calculations in a standalone script and keep DOM updates and input validation in the page controller. No build step, backend, or third-party dependency is needed.

**Tech Stack:** HTML, CSS, vanilla JavaScript; modern desktop and mobile browsers.

**Spec:** `docs/superpowers/specs/2026-10-20-rent-vs-buy-design.md`

## Global Constraints

- The tool is a local web page. It does not need an account, backend, or network service.
- Results update when inputs change.
- Use a fixed-rate, equal-payment mortgage with monthly payments.
- Invest the same initial cash budget for the renter and invest the monthly difference between mortgage payment and fixed rent.
- Rent stays constant; recurring ownership costs are out of scope.
- Investment returns compound monthly; home-price change compounds annually.
- Do not allow a comparison period longer than the mortgage term.
- Use Chinese labels and explanations.
- Report nominal values and do not claim to predict future prices or returns.

## Review Focus

- Zero mortgage or investment rates need valid formula branches that avoid division by zero; cover zero rates in manual verification.
- A down payment equal to or greater than home price must not create a negative or unsupported mortgage; verify inline validation.
- A renter portfolio that cannot fund a negative monthly contribution must not go below zero or report a misleading comparison; verify the page shows a clear error.
- A zero home-price growth rate and negative annual growth must produce the expected ending home value; verify with the source example and one decline case.
- Currency rounding must not feed back into calculations; verify outputs retain cents internally and format only for display.

---

## File Structure

- `index.html` — Chinese page structure, input groups, result panels, formula notes, and script loading.
- `styles.css` — responsive layout, readable financial result hierarchy, and validation states.
- `calculator.js` — pure calculation functions for mortgage schedule, home value, renter investment balance, and buyer/renter comparison.
- `app.js` — default values, form parsing and validation, event handling, formatted result rendering, and inline error display.

## Task 1: Build the financial calculation core

**Files:**
- Create: `calculator.js`

**Interfaces:**
- Produces `window.RentVsBuyCalculator.calculate(inputs) -> result`.
- `inputs` contains `homePrice`, `monthlyRent`, `downPayment`, `purchaseCosts`, `mortgageAnnualRate`, `mortgageTermYears`, `comparisonYears`, `investmentAnnualRate`, and `annualHomePriceChange`.
- `result` contains `loanPrincipal`, `monthlyMortgagePayment`, `remainingLoanBalance`, `totalMortgageInterest`, `endingHomeValue`, `buyerNetAssets`, `renterInvestmentAssets`, and `assetDifference`.

- [x] Implement the monthly-payment and remaining-balance formulas, including zero-rate cases.
- [x] Implement monthly interest accumulation for the selected comparison period.
- [x] Implement annual compound home valuation for the selected comparison period.
- [x] Implement renter portfolio growth: initial capital is `downPayment + purchaseCosts`; each month apply the investment return to the current balance, then deposit that month's `monthlyMortgagePayment - monthlyRent` difference at month end. This matches the standard end-of-month contribution formula.
- [x] Return a calculation error if a negative monthly contribution would reduce the renter portfolio below zero; do not silently borrow or inject outside funds.
- [x] Keep full numeric precision in results. Round only in the UI layer.

## Task 2: Build the page and responsive visual layout

**Files:**
- Create: `index.html`
- Create: `styles.css`

**Interfaces:**
- `index.html` loads `calculator.js` before `app.js` with classic script tags so the page can run directly from disk.
- Input element IDs match the `inputs` fields defined in Task 1.

- [x] Add labeled fields for all nine calculator inputs and provide defaults matching the example: 4,990,000 home price, 6,500 monthly rent, 2,000,000 down payment, 150,000 purchase costs, 3.05% mortgage rate, 30-year mortgage, 10-year comparison, 3% investment return, and 0% annual home-price change. Display rate fields as percentages; the controller converts percentage values to decimal rates before calculation.
- [x] Add side-by-side buyer and renter result panels, an asset-difference summary, and detail rows for monthly payment, rent, remaining loan, cumulative interest, ending home value, and purchase costs.
- [x] Add a short assumptions section that states the fixed-rent, monthly-compounding, no-recurring-ownership-cost, and no-sale-cost boundaries.
- [x] Style the page for desktop and narrow mobile screens, with visible focus and inline error states.

## Task 3: Connect inputs, validation, and results

**Files:**
- Create: `app.js`
- Modify: `index.html`

**Interfaces:**
- Consumes `window.RentVsBuyCalculator.calculate(inputs)` from Task 1.
- Consumes input IDs and result placeholders from Task 2.

- [x] Parse each input as a finite number and validate positive price, nonnegative rent/cost/mortgage rate, investment return no lower than -100%, annual home-price change above -100%, down payment below home price, positive integer mortgage and comparison years, and comparison period no longer than mortgage term.
- [x] On input changes, validate all fields, call the calculator, and update results without reloading the page.
- [x] Display a clear inline message for invalid input or an unfunded renter withdrawal, and do not leave stale results presented as current.
- [x] Format currency in Chinese yuan for display without changing the underlying values.
- [x] Show formula notes for loan principal, monthly payment, ending home value, renter investment balance, and both net-asset calculations.

## Task 4: Verify the local tool

**Files:**
- No new files.

**Interfaces:**
- Verify the finished page through a local browser using its `index.html` file URL.

- [x] Open the page and confirm all default inputs and result fields render.
- [x] Confirm the example defaults produce a monthly payment near 12,687 yuan, first-month interest near 7,600 yuan, and a flat-price buyer equity near 2.71 million yuan after ten years.
- [x] Change the home-price change input to +2% and -3%; confirm the ending home value and buyer net assets update in the expected direction.
- [x] Set mortgage and investment rates to zero one at a time; confirm results remain finite and correct.
- [x] Enter invalid values, a down payment at or above home price, and a comparison period longer than the loan term; confirm clear errors replace stale results.
- [x] Use a rent/high-horizon combination that drains the renter portfolio; confirm the tool reports an error and never displays a negative investment balance.
- [x] Check the layout at desktop width and a narrow mobile width.
