import * as React from "react";
import { StoryBrowser } from "./storyBrowser";
import { StoryPanel } from "./storyPanel";
import { Typography } from "@material-ui/core";

export interface IBarkochbaScreenProps {}

export class BarkochbaScreen extends React.Component<IBarkochbaScreenProps, {}> {
    public render() {
        return (
            <div className="barkochba-screen">
                <div className="barkochba-screen-row-header">
                    <div className="barkochba-screen-info">
                        <Typography variant="title" paragraph={true}>
                            Nekik mesélek:
                        </Typography>
                        <Typography variant="body1" paragraph={true}>
                            Válaszd ki a tábort és a szobát, vagy írd be azon gyerekek neveit, akiknek mesélni
                            szeretnél. Ezután a listában színesek lesznek azok a barkochbatörténetek, amiket valamelyik
                            gyerek már hallotta.
                        </Typography>
                    </div>
                    <div className="barkochba-screen-person-selector">Selector</div>
                </div>
                <div className="barkochba-screen-row-main">
                    <div className="barkochba-screen-browser">
                        <StoryBrowser />
                    </div>
                    <div className="barkochba-screen-panel">
                        <StoryPanel />
                    </div>
                </div>
            </div>
        );
    }
}
