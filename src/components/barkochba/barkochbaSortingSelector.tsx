import * as React from "react";
import { connect } from "react-redux";
import { IAppState } from "../../store";
import { Dispatch } from "redux";
import { Select, MenuItem, SelectChangeEvent } from "@mui/material";
import { IBarkochbaOrdering } from "../../store/state";
import { selectBarkochbaOrdering } from "../../store/selectors";
import { SetBarkochbaOrdering } from "../../store/actions";
import css from "./barkochbaSortingSelector.module.scss";

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
            <Select
                variant="standard"
                className={css.barkochbaSortingSelector}
                value={ordering}
                onChange={this.handleChange}>
                <MenuItem value={"storyNumber"}>Sorszám</MenuItem>
                <MenuItem value={"knowNumber"}>Hányan hallották</MenuItem>
                <MenuItem value={"starNumber"}>Kedvelések száma</MenuItem>
            </Select>
        );
    }

    private handleChange = (event: SelectChangeEvent<"storyNumber" | "knowNumber" | "starNumber">) => {
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
