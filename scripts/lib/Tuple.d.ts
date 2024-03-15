export class Tuple<T> extends Array<T> {
    /**
     * @param arrayLength length of array
     */
    constructor(arrayLength?: number);

    /**
     * @param arrayLength length of array
     */
    constructor(arrayLength: number);

    /**
     * @param items elements of array
     */
    constructor(...items: any[]);

    override readonly length: number;

    /**
     * Creates an array from an array-like object.
     * @param arrayLike An array-like object to convert to an array.
     */
    static override from<T>(arrayLike: ArrayLike<T>): Tuple<T>;

    /**
     * Creates an array from an iterable object.
     * @param arrayLike An array-like object to convert to an array.
     * @param mapfn A mapping function to call on every element of the array.
     * @param thisArg Value of 'this' used to invoke the mapfn.
     */
    static override from<T, U>(arrayLike: ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: any): Tuple<U>;

    static isTuple(arg: any): arg is any[];

    static readonly prototype;
}
