import { userService } from '@repo/services/user';
import { Handler } from 'aws-lambda';

export const handler: Handler = async (event) => {
    console.log('Hello world');
    console.log(userService.getUsers());

    return 'Hello world';
};
