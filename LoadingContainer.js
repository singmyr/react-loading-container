import { PureComponent } from 'react';

const isObject = obj => {
    const type = typeof obj;
    return (type === 'function' || type === 'object') && !!obj;
};
/**
 * @todo: Add correct propTypes.
 * @todo: Add support for sending in promises in an object.
 *        The prop into the success component will match the key in the object.
 * @todo: Add support for sending in an array with promises and wait for all of them before proceeding.
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

    handle = p => {
        this.setState({
            status: 0,
            data: null,
        });

        if (p instanceof Promise) {
            console.log('Promise');
            p.then(d => {
                this.setState({
                    status: 200,
                    data: d,
                });
            }).catch(e => {
                this.setState({
                    status: 500,
                    data: e,
                });
            });
        } else if (Array.isArray(p)) {
            // @todo: Implement.
            console.log('Array');
        } else if (isObject(p)) {
            // @todo: Implement.
            console.log('Object');
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
