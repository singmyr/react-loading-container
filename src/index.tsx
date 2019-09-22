import React, { Fragment } from 'react';
import propTypes from 'prop-types';

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
    loading: boolean
    status: number|null,
    data: any,
}

/**
 * @todo Add correct documentation for this container.
 */
class LoadingContainer extends React.Component<LoadingContainerProps, LoadingContainerState> {
    static propTypes = {
        promise: propTypes.oneOfType([propTypes.array, propTypes.func, propTypes.object]),
        success: propTypes.func,
        error: propTypes.func,
        loading: propTypes.func,
        placeholder: propTypes.func,
    };

    readonly state: Readonly<LoadingContainerState> = {
        loading: false,
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
        if (!p) {
            return;
        }

        this.setState({
            loading: true,
        });

        try {
            if (p instanceof Promise) {
                this.setState({
                    loading: false,
                    status: 1,
                    data: await p,
                });
            } else if (Array.isArray(p)) {
                this.setState({
                    loading: false,
                    status: 1,
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
                    loading: false,
                    status: 1,
                    data: { ...data },
                });
            }
        } catch (e) {
            this.setState({
                loading: false,
                status: 0,
                data: e,
            });
        }
    };

    render() {
        const { promise, placeholder: Placeholder, loading: Loading, success: Success, error: Error, ...props } = this.props;
        const { loading, status, data = {} } = this.state;

        return (
            <Fragment>
                {loading && Loading && <Loading {...props } />}
                {status === null ? <Placeholder { ...props } /> : (status === 1 ? Success && <Success {...data} {...props } /> : Error && <Error error={data} {...props } />)}
            </Fragment>
        )
    }
}

export default LoadingContainer;
