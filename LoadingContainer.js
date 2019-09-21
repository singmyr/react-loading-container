import { PureComponent } from 'react';
import propTypes from 'prop-types';

const isObject = obj => {
    const type = typeof obj;
    return (type === 'function' || type === 'object') && !!obj;
};

/**
 * @todo Add correct documentation for this container.
 */
class LoadingContainer extends PureComponent {
    static propTypes = {
        promise: propTypes.oneOfType([propTypes.array, propTypes.func, propTypes.object]).isRequired,
        success: propTypes.func.isRequired,
        error: propTypes.func,
        loading: propTypes.func,
        placeholder: propTypes.func,
    };

    state = {
        status: null,
        data: null,
    };

    componentDidMount() {
        this.handle(this.props.promise);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.promise !== this.props.promise) {
            this.handle(this.props.promise);
        }
    }

    handle = async p => {
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
                const data = {};
                (await Promise.all(Object.values(p))).forEach((v, i) => {
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
