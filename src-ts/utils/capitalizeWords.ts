export const capitalizeWords = (str?: string): string =>
    str
        ? str
              .split(' ')
              .map(el => el.charAt(0).toUpperCase() + el.substring(1))
              .join(' ')
        : '';
