import PaymentStep from './payment/PaymentStep';

export type ExecutionReservationState =
  | 'idle'
  | 'saving'
  | 'requesting'
  | 'polling'
  | 'ready'
  | 'committing'
  | 'failed';

interface CampaignPaymentStepProps {
  executionReservationState?: ExecutionReservationState;
  executionReservationError?: string | null;
  onRetryExecutionReservation?: () => void;
}

const CampaignPaymentStep = (props: CampaignPaymentStepProps) => (
  <PaymentStep {...props} />
);

export default CampaignPaymentStep;
