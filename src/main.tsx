import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.scss";
import App from "./app";
import { createAppStore } from "./store";
import { BrowserRouter } from "react-router-dom";
import { registerSW } from "virtual:pwa-register"

const store = createAppStore();

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <App store={store} />
        </BrowserRouter>
    </StrictMode>,
)

registerSW({ immediate: true })
