import * as React from "react";
import { IAppState } from "../../store";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { Typography, TextField, Button, Paper, Select } from "@material-ui/core";

export interface IBarkochbaManageScreenOwnProps {}

export interface IBarkochbaManageScreenStateProps {}

export interface IBarkochbaManageScreenDispatchProps {}

export type IBarkochbaManageScreenProps = IBarkochbaManageScreenOwnProps &
    IBarkochbaManageScreenStateProps &
    IBarkochbaManageScreenDispatchProps;

class UnconnectedBarkochbaManageScreen extends React.Component<IBarkochbaManageScreenProps, {}> {
    public render() {
        return (
            <div>
                {this.renderPersonAdd()}
                {this.renderCampAdd()}
                {this.renderRoomEdit()}
            </div>
        );
    }

    private renderPersonAdd = () => {
        return (
            <Paper className="barkochba-manage-panel">
                <Typography variant="h5">Új gyerek</Typography>
                <TextField className="barkochba-manage-input-space" label="Név" placeholder="Tóth János" />
                <TextField className="barkochba-manage-input-space" label="Csoport" placeholder="Beluga" />
                <Button variant="contained" color="primary">
                    Létrehozás
                </Button>
            </Paper>
        );
    };

    private renderCampAdd = () => {
        return (
            <Paper className="barkochba-manage-panel">
                <Typography variant="h5">Új tábor</Typography>
                <TextField className="barkochba-manage-input-space" label="Csoport" placeholder="Beluga" />
                <TextField className="barkochba-manage-input-space" label="Szám" placeholder="3" type="number" />
                <Button variant="contained" color="primary">
                    Létrehozás
                </Button>
            </Paper>
        );
    };

    private renderRoomEdit = () => {
        return (
            <Paper className="barkochba-manage-panel">
                <Typography variant="h5">Szobabeosztás</Typography>
                <Typography className="barkochba-manage-subtitle" variant="subtitle1">
                    Melyik tábor?
                </Typography>
                <div>
                    <Select native placeholder="Beluga/3">
                        <option value="" />
                        <option value={10}>Ten</option>
                        <option value={20}>Twenty</option>
                        <option value={30}>Thirty</option>
                    </Select>
                </div>
                <Typography className="barkochba-manage-subtitle" variant="subtitle1">
                    Új szoba
                </Typography>
                <div>
                    <TextField className="barkochba-manage-input-space" label="Szobanév" placeholder="K" />
                    <Button variant="contained" color="primary">
                        Létrehozás
                    </Button>
                </div>
                <Typography className="barkochba-manage-subtitle" variant="subtitle1">
                    Melyik szoba?
                </Typography>
                <div>
                    <Select native placeholder="K">
                        <option value="" />
                        <option value={10}>Ten</option>
                        <option value={20}>Twenty</option>
                        <option value={30}>Thirty</option>
                    </Select>
                </div>
                <Typography className="barkochba-manage-subtitle" variant="subtitle1">
                    A szoba lakói
                </Typography>
                <div>{/* People selector */}</div>
            </Paper>
        );
    };
}

function mapStateToProps(
    _state: IAppState,
    _ownProps: IBarkochbaManageScreenOwnProps,
): IBarkochbaManageScreenStateProps {
    return {};
}

function mapDispatchToProps(
    _dispatch: Dispatch,
    _ownProps: IBarkochbaManageScreenOwnProps,
): IBarkochbaManageScreenDispatchProps {
    return {};
}

export const BarkochbaManageScreen = connect(
    mapStateToProps,
    mapDispatchToProps,
)(UnconnectedBarkochbaManageScreen);
