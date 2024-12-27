/**
 * フロントエンドでも使えるインターフェイスやクラスはここに定義する
 */

export interface IUser {
    id: number;
    firstName: string;
    lastName: string;
}

export class User implements IUser {
    id: number;
    firstName: string;
    lastName: string;

    constructor(args: IUser) {
        this.id = args.id;
        this.firstName = args.firstName;
        this.lastName = args.lastName;
    }

    static fromObject(obj: IUser) {
        return new User(obj);
    }

    public getFullName() {
        return `${this.firstName} ${this.lastName}`;
    }
}
