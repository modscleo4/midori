/**
 * Provides a hash function for strings.
 */
export default abstract class Hash {
    /**
     * Creates a hash from the specified string.
     */
    abstract hash(data: string, options?: { salt?: string, cost?: number; }): string;

    /**
     * Compares the specified hash with the specified string.
     */
    abstract verify(hash: string, data: string): boolean;
}
