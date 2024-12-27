import { User } from '@repo/shared/user';
import { Button } from '@repo/ui/Button';
import { createSignal, onMount } from 'solid-js';
import { trpc } from './trpc.js';

export const App = () => {
    const [$user, setUser] = createSignal<User | null>(null);

    onMount(() => {
        trpc.user.getUserById.query({ id: 1 }).then((userRaw) => {
            if (!userRaw) {
                return;
            }
            const user = User.fromObject(userRaw);
            setUser(user);
        });
    });

    return (
        <div>
            <h1>My App</h1>
            <Button />
            <p>Welcome to my app!</p>
            <div>user: {$user()?.getFullName()}</div>
        </div>
    );
};
