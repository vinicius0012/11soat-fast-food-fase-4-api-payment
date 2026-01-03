export function removeMask(
  value: string,
  mask: string,
  maskChar: string = 'X',
): string {
  const regex = new RegExp(mask.replaceAll('X', '\\d'), 'g');
  return value.replace(regex, maskChar);
}

export function splitNamePayment(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const [firstName, ...rest] = fullName.trim().split(' ');
  const lastName = rest.join(' ');
  return { firstName, lastName };
}
