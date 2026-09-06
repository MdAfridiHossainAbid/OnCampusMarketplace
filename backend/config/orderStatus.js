// Using an object instead of raw strings means a typo like 'Completd'
// fails at import/autocomplete time instead of silently at runtime.
const ORDER_STATUS = Object.freeze({
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
});

const VALID_STATUSES = Object.values(ORDER_STATUS);

module.exports = { ORDER_STATUS, VALID_STATUSES };