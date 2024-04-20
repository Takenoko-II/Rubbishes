import { Player } from "@minecraft/server";

import { ActionFormData, ModalFormData, MessageFormData } from "@minecraft/server-ui";

import { Numeric } from "./Numeric";

export class ActionFormBuilder {
    #data = {
        title: "",
        body: "",
        buttons: [],
        cancelationCallbacks: {
            "UserBusy": new Set(),
            "UserClosed": new Set(),
            "Any": new Set()
        },
        callbackFn() {}
    };

    title(text) {
        if (typeof text !== "string") {
            throw new TypeError();
        }

        this.#data.title = text;

        return this;
    }

    body(...text) {
        if (!Array.isArray(text)) {
            throw new TypeError();
        }
        else if (text.some(_ => typeof _ !== "string")) {
            throw new TypeError();
        }

        this.#data.body = text.join("\n");

        return this;
    }

    button(name, a, b) {
        if (typeof name !== "string") {
            throw new TypeError();
        }

        const button = { name, callbacks: new Set() };

        this.#data.buttons.push(button);

        if (typeof a === "string" && b === undefined) {
            button.iconPath = a;
        }
        else if (typeof a === "function" && b === undefined) {
            button.callbacks.add(a);
        }
        else if (typeof a === "string" && typeof b === "function") {
            button.iconPath = a;
            button.callbacks.add(b);
        }
        else if (!(a === undefined && b === undefined)) throw new TypeError();

        return this;
    }

    onCancel(value, callbackFn) {
        if (typeof callbackFn !== "function") {
            throw new TypeError();
        }

        switch (value) {
            case "Any": {
                this.#data.cancelationCallbacks.Any.add(callbackFn);
                break;
            }
            case "UserBusy": {
                this.#data.cancelationCallbacks.UserBusy.add(callbackFn);
                break;
            }
            case "UserClosed": {
                this.#data.cancelationCallbacks.UserClosed.add(callbackFn);
                break;
            }
            default: throw new Error();
        }

        return this;
    }

    show(player) {
        if (!(player instanceof Player)) {
            throw new TypeError();
        }

        if (this.#data.title === undefined) {
            throw new Error("unset title");
        }

        const form = new ActionFormData()
        .title(this.#data.title);

        if (this.#data.body !== undefined) {
            form.body(this.#data.body);
        }

        for (const button of this.#data.buttons) {
            form.button(button.name, button.iconPath);
        }

        form.show(player).then(response => {
            if (response.selection === undefined) {
                this.#data.cancelationCallbacks.Any.forEach(callbackFn => {
                    callbackFn(player);
                });

                if (response.cancelationReason === "UserBusy") {
                    this.#data.cancelationCallbacks.UserBusy.forEach(callbackFn => {
                        callbackFn(player);
                    });
                }
                else if (response.cancelationReason === "UserClosed") {
                    this.#data.cancelationCallbacks.UserClosed.forEach(callbackFn => {
                        callbackFn(player);
                    });
                }

                return;
            }

            const button = this.#data.buttons[response.selection];

            if (button.callbacks.size > 0) {
                button.callbacks.forEach(callbackFn => {
                    callbackFn(player);
                });
            }

            this.#data.callbackFn({ buttonName: button.name, player });
        });
    }

    onPush(callbackFn) {
        if (typeof callbackFn !== "function") {
            throw new TypeError();
        }

        this.#data.callbackFn = callbackFn;

        return this;
    }
}

export class ModalFormBuilder {
    #data = {
        title: "",
        values: [],
        cancelationCallbacks: {
            "UserBusy": new Set(),
            "UserClosed": new Set(),
            "Any": new Set()
        },
        callbackFn() {}
    };

    title(text) {
        if (typeof text !== "string") {
            throw new TypeError();
        }

        this.#data.title = text;

        return this;
    }

    toggle(id, label, defaultValue = false) {
        if (typeof id !== "string") {
            throw new TypeError();
        }
        else if (typeof label !== "string") {
            throw new TypeError();
        }
        else if (typeof defaultValue !== "boolean") {
            throw new TypeError();
        }

        const toggle = { id, type: "toggle", label, defaultValue };

        this.#data.values.push(toggle);

        return this;
    }

    slider(id, label, range, step = 1, defaultValue = 0) {
        if (typeof id !== "string") {
            throw new TypeError();
        }
        else if (typeof label !== "string") {
            throw new TypeError();
        }
        else if (!(typeof range === "object" && range !== null)) {
            throw new TypeError();
        }
        else if (!(Numeric.isNumeric(range.min) && Numeric.isNumeric(range.max))) {
            throw new TypeError();
        }
        else if (!Numeric.isNumeric(step)) {
            throw new TypeError();
        }
        else if (!Numeric.isNumeric(defaultValue)) {
            throw new TypeError();
        }

        const slider = { id, type: "slider", label, range, step, defaultValue };

        this.#data.values.push(slider);

        return this;
    }

    dropdown(id, label, list, defaultValueIndex = 0) {
        if (typeof id !== "string") {
            throw new TypeError();
        }
        else if (typeof label !== "string") {
            throw new TypeError();
        }
        else if (!Array.isArray(list)) {
            throw new TypeError();
        }
        else if (list.some(_ => typeof _ !== "string")) {
            throw new TypeError();
        }
        else if (!Numeric.isNumeric(defaultValueIndex)) {
            throw new TypeError();
        }

        const dropdown = { id, type: "dropdown", label, list, defaultValueIndex };

        this.#data.values.push(dropdown);

        return this;
    }

    textField(id, label, placeHolder = "", defaultValue = "") {
        if (typeof id !== "string") {
            throw new TypeError();
        }
        else if (typeof label !== "string") {
            throw new TypeError();
        }
        else if (typeof placeHolder !== "string") {
            throw new TypeError();
        }
        else if (typeof defaultValue !== "string") {
            throw new TypeError();
        }

        const textField = { id, type: "textField", label, placeHolder, defaultValue };

        this.#data.values.push(textField);

        return this;
    }

    onCancel(value, callbackFn) {
        if (typeof callbackFn !== "function") {
            throw new TypeError();
        }

        switch (value) {
            case "Any": {
                this.#data.cancelationCallbacks.Any.add(callbackFn);
                break;
            }
            case "UserBusy": {
                this.#data.cancelationCallbacks.UserBusy.add(callbackFn);
                break;
            }
            case "UserClosed": {
                this.#data.cancelationCallbacks.UserClosed.add(callbackFn);
                break;
            }
            default: throw new Error();
        }

        return this;
    }

    onSubmit(callbackFn) {
        if (typeof callbackFn !== "function") {
            throw new TypeError();
        }

        this.#data.callbackFn = callbackFn;

        return this;
    }

    show(player) {
        if (!(player instanceof Player)) {
            throw new TypeError();
        }

        if (this.#data.title === undefined) {
            throw new Error("unset title");
        }

        const form = new ModalFormData()
        .title(this.#data.title);

        for (const value of this.#data.values) {
            switch (value.type) {
                case "toggle": {
                    form.toggle(value.label, value.defaultValue);
                    break;
                }
                case "slider": {
                    form.slider(value.label, value.range.min, value.range.max, value.step, value.defaultValue);
                    break;
                }
                case "dropdown": {
                    form.dropdown(value.label, value.list, value.defaultValueIndex);
                    break;
                }
                case "textField": {
                    form.textField(value.label, value.placeHolder, value.defaultValue);
                }
            }
        }

        form.show(player).then(response => {
            if (response.formValues === undefined) {
                this.#data.cancelationCallbacks.Any.forEach(callbackFn => {
                    callbackFn(player);
                });

                if (response.cancelationReason === "UserBusy") {
                    this.#data.cancelationCallbacks.UserBusy.forEach(callbackFn => {
                        callbackFn(player);
                    });
                }
                else if (response.cancelationReason === "UserClosed") {
                    this.#data.cancelationCallbacks.UserClosed.forEach(callbackFn => {
                        callbackFn(player);
                    });
                }

                return;
            }

            const that = this;

            const input = {
                get(id) {
                    if (typeof id !== "string") {
                        throw new TypeError();
                    }

                    const index = that.#data.values.findIndex(_ => _.id === id);
                    if (index === -1) return undefined;

                    const value = that.#data.values[index];

                    return value.type === "dropdown" ? value.list[response.formValues[index]] : response.formValues[index];
                },
                getAll() {
                    return response.formValues.map((formValue, index) => {
                        const value = that.#data.values[index];
                        return value.type === "dropdown" ? value.list[formValue] : formValue; 
                    });
                }
            };

            this.#data.callbackFn({ player, ...input });
        });
    }
}

export class MessageFormBuilder {
    #data = {
        title: "",
        body: "",
        button1: {
            name: "",
            callbacks: new Set()
        },
        button2: {
            name: "",
            callbacks: new Set()
        },
        cancelationCallbacks: {
            "UserBusy": new Set(),
            "UserClosed": new Set(),
            "Any": new Set()
        },
        callbackFn() {}
    };

    title(text) {
        if (typeof text !== "string") {
            throw new TypeError();
        }

        this.#data.title = text;

        return this;
    }

    body(...text) {
        if (!Array.isArray(text)) {
            throw new TypeError();
        }
        else if (text.some(_ => typeof _ !== "string")) {
            throw new TypeError();
        }

        this.#data.body = text.join("\n");

        return this;
    }

    button1(name, callbackFn) {
        if (typeof name !== "string") {
            throw new TypeError();
        }
        else if (callbackFn !== undefined && typeof callbackFn !== "function") {
            throw new TypeError();
        }

        this.#data.button1.name = name;
        if (callbackFn) this.#data.button1.callbacks.add(callbackFn);

        return this;
    }

    button2(name, callbackFn) {
        if (typeof name !== "string") {
            throw new TypeError();
        }
        else if (callbackFn !== undefined && typeof callbackFn !== "function") {
            throw new TypeError();
        }

        this.#data.button2.name = name;
        if (callbackFn) this.#data.button2.callbacks.add(callbackFn);

        return this;
    }

    onCancel(value, callbackFn) {
        if (typeof callbackFn !== "function") {
            throw new TypeError();
        }

        switch (value) {
            case "Any": {
                this.#data.cancelationCallbacks.Any.add(callbackFn);
                break;
            }
            case "UserBusy": {
                this.#data.cancelationCallbacks.UserBusy.add(callbackFn);
                break;
            }
            case "UserClosed": {
                this.#data.cancelationCallbacks.UserClosed.add(callbackFn);
                break;
            }
            default: throw new Error();
        }

        return this;
    }

    show(player) {
        if (!(player instanceof Player)) {
            throw new TypeError();
        }

        if (this.#data.title === undefined) {
            throw new Error("unset title");
        }

        const form = new MessageFormData()
        .title(this.#data.title);

        if (this.#data.body !== undefined) {
            form.body(this.#data.body);
        }

        form.button1(this.#data.button1.name);
        form.button2(this.#data.button2.name);

        form.show(player).then(response => {
            if (response.selection === undefined) {
                this.#data.cancelationCallbacks.Any.forEach(callbackFn => {
                    callbackFn(player);
                });

                if (response.cancelationReason === "UserBusy") {
                    this.#data.cancelationCallbacks.UserBusy.forEach(callbackFn => {
                        callbackFn(player);
                    });
                }
                else if (response.cancelationReason === "UserClosed") {
                    this.#data.cancelationCallbacks.UserClosed.forEach(callbackFn => {
                        callbackFn(player);
                    });
                }

                return;
            }

            if (response.selection === 0) {
                this.#data.button1.callbacks.forEach(callbackFn => {
                    callbackFn(player);
                });
                this.#data.callbackFn({ buttonName: this.#data.button1.name, player });
            }
            else {
                this.#data.button2.callbacks.forEach(callbackFn => {
                    callbackFn(player);
                });
                this.#data.callbackFn({ buttonName: this.#data.button2.name, player });
            }
        });
    }

    onPush(callbackFn) {
        if (typeof callbackFn !== "function") {
            throw new TypeError();
        }

        this.#data.callbackFn = callbackFn;

        return this;
    }
}