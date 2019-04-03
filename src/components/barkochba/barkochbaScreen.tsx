import * as React from "react";
import { StoryBrowser } from ".";

export interface IBarkochbaScreenProps {}

export class BarkochbaScreen extends React.Component<IBarkochbaScreenProps, {}> {
    public render() {
        return (
            <div className="barkochba-screen">
                <StoryBrowser />
            </div>
        );
    }
}
