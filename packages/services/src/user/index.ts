import { IUser } from '@repo/shared/user';
import dayjs from 'dayjs';

const users: IUser[] = [
    { id: 1, firstName: 'Hoge', lastName: 'Fuga' },
    { id: 2, firstName: 'Foo', lastName: 'Bar' }
];

class UserService {
    public getUsers() {
        return users;
    }

    public getUserById(id: number) {
        return users.find((user) => user.id === id);
    }

    public getFormattedDate() {
        return dayjs().format('YYYY-MM-DD');
    }
}

export const userService = new UserService();
