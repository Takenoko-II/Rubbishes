interface Object {
    /**
     * 値をコンテンツログに出力します。
     */
    cons(): void;

    /**
     * 値をチャットに出力します。
     */
    chat(): void;
}

interface String {
    /**
     * 値をコンテンツログに出力します。
     */
    cons(): void;

    /**
     * 値をチャットに出力します。
     */
    chat(): void;
}

interface Number {
    /**
     * 値をコンテンツログに出力します。
     */
    cons(): void;

    /**
     * 値をチャットに出力します。
     */
    chat(): void;
}

interface Array<T> {
    /**
     * 値をコンテンツログに出力します。
     */
    cons<T>(): void;

    /**
     * 値をチャットに出力します。
     */
    chat<T>(): void;
}

interface Boolean {
    /**
     * 値をコンテンツログに出力します。
     */
    cons(): void;

    /**
     * 値をチャットに出力します。
     */
    chat(): void;
}

interface Function {
    /**
     * 値をコンテンツログに出力します。
     */
    cons(): void;

    /**
     * 値をチャットに出力します。
     */
    chat(): void;
}

interface RegExp {
    /**
     * 値をコンテンツログに出力します。
     */
    cons(): void;

    /**
     * 値をチャットに出力します。
     */
    chat(): void;
}
