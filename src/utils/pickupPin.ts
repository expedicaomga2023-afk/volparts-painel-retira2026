const PIN_MIN = 100000;
const PIN_RANGE = 900000;

export function generatePickupPin(): string {
  const random = new Uint32Array(1);
  crypto.getRandomValues(random);
  return String(PIN_MIN + (random[0] % PIN_RANGE));
}

export function isPickupPinMatch(input: string, pin: string | undefined): boolean {
  return Boolean(pin) && input.trim() === pin;
}
