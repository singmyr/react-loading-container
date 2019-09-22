import * as React from 'react';
import * as propTypes from 'prop-types';

const isObject = (obj: any): boolean => {
    const type = typeof obj;
    return (type === 'function' || type === 'object') && !!obj;
};

interface LoadingContainerProps {
    promise: any,
    placeholder: Function,
    loading: Function,
    success: Function,
    error: Function,
};

interface LoadingContainerState {
    status: number|null,
    data: any,
}

/**
 * @todo Add correct documentation for this container.
 */
class LoadingContainer extends React.Component<LoadingContainerProps, LoadingContainerState> {
    static propTypes = {
        promise: propTypes.oneOfType([propTypes.array, propTypes.func, propTypes.object]).isRequired,
        success: propTypes.func.isRequired,
        error: propTypes.func,
        loading: propTypes.func,
        placeholder: propTypes.func,
    };

    readonly state: Readonly<LoadingContainerState> = {
        status: null,
        data: null,
    }

    componentDidMount() {
        this.handle(this.props.promise);
    }

    componentDidUpdate(prevProps: LoadingContainerProps) {
        if (prevProps.promise !== this.props.promise) {
            this.handle(this.props.promise);
        }
    }

    handle = async (p: any) => {
        this.setState({
            status: 0,
            data: null,
        });

        try {
            if (p instanceof Promise) {
                this.setState({
                    status: 200,
                    data: await p,
                });
            } else if (Array.isArray(p)) {
                this.setState({
                    status: 200,
                    data: { data: await Promise.all(p) },
                });
            } else if (isObject(p)) {
                // This works but I'm not sure about this solution.
                // I believe this can be improved, but that is for another day.
                // Need to measure it to be sure.
                const keys = Object.keys(p);
                const data: { [key: string]: any } = {};
                const promises = [];
                for (let k in p) {
                    if (p.hasOwnProperty(k)) {
                        promises.push(p[k]);
                    }
                }
                (await Promise.all(promises)).forEach((v, i) => {
                    data[keys[i]] = v;
                });

                this.setState({
                    status: 200,
                    data: { ...data },
                });
            }
        } catch (e) {
            this.setState({
                status: 500,
                data: e,
            });
        }
    };

    render() {
        const { promise, placeholder, loading, success, error, ...props } = this.props;
        const { status, data = {} } = this.state;

        switch (status) {
            case 0:
                return (loading && loading({ ...props })) || null;
            case 200:
                return (success && success({ ...data, ...props })) || null;
            case 500:
                return (error && error({ error: data, ...props })) || null;
            default:
                return (placeholder && placeholder({ ...props })) || null;
        }
    }
}

export default LoadingContainer;
