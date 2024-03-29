export class Utilities {
    /**
     * 渡された値を文字列に変換します。
     * @param data 任意の値
     * @param getPrototype プロトタイプを表示するか否か
     * @param space スペースの文字数
     */
    stringify(data: any, getPrototype?: boolean, space?: number): string;

    /**
     * 値をシャローコピーして返します。
     * @param value 任意の値
     */
    shallowCopy<T>(value: T): T;

    /**
     * 値をディープコピーして返します。
     * @param value 任意の値
     */
    deepCopy<T>(value: T): T;

    /**
     * 文字列をクォーテーションを考慮して区切り文字で分割します。
     * @param text 文字列
     * @param separator 区切り文字
     * @param options オプション
     */
    split(text: string, separator: string | RegExp, options: { deleteQuote?: boolean }): string[];

    /**
     * 値をコンテンツログに出力します。
     * @param values 任意の値
     */
    out(...values: any[]): void;

    /**
     * この関数が実行された場所を返します。
     */
    here(): string;

    /**
     * 値をディープコピーし、その中に格納されているすべての値を読み取り専用にして返します。
     */
    deepFreeze<T>(value: T): Readonly<T>;

    /**
     * 渡された値を文字列に変換します。
     * @param data 任意の値
     * @param getPrototype プロトタイプを表示するか否か
     * @param space スペースの文字数
     */
    stringifyWithoutColor(data: any, getPrototype?: boolean, space?: number): string;

    /**
     * math
     */
    readonly math: MathUtilities;
}

interface MathUtilities {
    /**
     * 
     */
    radian(degree: number): number;

    /**
     * 
     */
    degree(radian: number): number;
}

export const utils: Utilities;
