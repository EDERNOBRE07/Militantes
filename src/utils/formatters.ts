/**
 * Utilities for formatting dates, numbers, and Brazilian currency
 */

export function formatDateTimeBR(dateStr?: string | null): string {
  if (!dateStr) return '--/--/---- --:--';

  // If already formatted like DD/MM/AAAA HH:mm or DD/MM/AAAA às HH:mm
  if (/^\d{2}\/\d{2}\/\d{4}/.test(dateStr)) {
    return dateStr;
  }

  try {
    // Replace space with T if ISO-like string
    const normalized = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
    const date = new Date(normalized);

    if (!isNaN(date.getTime())) {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      return `${day}/${month}/${year} ${hours}:${minutes}`;
    }
  } catch {}

  return dateStr;
}

export function formatDateBR(dateStr?: string | null): string {
  if (!dateStr) return '--/--/----';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;

  try {
    const normalized = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
    const date = new Date(normalized);
    if (!isNaN(date.getTime())) {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
  } catch {}

  return dateStr;
}

export function formatCurrencyBRL(val: number): string {
  return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
