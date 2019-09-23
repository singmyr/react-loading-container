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
 * Container that renders different components depending on the state of the promise(s) supplied.
 * 
 * @version 1.1.0-alpha
 * @author [Mattias Singmyr](https://github.com/singmyr)
 */
class LoadingContainer extends React.Component<LoadingContainerProps, LoadingContainerState> {
    static propTypes = {
        /** Component that will be rendered once the promise(s) has been fulfilled. */
        success: propTypes.oneOfType([propTypes.func, propTypes.node, propTypes.element]),
        /** Promise(s) that will determine the state of the container. */
        promise: propTypes.oneOfType([propTypes.array, propTypes.func, propTypes.object]),
        /** Component that will be rendered in the case of rejection or exception. */
        error: propTypes.oneOfType([propTypes.func, propTypes.node, propTypes.element]),
        /** Component that will be rendered prior to the promise(s) being fulfilled for the first time. */
        placeholder: propTypes.oneOfType([propTypes.func, propTypes.node, propTypes.element]),
        /** Component that will be rendered simultaneously as any of placeholder/success/error while the promise(s) is being fulfilled. */
        loading: propTypes.oneOfType([propTypes.func, propTypes.node, propTypes.element]),
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
        const { placeholder: Placeholder, loading: Loading, success: Success, error: Error } = this.props;
        const { loading, status, data = {} } = this.state;

        return (
            <Fragment>
                {loading && Loading && <Loading />}
                {status === null ? Placeholder && <Placeholder /> : (status ? Success && <Success {...data} /> : Error && <Error error={data} />)}
            </Fragment>
        )
    }
}

export default LoadingContainer;
