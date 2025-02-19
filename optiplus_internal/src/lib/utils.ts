export function generateRegistrationNumber(clientId: number): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    return `M/${year}/${month}/${clientId}`;
  }
  
  export function formatDateToYYYYMMDD(date: Date): string {
    return date.toISOString().split('T')[0];
  }