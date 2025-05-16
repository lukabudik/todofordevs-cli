import chalk from 'chalk';
import Table from 'cli-table3';

/**
 * Print a success message
 */
export function success(message: string): void {
  console.log(chalk.green('✓ ') + message);
}

/**
 * Print an error message
 */
export function error(message: string): void {
  console.error(chalk.red('✗ ') + message);
}

/**
 * Print a warning message
 */
export function warning(message: string): void {
  console.warn(chalk.yellow('⚠ ') + message);
}

/**
 * Print an info message
 */
export function info(message: string): void {
  console.info(chalk.blue('ℹ ') + message);
}

/**
 * Print a heading
 */
export function heading(message: string): void {
  console.log('\n' + chalk.bold(message));
}

/**
 * Create a table with the specified headers
 */
export function createTable(headers: string[]): Table.Table {
  return new Table({
    head: headers.map((header) => chalk.bold(header)),
    chars: {
      top: '─',
      'top-mid': '┬',
      'top-left': '┌',
      'top-right': '┐',
      bottom: '─',
      'bottom-mid': '┴',
      'bottom-left': '└',
      'bottom-right': '┘',
      left: '│',
      'left-mid': '├',
      mid: '─',
      'mid-mid': '┼',
      right: '│',
      'right-mid': '┤',
      middle: '│',
    },
  });
}

/**
 * Format a date string for display
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch (e) {
    return dateString;
  }
}

/**
 * Truncate a string if it's too long
 */
export function truncate(str: string, maxLength: number = 30): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Format a key-value pair for display
 */
export function formatKeyValue(key: string, value: any): void {
  const keyStr = chalk.bold(`${key}:`);
  const valueStr =
    value === undefined || value === null ? '' : value.toString();

  console.log(`${keyStr.padEnd(20)} ${valueStr}`);
}

/**
 * Print a divider line
 */
export function divider(): void {
  console.log(chalk.gray('─'.repeat(process.stdout.columns || 80)));
}
