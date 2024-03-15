import { Tuple } from "./Tuple";

export const NumberList: NumberList;

interface NumberList {
    /**
     * 配列全体の平均値を求めます。
     * @param list 数値の配列
     */
    average(list: number[]): number;
    /**
     * 配列全体の中央値を求めます。
     * @param list 数値の配列
     */
    median(list: number[]): number;
    /**
     * 配列全体の最頻値を全て求めます。
     * @param list 配列
     */
    mode<T>(list: T[]): T[];
    /**
     * 配列全体の最小値を求めます。
     * @param list 数値の配列
     */
    min(list: number[]): number;
    /**
     * 配列全体の最大値を求めます。
     * @param list 数値の配列
     */
    max(list: number[]): number;
    /**
     * 数値の配列を作成します。
     * @param length 配列の長さ
     * @param modifier この関数の返り値が格納される
     */
    create(length?: number, modifier?: (i: number) => number): Tuple<number>;
}
