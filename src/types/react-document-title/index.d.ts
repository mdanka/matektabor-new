// Based on https://github.com/gaearon/react-document-title

declare module "react-document-title" {
    import * as React from "react";

    interface DocumentTitleProps {
        title: string;
    }

    class DocumentTitle extends React.Component<DocumentTitleProps, any> {}

    export = DocumentTitle;
}
