import { BlockAreaSize, Dimension, world } from "@minecraft/server";

import { MultiDimensionalVector } from "./MultiDimensionalVector";

import { Numeric } from "./index";

export class CuboidArea {
    constructor(a, b) {
        if (MultiDimensionalVector.isVector3(a) && MultiDimensionalVector.isVector3(b)) {
            this.min = new MultiDimensionalVector(a).calc(b, Math.min);
            this.max = new MultiDimensionalVector(a).calc(b, Math.max);
        }
        else if (MultiDimensionalVector.isVector3(a) && Numeric.isNumeric(b)) {
            if (b < 0) {
                throw new RangeError();
            }

            this.min = new MultiDimensionalVector(a).subtract({ x: b, y: b, z: b });
            this.max = new MultiDimensionalVector(a).add({ x: b, y: b, z: b });
        }
        else throw new TypeError();
    }

    get length() {
        return {
            x: this.max.x - this.min.x,
            y: this.max.y - this.min.y,
            z: this.max.z - this.min.z
        };
    }

    get center() {
        return new MultiDimensionalVector({
            x: (this.min.x + this.max.x) / 2,
            y: (this.min.y + this.max.y) / 2,
            z: (this.min.z + this.max.z) / 2,
        });
    }

    get volume() {
        return this.length.x * this.length.y * this.length.z;
    }

    get isCube() {
        const { x, y, z } = this.length;

        if (x === y && y === z) return true;
        else return false;
    }

    move(direction) {
        if (!MultiDimensionalVector.isVector3(direction)) {
            throw new TypeError();
        }

        this.min = this.min.add(direction);
        this.max = this.max.add(direction);

        return this;
    }

    isInside(vector) {
        if (!MultiDimensionalVector.isVector3(vector)) {
            throw new TypeError();
        }

        const { x, y, z } = vector;
        const { x: minX, y: minY, z: minZ } = this.min;
        const { x: maxX, y: maxY, z: maxZ } = this.max;

        if (x >= minX && y >= minY && z >= minZ && x <= maxX && y <= maxY && z <= maxZ) {
            return true;
        }
        else {
            return false;
        }
    }

    align() {
        const { x: minX, y: minY, z: minZ } = this.min;
        const { x: maxX, y: maxY, z: maxZ } = this.max;

        const vec1 = { x: Math.floor(minX), y: Math.floor(minY), z: Math.floor(minZ) };
        const vec2 = { x: Math.ceil(maxX), y: Math.ceil(maxY), z: Math.ceil(maxZ) };

        return new CuboidArea(vec1, vec2);
    }

    outline(step = 0.5) {
        if (!Numeric.isNumeric(step)) {
            throw new TypeError();
        }
        if (step <= 0) {
            throw new RangeError("引数は0より大きい値である必要があります");
        }

        const { min, max } = this;
        const vectors = [];

        for (let x = min.x; x <= max.x; x += step) {
            vectors.push({ x, y: min.y, z: min.z }, { x, y: min.y, z: max.z }, { x, y: max.y, z: min.z }, { x, y: max.y, z: max.z });
        }

        for (let y = min.y; y <= max.y; y += step) {
            vectors.push({ x: min.x, y, z: min.z }, { x: min.x, y, z: max.z }, { x: max.x, y, z: min.z }, { x: max.x, y, z: max.z });
        }

        for (let z = min.z; z <= max.z; z += step) {
            vectors.push({ x: min.x, y: min.y, z }, { x: min.x, y: max.y, z }, { x: max.x, y: min.y, z }, { x: max.x, y: max.y, z });
        }

        return vectors.map(vec => new MultiDimensionalVector(vec));
    }

    getInsideEntities(dimension = world.getDimension("overworld"), options = {}) {
        if (!(dimension instanceof Dimension)) {
            throw new TypeError();
        }
        if (typeof options !== "object") {
            throw new TypeError();
        }

        const list = dimension.getEntities({ ...options, location: this.min, volume: new BlockAreaSize(this.length.x, this.length.y, this.length.z) });

        return list;
    }

    getInsideBlocks(dimension = world.getDimension("overworld")) {
        if (!(dimension instanceof Dimension)) {
            throw new TypeError();
        }

        const list = [];

        for (let x = this.min.x; x <= this.max.x; x++) {
            for (let y = this.min.y; y <= this.max.y; y++) {
                for (let z = this.min.z; z <= this.max.z; z++) {
                    try {
                        list.push(dimension.getBlock({ x, y, z }));
                    }
                    catch {}
                }
            }
        }

        return list;
    }
}
