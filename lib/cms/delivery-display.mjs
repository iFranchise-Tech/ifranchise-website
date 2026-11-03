const types = {invitation:'Staff invitation',activation:'Account activation','access-help':'Account access help',admin:'Admin notification',website:'Website enquiry notification','website-confirmation':'Customer confirmation'};
const statuses = {queued:'Queued',retry:'Awaiting retry',sending:'Sending',captured:'Captured locally',blocked:'Blocked',failed:'Failed',accepted:'Accepted by Resend',manual_review:'Needs review',cancelled:'Cancelled',sent:'Sent',delivered:'Delivered',delayed:'Delivery delayed',bounced:'Bounced',complained:'Spam complaint',suppressed:'Suppressed'};
const errors = {retry_window_closed:'Automatic retry window has closed.',message_unavailable:'The email content is unavailable.',recipient_not_allowed:'Recipient is outside the allowed delivery list.',delivery_error:'Delivery could not be confirmed.',invalid_receipt:'The provider did not return a valid delivery receipt.'};
export function deliveryDisplay(row) {
 return {
  type:types[row.kind]||'Transactional email', status:statuses[row.status]||'Status unavailable',
  error:!row.last_error?'':errors[row.last_error]||(/^resend_http_\d{3}$/.test(row.last_error)?'The email provider rejected the delivery request.':'Delivery needs attention.'),
 };
}
