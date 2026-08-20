# Smart Targeting execution: ambiguous finalization outcome

## Current limitation

The finalization request (`PUT /campaigns/:uuid` with
`execution_audience_calculation_id`) can be ambiguous when the server commits
the reservation but the client receives a server-side error or no usable
response. Retrying finalization blindly can attempt to reuse an already
committed calculation.

The frontend should reconcile by polling the calculation-by-ID endpoint and
treating `status: committed` as successful. It must continue reconciliation
when that lookup is temporarily unavailable.

## Backend contract needed for complete recovery

Finalization should be idempotent for the same campaign and execution
calculation ID. In particular, a repeated request after a successful commit
should return an unambiguous success/committed response rather than a generic
error. The calculation lookup endpoint must remain available after commit and
return `status: committed` for the exact ID.

Until that contract is guaranteed, a server-side 5xx response from the final
PUT cannot prove whether the reservation was committed. Operators should check
the calculation status before retrying or modifying the campaign.
