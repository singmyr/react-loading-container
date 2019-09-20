import { PureComponent } from 'react';

const isObject = obj => {
    const type = typeof obj;
    return (type === 'function' || type === 'object') && !!obj;
};
/**
 * @todo Add correct propTypes.
 */
class LoadingContainer extends PureComponent {
    static propTypes = {};

    static defaultProps = {};

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
        const { render, promise, placeholder, loading, success, error, ...props } = this.props;
        const { status, data = {} } = this.state;

        switch (status) {
            case 0:
                return loading({ ...props });
            case 200:
                return success({ ...data, ...props });
            case 500:
                return error({ error: data, ...props });
            default:
                return placeholder({ ...props });
        }
    }
}

export default LoadingContainer;
