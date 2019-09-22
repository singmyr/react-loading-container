import React from 'react';
import { render, waitForElement } from '@testing-library/react';
import LoadingContainer from './index';

describe('LoadingContainer', () => {
    it('fails to render without any props', () => {
        const container = render(<LoadingContainer />);
        expect(container.firstChild).toBe(undefined);
    });

    it('renders nothing even though it gets a promise', () => {
        const p = new Promise((resolve, reject) => {});
        const container = render(<LoadingContainer promise={p} />);
        expect(container.firstChild).toBe(undefined);
    });

    it('renders the placeholder component if the promise is null', () => {
        const { getByText } = render(<LoadingContainer promise={null} placeholder={() => <p>Placeholder</p>} />);
        expect(getByText('Placeholder').textContent).toBe('Placeholder');
    });

    it('renders the loading component until the promise is resolved, then the success component will be rendered', async () => {
        let r = null;
        const p = new Promise((resolve, reject) => {
            r = resolve;
        });
        const { getByText } = render(<LoadingContainer promise={p} loading={() => <p>Loading</p>} success={() => <p>Success</p>} />);
        expect(getByText('Loading').textContent).toBe('Loading');
        r();
        const successElement = await waitForElement(() => getByText('Success'));
        expect(successElement.textContent).toBe('Success');
    });

    it('renders the loading component until the promise is resolved, then the success component will be rendered, displaying data that was passed', async () => {
        let r = null;
        const p = new Promise((resolve, reject) => {
            r = () => {
                resolve({ one: 1 });
            };
        });
        const { getByText } = render(
            <LoadingContainer promise={p} loading={() => <p>Loading</p>} success={({ one }) => <p>Success: one = {one}</p>} />
        );
        expect(getByText('Loading').textContent).toBe('Loading');
        r();
        const successElement = await waitForElement(() => getByText(/Success/));
        expect(successElement.textContent).toBe('Success: one = 1');
    });

    it('renders the loading component until the promises (object) is resolved, then the success component will be rendered, displaying data that was passed', async () => {
        let r = [];
        const p = d =>
            new Promise((resolve, reject) => {
                r.push(() => {
                    resolve(d);
                });
            });
        const { getByText } = render(
            <LoadingContainer
                promise={{ one: p(1), two: p(2), three: p(3) }}
                loading={() => <p>Loading</p>}
                success={({ one, two, three }) => (
                    <p>
                        Success: one = {one}, two = {two}, three = {three}
                    </p>
                )}
            />
        );
        expect(getByText('Loading').textContent).toBe('Loading');
        r.forEach(resolve => resolve());
        const successElement = await waitForElement(() => getByText(/Success/));
        expect(successElement.textContent).toBe('Success: one = 1, two = 2, three = 3');
    });

    it('renders the loading component until the promises (array) is resolved, then the success component will be rendered, displaying data that was passed', async () => {
        let r = [];
        const p = d =>
            new Promise((resolve, reject) => {
                r.push(() => {
                    resolve(d);
                });
            });
        const { getByText } = render(
            <LoadingContainer
                promise={[p({ one: 1 }), p({ two: 2 }), p({ three: 3 })]}
                loading={() => <p>Loading</p>}
                success={({ data }) => (
                    <p>
                        Success: one = {data[0].one}, two = {data[1].two}, three = {data[2].three}
                    </p>
                )}
            />
        );
        expect(getByText('Loading').textContent).toBe('Loading');
        r.forEach(resolve => resolve());
        const successElement = await waitForElement(() => getByText(/Success/));
        expect(successElement.textContent).toBe('Success: one = 1, two = 2, three = 3');
    });

    it('renders the loading component until the promise is rejected, then the error component will be rendered', async () => {
        let r = null;
        const p = new Promise((resolve, reject) => {
            r = reject;
        });
        const { getByText } = render(<LoadingContainer promise={p} loading={() => <p>Loading</p>} error={() => <p>Error</p>} />);
        expect(getByText('Loading').textContent).toBe('Loading');
        r();
        const errorElement = await waitForElement(() => getByText('Error'));
        expect(errorElement.textContent).toBe('Error');
    });
});
