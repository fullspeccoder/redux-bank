const host = "api.frankfurter.app";

const initialStateAccount = {
  balance: 0,
  loan: 0,
  loanType: "",
  isLoading: false,
};

function accountReducer(state = initialStateAccount, action) {
  const { type, payload } = action;
  switch (type) {
    case "account/deposit":
      return { ...state, balance: state.balance + payload, isLoading: false };
    case "account/withdraw":
      return { ...state, balance: state.balance - payload };
    case "account/requestLoan":
      if (state.loan > 0) return state;
      return {
        ...state,
        loan: payload.amount,
        loanType: payload.loanType,
      };
    case "account/payLoan":
      if (state.balance < state.loan) return state;
      return {
        ...state,
        loan: 0,
        loanType: "",
        balance: state.balance - state.loan,
      };
    case "convertingCurrency":
      return { ...state, isLoading: true };
    default:
      return state;
  }
}

export function depositCash(amount, currency) {
  if (currency === "USD") return { type: "account/deposit", payload: amount };
  return async function (dispatch, getState) {
    // API call
    dispatch({ type: "account/convertingCurrency" });
    const res = await fetch(
      `https://${host}/latest?amount=${amount}&from=${currency}&to=USD`
    );
    const data = await res.json();
    const convertedAmount = data.rates.USD;
    // return action
    dispatch({
      type: "account/deposit",
      payload: convertedAmount,
    });
  };
}
export function withdrawCash(amount) {
  return { type: "account/withdraw", payload: amount };
}
export function requestLoan(amount, type) {
  return {
    type: "account/requestLoan",
    payload: { amount: amount, loanType: type },
  };
}
export function payLoan() {
  return { type: "account/payLoan" };
}

export default accountReducer;
