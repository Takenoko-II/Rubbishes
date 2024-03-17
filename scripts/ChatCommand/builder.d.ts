import { Player } from "@minecraft/server";

export class ChatCommandBuilder {
    private constructor();

    /**
     * 権限レベルを設定します。
     */
    setPermissionLevel(level: number): ChatCommandBuilder;

    /**
     * 厳格モードをオンにします。
     */
    setStrictMode(): ChatCommandBuilder;

    /**
     * 引数
     */
    readonly parameters: ChatCommandParameterRegisterer;

    /**
     * 実行時に呼び出される関数を定義します。
     */
    onExecute(callbackFn: (arg: ChatCommandOnExecuteInfo) => any): ChatCommandBuilder;

    /**
     * コマンドを登録します。
     * @param name コマンド名
     */
    static register(name: string): ChatCommandBuilder;

    /**
     * コマンドを実行し、実行の開始に成功したかを返します。
     * @param executor 実行者
     * @param commandString コマンド
     */
    static execute(executor: Player, commandString: string): boolean;

    /**
     * 登録されたコマンド
     */
    static readonly commands: ChatCommandDefinitions;

    static readonly prototype: ChatCommandBuilder;
}

interface ChatCommandParameterRegisterer {
    /**
     * 引数を定義します。
     * @param id 引数のID
     * @param options 引数のオプション
     */
    define(id: string, options?: ChatCommandParameterRegisterationOptions): ChatCommandBuilder;
}

interface ChatCommandParameterRegisterationOptions {
    /**
     * 引数の型
     */
    type?: "any" | "string" | "number" | "boolean" | "object" | "symbol" | "undefined";

    /**
     * 省略可能引数か否か
     */
    isOptional?: boolean;

    /**
     * デフォルト値
     */
    defaultValue?: any;
}

interface ChatCommandDefinition {
    /**
     * コマンド名
     */
    name: string;

    /**
     * 権限レベル
     */
    permission: number;

    /**
     * 厳格モードであるか否か
     */
    isStrict: boolean;

    /**
     * 引数
     */
    readonly parameters: ChatCommandParameterDefinition[];

    /**
     * 実行時に呼び出される関数
     */
    execute(arg: ChatCommandOnExecuteInfo): any;
    
    /**
     * 凍結した定義オブジェクトを返します。
     */
    frozen(): ChatCommandDefinitionFrozen;
}

interface ChatCommandDefinitions {
    /**
     * 特定のコマンドの情報を取得します。
     * @param name コマンド名
     */
    get(name: string): ChatCommandDefinition | undefined;

    /**
     * 全てのコマンドの情報を取得します。
     */
    getAll(): ChatCommandDefinition[];

    /**
     * コマンドが実行された際に呼び出されるコールバック関数を登録します。
     */
    on<T extends (arg: ChatCommandExecuteEvent) => void>(callbackFn: T): T;

    /**
     * コマンドが実行された際に呼び出されるコールバック関数の登録を解除します。
     */
    off<T extends (arg: ChatCommandExecuteEvent) => void>(callbackFn: T): T;
}

interface ChatCommandParameterDefinition {
    /**
     * 引数のID
     */
    id: string;

    /**
     * 引数の型
     */
    type: "any" | "string" | "number" | "boolean" | "object" | "symbol" | "undefined";

    /**
     * 省略可能引数か否か
     */
    isOptional: boolean;

    /**
     * デフォルト値
     */
    defaultValue?: any;
}

interface ChatCommandOnExecuteInfo {
    /**
     * コマンド名
     */
    readonly name: string;

    /**
     * 実行者
     */
    readonly player: Player;

    /**
     * 引数
     */
    readonly parameters: ChatCommandParameters;

    /**
     * 実行結果を送信するか否か
     */
    sendOutput: boolean;

    /**
     * 実行結果を失敗として送信するか否か
     */
    fail: boolean;

    /**
     * 実行結果にオブジェクトのプロトタイプも表示するか否か
     */
    showPrototype: boolean;
}

interface ChatCommandParameters {
    /**
     * 特定のIDの引数を取得します。
     * @param id 引数のID
     */
    get(id: string): string | number | boolean | object | symbol | undefined;

    /**
     * 渡されたすべての引数を取得します。
     */
    getAll(): ChatCommandParameter[];

    /**
     * 特定のIDの引数が有効な値であるか否かを返します。
     * @param id 引数のID
     */
    isValid(id: string): boolean;
}

interface ChatCommandParameter {
    /**
     * 引数のID
     */
    readonly id: string;

    /**
     * 引数に渡された値
     */
    readonly value: string | number | boolean | object | symbol | undefined;
}

interface ChatCommandExecuteEvent {
    /**
     * 実行時の情報
     */
    readonly onExecuteInfo: ChatCommandOnExecuteInfo;

    /**
     * 定義に関する情報
     */
    readonly definition: ChatCommandDefinition;

    /**
     * コールバックの実行をキャンセルするか否か
     */
    cancel: boolean;
}

interface ChatCommandDefinitionFrozen {
    /**
     * コマンド名
     */
    readonly name: string;

    /**
     * 権限レベル
     */
    readonly permission: number;

    /**
     * 厳格モードであるか否か
     */
    readonly isStrict: boolean;

    /**
     * 引数
     */
    readonly parameters: Readonly<ChatCommandParameterDefinitionFrozen[]>;

    /**
     * 実行時に呼び出される関数
     */
    execute(arg: ChatCommandOnExecuteInfo): any;
}

interface ChatCommandParameterDefinitionFrozen {
    /**
     * 引数のID
     */
    readonly id: string;

    /**
     * 引数の型
     */
    readonly type: "any" | "string" | "number" | "boolean" | "object" | "symbol" | "undefined";

    /**
     * 省略可能引数か否か
     */
    readonly isOptional: boolean;

    /**
     * デフォルト値
     */
    readonly defaultValue?: any;
}
