import * as React from "react";
import { IAppState, IBarkochbaManageState, selectBarkochbaManageState, SetBarkochbaManageState } from "../../store";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { Typography, TextField, Button, Paper, Select } from "@material-ui/core";
import { getGlobalServices } from "../../services";
import { IPersonApi, ICampApi } from "../../commons";

export interface IBarkochbaManageScreenOwnProps {}

export interface IBarkochbaManageScreenStateProps {
    manageState: IBarkochbaManageState;
}

export interface IBarkochbaManageScreenDispatchProps {
    update: (fields: Partial<IBarkochbaManageState>) => void;
}

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
        const { manageState } = this.props;
        const { newPersonName, newPersonGroup } = manageState;
        return (
            <Paper className="barkochba-manage-panel">
                <Typography variant="h5">Új gyerek</Typography>
                <TextField
                    value={newPersonName}
                    onChange={this.getTextFieldUpdater("newPersonName")}
                    className="barkochba-manage-input-space"
                    label="Név"
                    placeholder="Tóth János"
                />
                <TextField
                    value={newPersonGroup}
                    onChange={this.getTextFieldUpdater("newPersonGroup")}
                    className="barkochba-manage-input-space"
                    label="Csoport"
                    placeholder="Beluga"
                />
                <Button variant="contained" color="primary" onClick={this.handleNewPersonAdd}>
                    Létrehozás
                </Button>
            </Paper>
        );
    };

    private renderCampAdd = () => {
        const { manageState } = this.props;
        const { newCampGroup, newCampNumber } = manageState;
        return (
            <Paper className="barkochba-manage-panel">
                <Typography variant="h5">Új tábor</Typography>
                <TextField
                    value={newCampGroup}
                    onChange={this.getTextFieldUpdater("newCampGroup")}
                    className="barkochba-manage-input-space"
                    label="Csoport"
                    placeholder="Beluga"
                />
                <TextField
                    value={newCampNumber}
                    onChange={this.getTextFieldUpdater("newCampNumber")}
                    className="barkochba-manage-input-space"
                    label="Szám"
                    placeholder="3"
                    type="number"
                />
                <Button variant="contained" color="primary" onClick={this.handleNewCampAdd}>
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

    private getTextFieldUpdater = (fieldName: keyof IBarkochbaManageState) => (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => {
        const { update } = this.props;
        const value = event.target.value;
        update({ [fieldName]: value });
    };

    private handleNewPersonAdd = () => {
        const { manageState, update } = this.props;
        const { newPersonName, newPersonGroup } = manageState;
        if (newPersonName === "" || newPersonGroup === "") {
            console.error("Nem lehet személyt létrehozni üres névvel vagy csoporttal.");
            return;
        }
        const newPerson: IPersonApi = {
            name: newPersonName,
            group: newPersonGroup,
        };
        const globalServices = getGlobalServices();
        if (globalServices === undefined) {
            return;
        }
        const { dataService } = globalServices;
        dataService.createPerson(newPerson);
        update({ newPersonName: "", newPersonGroup: "" });
    };

    private handleNewCampAdd = () => {
        const { manageState, update } = this.props;
        const { newCampGroup, newCampNumber } = manageState;
        const newCampNumberParsed = parseInt(newCampNumber);
        if (isNaN(newCampNumberParsed)) {
            console.error("A tábor számának - meglepetés - számnak kell lennie.");
            return;
        }
        if (newCampGroup === "" || newCampNumber === "" || newCampNumberParsed < 0) {
            console.error("Nem lehet tábort létrehozni üres névvel vagy számmal, és negatív számmal sem.");
            return;
        }
        const newCamp: ICampApi = {
            group: newCampGroup,
            number: newCampNumberParsed,
            rooms: {},
        };
        const globalServices = getGlobalServices();
        if (globalServices === undefined) {
            return;
        }
        const { dataService } = globalServices;
        dataService.createCamp(newCamp);
        update({ newCampGroup: "", newCampNumber: "" });
    };
}

function mapStateToProps(
    state: IAppState,
    _ownProps: IBarkochbaManageScreenOwnProps,
): IBarkochbaManageScreenStateProps {
    return {
        manageState: selectBarkochbaManageState(state),
    };
}

function mapDispatchToProps(
    dispatch: Dispatch,
    _ownProps: IBarkochbaManageScreenOwnProps,
): IBarkochbaManageScreenDispatchProps {
    return {
        update: (fields: Partial<IBarkochbaManageState>) => {
            dispatch(SetBarkochbaManageState.create(fields));
        },
    };
}

export const BarkochbaManageScreen = connect(
    mapStateToProps,
    mapDispatchToProps,
)(UnconnectedBarkochbaManageScreen);
