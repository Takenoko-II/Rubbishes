import { Player } from "@minecraft/server";

import { Numeric, Random, utils } from "../lib/index";

export class ChatCommandBuilder {
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
    onExecute(callbackFn: (arg: ChatCommandExecuteEvent) => any): ChatCommandBuilder;

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
    execute(arg: ChatCommandExecuteEvent): any;
}

interface ChatCommandDefinitions {
    /**
     * 特定のコマンドの情報を取得します。
     * @param name コマンド名
     */
    get(name: string): ChatCommandDefinition;

    /**
     * 全てのコマンドの情報を取得します。
     */
    getAll(): ChatCommandDefinition[];
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

interface ChatCommandExecuteEvent {
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
    getAll(): ChatCommandParameterDefinition[];

    /**
     * 特定のIDの引数が有効な値であるか否かを返します。
     * @param id 引数のID
     */
    isValid(id: string): boolean;
}
