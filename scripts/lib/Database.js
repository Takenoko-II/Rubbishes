import { world } from "@minecraft/server";

class Database {
    static get(id) {
        if (typeof id !== "string") {
            throw new TypeError();
        }

        let i = 0;
        let data = {};
        while (true) {
            const property = world.getDynamicProperty(id + "." + i.toString());

            if (property === undefined) break;

            data = Object.assign(data, JSON.parse(property ?? "{}"));
            i++;
        }

        return data;
    }

    static set(id, value) {
        if (!(typeof id === "string" && typeof value === "object" && value !== null) || Array.isArray(value)) {
            throw new TypeError();
        }

        let i = 0;
        while (true) {
            const property = world.getDynamicProperty(id + "." + i.toString());

            const data = Object.assign(JSON.parse(property), value);

            try {
                world.setDynamicProperty(id + "." + i.toString(), JSON.stringify(data));
                break;
            }
            catch {
                i++;
            }
        }
    }
}
