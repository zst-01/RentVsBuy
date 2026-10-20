(function attachRentVsBuyCalculator(global) {
  "use strict";

  function calculate(inputs) {
    const {
      homePrice, monthlyRent, homeArea, householdHomeCount, downPayment,
      deedTaxRate, brokerFeeRate, otherPurchaseCosts, mortgageAnnualRate,
      mortgageTermYears, comparisonYears, investmentAnnualRate, annualHomePriceChange,
    } = inputs;

    const deedTax = homePrice * deedTaxRate;
    const brokerFee = homePrice * brokerFeeRate;
    const purchaseCosts = deedTax + brokerFee + otherPurchaseCosts;
    const loanPrincipal = homePrice - downPayment;
    const monthlyRate = mortgageAnnualRate / 12;
    const paymentCount = mortgageTermYears * 12;
    const comparisonMonths = comparisonYears * 12;
    const monthlyMortgagePayment = monthlyRate === 0
      ? loanPrincipal / paymentCount
      : loanPrincipal * monthlyRate / (1 - Math.pow(1 + monthlyRate, -paymentCount));

    let remainingLoanBalance = loanPrincipal;
    let totalMortgageInterest = 0;
    let firstMonthInterest = 0;
    for (let month = 1; month <= comparisonMonths; month += 1) {
      const interest = remainingLoanBalance * monthlyRate;
      const principal = Math.min(remainingLoanBalance, monthlyMortgagePayment - interest);
      if (month === 1) firstMonthInterest = interest;
      totalMortgageInterest += interest;
      remainingLoanBalance = Math.max(0, remainingLoanBalance - principal);
    }

    const endingHomeValue = homePrice * Math.pow(1 + annualHomePriceChange, comparisonYears);
    const buyerNetAssets = endingHomeValue - remainingLoanBalance;
    const monthlyInvestmentRate = investmentAnnualRate / 12;
    const monthlyContribution = monthlyMortgagePayment - monthlyRent;
    const initialCashBudget = downPayment + purchaseCosts;
    const monthlyInvestmentFactor = Math.pow(1 + monthlyInvestmentRate, comparisonMonths);
    const initialInvestmentFutureValue = initialCashBudget * monthlyInvestmentFactor;
    const monthlyContributionsFutureValue = monthlyInvestmentRate === 0
      ? monthlyContribution * comparisonMonths
      : monthlyContribution * (monthlyInvestmentFactor - 1) / monthlyInvestmentRate;
    let renterInvestmentAssets = initialCashBudget;

    for (let month = 1; month <= comparisonMonths; month += 1) {
      renterInvestmentAssets *= 1 + monthlyInvestmentRate;
      renterInvestmentAssets += monthlyContribution;
      if (renterInvestmentAssets < -0.005) {
        throw new RangeError("租房方案的投资余额不足以支付后续月度差额。请缩短比较年限或调整房租、首付和投资收益率。");
      }
      renterInvestmentAssets = Math.max(0, renterInvestmentAssets);
    }

    const totalMortgagePayments = monthlyMortgagePayment * comparisonMonths;
    const principalRepaid = loanPrincipal - remainingLoanBalance;
    const assetDifference = buyerNetAssets - renterInvestmentAssets;
    const numericResults = [
      loanPrincipal, monthlyMortgagePayment, firstMonthInterest, remainingLoanBalance,
      totalMortgageInterest, endingHomeValue, buyerNetAssets, renterInvestmentAssets,
      monthlyContribution, initialCashBudget, totalMortgagePayments, principalRepaid,
      initialInvestmentFutureValue, monthlyContributionsFutureValue,
      assetDifference, deedTax, brokerFee, otherPurchaseCosts, purchaseCosts,
    ];
    if (!numericResults.every(Number.isFinite)) {
      throw new RangeError("当前参数范围过大，无法稳定计算。请缩小金额或利率后重试。");
    }

    return {
      loanPrincipal,
      monthlyMortgagePayment,
      firstMonthInterest,
      remainingLoanBalance,
      totalMortgageInterest,
      endingHomeValue,
      buyerNetAssets,
      renterInvestmentAssets,
      assetDifference,
      monthlyContribution,
      initialCashBudget,
      homeArea,
      householdHomeCount,
      deedTaxRate,
      deedTax,
      brokerFeeRate,
      brokerFee,
      otherPurchaseCosts,
      purchaseCosts,
      comparisonMonths,
      paymentCount,
      monthlyRate,
      monthlyInvestmentRate,
      totalMortgagePayments,
      principalRepaid,
      initialInvestmentFutureValue,
      monthlyContributionsFutureValue,
    };
  }

  global.RentVsBuyCalculator = { calculate };
})(window);
