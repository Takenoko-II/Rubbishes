import { Player } from "@minecraft/server";

import { NumberRange } from "./NumberRange";

export class ActionFormBuilder {
    /**
     * フォームのタイトルを変更します。
     * @param text タイトル
     */
    title(text: string): ActionFormBuilder;

    /**
     * フォームの本文を変更します。
     * @param text 本文
     */
    body(...text: string[]): ActionFormBuilder;

    /**
     * フォームにボタンを追加します。
     * @param name ボタンの名前
     * @param iconPath ボタンのアイコンのテクスチャパス
     */
    button(name: string, iconPath?: string): ActionFormButtonPushEventSignal;

    /**
     * フォームが閉じたとき発火するイベント
     */
    readonly cancelation: ActionFormCancelEventSignal;

    /**
     * ボタンを押した際に発火するイベントのコールバックを登録します。
     * @param callbackFn コールバック関数
     */
    onPush(callbackFn: (player: ServerFormButtonPushEvent) => void): ActionFormBuilder;

    /**
     * フォームを表示します。
     * @param player プレイヤー
     */
    show(player: Player): void;
}

interface ActionFormButtonPushEventSignal {
    /**
     * このボタンを押した際に呼び出されるコールバックを登録します。
     * @param callbackFn コールバック関数
     */
    on(callbackFn: (player: Player) => void): ActionFormBuilder;

    /**
     * このボタンを押した際に呼び出されるコールバックをの登録を解除します。
     * @param callbackFn コールバック関数
     */
    off(callbackFn: (player: Player) => void): ActionFormBuilder;

    /**
     * このボタンを押した際の処理の定義を通過します。
     */
    readonly pass: ActionFormBuilder;
}

interface ActionFormCancelEventSignal {
    /**
     * フォームが閉じられた際に呼び出されるコールバック関数を登録します。
     * @param value 閉じた要因
     * @param callbackFn コールバック関数
     */
    on(value: "Any" | "UserBusy" | "UserClosed", callbackFn: (player: Player) => void): ActionFormBuilder;

    /**
     * フォームが閉じられた際に呼び出されるコールバック関数の登録を解除します。
     * @param callbackFn コールバック関数
     */
    off(callbackFn: (player: Player) => void): ActionFormBuilder;
}

export class ModalFormBuilder {
    /**
     * フォームのタイトルを変更します。
     * @param text タイトル
     */
    title(text: string): ModalFormBuilder;

    /**
     * フォームにトグルを追加します。
     * @param id ID
     * @param label トグルのラベル
     * @param defaultValue デフォルト値
     */
    toggle(id: string, label: string, defaultValue?: boolean): ModalFormBuilder;

    /**
     * フォームにスライダーを追加します。
     * @param id ID
     * @param label スライダーのラベル
     * @param range スライダーの範囲
     * @param step スライダーの間隔
     * @param defaultValue デフォルト値
     */
    slider(id: string, label: string, range: NumberRange, step?: number, defaultValue?: number): ModalFormBuilder;

    /**
     * フォームにドロップダウンを追加します。
     * @param id ID
     * @param label ドロップダウンのラベル
     * @param list ドロップダウンのリスト
     * @param defaultValueIndex デフォルトのインデックス
     */
    dropdown(id: string, label: string, list: string[], defaultValueIndex?: number): ModalFormBuilder;

    /**
     * フォームにテキストフィールドを追加します。
     * @param id ID
     * @param label テキストフィールドのラベル
     * @param placeHolder テキストフィールドのプレイスホルダー
     * @param defaultValue デフォルト値
     */
    textField(id: string, label: string, placeHolder: string, defaultValue?: string): ModalFormBuilder;

    /**
     * フォームが閉じたとき発火するイベント
     */
    readonly cancelation: ModalFormCancelEventSignal;

    /**
     * フォームの入力が送信された際に発火するイベントのコールバックを登録します。
     * @param callbackFn コールバック関数
     */
    onSubmit(callbackFn: (arg: ModalFormSubmitEvent) => void): ModalFormBuilder;

    /**
     * フォームを表示します。
     * @param player プレイヤー
     */
    show(player: Player): void;
}

interface ModalFormSubmitEvent {
    /**
     * プレイヤー
     */
    readonly player: Player;

    /**
     * 入力された値を返します。
     */
    get(id: string): string | boolean | number;

    /**
     * 入力された値をすべて返します。
     */
    getAll(): (string | boolean | number)[];
}

interface ModalFormCancelEventSignal {
    /**
     * フォームが閉じられた際に呼び出されるコールバック関数を登録します。
     * @param value 閉じた要因
     * @param callbackFn コールバック関数
     */
    on(value: "Any" | "UserBusy" | "UserClosed", callbackFn: (player: Player) => void): ModalFormBuilder;

    /**
     * フォームが閉じられた際に呼び出されるコールバック関数の登録を解除します。
     * @param callbackFn コールバック関数
     */
    off(callbackFn: (player: Player) => void): ModalFormBuilder;
}

export class MessageFormBuilder {
    /**
     * フォームのタイトルを変更します。
     * @param text タイトル
     */
    title(text: string): MessageFormBuilder;

    /**
     * フォームの本文を変更します。
     * @param text 本文
     */
    body(...text: string[]): MessageFormBuilder;

    /**
     * フォームにボタン1を追加します。
     * @param name ボタンの名前
     * @param callbackFn コールバック関数
     */
    button1(name: string, callbackFn?: (player: Player) => void): MessageFormBuilder;

    /**
     * フォームにボタン2を追加します。
     * @param name ボタンの名前
     * @param callbackFn コールバック関数
     */
    button2(name: string, callbackFn?: (player: Player) => void): MessageFormBuilder;

    /**
     * フォームが閉じたとき発火するイベント
     */
    readonly cancelation: MessageFormCancelEventSignal;

    /**
     * ボタンを押した際に発火するイベントのコールバックを登録します。
     * @param callbackFn コールバック関数
     */
    onPush(callbackFn: (player: ServerFormButtonPushEvent) => void): MessageFormBuilder;

    /**
     * フォームを表示します。
     * @param player プレイヤー
     */
    show(player: Player): void;
}

interface MessageFormCancelEventSignal {
    /**
     * フォームが閉じられた際に呼び出されるコールバック関数を登録します。
     * @param value 閉じた要因
     * @param callbackFn コールバック関数
     */
    on(value: "Any" | "UserBusy" | "UserClosed", callbackFn: (player: Player) => void): MessageFormBuilder;

    /**
     * フォームが閉じられた際に呼び出されるコールバック関数の登録を解除します。
     * @param callbackFn コールバック関数
     */
    off(callbackFn: (player: Player) => void): MessageFormBuilder;
}

interface ServerFormButtonPushEvent {
    /**
     * プレイヤー
     */
    readonly player: Player;

    /**
     * ボタンの名前
     */
    readonly buttonName: string;
}
