import css from "./staticContent.module.scss";

interface IStaticContentProps {
    type: "terms of service" | "privacy policy";
}

export function StaticContent({ type }: IStaticContentProps) {
    const renderTermsOfService = () => (
        <div>
            <h1>Terms of Service ("Terms")</h1>
            <p>Last updated: April 03, 2019</p>
            <p>Azzal, hogy ezt a weblapot használod, nekünk adod a lelkedet.</p>
            <p>Örökre.</p>
            <p>De amúgy nem vállalunk semmiért se felelősséget.</p>
        </div>
    );

    const renderPrivacyPolicy = () => (
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

    return (
        <div className={css.staticContent}>
            {type === "terms of service" && renderTermsOfService()}
            {type === "privacy policy" && renderPrivacyPolicy()}
        </div>
    );
}