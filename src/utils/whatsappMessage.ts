interface MessageVariables {
  customerName: string;
  orderNumber: string;
  pickupPin: string;
}

export function renderWhatsappMessage(template: string, variables: MessageVariables): string {
  return template
    .split('{nome_cliente}')
    .join(variables.customerName)
    .split('{numero_pedido}')
    .join(variables.orderNumber)
    .split('{codigo_pin}')
    .join(variables.pickupPin);
}

export function buildWhatsappLink(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, '');
  const withCountryCode = digits.length <= 11 ? `55${digits}` : digits;
  return `https://wa.me/${withCountryCode}?text=${encodeURIComponent(message)}`;
}
