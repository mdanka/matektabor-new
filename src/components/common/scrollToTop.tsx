import * as React from "react";
import { RouteComponentProps } from "react-router";
import { withRouter } from "react-router-dom";

export interface IScrollToTopProps extends RouteComponentProps<any> {}

class ScrollToTopWithoutProps extends React.PureComponent<IScrollToTopProps, {}> {
    public componentDidUpdate(prevProps: IScrollToTopProps) {
        if (this.props.location !== prevProps.location) {
            window.scrollTo(0, 0);
        }
    }

    render() {
        return this.props.children;
    }
}

export const ScrollToTop = withRouter(ScrollToTopWithoutProps);
