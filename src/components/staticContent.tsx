import * as React from "react";

export interface IStaticContentProps {
    type: "terms of service" | "privacy policy";
}

export class StaticContent extends React.Component<IStaticContentProps, {}> {
    public render() {
        const { type } = this.props;
        return (
            <div className="static-content">
                {type === "terms of service" ? this.renderTermsOfService() : null}
                {type === "privacy policy" ? this.renderPrivacyPolicy() : null}
            </div>
        );
    }

    private renderTermsOfService = () => {
        return (
            <div>
                <h1>Terms of Service ("Terms")</h1>

                <p>Last updated: April 03, 2019</p>

                <p>Azzal, hogy ezt a weblapot használod, nekünk adod a lelkedet.</p>

                <p>Örökre.</p>

                <p>De amúgy nem vállalunk semmiért se felelősséget.</p>
            </div>
        );
    };

    private renderPrivacyPolicy = () => {
        return (
            <div>
                <h1>Privacy Policy</h1>

                <p>Effective date: April 03, 2019</p>

                <p>Itt semmi sem privát.</p>

                <p>
                    Az adataidat közvetlenül Oroszországba küldjük, illetve automatikusan feltöltjük a WikiLeaksre.
                    Szegény Clinton is hogy pórul járt miután bejelentkezett ide!
                </p>
            </div>
        );
    };
}
