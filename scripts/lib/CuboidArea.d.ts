import { Dimension, Entity, Vector3, EntityQueryOptions, Block } from "@minecraft/server";

import { MultiDimensionalVector } from "./MultiDimensionalVector";

export class CuboidArea {
    /**
     * 2座標を頂点とした直方体の範囲を作成します。
     * @param start 始点座標
     * @param end 終点座標
     */
    constructor(start: Vector3, end: Vector3);

    /**
     * 中心から6方向に任意長伸ばした立方体の範囲を作成します。
     * @param center 中心座標
     * @param length 中心からの距離
     */
    constructor(center: Vector3, length: number);

    /**
     * 範囲内の最小の座標
     */
    readonly min: MultiDimensionalVector;

    /**
     * 範囲内の最大の座標
     */
    readonly max: MultiDimensionalVector;

    /**
     * 範囲をなす直方体のx, y, zそれぞれの長さ
     */
    readonly length: CuboidAreaLength;

    /**
     * 範囲の中心となる座標
     */
    readonly center: MultiDimensionalVector;

    /**
     * 範囲の体積
     */
    readonly volume: number;

    /**
     * 範囲が立方体の形をしているか否か
     */
    readonly isCube: boolean;

    /**
     * 範囲を大きさを維持したまま移動させます。
     * @param direction 移動する方向と量
     */
    move(direction: Vector3): CuboidArea;

    /**
     * 座標が範囲内にあるかどうかを返します。
     * @param vector ベクトル
     */
    isInside(vector: Vector3): boolean;

    /**
     * 範囲の小数点以下を切り捨て・切り上げ、「座標の表示」に合った結果を返すように整形します。
     */
    align(): CuboidArea;

    /**
     * 範囲の外枠を取得します。
     * @param step ベクトル同士の間隔
     */
    outline(step?: number): MultiDimensionalVector[];

    /**
     * 範囲内のエンティティをすべて取得します。
     * @param dimension 参照するディメンション
     * @param options エンティティの条件
     */
    getInsideEntities(dimension?: Dimension, options?: EntityQueryOptions): Entity[];

    /**
     * 範囲内のブロックをすべて取得します。
     * @param dimension 参照するディメンション
     */
    getInsideBlocks(dimension?: Dimension): Block[];

    static readonly prototype: CuboidArea;
}

interface CuboidAreaLength {
    /**
     * x軸方向の長さ
     */
    readonly x: number;
    /**
     * y軸方向の長さ
     */
    readonly y: number;
    /**
     * z軸方向の長さ
     */
    readonly z: number;
}
