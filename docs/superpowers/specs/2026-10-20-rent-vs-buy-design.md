# Rent vs Buy Calculator Design

## Goal

Build a small local web tool that compares the remaining assets from buying a home and renting for a selected period. The user can change the financial assumptions and inspect the calculation.

## User and use case

The user enters home price, rent, down payment, mortgage terms, investment return, and comparison period. The tool calculates both outcomes with the same initial cash budget.

## Scope

The tool is a local web page. It does not need an account, backend, or network service. Results update when inputs change.

Inputs:

- Home price
- Monthly rent
- Down payment
- Mortgage annual interest rate
- Mortgage term in years
- Comparison period in years
- Annual investment return
- Annual home-price change
- Purchase taxes and agent fees

The calculator will not model rent increases, property management fees, repairs, heating, or other ongoing ownership costs in this version. Rent remains constant during the comparison period.

## Calculation model

### Buyer

- Use a fixed-rate, equal-payment mortgage with monthly payments.
- Calculate the monthly payment from principal, monthly interest rate, and total payment count.
- Calculate the remaining loan balance after the comparison period.
- Calculate the home value after the comparison period using annual compound price change.
- Buyer ending net assets equal ending home value minus remaining loan balance.
- Taxes and agent fees are shown as an initial purchase cost. The renter receives the same initial cash budget as investment principal, so those fees reduce the buyer's relative position.

### Renter

- Start with the same cash budget as the buyer: down payment plus purchase fees.
- Invest that initial cash budget at the entered annual return, compounded monthly.
- Each month, invest the difference between the buyer's housing cash outflow and the renter's rent.
- The initial model uses mortgage payment as the buyer's monthly housing outflow because ongoing ownership costs are out of scope.
- If rent exceeds the mortgage payment, the monthly difference is negative and is withdrawn from the investment balance. The balance must not become negative without an explicit additional-funds model.
- Renter ending assets equal the investment balance after the comparison period.

## Results

Show a side-by-side comparison of:

- Buyer ending net assets
- Renter ending investment assets
- Difference between the two outcomes
- Mortgage payment and monthly rent
- Remaining mortgage balance
- Cumulative mortgage interest paid
- Ending home value
- Initial purchase costs

Show the core formulas and intermediate values so users can inspect how the results were produced.

## Assumptions and boundaries

- The mortgage rate and investment return remain fixed for the full period.
- Both rates are nominal annual rates divided by 12 for monthly calculations.
- Investment returns compound monthly.
- Home-price change compounds annually.
- Rent stays constant.
- No sale costs, taxes on investment returns, inflation, vacancy, mortgage prepayment, or recurring ownership costs are modeled.
- The calculator reports nominal values and does not claim to predict future prices or returns.
- The initial cash budget is down payment plus purchase fees. The entered home price and down payment determine the loan principal.
- A comparison period longer than the mortgage term is not allowed in the first version.

## Acceptance criteria

1. A user can change every input and see updated results without a page reload.
2. The tool shows the mortgage payment, remaining balance, cumulative interest, home value, renter investment balance, and net-asset difference.
3. Buyer and renter start with a consistent initial cash budget under the stated model.
4. The renter's monthly investment contribution equals mortgage payment minus fixed rent.
5. Invalid values and unsupported comparison periods produce clear inline messages rather than misleading results.
6. The page is usable on a desktop and a narrow mobile viewport.

## Open implementation choices

- Select a lightweight frontend implementation after inspecting available local runtimes and project constraints.
- Use Chinese labels and explanations because the request and example are in Chinese.
