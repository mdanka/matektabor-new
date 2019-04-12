import * as React from "react";
import { connect } from "react-redux";
import { IAppState } from "../../store";
import { Dispatch } from "redux";
import { Select, MenuItem } from "@material-ui/core";
import { IBarkochbaOrdering } from "../../store/state";
import { selectBarkochbaOrdering } from "../../store/selectors";
import { SetBarkochbaOrdering } from "../../store/actions";

export interface IBarkochbaSortingSelectorOwnProps {}

export interface IBarkochbaSortingSelectorStateProps {
    ordering: IBarkochbaOrdering;
}

export interface IBarkochbaSortingSelectorDispatchProps {
    setOrdering: (barkochbaOrdering: IBarkochbaOrdering) => void;
}

export type IBarkochbaSortingSelectorProps = IBarkochbaSortingSelectorOwnProps &
    IBarkochbaSortingSelectorStateProps &
    IBarkochbaSortingSelectorDispatchProps;

export class UnconnectedBarkochbaSortingSelector extends React.Component<IBarkochbaSortingSelectorProps, {}> {
    public render() {
        const { ordering } = this.props;
        return (
            <div className="barkochba-sorting-selector">
                <span className="barkochba-sorting-selector-label">Rendezés:</span>
                <Select className="barkochba-sorting-selector-selector" value={ordering} onChange={this.handleChange}>
                    <MenuItem value={"storyNumber"}>Sorszám szerint</MenuItem>
                    <MenuItem value={"knowNumber"}>Aszerint, hogy hányan hallották</MenuItem>
                    <MenuItem value={"starNumber"}>Kedvelések száma szerint</MenuItem>
                </Select>
            </div>
        );
    }

    private handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const { setOrdering } = this.props;
        setOrdering(event.target.value as IBarkochbaOrdering);
    };
}

function mapStateToProps(
    state: IAppState,
    _ownProps: IBarkochbaSortingSelectorOwnProps,
): IBarkochbaSortingSelectorStateProps {
    return {
        ordering: selectBarkochbaOrdering(state),
    };
}

function mapDispatchToProps(
    dispatch: Dispatch,
    _ownProps: IBarkochbaSortingSelectorOwnProps,
): IBarkochbaSortingSelectorDispatchProps {
    return {
        setOrdering: (barkochbaOrdering: IBarkochbaOrdering) =>
            dispatch(SetBarkochbaOrdering.create({ barkochbaOrdering })),
    };
}

export const BarkochbaSortingSelector = connect(
    mapStateToProps,
    mapDispatchToProps,
)(UnconnectedBarkochbaSortingSelector);
