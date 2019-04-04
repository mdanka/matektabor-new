import * as React from "react";
import { StoryBrowser } from "./storyBrowser";
import { StoryPanel } from "./storyPanel";

export interface IBarkochbaScreenProps {}

export class BarkochbaScreen extends React.Component<IBarkochbaScreenProps, {}> {
    public render() {
        return (
            <div className="barkochba-screen">
                <div className="barkochba-screen-browser">
                    <StoryBrowser />
                </div>
                <div className="barkochba-screen-panel">
                    <StoryPanel />
                </div>
            </div>
        );
    }
}
