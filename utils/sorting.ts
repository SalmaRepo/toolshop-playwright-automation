export function sortedAZ(values: string[]): string[] {
  return [...values].sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );
}

export function sortedNumbers(values:number[]):number[]{
  return [...values].sort((a,b)=>b-a)
}