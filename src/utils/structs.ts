export class PrefetchedArray<T> extends Array<T> {
  loadedLength = 0

  load (...items: T[]): number {
    this.splice(this.loadedLength, items.length, ...items)
    this.loadedLength += items.length
    return this.length
  }
}
