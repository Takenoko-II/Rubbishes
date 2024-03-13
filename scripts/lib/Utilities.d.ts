export class Utilities {
    /**
     * 渡された値を文字列に変換します。
     * @param data 任意の値
     * @param space スペースの文字数
     */
    stringify(data: any, space?: number): string;

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
     */
    split(text: string, separator: string | RegExp): string[];

    /**
     * 値をコンテンツログに出力します。
     * @param values 任意の値
     */
    out(...values: any[]): void;
}

export const utils: Utilities;
