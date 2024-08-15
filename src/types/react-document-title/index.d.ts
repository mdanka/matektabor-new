// Based on https://github.com/gaearon/react-document-title

declare module "react-document-title" {
    import * as React from "react";

    interface DocumentTitleProps {
        title: string;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    class DocumentTitle extends React.Component<DocumentTitleProps, any> {}

    export = DocumentTitle;
}
