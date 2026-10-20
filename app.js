(function startRentVsBuyApp() {
  "use strict";
  const defaults = { homePrice:4990000, monthlyRent:6500, homeArea:70, downPayment:2000000, householdHomeCount:"sole", deedTaxRate:1, brokerFeeRate:2, otherPurchaseCosts:0, mortgageAnnualRate:3.05, mortgageTermYears:30, comparisonYears:10, investmentAnnualRate:3, annualHomePriceChange:0 };
  const form = document.getElementById("assumptions-form");
  const errorMessage = document.getElementById("error-message");
  const numericIds = Object.keys(defaults).filter((id) => typeof defaults[id] === "number");
  const inputs = Object.fromEntries(Object.keys(defaults).map((id) => [id, document.getElementById(id)]));
  const currency = new Intl.NumberFormat("zh-CN", { style:"currency", currency:"CNY", maximumFractionDigits:0 });
  const signedCurrency = new Intl.NumberFormat("zh-CN", { style:"currency", currency:"CNY", maximumFractionDigits:0, signDisplay:"always" });

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.hidden = false;
    document.querySelectorAll("[data-result]").forEach((element) => { element.textContent = "—"; });
    document.getElementById("period-badge").textContent = "—";
    document.getElementById("period-years").textContent = "—";
    document.getElementById("difference-label").textContent = "等待有效参数";
    document.getElementById("difference-bar-fill").style.width = "0%";
    document.getElementById("difference-card").classList.remove("is-renter");
    document.querySelector(".buyer-card").setAttribute("aria-label", "买房期末房屋净资产：暂无结果");
    document.querySelector(".renter-card").setAttribute("aria-label", "租房期末投资资产：暂无结果");
  }

  function updateDefaultDeedTaxRate() {
    const rate = Number(inputs.homeArea.value) <= 140 ? 1 : (inputs.householdHomeCount.value === "sole" ? 1.5 : 2);
    inputs.deedTaxRate.value = rate;
  }

  function readInputs() {
    const values = { householdHomeCount: inputs.householdHomeCount.value };
    for (const id of numericIds) {
      const raw = inputs[id].value.trim();
      const value = Number(raw);
      if (raw === "" || !Number.isFinite(value)) throw new Error("请为每个参数填写有效数字。");
      values[id] = value;
    }
    if (values.homePrice <= 0) throw new Error("房屋总价必须大于 0 元。");
    if (values.homeArea <= 0) throw new Error("建筑面积必须大于 0 平方米。");
    if (values.monthlyRent < 0) throw new Error("每月租金不能小于 0 元。");
    if (values.downPayment < 0 || values.downPayment >= values.homePrice) throw new Error("首付必须大于或等于 0 元，并且小于房屋总价。");
    if (values.deedTaxRate < 0 || values.deedTaxRate > 5 || values.brokerFeeRate < 0 || values.brokerFeeRate > 10 || values.otherPurchaseCosts < 0) throw new Error("请检查税率、中介费率和其他费用。");
    if (values.mortgageAnnualRate < 0) throw new Error("贷款年利率不能小于 0%。");
    if (values.investmentAnnualRate < -100) throw new Error("投资年化收益率不能低于 -100%。");
    if (values.annualHomePriceChange <= -100) throw new Error("房价年跌幅必须高于 -100%。");
    if (!Number.isInteger(values.mortgageTermYears) || values.mortgageTermYears < 1 || values.mortgageTermYears > 50) throw new Error("贷款年限必须是 1 至 50 之间的整数。");
    if (!Number.isInteger(values.comparisonYears) || values.comparisonYears < 1) throw new Error("比较时间必须是正整数年。");
    if (values.comparisonYears > values.mortgageTermYears) throw new Error("比较时间不能超过贷款年限。");
    values.deedTaxRate /= 100;
    values.brokerFeeRate /= 100;
    values.mortgageAnnualRate /= 100;
    values.investmentAnnualRate /= 100;
    values.annualHomePriceChange /= 100;
    return values;
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    element.textContent = value;
    element.dataset.result = "true";
  }

  function renderCalculationProcess(values, result) {
    const amount = (value) => currency.format(value);
    const percent = (value, digits) => (value * 100).toFixed(digits) + "%";
    const signedAmount = (value) => signedCurrency.format(value);
    const contributionOperator = result.monthlyContribution < 0 ? "− " + amount(Math.abs(result.monthlyContribution)) : "+ " + amount(result.monthlyContribution);
    const monthlyRateLabel = percent(result.monthlyRate, 6);
    const homeChangeLabel = percent(values.annualHomePriceChange, 2);
    const investmentRateLabel = percent(values.investmentAnnualRate, 2);
    setText("calc-loan-principal", amount(values.homePrice) + " − " + amount(values.downPayment) + " = " + amount(result.loanPrincipal));
    setText("calc-loan-terms", percent(values.mortgageAnnualRate, 2) + " ÷ 12 = " + monthlyRateLabel + "；" + values.mortgageTermYears + " × 12 = " + result.paymentCount + " 期");
    setText("calc-payment-formula", result.monthlyRate === 0 ? amount(result.loanPrincipal) + " ÷ " + result.paymentCount + " = " + amount(result.monthlyMortgagePayment) : amount(result.loanPrincipal) + " × " + monthlyRateLabel + " × (1 + " + monthlyRateLabel + ")^" + result.paymentCount + " ÷ [(1 + " + monthlyRateLabel + ")^" + result.paymentCount + " − 1] = " + amount(result.monthlyMortgagePayment));
    setText("calc-monthly-payment", amount(result.monthlyMortgagePayment));
    setText("calc-first-interest", amount(result.loanPrincipal) + " × " + monthlyRateLabel + " = " + amount(result.firstMonthInterest));
    setText("calc-first-principal", amount(result.monthlyMortgagePayment) + " − " + amount(result.firstMonthInterest) + " = " + amount(result.monthlyMortgagePayment - result.firstMonthInterest));
    setText("calc-period-label", String(values.comparisonYears));
    setText("calc-total-payments", amount(result.monthlyMortgagePayment) + " × " + result.comparisonMonths + " = " + amount(result.totalMortgagePayments));
    setText("calc-principal-repaid", amount(result.loanPrincipal) + " − " + amount(result.remainingLoanBalance) + " = " + amount(result.principalRepaid));
    setText("calc-total-interest", amount(result.totalMortgageInterest));
    setText("calc-remaining-loan", amount(result.remainingLoanBalance));
    setText("calc-home-value-formula", amount(values.homePrice) + " × (1 + " + homeChangeLabel + ")^" + values.comparisonYears + " = " + amount(result.endingHomeValue));
    setText("calc-buyer-assets", amount(result.endingHomeValue) + " − " + amount(result.remainingLoanBalance) + " = " + amount(result.buyerNetAssets));
    setText("calc-deed-tax", amount(values.homePrice) + " × " + percent(values.deedTaxRate, 2) + " = " + amount(result.deedTax));
    setText("calc-broker-fee", amount(values.homePrice) + " × " + percent(values.brokerFeeRate, 2) + " = " + amount(result.brokerFee));
    setText("calc-other-costs", amount(result.otherPurchaseCosts));
    setText("calc-purchase-costs", amount(result.deedTax) + " + " + amount(result.brokerFee) + " + " + amount(result.otherPurchaseCosts) + " = " + amount(result.purchaseCosts));
    setText("calc-initial-investment", amount(values.downPayment) + " + " + amount(result.purchaseCosts) + " = " + amount(result.initialCashBudget));
    setText("calc-monthly-contribution", amount(result.monthlyMortgagePayment) + " − " + amount(values.monthlyRent) + " = " + signedAmount(result.monthlyContribution));
    setText("calc-renter-formula", result.monthlyInvestmentRate === 0 ? amount(result.initialCashBudget) + " " + contributionOperator + " × " + result.comparisonMonths + " = " + amount(result.renterInvestmentAssets) : amount(result.initialCashBudget) + " × (1 + " + investmentRateLabel + " ÷ 12)^" + result.comparisonMonths + " " + contributionOperator + " × [((1 + " + investmentRateLabel + " ÷ 12)^" + result.comparisonMonths + " − 1) ÷ (" + investmentRateLabel + " ÷ 12)]");
    setText("calc-initial-growth", amount(result.initialInvestmentFutureValue));
    setText("calc-contribution-growth", amount(result.monthlyContributionsFutureValue));
    setText("calc-renter-assets", amount(result.renterInvestmentAssets));
    setText("calc-asset-difference", result.assetDifference === 0 ? "两种方案相同 " + amount(0) : (result.assetDifference < 0 ? "租房多 " : "买房多 ") + amount(Math.abs(result.assetDifference)));
  }

  function render() {
    try {
      const values = readInputs();
      const result = window.RentVsBuyCalculator.calculate(values);
      errorMessage.hidden = true;
      document.getElementById("period-badge").textContent = values.comparisonYears + " 年后";
      document.getElementById("period-years").textContent = values.comparisonYears;
      setText("asset-difference", currency.format(Math.abs(result.assetDifference)));
      setText("buyer-assets", currency.format(result.buyerNetAssets));
      setText("renter-assets", currency.format(result.renterInvestmentAssets));
      setText("home-value", currency.format(result.endingHomeValue));
      setText("remaining-loan", currency.format(result.remainingLoanBalance));
      setText("initial-investment", currency.format(result.initialCashBudget));
      setText("monthly-difference", signedCurrency.format(result.monthlyContribution));
      setText("monthly-payment", currency.format(result.monthlyMortgagePayment));
      setText("monthly-rent-result", currency.format(values.monthlyRent));
      setText("first-month-principal", currency.format(result.monthlyMortgagePayment - result.firstMonthInterest));
      setText("first-month-interest", currency.format(result.firstMonthInterest));
      setText("total-interest", currency.format(result.totalMortgageInterest));
      setText("deed-tax-result", currency.format(result.deedTax));
      setText("broker-fee-result", currency.format(result.brokerFee));
      setText("other-cost-result", currency.format(result.otherPurchaseCosts));
      setText("purchase-cost-result", currency.format(result.purchaseCosts));
      renderCalculationProcess(values, result);
      const differenceCard = document.getElementById("difference-card");
      const differenceLabel = document.getElementById("difference-label");
      const fill = document.getElementById("difference-bar-fill");
      const renterLeads = result.assetDifference < 0;
      differenceCard.classList.toggle("is-renter", renterLeads);
      differenceLabel.textContent = result.assetDifference === 0 ? "两种方案资产相同" : (renterLeads ? "租房方案领先" : "买房方案领先");
      fill.style.width = Math.min(100, Math.max(8, Math.abs(result.assetDifference) / Math.max(result.buyerNetAssets, result.renterInvestmentAssets, 1) * 100)) + "%";
      document.querySelector(".buyer-card").setAttribute("aria-label", "买房期末房屋净资产 " + currency.format(result.buyerNetAssets));
      document.querySelector(".renter-card").setAttribute("aria-label", "租房期末投资资产 " + currency.format(result.renterInvestmentAssets));
    } catch (error) { showError(error.message || "计算失败，请检查输入参数。"); }
  }

  inputs.homeArea.addEventListener("change", updateDefaultDeedTaxRate);
  inputs.householdHomeCount.addEventListener("change", updateDefaultDeedTaxRate);
  form.addEventListener("input", render);
  form.addEventListener("change", render);
  document.getElementById("reset-button").addEventListener("click", () => {
    for (const [id, value] of Object.entries(defaults)) inputs[id].value = value;
    render();
  });
  render();
})();
